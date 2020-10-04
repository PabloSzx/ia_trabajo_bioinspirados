import { minBy, range, sumBy } from "lodash";
import { Fragment, memo } from "react";
import { AiOutlinePauseCircle, AiOutlinePlayCircle } from "react-icons/ai";
import {
  Circle,
  Layer,
  Line,
  Rect,
  Stage,
  Text as KonvaText,
} from "react-konva";
import { createSelector, createStore } from "react-state-selector";
import { useInterval } from "react-use";

import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/core";

import { SliderBox } from "../components/SliderBox";
import { getRandomGenerator } from "../utils/random";
import { calcRastrigin } from "../utils/Rastrigin";
import { getLocalStorage } from "../utils/storage";

const width = 700;
const height = 700;

const {
  hooks: { useIsTickEnabled },
  actions: { toggleEnabledTick, disableTick },
} = createStore(
  {
    isTickEnabled: false,
  },
  {
    hooks: {
      useIsTickEnabled(store) {
        return store.isTickEnabled;
      },
    },
    actions: {
      toggleEnabledTick: () => (draft) => {
        draft.isTickEnabled = !draft.isTickEnabled;
      },
      enableTick: () => (draft) => {
        draft.isTickEnabled = true;
      },
      disableTick: () => (draft) => {
        draft.isTickEnabled = false;
      },
    },
    storagePersistence: {
      isActive: true,
      isSSR: true,
      debounceWait: 500,
      persistenceKey: "PSOMetaStore",
    },
  }
);

