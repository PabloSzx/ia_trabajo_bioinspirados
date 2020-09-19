import { Box, Stack, Text } from "@chakra-ui/core";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/Table";
import { PSOStore } from "./pso";

const TablasPage = () => {
  const data = PSOStore.hooks.useBestHistory();
  return (
    <Stack alignItems="center">
      <Text>Tablas</Text>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader cursor="pointer" onClick={() => {}}>
                X1
              </TableHeader>
              <TableHeader cursor="pointer" onClick={() => {}}>
                X2
              </TableHeader>
              <TableHeader cursor="pointer" onClick={() => {}}>
                Fitness
              </TableHeader>
              <TableHeader cursor="pointer" onClick={() => {}}>
                Evals
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(({ bestX1, bestX2, bestY, nEvals }, key) => {
              return (
                <TableRow key={key}>
                  <TableCell>{bestX1}</TableCell>
                  <TableCell>{bestX2}</TableCell>
                  <TableCell>{bestY}</TableCell>
                  <TableCell>{nEvals}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
};

export default TablasPage;
