import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useUpdateEffect } from "react-use";

import {
  Box,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/core";

export const SliderBox = ({
  label,
  value,
  setValue,
  min,
  max,
  step,
  colorScheme = "cyan",
  onChange,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
  colorScheme?: string;
  onChange?: () => void;
}) => {
  const debouncedSetValue = useCallback(debounce(setValue, 200), [setValue]);
  const [UIValue, setUIValue] = useState(value);
  useUpdateEffect(() => {
    setUIValue(value);
  }, [value]);
  useEffect(() => {
    if (value > max) {
      setValue(max);
    } else if (value < min) {
      setValue(min);
    }
  }, [setValue, value, min, max]);
  return (
    <Flex paddingTop="10px" direction="column" alignItems="center">
      <Box
        shadow="md"
        borderWidth="1px"
        paddingY="10px"
        paddingX="20px"
        borderRadius="5px"
      >
        <Text textAlign="center">
          {label}: <b>{UIValue}</b>
        </Text>
        <Slider
          colorScheme={colorScheme}
          width="90vw"
          value={UIValue}
          onChange={(n) => {
            onChange?.();
            setUIValue(n);
            debouncedSetValue(n);
          }}
          min={min}
          max={max}
          step={step}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
    </Flex>
  );
};
