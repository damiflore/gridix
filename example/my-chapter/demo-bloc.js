/* eslint-disable no-nested-ternary */
import { createRectangle } from "./game/shape.js"
import { trackKeyboardKeydown } from "../../src/interaction/keyboard.js"
import { motionAllowedFromMass } from "./physic/physic.motion.js"
// import { getDistanceBetweenVectors } from "./geometry/vector.js"

export const demoBloc = ({ gameObjects, width, height, worldBounds = true }) => {
  if (worldBounds) {
    addWorldBounds({ gameObjects, width, height })
  }

  const cellSize = 32

  const addWall = ({ column, row }) => {
    const wall = createRectangle({
      centerX: column * cellSize + cellSize / 2,
      centerY: row * cellSize + cellSize / 2,
      angleLocked: true,
      width: cellSize,
      height: cellSize,
      mass: Infinity,
      rigid: true,
      fillStyle: "black",
      friction: 0.2,
    })
    gameObjects.push(wall)
  }

  const addBaril = ({ column, row }) => {
    const baril = createRectangle({
      name: "baril",
      centerX: column * cellSize + cellSize / 2,
      centerY: row * cellSize + cellSize / 2,
      angleLocked: true,
      width: cellSize,
      height: cellSize,
      mass: 2,
      rigid: true,
      fillStyle: "brown",
      friction: 0.2,
      frictionAmbient: 0.7,
    })
    gameObjects.push(baril)
  }

  const hero = createRectangle({
    name: "hero",
    centerX: cellSize / 2,
    centerY: cellSize / 2,
    angleLocked: true,
    width: 32,
    height: 32,
    fillStyle: "red",
    rigid: true,
    friction: 0.01,
    frictionAmbient: 0.2,
  })
  gameObjects.push(hero)

  addWall({ column: 1, row: 0 })
  addWall({ column: 1, row: 1 })
  addBaril({ column: 1, row: 2 })
  // addBaril({ column: 2, row: 2 })
  addWall({ column: 1, row: 3 })

  const downKey = trackKeyboardKeydown({
    code: "ArrowDown",
    node: document,
  })
  const upKey = trackKeyboardKeydown({
    code: "ArrowUp",
    node: document,
  })
  const leftKey = trackKeyboardKeydown({
    code: "ArrowLeft",
    node: document,
  })
  const rightKey = trackKeyboardKeydown({
    code: "ArrowRight",
    node: document,
  })
  const keyboardForce = 2500
  gameObjects.push({
    name: "keyboard-navigation",
    updateState: () => {
      // ptet on fera avec vélocité et pas force ?
      hero.forceX = leftKey.isDown ? -keyboardForce : rightKey.isDown ? keyboardForce : hero.forceX
      hero.forceY = upKey.isDown ? -keyboardForce : downKey.isDown ? keyboardForce : hero.forceY
    },
  })

  gameObjects.push({
    name: "world-grid-magnetism",
    updateState: () => {
      gameObjects.forEach((gameObject) => {
        if (!motionAllowedFromMass(gameObject.mass)) {
          return
        }
        if (gameObject.name !== "baril") {
          return
        }

        // uniquement si la vélocié est suffisament faible
        const { velocityX, velocityY } = gameObject
        const velocity = velocityX * velocityX + velocityY * velocityY
        if (velocity > 10) {
          return
        }

        const { centerX, centerY } = gameObject
        const closestCellCenter = closestCellCenterFromPoint(
          { x: centerX, y: centerY },
          { width, height, cellSize },
        )
        const centerToCellCenterXDiff = centerX - closestCellCenter.x
        const centerToCellCenterYDiff = centerY - closestCellCenter.y
        const force = 50
        // const distance = getDistanceBetweenVectors({ x: centerX, y: centerY }, closestCellCenter)
        // const force = distance ? 500 / distance : 0
        // now we know the force we still need to know how much it represent on x and y
        // il faut répartir cette force sur x et y
        // en fonction de leur éloignement
        // pour cela je crois qu'il fau tutiliser le produit scalaire ?

        if (
          (centerToCellCenterXDiff < 0 && velocityX >= 0) ||
          (centerToCellCenterXDiff > 0 && velocityX <= 0)
        ) {
          if (Math.abs(centerToCellCenterXDiff) > 0.1) {
            gameObject.velocityX += -centerToCellCenterXDiff * force
          }
        }
        if (
          (centerToCellCenterYDiff < 0 && velocityY >= 0) ||
          (centerToCellCenterYDiff > 0 && velocityY <= 0)
        ) {
          if (Math.abs(centerToCellCenterYDiff) > 0.1) {
            gameObject.velocityY += -centerToCellCenterYDiff * force
          }
        }
      })
    },
  })
}

const closestCellCenterFromPoint = ({ x, y }, { cellSize }) => {
  const closestColumn = Math.floor(x / cellSize)
  const closestRow = Math.floor(y / cellSize)

  return {
    x: closestColumn * cellSize + cellSize / 2,
    y: closestRow * cellSize + cellSize / 2,
  }
}

const addWorldBounds = ({ gameObjects, width, height }) => {
  const worldBoundarySize = 32
  const worldBoundaryProps = {
    mass: Infinity,
    // strokeStyle: undefined,
    rigid: true,
    restitution: 0,
  }
  const left = createRectangle({
    name: "world-boundary-left",
    centerX: -worldBoundarySize / 2,
    centerY: height / 2,
    width: worldBoundarySize,
    height,
    ...worldBoundaryProps,
  })
  gameObjects.push(left)
  const top = createRectangle({
    name: "world-boundary-top",
    centerX: width / 2,
    centerY: -worldBoundarySize / 2,
    width: width + worldBoundarySize * 2,
    height: worldBoundarySize,
    ...worldBoundaryProps,
  })
  gameObjects.push(top)
  const right = createRectangle({
    name: "world-boundary-right",
    centerX: width + worldBoundarySize / 2,
    centerY: height / 2,
    width: worldBoundarySize,
    height,
    ...worldBoundaryProps,
  })
  gameObjects.push(right)
  const bottom = createRectangle({
    name: "world-boundary-bottom",
    centerX: width / 2,
    centerY: height + worldBoundarySize / 2,
    width: width + worldBoundarySize * 2,
    height: worldBoundarySize,
    ...worldBoundaryProps,
  })
  gameObjects.push(bottom)
}
