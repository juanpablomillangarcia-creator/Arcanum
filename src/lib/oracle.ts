// Oracle logic — ported from arcanum-41.html (askOracle / oracleRoll, ~line 36256).

import { randInt } from "@/src/lib/dice";

export type Odds = "even" | "likely" | "unlikely";

export interface OracleAnswer { roll: number; result: string; twist: string | null; }

export function askOracle(odds: Odds): OracleAnswer {
  const roll = randInt(1, 20);
  const mod = odds === "likely" ? 4 : odds === "unlikely" ? -4 : 0;
  const score = roll + mod;
  let result: string;
  if (score <= 3) result = "No, y además…";
  else if (score <= 8) result = "No";
  else if (score <= 10) result = "No, pero…";
  else if (score <= 12) result = "Sí, pero…";
  else if (score <= 17) result = "Sí";
  else result = "Sí, y además…";

  let twist: string | null = null;
  if (roll === 20) twist = "✦ Giro del destino: ocurre algo inesperado y a favor.";
  else if (roll === 1) twist = "↯ Giro del destino: algo se tuerce de forma inesperada.";

  return { roll, result, twist };
}

// "Bag of holding" draw: shuffle the full list, draw without repeats until empty,
// avoiding an immediate repeat of the last shown value.
const bags: Record<string, string[]> = {};

export function drawFromTable(id: string, list: string[], last?: string): string {
  let bag = bags[id];
  if (!bag || bag.length === 0) {
    bag = list.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (bag.length > 1 && last && bag[bag.length - 1] === last) {
      [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    bags[id] = bag;
  }
  return bag.pop() as string;
}
