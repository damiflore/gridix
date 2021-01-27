/**
TODO

- see if rectangle and circle (at least some part) could go into geometry/
the idea is that if we want to put a circle or a rectangle in the game it's a less generic name we'll use
ça serais cool qu'en gros un objet de jeu puisse etre associé a une forme géométrique (genre dans hitbox)
et comme ça l'objet de jeu lui meme ne connais pas sa forme ? ou en tous cas on peut réutiliser le concept
générique de forme sans avoir a le mixer au game object ?

- plein de unit tests ou on teste le moteur physique (voir comment faire)
ou au moin de petit fichier html pour tester des cas concrets

*/

// import { drawCollisionInfo } from "./draw/draw.js"
import { updateGameObjectPosition, updateGameObjectVelocity } from "./physic/physic.movement.js"
import { updatePhysicForArcadeGame } from "./physic/physic.js"
import { PHYSIC_CONSTANTS } from "./physic/physic.constants.js"
import { createRectangle, createCircle } from "./game/shape.js"
import { gameInit } from "./gameInit.js"
import { updateDevtool } from "./devtool.js"
import { createGameEngine } from "./engine/engine.js"
import { drawCollisionInfo } from "./draw/draw.js"

const width = 800
const height = 450
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

const collisionInfos = []
const gameEngine = createGameEngine({
  framePerSecond: 60,
  updateState: ({ ellapsedSeconds }) => {
    gameObjects.forEach((gameObject) => {
      gameObject.updateState(gameObject)
    })

    collisionInfos.length = 0
    updatePhysicForArcadeGame({
      gameObjects,
      ellapsedSeconds,
      collisionCallback: ({ collisionInfo }) => {
        collisionInfos.push(collisionInfo)
      },
      collisionPositionResolution: false,
      collisionVelocityImpact: true,
    })
  },

  updateDraw: ({ ellapsedSeconds }) => {
    context.clearRect(0, 0, width, height)
    context.strokeStyle = "blue"
    gameObjects.forEach((gameObject) => {
      gameObject.updateDraw(gameObject, context)
    })

    collisionInfos.forEach((collisionInfo) => {
      drawCollisionInfo(collisionInfo, context)
    })

    const gameObjectSelected =
      gameObjectSelectedIndex === -1 ? null : gameObjects[gameObjectSelectedIndex]
    updateDevtool({
      textContents: {
        "frame-per-second": Math.round(1 / ellapsedSeconds),
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
        "game-object-selected-restitution": gameObjectSelected
          ? gameObjectSelected.restitution
          : "",
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
            rigid: true,
          })
          gameObjects.push(circle)
        },
        "spawn-rectangle": () => {
          const rectangle = createRectangle({
            centerX: gameObjectSelected ? gameObjectSelected.centerX : Math.random() * width * 0.8,
            centerY: gameObjectSelected ? gameObjectSelected.centerY : Math.random() * height * 0.8,
            width: Math.random() * 30 + 10,
            height: Math.random() * 30 + 10,
            rigid: true,
          })
          gameObjects.push(rectangle)
        },
        "move-left": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { x: gameObjectSelected.centerX - 10 })
          }
        },
        "move-right": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { x: gameObjectSelected.centerX + 10 })
          }
        },
        "move-up": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { y: gameObjectSelected.centerY - 10 })
          }
        },
        "move-down": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { y: gameObjectSelected.centerY + 10 })
          }
        },
        "rotate-decrease": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { angle: gameObjectSelected.angle - 0.1 })
          }
        },
        "rotate-increase": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { angle: gameObjectSelected.angle + 0.1 })
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
          PHYSIC_CONSTANTS.forceYAmbient = 20
        },
        "gravity-disable": () => {
          PHYSIC_CONSTANTS.forceYAmbient = 0
        },
        "excite": () => {
          gameObjects.forEach((gameObject) => {
            updateGameObjectVelocity(gameObject, {
              x: Math.random() * 500 - 250,
              y: Math.random() * 500 - 250,
            })
          })
        },
        "reset": () => {
          gameObjects.splice(5, gameObjects.length)
          gameObjectSelectedIndex = 4
        },
      },
    })
  },
})
PHYSIC_CONSTANTS.forceYAmbient = 20
window.addEventListener("error", () => {
  gameEngine.stopGameLoop()
})
gameEngine.startGameLoop()

window.gameObjects = gameObjects
