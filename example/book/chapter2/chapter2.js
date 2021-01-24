import { createRectangle, drawRectangle } from "./rectangle.js"
import { createCircle, drawCircle } from "./circle.js"

const width = 300
const height = 300
const canvas = document.createElement("canvas")
document.body.appendChild(canvas)

const context = canvas.getContext("2d")
canvas.height = width
canvas.width = height

const gameObjects = []

let gameObjectSelectedIndex = -1

document.addEventListener("keydown", (keydownEvent) => {
  const { code } = keydownEvent

  if (code === "KeyF") {
    const rectangle = createRectangle({
      center: {
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.8,
      },
      width: Math.random() * 30 + 10,
      height: Math.random() * 30 + 10,
    })
    drawRectangle(rectangle, context)
    gameObjects.push(rectangle)
  }

  if (code === "KeyG") {
    const circle = createCircle({
      center: {
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.8,
      },
      radius: Math.random() * 10 + 20,
    })
    drawCircle(circle, context)
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
})

const uiDebug = document.createElement("div")
document.body.appendChild(uiDebug)

const updateUIDebug = () => {
  uiDebug.innerHTML = `
<fieldset>
  <legend>Selected Object</legend>
  <ul style="margin:-10px">
    <li>
      Id: ${gameObjectSelectedIndex}
    </li>
    <li>
      Center: ${
        gameObjectSelectedIndex === -1
          ? `NA`
          : `${gameObjects[gameObjectSelectedIndex].center.x.toPrecision(3)},${gameObjects[
              gameObjectSelectedIndex
            ].center.y.toPrecision(3)}`
      }
    </li>
  </ul>
</fieldset>

<p>
  Number of game objects: ${gameObjects.length}
</p>

<fieldset>
  <legend>Control of selected object</legend>
  <ul style="margin:-10px">
    <li>
      <b>Num</b> or <b>Up/Down Arrow</b>: SelectObject
    </li>
    <li>
      <b>F/G</b>: Spawn [Rectangle/Circle] at random location
    </li>
  </ul>
</fieldset>`
}

const updateCanvas = () => {
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

const runGameLoop = () => {
  requestAnimationFrame(function () {
    runGameLoop()
  })
  updateUIDebug()
  updateCanvas()
}
runGameLoop()
