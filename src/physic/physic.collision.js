import { forEachCollidingPairs } from "src/collision/collision.js";
import {
  getScalarProduct,
  getVectorialProduct,
  normalizeVector,
  scaleVector,
} from "src/geometry/vector.js";
import { motionAllowedFromMass } from "./physic.motion.js";

const relaxationCount = 5;
const positionResolutionCoef = 1;

export const handleCollision = ({
  rigidBodies,
  bounceThreshold,
  onRigidBodyCollision,
  collisionPositionResolution,
  collisionVelocityImpact, // could be renamed collisionImpulse
}) => {
  let collisionIterations = relaxationCount;
  while (collisionIterations--) {
    forEachCollidingPairs({
      rigidBodies,
      // iterate on rigid, non static, non sleeping pairs
      canCollidePredicate: (a, b) => {
        const aIsStatic = a.sleeping || !motionAllowedFromMass(a.mass);
        const bIsStatic = b.sleeping || !motionAllowedFromMass(b.mass);
        if (aIsStatic && bIsStatic) {
          return false;
        }
        return true;
      },
      pairCollisionCallback: (a, b, collisionInfo) => {
        onRigidBodyCollision({
          a,
          b,
          collisionInfo,
        });
        resolveCollision({
          a,
          b,
          collisionInfo,
          collisionPositionResolution,
          collisionVelocityImpact,
          bounceThreshold,
        });
      },
    });
  }
};

const resolveCollision = ({
  a,
  b,
  collisionInfo,
  collisionPositionResolution,
  collisionVelocityImpact,
  bounceThreshold,
}) => {
  const aMass = a.mass;
  const bMass = b.mass;
  const aMotionAllowedByMass = motionAllowedFromMass(aMass);
  const bMotionAllowedByMass = motionAllowedFromMass(bMass);
  const aMassInverted = aMotionAllowedByMass ? 1 / aMass : 0;
  const bMassInverted = bMotionAllowedByMass ? 1 / bMass : 0;
  const massInvertedSum = aMassInverted + bMassInverted;
  if (a.debugCollisionResolution || b.debugCollisionResolution) {
    a.debugCollisionResolution = false;
    b.debugCollisionResolution = false;
    // eslint-disable-next-line no-debugger
    debugger;
  }
  if (collisionPositionResolution) {
    adjustPositionToSolveCollision(a, b, {
      aMassInverted,
      bMassInverted,
      massInvertedSum,
      collisionInfo,
    });
  }
  if (collisionVelocityImpact) {
    applyCollisionImpactOnVelocity(a, b, {
      aMassInverted,
      bMassInverted,
      massInvertedSum,
      bounceThreshold,
      collisionInfo,
    });
  }
};

const adjustPositionToSolveCollision = (
  a,
  b,
  { aMassInverted, bMassInverted, massInvertedSum, collisionInfo },
) => {
  const { collisionDepth, collisionNormalX, collisionNormalY } = collisionInfo;
  const correctionTotal = collisionDepth / massInvertedSum;
  const correction = correctionTotal * positionResolutionCoef;
  const aPositionXCorrection =
    a.centerX + collisionNormalX * correction * aMassInverted * -1;
  const aPositionYCorrection =
    a.centerY + collisionNormalY * correction * aMassInverted * -1;
  a.centerX = aPositionXCorrection;
  a.centerY = aPositionYCorrection;

  const bPositionXCorrection =
    b.centerX + collisionNormalX * correction * bMassInverted;
  const bPositionYCorrection =
    b.centerY + collisionNormalY * correction * bMassInverted;
  b.centerX = bPositionXCorrection;
  b.centerY = bPositionYCorrection;
};

