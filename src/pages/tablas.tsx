import { Box, Stack, Text } from "@chakra-ui/core";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/Table";
import { EAStore } from "./ea";

const TablasPage = () => {
  const data = EAStore.useStore().data;
  return (
    <Stack alignItems="center">
      <Text>Tablas</Text>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader cursor="pointer" onClick={() => {}}>
                A
              </TableHeader>
              <TableHeader cursor="pointer" onClick={() => {}}>
                B
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(({ a, b }, key) => {
              return (
                <TableRow key={key}>
                  <TableCell>{a}</TableCell>
                  <TableCell>{b}</TableCell>
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
