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
      mass: 2,
      rigid: true,
      fillStyle: "brown",
      friction: 0.2,
      frictionAmbient: 0.7,
    })
    gameObjects.push(baril)
  }

  const addIce = ({ row, column }) => {
    // something enters the ice area -> frictionAmbient goes super low
    const ice = createRectangle({
      name: "ice",
      // rigid: true,
      hitbox: true,
      areaEffect: (_, gameObject) => {
        const frictionAmbientPrevious = gameObject.frictionAmbient
        gameObject.frictionAmbient = 0.02
        return () => {
          gameObject.frictionAmbient = frictionAmbientPrevious
        }
      },
      centerX: column * cellSize + cellSize / 2,
      centerY: row * cellSize + cellSize / 2,
      width: cellSize,
      height: cellSize,
      fillStyle: "lightblue",
    })
    gameObjects.push(ice)
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
    gameObjects.push(hero)
    return hero
  }

  // const addSpeedwalkRight = () => {}

  addWall({ column: 1, row: 0 })
  addWall({ column: 1, row: 1 })
  addBaril({ column: 1, row: 2 })
  addBaril({ column: 2, row: 2 })
  addBaril({ column: 4, row: 3 })
  addWall({ column: 1, row: 3 })

  // addIce({ column: 0, row: 0 })
  addIce({ column: 0, row: 5 })
  addIce({ column: 1, row: 5 })
  addIce({ column: 2, row: 5 })
  addIce({ column: 0, row: 6 })

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
  const keyboardVelocity = 2500
  gameObjects.push({
    name: "keyboard-navigation",
    updateState: () => {
      // https://docs.unity3d.com/ScriptReference/Rigidbody2D.AddForce.html
      // https://gamedev.stackexchange.com/a/169844
      // void AccelerateTowards(Vector2 targetVelocity, float maxAccel, float maxDecel) {
      //     // Compute desired velocity change.
      //     var velocity = body.velocity;
      //     var deltaV = targetVelocity - velocity;

      //     // Convert our velocity change to a desired acceleration,
      //     // aiming to complete the change in a single time step.

      //     // (For best consistency, call this in FixedUpdate,
      //     //  and deltaTime will automatically give fixedDeltaTime)
      //     var accel = deltaV / Time.deltaTime;

      //     // Choose an acceleration limit depending on whether we're
      //     // accelerating further in a similar direction, or braking.
      //     var limit = Dot(deltaV, velocity) > 0f ? maxAccel : maxDecel;

      //     // Enforce our acceleration limit, so we never exceed it.
      //     var force = body.mass * Vector2.ClampMagnitude(accel, limit);

      //     // Apply the computed force to our body.
      //     body.AddForce(force, ForceMode2D.Force);
      // }
      const { velocityX, velocityY } = hero
      const velocityXDiff = keyboardVelocity - velocityX
      const velocityYDiff = keyboardVelocity - velocityY

      const forceXFromKeyboard = velocityXDiff * keyToCoef(leftKey, rightKey)
      const forceYFromKeyboard = velocityYDiff * keyToCoef(upKey, downKey)
      if (forceXFromKeyboard) {
        hero.forces.push({ x: forceXFromKeyboard })
      }
      if (forceYFromKeyboard) {
        hero.forces.push({ y: forceYFromKeyboard })
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
