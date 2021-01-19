import { createWorld } from "src/world/world.js"
import { createCircle } from "src/unit/unit.circle.js"

const units = [
  createCircle({
    isBounceEnabled: true,
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
    isBounceEnabled: true,
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
    isBounceEnabled: true,
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
    isBounceEnabled: true,
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
    isBounceEnabled: true,
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

  createCircle({
    isBounceEnabled: true,
    x: 50,
    y: 50,
    radius: 50,
    mass: 4,
    vx: 50,
    vy: 50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createCircle({
    isBounceEnabled: true,
    x: 350,
    y: 350,
    radius: 60,
    mass: 5,
    vx: -20,
    vy: -50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
]

const world = createWorld({
  width: 750,
  height: 400,
  units,
})

document.body.appendChild(world.canvas)
world.start()
