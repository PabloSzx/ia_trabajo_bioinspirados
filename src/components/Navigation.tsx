import { useRouter } from "next/router";
import { useEffect } from "react";

import { Flex, Tab, TabList, Tabs } from "@chakra-ui/core";

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
  const { pathname, push, prefetch } = useRouter();
  const tabIndex = Routes.findIndex((v) => v.pathname === pathname);

  useEffect(() => {
    Routes.forEach(({ pathname }) => prefetch(pathname));
  }, [prefetch]);

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
