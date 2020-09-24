import {
  chunk,
  compact,
  minBy,
  random,
  range,
  sampleSize,
  shuffle,
  sortBy,
} from "lodash";
import { Fragment } from "react";
import { Circle, Layer, Stage, Text as KonvaText } from "react-konva";
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

import { calcRastrigin, getRandomX, limitX } from "../utils/Rastrigin";

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

export const EAStore = createStore(
  {
    step: EAStep.Inicio,
    idCounter: 0,
    n: 12,
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
    actions: {
      init: (n?: number) => (draft) => {
        draft.step = EAStep.Inicio;
        n = draft.n = n ?? draft.n;
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

        draft.selected = compact(
          range(0, draft.n / 2).map(() => {
            const sampleData = sampleSize(draft.data, 3);

            return minBy(sampleData, (v) => v.fitness);
          })
        );
      },
      cruzamiento: () => (draft) => {
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
        draft.step = EAStep.Mutacion;
        draft.nuevos = draft.nuevos.map((v) => {
          if (random(1, 100) <= 5) {
            if (random(0, 1) === 0) {
              v.x1 = limitX(v.x1 + getRandomX());
            } else {
              v.x2 = limitX(v.x2 + getRandomX());
            }
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
        // draft.n = 20
        // draft.nuevos.length = 6
        // draft.data.length = 20;

        // draft.n - draft.nuevos.length = 20 - 6 = 14

        //             6            +    14  = 20
        draft.data = [
          ...draft.nuevos,
          ...sortBy(draft.data, (v) => v.fitness).slice(
            0,
            draft.n - draft.nuevos.length
          ),
        ];
        // draft.data = sampleSize(all, draft.n);
        draft.selected = [];
        draft.nuevos = [];
      },
    },
  }
);

typeof window !== "undefined" &&
  (async () => {
    const {
      init,
      seleccion,
      cruzamiento,
      mutacion,
      reinsercion,
    } = EAStore.actions;

    init(50);
    while (true) {
      await wait(2500);
      seleccion();
      await wait(2500);
      cruzamiento();
      await wait(2500);
      mutacion();
      await wait(2500);
      reinsercion();
      await wait(2500);
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
