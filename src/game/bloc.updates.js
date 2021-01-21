export const blocUpdateAcceleration = {
  acceleration: ({ accelerationX, accelerationY, accelerationZ }, { msEllapsed }) => {
    const secondsEllapsed = msEllapsed / 1000

    return {
      velocityX: accelerationX * secondsEllapsed,
      velocityY: accelerationY * secondsEllapsed,
      velocityZ: accelerationZ * secondsEllapsed,
    }
  },
}

// https://codepen.io/OliverBalfour/post/implementing-velocity-acceleration-and-friction-on-a-canvas
export const blocUpdateFriction = {
  friction: ({ velocityX, velocityY, velocityZ, friction }) => {
    const frictionCoef = 1 - friction
    return {
      velocityX: velocityX * frictionCoef,
      velocityY: velocityY * frictionCoef,
      velocityZ: velocityZ * frictionCoef,
    }
  },
}

// export const blocUpdateFriction = {
//   friction: ({ velocityX, velocityY, friction }) => {
//     let speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
//     const angle = Math.atan2(velocityY, velocityX)
//     if (speed > friction) {
//       speed -= friction
//     } else {
//       speed = 0
//     }
//     return {
//       velocityX: Math.cos(angle) * speed,
//       velocityY: Math.sin(angle) * speed,
//     }
//   },
// }

export const blocUpdateVelocity = {
  velocity: (
    { velocityX, velocityY, velocityZ, positionX, positionY, positionZ },
    { msEllapsed },
  ) => {
    const secondsEllapsed = msEllapsed / 1000

    return {
      positionX: Math.round(positionX + velocityX * secondsEllapsed),
      positionY: Math.round(positionY + velocityY * secondsEllapsed),
      positionZ: Math.round(positionZ + velocityZ * secondsEllapsed),
    }
  },
}