const applyCollisionImpactOnVelocity = (
  a,
  b,
  {
    aMassInverted,
    bMassInverted,
    massInvertedSum,
    bounceThreshold,
    collisionInfo,
  },
) => {
  const aVelocityX = a.velocityX;
  const aVelocityY = a.velocityY;
  const bVelocityX = b.velocityX;
  const bVelocityY = b.velocityY;
  const aVelocityAngle = a.velocityAngle;
  const bVelocityAngle = b.velocityAngle;

  const {
    collisionNormalX,
    collisionNormalY,
    collisionStartX,
    collisionStartY,
    collisionEndX,
    collisionEndY,
  } = collisionInfo;
  const collisionNormal = {
    x: collisionNormalX,
    y: collisionNormalY,
  };

  // angular impulse
  const massStartScale = bMassInverted / massInvertedSum;
  const massEndScale = aMassInverted / massInvertedSum;
  const collisionStartXScaledWithMass = collisionStartX * massStartScale;
  const collisionStartYScaledWithMass = collisionStartY * massStartScale;
  const collisionEndXScaledWithMass = collisionEndX * massEndScale;
  const collisionEndYScaledWithMass = collisionEndY * massEndScale;
  const collisionXScaledSum =
    collisionStartXScaledWithMass + collisionEndXScaledWithMass;
  const collisionYScaledSum =
    collisionStartYScaledWithMass + collisionEndYScaledWithMass;
  const aCollisionCenterDiff = {
    x: collisionXScaledSum - a.centerX,
    y: collisionYScaledSum - a.centerY,
  };
  const bCollisionCenterDiff = {
    x: collisionXScaledSum - b.centerX,
    y: collisionYScaledSum - b.centerY,
  };

  const aVelocityXAfterAngularImpulse =
    aVelocityX + -1 * aVelocityAngle * aCollisionCenterDiff.y;
  const aVelocityYAfterAngularImpulse =
    aVelocityY + aVelocityAngle * aCollisionCenterDiff.x;
  const bVelocityXAfterAngularImpulse =
    bVelocityX + -1 * bVelocityAngle * bCollisionCenterDiff.y;
  const bVelocityYAfterAngularImpulse =
    bVelocityY + bVelocityAngle * bCollisionCenterDiff.x;
  const velocityXDiff =
    bVelocityXAfterAngularImpulse - aVelocityXAfterAngularImpulse;
  const velocityYDiff =
    bVelocityYAfterAngularImpulse - aVelocityYAfterAngularImpulse;
  const velocityRelativeToNormal = getScalarProduct(
    { x: velocityXDiff, y: velocityYDiff },
    collisionNormal,
  );
  // if objects moving apart ignore
  if (velocityRelativeToNormal > 0) {
    return;
  }
  // not enough velocity to trigger the bounce
  if (-velocityRelativeToNormal < bounceThreshold) {
    return;
  }

  const aRotationInertia = rotationInertiaFromGameObject(a);
  const bRotationInertia = rotationInertiaFromGameObject(b);

  // normal impulse
  const restitutionForImpact = Math.min(a.restitution, b.restitution);
  const aCollisionNormalProduct = getVectorialProduct(
    aCollisionCenterDiff,
    collisionNormal,
  );
  const bCollisionNormalProduct = getVectorialProduct(
    bCollisionCenterDiff,
    collisionNormal,
  );
  const impulseStart = -(1 + restitutionForImpact);
  const normalImpulseDivider =
    massInvertedSum +
    aCollisionNormalProduct * aCollisionNormalProduct * aRotationInertia +
    bCollisionNormalProduct * bCollisionNormalProduct * bRotationInertia;
  const normalImpulseScale =
    (impulseStart * velocityRelativeToNormal) / normalImpulseDivider;
  const normalImpulseX = collisionNormalX * normalImpulseScale;
  const normalImpulseY = collisionNormalY * normalImpulseScale;
  const aVelocityXAfterNormalImpulse =
    aVelocityX - normalImpulseX * aMassInverted;
  const aVelocityYAfterNormalImpulse =
    aVelocityY - normalImpulseY * aMassInverted;
  const bVelocityXAfterNormalImpulse =
    bVelocityX + normalImpulseX * bMassInverted;
  const bVelocityYAfterNormalImpulse =
    bVelocityY + normalImpulseY * bMassInverted;
  const aVelocityAngleAfterNormalImpulse =
    aVelocityAngle -
    aCollisionNormalProduct * normalImpulseScale * aRotationInertia;
  const bVelocityAngleAfterNormalImpulse =
    bVelocityAngle +
    bCollisionNormalProduct * normalImpulseScale * bRotationInertia;

  // tangent impulse
  const tangent = scaleVector(
    normalizeVector({
      x: velocityXDiff - collisionNormalX * velocityRelativeToNormal,
      y: velocityYDiff - collisionNormalY * velocityRelativeToNormal,
    }),
    -1,
  );
  const velocityRelativeToTangent = getScalarProduct(
    { x: velocityXDiff, y: velocityYDiff },
    tangent,
  );
  const aCollisionTangentProduct = getVectorialProduct(
    aCollisionCenterDiff,
    tangent,
  );
  const bCollisionTangentProduct = getVectorialProduct(
    bCollisionCenterDiff,
    tangent,
  );
  const tangentImpulseDivider =
    massInvertedSum +
    aCollisionTangentProduct * aCollisionTangentProduct * aRotationInertia +
    bCollisionTangentProduct * bCollisionTangentProduct * bRotationInertia;
  const frictionForImpact = Math.min(a.friction, b.friction);
  const tangentImpulseScale = Math.min(
    (impulseStart * velocityRelativeToTangent * frictionForImpact) /
      tangentImpulseDivider,
    // friction should be less than force in normal direction
    normalImpulseScale,
  );
  const tangentImpulseX = tangent.x * tangentImpulseScale;
  const tangentImpulseY = tangent.y * tangentImpulseScale;
  const aVelocityXAfterTangentImpulse =
    aVelocityXAfterNormalImpulse - tangentImpulseX * aMassInverted;
  const aVelocityYAfterTangentImpulse =
    aVelocityYAfterNormalImpulse - tangentImpulseY * aMassInverted;
  const bVelocityXAfterTangentImpulse =
    bVelocityXAfterNormalImpulse + tangentImpulseX * bMassInverted;
  const bVelocityYAfterTangentImpulse =
    bVelocityYAfterNormalImpulse + tangentImpulseY * bMassInverted;
  const aVelocityAngleAfterTangentImpulse =
    aVelocityAngleAfterNormalImpulse -
    aCollisionTangentProduct * tangentImpulseScale * aRotationInertia;
  const bVelocityAngleAfterTangentImpulse =
    bVelocityAngleAfterNormalImpulse +
    bCollisionTangentProduct * tangentImpulseScale * bRotationInertia;

  a.velocityX = aVelocityXAfterTangentImpulse;
  a.velocityY = aVelocityYAfterTangentImpulse;
  a.velocityAngle = aVelocityAngleAfterTangentImpulse;

  b.velocityX = bVelocityXAfterTangentImpulse;
  b.velocityY = bVelocityYAfterTangentImpulse;
  b.velocityAngle = bVelocityAngleAfterTangentImpulse;
};

const rotationInertiaFromGameObject = (gameObject) => {
  const { shapeName } = gameObject;

  if (shapeName === "circle") {
    return rotationInertiaFromCircle(gameObject);
  }

  if (shapeName === "rectangle") {
    return rotationInertiaFromRectangle(gameObject);
  }

  return 0;
};

const rotationInertiaFromCircle = ({ mass, radius, rotationInertiaCoef }) => {
  if (!motionAllowedFromMass(mass)) {
    return 0;
  }

  const diameter = radius * radius;
  const massByDiameter = mass * diameter;
  const inertiaForCircle = massByDiameter * rotationInertiaCoef;

  return inertiaForCircle;
};

const rotationInertiaFromRectangle = ({
  mass,
  width,
  height,
  rotationInertiaCoef,
}) => {
  if (!motionAllowedFromMass(mass)) {
    return 0;
  }

  const perimeter = width * width + height * height;
  const massByPerimeter = mass * perimeter;
  const intertiaForRectangle = 1 / (massByPerimeter * rotationInertiaCoef);
  // const intertiaForRectangle = massByPerimeter * rotationInertiaCoef

  return intertiaForRectangle;
};
