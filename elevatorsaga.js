({
  init: function (elevators, floors) {
    // should this elevator go to this floor with this direction marker?
    function requestScore(obj, floorObj) {
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
    //
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
    // public
    // {buttons: {[floorNum: number]: {boarded: number; pressed: number}}; direction?: "up" | "down"}[]
    const elevatorData = elevators.map(() => ({ buttons: {} }));
    // {up: {need_floor?: number; need_elevator?: number}, down: {}}[]
    const floorData = floors.map(() => ({ up: {}, down: {} }));
    function recompute() {
      // {e: number; direction: "up" | "down"; floorNums: number[]}[]
      const elevatorRequests = elevators.map((elevator, e) => ({
        e,
        direction: elevatorData[e].direction,
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
        .map((floorObj) => ({
          floorNum: floorObj.floorNum,
          elevatorFloors: elevatorRequests
            .map((obj) => ({
              ...obj,
              score: requestScore(obj, floorObj),
            }))
            .sort((a, b) => b.score.value - a.score.value)[0]?.floorNums,
        }))
        .map(({ floorNum, elevatorFloors }) => {
          elevatorFloors &&
            !elevatorFloors.includes(floorNum) &&
            elevatorFloors.push(floorNum);
        });
      elevatorRequests
        .filter(({ floorNums }) => floorNums.length > 0)
        .map((obj) => {
          obj.elevator.stop();

          obj.floorNums.sort((a, b) => a - b);
          const segments = [
            obj.floorNums
              .filter((floorNum) => floorNum < obj.elevator.currentFloor())
              .reverse(),
            obj.floorNums.filter(
              (floorNum) => floorNum >= obj.elevator.currentFloor()
            ),
          ];
          const directionData = segments.map((segment) =>
            getDirectionValue(segment, obj)
          );
          const directionScores = directionData.map((d) =>
            d.reduce((a, b) => a + b)
          );
          if (directionScores[1] > directionScores[0]) {
            segments.reverse();
          }
          console.log("elevator", {
            e: obj.e,
            c: obj.elevator.currentFloor(),
            segments,
            directionScores,
            directionData,
          });
          segments
            .flatMap((segment) => segment)
            .map((floorNum) => obj.elevator.goToFloor(floorNum));
          assignDirection(obj.e);
        });
    }
    function request(floor, direction) {
      const floorNum = floor.floorNum();
      if (!floorData[floorNum][direction].need_elevator) {
        floorData[floorNum][direction].need_elevator = now;
      }
      recompute();
    }
    function assignDirection(e) {
      // todo
      const destinationQueue = elevators[e].destinationQueue.filter(
        (f) => f !== elevators[e].currentFloor()
      );
      elevatorData[e].direction =
        destinationQueue.length === 0
          ? ["up", "down"].find(
              (direction) =>
                floorData[elevators[e].currentFloor()][direction]
                  .need_elevator !== undefined
            )
          : destinationQueue[0] > elevators[e].currentFloor()
          ? "up"
          : "down";

      if (elevatorData[e].direction !== undefined) {
        const isUp = elevatorData[e].direction === "up";
        elevators[e].goingDownIndicator(!isUp);
        elevators[e].goingUpIndicator(isUp);
      }
    }
    function elevatorFloor(e, floorNum, isStopping) {
      if (isStopping) {
        recompute();
        if (floorNum === 0 && elevatorData[e].direction === "down") asdf;
        if (floorData[floorNum][elevatorData[e].direction]?.need_elevator) {
          delete elevatorData[e].buttons[floorNum];
          floorData[floorNum][elevatorData[e].direction].need_floor =
            floorData[floorNum][elevatorData[e].direction].need_elevator;
          delete floorData[floorNum][elevatorData[e].direction].need_elevator;
        }
      }
    }
    const floorsPerElevator = (floors.length - 1) / elevators.length;
    elevators.map((elevator, e) => {
      elevator.on("idle", () => {
        elevator.goToFloor(
          floors[Math.floor((e + 0.5) * floorsPerElevator)].floorNum()
        );
        delete elevatorData[e].direction;
        elevator.goingDownIndicator(false);
        elevator.goingUpIndicator(false);
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
