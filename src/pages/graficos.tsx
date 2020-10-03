import { compact, defaults, sortBy } from "lodash";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Flex, Heading, Stack, useColorModeValue } from "@chakra-ui/core";

import { EAStore } from "./ea";
import { PSOStore } from "./pso";

const GraficosPage = () => {
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
    <Stack alignItems="center">
      <Heading>Convergencia PSO vs EA</Heading>
      <Flex width="100%" justifyContent="center">
        <ResponsiveContainer height={300} width="80%">
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              axisLine
              type="number"
              domain={[0, "dataMax"]}
              dataKey={(d: typeof combinedData[number]) => d.x}
            />

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
          </LineChart>
        </ResponsiveContainer>
      </Flex>
    </Stack>
  );
};

export default GraficosPage;
