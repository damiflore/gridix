import { drawRectangle } from "src/draw/draw.js"
import {
  centerXFromCellX,
  centerYFromCellY,
  closestCellCenterFromPoint,
} from "src/geometry/grid.js"
import { createRectangle } from "src/geometry/rectangle.js"
import { createRigidBody } from "src/physic/rigid-body.js"
import { addImpulse } from "src/physic/physic.motion.js"
import { sameSign } from "src/math/math.js"

export const createBaril = ({ cellX, cellY, worldGrid }) => {
  const rectangle = createRectangle({
    centerX: centerXFromCellX(cellX, worldGrid),
    centerY: centerYFromCellY(cellY, worldGrid),
    width: worldGrid.cellSize,
    height: worldGrid.cellSize,
  })

  const rigidBody = createRigidBody({
    ...rectangle,
    angleLocked: true,
    sleeping: true,
    mass: 1,
    friction: 0.2,
    frictionAmbient: 0.7,
  })

  const baril = {
    ...rigidBody,
    name: "baril",
    fillStyle: "brown",
    draw: drawRectangle,
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
      onMoveBaril(baril, worldGrid)
    },
  }

  return baril
}

const onMoveBaril = (baril, { worldGrid }) => {
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
  const closestCellCenter = closestCellCenterFromPoint({ x: centerX, y: centerY }, worldGrid)
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
}
