import { random, range } from "lodash";
import { Circle, Layer, Stage } from "react-konva";
import { createStore } from "react-state-selector";

import { Box, Flex, Stack, useColorModeValue } from "@chakra-ui/core";

const width = 700;
const height = 700;

export const EAStore = createStore(
  {
    data: range(0, height).map((a) => ({
      a,
      b: random(0, width),
    })),
  },
  {
    actions: {
      changeRandom: () => (draft) => {
        draft.data[random(0, height - 1)].b = random(0, width);
      },
    },
  }
);

setInterval(() => {
  EAStore.actions.changeRandom();
}, 10);

const EAPage = () => {
  const data = EAStore.useStore().data;

  const bg = useColorModeValue(undefined, "white");
  const border = useColorModeValue("1px solid black", undefined);

  return (
    <Stack>
      <Flex justifyContent="center" paddingTop="20px">
        <Box bg={bg} border={border}>
          <Stage width={width} height={height}>
            <Layer>
              {data.map((v, index) => {
                return (
                  <Circle key={index} x={v.a} y={v.b} fill="red" radius={2} />
                );
              })}
            </Layer>
          </Stage>
        </Box>
      </Flex>
    </Stack>
  );
};

export default EAPage;
