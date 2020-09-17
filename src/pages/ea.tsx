import { last, random } from "lodash";
import { createStore } from "react-state-selector";

import { Stack, Text } from "@chakra-ui/core";

export const EAStore = createStore({
  data: [
    { a: 1, b: 2 },
    { a: 2, b: 4 },
  ],
});

setInterval(() => {
  EAStore.produce((draft) => {
    draft.data.push({
      a: (last(draft.data)?.a ?? 0) + 1,
      b: random(0, 100),
    });
  });
}, 1000);

const EAPage = () => {
  return (
    <Stack>
      <Text>EA</Text>
    </Stack>
  );
};

export default EAPage;
