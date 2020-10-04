import { compact, defaults, sortBy } from "lodash";
import { useMemo } from "react";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Divider,
  Flex,
  Heading,
  Stack,
  useColorModeValue,
} from "@chakra-ui/core";

import { EAStore } from "./ea";
import { PSOStore } from "./pso";

const AverageCharts = () => {
  const averageEA = EAStore.hooks.useAverage();
  const averagePSO = PSOStore.hooks.useAverage();

  const combinedData = useMemo(() => {
    const data: { type: "EA" | "PSO"; x: number; y: number }[] = [];

    for (const v of averagePSO) {
      data.push({
        type: "PSO",
        x: v.nEvals,
        y: v.fitness,
      });
    }

    for (const v of averageEA) {
      data.push({
        type: "EA",
        x: v.generacion,
        y: v.fitness,
      });
    }

    const reducedData = data.reduce((acum, value) => {
      defaults(acum, {
        [value.x]: {
          x: value.x,
        },
      });
      switch (value.type) {
        case "EA": {
          acum[value.x].ea = value.y;
          break;
        }
        case "PSO": {
          acum[value.x].pso = value.y;
          break;
        }
      }
      return acum;
    }, [] as { x: number; ea?: number; pso?: number }[]);

    return sortBy(compact(reducedData), (v) => v.x);
  }, [averageEA, averagePSO]);

  const tooltipLabelColor = useColorModeValue(undefined, "black");

  return (
    <ResponsiveContainer height={500} width="95%">
      <LineChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis axisLine type="category" domain={[1, "dataMax"]} dataKey="x" />

        <YAxis axisLine />
        <Tooltip labelStyle={{ color: tooltipLabelColor }} />
        <Legend />
        <Line
          type="linear"
          connectNulls
          name="EA"
          dataKey="ea"
          stroke="#8884d8"
          dot={false}
        />
        <Line
          type="linear"
          connectNulls
          name="PSO"
          dataKey="pso"
          stroke="#82ca9d"
          dot={false}
        />
        <Brush dataKey="x" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const BestCharts = () => {
  const dataPSO = PSOStore.hooks.useBestHistory();

  const dataEA = EAStore.hooks.useBestHistory();

  const tooltipLabelColor = useColorModeValue(undefined, "black");

  const combinedData = useMemo(() => {
    const data: { type: "EA" | "PSO"; x: number; y: number }[] = [];

    for (const v of dataPSO) {
      data.push({
        type: "PSO",
        x: v.nEvals,
        y: v.bestFitness,
      });
    }

    for (const v of dataEA) {
      data.push({
        type: "EA",
        x: v.generacion,
        y: v.elem.fitness,
      });
    }

    const reducedData = data.reduce((acum, value) => {
      defaults(acum, {
        [value.x]: {
          x: value.x,
        },
      });
      switch (value.type) {
        case "EA": {
          acum[value.x].ea = value.y;
          break;
        }
        case "PSO": {
          acum[value.x].pso = value.y;
          break;
        }
      }
      return acum;
    }, [] as { x: number; ea?: number; pso?: number }[]);

    return sortBy(compact(reducedData), (v) => v.x);
  }, [dataPSO, dataEA]);

  return (
    <ResponsiveContainer height={500} width="95%">
      <LineChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis axisLine type="number" domain={[1, "dataMax"]} dataKey="x" />

        <YAxis axisLine />
        <Tooltip labelStyle={{ color: tooltipLabelColor }} />
        <Legend />
        <Line
          type="stepAfter"
          connectNulls
          name="EA"
          dataKey="ea"
          stroke="#8884d8"
        />
        <Line
          type="stepAfter"
          connectNulls
          name="PSO"
          dataKey="pso"
          stroke="#82ca9d"
        />
        <Brush dataKey="x" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const GraficosPage = () => {
  return (
    <Stack alignItems="center">
      <Heading>Convergencia Mejor PSO vs EA</Heading>
      <Flex width="100%" justifyContent="center">
        <BestCharts />
      </Flex>

      <Divider />

      <Heading>Convergencia Promedio PSO vs EA</Heading>
      <Flex width="100%" justifyContent="center">
        <AverageCharts />
      </Flex>
    </Stack>
  );
};

export default GraficosPage;
