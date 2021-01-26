import { moveGameObject, rotateGameObject } from "./gameObject.js"
import { createRectangle, drawRectangle } from "./rectangle.js"
import { createCircle, drawCircle } from "./circle.js"
import { gameInit } from "./gameInit.js"
import { updateDevtool } from "./devtool.js"
import { updatePhysicForArcadeGame } from "./physic.js"

const width = 400
const height = 250
const canvas = document.createElement("canvas")
canvas.height = height
canvas.width = width
document.querySelector("#container").appendChild(canvas)

const context = canvas.getContext("2d")
const gameObjects = []
let gameObjectSelectedIndex = 0

gameInit({
  width,
  height,
  gameObjects,
})

const updateState = (options) => {
  gameObjects.forEach((gameObject) => {
    gameObject.updateState(gameObject)
  })
  updatePhysicForArcadeGame({ gameObjects, context, ...options })
}

const updateDraw = () => {
  context.clearRect(0, 0, width, height)
  gameObjects.forEach((gameObject, index) => {
    context.strokeStyle = "blue"
    if (index === gameObjectSelectedIndex) {
      context.strokeStyle = "red"
    }
    if (gameObject.radius) {
      drawCircle(gameObject, context)
    } else {
      drawRectangle(gameObject, context)
    }
  })
}

let previousMs
const framePerSecond = 60
const secondsPerFrame = 1 / framePerSecond
const msPerFrame = secondsPerFrame * 1000
const maxUpdatesPerFrame = 30
let gravityY = 0
let frame
let running = false

const stopGameLoop = () => {
  window.cancelAnimationFrame(frame)
  running = false
  previousMs = undefined
}

