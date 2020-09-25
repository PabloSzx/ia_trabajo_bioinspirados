import { toInteger } from "lodash";
import Rand from "rand-seed";

export function getRandomGenerator(seed = "base") {
  const generator = new Rand(seed);

  function random(min: number, max: number, floating?: boolean) {
    floating = floating || Boolean(min % 1) || Boolean(max % 1);

    const rand = generator.next();
    let n =
      rand *
        (max -
          min +
          (floating ? parseFloat("1e-" + ((rand + "").length - 1)) : 1)) +
      min;

    if (floating) {
      return Math.min(n, max);
    }
    return toInteger(n);
  }

  function getRandomPercent() {
    return generator.next();
  }
  function getRandomX() {
    return random(-5.12, 5.12, true);
  }

  function sampleSize<T>(collection: T[], n: number) {
    const clonedCollection = [...collection];

    const sampledItems: T[] = [];

    while (sampledItems.length < n) {
      const r = random(0, clonedCollection.length - 1);

      const randItem = clonedCollection[r];
      const randItemIndex = clonedCollection.indexOf(randItem);

      if (randItemIndex !== -1) {
        clonedCollection.splice(randItemIndex, 1);
        sampledItems.push(randItem);
      } else {
        break;
      }
    }

    return sampledItems;
  }

  return {
    generator,
    seed,
    random,
    getRandomPercent,
    getRandomX,
    sampleSize,
  };
}
