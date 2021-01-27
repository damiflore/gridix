import { createRectangle, createCircle } from "./game/shape.js"

export const gameInit = ({ gameObjects, width, height, worldBounds = true }) => {
  if (worldBounds) {
    addWorldBounds({ gameObjects, width, height })
  }
  gameObjects.push(
    createRectangle({
      centerX: 500,
      centerY: 200,
      width: 400,
      height: 20,
      mass: 0,
      friction: 0.3,
      restitution: 0,
      angle: 2.8,
      rigid: true,
    }),
  )
  gameObjects.push(
    createRectangle({
      centerX: 200,
      centerY: 400,
      width: 400,
      height: 20,
      mass: 0,
      friction: 1,
      restitution: 0.5,
      rigid: true,
    }),
  )
  gameObjects.push(
    createRectangle({
      centerX: 100,
      centerY: 200,
      width: 200,
      height: 20,
      mass: 0,
      rigid: true,
    }),
  )
  gameObjects.push(
    createRectangle({
      centerX: 10,
      centerY: 360,
      width: 20,
      height: 100,
      mass: 0,
      friction: 0,
      restitution: 1,
      rigid: true,
    }),
  )

  let i = 10
  while (i--) {
    gameObjects.push(
      createRectangle({
        centerX: Math.random() * width,
        centerY: (Math.random() * height) / 2,
        width: Math.random() * 50 + 10,
        height: Math.random() * 50 + 10,
        mass: Math.random() * 30,
        friction: Math.random(),
        restitution: Math.random(),
        velocityX: Math.random() * 60 - 30,
        velocityY: Math.random() * 60 - 30,
        rigid: true,
      }),
    )
    gameObjects.push(
      createCircle({
        centerX: Math.random() * width,
        centerY: (Math.random() * height) / 2,
        radius: Math.random() * 20 + 10,
        mass: Math.random() * 30,
        friction: Math.random(),
        restitution: Math.random(),
        velocityX: Math.random() * 60 - 30,
        velocityY: Math.random() * 60 - 30,
        rigid: true,
      }),
    )
  }
}

const addWorldBounds = ({ gameObjects, width, height }) => {
  const worldBoundarySize = 3
  const worldBoundaryProps = {
    mass: Infinity,
    // fillStyle: "green",
    rigid: true,
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
}
