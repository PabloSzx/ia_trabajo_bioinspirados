import { chunk, compact, minBy, range, sortBy } from "lodash";
import { Fragment } from "react";
import { Circle, Layer, Rect, Stage, Text as KonvaText } from "react-konva";
import { createStore } from "react-state-selector";
import wait from "waait";

import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/core";

import { IS_BROWSER } from "../utils/constants";
import { getRandomGenerator } from "../utils/random";
import { calcRastrigin, limitX } from "../utils/Rastrigin";
import { getLocalStorage } from "../utils/storage";

const width = 700;
const height = 700;

interface Elem {
  id: number;
  x1: number;
  x2: number;
  fitness: number;
}

enum EAStep {
  Inicio = "Inicio",
  Seleccion = "Selección",
  Cruzamiento = "Cruzamiento",
  Mutacion = "Mutación",
  Reinsercion = "Reinserción",
}

export const eaMeta = {
  enableTick: false,
  waitStep: 500,
};

export const EAStore = createStore(
  {
    random: getRandomGenerator(getLocalStorage("eaRandomSeed", "base")),
    step: EAStep.Inicio,
    idCounter: 0,
    n: 40,
    generacion: 0,
    data: [] as Elem[],
    selected: [] as Elem[],
    nuevos: [] as Elem[],
    bestFitness: {
      generacion: 0,
      elem: { id: -1, x1: 0, x2: 0, fitness: Infinity },
    },
    bestFitnessHistory: [] as { generacion: number; elem: Elem }[],
  },
  {
    hooks: {
      useBestHistory(store) {
        return store.bestFitnessHistory;
      },
      useRandom(store) {
        return store.random;
      },
    },
    actions: {
      init: ({ n, seed }: { n?: number; seed?: string } = {}) => (draft) => {
        eaMeta.enableTick = true;
        draft.step = EAStep.Inicio;
        n = draft.n = n ?? draft.n;

        seed = draft.random.seed = seed ?? draft.random.seed;

        const { getRandomX } = (draft.random = getRandomGenerator(seed));

        let idCounter = 0;
        draft.data = range(0, n).map(() => {
          const x1 = getRandomX();
          const x2 = getRandomX();
          const fitness = calcRastrigin(x1, x2);
          const elem = {
            id: ++idCounter,
            x1,
            x2,
            fitness,
          };
          if (fitness < draft.bestFitness.elem.fitness) {
            draft.bestFitness.elem = {
              ...elem,
            };
          }
          return elem;
        });
        draft.bestFitness.generacion = 1;
        draft.bestFitnessHistory = [
          {
            ...draft.bestFitness,
          },
        ];
        draft.idCounter = idCounter;
        draft.generacion = 1;
      },
      seleccion: () => (draft) => {
        draft.step = EAStep.Seleccion;

        const { sampleSize } = draft.random;

        draft.selected = compact(
          range(0, draft.n / 2).map(() => {
            const sampleData = sampleSize(draft.data, 3);

            return minBy(sampleData, (v) => v.fitness);
          })
        );
      },
      cruzamiento: () => (draft) => {
        const { random } = draft.random;
        draft.step = EAStep.Cruzamiento;
        draft.nuevos = compact(
          chunk(draft.selected, 2).map(([v1, v2]) => {
            if (v2 == null) return null;
            const x1 = random(Math.min(v1.x1, v2.x1), Math.max(v1.x1, v2.x1));
            const x2 = random(Math.min(v1.x2, v2.x2), Math.max(v1.x2, v2.x2));
            return {
              id: ++draft.idCounter,
              x1,
              x2,
              fitness: calcRastrigin(x1, x2),
            };
          })
        );
      },
      mutacion: () => (draft) => {
        const { getRandomX, random } = draft.random;
        draft.step = EAStep.Mutacion;
        draft.nuevos = draft.nuevos.map((v) => {
          if (random(1, 100) <= 25) {
            v.x1 = limitX(v.x1 + getRandomX());

            v.x2 = limitX(v.x2 + getRandomX());

            v.fitness = calcRastrigin(v.x1, v.x2);
          }
          return v;
        });
      },
      reinsercion: () => (draft) => {
        draft.generacion++;
        draft.step = EAStep.Reinsercion;

        const all = [...draft.data, ...draft.nuevos];
        const best = minBy(all, (v) => v.fitness);
        if (best && best.fitness < draft.bestFitness.elem.fitness) {
          draft.bestFitness = {
            elem: { ...best },
            generacion: draft.generacion,
          };
          draft.bestFitnessHistory.push(draft.bestFitness);
        }
        draft.data = [
          ...draft.nuevos,
          ...sortBy(draft.data, (v) => v.fitness).slice(
            0,
            draft.n - draft.nuevos.length
          ),
        ];
        draft.selected = [];
        draft.nuevos = [];
      },
    },
  }
);

