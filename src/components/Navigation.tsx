import { Flex, Tab, TabList, Tabs } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { useState } from "react";

const Routes: {
  name: string;
  pathname: string;
}[] = [
  {
    name: "Inicio",
    pathname: "/",
  },
  {
    name: "PSO",
    pathname: "/pso",
  },
  {
    name: "EA",
    pathname: "/ea",
  },
  {
    name: "Gráficos",
    pathname: "/graficos",
  },
  {
    name: "Tablas",
    pathname: "/tablas",
  },
];

export const Navigation = () => {
  const { pathname, push } = useRouter();
  const tabIndex = Routes.findIndex((v) => v.pathname === pathname);

  return (
    <Flex width="100%" justifyContent="center">
      <Tabs index={tabIndex} width="fit-content">
        <TabList>
          {Routes.map(({ name, pathname }, key) => {
            return (
              <Tab
                key={key}
                onClick={() => {
                  push(pathname);
                }}
              >
                {name}
              </Tab>
            );
          })}
        </TabList>
      </Tabs>
    </Flex>
  );
};
