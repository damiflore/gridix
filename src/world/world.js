import { unitCollidesWithUnit } from "src/unit/unit.js"
import { getDistanceBetweenTwoPoints } from "src/physic/geometry.js"

export const createWorld = ({ width, height, units } = {}) => {
  const canvas = createCanvas({
    width,
    height,
  })
  const context = canvas.getContext("2d")

  const world = { width, height, restitution: 0.9 }

  const detectCollisions = () => {
    units.forEach((unit) => {
      unit.isColliding = false
    })

    units.forEach((unit, index) => {
      const performCollision = detectUnitCollision(unit, units.slice(index + 1), world)
      if (performCollision) {
        performCollision()
      }
    })
  }

  const applyVelocity = (msEllapsed) => {
    units.forEach((unit) => {
      if (unit.vx || unit.vy) {
        unit.move({
          x: unit.x + unit.vx * (msEllapsed / 1000),
          y: unit.y + unit.vy * (msEllapsed / 1000),
        })
      }
    })
  }

  const tick = (msEllapsed) => {
    applyVelocity(msEllapsed)
    detectCollisions(msEllapsed)
    units.forEach((unit) => {
      const props = unit.tick(unit, msEllapsed)
      if (props) {
        Object.assign(unit, props)
      }
    })
  }

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    units
      .sort((leftUnit, rightUnit) => leftUnit.z - rightUnit.z)
      .forEach((unit) => {
        unit.draw(context)
      })
  }

  const start = () => {
    tick(0)
    draw()
    let msPrevious = performance.now()

    let stop = () => {}
    const next = () => {
      const animationFrame = requestAnimationFrame(() => {
        const msNow = performance.now()
        const msEllapsed = msNow - msPrevious
        msPrevious = msNow
        tick(msEllapsed)
        draw()
        next()
      })
      stop = () => {
        window.cancelAnimationFrame(animationFrame)
      }
    }

    next()

    return stop
  }

  const unitsFromPoint = ({ x, y }) => {
    return units.filter((unit) => {
      return context.isPointInPath(unit.path, x, y)
    })
  }

  window.units = units

  return {
    ...world,
    canvas,
    start,
    unitsFromPoint,
  }
}

export const detectUnitCollision = (unit, units, world) => {
  const worldRestitution = world.restitution
  const worldWidth = world.width
  const worldHeight = world.height

  let collidesWithWorld = false
  let xInsideWorld = unit.x
  let yInsideWorld = unit.y
  let xVelocityAfterImpact = unit.vx
  let yVelocityAfterImpact = unit.vy
  const isCircle = Boolean(unit.radius)
  if (isCircle) {
    if (unit.x < unit.radius) {
      collidesWithWorld = true
      xInsideWorld = unit.radius
      xVelocityAfterImpact = Math.abs(unit.vx) * worldRestitution
    } else if (unit.x > worldWidth - unit.radius) {
      collidesWithWorld = true
      xInsideWorld = worldWidth - unit.radius
      xVelocityAfterImpact = -Math.abs(unit.vx) * worldRestitution
    }
    if (unit.y < unit.radius) {
      collidesWithWorld = true
      yInsideWorld = unit.radius
      yVelocityAfterImpact = Math.abs(unit.vy) * worldRestitution
    } else if (unit.y > worldHeight - unit.radius) {
      collidesWithWorld = true
      yInsideWorld = worldHeight - unit.radius
      yVelocityAfterImpact = -Math.abs(unit.vy) * worldRestitution
    }
  }
  // rectangle then
  else if (unit.x < 0) {
    collidesWithWorld = true
    xInsideWorld = 0
    xVelocityAfterImpact = Math.abs(unit.vx) * worldRestitution
  } else if (unit.x + unit.width > worldWidth) {
    collidesWithWorld = true
    xInsideWorld = worldWidth - unit.width
    xVelocityAfterImpact = -Math.abs(unit.vx) * worldRestitution
  } else if (unit.y < 0) {
    collidesWithWorld = true
    yInsideWorld = 0
    yVelocityAfterImpact = Math.abs(unit.vy) * worldRestitution
  } else if (unit.y + unit.height > worldHeight) {
    collidesWithWorld = true
    yInsideWorld = worldHeight - unit.height
    yVelocityAfterImpact = -Math.abs(unit.vy) * worldRestitution
  }
  if (collidesWithWorld) {
    unit.move({ x: xInsideWorld, y: yInsideWorld })
    unit.vx = xVelocityAfterImpact
    unit.vy = yVelocityAfterImpact
  }

  const otherUnit = units.find((unitCandidate) => {
    if (unitCandidate === unit) {
      return false
    }
    const otherUnit = unitCandidate
    const collides = unitCollidesWithUnit(otherUnit, unit)
    return collides
  })
  if (!otherUnit) {
    return null
  }
  return () => {
    unit.isColliding = true
    otherUnit.isColliding = true

    if (unit.isBounceEnabled || otherUnit.isBounceEnabled) {
      const collisionVector = {
        x: otherUnit.x - unit.x,
        y: otherUnit.y - unit.y,
      }
      const distanceBetweenUnits = getDistanceBetweenTwoPoints(otherUnit, unit)
      const collisionVectorNormalized = {
        x: collisionVector.x / distanceBetweenUnits,
        y: collisionVector.y / distanceBetweenUnits,
      }
      const velocityRelativeVector = {
        x: unit.vx - otherUnit.vx,
        y: unit.vy - otherUnit.vy,
      }
      let speed =
        velocityRelativeVector.x * collisionVectorNormalized.x +
        velocityRelativeVector.y * collisionVectorNormalized.y
      speed *= Math.min(unit.restitution, otherUnit.restitution)

      if (speed >= 0) {
        const impulse = (2 * speed) / (unit.mass + otherUnit.mass)
        if (unit.isBounceEnabled) {
          unit.vx -= impulse * otherUnit.mass * collisionVectorNormalized.x
          unit.vy -= impulse * otherUnit.mass * collisionVectorNormalized.y
        }
        if (otherUnit.isBounceEnabled) {
          otherUnit.vx += impulse * unit.mass * collisionVectorNormalized.x
          otherUnit.vy += impulse * unit.mass * collisionVectorNormalized.y
        }
      }
    }
  }
}

const createCanvas = ({ width, height }) => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

// const addUnit = (unit) => {
//   const index = getSortedIndexForValueInArray(unit, units)
//   units.splice(index, 0, unit)

//   return () => {
//     const index = units.indexOf(unit)
//     if (index > -1) {
//       units.splice(index, 1)
//     }
//   }
// }
