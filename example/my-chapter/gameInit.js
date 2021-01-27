import { createRigidRectangle, createRigidCircle } from "./physic/shape.js"

export const gameInit = ({ gameObjects, width, height, worldBounds = true }) => {
  if (worldBounds) {
    addWorldBounds({ gameObjects, width, height })
  }
  gameObjects.push(
    createRigidRectangle({
      centerX: 500,
      centerY: 200,
      width: 400,
      height: 20,
      mass: 0,
      friction: 0.3,
      restitution: 0,
      angle: 2.8,
    }),
  )
  gameObjects.push(
    createRigidRectangle({
      centerX: 200,
      centerY: 400,
      width: 400,
      height: 20,
      mass: 0,
      friction: 1,
      restitution: 0.5,
    }),
  )
  gameObjects.push(
    createRigidRectangle({
      centerX: 100,
      centerY: 200,
      width: 200,
      height: 20,
      mass: 0,
    }),
  )
  gameObjects.push(
    createRigidRectangle({
      centerX: 10,
      centerY: 360,
      width: 20,
      height: 100,
      mass: 0,
      friction: 0,
      restitution: 1,
    }),
  )

  let i = 10
  while (i--) {
    gameObjects.push(
      createRigidRectangle({
        centerX: Math.random() * width,
        centerY: (Math.random() * height) / 2,
        width: Math.random() * 50 + 10,
        height: Math.random() * 50 + 10,
        mass: Math.random() * 30,
        friction: Math.random(),
        restitution: Math.random(),
        velocityX: Math.random() * 60 - 30,
        velocityY: Math.random() * 60 - 30,
      }),
    )
    gameObjects.push(
      createRigidCircle({
        centerX: Math.random() * width,
        centerY: (Math.random() * height) / 2,
        radius: Math.random() * 20 + 10,
        mass: Math.random() * 30,
        friction: Math.random(),
        restitution: Math.random(),
        velocityX: Math.random() * 60 - 30,
        velocityY: Math.random() * 60 - 30,
      }),
    )
  }
}

const addWorldBounds = ({ gameObjects, width, height }) => {
  const worldBoundarySize = 3
  const worldBoundaryProps = {
    mass: Infinity,
    // fillStyle: "green",
    // boundingBox: null,
    boundingBox: "auto",
  }
  const left = createRigidRectangle({
    name: "world-boundary-left",
    centerX: -worldBoundarySize / 2,
    centerY: height / 2,
    width: worldBoundarySize,
    height: height - 2,
    ...worldBoundaryProps,
  })
  gameObjects.push(left)
  const top = createRigidRectangle({
    name: "world-boundary-top",
    centerX: width / 2,
    centerY: -worldBoundarySize / 2,
    width,
    height: worldBoundarySize,
    ...worldBoundaryProps,
  })
  gameObjects.push(top)
  const right = createRigidRectangle({
    name: "world-boundary-right",
    centerX: width + worldBoundarySize / 2,
    centerY: height / 2,
    width: worldBoundarySize,
    height: height - 2,
    ...worldBoundaryProps,
  })
  gameObjects.push(right)
  const bottom = createRigidRectangle({
    name: "world-boundary-bottom",
    centerX: width / 2,
    centerY: height + worldBoundarySize / 2,
    width,
    height: worldBoundarySize,
    ...worldBoundaryProps,
  })
  gameObjects.push(bottom)
}
