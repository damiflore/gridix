/* eslint-disable no-nested-ternary */
import { createRectangle } from "./game/shape.js"
import { trackKeyboardKeydown } from "../../src/interaction/keyboard.js"
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
      updateState: (baril) => {
        // uniquement si la vélocié est suffisament faible
        // et non null (on veut pas toucher si sleeping ou ne bouge plus)
        // juste faciliter le fait qu'un baril s'arrette cell perfect (pile dans une cellule)
        const { velocityX, velocityY } = baril
        const velocity = velocityX * velocityX + velocityY * velocityY
        if (velocity > 10 || velocity === 0) {
          return
        }

        const { centerX, centerY } = baril
        const closestCellCenter = closestCellCenterFromPoint(
          { x: centerX, y: centerY },
          { width, height, cellSize },
        )
        const centerToCellCenterXDiff = centerX - closestCellCenter.x
        const centerToCellCenterYDiff = centerY - closestCellCenter.y
        const force = 50

        if (
          (centerToCellCenterXDiff < 0 && velocityX >= 0) ||
          (centerToCellCenterXDiff > 0 && velocityX <= 0)
        ) {
          if (Math.abs(centerToCellCenterXDiff) > 0.1 && velocityX !== 0) {
            baril.velocityX -= centerToCellCenterXDiff * force
          }
        }
        if (
          (centerToCellCenterYDiff < 0 && velocityY >= 0) ||
          (centerToCellCenterYDiff > 0 && velocityY <= 0)
        ) {
          if (Math.abs(centerToCellCenterYDiff) > 0.1 && velocityY !== 0) {
            baril.velocityY -= centerToCellCenterYDiff * force
          }
        }
      },
      angleLocked: true,
      sleeping: true,
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
  addBaril({ column: 2, row: 2 })
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
  const keyboardForce = 250
  gameObjects.push({
    name: "keyboard-navigation",
    updateState: () => {
      hero.velocityX = leftKey.isDown
        ? -keyboardForce
        : rightKey.isDown
        ? keyboardForce
        : hero.velocityX
      hero.velocityY = upKey.isDown
        ? -keyboardForce
        : downKey.isDown
        ? keyboardForce
        : hero.velocityY
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
