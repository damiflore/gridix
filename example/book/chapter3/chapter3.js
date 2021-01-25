import { moveGameObject, rotateGameObject } from "./gameObject.js"
import { createRectangle, drawRectangle } from "./rectangle.js"
import { createCircle, drawCircle } from "./circle.js"
import { gameInit } from "./gameInit.js"
import { updateDevtool } from "./devtool.js"

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

document.addEventListener("keydown", (keydownEvent) => {
  const { code } = keydownEvent

  const gameObjectSelected =
    gameObjectSelectedIndex === -1 ? null : gameObjects[gameObjectSelectedIndex]

  if (code === "KeyF") {
    const rectangle = createRectangle({
      centerX: gameObjectSelected ? gameObjectSelected.centerX : Math.random() * width * 0.8,
      centerY: gameObjectSelected ? gameObjectSelected.centerY : Math.random() * height * 0.8,
      width: Math.random() * 30 + 10,
      height: Math.random() * 30 + 10,
      canMove: true,
    })
    gameObjects.push(rectangle)
  }

  if (code === "KeyG") {
    const circle = createCircle({
      centerX: gameObjectSelected ? gameObjectSelected.centerX : Math.random() * width * 0.8,
      centerY: gameObjectSelected ? gameObjectSelected.centerY : Math.random() * height * 0.8,
      radius: Math.random() * 10 + 20,
      canMove: true,
    })
    gameObjects.push(circle)
  }

  if (code.startsWith("Digit")) {
    const keyDigit = parseInt(code.slice("Digit".length))
    if (keyDigit < gameObjects.length - 1) {
      gameObjectSelectedIndex = keyDigit
    }
  }

  if (code === "ArrowUp") {
    if (gameObjectSelectedIndex > 0) {
      gameObjectSelectedIndex--
    }
  }

  if (code === "ArrowDown") {
    if (gameObjectSelectedIndex < gameObjects.length - 1) {
      gameObjectSelectedIndex++
    }
  }

  if (code === "KeyW") {
    if (gameObjectSelected) {
      moveGameObject(gameObjectSelected, { y: gameObjectSelected.centerY - 10 })
    }
  }
  if (code === "KeyS") {
    if (gameObjectSelected) {
      moveGameObject(gameObjectSelected, { y: gameObjectSelected.centerY + 10 })
    }
  }
  if (code === "KeyA") {
    if (gameObjectSelected) {
      moveGameObject(gameObjectSelected, { x: gameObjectSelected.centerX - 10 })
    }
  }
  if (code === "KeyD") {
    if (gameObjectSelected) {
      moveGameObject(gameObjectSelected, { x: gameObjectSelected.centerX + 10 })
    }
  }

  if (code === "KeyQ") {
    if (gameObjectSelected) {
      rotateGameObject(gameObjectSelected, gameObjectSelected.angle - 0.1)
    }
  }

  if (code === "KeyE") {
    if (gameObjectSelected) {
      rotateGameObject(gameObjectSelected, gameObjectSelected.angle + 0.1)
    }
  }
})

const updateState = () => {
  gameObjects.forEach((gameObject) => {
    gameObject.updateState(gameObject)

    if (gameObject.canMove && gameObject.centerY < height) {
      moveGameObject(gameObject, { y: gameObject.centerY + 1 })
    }
  })
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

let previousMs = Date.now()
const framePerSecond = 60
const msPerFrame = 1000 / framePerSecond
let lagMs = 0

const runGameLoop = () => {
  requestAnimationFrame(() => {
    runGameLoop()
  })
  const currentMs = Date.now()
  const ellapsedMs = currentMs - previousMs
  previousMs = currentMs
  lagMs += ellapsedMs

  // update state approriate number of times until
  // it is updated enough times
  while (lagMs >= msPerFrame) {
    lagMs -= msPerFrame
    updateState()
  }

  updateDevtool({
    gameObjects,
    gameObjectSelectedIndex,
  })
  updateDraw()
}
runGameLoop()

window.gameObjects = gameObjects