if (IS_BROWSER)
  (async () => {
    const {
      init,
      seleccion,
      cruzamiento,
      mutacion,
      reinsercion,
    } = EAStore.actions;

    init();
    while (true) {
      if (eaMeta.enableTick) {
        await wait(eaMeta.waitStep);
        seleccion();
      }

      if (eaMeta.enableTick) {
        await wait(eaMeta.waitStep);
        cruzamiento();
      }

      if (eaMeta.enableTick) {
        await wait(eaMeta.waitStep);
        mutacion();
      }

      if (eaMeta.enableTick) {
        await wait(eaMeta.waitStep);
        reinsercion();
      }

      await wait(eaMeta.waitStep);
    }
  })();

function getRelativePosToCanvas(v: number) {
  return v * 67 + 350;
}

const EAPage = () => {
  const {
    data,
    selected,
    nuevos,
    step,
    bestFitness,
    generacion,
  } = EAStore.useStore();

  const bg = useColorModeValue(undefined, "white");
  const border = useColorModeValue("1px solid black", undefined);

  return (
    <Stack>
      <Flex justifyContent="center">
        <Breadcrumb>
          {Object.values(EAStep).map((v) => {
            return (
              <BreadcrumbItem key={v}>
                <BreadcrumbLink fontWeight={v === step ? "bold" : undefined}>
                  {v}
                </BreadcrumbLink>
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
      </Flex>
      <Flex justifyContent="center">
        <Text>
          Generación: <b>{generacion}</b>
        </Text>
      </Flex>
      <Flex justifyContent="center">
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
                x={getRelativePosToCanvas(bestFitness.elem.x1)}
                y={getRelativePosToCanvas(bestFitness.elem.x2)}
                fill="red"
                radius={6}
              />
              <KonvaText
                x={getRelativePosToCanvas(bestFitness.elem.x1) + 10}
                y={getRelativePosToCanvas(bestFitness.elem.x2)}
                fill="red"
                text={bestFitness.elem.fitness.toFixed(5)}
              />
              <KonvaText
                x={getRelativePosToCanvas(bestFitness.elem.x1) + 10}
                y={getRelativePosToCanvas(bestFitness.elem.x2) + 10}
                fill="red"
                text={"Generación " + bestFitness.generacion.toString()}
              />
              {data.map(({ x1, x2, id, fitness }) => {
                x1 = getRelativePosToCanvas(x1);
                x2 = getRelativePosToCanvas(x2);
                const fill = selected.find((v) => v.id === id)
                  ? "blue"
                  : "green";
                return (
                  <Fragment key={id}>
                    <Circle x={x1} y={x2} fill={fill} radius={2} />
                    <KonvaText
                      x={x1 + 5}
                      y={x2 + 5}
                      fill={fill}
                      text={fitness.toFixed(4)}
                    />
                  </Fragment>
                );
              })}
              {nuevos.map(({ x1, x2, id, fitness }) => {
                x1 = getRelativePosToCanvas(x1);
                x2 = getRelativePosToCanvas(x2);
                return (
                  <Fragment key={id}>
                    <Circle x={x1} y={x2} fill="cyan" radius={2} />
                    <KonvaText
                      x={x1 + 5}
                      y={x2 + 5}
                      fill="cyan"
                      text={fitness.toFixed(4)}
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

export default EAPage;
