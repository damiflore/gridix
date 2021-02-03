import { updatePhysicForArcadeGame } from "./physic.step.js"

const PHYSIC_SIMULATION_MAX_DURATION = 15

export const createWorld = ({
  onRigidBodyAdded = () => {},
  onRigidBodyRemoved = () => {},
} = {}) => {
  const rigidBodies = []

  const world = {}

  const addRigidBody = (rigidBody) => {
    rigidBodies.push(rigidBody)
    onRigidBodyAdded(rigidBody)
  }

  const removeRigidBody = (rigidBody) => {
    const index = rigidBodies.indexOf(rigidBody)
    if (index === -1) {
      return
    }
    rigidBodies.splice(index, 1)
    onRigidBodyRemoved(rigidBody)
  }

  const step = (stepInfo) => {
    const startMs = Date.now()
    updatePhysicForArcadeGame({
      rigidBodies,
      stepInfo,
    })

    const endMs = Date.now()
    const duration = endMs - startMs
    if (duration > PHYSIC_SIMULATION_MAX_DURATION) {
      if (import.meta.dev) {
        console.warn(
          `physic simulation is too slow, took ${duration}ms (should be less than ${PHYSIC_SIMULATION_MAX_DURATION})`,
        )
      }
    }
  }

  Object.assign(world, {
    step,
    addRigidBody,
    removeRigidBody,
  })

  return world
}
