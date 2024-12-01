({
  init: function (elevators, floors) {
    // should this elevator claim this floor,
    // potentially pivoting to head there first?
    function requestScore(obj, floorObj, shouldPivot) {
      if (
        shouldPivot &&
        !(
          elevatorData[obj.e].direction !==
          getDirection(floorObj.floorNum, obj.e, false)
        )
      ) {
        return Number.NEGATIVE_INFINITY;
      }
      const currDist = Math.abs(
        elevators[obj.e].currentFloor() - floorObj.floorNum
      );
      const rval = [
        // penalize pivoting
        shouldPivot ? -1 : 0,

        // penalize load
        elevators[obj.e].loadFactor() > 0.75 ? Number.NEGATIVE_INFINITY : 0,
        elevators[obj.e].loadFactor() > 0.4 ? -100 : 0,
        -1 * elevators[obj.e].loadFactor(),

        // penalize if going the wrong way
        elevatorData[obj.e].direction &&
        elevatorData[obj.e].direction !== floorObj.direction
          ? Number.NEGATIVE_INFINITY
          : 0,

        // reward if we are already there
        currDist === 0 ? 1000 : 0,
        // penalize if far
        -20 * currDist,
      ].reduce((a, b) => a + b);
      console.log("floor", {
        e: obj.e,
        ef: elevators[obj.e].currentFloor(),
        floorNum: floorObj.floorNum,
        lf: elevators[obj.e].loadFactor(),
        eDirection: obj.direction,
        floorDirection: floorObj.direction,
        edir: elevators[obj.e].direction,
        rval,
      });
      return rval;
    }
    // given an elevator's queue, where should it go?
    function getDirectionValue(segment, obj) {
      return [
        // reward if we are already there
        elevators[obj.e].currentFloor() === segment[0] ? 10 : 0,
        // penalize if far
        -1 * Math.abs(elevators[obj.e].currentFloor() - segment[0]),

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
    // {buttons: {[floorNum: number]: {boarded: number; pressed: number}}; direction?: "up" | "down"}[]
    const elevatorData = elevators.map(() => ({ buttons: {} }));
    // {up: {need_floor?: number; need_elevator?: number}, down: {}}[]
    const floorData = floors.map(() => ({ up: {}, down: {} }));
    function recompute() {
      // {e: number; floorNums: number[]}[]
      const elevatorRequests = elevators.map((elevator, e) => ({
        e,
        floorNums: elevator.getPressedFloors(),
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
          if (
            bestRequest.score > Number.NEGATIVE_INFINITY &&
            bestRequest?.floorNums &&
            !bestRequest.floorNums.includes(floorObj.floorNum)
          ) {
            if (bestRequest.shouldPivot) {
              getDirection(floorObj.floorNum, bestRequest.e, true);
            }
            bestRequest.floorNums.push(floorObj.floorNum);
          }
        });
      (function a() {
        elevatorRequests
          .filter(({ floorNums }) => floorNums.length > 0)
          .map((obj) => {
            elevators[obj.e].stop();
            obj.floorNums.sort((a, b) => a - b);
            const segments = {
              up: obj.floorNums.filter(
                (floorNum) => floorNum > elevators[obj.e].currentFloor()
              ),
              down: obj.floorNums
                .filter(
                  (floorNum) => floorNum < elevators[obj.e].currentFloor()
                )
                .reverse(),
              [undefined]: obj.floorNums.filter(
                (floorNum) => floorNum === elevators[obj.e].currentFloor()
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
              c: elevators[obj.e].currentFloor(),
              queue: elevators[obj.e].destinationQueue,
              directionData,
            });
            setDirectionAndLights(obj.e);
          });
      })();
    }
    // internal
    const initialSeed = Math.PI % 1;
    window.seed = initialSeed;
    const randomSize = (1113 / 7) * 1000;
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
      if (lift === 0) {
        return;
      }
      const direction = lift > 0 ? "up" : "down";
      if (shouldUpdate) elevatorData[e].direction = direction;
      return direction;
    }
    function setDirectionAndLights(e) {
      if (
        elevators[e].maxPassengerCount() * (1 - elevators[e].loadFactor) >
        3
      ) {
        elevators[e].goingDownIndicator(true);
        elevators[e].goingUpIndicator(true);
      }
      const isUp = getDirection(elevators[e].destinationQueue[0], e, true);
      if (isUp === undefined) {
        return;
      }
      elevators[e].goingUpIndicator(isUp);
      elevators[e].goingDownIndicator(!isUp);
    }
    function elevatorFloor(e, floorNum, isStopping) {
      if (isStopping) {
        if (floorData[floorNum][elevatorData[e].direction]?.need_elevator) {
          delete elevatorData[e].buttons[floorNum];
          floorData[floorNum][elevatorData[e].direction].need_floor =
            floorData[floorNum][elevatorData[e].direction].need_elevator;
          delete floorData[floorNum][elevatorData[e].direction].need_elevator;
        }
        setDirectionAndLights(e);
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
