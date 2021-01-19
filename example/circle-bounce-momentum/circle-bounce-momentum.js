import { createWorld } from "src/world/world.js"
import { createCircle } from "src/unit/unit.circle.js"
import { createRectangle } from "src/unit/unit.rectangle.js"

const units = [
  createRectangle({
    isBounceEnabled: true,
    x: 10,
    y: 10,
    width: 90,
    height: 250,
    vx: 40,
    vy: 5,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createCircle({
    isBounceEnabled: true,
    x: 250,
    y: 50,
    radius: 25,
    vx: 0,
    vy: -50,
    tick: ({ isColliding }) => {
      return {
        fillStyle: isColliding ? "red" : "green",
      }
    },
  }),
  createRectangle({
    isBounceEnabled: true,
    x: 250,
    y: 300,
    width: 30,
    height: 60,
    vx: 100,
    vy: -50,
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
    x: 90,
    y: 250,
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
