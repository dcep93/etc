({
  init: function (elevators, floors) {
    console.clear();
    console.log("init");
    window.now = 0;
    const requests = {};
    const requestFloors = Object.fromEntries(
      floors.map((floor) => [floor.floorNum(), {}])
    );
    function requestScore(obj, floorObj) {
      const route = obj.floorNums.concat(obj.elevator.currentFloor());
      const detour = Math.min(
        ...route
          .map((floorNum) => Math.abs(floorNum - floorObj.floorNum))
          .concat(
            Math.max(route) >= floorObj.floorNum &&
              Math.min(route) <= floorObj.floorNum
              ? 0
              : Number.POSITIVE_INFINITY
          )
      );
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
        -10 * detour,
      ].reduce((a, b) => a + b);
      console.log("requestScore", {
        e: obj.e,
        ef: obj.elevator.currentFloor(),
        detour,
        xlf: obj.elevator.loadFactor(),
        floorNum: floorObj.floorNum,
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
      const directionScores = segments.map((segment) =>
        [
          obj.elevator.currentFloor() === segment[0] ? 10 : 0,
          -1 * Math.abs(obj.elevator.currentFloor() - segment[0]),
          1 *
            Math.min(
              ...segment
                .map((floorNum) => elevatorButtons[obj.e][floorNum])
                .filter((n) => n)
                .concat(now)
                .map((t) => now - t)
            ),
          1 *
            Math.min(
              ...segment
                .map((floorNum) => requestFloors[floorNum].need_elevator)
                .filter((n) => n)
                .concat(now)
                .map((t) => now - t)
            ),
        ].reduce((a, b) => a + b)
      );
      if (segments[0].length * segments[1].length > 0) {
        console.log(
          now,
          JSON.stringify(segments),
          directionScores,
          obj.e,
          obj.elevator.currentFloor(),
          segments.map((segment) => [
            obj.elevator.currentFloor() === segment[0] ? 10 : 0,
            -1 * Math.abs(obj.elevator.currentFloor() - segment[0]),
            1 *
              Math.min(
                ...segment
                  .map((floorNum) => elevatorButtons[obj.e][floorNum])
                  .filter((n) => n)
                  .concat(now)
                  .map((t) => now - t)
              ),
            1 *
              Math.min(
                ...segment
                  .map((floorNum) => requestFloors[floorNum].need_elevator)
                  .filter((n) => n)
                  .concat(now)
                  .map((t) => now - t)
              ),
          ])
        );
        if (!confirm("x")) asdf;
      }
      if (directionScores[1] > directionScores[0]) {
        segments.reverse();
      }
      if (true) {
        console.log("getDestinations", {
          e: obj.e,
          c: obj.elevator.currentFloor(),
          segments,
          directionScores,
          requests: Object.values(requests).map((obj) => obj.floorNum),
        });
      }
      return segments.flatMap((segment) => segment);
    }
    function recompute() {
      console.log("recompute", {
        requestFloors: Object.fromEntries(
          Object.entries(requestFloors).map(([f, o]) => [
            f,
            Object.fromEntries(Object.entries(o).map(([k, v]) => [k, now - v])),
          ])
        ),
        elevatorButtons: Object.fromEntries(
          Object.entries(elevatorButtons).map(([f, o]) => [
            f,
            Object.fromEntries(Object.entries(o).map(([k, v]) => [k, now - v])),
          ])
        ),
      });
      const elevatorRequests = elevators.map((elevator, e) => ({
        e,
        elevator,
        floorNums: elevator.getPressedFloors(),
      }));
      Array.from(new Set(Object.values(requests)))
        .map((obj) => ({
          ...obj,
          est: obj.floorNum + obj.direction === "up" ? 0.5 : -0.5,
        }))
        .sort((a, b) => a.est - b.est)
        .map((floorObj) => ({
          floorNum: floorObj.floorNum,
          elevatorFloors: elevatorRequests
            .map((obj) => ({
              ...obj,
              score: requestScore(obj, floorObj),
            }))
            .sort((a, b) => b.score - a.score)[0].floorNums,
        }))
        .filter(
          ({ floorNum, elevatorFloors }) => !elevatorFloors.includes(floorNum)
        )
        .map(({ floorNum, elevatorFloors }) => {
          elevatorFloors.push(floorNum);
        });
      elevatorRequests
        .filter(({ floorNums }) => floorNums.length > 0)
        .map((obj) => {
          obj.elevator.stop();
          getDestinations(obj).map((floorNum) =>
            obj.elevator.goToFloor(floorNum)
          );
        });
    }
    //
    function request(floor, direction) {
      const floorNum = floor.floorNum();
      if (!requestFloors[floorNum].need_elevator) {
        requestFloors[floorNum].need_elevator = now;
      }
      requests[Math.random()] = { floorNum, direction };
      recompute();
    }
    function elevatorFloor(elevator, floorNum, isStopping) {
      if (isStopping) {
        Object.entries(requests)
          .map(([key, obj]) => ({ key, obj }))
          .filter(({ obj }) => obj.floorNum === floorNum)
          .map(({ key }) => {
            delete requests[key];
          });
        recompute();
      }
      if (elevator.destinationDirection() === "up") {
        elevator.goingDownIndicator(false);
        elevator.goingUpIndicator(true);
      } else if (elevator.destinationDirection() === "down") {
        elevator.goingDownIndicator(true);
        elevator.goingUpIndicator(false);
      } else {
        elevator.goingDownIndicator(true);
        elevator.goingUpIndicator(true);
      }
    }
    const floorsPerElevator = (floors.length - 1) / elevators.length;
    const elevatorButtons = elevators.map(() => ({}));
    elevators.map((elevator, e) => {
      elevator.on("idle", () =>
        elevator.goToFloor(
          floors[Math.floor((e + 0.5) * floorsPerElevator)].floorNum()
        )
      );

      elevator.on("floor_button_pressed", function (floorNum) {
        elevatorButtons[e][floorNum] =
          requestFloors[elevator.currentFloor()].need_floor;
        recompute();
      });

      elevator.on("stopped_at_floor", function (floorNum) {
        delete elevatorButtons[e][floorNum];
        requestFloors[floorNum].need_floor =
          requestFloors[floorNum].need_elevator;
        elevatorFloor(elevator, floorNum, true);
      });

      elevator.on("passing_floor", function (floorNum) {
        elevatorFloor(elevator, floorNum, false);
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
