import { round } from "lodash";
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

import {
  Divider,
  Flex,
  Heading,
  Stack,
  useColorModeValue,
} from "@chakra-ui/core";

import { PSOStore } from "./pso";
import { EAStore } from "./ea";

const GraficosPage = () => {
  const dataPSO = PSOStore.hooks.useBestHistory();

  const dataEA = EAStore.hooks.useBestHistory();

  const tooltipLabelColor = useColorModeValue(undefined, "black");

  return (
    <Stack alignItems="center">
      <Heading>Convergencia PSO</Heading>
      <Flex width="100%" justifyContent="center">
        <ResponsiveContainer height={300} width="80%">
          <LineChart data={dataPSO}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={(d) => d.nEvals}
              name="Numero de evaluaciones"
              axisLine
              type="category"
              unit=" evaluaciones"
            />
            <YAxis
              dataKey={(d) => round(d.bestY, 2)}
              allowDecimals
              domain={[0, "dataMax"]}
            />
            <Tooltip labelStyle={{ color: tooltipLabelColor }} />
            <Legend />
            <Line
              type="monotone"
              dataKey={(d) => d.bestY}
              activeDot={{ r: 8 }}
              stroke="#666"
              name="Fitness"
            />
          </LineChart>
        </ResponsiveContainer>
      </Flex>

      <Divider />

      <Heading>Convergencia EA</Heading>
      <Flex width="100%" justifyContent="center">
        <ResponsiveContainer height={300} width="80%">
          <LineChart data={dataEA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={(d) => d.generacion}
              name="Generación"
              axisLine
              type="category"
              unit=" generaciones"
            />
            <YAxis
              dataKey={(d) => round(d.elem.fitness, 2)}
              allowDecimals
              domain={[0, "dataMax"]}
            />
            <Tooltip labelStyle={{ color: tooltipLabelColor }} />
            <Legend />
            <Line
              type="monotone"
              dataKey={(d) => d.elem.fitness}
              activeDot={{ r: 8 }}
              stroke="#666"
              name="Fitness"
            />
          </LineChart>
        </ResponsiveContainer>
      </Flex>
    </Stack>
  );
};

export default GraficosPage;
