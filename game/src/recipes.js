// Golden Ladle recipes: what each ingredient is, what work it needs, and the
// four dishes the order board asks for. A dish is a set of finished items;
// an item is finished when its prep matches the recipe's need.

// The nine ingredients on the counter, in bin order. `prep` is the work the
// ingredient needs before it can go on a plate: none, chop, grill or boil.
// `key` is the keyboard shortcut for its bin.
export const INGREDIENTS = [
  { kind: 'bun', label: 'Bun', prep: 'none', key: '1' },
  { kind: 'patty', label: 'Patty', prep: 'grill', key: '2' },
  { kind: 'lettuce', label: 'Lettuce', prep: 'chop', key: '3' },
  { kind: 'tomato', label: 'Tomato', prep: 'chop', key: '4' },
  { kind: 'onion', label: 'Onion', prep: 'chop', key: '5' },
  { kind: 'mushroom', label: 'Mushroom', prep: 'chop', key: '6' },
  { kind: 'cheese', label: 'Cheese', prep: 'none', key: '7' },
  { kind: 'egg', label: 'Egg', prep: 'grill', key: '8' },
  { kind: 'pasta', label: 'Pasta', prep: 'boil', key: '9' },
];

export const INGREDIENT_BY_KIND = Object.fromEntries(INGREDIENTS.map((ing) => [ing.kind, ing]));

/** The finished form of an ingredient: 'bun' stays 'bun', 'patty' becomes 'patty-grilled'. */
export function finishedKey(kind) {
  const prep = INGREDIENT_BY_KIND[kind].prep;
  if (prep === 'chop') return `${kind}-chopped`;
  if (prep === 'grill') return `${kind}-grilled`;
  if (prep === 'boil') return `${kind}-boiled`;
  return kind;
}

/** Which station does the prep: chop board, grill or pot. */
export function stationForPrep(prep) {
  if (prep === 'chop') return 'chop';
  if (prep === 'grill') return 'grill';
  if (prep === 'boil') return 'pot';
  return null;
}

/** Seconds a station takes to finish the prep. */
export function prepSeconds(prep) {
  if (prep === 'chop') return 1.6;
  if (prep === 'grill') return 3.2;
  if (prep === 'boil') return 4.0;
  return 0;
}

// The four dishes. `needs` lists finished item keys; `price` is the base pay.
export const RECIPES = [
  {
    id: 'burger',
    name: 'Sunny Burger',
    needs: ['bun', 'patty-grilled', 'lettuce-chopped', 'tomato-chopped'],
    price: 120,
    blurb: 'Bun, grilled patty, lettuce, tomato',
  },
  {
    id: 'salad',
    name: 'Garden Salad',
    needs: ['lettuce-chopped', 'tomato-chopped', 'onion-chopped', 'cheese'],
    price: 90,
    blurb: 'Lettuce, tomato, onion, cheese',
  },
  {
    id: 'pasta',
    name: 'Mushroom Pasta',
    needs: ['pasta-boiled', 'mushroom-chopped', 'cheese'],
    price: 110,
    blurb: 'Boiled pasta, mushroom, cheese',
  },
  {
    id: 'omelette',
    name: 'Golden Omelette',
    needs: ['egg-grilled', 'cheese', 'mushroom-chopped'],
    price: 100,
    blurb: 'Grilled egg, cheese, mushroom',
  },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

/** A fresh order ticket: a recipe, a patience clock, and a stable id. */
export function makeOrder(id, recipeId, patience) {
  return { id, recipeId, patience, maxPatience: patience };
}

/** Do the plate's finished items match the order exactly, as a multiset? */
export function plateMatchesOrder(plateKeys, order) {
  const needs = [...RECIPE_BY_ID[order.recipeId].needs].sort();
  const have = [...plateKeys].sort();
  if (needs.length !== have.length) return false;
  return needs.every((key, i) => key === have[i]);
}

/** Which open order, if any, does this plate complete? The first match wins. */
export function findMatchingOrder(plateKeys, orders) {
  for (const order of orders) {
    if (plateMatchesOrder(plateKeys, order)) return order;
  }
  return null;
}

/** The finished item keys on a plate, from its items. */
export function plateKeys(plate) {
  return plate.map((item) => item.key);
}
