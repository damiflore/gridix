export const createRigidBody = () => {
  return {
    rigid: true,
    hitbox: true,
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
    // centerXWhenSleepStarted: 0,
    // centerYWhenSleepStarted: 0,
    // angleWhenSleepStarted: 0,

    debugMotion: false,
    debugCollisionResolution: false,
    debugCollisionDetection: false,
    debugSleep: false,

    centerX: 0,
    centerY: 0,
    // negative angle -> rotate clockwise
    // positive angle -> rotate counterclockwise
    angle: 0,
    angleLocked: false,

    forces: [],
    forceX: 0,
    forceY: 0,
    forceAngle: 0,
    // Object with negavite, 0, or infinite mass cannot move.
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

    velocityX: 0,
    velocityY: 0,
    velocityAngle: 0,
  };
};
