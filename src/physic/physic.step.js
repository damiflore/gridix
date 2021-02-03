import { handleMotion } from "./physic.motion.js"
import { handleCollision } from "./physic.collision.js"
import { handleSleep } from "./physic.sleep.js"

export const updatePhysicForArcadeGame = ({
  rigidBodies,
  stepInfo,
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
  // sleepEnabled = true,
  // when move (x+y+angle) is less than sleepMoveThreshold
  // we consider object as static/motionless
  // when this happen for more than sleepStartSeconds
  // object is put to sleep
  sleepMoveThreshold = 0.01,
  sleepForceThreshold = 1,
  sleepVelocityThreshold = 0.1,
  sleepStartDuration = 2,
  moveCallback = () => {},

  // pour bounce threshold
  // this is the right keywords for the bounce issue: "rigid body bounce ground"
  // https://forum.unity.com/threads/bouncy-character-when-landed-on-ground.408821/
  // c'est surement une solution aussi: bounceThreshold
  // https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/pairs/Pair.js#L51
  // bounceThreshold = 1,
}) => {
  handleMotion({
    rigidBodies,
    stepInfo,
  })
  handleCollision({
    rigidBodies,
    collisionCallback,
    collisionPositionResolution,
    collisionVelocityImpact,
  })
  handleSleep({
    rigidBodies,
    stepInfo,
    sleepMoveThreshold,
    sleepForceThreshold,
    sleepVelocityThreshold,
    sleepStartDuration,
    moveCallback,
  })
}
