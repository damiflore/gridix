import { unitCollidesWithUnit } from "src/unit/unit.js"
import { getDistanceBetweenTwoPoints } from "src/physic/geometry.js"

export const createWorld = ({ width, height, units } = {}) => {
  const canvas = createCanvas({
    width,
    height,
  })
  const context = canvas.getContext("2d")

  const detectCollisions = () => {
    units.forEach((unit) => {
      unit.isColliding = false
    })

    units.forEach((unit, index) => {
      units.slice(index + 1).forEach((otherUnit) => {
        if (unitCollidesWithUnit(unit, otherUnit)) {
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
      })
    })
  }

  const worldRestitution = 0.9
  const detectWoldEdgeCollision = () => {
    units.forEach((unit) => {
      const isCircle = Boolean(unit.radius)
      if (isCircle) {
        if (unit.x < unit.radius) {
          unit.vx = Math.abs(unit.vx) * worldRestitution
          unit.move({ x: unit.radius })
        } else if (unit.x > width - unit.radius) {
          unit.vx = -Math.abs(unit.vx) * worldRestitution
          unit.move({ x: width - unit.radius })
        }
        if (unit.y < unit.radius) {
          unit.vy = Math.abs(unit.vy) * worldRestitution
          unit.move({ y: unit.radius })
        } else if (unit.y > height - unit.radius) {
          unit.vy = -Math.abs(unit.vy) * worldRestitution
          unit.move({ y: height - unit.radius })
        }
      }
      // rectangle then
      else if (unit.x < 0) {
        unit.vx = Math.abs(unit.vx) * worldRestitution
        unit.move({ x: 0 })
      } else if (unit.x + unit.width > width) {
        unit.vx = -Math.abs(unit.vx) * worldRestitution
        unit.move({ x: width - unit.width })
      } else if (unit.y < 0) {
        unit.vy = Math.abs(unit.vy) * worldRestitution
        unit.move({ y: 0 })
      } else if (unit.y + unit.height > height) {
        unit.vy = -Math.abs(unit.vy) * worldRestitution
        unit.move({ y: height - unit.height })
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
    detectWoldEdgeCollision()
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

  return {
    canvas,
    start,
    unitsFromPoint,
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