const runGameLoop = () => {
  running = true
  frame = requestAnimationFrame(() => {
    if (running) {
      runGameLoop()
    }
  })
  const currentMs = Date.now()
  // when it has never been called, previousMs is undefined
  // in that case run it once
  const ellapsedMs = previousMs ? currentMs - previousMs : msPerFrame
  previousMs = currentMs

  // for the rest of the book draw comes before update
  // but this is for convenience and should be moved back after update in real circumstances
  updateDraw()

  const updateIdealCount = Math.floor(ellapsedMs / msPerFrame)
  let updateCount
  if (updateIdealCount > maxUpdatesPerFrame) {
    console.warn(
      `too many updates to perform, only ${maxUpdatesPerFrame} out of ${updateIdealCount} iterations will be done`,
    )
    updateCount = maxUpdatesPerFrame
  } else {
    updateCount = updateIdealCount
  }
  while (updateCount--) {
    updateState({
      ellapsedSeconds: secondsPerFrame,
      gravityY,
    })
  }

  const gameObjectSelected =
    gameObjectSelectedIndex === -1 ? null : gameObjects[gameObjectSelectedIndex]
  updateDevtool({
    textContents: {
      "frame-per-second": Math.round(1000 / ellapsedMs),
      "game-objects-length": gameObjects.length,
      "game-object-selected-id": gameObjectSelectedIndex,
      "game-object-selected-center-x": gameObjectSelected
        ? gameObjectSelected.centerX.toPrecision(3)
        : "",
      "game-object-selected-center-y": gameObjectSelected
        ? gameObjectSelected.centerY.toPrecision(3)
        : "",
      "game-object-selected-angle": gameObjectSelected
        ? gameObjectSelected.angle.toPrecision(3)
        : "",
      "game-object-selected-velocity-x": gameObjectSelected
        ? gameObjectSelected.velocityX.toPrecision(3)
        : "",
      "game-object-selected-velocity-y": gameObjectSelected
        ? gameObjectSelected.velocityY.toPrecision(3)
        : "",
      "game-object-selected-velocity-angle": gameObjectSelected
        ? gameObjectSelected.velocityAngle.toPrecision(3)
        : "",
      "game-object-selected-mass": gameObjectSelected ? gameObjectSelected.mass : "",
      "game-object-selected-restitution": gameObjectSelected ? gameObjectSelected.restitution : "",
      "game-object-selected-friction": gameObjectSelected ? gameObjectSelected.friction : "",
    },

    onClicks: {
      "select-prev": () => {
        if (gameObjectSelectedIndex > 0) {
          gameObjectSelectedIndex--
        }
      },
      "select-next": () => {
        if (gameObjectSelectedIndex < gameObjects.length - 1) {
          gameObjectSelectedIndex++
        }
      },
      "spawn-circle": () => {
        const circle = createCircle({
          centerX: gameObjectSelected ? gameObjectSelected.centerX : Math.random() * width * 0.8,
          centerY: gameObjectSelected ? gameObjectSelected.centerY : Math.random() * height * 0.8,
          radius: Math.random() * 10 + 20,
          canMove: true,
        })
        gameObjects.push(circle)
      },
      "spawn-rectangle": () => {
        const rectangle = createRectangle({
          centerX: gameObjectSelected ? gameObjectSelected.centerX : Math.random() * width * 0.8,
          centerY: gameObjectSelected ? gameObjectSelected.centerY : Math.random() * height * 0.8,
          width: Math.random() * 30 + 10,
          height: Math.random() * 30 + 10,
          canMove: true,
        })
        gameObjects.push(rectangle)
      },
      "move-left": () => {
        if (gameObjectSelected) {
          moveGameObject(gameObjectSelected, { x: gameObjectSelected.centerX - 10 })
        }
      },
      "move-right": () => {
        if (gameObjectSelected) {
          moveGameObject(gameObjectSelected, { x: gameObjectSelected.centerX + 10 })
        }
      },
      "move-up": () => {
        if (gameObjectSelected) {
          moveGameObject(gameObjectSelected, { y: gameObjectSelected.centerY - 10 })
        }
      },
      "move-down": () => {
        if (gameObjectSelected) {
          moveGameObject(gameObjectSelected, { y: gameObjectSelected.centerY + 10 })
        }
      },
      "rotate-decrease": () => {
        if (gameObjectSelected) {
          rotateGameObject(gameObjectSelected, gameObjectSelected.angle - 0.1)
        }
      },
      "rotate-increase": () => {
        if (gameObjectSelected) {
          rotateGameObject(gameObjectSelected, gameObjectSelected.angle + 0.1)
        }
      },
      "velocity-x-decrease": () => {
        if (gameObjectSelected) {
          gameObjectSelected.velocityX -= 1
        }
      },
      "velocity-x-increase": () => {
        if (gameObjectSelected) {
          gameObjectSelected.velocityX += 1
        }
      },
      "velocity-y-decrease": () => {
        if (gameObjectSelected) {
          gameObjectSelected.velocityY -= 1
        }
      },
      "velocity-y-increase": () => {
        if (gameObjectSelected) {
          gameObjectSelected.velocityY += 1
        }
      },
      "velocity-angle-decrease": () => {
        if (gameObjectSelected) {
          gameObjectSelected.velocityAngle -= 0.1
        }
      },
      "velocity-angle-increase": () => {
        if (gameObjectSelected) {
          gameObjectSelected.velocityAngle += 0.1
        }
      },
      "mass-negative": () => {
        if (gameObjectSelected) {
          gameObjectSelected.mass = -1
        }
      },
      "mass-positive": () => {
        if (gameObjectSelected) {
          gameObjectSelected.mass = 1
        }
      },
      "gravity-enable": () => {
        gravityY = 10
      },
      "gravity-disable": () => {
        gravityY = 0
      },
      "excite": () => {
        gameObjects.forEach((gameObject) => {
          gameObject.velocityX = Math.random() * 500 - 250
          gameObject.velocityY = Math.random() * 500 - 250
        })
      },
      "reset": () => {
        gameObjects.splice(5, gameObjects.length)
        gameObjectSelectedIndex = 4
      },
    },
  })
}
runGameLoop()
window.addEventListener("error", () => {
  stopGameLoop()
})

window.gameObjects = gameObjects
