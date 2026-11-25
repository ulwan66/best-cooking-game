# Golden Ladle — Rush Hour Kitchen

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ulwan66/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ulwan66/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A timed order cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). You run a small kitchen through a 150-second rush: orders land on the board, you grab ingredients off the counter, chop, grill and boil them, stack each dish on the plate, and ring the bell before the customer walks out.

## How to play

- **Orders** appear on the board on the left, each with its recipe, its price, and a patience bar. Serve before the bar runs out.
- **Ingredients** sit on the counter. Click a bin, or press keys 1-9, to take one into your tray (three slots).
- **Stations** do the work: the chopping board cuts vegetables, the grill cooks patties and eggs (don't leave them on or they burn), the pot boils pasta. Click a station with the right raw ingredient in your tray to start it, click again when it is done to collect it.
- **Plate**: click it with a full tray to move the food onto the plate. A green tag tells you when the plate matches an order. Click it with empty hands to take the top item back off.
- **Serve**: ring the bell at the serving window. A matching dish pays its price plus a patience tip and a combo bonus. A wrong plate is cleared and the combo resets.
- **Shift**: 150 seconds. Three walk-outs end the shift early. Combos pay extra, so serve fast and in a row.

## The dishes

- **Sunny Burger** — bun, grilled patty, chopped lettuce, chopped tomato ($120)
- **Garden Salad** — chopped lettuce, chopped tomato, chopped onion, cheese ($90)
- **Mushroom Pasta** — boiled pasta, chopped mushroom, cheese ($110)
- **Golden Omelette** — grilled egg, cheese, chopped mushroom ($100)

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network requests, no install: `game/` is plain static files. Sounds are synthesized with WebAudio (M toggles mute, P pauses).

## Screenshots

Four real renders of the game, captured from `game/index.html` in a headless browser (`screenshots/`):

1. `1-cover.jpg` — the kitchen mid-rush: three orders on the board, lettuce chopping, a patty on the grill, a burger half-built on the plate
2. `2-chop.jpg` — a tomato mid-chop, tray loaded, two orders waiting
3. `3-assemble.jpg` — the burger three quarters stacked, chopped tomato in the tray
4. `4-serve.jpg` — the bell just rung, SERVED! on the window, score 485, combo x4

## Play-tested

The full loop was driven through the real game code (Node): chop and grill run in parallel, collecting works, the plate stacks in order, serving a finished Sunny Burger paid $163 (price + patience tip), serving Mushroom Pasta next pushed the combo to x2, a wrong plate is cleared and resets the combo, an expired order costs a heart, food left on the grill too long burns and is tossed, and the shift ends at 0:00. No console errors on load.

## Files

- `game/index.html` — the page, one canvas
- `game/src/config.js` — layout, palette, timings
- `game/src/recipes.js` — ingredients, prep rules, the four dishes
- `game/src/world.js` — the shift's state and rules
- `game/src/input.js` — mouse and keyboard
- `game/src/render.js` — all the kitchen art, drawn with canvas paths
- `game/src/sound.js` — WebAudio effects
- `game/src/shots.js` — the four screenshot scenes
- `game/src/main.js` — boot and game loop
- `main.ts` — hands the entry in (copies `game/` and `screenshots/`, writes `dossier.json`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT. See LICENSE.
