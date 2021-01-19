import { createWorld } from "src/world/world.js"
import { createRectangle } from "src/unit/unit.rectangle.js"

const units = [
  createRectangle({
    x: 250,
    y: 50,
    width: 50,
    height: 50,
    vx: 0,
    vy: 50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createRectangle({
    x: 250,
    y: 300,
    width: 50,
    height: 50,
    vx: 0,
    vy: -50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createRectangle({
    x: 150,
    y: 0,
    width: 50,
    height: 50,
    vx: 50,
    vy: 50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createRectangle({
    x: 350,
    y: 75,
    width: 50,
    height: 50,
    vx: -50,
    vy: 50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createRectangle({
    x: 300,
    y: 300,
    width: 50,
    height: 50,
    vx: 50,
    vy: -50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
]

const world = createWorld({
  width: 500,
  height: 700,
  units,
})

document.body.appendChild(world.canvas)
world.start()
