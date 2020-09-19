import { range } from "lodash";
import { Fragment } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import { createStore } from "react-state-selector";

import { Box, Flex, Stack, useColorModeValue } from "@chakra-ui/core";

import {
  calcRastrigin,
  getRandomPercent,
  getRandomX,
  limitValue,
} from "../utils/Rastrigin";

const width = 700;
const height = 700;

const inertia = 30;

const maxVelocity = 1.5;

export const PSOStore = createStore(
  {
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
    bestX1: getRandomX(),
    bestX2: getRandomX(),
    bestY: Infinity,
    nEvals: 0,
  },
  {
    actions: {
      init: (n = 100) => (draft) => {
        draft.data = range(0, n).map(() => {
          const x1 = getRandomX();
          const x2 = getRandomX();

          const y = calcRastrigin(x1, x2);

          return {
            x1,
            x2,
            y,
            vx1: 0,
            vx2: 0,
            bestPersonalx1: getRandomX(),
            bestPersonalx2: getRandomX(),
            bestPersonalY: Infinity,
          };
        });
      },
      tick: () => (draft) => {
        for (const value of draft.data) {
          value.vx1 =
            inertia * value.vx1 +
            getRandomPercent() * (value.bestPersonalx1 - value.x1) +
            (getRandomPercent() * draft.bestX1 - value.x1);
          value.vx2 =
            inertia * value.vx2 +
            getRandomPercent() * (value.bestPersonalx2 - value.x2) +
            (getRandomPercent() * draft.bestX2 - value.x2);

          const mod = Math.sqrt(value.vx1 * value.vx1 + value.vx2 * value.vx2);

          if (mod > maxVelocity) {
            value.vx1 /= mod * maxVelocity;
            value.vx2 /= mod * maxVelocity;
          }

          value.x1 += value.vx1;
          value.x2 += value.vx2;

          value.x1 = limitValue(value.x1);
          value.x2 = limitValue(value.x2);

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
          }
        }
        draft.nEvals += 1;
      },
    },
  }
);

PSOStore.actions.init(20);

if (typeof window !== "undefined")
  setInterval(() => {
    PSOStore.actions.tick();
  }, 20);

const PSOPage = () => {
  const data = PSOStore.useStore().data;

  const bg = useColorModeValue(undefined, "white");
  const border = useColorModeValue("1px solid black", undefined);
  return (
    <Stack>
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
                      <Circle x={v.x1} y={v.x2} fill="green" radius={4} />
                      <Line
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
