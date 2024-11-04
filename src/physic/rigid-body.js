export const RIGID_BODY_PHYSIC_PROPS = {
  centerX: 0,
  centerY: 0,
  // negative angle -> rotate clockwise
  // positive angle -> rotate counterclockwise
  angle: 0,
  angleLocked: false,

  velocityX: 0,
  velocityY: 0,
  velocityAngle: 0,

  forceX: 0,
  forceY: 0,
  forceAngle: 0,

  // Object with negatice, 0, or infinite mass cannot move.
  // colliding such object has no impact on the object itself
  // big mass are less impacted by collision with object with smaller mass
  mass: 1,

  // friction is involved into collision resolution
  // this represents a part of the energy lost in the collision
  friction: 0.8,

  // reistance of the environment to the object moving
  // just like air, water oppose slows down/speed up a movement
  // (depending the direction of the wind etc)
  frictionAmbient: 0.02,

  // ratio of energy sent back to something colliding into this game object
  // 0: the object absorbs all the energy of the collision
  // 1: object sends back all the energy of the collision
  restitution: 0.2,

  rotationInertiaCoef: 0.2,
};

export const RIGID_BODY_SLEEPING_PROPS = {
  sleeping: false,
  lastNotableMotionTime: 0,
  centerXPrev: undefined,
  centerYPrev: undefined,
  anglePrev: undefined,
  forceXWhenSleepStarted: 0,
  forceYWhenSleepStarted: 0,
  forceAngleWhenSleepStarted: 0,
  velocityXWhenSleepStarted: 0,
  velocityYWhenSleepStarted: 0,
  velocityAngleWhenSleepStarted: 0,
};

const RIGID_BODY_PROPS = {
  rigid: true,
  ...RIGID_BODY_PHYSIC_PROPS,
  ...RIGID_BODY_SLEEPING_PROPS,
  debugMotion: false,
  debugCollisionResolution: false,
  debugCollisionDetection: false,
  debugSleep: false,
};

export const createRigidBody = (props) => {
  return {
    ...RIGID_BODY_PROPS,
    forces: [],
    ...props,
  };
};
