import { createGameEngine } from "./engine/engine.js"
import { registerPageLifecyle } from "./page/page-lifecyle.js"
import { demoBloc } from "./gridix/demo.js"

// let gameObjectSelected = null
const world = demoBloc()
const canvas = document.createElement("canvas")
canvas.width = world.width
canvas.height = world.height
document.querySelector("#app").appendChild(canvas)
const context = canvas.getContext("2d")

const gameEngine = createGameEngine({
  framePerSecond: 60,
  update: (stepInfo) => {
    world.update(stepInfo)
  },

  draw: (stepInfo) => {
    world.draw(stepInfo, context)
  },
})
window.addEventListener("error", () => {
  gameEngine.stopGameLoop()
})
registerPageLifecyle({
  active: () => {
    gameEngine.resumeGameLoop()
    document.title = "active"
  },
  passive: () => {
    gameEngine.resumeGameLoop()
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
  { timeout: 200 },
)

// canvas.addEventListener("click", (clickEvent) => {
//   const clickPoint = {
//     x: clickEvent.offsetX,
//     y: clickEvent.offsetY,
//   }
//   const gameObjectUnderClick = world.gameObjectFromPoint(clickPoint)
//   if (gameObjectUnderClick) {
//     gameObjectSelected = gameObjectUnderClick
//   }
// })
