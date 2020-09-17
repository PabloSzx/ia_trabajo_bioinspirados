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

import { Flex, Stack, useColorModeValue } from "@chakra-ui/core";

import { PSOStore } from "./pso";

const GraficosPage = () => {
  const data = PSOStore.useStore().data;

  const tooltipLabelColor = useColorModeValue(undefined, "black");

  return (
    <Stack>
      <Flex width="100%" justifyContent="center">
        <ResponsiveContainer height={300} width="80%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={(d) => d.a} />
            <YAxis dataKey={(d) => d.b} domain={[0, "dataMax"]} />
            <Tooltip labelStyle={{ color: tooltipLabelColor }} />
            <Legend />
            <Line
              type="monotone"
              dataKey={(d) => d.b}
              activeDot={{ r: 8 }}
              stroke="#666"
              name="B"
            />
          </LineChart>
        </ResponsiveContainer>
      </Flex>
    </Stack>
  );
};

export default GraficosPage;
