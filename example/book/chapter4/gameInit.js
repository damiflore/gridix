import { createRectangle } from "./rectangle.js"
import { createCircle } from "./circle.js"

export const gameInit = ({ gameObjects, width, height }) => {
  addTwoCollidingCircleTopLeft({ gameObjects })
  addTwoCollidingCircleCenterLeft({ gameObjects })
  addTwoCollidingRectangleTopRight({ gameObjects })

  addCircleAndRectangleCollidingBottomRight({ gameObjects })

  const up = createRectangle({
    name: "world-boundary-up",
    centerX: width / 2,
    centerY: 0,
    width,
    height: 3,
    mass: Infinity,
  })
  gameObjects.push(up)
  const down = createRectangle({
    name: "world-boundary-down",
    centerX: width / 2,
    centerY: height,
    width,
    height: 3,
    mass: Infinity,
  })
  gameObjects.push(down)
  const left = createRectangle({
    name: "world-boundary-left",
    centerX: 0,
    centerY: height / 2,
    width: 3,
    height,
    mass: Infinity,
  })
  gameObjects.push(left)
  const right = createRectangle({
    name: "world-boundary-right",
    centerX: width,
    centerY: height / 2,
    width: 3,
    height,
    mass: Infinity,
  })
  gameObjects.push(right)

  // const initialObject = createRectangle({
  //   centerX: width / 2,
  //   centerY: height / 2,
  //   width: 30,
  //   height: 30,
  //   angle: 10,
  // })
  // gameObjects.push(initialObject)
}

const addTwoCollidingCircleTopLeft = ({ gameObjects }) => {
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
}

const addTwoCollidingCircleCenterLeft = ({ gameObjects }) => {
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
}

const addTwoCollidingRectangleTopRight = ({ gameObjects }) => {
  const rectangleA = createRectangle({
    centerX: 270,
    centerY: 40,
    width: 40,
    height: 40,
  })
  gameObjects.push(rectangleA)
  const rectangleB = createRectangle({
    centerX: 290,
    centerY: 60,
    width: 60,
    height: 60,
  })
  gameObjects.push(rectangleB)
}

const addCircleAndRectangleCollidingBottomRight = ({ gameObjects }) => {
  const circle = createCircle({
    centerX: 150,
    centerY: 150,
    radius: 20,
  })
  gameObjects.push(circle)
  const rectangle = createRectangle({
    centerX: 170,
    centerY: 160,
    width: 40,
    height: 30,
    angle: 10,
  })
  gameObjects.push(rectangle)
}
