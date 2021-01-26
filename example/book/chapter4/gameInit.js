import { createRectangle } from "./rectangle.js"
import { createCircle } from "./circle.js"

export const gameInit = ({ gameObjects, width, height }) => {
  const circleA = createCircle({
    centerX: 250,
    centerY: 50,
    radius: 20,
    velocityX: 100,
    velocityY: 200,
    mass: 10,
  })
  gameObjects.push(circleA)
  // const circleB = createCircle({
  //   centerX: 120,
  //   centerY: 60,
  //   radius: 20,
  //   mass: 5,
  //   velocityX: -200,
  // })
  // gameObjects.push(circleB)

  // const rectangleA = createRectangle({
  //   centerX: 0,
  //   centerY: 150,
  //   width: 20,
  //   height: 20,
  //   velocityX: 200,
  //   velocity: 10,
  //   mass: 5,
  // })
  // gameObjects.push(rectangleA)
  // const rectangleB = createRectangle({
  //   centerX: 220,
  //   centerY: 160,
  //   width: 20,
  //   height: 20,
  //   mass: 10,
  //   velocityX: -200,
  //   velocityY: -30,
  // })
  // gameObjects.push(rectangleB)

  const worldBoundarySize = 3

  const worldBoundaryProps = {
    mass: Infinity,
    // fillStyle: "green",
    // boundingBox: null,
    boundingBox: "auto",
  }
  const left = createRectangle({
    name: "world-boundary-left",
    centerX: -worldBoundarySize / 2,
    centerY: height / 2,
    width: worldBoundarySize,
    height: height - 2,
    ...worldBoundaryProps,
  })
  gameObjects.push(left)
  const top = createRectangle({
    name: "world-boundary-top",
    centerX: width / 2,
    centerY: -worldBoundarySize / 2,
    width,
    height: worldBoundarySize,
    ...worldBoundaryProps,
  })
  gameObjects.push(top)
  const right = createRectangle({
    name: "world-boundary-right",
    centerX: width + worldBoundarySize / 2,
    centerY: height / 2,
    width: worldBoundarySize,
    height: height - 2,
    ...worldBoundaryProps,
  })
  gameObjects.push(right)
  const bottom = createRectangle({
    name: "world-boundary-bottom",
    centerX: width / 2,
    centerY: height + worldBoundarySize / 2,
    width,
    height: worldBoundarySize,
    ...worldBoundaryProps,
  })
  gameObjects.push(bottom)

  // const initialObject = createRectangle({
  //   centerX: width / 2,
  //   centerY: height / 2,
  //   width: 30,
  //   height: 30,
  //   angle: 10,
  // })
  // gameObjects.push(initialObject)
}
