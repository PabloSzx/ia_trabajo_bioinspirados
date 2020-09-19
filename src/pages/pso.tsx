import { minBy, range } from "lodash";
import { Fragment } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import { createStore } from "react-state-selector";

import {
  Box,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/core";

import {
  calcRastrigin,
  getRandomPercent,
  getRandomX,
} from "../utils/Rastrigin";

const width = 700;
const height = 700;

export const PSOStore = createStore(
  {
    n: 100,
    inertia: 50,
    maxVelocity: 3.5,
    data: [] as {
      x1: number;
      x2: number;
      y: number;
      vx1: number;
      vx2: number;
      bestPersonalx1: number;
      bestPersonalx2: number;
      bestPersonalY: number;
    }[],
    bestX1: 0,
    bestX2: 0,
    bestY: 0,
    nEvals: 0,
    bestHistory: [] as {
      nEvals: number;
      bestX1: number;
      bestX2: number;
      bestY: number;
    }[],
  },
  {
    hooks: {
      useBestHistory(store) {
        return store.bestHistory;
      },
    },
    actions: {
      setInertia: (n: number) => (draft) => {
        draft.inertia = n;
        setTimeout(() => {
          PSOStore.actions.init();
        }, 0);
      },
      setMaxVelocity: (n: number) => (draft) => {
        draft.maxVelocity = n;
        setTimeout(() => {
          PSOStore.actions.init();
        }, 0);
      },
      init: (n?: number) => (draft) => {
        n = draft.n = n ?? draft.n;
        draft.data = range(0, n).map(() => {
          const x1 = getRandomX();
          const x2 = getRandomX();

          const y = calcRastrigin(x1, x2);

          const bestPersonalx1 = x1;
          const bestPersonalx2 = x2;

          return {
            x1,
            x2,
            y,
            vx1: 0,
            vx2: 0,
            bestPersonalx1,
            bestPersonalx2,
            bestPersonalY: calcRastrigin(bestPersonalx1, bestPersonalx2),
          };
        });

        const bestSingle = minBy(draft.data, (v) => v.bestPersonalY);

        draft.bestX1 = bestSingle?.bestPersonalx1 ?? getRandomX();
        draft.bestX2 = bestSingle?.bestPersonalx2 ?? getRandomX();
        draft.bestY = bestSingle?.bestPersonalY ?? Infinity;

        draft.bestHistory = [
          {
            nEvals: 1,
            bestX1: draft.bestX1,
            bestX2: draft.bestX2,
            bestY: draft.bestY,
          },
        ];
        draft.nEvals = 1;
      },
      tick: () => (draft) => {
        const inertia = draft.inertia;
        const maxVelocity = draft.maxVelocity;
        draft.nEvals += 1;

        let fitnessImproved = false;

        for (const value of draft.data) {
          value.vx1 =
            inertia * value.vx1 +
            getRandomPercent() * (value.bestPersonalx1 - value.x1) +
            getRandomPercent() * (draft.bestX1 - value.x1);
          value.vx2 =
            inertia * value.vx2 +
            getRandomPercent() * (value.bestPersonalx2 - value.x2) +
            getRandomPercent() * (draft.bestX2 - value.x2);

          const mod = Math.sqrt(value.vx1 * value.vx1 + value.vx2 * value.vx2);

          if (mod > maxVelocity) {
            value.vx1 /= mod * maxVelocity;
            value.vx2 /= mod * maxVelocity;
          }

          value.x1 += value.vx1;
          value.x2 += value.vx2;

          if (value.x1 > 5.12) {
            value.x1 = 5.12;
          } else if (value.x1 < -5.12) {
            value.x1 = -5.12;
          }
          if (value.x2 > 5.12) {
            value.x2 = 5.12;
          } else if (value.x2 < -5.12) {
            value.x2 = -5.12;
          }

          const fitness = calcRastrigin(value.x1, value.x2);

          if (fitness < value.bestPersonalY) {
            value.bestPersonalY = fitness;
            value.bestPersonalx1 = value.x1;
            value.bestPersonalx2 = value.x2;
          }

          if (fitness < draft.bestY) {
            draft.bestY = fitness;
            draft.bestX1 = value.bestPersonalx1;
            draft.bestX2 = value.bestPersonalx2;

            fitnessImproved = true;
          }
        }

        if (fitnessImproved) {
          draft.bestHistory.push({
            bestY: draft.bestY,
            bestX1: draft.bestX1,
            bestX2: draft.bestX2,
            nEvals: draft.nEvals,
          });
        }
      },
    },
  }
);

PSOStore.actions.init(100);

if (typeof window !== "undefined")
  setInterval(() => {
    PSOStore.actions.tick();
  }, 20);

const PSOPage = () => {
  const { data, inertia, maxVelocity, n } = PSOStore.useStore();

  const bg = useColorModeValue(undefined, "white");
  const border = useColorModeValue("1px solid black", undefined);
  return (
    <Stack>
      <Flex paddingTop="10px" direction="column" alignItems="center">
        <Box shadow="md" borderWidth="1px" padding="10px" borderRadius="5px">
          <Text textAlign="center">
            N: <b>{n}</b>
          </Text>
          <Slider
            colorScheme="orange"
            width="200px"
            value={n}
            onChange={PSOStore.actions.init}
            min={2}
            max={500}
            step={1}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      </Flex>
      <Flex paddingTop="10px" direction="column" alignItems="center">
        <Box shadow="md" borderWidth="1px" padding="10px" borderRadius="5px">
          <Text textAlign="center">
            Inercia: <b>{inertia}</b>
          </Text>
          <Slider
            colorScheme="green"
            width="200px"
            value={inertia}
            onChange={PSOStore.actions.setInertia}
            min={0}
            max={80}
            step={1}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      </Flex>

      <Flex paddingTop="10px" direction="column" alignItems="center">
        <Box shadow="md" borderWidth="1px" padding="10px" borderRadius="5px">
          <Text textAlign="center">
            Velocidad Máxima: <b>{maxVelocity}</b>
          </Text>
          <Slider
            colorScheme="cyan"
            width="200px"
            value={maxVelocity}
            onChange={PSOStore.actions.setMaxVelocity}
            min={0}
            max={7}
            step={0.25}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      </Flex>

      <Flex justifyContent="center" paddingTop="20px">
        <Box bg={bg} border={border}>
          <Stage width={width} height={height}>
            <Layer>
              {data
                .map((v) => ({
                  ...v,
                  x1: v.x1 * 67 + 350,
                  x2: v.x2 * 67 + 350,
                }))
                .map((v, index) => {
                  return (
                    <Fragment key={index}>
                      <Circle
                        key={index}
                        x={v.x1}
                        y={v.x2}
                        fill="green"
                        radius={4}
                      />
                      <Line
                        key={index}
                        points={[
                          v.x1,
                          v.x2,
                          v.x1 - 50 * v.vx1,
                          v.x2 - 50 * v.vx2,
                        ]}
                        stroke="green"
                      />
                    </Fragment>
                  );
                })}
            </Layer>
          </Stage>
        </Box>
      </Flex>
    </Stack>
  );
};

export default PSOPage;
