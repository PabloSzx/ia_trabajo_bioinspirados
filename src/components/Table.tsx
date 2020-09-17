import { Box, BoxProps, useColorModeValue } from "@chakra-ui/core";

/**
 * Represents tabular data - that is, information presented in a
 * two-dimensional table comprised of rows and columns of cells containing
 * data. It renders a `<table>` HTML element.
 */
export function Table(props: BoxProps) {
  return (
    <Box shadow="md" rounded="lg" overflow="hidden">
      <Box as="table" width="full" {...(props as any)} />
    </Box>
  );
}

/**
 * Defines a set of rows defining the head of the columns of the table. It
 * renders a `<thead>` HTML element.
 */
export function TableHead(props: BoxProps) {
  return <Box as="thead" {...(props as any)} />;
}

/**
 * Defines a row of cells in a table. The row's cells can then be established
 * using a mix of `TableCell` and `TableHeader` elements. It renders a `<tr>`
 * HTML element.
 */
export function TableRow(props: BoxProps) {
  const color = useColorModeValue("black", "white");
  const backgroundColor = useColorModeValue("gray.20", "gray.700");

  return (
    <Box
      as="tr"
      color={color}
      backgroundColor={backgroundColor}
      {...(props as any)}
    />
  );
}

/**
 * Defines a cell as header of a group of table cells. It renders a `<th>` HTML
 * element.
 */
export function TableHeader(props: BoxProps) {
  const color = useColorModeValue("gray.600", "white");
  const backgroundColor = useColorModeValue("gray.50", "gray.600");

  return (
    <Box
      as="th"
      px="6"
      py="3"
      borderBottomWidth="1px"
      backgroundColor={backgroundColor}
      textAlign="left"
      fontSize="xs"
      color={color}
      textTransform="uppercase"
      letterSpacing="wider"
      lineHeight="1rem"
      fontWeight="medium"
      {...(props as any)}
    />
  );
}

/**
 * Encapsulates a set of table rows, indicating that they comprise the body of
 * the table. It renders a `<tbody>` HTML element.
 */
export function TableBody(props: BoxProps) {
  return <Box as="tbody" {...(props as any)} />;
}

/**
 * Defines a cell of a table that contains data. It renders a `<td>` HTML
 * element.
 */
export function TableCell(props: BoxProps) {
  return (
    <Box
      as="td"
      px="6"
      py="4"
      lineHeight="1.25rem"
      whiteSpace="nowrap"
      {...(props as any)}
    />
  );
}
