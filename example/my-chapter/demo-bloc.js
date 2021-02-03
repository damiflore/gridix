/* eslint-disable no-nested-ternary */
import { trackKeyboardKeydown } from "../../src/interaction/keyboard.js"
import { createRectangle } from "./world/shape.js"
import { createWorld, addBoundsToWorld } from "./world/world.js"
import { addForce, addImpulse } from "./physic/physic.motion.js"
import {
  closestCellIndexFromPoint,
  closestCellCenterFromPoint,
  centerXFromCellX,
  centerYFromCellY,
  generateCells,
} from "./geometry/grid.js"
import { clampMagnitude, sameSign } from "./math/math.js"
// import { getDistanceBetweenVectors } from "./geometry/vector.js"

export const demoBloc = () => {
  const worldGrid = {
    cellXCount: 10,
    cellYCount: 10,
    cellSize: 32,
    cells: [],
  }
  worldGrid.cells = generateCells(worldGrid)
  window.worldGrid = worldGrid

  let hero

  const world = createWorld({
    width: worldGrid.cellXCount * worldGrid.cellSize,
    height: worldGrid.cellYCount * worldGrid.cellSize,
    onGameObjectMove: (gameObject, move) => {
      // some objects are pure logic, we should detect them somehow
      // -> !rigid is not enough for will do for now
      if (!gameObject.rigid && !gameObject.hitbox) {
        return
      }

      if (move.from && gameObject.onMove) {
        gameObject.onMove(move)
      }

      const cellIndexPrevious = move.from ? closestCellIndexFromPoint(move.from, worldGrid) : -1
      const cellIndex = closestCellIndexFromPoint(move.to, worldGrid)
      if (cellIndexPrevious !== cellIndex) {
        let cellMatesPrevious = []
        let cellMates = []

        if (cellIndexPrevious === -1) {
        } else {
          cellMatesPrevious = removeItemFromCell(worldGrid, cellIndexPrevious, gameObject)
          cellMatesPrevious.forEach((cellMatePrevious) => {
            if (cellMatePrevious.onCellMateLeave) {
              cellMatePrevious.onCellMateLeave(gameObject)
            }
          })
        }

        if (cellIndex === -1) {
          gameObject.cellIndex = -1
        } else {
          cellMates = worldGrid.cells[cellIndex] || []
          addItemToCell(worldGrid, cellIndex, gameObject)
          cellMates.forEach((cellMate) => {
            if (cellMate.onCellMateJoin) {
              cellMate.onCellMateJoin(gameObject)
            }
          })
          gameObject.cellIndex = cellIndex
        }

        // useless for now
        // if (gameObject.onCellChange) {
        //   gameObject.onCellChange(cellMates, cellMatesPrevious)
        // }
      }
    },
  })

  addBoundsToWorld(world)

  const { cellSize } = worldGrid

  // put keyboard first so that sidewalk will be able to add/substract force from keyboard impulse
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
  const keyboardVelocity = 200
  // the accell/decel numbers below are dependent of the ambient friction
  // idéalement la vitesse du hero dans une direction devrait
  // rendre plus difficile de repartir dans une autre direction ?
  const maxAccel = 25000
  const maxDecel = 5000
  world.addGameObject({
    name: "keyboard-navigation",
    update: (_, { timePerFrame }) => {
      // https://docs.unity3d.com/ScriptReference/Rigidbody2D.AddForce.html
      // https://gamedev.stackexchange.com/a/169844

      const whatever = hero.flagIce ? keyboardVelocity + 50 : keyboardVelocity

      let forceX = 0
      const keyXCoef = keyToCoef(leftKey, rightKey)
      if (keyXCoef) {
        const { velocityX } = hero
        const velocityCurrent = velocityX
        const velocityDesired = whatever * keyXCoef
        const velocityDiff = velocityDesired - velocityCurrent
        const max = sameSign(velocityCurrent, keyXCoef) ? maxAccel : maxDecel
        const acceleration = clampMagnitude(velocityDiff / timePerFrame, max * hero.frictionAmbient)
        forceX = acceleration
      }

      let forceY = 0
      const keyYCoef = keyToCoef(upKey, downKey)
      if (keyYCoef) {
        const { velocityY } = hero
        const velocityCurrent = velocityY
        const velocityDesired = whatever * keyYCoef
        const velocityDiff = velocityDesired - velocityCurrent
        const max = sameSign(velocityCurrent, keyYCoef) ? maxAccel : maxDecel
        const acceleration = clampMagnitude(velocityDiff / timePerFrame, max * hero.frictionAmbient)
        forceY = acceleration
      }

      if (forceX || forceY) {
        addImpulse(hero, { x: forceX, y: forceY })
      }
    },
  })

  const addWall = ({ cellX, cellY }) => {
    const wall = createRectangle({
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      angleLocked: true,
      width: cellSize,
      height: cellSize,
      mass: Infinity,
      rigid: true,
      fillStyle: "black",
      friction: 0.2,
    })
    world.addGameObject(wall)
  }

  const addBaril = ({ cellX, cellY }) => {
    const baril = createRectangle({
      name: "baril",
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      update: () => {
        // the goal here is to facilitate a moving baril to stop
        // exactly on a cell.
        // sleeping baril -> do nothing
        // baril moving too fast -> do nothing
        // baril moving the opposite direction of closest cell -> do nothing
        // baril already "exactly" on the cell -> do nothing

        baril.frictionAmbient = baril.flagIce ? 0.02 : 0.7
      },
      onMove: () => {
        const { velocityX, velocityY } = baril
        // too fast
        const velocityXStrength = Math.abs(velocityX)
        if (velocityXStrength > 10) {
          return
        }
        const velocityYStrength = Math.abs(velocityY)
        if (velocityYStrength > 10) {
          return
        }

        const force = 50
        const { centerX, centerY } = baril
        const closestCellCenter = closestCellCenterFromPoint(
          { x: centerX, y: centerY },
          { cellSize },
        )
        const cellCenterToCenterXDiff = closestCellCenter.x - centerX

        if (velocityXStrength > velocityYStrength) {
          // no velocity, don't awake
          if (velocityX === 0) {
            return
          }
          // velocity going the other way
          if (!sameSign(cellCenterToCenterXDiff, velocityX)) {
            return
          }
          // no worthy adjustement on X required
          if (Math.abs(cellCenterToCenterXDiff) < 0.1) {
            return
          }

          addImpulse(baril, { x: force * cellCenterToCenterXDiff })
          return
        }

        const cellCenterToCenterYDiff = closestCellCenter.y - centerY
        if (velocityY === 0) {
          return
        }
        if (!sameSign(cellCenterToCenterYDiff, velocityY)) {
          return
        }
        // no worthy adjustement on Y required
        if (Math.abs(cellCenterToCenterYDiff) < 0.1) {
          return
        }

        addImpulse(baril, { y: force * cellCenterToCenterYDiff })
      },
      angleLocked: true,
      sleeping: true,
      width: cellSize,
      height: cellSize,
      mass: 1,
      rigid: true,
      fillStyle: "brown",
      friction: 0.2,
      frictionAmbient: 0.7,
    })
    world.addGameObject(baril)
  }

  const addIce = ({ cellX, cellY }) => {
    // something enters the ice area -> frictionAmbient goes super low
    const ice = createRectangle({
      name: "ice",
      // rigid: true,
      hitbox: true,
      frictionGround: 0.02,
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      width: cellSize,
      height: cellSize,
      fillStyle: "lightblue",
      onCellMateJoin: (gameObject) => {
        gameObject.flagIce = true
      },
      onCellMateLeave: (gameObject) => {
        gameObject.flagIce = false
      },
    })
    world.addGameObject(ice)
  }

  const addSideWalkTop = ({ cellX, cellY }) => {
    const sidewalk = createRectangle({
      name: "sidewalk-top",
      // rigid: true,
      hitbox: true,
      update: () => {
        const cellContent = worldGrid.cells[sidewalk.cellIndex]
        cellContent.forEach((cellMate) => {
          if (cellMate !== sidewalk) {
            addForce(cellMate, { y: -6000 })
          }
        })
      },
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      width: cellSize,
      height: cellSize,
      fillStyle: "lightgreen",
    })
    world.addGameObject(sidewalk)
  }

  const addHero = ({ cellX, cellY }) => {
    const hero = createRectangle({
      name: "hero",
      update: () => {
        hero.frictionAmbient = hero.flagIce ? 0.02 : 0.2
      },
      centerX: centerXFromCellX(cellX, worldGrid),
      centerY: centerYFromCellY(cellY, worldGrid),
      angleLocked: true,
      width: 32,
      height: 32,
      fillStyle: "red",
      rigid: true,
      friction: 0.01,
    })
    world.addGameObject(hero)
    return hero
  }

  // const addSpeedwalkRight = () => {}

  addSideWalkTop({ cellX: 5, cellY: 1 })
  addSideWalkTop({ cellX: 5, cellY: 2 })
  addSideWalkTop({ cellX: 5, cellY: 3 })

  addWall({ cellX: 1, cellY: 0 })
  addWall({ cellX: 1, cellY: 1 })
  addBaril({ cellX: 1, cellY: 2 })
  addBaril({ cellX: 2, cellY: 2 })
  addBaril({ cellX: 5, cellY: 3 })
  addWall({ cellX: 1, cellY: 3 })

  // addIce({ cellX: 0, cellY: 0 })
  addIce({ cellX: 3, cellY: 7 })
  addIce({ cellX: 4, cellY: 7 })
  addIce({ cellX: 5, cellY: 7 })
  addIce({ cellX: 3, cellY: 8 })
  addIce({ cellX: 4, cellY: 8 })
  addIce({ cellX: 5, cellY: 8 })
  addIce({ cellX: 6, cellY: 7 })
  addIce({ cellX: 6, cellY: 8 })

  hero = addHero({ cellX: 0, cellY: 0 })

  return world
}

