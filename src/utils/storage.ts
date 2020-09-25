import { IS_BROWSER } from "./constants";

export const getLocalStorage = (key: string, defaultValue: string) => {
  if (IS_BROWSER) {
    return localStorage.getItem(key) ?? defaultValue;
  }
  return defaultValue;
};
