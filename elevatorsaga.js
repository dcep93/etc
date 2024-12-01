({
  init: function (elevators, floors) {
    // should this elevator claim this floor,
    // potentially pivoting to head there first?
    function requestScore(obj, floorObj, shouldPivot) {
      const currDist = Math.abs(
        obj.elevator.currentFloor() - floorObj.floorNum
      );

      // todo

      //   .filter((obj) => obj.elevator.loadFactor() < 0.7)
      //   .filter(
      //     (obj) =>
      //       !elevatorData[obj.e].direction ||
      //       elevatorData[obj.e].direction === floorObj.direction
      //   )
      const rval = [
        obj.elevator.loadFactor() > 0.9 ? -1000 : 0,
        obj.elevator.loadFactor() > 0.6 ? -100 : 0,
        obj.elevator.loadFactor() > 0.1 ? -50 : 0,
        -10 * obj.elevator.loadFactor(),

        obj.direction === floorObj.direction ? 100 : 0,

        currDist === 0 ? 100 : 0,
        -20 * currDist,
      ].reduce((a, b) => a + b);
      console.log("floor", {
        e: obj.e,
        ef: obj.elevator.currentFloor(),
        floorNum: floorObj.floorNum,
        lf: obj.elevator.loadFactor(),
        eDirection: obj.direction,
        floorDirection: floorObj.direction,
        edir: elevatorData[obj.e].direction,
        rval,
      });
      return rval;
    }
    // given an elevator's queue, where should it go?
    function getDirectionValue(segment, obj) {
      return [
        obj.elevator.currentFloor() === segment[0] ? 10 : 0,
        -1 * Math.abs(obj.elevator.currentFloor() - segment[0]),
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
          const bestRequest = elevatorRequests.flatMap(
            (obj) =>
              [true, false]
                .map((shouldPivot) => ({
                  ...obj,
                  shouldPivot,
                  score: requestScore(obj, floorObj, shouldPivot),
                }))
                .sort((a, b) => b.score.value - a.score.value)[0]
          );
          if (
            bestRequest?.floorNums &&
            !bestRequest.floorNums.includes(floorNum)
          ) {
            if (bestRequest.shouldPivot) {
              setDirection(floorObj.floorNum);
            }
            bestRequest.floorNums.push(floorNum);
          }
          bestRequest?.floorNums &&
            !bestRequest.floorNums.includes(floorNum) &&
            bestRequest.floorNums.push(floorNum);
        });
      elevatorRequests
        .filter(({ floorNums }) => floorNums.length > 0)
        .map((obj) => {
          obj.elevator.stop();
          obj.floorNums.sort((a, b) => a - b);
          const segments = {
            up: obj.floorNums.filter(
              (floorNum) => floorNum > obj.elevator.currentFloor()
            ),
            down: obj.floorNums
              .filter((floorNum) => floorNum < obj.elevator.currentFloor())
              .reverse(),
            [undefined]: obj.floorNums.filter(
              (floorNum) => floorNum === obj.elevator.currentFloor()
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
          directionData
            .sort((a, b) => b.total - a.total)
            .flatMap((segment) => segment)
            .map((floorNum) => obj.elevator.goToFloor(floorNum));
          console.log("elevator", {
            e: obj.e,
            c: obj.elevator.currentFloor(),
            queue: obj.elevator.destinationQueue,
            directionScores,
            directionData,
          });
          setDirectionAndLights(obj.e);
        });
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
    function setDirection(destinationFloor, e) {
      const lift = destinationFloor - elevators[e].currentFloor();
      if (lift === 0) {
        return;
      }
      const isUp = lift > 0;
      elevatorData[e].direction = isUp ? "up" : "down";
      return isUp;
    }
    function setDirectionAndLights(e) {
      if (
        elevators[e].maxPassengerCount() * (1 - elevators[e].loadFactor) >
        3
      ) {
        elevators[e].goingDownIndicator(true);
        elevators[e].goingUpIndicator(true);
      }
      const isUp = setDirection(elevators[e].destinationQueue[0]);
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
        // todo try it out
        elevators[e].goingDownIndicator(false);
        elevators[e].goingUpIndicator(false);
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
