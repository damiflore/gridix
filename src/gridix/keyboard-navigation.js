import { trackKeyboardKeydown } from "src/interaction/keyboard.js"
import { clampMagnitude, sameSign } from "src/math/math.js"
import { addImpulse } from "src/physic/physic.motion.js"

export const createKeyboardNavigation = ({
  // the accell/decel numbers below are dependent of the ambient friction
  // idéalement la vitesse du hero dans une direction devrait
  // rendre plus difficile de repartir dans une autre direction ?
  maxAccel = 25000,
  maxDecel = 5000,
  keyboardVelocity = 200,
  heroRef,
} = {}) => {
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

  const keyboardNavigation = {
    name: "keyboard-navigation",
    update: (_, { timePerFrame }) => {
      // https://docs.unity3d.com/ScriptReference/Rigidbody2D.AddForce.html
      // https://gamedev.stackexchange.com/a/169844

      const hero = heroRef.current
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
  }

  return keyboardNavigation
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
