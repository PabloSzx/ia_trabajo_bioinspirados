import { Box, Divider, Heading, Stack, Text } from "@chakra-ui/core";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/Table";
import { EAStore } from "./ea";
import { PSOStore } from "./pso";

const TablasPage = () => {
  const dataPSO = PSOStore.hooks.useBestHistory();
  const dataEA = EAStore.hooks.useBestHistory();
  return (
    <Stack alignItems="center">
      <Heading>Tabla Convergencia PSO</Heading>
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
            {dataPSO.map(({ bestX1, bestX2, bestY, nEvals }, key) => {
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

      <Divider />

      <Heading>Tabla Convergencia EA</Heading>
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
                Generación
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataEA.map(({ elem: { x1, x2, fitness }, generacion }, key) => {
              return (
                <TableRow key={key}>
                  <TableCell>{x1}</TableCell>
                  <TableCell>{x2}</TableCell>
                  <TableCell>{fitness}</TableCell>
                  <TableCell>{generacion}</TableCell>
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
