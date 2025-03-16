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
  buttons: {
    [floorNum: number]: { floorNum: number; boarded: number; pressed: number };
  };
  taskQueue: FloorRef[];
  forced?: boolean;
  lastRef?: FloorRef;
}[];
type ElevatorRef = {
  elevatorNum: number;
  proposedTaskQueue: FloorRef[];
};
type FloorData = {
  [direction: string]: {
    direction: Direction;
    data: { [r in "need_floor" | "need_elevator"]?: number };
  };
}[];
type FloorRef = {
  floorNum: number;
  direction: Direction;
  reason: Direction;
};
type Direction = "none" | "up" | "down" | "both";

var now: number;
var original_random: any;

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
            const currDist = Math.abs(
              elevatorData[elevatorRef.elevatorNum].floorFloat -
                floorRef.floorNum
            );
            const canPivot =
              currDist > 0 &&
              elevatorRef.proposedTaskQueue[0]?.direction &&
              elevatorRef.proposedTaskQueue[0].direction !==
                (elevatorData[elevatorRef.elevatorNum].floorFloat >
                floorRef.floorNum
                  ? "down"
                  : "up");
            const parts = [
              shouldPivot && !canPivot ? Number.NEGATIVE_INFINITY : 0,

              // penalize pivoting
              shouldPivot ? -1 : 0,

              // penalize load
              elevators[elevatorRef.elevatorNum].loadFactor() > 0.75
                ? Number.NEGATIVE_INFINITY
                : 0,
              elevators[elevatorRef.elevatorNum].loadFactor() > 0.4 ? -100 : 0,
              -1 * elevators[elevatorRef.elevatorNum].loadFactor(),

              // penalize if going the wrong way
              canPivot ? -100 : 0,

              // reward if we are already there
              currDist === 0 ? 1000 : 0,
              // penalize if far
              -20 * currDist,
            ];
            const rval = parts.reduce((a, b) => a + b);
            console.log("floor", {
              rval,
              shouldPivot,
              elevatorNum: elevatorRef.elevatorNum,
              ef: elevatorData[elevatorRef.elevatorNum].floorFloat,
              floorNum: floorRef.floorNum,
              lf: elevators[elevatorRef.elevatorNum].loadFactor(),
              parts,
              // eDirection: elevatorData[elevatorRef.elevatorNum].direction,
              // floorDirection: floorRef.direction,
            });
            return rval;
          }
          // given an elevator's queue, what order should it proceed?
          function getDirectionValue(proposedElevatorRef: ElevatorRef) {
            return [
              // penalize if far from current destination
              elevators[proposedElevatorRef.elevatorNum].destinationQueue[0] !==
              undefined
                ? -Math.abs(
                    elevators[proposedElevatorRef.elevatorNum]
                      .destinationQueue[0] -
                      proposedElevatorRef.proposedTaskQueue[0].floorNum
                  )
                : 0,

              // reward if we are already there
              elevators[proposedElevatorRef.elevatorNum].currentFloor() ===
              proposedElevatorRef.proposedTaskQueue[0].floorNum
                ? 10
                : 0,
              // penalize if far
              -1 *
                Math.abs(
                  elevatorData[proposedElevatorRef.elevatorNum].floorFloat -
                    proposedElevatorRef.proposedTaskQueue[0].floorNum
                ),

              // reward if dropping off first
              elevatorData[proposedElevatorRef.elevatorNum].buttons[
                proposedElevatorRef.proposedTaskQueue[0].floorNum
              ]
                ? 10
                : 0,

              0 *
                Math.min(
                  0,
                  ...proposedElevatorRef.proposedTaskQueue
                    .map(
                      ({ floorNum }) =>
                        elevatorData[proposedElevatorRef.elevatorNum].buttons[
                          floorNum
                        ]?.boarded
                    )
                    .filter((n) => n)
                    .map((t) => now - t)
                ),
              0 *
                Math.min(
                  0,
                  ...proposedElevatorRef.proposedTaskQueue
                    .map(
                      ({ floorNum }) =>
                        floorData[floorNum][
                          elevatorData[proposedElevatorRef.elevatorNum]
                            .taskQueue[0]?.direction
                        ]?.data.need_elevator
                    )
                    .filter((n) => n)
                    .map((t) => now - t!)
                ),
            ];
          }
          // public
          const elevatorData: ElevatorData = elevators.map(() => ({
            floorFloat: 0,
            buttons: {},
            taskQueue: [],
          }));
          const floorData: FloorData = floors.map(() =>
            Object.fromEntries(
              (["up", "down"] as Direction[]).map((direction) => [
                direction,
                { direction, data: {} },
              ])
            )
          );
          function recompute(recomputeReason: any) {
            const elevatorRefs: ElevatorRef[] = elevators.map(
              (elevator, elevatorNum) => ({
                elevatorNum,
                proposedTaskQueue: attachDirections(
                  elevatorData[elevatorNum].floorFloat,
                  elevator.getPressedFloors().map((floorNum) => ({
                    floorNum,
                    reason: "none",
                    direction: "none",
                  }))
                ),
              })
            );
            // @ts-ignore
            window.x = {
              elevators,
              floors,
              elevatorData,
              floorData,
              elevatorRequests: elevatorRefs,
              seed,
            };
            console.log(
              "recompute",
              recomputeReason,
              // @ts-ignore
              JSON.parse(JSON.stringify(window.x))
            );
            floorData.flatMap((f, floorNum) =>
              Object.values(f)
                .filter(({ data }) => data.need_elevator !== undefined)
                .map((floorObj) => ({
                  direction: "none" as Direction,
                  reason: floorObj.direction,
                  floorNum,
                }))
                .map((floorRef) => {
                  const bestRequest = elevatorRefs
                    .flatMap((elevatorRef) =>
                      [true, false].map((shouldPivot) => ({
                        floorRef,
                        elevatorRef,
                        shouldPivot,
                        score: requestScore(elevatorRef, floorRef, shouldPivot),
                      }))
                    )
                    .sort((a, b) => b.score - a.score)[0];

                  if (bestRequest?.score > Number.NEGATIVE_INFINITY) {
                    const existing =
                      bestRequest.elevatorRef.proposedTaskQueue.find(
                        (p) => p.floorNum === floorRef.floorNum
                      );
                    if (existing === undefined) {
                      bestRequest.elevatorRef.proposedTaskQueue.push(
                        bestRequest.floorRef
                      );
                    } else {
                      existing.reason =
                        existing.reason === "none" ? floorRef.reason : "both";
                    }
                  }
                })
            );
            elevatorRefs.map((elevatorRef) => {
              elevatorRef.proposedTaskQueue.sort(
                (a, b) => a.floorNum - b.floorNum
              );
              const segments = {
                up: elevatorRef.proposedTaskQueue.filter(
                  ({ floorNum }) =>
                    floorNum > elevators[elevatorRef.elevatorNum].currentFloor()
                ),
                down: elevatorRef.proposedTaskQueue
                  .filter(
                    ({ floorNum }) =>
                      floorNum <
                      elevators[elevatorRef.elevatorNum].currentFloor()
                  )
                  .reverse(),
                both: elevatorRef.proposedTaskQueue.filter(
                  ({ floorNum }) =>
                    floorNum ===
                    elevators[elevatorRef.elevatorNum].currentFloor()
                ),
              };
              const directionData = Object.values(segments)
                .filter((segments) => segments.length > 0)
                .map((proposedTaskQueue) => ({
                  proposedTaskQueue,
                  total: getDirectionValue({
                    elevatorNum: elevatorRef.elevatorNum,
                    proposedTaskQueue,
                  }).reduce((a, b) => a + b, 0),
                }));
              if (elevatorData[elevatorRef.elevatorNum].forced) return;
              console.log("elevator", {
                elevatorNum: elevatorRef.elevatorNum,
                c: elevatorData[elevatorRef.elevatorNum].floorFloat,
                queue: elevators[elevatorRef.elevatorNum].destinationQueue,
                directionData,
              });
              elevators[elevatorRef.elevatorNum].stop();
              elevatorData[elevatorRef.elevatorNum].taskQueue = [];
              attachDirections(
                elevatorData[elevatorRef.elevatorNum].floorFloat,
                directionData
                  .sort((a, b) => b.total - a.total)
                  .flatMap(({ proposedTaskQueue }) => proposedTaskQueue)
              ).map((floorRef) => {
                if (
                  elevators[elevatorRef.elevatorNum].destinationQueue.includes(
                    floorRef.floorNum
                  )
                )
                  throw new Error("floors should be deduped");
                elevators[elevatorRef.elevatorNum].goToFloor(floorRef.floorNum);
                elevatorData[elevatorRef.elevatorNum].taskQueue.push(floorRef);
              });
              setLights(elevatorRef.elevatorNum);
            });

            function attachDirections(
              currentFloor: number,
              unattached: FloorRef[]
            ): FloorRef[] {
              return unattached.map(({ floorNum, reason }) => {
                const rval = {
                  floorNum,
                  reason,
                  direction: (floorNum < currentFloor
                    ? "down"
                    : floorNum > currentFloor
                    ? "up"
                    : "none") as Direction,
                };
                currentFloor = floorNum;
                return rval;
              });
            }
          }
          // internal
          const initialSeed = Math.PI % 1;
          var seed = initialSeed;
          const randomSize = (1113 / 7) * 10000;

          // @ts-ignore
          if (!window.original_random) {
            // @ts-ignore
            original_random = _.random;
          }

          function h(args: number) {
            const oldseed = seed;
            seed = (seed * randomSize) % 1;
            if (seed === oldseed) {
              seed = initialSeed;
            }
            const old = original_random(args);
            return old;
            const rval =
              args === undefined ? seed : Math.floor(seed * (args + 1));
            return rval;
          }
          // @ts-ignore
          // _.random = (args) => {
          //   return h(args);
          // };
          // @ts-ignore
          window.force = (elevatorNum: number, floors: number[]) => {
            elevatorData[elevatorNum].forced = true;
            elevators[elevatorNum].stop();
            floors.forEach((floorNum) =>
              elevators[elevatorNum].goToFloor(floorNum)
            );
          };
          console.clear();
          console.log("init");

          var alerting = true;
          const alert = (obj: any) => {
            // @ts-ignore
            if (!alerting || !window.confirm(JSON.stringify(obj))) {
              alerting = false;
            }
            return obj;
          };
          now = 0;
          //
          function request(floorNum: number, direction: "up" | "down") {
            const data = floorData[floorNum][direction]!.data;
            if (!data.need_elevator) {
              data.need_elevator = now;
            }
            recompute({ request: { floorNum, direction } });
          }

          function elevatorFloor(
            elevatorNum: number,
            floorNum: number,
            isStopping: boolean
          ) {
            elevatorData[elevatorNum].floorFloat = floorNum;
            if (isStopping) {
              alert(floorNum);
              elevatorData[elevatorNum].lastRef =
                elevatorData[elevatorNum].taskQueue.shift();
              if (elevatorData[elevatorNum].lastRef) {
                [elevatorData[elevatorNum].lastRef!.reason || "none"]
                  .flatMap((reason) =>
                    reason === "both" ? ["up", "down"] : reason
                  )
                  .map((direction) => {
                    if (floorData[floorNum][direction]?.data.need_elevator) {
                      delete elevatorData[elevatorNum].buttons[floorNum];
                      floorData[floorNum][direction].data.need_floor =
                        floorData[floorNum][direction].data.need_elevator;
                      delete floorData[floorNum][direction].data.need_elevator;
                    }
                  });
                setLights(elevatorNum);
                switch (elevatorData[elevatorNum].taskQueue[0]?.direction) {
                  case "up":
                    elevatorData[elevatorNum].floorFloat += 0.25;
                    break;
                  case "down":
                    elevatorData[elevatorNum].floorFloat -= 0.25;
                    break;
                }
                recompute({ stop: { elevatorNum, floorNum } });
              }
            }
          }
          function setLights(elevatorNum: number) {
            const reason = elevatorData[elevatorNum].taskQueue[0]?.reason;
            elevators[elevatorNum].goingUpIndicator(
              ["up", "both"].includes(reason)
            );
            elevators[elevatorNum].goingDownIndicator(
              ["down", "both"].includes(reason)
            );
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
              [elevatorData[elevatorNum].lastRef?.reason || "none"]
                .flatMap((reason) =>
                  reason === "both" ? ["up", "down"] : reason
                )
                .map((direction) => {
                  elevatorData[elevatorNum].buttons[floorNum] = {
                    floorNum,
                    boarded: now,
                    pressed:
                      floorData[elevator.currentFloor()][direction]!.data
                        .need_floor!,
                  };
                });
              recompute({ button: { floorNum } });
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