export const PSOStore = createStore(
  {
    random: getRandomGenerator(getLocalStorage("psoRandomSeed", "base")),
    n: 100,
    inertia: 2000,
    maxVelocity: 0.2,
    C1: 70,
    C2: 10,
    data: [] as {
      x1: number;
      x2: number;
      fitness: number;
      vx1: number;
      vx2: number;
      bestPersonalx1: number;
      bestPersonalx2: number;
      bestPersonalFitness: number;
    }[],
    bestX1: 0,
    bestX2: 0,
    bestY: 0,
    nEvals: 0,
    bestHistory: [] as {
      nEvals: number;
      bestX1: number;
      bestX2: number;
      bestFitness: number;
    }[],
    average: [] as {
      nEvals: number;
      fitness: number;
    }[],
  },
  {
    hooks: {
      useMetadata: createSelector(
        (state) => state.inertia,
        (state) => state.maxVelocity,
        (state) => state.n,
        (state) => state.C1,
        (state) => state.C2,
        (inertia, maxVelocity, n, C1, C2) => {
          return {
            inertia,
            maxVelocity,
            n,
            C1,
            C2,
          };
        }
      ),
      useBestHistory(store) {
        return store.bestHistory;
      },
      useRandom(store) {
        return store.random;
      },
      useAverage(store) {
        return store.average;
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
      setC1: (n: number) => (draft) => {
        draft.C1 = n;
        setTimeout(() => {
          PSOStore.actions.init();
        }, 0);
      },
      setC2: (n: number) => (draft) => {
        draft.C2 = n;
        setTimeout(() => {
          PSOStore.actions.init();
        }, 0);
      },
      init: ({ n, seed }: { n?: number; seed?: string } = {}) => (draft) => {
        seed = draft.random.seed = seed ?? draft.random.seed;

        const { getRandomX } = (draft.random = getRandomGenerator(seed));

        n = draft.n = n ?? draft.n;
        draft.data = range(0, n).map(() => {
          const x1 = getRandomX();
          const x2 = getRandomX();

          const fitness = calcRastrigin(x1, x2);

          const bestPersonalx1 = x1;
          const bestPersonalx2 = x2;

          return {
            x1,
            x2,
            fitness,
            vx1: 0,
            vx2: 0,
            bestPersonalx1,
            bestPersonalx2,
            bestPersonalFitness: calcRastrigin(bestPersonalx1, bestPersonalx2),
          };
        });

        const bestSingle = minBy(draft.data, (v) => v.bestPersonalFitness);

        draft.bestX1 = bestSingle?.bestPersonalx1 ?? getRandomX();
        draft.bestX2 = bestSingle?.bestPersonalx2 ?? getRandomX();
        draft.bestY = bestSingle?.bestPersonalFitness ?? Infinity;

        draft.average = [
          {
            nEvals: 1,
            fitness: sumBy(draft.data, (v) => v.fitness) / draft.data.length,
          },
        ];
        draft.bestHistory = [
          {
            nEvals: 1,
            bestX1: draft.bestX1,
            bestX2: draft.bestX2,
            bestFitness: draft.bestY,
          },
        ];
        draft.nEvals = 1;
      },
      tick: () => (draft) => {
        const inertia = draft.inertia;
        const maxVelocity = draft.maxVelocity;
        const C1 = draft.C1;
        const C2 = draft.C2;
        draft.nEvals += 1;

        let fitnessImproved = false;

        const { getRandomPercent } = draft.random;

        for (const value of draft.data) {
          let x1 = value.x1;
          let x2 = value.x2;

          let vx1 = value.vx1;
          let vx2 = value.vx2;
          vx1 =
            vx1 * inertia +
            getRandomPercent() * C1 * (value.bestPersonalx1 - x1) +
            getRandomPercent() * C2 * (draft.bestX1 - x1);
          vx2 =
            vx2 * inertia +
            getRandomPercent() * C1 * (value.bestPersonalx2 - x2) +
            getRandomPercent() * C2 * (draft.bestX2 - x2);

          const mod = Math.sqrt(vx1 * vx1 + vx2 * vx2);

          if (mod > maxVelocity) {
            vx1 = (vx1 / mod) * maxVelocity;
            vx2 = (vx2 / mod) * maxVelocity;
          }

          x1 += vx1;
          x2 += vx2;

          if (x1 >= 5.12 || x1 <= -5.12) {
            vx1 = -vx1;
          }
          if (x2 >= 5.12 || x2 <= -5.12) {
            vx2 = -vx2;
          }

          const fitness = calcRastrigin(x1, x2);

          if (fitness < value.bestPersonalFitness) {
            value.bestPersonalFitness = fitness;
            value.bestPersonalx1 = x1;
            value.bestPersonalx2 = x2;
          }

          if (fitness < draft.bestY) {
            draft.bestY = fitness;
            draft.bestX1 = value.bestPersonalx1;
            draft.bestX2 = value.bestPersonalx2;

            fitnessImproved = true;
          }

          value.fitness = fitness;
          value.x1 = x1;
          value.x2 = x2;
          value.vx1 = vx1;
          value.vx2 = vx2;
        }

        draft.average.push({
          nEvals: draft.nEvals,
          fitness: sumBy(draft.data, (v) => v.fitness) / draft.data.length,
        });

        if (fitnessImproved) {
          draft.bestHistory.push({
            bestFitness: draft.bestY,
            bestX1: draft.bestX1,
            bestX2: draft.bestX2,
            nEvals: draft.nEvals,
          });
        }
      },
    },
  }
);

const {
  init,
  tick,
  setInertia,
  setMaxVelocity,
  setC1,
  setC2,
} = PSOStore.actions;

init();
function getRelativePosToCanvas(v: number) {
  return v * 67 + 350;
}

const Canvas = memo(() => {
  const bg = useColorModeValue(undefined, "white");
  const border = useColorModeValue("1px solid black", undefined);

  const { data, bestX1, bestX2, bestY, nEvals } = PSOStore.useStore();
  return (
    <>
      <Flex justifyContent="center">
        <Text>
          N° Evaluaciones: <b>{nEvals}</b>
        </Text>
      </Flex>
      <Flex justifyContent="center" paddingY="10px">
        <Box bg={bg} border={border}>
          <Stage width={width} height={height}>
            <Layer>
              <Rect
                x={getRelativePosToCanvas(0) - 10}
                y={getRelativePosToCanvas(0) - 10}
                width={20}
                height={20}
                fill="green"
              />
              <Circle
                x={getRelativePosToCanvas(0)}
                y={getRelativePosToCanvas(0)}
                fill="blue"
                radius={6}
              />

              <Circle
                x={getRelativePosToCanvas(bestX1)}
                y={getRelativePosToCanvas(bestX2)}
                fill="red"
                radius={6}
              />
              <KonvaText
                x={getRelativePosToCanvas(bestX1) + 10}
                y={getRelativePosToCanvas(bestX2)}
                fill="red"
                text={bestY.toFixed(5)}
              />
              {data.map((v, index) => {
                const x1 = getRelativePosToCanvas(v.x1);
                const x2 = getRelativePosToCanvas(v.x2);

                return (
                  <Fragment key={index}>
                    <Circle x={x1} y={x2} fill="green" radius={4} />
                    <Line
                      points={[x1, x2, x1 - 50 * v.vx1, x2 - 50 * v.vx2]}
                      stroke="green"
                    />
                  </Fragment>
                );
              })}
            </Layer>
          </Stage>
        </Box>
      </Flex>
    </>
  );
});

const PSOPage = () => {
  const { inertia, maxVelocity, n, C1, C2 } = PSOStore.hooks.useMetadata();

  const isTickEnabled = useIsTickEnabled();

  useInterval(() => {
    if (isTickEnabled) {
      tick();
    }
  }, 20);

  return (
    <Stack>
      <SliderBox
        label="N"
        value={n}
        setValue={(n) => {
          init({ n });
        }}
        min={2}
        max={200}
        step={1}
        colorScheme="orange"
        onChange={disableTick}
      />

      <SliderBox
        label="Inercia"
        value={inertia}
        setValue={setInertia}
        min={0}
        max={5000}
        step={1}
        colorScheme="green"
        onChange={disableTick}
      />

      <SliderBox
        label="Velocidad máxima"
        value={maxVelocity}
        setValue={setMaxVelocity}
        min={0}
        max={1}
        step={0.1}
        onChange={disableTick}
      />

      <SliderBox
        label="C1(Individual)"
        value={C1}
        setValue={setC1}
        min={10}
        max={100}
        step={1}
        onChange={disableTick}
      />

      <SliderBox
        label="C2(Social)"
        value={C2}
        setValue={setC2}
        min={10}
        max={100}
        step={1}
        onChange={disableTick}
      />

      <Flex justifyContent="center">
        <Button
          size="lg"
          colorScheme={isTickEnabled ? "red" : "blue"}
          aria-label={isTickEnabled ? "Resume Ticking" : "Pause Ticking"}
          leftIcon={
            isTickEnabled ? <AiOutlinePauseCircle /> : <AiOutlinePlayCircle />
          }
          onClick={toggleEnabledTick}
        >
          {isTickEnabled ? "Pausar" : "Reanudar"}
        </Button>
      </Flex>

      <Canvas />
    </Stack>
  );
};

export default PSOPage;
