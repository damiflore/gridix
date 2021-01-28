import { handleMovement } from "./physic.movement.js"
import { handleCollision } from "./physic.collision.js"

// renommer seconds en time
// renommer movement en motion

export const updatePhysicForArcadeGame = ({
  gameObjects,
  secondsPerFrame,
  // ellapsedSeconds,
  movement = true,
  collisionCallback = () => {},
  collisionPositionResolution = true,
  collisionVelocityImpact = true,
  // pour sleeping qui se comporte un peu mieux
  // if an object is resting on the floor and the object
  // does not move beyond a minimal distance in about two seconds,
  // then the physics calculations are disabled
  // -> https://en.wikipedia.org/wiki/Physics_engine
  // maybe this is what we want to implement

  // comment détecter qu'on objet arrete de bouger pendant un certain temps ?
  // on pourrait garder en mémoire la derniere position + le temps
  // chaque fois qu'on objet bouge, on regarde de combien entre
  // avant la mise a jour physique de sa position et apres.
  // si cela représente plus que lastNotableMoveEllapsedSeconds
  // on le met a jour
  // dans handleSleep on regarde tout les objet n'ayant pas bougé
  // et on compare avec ellapsedSeconds, si cela dépasse X alors on met l'objet en sleeping
  // https://gamedev.stackexchange.com/questions/114925/in-a-2d-physics-engine-how-do-i-avoid-useless-collision-resolutions-when-object

  // when sleep is enabled, if object velocity x, y, and angle is too small
  // according to sleepVelocityCeil and sleepVelocityAngleCeil
  // during more then sleepFrameFloor object becomes sleeping
  // when sleeping object collision are not checked and position is not updated.
  // only a velocity update can awake that object, happens when:
  // - an other moving object collides it (and update its velocity)
  // - something else mutates the object velocity
  sleepEnabled = false,
  // when move (x+y+angle) is less than sleepMotionThreshold
  // we consider object as static/motionless
  // when this happen for more than sleepStartSeconds
  // object is put to sleep
  sleepMotionThreshold = 0.1,
  sleepStartDuration = 2,

  // pour bounce threshold
  // this is the right keywords for the bounce issue: "rigid body bounce ground"
  // https://forum.unity.com/threads/bouncy-character-when-landed-on-ground.408821/
  // c'est surement une solution aussi: bounceThreshold
  // https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/pairs/Pair.js#L51
}) => {
  const moves = []

  if (movement) {
    handleMovement({
      gameObjects,
      secondsPerFrame,
      moveCallback: (gameObject, from, to) => {
        moves.push({ gameObject, from, to })
      },
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
      moves,
      gameObjects,
      sleepMotionThreshold,
      sleepStartDuration,
    })
  }
}

const handleSleep = ({
  gameObjects,
  sleepVelocityAngleCeil,
  sleepVelocityCeil,
  sleepFrameFloor,
}) => {
  gameObjects.forEach((gameObject) => {
    updateSleepingState(gameObject, {
      sleepVelocityAngleCeil,
      sleepVelocityCeil,
      sleepFrameFloor,
    })
  })
}

const updateSleepingState = (
  gameObject,
  { sleepVelocityAngleCeil, sleepVelocityCeil, sleepFrameFloor },
) => {
  const { sleeping } = gameObject
  const shouldSleep = getShouldSleep(gameObject, {
    sleepVelocityAngleCeil,
    sleepVelocityCeil,
    sleepFrameFloor,
  })

  if (shouldSleep) {
    // increment number of frame where object is sleeping
    gameObject.sleepingFrameCount++
  }

  // awake
  if (sleeping && !shouldSleep) {
    gameObject.sleeping = false
    gameObject.sleepingFrameCount = 0
    return false
  }

  // puts asleep
  if (!sleeping && shouldSleep && gameObject.sleepingFrameCount > sleepFrameFloor) {
    gameObject.sleeping = true
    gameObject.velocityX = 0
    gameObject.velocityY = 0
    return true
  }

  return sleeping
}

const getShouldSleep = (gameObject, { sleepVelocityAngleCeil, sleepVelocityCeil }) => {
  // useless move
  // const centerXBeforeUpdate = from.centerX
  // const centerYBeforeUpdate = from.centerY
  // const centerXAfterCollisionResolution = gameObject.centerX
  // const centerYAfterCollisionResolution = gameObject.centerY
  // const moveXDiff = centerXAfterCollisionResolution - centerXBeforeUpdate
  // const moveYDiff = centerYAfterCollisionResolution - centerYBeforeUpdate
  // const move = Math.sqrt(moveXDiff * moveXDiff + moveYDiff * moveYDiff)
  // if (move < 0.1) {
  //   return true
  // }

  const { velocityX, velocityY, velocityAngle } = gameObject
  // awake by angle velocity
  if (velocityAngle * velocityAngle >= sleepVelocityAngleCeil) {
    return false
  }

  // awake by x,y velocity
  if (velocityX * velocityX + velocityY * velocityY >= sleepVelocityCeil) {
    return false
  }

  return true
}
