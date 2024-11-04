import { handleCollision } from "./physic.collision.js";
import { handleMotion } from "./physic.motion.js";
import { handleSleep } from "./physic.sleep.js";

const PHYSIC_SIMULATION_MAX_DURATION = 15;

// it's arcade 2d physic
export const createSimulation = ({
  // High level description of sleeping (https://en.wikipedia.org/wiki/Physics_engine)
  // "If an object is resting on the floor and the object
  // does not move beyond a minimal distance in about two seconds,
  // then the physics calculations are disabled"
  // See also:
  // - https://gamedev.stackexchange.com/questions/114925/in-a-2d-physics-engine-how-do-i-avoid-useless-collision-resolutions-when-object
  //
  // sleepMoveThreshold and sleepStartDuration
  // when move (x+y+angle) is less than sleepMoveThreshold
  // we consider object as static/motionless
  // when this happen for more than sleepStartDuration
  // object is put to sleep
  //
  sleepMoveThreshold = 0.01,
  sleepForceThreshold = 1,
  sleepVelocityThreshold = 0.1,
  sleepStartDuration = 2,

  // pour bounce threshold
  // this is the right keywords for the bounce issue: "rigid body bounce ground"
  // https://forum.unity.com/threads/bouncy-character-when-landed-on-ground.408821/
  // c'est surement une solution aussi: bounceThreshold
  // https://github.com/MassiveHeights/Black/blob/e4967f19cbdfe42b3612981c810ac499ad34b154/src/physics/arcade/pairs/Pair.js#L51
  // min relative velocity between bodies to trigger the velocity impact
  bounceThreshold = 1,

  onRigidBodyAdded = () => {},
  onRigidBodyCollision = () => {},
  onRigidBodyMoved = () => {},
  onRigidBodyRemoved = () => {},
} = {}) => {
  const simulation = {};

  const rigidBodies = [];

  const addRigidBody = (rigidBody) => {
    rigidBodies.push(rigidBody);
    onRigidBodyAdded(rigidBody);
  };

  const removeRigidBody = (rigidBody) => {
    const index = rigidBodies.indexOf(rigidBody);
    if (index === -1) {
      return;
    }
    rigidBodies.splice(index, 1);
    onRigidBodyRemoved(rigidBody);
  };

  let step = (stepInfo) => {
    handleMotion({
      rigidBodies,
      stepInfo,
    });
    handleCollision({
      rigidBodies,
      bounceThreshold,
      collisionPositionResolution: true,
      collisionVelocityImpact: true,
      onRigidBodyCollision,
    });
    handleSleep({
      rigidBodies,
      stepInfo,
      sleepMoveThreshold,
      sleepForceThreshold,
      sleepVelocityThreshold,
      sleepStartDuration,
      onRigidBodyMoved,
    });
  };

  if (import.meta.dev) {
    const stepOriginal = step;
    step = (stepInfo) => {
      const startMs = Date.now();
      stepOriginal(stepInfo);
      const endMs = Date.now();
      const duration = endMs - startMs;
      if (duration > PHYSIC_SIMULATION_MAX_DURATION) {
        console.warn(
          `physic simulation is too slow, took ${duration}ms (should be less than ${PHYSIC_SIMULATION_MAX_DURATION})`,
        );
      }
    };
  }

  Object.assign(simulation, {
    step,
    addRigidBody,
    removeRigidBody,
  });

  return simulation;
};
