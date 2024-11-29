({
  init: function (elevators, floors) {
    console.log("init");
    var alerting = true;
    const requests = {};
    function requestScore(obj, floorObj) {
      return [
        obj.elevator.loadFactor() > 0.9 ? -100 : 0,
        obj.elevator.loadFactor() > 0.6 ? -50 : 0,
        -10 * obj.elevator.loadFactor(),

        obj.floorNums.includes(floorObj.floorNum) ? 50 : 0,
        -10 * Math.abs(obj.elevator.currentFloor() - floorObj.floorNum),
      ].reduce((a, b) => a + b);
    }
    function getDestinations(obj) {
      //   obj.floorNums = obj.floorNums.filter(
      //     (floorNum) =>
      //       obj.elevator.getPressedFloors().includes(floorNum) ||
      //       obj.elevator.maxPassengerCount() * (1 - obj.elevator.loadFactor()) >=
      //         3
      //   );
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
          -10 * Math.abs(obj.elevator.currentFloor() - segment[0]),
          obj.elevator
            .getPressedFloors()
            .filter((floorNum) => segment.includes(floorNum)).length,
        ].reduce((a, b) => a + b)
      );
      if (directionScores[1] > directionScores[0]) {
        segments.reverse();
      }
      if (
        obj.e === -1 &&
        obj.elevator.loadFactor() > 0.6 &&
        (!alerting ||
          !confirm(
            JSON.stringify({
              e: obj.e,
              c: obj.elevator.currentFloor(),
              segments,
              directionScores,
              requests: Object.values(requests).map((obj) => obj.floorNum),
            })
          ))
      ) {
        alerting = false;
      }
      return segments.flatMap((segment) => segment);
    }
    function recompute() {
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
        .map((floorObj) => {
          elevatorRequests
            .map((obj) => ({
              ...obj,
              score: requestScore(obj, floorObj),
            }))
            .sort((a, b) => b.score - a.score)[0]
            .floorNums.push(floorObj.floorNum);
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
      requests[Math.random()] = { floorNum: floor.floorNum(), direction };
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
    elevators.map((elevator, e) => {
      elevator.on("idle", () =>
        elevator.goToFloor(
          floors[Math.floor((e + 0.5) * floorsPerElevator)].floorNum()
        )
      );

      elevator.on("floor_button_pressed", function (floorNum) {
        if (!elevator.destinationQueue.includes(floorNum)) recompute();
      });

      elevator.on("stopped_at_floor", function (floorNum) {
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
    // We normally don't need to do anything here
  },
});
