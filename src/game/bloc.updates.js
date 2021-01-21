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
    return {
      velocityX: velocityX * friction,
      velocityY: velocityY * friction,
      velocityZ: velocityZ * friction,
    }
  },
}

export const blocUpdateVelocity = {
  velocity: (
    { velocityX, velocityY, velocityZ, positionX, positionY, positionZ },
    { msEllapsed },
  ) => {
    const secondsEllapsed = msEllapsed / 1000

    return {
      positionX: positionX + velocityX * secondsEllapsed,
      positionY: positionY + velocityY * secondsEllapsed,
      positionZ: positionZ + velocityZ * secondsEllapsed,
    }
  },
}
