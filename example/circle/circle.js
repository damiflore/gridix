import { createWorld } from "src/world/world.js"
import { createCircle } from "src/unit/unit.circle.js"

const units = [
  createCircle({
    x: 250,
    y: 50,
    radius: 25,
    vx: 0,
    vy: 50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createCircle({
    x: 250,
    y: 300,
    radius: 25,
    vx: 0,
    vy: -50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createCircle({
    x: 150,
    y: 0,
    radius: 25,
    vx: 50,
    vy: 50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createCircle({
    x: 350,
    y: 75,
    radius: 25,
    vx: -50,
    vy: 50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createCircle({
    x: 300,
    y: 300,
    radius: 25,
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
