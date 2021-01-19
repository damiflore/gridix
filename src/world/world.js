export const createWorld = ({ width, height, units } = {}) => {
  const canvas = createCanvas({
    width,
    height,
  })
  const context = canvas.getContext("2d")

  const tick = (msEllapsed) => {
    units.forEach((unit) => {
      unit.tick(msEllapsed)
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
