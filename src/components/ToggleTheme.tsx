import { Button, useColorMode } from "@chakra-ui/core";

export const ToggleTheme = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Button onClick={toggleColorMode}>Set {colorMode === "light" ? "Dark" : "Light"} Mode</Button>
    </>
  );
};
