import { last, random } from "lodash";
import { createStore } from "react-state-selector";

import { Stack, Text } from "@chakra-ui/core";

export const PSOStore = createStore({
  data: [
    { a: 1, b: 2 },
    { a: 2, b: 4 },
  ],
});

setInterval(() => {
  PSOStore.produce((draft) => {
    draft.data.push({
      a: (last(draft.data)?.a ?? 0) + 1,
      b: random(0, 100),
    });
  });
}, 3000);

const PSOPage = () => {
  return (
    <Stack>
      <Text>PSO</Text>
    </Stack>
  );
};

export default PSOPage;
