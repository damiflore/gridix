import { createRectangle } from "./rectangle.js"

export const gameInit = ({ gameObjects, width, height }) => {
  const initialObject = createRectangle({
    centerX: width / 2,
    centerY: height / 2,
    width: 30,
    height: 30,
    canMove: false,
  })
  gameObjects.push(initialObject)

  const up = createRectangle({
    name: "world-boundary-up",
    centerX: width / 2,
    centerY: 0,
    width,
    height: 3,
    canMove: false,
  })
  gameObjects.push(up)
  const down = createRectangle({
    name: "world-boundary-down",
    centerX: width / 2,
    centerY: height,
    width,
    height: 3,
    canMove: false,
  })
  gameObjects.push(down)
  const left = createRectangle({
    name: "world-boundary-left",
    centerX: 0,
    centerY: height / 2,
    width: 3,
    height,
    canMove: false,
  })
  gameObjects.push(left)
  const right = createRectangle({
    name: "world-boundary-right",
    centerX: width,
    centerY: height / 2,
    width: 3,
    height,
    canMove: false,
  })
  gameObjects.push(right)
}
