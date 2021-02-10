import { createGameEngine } from "./engine/engine.js"
import { registerPageLifecyle } from "./page/page-lifecyle.js"
import { createGridixWorld } from "./gridix/gridix.world.js"

// let gameObjectSelected = null
const world = createGridixWorld()
window.world = world

const gameEngine = createGameEngine({
  framePerSecond: 60,
  update: (stepInfo) => {
    world.update(stepInfo)
  },

  draw: (stepInfo) => {
    world.draw(stepInfo)
  },
})
window.addEventListener("error", (errorEvent) => {
  console.error(errorEvent.message)
  gameEngine.stopGameLoop()
})
registerPageLifecyle({
  active: () => {
    if (!world.devtools.opened) {
      gameEngine.resumeGameLoop()
    }
    document.title = "active"
  },
  passive: () => {
    if (!world.devtools.opened) {
      gameEngine.resumeGameLoop()
    }
    document.title = "passive"
  },
  hidden: () => {
    gameEngine.pauseGameLoop()
    document.title = "hidden"
  },
  frozen: () => {
    gameEngine.pauseGameLoop()
  },
})
// the first loop of the game engine is likely more expensive than the others
// - internal logic might setup things
// - browser might realize we will or just have created a lot of objects
// so wait a bit for browser to be peaceful before starting the game engine
window.requestIdleCallback(
  () => {
    gameEngine.startGameLoop()
  },
  { timeout: 800 },
)

window.gameEngine = gameEngine
