({
  init: function (elevators, floors) {
    // custom

    // should this elevator claim this floor,
    // potentially pivoting to head there first?
    function requestScore(obj, floorObj, shouldPivot) {
      return shouldPivot ? 0 : 1;
      // todo
      //   if (
      //     shouldPivot &&
      //     !(
      //       elevatorData[obj.e].direction !==
      //       getDirection(floorObj.floorNum, obj.e, false)
      //     )
      //   ) {
      //     return Number.NEGATIVE_INFINITY;
      //   }
      const currDist = Math.abs(
        elevatorData[obj.e].floorFloat - floorObj.floorNum
      );
      const rval = [
        // penalize pivoting
        shouldPivot ? -1 : 0,

        // penalize load
        elevators[obj.e].loadFactor() > 0.75 ? Number.NEGATIVE_INFINITY : 0,
        elevators[obj.e].loadFactor() > 0.4 ? -100 : 0,
        -1 * elevators[obj.e].loadFactor(),

        // penalize if going the wrong way
        // elevatorData[obj.e].direction &&
        // elevatorData[obj.e].direction !== floorObj.direction
        //   ? Number.NEGATIVE_INFINITY
        //   : 0,

        // reward if we are already there
        currDist === 0 ? 1000 : 0,
        // penalize if far
        -20 * currDist,
      ].reduce((a, b) => a + b);
      console.log("floor", {
        e: obj.e,
        ef: elevatorData[obj.e].floorFloat,
        floorNum: floorObj.floorNum,
        lf: elevators[obj.e].loadFactor(),
        eDirection: elevatorData[obj.e].direction,
        floorDirection: floorObj.direction,
        shouldPivot,
        rval,
      });
      return rval;
    }
    // given an elevator's queue, where should it go?
    function getDirectionValue(segment, obj) {
      return [];
      // todo
      return [
        // penalize if far from current destination
        elevators[obj.e].destinationQueue[0] !== undefined
          ? -Math.abs(elevators[obj.e].destinationQueue[0] - segment[0])
          : 0,

        // reward if we are already there
        elevators[obj.e].currentFloor() === segment[0] ? 10 : 0,
        // penalize if far
        -1 * Math.abs(elevatorData[obj.e].floorFloat - segment[0]),

        // reward if dropping off first
        elevatorData[obj.e].buttons[segment[0]] ? 10 : 0,

        0 *
          Math.min(
            0,
            ...segment
              .map((floorNum) => elevatorData[obj.e].buttons[floorNum]?.boarded)
              .filter((n) => n)
              .map((t) => now - t)
          ),
        0 *
          Math.min(
            0,
            ...segment
              .map(
                (floorNum) =>
                  floorData[floorNum][elevatorData[obj.e].direction]
                    ?.need_elevator
              )
              .filter((n) => n)
              .map((t) => now - t)
          ),
      ];
    }
    // public
    // {buttons: {[floorNum: number]: {boarded: number; pressed: number}}; direction?: "up" | "down"; lightsQueue: "both" | "up" | "down"[]}[]
    const elevatorData = elevators.map(() => ({
      buttons: {},
      floorFloat: 0,
      lightsQueue: [],
    }));
    // {up: {need_floor?: number; need_elevator?: number}, down: {}}[]
    const floorData = floors.map(() => ({ up: {}, down: {} }));
    function recompute() {
      // {e: number; floors: {floorNum: number, reason: "dropoff" | "up" | "down"}[]}[]
      const elevatorRequests = elevators.map((elevator, e) => ({
        e,
        floors: elevator
          .getPressedFloors()
          .map((floorNum) => ({ floorNum, reason: "dropoff" })),
      }));
      window.x = {
        elevators,
        floors,
        elevatorData,
        floorData,
        elevatorRequests,
      };
      console.log("recompute", x);
      floorData
        .flatMap((f, floorNum) =>
          Object.entries(f)
            .map(([direction, ff]) => ({ direction, ff }))
            .filter(({ ff }) => ff.need_elevator !== undefined)
            .map(({ direction, ff }) => ({ floorNum, direction, ff }))
        )
        .sort((a, b) => a.floorNum - b.floorNum)
        .map((floorObj) => {
          const bestRequest = elevatorRequests
            .flatMap((obj) =>
              [true, false].map((shouldPivot) => ({
                ...obj,
                shouldPivot,
                score: requestScore(obj, floorObj, shouldPivot),
              }))
            )
            .sort((a, b) => b.score - a.score)[0];
          if (bestRequest?.score > Number.NEGATIVE_INFINITY) {
            if (bestRequest.shouldPivot) {
              getDirection(floorObj.floorNum, bestRequest.e, true);
            }
            bestRequest.floors.push({
              floorNum: floorObj.floorNum,
              reason: floorObj.direction,
            });
          }
        });
      elevatorRequests
        .filter(({ floors }) => floors.length > 0)
        .map((obj) => {
          elevators[obj.e].stop();
          obj.floors.sort((a, b) => a.floorNum - b.floorNum);
          const segments = {
            up: obj.floors.filter(
              ({ floorNum }) => floorNum > elevators[obj.e].currentFloor()
            ),
            down: obj.floors
              .filter(
                ({ floorNum }) => floorNum < elevators[obj.e].currentFloor()
              )
              .reverse(),
            [undefined]: obj.floors.filter(
              ({ floorNum }) => floorNum === elevators[obj.e].currentFloor()
            ),
          };
          const directionData = Object.values(segments)
            .map((segment) => ({
              segment,
              value: getDirectionValue(segment, obj),
            }))
            .map((dobj) => ({
              ...dobj,
              total: dobj.value.reduce((a, b) => a + b, 0),
            }));
          console.log("elevator", {
            e: obj.e,
            c: elevatorData[obj.e].floorFloat,
            queue: elevators[obj.e].destinationQueue,
            directionData,
          });
          elevatorData[obj.e].lightsQueue = [];
          directionData
            .sort((a, b) => b.total - a.total)
            .flatMap(({ segment }) => segment)
            .map(({ floorNum, reason }) => {
              elevatorData[obj.e].lightsQueue.push(reason);
              elevators[obj.e].goToFloor(floorNum);
            });
          setDirectionAndLights(obj.e);
        });
    }
    // internal
    const initialSeed = Math.PI % 1;
    window.seed = initialSeed;
    const randomSize = (13 / 7) * 1000;
    if (!window.originalRandom) window.originalRandom = _.random;
    const h = (args) => {
      const oldseed = seed;
      seed = (seed * randomSize) % 1;
      if (seed === oldseed) {
        seed = initialSeed;
      }
      if (args === undefined) return seed;
      return Math.floor(seed * (args + 1));
    };
    _.random = (args) => {
      return h(args);
    };
    console.clear();
    console.log("init");
    var alerting = true;
    window.alert = (obj) => {
      if (!alerting || !confirm(JSON.stringify(obj))) {
        alerting = false;
      }
      return obj;
    };
    window.now = 0;
    //
    function request(floor, direction) {
      const floorNum = floor.floorNum();
      if (!floorData[floorNum][direction].need_elevator) {
        floorData[floorNum][direction].need_elevator = now;
      }
      recompute();
    }
    function getDirection(destinationFloor, e, shouldUpdate) {
      const lift = destinationFloor - elevators[e].currentFloor();
      if (lift === 0 || !lift) {
        return;
      }
      const direction = lift > 0 ? "up" : "down";
      if (shouldUpdate) elevatorData[e].direction = direction;
      return direction;
    }
    function setDirectionAndLights(e) {
      const nextTask = elevatorData[e].lightsQueue.shift();
      if (nextTask === "both") {
        elevators[e].goingDownIndicator(true);
        elevators[e].goingUpIndicator(true);
      } else if (nextTask === "up") {
        elevators[e].goingDownIndicator(false);
        elevators[e].goingUpIndicator(true);
      } else if (nextTask === "down") {
        elevators[e].goingDownIndicator(true);
        elevators[e].goingUpIndicator(false);
      } else if (
        elevators[e].maxPassengerCount() * (1 - elevators[e].loadFactor()) >
        3
      ) {
        elevators[e].goingDownIndicator(true);
        elevators[e].goingUpIndicator(true);
      } else {
        elevators[e].goingDownIndicator(false);
        elevators[e].goingUpIndicator(false);
      }
      getDirection(elevators[e].destinationQueue[0], e, true);
    }
    function elevatorFloor(e, floorNum, isStopping) {
      elevatorData[e].floorFloat = floorNum;
      if (isStopping) {
        setDirectionAndLights(e);
        if (floorData[floorNum][elevatorData[e].direction]?.need_elevator) {
          delete elevatorData[e].buttons[floorNum];
          floorData[floorNum][elevatorData[e].direction].need_floor =
            floorData[floorNum][elevatorData[e].direction].need_elevator;
          delete floorData[floorNum][elevatorData[e].direction].need_elevator;
        }

        if (elevatorData[e].direction === "up") {
          elevatorData[e].floorFloat += 0.25;
        } else if (elevatorData[e].direction === "down") {
          elevatorData[e].floorFloat -= 0.25;
        }
        recompute();
      }
    }
    const floorsPerElevator = (floors.length - 1) / elevators.length;
    elevators.map((elevator, e) => {
      elevator.on("idle", () => {
        elevator.goToFloor(
          floors[Math.floor((e + 0.5) * floorsPerElevator)].floorNum()
        );
        delete elevatorData[e].direction;
        elevators[e].goingDownIndicator(false);
        elevators[e].goingUpIndicator(false);
      });

      elevator.on("floor_button_pressed", function (floorNum) {
        elevatorData[e].buttons[floorNum] = {
          boarded: now,
          requested:
            floorData[elevator.currentFloor()][
              floorNum > elevator.currentFloor() ? "up" : "down"
            ].need_floor,
        };
        recompute();
      });

      elevator.on("stopped_at_floor", function (floorNum) {
        elevatorFloor(e, floorNum, true);
      });

      elevator.on("passing_floor", function (floorNum) {
        elevatorFloor(e, floorNum, false);
      });
    });

    floors.map((floor) => {
      floor.on("up_button_pressed", function () {
        request(floor, "up");
      });
      floor.on("down_button_pressed", function () {
        request(floor, "down");
      });
    });
  },
  update: function (dt, elevators, floors) {
    window.now += dt;
    // We normally don't need to do anything here
  },
});
