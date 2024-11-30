({
  init: function (elevators, floors) {
    function requestScore(obj, floorObj) {
      const currDist = Math.abs(
        obj.elevator.currentFloor() - floorObj.floorNum
      );
      const rval = [
        obj.elevator.loadFactor() > 0.9 ? -10000 : 0,
        obj.elevator.loadFactor() > 0.6 ? -100 : 0,
        obj.elevator.loadFactor() > 0.1 ? -50 : 0,
        -10 * obj.elevator.loadFactor(),

        currDist === 0 ? 100 : 0,
        -20 * currDist,
        // todo floorObj.direction
      ].reduce((a, b) => a + b);
      console.log("requestScore", {
        e: obj.e,
        ef: obj.elevator.currentFloor(),
        floorNum: floorObj.floorNum,
        lf: obj.elevator.loadFactor(),
        rval,
      });
      return rval;
    }
    function getDestinations(obj) {
      obj.floorNums.sort((a, b) => a - b);
      const segments = [
        obj.floorNums
          .filter((floorNum) => floorNum < obj.elevator.currentFloor())
          .reverse(),
        obj.floorNums.filter(
          (floorNum) => floorNum >= obj.elevator.currentFloor()
        ),
      ];
      const directionData = segments.map((segment) => [
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
                (floorNum) => floorData[floorNum][elevatorData[obj.e].direction]
              )
              .filter((n) => n)
              .map((t) => now - t)
          ),
      ]);
      const directionScores = directionData.map((d) =>
        d.reduce((a, b) => a + b)
      );
      if (directionScores[1] > directionScores[0]) {
        segments.reverse();
      }
      console.log("getDestinations", {
        e: obj.e,
        c: obj.elevator.currentFloor(),
        segments,
        directionScores,
        directionData,
      });
      return segments.flatMap((segment) => segment);
    }
    //
    window.scrollTo(0, 0);
    console.clear();
    console.log("init");
    window.now = 0;
    const elevatorData = elevators.map(() => ({ buttons: {} }));
    const floorData = floors.map(() => ({}));
    function recompute() {
      console.log("recompute", { elevatorData, floorData });
      const elevatorRequests = elevators.map((elevator, e) => ({
        e,
        elevator,
        floorNums: elevator.getPressedFloors(),
      }));
      floorData
        .flatMap((f, floorNum) =>
          Object.entries(f)
            .map(([direction, ff]) => ({ direction, ff }))
            .map(({ direction, ff }) => ({ floorNum, direction, ff }))
        )
        .sort((a, b) => a.floorNum - b.floorNum)
        .map((floorObj) => ({
          floorNum: floorObj.floorNum,
          elevatorFloors: elevatorRequests
            .filter(
              (obj) =>
                !elevatorData[obj.e].direction ||
                elevatorData[obj.e].direction === floorObj.direction
            )
            .map((obj) => ({
              ...obj,
              score: requestScore(obj, floorObj),
            }))
            .sort((a, b) => b.score - a.score)[0]?.floorNums,
        }))
        .filter(
          ({ floorNum, elevatorFloors }) =>
            elevatorFloors && !elevatorFloors.includes(floorNum)
        )
        .map(({ floorNum, elevatorFloors }) => {
          elevatorFloors.push(floorNum);
        });
      elevatorRequests
        .filter(({ floorNums }) => floorNums.length > 0)
        .map((obj) => {
          obj.elevator.stop();
          const destinations = getDestinations(obj);
          const isUp =
            destinations
              .map((d) => d - obj.elevator.currentFloor())
              .find((d) => d !== 0) >= 0;
          elevatorData[obj.e].direction = isUp ? "up" : "down";
          obj.elevator.goingDownIndicator(!isUp);
          obj.elevator.goingUpIndicator(isUp);
          destinations.map((floorNum) => obj.elevator.goToFloor(floorNum));
        });
    }
    function request(floor, direction) {
      const floorNum = floor.floorNum();
      if (!floorData[floorNum][direction]) {
        floorData[floorNum][direction] = now;
      }
      recompute();
    }
    function elevatorFloor(e, floorNum, isStopping) {
      if (isStopping) {
        if (floorData[floorNum][elevatorData[e].direction]) {
          delete elevatorData[e].buttons[floorNum];
          floorData[floorNum].need_floor =
            floorData[floorNum][elevatorData[e].direction];
          delete floorData[floorNum][elevatorData[e].direction];
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
        elevator.goingDownIndicator(false);
        elevator.goingUpIndicator(false);
      });

      elevator.on("floor_button_pressed", function (floorNum) {
        elevatorData[e].buttons[floorNum] = {
          boarded: now,
          requested:
            floorData[elevator.currentFloor()][elevatorData[e].direction],
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
