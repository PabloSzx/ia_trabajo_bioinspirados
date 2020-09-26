import { useDebounce } from "react-use";

import { Box, FormLabel, Input, Stack } from "@chakra-ui/core";

import { ToggleTheme } from "../components/ToggleTheme";
import { EAStore } from "./ea";
import { PSOStore } from "./pso";

const IndexPage = () => {
  const psoSeed = PSOStore.hooks.useRandom().seed;
  const eaSeed = EAStore.hooks.useRandom().seed;
  useDebounce(
    () => {
      localStorage.setItem("psoRandomSeed", psoSeed);
      localStorage.setItem("eaRandomSeed", eaSeed);
    },
    500,
    [psoSeed, eaSeed]
  );
  return (
    <Stack alignItems="center">
      <Box paddingTop="10px" d="inline-block">
        <ToggleTheme />
      </Box>
      <Box
        marginTop="10px"
        d="inline-block"
        shadow="md"
        borderWidth="1px"
        borderRadius="5px"
        padding="10px"
      >
        <FormLabel>PSO Seed</FormLabel>
        <Input
          value={psoSeed}
          onChange={({ target: { value: seed } }) => {
            PSOStore.actions.init({
              seed,
            });
          }}
        />
      </Box>
      <Box
        marginTop="10px"
        d="inline-block"
        shadow="md"
        borderWidth="1px"
        borderRadius="5px"
        padding="10px"
      >
        <FormLabel>EA Seed</FormLabel>
        <Input
          value={eaSeed}
          onChange={({ target: { value: seed } }) => {
            EAStore.actions.init({
              seed,
            });
          }}
        />
      </Box>
    </Stack>
  );
};

export default IndexPage;
