//  ts-node elevatorsaga.ts | pbcopy

type Elevator = {
  stop: () => void;
  currentFloor: () => number;
  goToFloor: (floorNum: number) => void;
  on: (key: string, f: (floorNum: number) => void) => void;
  destinationQueue: number[];
  getPressedFloors: () => number[];
  loadFactor: () => number;
  goingDownIndicator: (shouldBeOn: boolean) => void;
  goingUpIndicator: (shouldBeOn: boolean) => void;
};
type Floor = {
  floorNum: () => number;
  on: (key: string, f: () => void) => void;
};

type ElevatorData = {
  floorFloat: number;
  buttons: { floorNum: number; boarded: number; pressed: number }[];
  taskQueue: {
    direction: Direction;
    floorNum: number;
    reason: Direction;
  }[];
}[];
type FloorData = {
  direction: Direction;
  data: { [r in "need_floor" | "need_elevator"]?: number };
}[][];
type ElevatorRef = {
  elevatorNum: number;
  floors: { floorNum: number; direction: Direction }[];
};
type FloorRef = { floorNum: number };
type Direction = "none" | "up" | "down" | "both";

var now: number;

console.log(
  ([] as string[])
    .concat(["{"])
    .concat(
      Object.entries({
        init: function (elevators: Elevator[], floors: Floor[]) {
          // custom

          // should this elevator claim this floor,
          // potentially pivoting to head there first?
          function requestScore(
            elevatorRef: ElevatorRef,
            floorRef: FloorRef,
            shouldPivot: boolean
          ) {
            // return shouldPivot ? 0 : 1;
            // todo
            //   if (
            //     shouldPivot &&
            //     !(
            //       elevatorData[obj.elevatorNum].direction !==
            //       getDirection(floorObj.floorNum, obj.elevatorNum, false)
            //     )
            //   ) {
            //     return Number.NEGATIVE_INFINITY;
            //   }
            const currDist = Math.abs(
              elevatorData[elevatorRef.elevatorNum].floorFloat -
                floorRef.floorNum
            );
            const rval = [
              // penalize pivoting
              shouldPivot ? -1 : 0,

              // penalize load
              elevators[elevatorRef.elevatorNum].loadFactor() > 0.75
                ? Number.NEGATIVE_INFINITY
                : 0,
              elevators[elevatorRef.elevatorNum].loadFactor() > 0.4 ? -100 : 0,
              -1 * elevators[elevatorRef.elevatorNum].loadFactor(),

              // penalize if going the wrong way
              // elevatorData[obj.elevatorNum].direction &&
              // elevatorData[obj.elevatorNum].direction !== floorObj.direction
              //   ? Number.NEGATIVE_INFINITY
              //   : 0,

              // reward if we are already there
              currDist === 0 ? 1000 : 0,
              // penalize if far
              -20 * currDist,
            ].reduce((a, b) => a + b);
            console.log("floor", {
              elevatorNum: elevatorRef.elevatorNum,
              ef: elevatorData[elevatorRef.elevatorNum].floorFloat,
              floorNum: floorRef.floorNum,
              lf: elevators[elevatorRef.elevatorNum].loadFactor(),
              // eDirection: elevatorData[elevatorRef.elevatorNum].direction,
              // floorDirection: floorRef.direction,
              shouldPivot,
              rval,
            });
            return rval;
          }
          // given an elevator's queue, what order should it proceed?
          function getDirectionValue(
            segment: { floorNum: number; direction: Direction }[],
            elevatorRef: ElevatorRef
          ) {
            return [
              // penalize if far from current destination
              elevators[elevatorRef.elevatorNum].destinationQueue[0] !==
              undefined
                ? -Math.abs(
                    elevators[elevatorRef.elevatorNum].destinationQueue[0] -
                      segment[0].floorNum
                  )
                : 0,

              // reward if we are already there
              elevators[elevatorRef.elevatorNum].currentFloor() ===
              segment[0].floorNum
                ? 10
                : 0,
              // penalize if far
              -1 *
                Math.abs(
                  elevatorData[elevatorRef.elevatorNum].floorFloat -
                    segment[0].floorNum
                ),

              // reward if dropping off first
              elevatorData[elevatorRef.elevatorNum].buttons[segment[0].floorNum]
                ? 10
                : 0,

              0 *
                Math.min(
                  0,
                  ...segment
                    .map(
                      ({ floorNum }) =>
                        elevatorData[elevatorRef.elevatorNum].buttons[floorNum]
                          ?.boarded
                    )
                    .filter((n) => n)
                    .map((t) => now - t)
                ),
              0 *
                Math.min(
                  0,
                  ...segment
                    .map(
                      ({ floorNum }) =>
                        floorData[floorNum].find(
                          (d) =>
                            d.direction ===
                            elevatorData[elevatorRef.elevatorNum].taskQueue[0]
                              ?.direction
                        )?.data.need_elevator
                    )
                    .filter((n) => n)
                    .map((t) => now - t!)
                ),
            ];
          }
          // public
          const elevatorData: ElevatorData = elevators.map(() => ({
            floorFloat: 0,
            buttons: [],
            taskQueue: [],
          }));
          const floorData: FloorData = floors.map(() => [
            {
              direction: "up",
              data: {},
            },
            {
              direction: "down",
              data: {},
            },
          ]);
          function recompute(recomputeReason: string) {
            const elevatorRefs: ElevatorRef[] = elevators.map(
              (elevator, elevatorNum) => ({
                elevatorNum,
                floors: elevator
                  .getPressedFloors()
                  .map((floorNum) => ({ floorNum, direction: "none" })),
              })
            );
            // @ts-ignore
            window.x = {
              elevators,
              floors,
              elevatorData,
              floorData,
              elevatorRequests: elevatorRefs,
            };
            // @ts-ignore
            console.log("recompute", recomputeReason, window.x);
            floorData.flatMap((f, floorNum) =>
              f
                .filter(({ data }) => data.need_elevator !== undefined)
                .map((floorObj) => {
                  const bestRequest = elevatorRefs
                    .flatMap((elevatorRef) =>
                      [true, false].map((shouldPivot) => ({
                        elevatorRef,
                        shouldPivot,
                        score: requestScore(
                          elevatorRef,
                          { floorNum },
                          shouldPivot
                        ),
                      }))
                    )
                    .sort((a, b) => b.score - a.score)[0];
                  if (bestRequest?.score > Number.NEGATIVE_INFINITY) {
                    bestRequest.elevatorRef.floors.push({
                      floorNum,
                      direction: floorObj.direction,
                    });
                  }
                })
            );
            elevatorRefs
              .filter(({ floors }) => floors.length > 0)
              .map((obj) => {
                elevators[obj.elevatorNum].stop();
                obj.floors.sort((a, b) => a.floorNum - b.floorNum);
                const segments = {
                  up: obj.floors.filter(
                    ({ floorNum }) =>
                      floorNum > elevators[obj.elevatorNum].currentFloor()
                  ),
                  down: obj.floors
                    .filter(
                      ({ floorNum }) =>
                        floorNum < elevators[obj.elevatorNum].currentFloor()
                    )
                    .reverse(),
                  none: obj.floors.filter(
                    ({ floorNum }) =>
                      floorNum === elevators[obj.elevatorNum].currentFloor()
                  ),
                };
                const directionData = Object.values(segments)
                  .filter((segments) => segments.length > 0)
                  .map((segment) => ({
                    segment,
                    value: getDirectionValue(segment, obj),
                  }))
                  .map((dobj) => ({
                    ...dobj,
                    total: dobj.value.reduce((a, b) => a + b, 0),
                  }));
                console.log("elevator", {
                  elevatorNum: obj.elevatorNum,
                  c: elevatorData[obj.elevatorNum].floorFloat,
                  queue: elevators[obj.elevatorNum].destinationQueue,
                  directionData,
                });
                elevatorData[obj.elevatorNum].taskQueue = [];
                var prevFloor = -1;
                directionData
                  .sort((a, b) => b.total - a.total)
                  .flatMap(({ segment }) => segment)
                  .map(({ floorNum, direction }) => {
                    if (floorNum === prevFloor) {
                      // if (elevatorData[obj.elevatorNum].taskQueue[0] === "dropoff") {
                      //   elevatorData[obj.elevatorNum].taskQueue[0] = reason;
                      // } else if (elevatorData[obj.elevatorNum].lightsQueue[0] === "both") {
                      // } else if (elevatorData[obj.elevatorNum].lightsQueue[0] === "up") {
                      //   if (reason === "down") {
                      //     elevatorData[obj.elevatorNum].lightsQueue[0] = "both";
                      //   }
                      // } else if (elevatorData[obj.elevatorNum].lightsQueue[0] === "down") {
                      //   if (reason === "up") {
                      //     elevatorData[obj.elevatorNum].lightsQueue[0] = "both";
                      //   }
                      // }
                    } else {
                      prevFloor = floorNum;
                      elevators[obj.elevatorNum].goToFloor(floorNum);
                      // elevatorData[obj.elevatorNum].taskQueue.unshift(reason);
                    }
                  });
                // elevatorData[obj.elevatorNum].taskQueue.unshift("init");
                // setDirectionAndLights(obj.elevatorNum);
              });
          }
          // internal
          const initialSeed = Math.PI % 1;
          var seed = initialSeed;
          const randomSize = (1113 / 7) * 1000;
          const h = (args: number | undefined) => {
            const oldseed = seed;
            seed = (seed * randomSize) % 1;
            if (seed === oldseed) {
              seed = initialSeed;
            }
            if (args === undefined) return seed;
            return Math.floor(seed * (args + 1));
          };
          // @ts-ignore
          _.random = (args) => {
            return h(args);
          };
          console.clear();
          console.log("init");

          var alerting = true;
          // @ts-ignore
          window.alert = (obj: string | number) => {
            // @ts-ignore
            if (!alerting || !window.confirm(JSON.stringify(obj))) {
              alerting = false;
            }
            return obj;
          };
          now = 0;
          //
          function request(floorNum: number, direction: "up" | "down") {
            const data = floorData[floorNum].find(
              (d) => d.direction === direction
            )!.data;
            if (!data.need_elevator) {
              data.need_elevator = now;
            }
            recompute("request");
          }
          // function getDirection(destinationFloor, elevatorNum, shouldUpdate) {
          //   const lift = destinationFloor - elevators[elevatorNum].currentFloor();
          //   if (lift === 0 || !lift) {
          //     return;
          //   }
          //   const direction = lift > 0 ? "up" : "down";
          //   // if (shouldUpdate) elevatorData[elevatorNum].direction = direction;
          //   return direction;
          // }
          // function setDirectionAndLights(elevatorNum) {
          //   // const nextTask = elevatorData[elevatorNum].taskQueue[0];
          //   // elevatorData[elevatorNum].lightsQueue.shift();
          //   // if (nextTask === "both") {
          //   //   elevators[elevatorNum].goingDownIndicator(true);
          //   //   elevators[elevatorNum].goingUpIndicator(true);
          //   // } else if (nextTask === "up") {
          //   //   elevators[elevatorNum].goingDownIndicator(false);
          //   //   elevators[elevatorNum].goingUpIndicator(true);
          //   // } else if (nextTask === "down") {
          //   //   elevators[elevatorNum].goingDownIndicator(true);
          //   //   elevators[elevatorNum].goingUpIndicator(false);
          //   // } else if (!nextTask) {
          //   //   elevators[elevatorNum].goingDownIndicator(false);
          //   //   elevators[elevatorNum].goingUpIndicator(false);
          //   // } else if (
          //   //   elevators[elevatorNum].maxPassengerCount() * (1 - elevators[elevatorNum].loadFactor()) >
          //   //   3
          //   // ) {
          //   //   elevators[elevatorNum].goingDownIndicator(true);
          //   //   elevators[elevatorNum].goingUpIndicator(true);
          //   // } else {
          //   //   elevators[elevatorNum].goingDownIndicator(false);
          //   //   elevators[elevatorNum].goingUpIndicator(false);
          //   // }
          //   // getDirection(elevators[elevatorNum].destinationQueue[0], elevatorNum, true);
          // }
          function elevatorFloor(
            elevatorNum: number,
            floorNum: number,
            isStopping: boolean
          ) {
            // elevatorData[elevatorNum].floorFloat = floorNum;
            // if (isStopping) {
            //   (elevatorData[elevatorNum].lightsQueue[0] === "both"
            //     ? ["up", "down"]
            //     : [elevatorData[elevatorNum].lightsQueue[0]]
            //   ).map((direction) => {
            //     if (floorData[floorNum][direction]?.need_elevator) {
            //       delete elevatorData[elevatorNum].buttons[floorNum];
            //       floorData[floorNum][direction].need_floor =
            //         floorData[floorNum][direction].need_elevator;
            //       delete floorData[floorNum][direction].need_elevator;
            //     }
            //   });
            //   setDirectionAndLights(elevatorNum);
            //   if (elevatorData[elevatorNum].direction === "up") {
            //     elevatorData[elevatorNum].floorFloat += 0.25;
            //   } else if (elevatorData[elevatorNum].direction === "down") {
            //     elevatorData[elevatorNum].floorFloat -= 0.25;
            //   }
            //   recompute("stop");
            // }
          }
          const floorsPerElevator = (floors.length - 1) / elevators.length;
          elevators.map((elevator, elevatorNum) => {
            elevator.on("idle", () => {
              elevator.goToFloor(
                floors[
                  Math.floor((elevatorNum + 0.5) * floorsPerElevator)
                ].floorNum()
              );
              elevators[elevatorNum].goingDownIndicator(false);
              elevators[elevatorNum].goingUpIndicator(false);
            });

            elevator.on("floor_button_pressed", function (floorNum) {
              elevatorData[elevatorNum].buttons.push({
                floorNum,
                boarded: now,
                pressed: floorData[elevator.currentFloor()].find(
                  (d) =>
                    d.direction ===
                    (floorNum > elevator.currentFloor() ? "up" : "down")
                )!.data.need_floor!,
              });
              recompute("button");
              // if (elevator.currentFloor() === 2 && floorNum === 0) asdf;
            });

            elevator.on("stopped_at_floor", function (floorNum) {
              elevatorFloor(elevatorNum, floorNum, true);
            });

            elevator.on("passing_floor", function (floorNum) {
              elevatorFloor(elevatorNum, floorNum, false);
            });
          });

          floors.map((floor) => {
            floor.on("up_button_pressed", function () {
              request(floor.floorNum(), "up");
            });
            floor.on("down_button_pressed", function () {
              request(floor.floorNum(), "down");
            });
          });
        },
        update: function (dt: number, elevators: Elevator[], floors: Floor[]) {
          // @ts-ignore
          window.now += dt;
          // We normally don't need to do anything here
        },
      }).map(([k, f]) => `\t"${k}": ${f.toString()},`)
    )
    .concat(["}"])
    .join("\n")
);
