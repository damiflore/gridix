/* eslint-disable no-nested-ternary */
import { createRectangle } from "./world/shape.js"
import { trackKeyboardKeydown } from "../../src/interaction/keyboard.js"
// import { getDistanceBetweenVectors } from "./geometry/vector.js"

export const demoBloc = ({ world, width, height }) => {
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
    world.addGameObject(wall)
  }

  const addBaril = ({ column, row }) => {
    const baril = createRectangle({
      name: "baril",
      centerX: column * cellSize + cellSize / 2,
      centerY: row * cellSize + cellSize / 2,
      // TODO: use force instead of velocity
      update: (baril) => {
        // the goal here is to facilitate a moving baril to stop
        // exactly on a cell.
        // sleeping baril -> do nothing
        // baril moving too fast -> do nothing
        // baril moving the opposite direction of closest cell -> do nothing
        // baril already "exactly" on the cell -> do nothing

        const { sleeping } = baril
        if (sleeping) {
          return
        }

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
          { width, height, cellSize },
        )
        const cellCenterToCenterXDiff = closestCellCenter.x - centerX

        if (velocityXStrength > velocityYStrength) {
          // no velocity, don't awake
          if (velocityX === 0) {
            return
          }
          // velocity going the other way
          if (cellCenterToCenterXDiff < 0 && velocityX > 0) {
            return
          }
          if (cellCenterToCenterXDiff > 0 && velocityX < 0) {
            return
          }
          // no worthy adjustement on X required
          if (Math.abs(cellCenterToCenterXDiff) < 0.1) {
            return
          }

          baril.velocityX += cellCenterToCenterXDiff * force
          return
        }

        const cellCenterToCenterYDiff = closestCellCenter.y - centerY
        if (velocityY === 0) {
          return
        }
        if (cellCenterToCenterYDiff < 0 && velocityY > 0) {
          return
        }
        if (cellCenterToCenterYDiff > 0 && velocityY < 0) {
          return
        }
        // no worthy adjustement on Y required
        if (Math.abs(cellCenterToCenterYDiff) < 0.1) {
          return
        }

        baril.velocityY += cellCenterToCenterYDiff * force
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

  const addIce = ({ row, column }) => {
    // something enters the ice area -> frictionAmbient goes super low
    const ice = createRectangle({
      name: "ice",
      // rigid: true,
      hitbox: true,
      frictionGround: 0.05,
      centerX: column * cellSize + cellSize / 2,
      centerY: row * cellSize + cellSize / 2,
      width: cellSize,
      height: cellSize,
      fillStyle: "lightblue",
    })
    world.addGameObject(ice)
  }

  const addSideWalkTop = ({ row, column }) => {
    const sidewalk = createRectangle({
      name: "sidewalk-top",
      // rigid: true,
      hitbox: true,
      areaEffect: (sidewalk, gameObject) => {
        const sidewalkForce = { origin: sidewalk, y: -600 }
        gameObject.forces.push(sidewalkForce)
        return () => {}
      },
      centerX: column * cellSize + cellSize / 2,
      centerY: row * cellSize + cellSize / 2,
      width: cellSize,
      height: cellSize,
      fillStyle: "lightgreen",
    })
    world.addGameObject(sidewalk)
  }

  const addHero = ({ row, column }) => {
    const hero = createRectangle({
      name: "hero",
      centerX: column * cellSize + cellSize / 2,
      centerY: row * cellSize + cellSize / 2,
      angleLocked: true,
      width: 32,
      height: 32,
      fillStyle: "red",
      rigid: true,
      friction: 0.01,
      frictionAmbient: 0.2,
    })
    world.addGameObject(hero)
    return hero
  }

  // const addSpeedwalkRight = () => {}

  addSideWalkTop({ column: 5, row: 1 })
  addSideWalkTop({ column: 5, row: 2 })
  addSideWalkTop({ column: 5, row: 3 })

  addWall({ column: 1, row: 0 })
  addWall({ column: 1, row: 1 })
  addBaril({ column: 1, row: 2 })
  addBaril({ column: 2, row: 2 })
  addBaril({ column: 5, row: 3 })
  addWall({ column: 1, row: 3 })

  // addIce({ column: 0, row: 0 })
  addIce({ column: 3, row: 7 })
  addIce({ column: 4, row: 7 })
  addIce({ column: 5, row: 7 })
  addIce({ column: 3, row: 8 })
  addIce({ column: 4, row: 8 })
  addIce({ column: 5, row: 8 })
  addIce({ column: 6, row: 7 })
  addIce({ column: 6, row: 8 })

  const hero = addHero({ column: 0, row: 0 })

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
  world.addGameObject({
    name: "keyboard-navigation",
    update: (_, { timePerFrame }) => {
      // https://docs.unity3d.com/ScriptReference/Rigidbody2D.AddForce.html
      // https://gamedev.stackexchange.com/a/169844

      // Quand on change de direction, celui ci est instantané.
      // Ca pose un souci qui devient évident lorsque la friction est faible:
      // Le héros bouge d'un seul coup dans l'autre direction, il est impossible de
      // controller l'endroit ou on veut s'arreter
      // On s'en rend compte en allant sur la glace.
      const keyXCoef = keyToCoef(leftKey, rightKey)
      if (keyXCoef) {
        const { velocityX } = hero
        const keyVelocity = keyboardVelocity * keyXCoef
        const velocityXDiff = keyVelocity - velocityX
        const forceXFromKey = (velocityXDiff * hero.mass) / timePerFrame
        hero.forces.push({ x: forceXFromKey })
      }

      const keyYCoef = keyToCoef(upKey, downKey)
      if (keyYCoef) {
        const { velocityY } = hero
        const keyVelocity = keyboardVelocity * keyYCoef
        const velocityYDiff = keyVelocity - velocityY
        const forceYFromKey = (velocityYDiff * hero.mass) / timePerFrame
        hero.forces.push({ y: forceYFromKey })
      }
    },
  })
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

// https://github.com/MassiveHeights/Black-Donuts/blob/f8aab3baba364b7f1d5e71f177639086299acb52/js/objects/board.js#L180
const closestCellCenterFromPoint = ({ x, y }, { cellSize }) => {
  const closestColumn = Math.floor(x / cellSize)
  const closestRow = Math.floor(y / cellSize)

  return {
    x: closestColumn * cellSize + cellSize / 2,
    y: closestRow * cellSize + cellSize / 2,
  }
}