const removeItemFromCell = (grid, cellIndex, itemToRemove) => {
  const cells = grid.cells
  const cell = cells[cellIndex]

  if (!cell) {
    const cellWithoutItem = []
    cells[cellIndex] = cellWithoutItem
    return cellWithoutItem
  }

  let i = cell.length
  const cellWithoutItem = []
  while (i--) {
    const itemCandidate = cell[i]
    if (itemCandidate !== itemToRemove) {
      cellWithoutItem.push(itemCandidate)
    }
  }
  cells[cellIndex] = cellWithoutItem

  return cellWithoutItem
}

const addItemToCell = (grid, cellIndex, item) => {
  const cells = grid.cells
  const cell = cells[cellIndex]
  if (cell) {
    const cellWithItem = [...cell, item]
    cells[cellIndex] = cellWithItem
    return cellWithItem
  }

  const cellWithItem = [item]
  cells[cellIndex] = cellWithItem
  return cellWithItem
}

const keyToCoef = (firstKey, secondKey) => {
  if (firstKey.isDown && secondKey.isDown) {
    if (firstKey.downTimeStamp > secondKey.downTimeStamp) {
      return -1
    }

    return 1
  }

  if (firstKey.isDown) {
    return -1
  }

  if (secondKey.isDown) {
    return 1
  }

  return 0
}
