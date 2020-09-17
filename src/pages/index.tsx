import { Box, Stack } from "@chakra-ui/core";

import { ToggleTheme } from "../components/ToggleTheme";

const IndexPage = () => {
  return (
    <Stack alignItems="center">
      <Box paddingTop="10px" d="inline-block">
        <ToggleTheme />
      </Box>
    </Stack>
  );
};

export default IndexPage;
