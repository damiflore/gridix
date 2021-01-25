import { createRectangle } from "./rectangle.js"
import { createCircle } from "./circle.js"

export const gameInit = ({ gameObjects, width, height }) => {
  const circleA = createCircle({
    centerX: 50,
    centerY: 50,
    radius: 20,
  })
  gameObjects.push(circleA)
  const circleB = createCircle({
    centerX: 60,
    centerY: 60,
    radius: 20,
  })
  gameObjects.push(circleB)

  const circleC = createCircle({
    centerX: 110,
    centerY: 110,
    radius: 25,
  })
  gameObjects.push(circleC)
  const circleD = createCircle({
    centerX: 100,
    centerY: 100,
    radius: 20,
  })
  gameObjects.push(circleD)

  const up = createRectangle({
    name: "world-boundary-up",
    centerX: width / 2,
    centerY: 0,
    width,
    height: 3,
    boundRadius: 0,
  })
  gameObjects.push(up)
  const down = createRectangle({
    name: "world-boundary-down",
    centerX: width / 2,
    centerY: height,
    width,
    height: 3,
    boundRadius: 0,
  })
  gameObjects.push(down)
  const left = createRectangle({
    name: "world-boundary-left",
    centerX: 0,
    centerY: height / 2,
    width: 3,
    height,
    boundRadius: 0,
  })
  gameObjects.push(left)
  const right = createRectangle({
    name: "world-boundary-right",
    centerX: width,
    centerY: height / 2,
    width: 3,
    height,
    boundRadius: 0,
  })
  gameObjects.push(right)

  const initialObject = createRectangle({
    centerX: width / 2,
    centerY: height / 2,
    width: 30,
    height: 30,
    angle: 10,
  })
  gameObjects.push(initialObject)
}
