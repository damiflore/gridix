import { handleMotion } from "./physic.motion.js"
import { handleCollision } from "./physic.collision.js"
import { handleSleep } from "./physic.sleep.js"

// maybe rename time into gameTime ?

const PHYSIC_UPDATE_MAX_DURATION = 10

export const updatePhysicForArcadeGame = ({
  gameObjects,
  timePerFrame,
  time,
  motion = true,
  // TODO: movecallback is "useless" as it is.
  // we should add something called "move tracker"
  // that is tracking object moves in the game and capable to notify some logic when
  // objects are moved (it would check after collision resolution no?)
  // et sleeping pourrait réutiliser ce concept
  // beware it's move before collision resolution
  // so not really useful, ideally callback should be called after collision resolution
  moveCallback = () => {},

  collisionCallback = () => {},
  collisionPositionResolution = true,
  collisionVelocityImpact = true,
  // TODO: put sleepEnabled sur rigid body (pouvoir le controller par rigidBody)
  // pour sleeping qui se comporte un peu mieux
  // if an object is resting on the floor and the object
  // does not move beyond a minimal distance in about two seconds,
  // then the physics calculations are disabled
  // -> https://en.wikipedia.org/wiki/Physics_engine
  // https://gamedev.stackexchange.com/questions/114925/in-a-2d-physics-engine-how-do-i-avoid-useless-collision-resolutions-when-object
  sleepEnabled = true,
  // when move (x+y+angle) is less than sleepMoveThreshold
  // we consider object as static/motionless
  // when this happen for more than sleepStartSeconds
  // object is put to sleep
  sleepMoveThreshold = 0.1,
  sleepVelocityThreshold = 0.1,
  sleepStartDuration = 2,

  // pour bounce threshold
  // this is the right keywords for the bounce issue: "rigid body bounce ground"
  // https://forum.unity.com/threads/bouncy-character-when-landed-on-ground.408821/
  // c'est surement une solution aussi: bounceThreshold
  // https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/pairs/Pair.js#L51
  // bounceThreshold = 1,
}) => {
  const startMs = Date.now()

  if (motion) {
    handleMotion({
      gameObjects,
      timePerFrame,
      moveCallback,
    })
  }
  handleCollision({
    gameObjects,
    collisionCallback,
    collisionPositionResolution,
    collisionVelocityImpact,
  })

  if (sleepEnabled) {
    handleSleep({
      gameObjects,
      sleepMoveThreshold,
      sleepVelocityThreshold,
      sleepStartDuration,
      time,
    })
  }

  const endMs = Date.now()
  const duration = endMs - startMs
  if (duration > PHYSIC_UPDATE_MAX_DURATION) {
    if (import.meta.dev) {
      console.warn(
        `physic update is too slow, took ${duration}ms (should be less than ${PHYSIC_UPDATE_MAX_DURATION})`,
      )
      // eslint-disable-next-line no-debugger
      debugger
    }
  }
}
