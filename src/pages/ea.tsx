import { chunk, compact, minBy, range, sortBy } from "lodash";
import { Fragment } from "react";
import { AiOutlinePauseCircle, AiOutlinePlayCircle } from "react-icons/ai";
import { Circle, Layer, Rect, Stage, Text as KonvaText } from "react-konva";
import { createStore } from "react-state-selector";
import { useInterval } from "react-use";

import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/core";

import { SliderBox } from "../components/SliderBox";
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

const {
  hooks: { useIsTickEnabled, useWaitStep },
  actions: { toggleEnabledTick, setWaitStep, disableTick },
} = createStore(
  {
    isTickEnabled: true,
    waitStep: 500,
  },
  {
    hooks: {
      useIsTickEnabled(store) {
        return store.isTickEnabled;
      },
      useWaitStep(store) {
        return store.waitStep;
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
      setWaitStep: (n: number) => (draft) => {
        draft.waitStep = n;
      },
    },
    storagePersistence: {
      isSSR: true,
      isActive: true,
      persistenceKey: "EAMetaStore",
      debounceWait: 500,
    },
  }
);

export const EAStore = createStore(
  {
    random: getRandomGenerator(getLocalStorage("eaRandomSeed", "base")),
    step: EAStep.Inicio,
    idCounter: 0,
    n: 40,
    kSeleccion: 20,
    mSeleccionRandom: 3,
    mutationProbability: 25,
    mutationStrengthMultiplier: 1,
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
      setKSeleccion: (k: number) => (draft) => {
        draft.kSeleccion = k;
        setTimeout(() => {
          EAStore.actions.init();
        }, 0);
      },
      setMSeleccionRandom: (m: number) => (draft) => {
        draft.mSeleccionRandom = m;
        setTimeout(() => {
          EAStore.actions.init();
        }, 0);
      },
      setMutationProbability: (p: number) => (draft) => {
        draft.mutationProbability = p;
        setTimeout(() => {
          EAStore.actions.init();
        }, 0);
      },
      setMutationStrengthMultiplier: (mp: number) => (draft) => {
        draft.mutationStrengthMultiplier = mp;
        setTimeout(() => {
          EAStore.actions.init();
        }, 0);
      },
      init: ({ n, seed }: { n?: number; seed?: string } = {}) => (draft) => {
        draft.step = EAStep.Inicio;
        n = draft.n = n ?? draft.n;

        draft.bestFitness = {
          generacion: 0,
          elem: { id: -1, x1: 0, x2: 0, fitness: Infinity },
        };

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
        draft.nuevos = [];
        draft.selected = [];
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

        draft.nuevos = [];

        const mSeleccionRandom = draft.mSeleccionRandom;

        draft.selected = compact(
          range(0, draft.kSeleccion).map(() => {
            const sampleData = sampleSize(draft.data, mSeleccionRandom);

            return minBy(sampleData, (v) => v.fitness);
          })
        );
      },
      cruzamiento: () => (draft) => {
        const { random } = draft.random;
        draft.step = EAStep.Cruzamiento;
        let idCounter = draft.idCounter;
        draft.nuevos = compact(
          chunk(draft.selected, 2).map(([v1, v2]) => {
            if (v2 == null) return null;
            const x1 = random(Math.min(v1.x1, v2.x1), Math.max(v1.x1, v2.x1));
            const x2 = random(Math.min(v1.x2, v2.x2), Math.max(v1.x2, v2.x2));
            return {
              id: ++idCounter,
              x1,
              x2,
              fitness: calcRastrigin(x1, x2),
            };
          })
        );
        draft.idCounter = idCounter;
      },
      mutacion: () => (draft) => {
        const { getRandomX, random } = draft.random;
        draft.step = EAStep.Mutacion;
        const probabilityMutation = draft.mutationProbability;
        const mutationStrengthMultiplier = draft.mutationStrengthMultiplier;
        draft.nuevos = draft.nuevos.map((v) => {
          if (random(1, 100) <= probabilityMutation) {
            v.x1 = limitX(v.x1 + mutationStrengthMultiplier * getRandomX());

            v.x2 = limitX(v.x2 + mutationStrengthMultiplier * getRandomX());

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

function getRelativePosToCanvas(v: number) {
  return v * 67 + 350;
}

const {
  init,
  seleccion,
  cruzamiento,
  mutacion,
  reinsercion,
  setKSeleccion,
  setMSeleccionRandom,
  setMutationProbability,
  setMutationStrengthMultiplier,
} = EAStore.actions;

init();

const EAStepValues = Object.values(EAStep);

const EAPage = () => {
  const {
    data,
    selected,
    nuevos,
    step,
    bestFitness,
    generacion,
    n,
    kSeleccion,
    mSeleccionRandom,
    mutationProbability,
    mutationStrengthMultiplier,
  } = EAStore.useStore();

  const bg = useColorModeValue(undefined, "white");
  const border = useColorModeValue("1px solid black", undefined);

  const waitStep = useWaitStep();
  const isTickEnabled = useIsTickEnabled();

  useInterval(() => {
    if (!isTickEnabled) {
      return;
    }
    switch (step) {
      case EAStep.Reinsercion:
      case EAStep.Inicio: {
        return seleccion();
      }
      case EAStep.Seleccion: {
        return cruzamiento();
      }
      case EAStep.Cruzamiento: {
        return mutacion();
      }
      case EAStep.Mutacion: {
        return reinsercion();
      }
    }
  }, waitStep);

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
      />
      <SliderBox
        label="K Selección"
        value={kSeleccion}
        setValue={setKSeleccion}
        min={2}
        max={n}
        step={1}
        colorScheme="red"
      />
      <SliderBox
        label="M Selección Random"
        value={mSeleccionRandom}
        setValue={setMSeleccionRandom}
        min={2}
        max={kSeleccion}
        step={1}
        colorScheme="teal"
      />
      <SliderBox
        label="Probabilidad Mutación (%)"
        value={mutationProbability}
        setValue={setMutationProbability}
        min={0}
        max={100}
        step={1}
        colorScheme="purple"
      />
      <SliderBox
        label="Multiplicador Fuerza Mutación"
        value={mutationStrengthMultiplier}
        setValue={setMutationStrengthMultiplier}
        min={0}
        max={10}
        step={0.1}
        colorScheme="pink"
      />
      <SliderBox
        label="Intervalo de tiempo por paso (ms)"
        value={waitStep}
        setValue={setWaitStep}
        min={10}
        max={5000}
        step={0.1}
        colorScheme="pink"
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

      <Flex justifyContent="center">
        <Breadcrumb>
          {EAStepValues.map((v) => {
            const shouldAnimate = waitStep > 80;
            return (
              <BreadcrumbItem key={v}>
                <BreadcrumbLink
                  onClick={() => {
                    disableTick();
                    switch (v) {
                      case EAStep.Inicio: {
                        return init();
                      }
                      case EAStep.Seleccion: {
                        return seleccion();
                      }
                      case EAStep.Cruzamiento: {
                        return cruzamiento();
                      }
                      case EAStep.Mutacion: {
                        return mutacion();
                      }
                      case EAStep.Reinsercion: {
                        return reinsercion();
                      }
                    }
                  }}
                  className="unselectable"
                  fontWeight={
                    shouldAnimate
                      ? v === step
                        ? "bold"
                        : undefined
                      : undefined
                  }
                >
                  {shouldAnimate ? v : v === step ? <b>{v}</b> : v}
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
