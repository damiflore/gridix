import { Bloc, mutateBloc } from "./bloc.js"
import { blocEffectContainer } from "./bloc.effects.js"

export const createGame = ({
  worldContainer = false,
  drawAfterUpdate = false,
  rowCount,
  columnCount,
  cellSize = 32,
  worldMagneticGrid = false,
  blocs,
} = {}) => {
  const width = rowCount * cellSize
  const height = columnCount * cellSize
  const canvas = createCanvas({
    width,
    height,
  })
  const context = canvas.getContext("2d")

  const blocForWorld = {
    ...Bloc,
    name: "world",
    updates: {
      ...(worldMagneticGrid
        ? {
            "magnetic-grid": (world, { blocs }) => {
              blocs.forEach((bloc) => {
                if (!bloc.canMove) {
                  return
                }

                const { velocityX, positionX } = bloc
                const closestRowX = Math.round(positionX / cellSize) * cellSize
                const xDiff = positionX - closestRowX

                // x n'est pas sur la colonne et suffisament proche de celle ci
                // et se déplace suffisament lentement
                console.log(xDiff, velocityX)
                if (xDiff && Math.abs(xDiff) < 5 && Math.abs(velocityX) < 5) {
                  // le bloc est a gauche de la colonne la plus proche
                  if (xDiff < 0) {
                    console.log("attire vers la droite", {
                      positionX,
                      closestRowX,
                    })
                    bloc.velocityX = 50
                  }
                  // le bloc est a droite
                  if (xDiff > 0) {
                    console.log("attire vers la gauche", {
                      positionX,
                      closestRowX,
                    })
                    bloc.velocityX = -50
                  }
                }
              })
            },
          }
        : {}),
    },
    effects: {
      ...(worldContainer ? blocEffectContainer : {}),
    },
    positionX: 0,
    positionY: 0,
    width,
    height,
    restitution: 0,
  }
  blocs.push(blocForWorld)

  const tickCallbacks = []
  const tick = (msEllapsed) => {
    tickCallbacks.forEach((tickCallback) => {
      tickCallback(msEllapsed)
    })

    blocs.forEach((bloc) => {
      Object.keys(bloc.updates).forEach((key) => {
        mutateBloc(bloc, bloc.updates[key](bloc, { blocs, msEllapsed }))
      })
    })
    if (drawAfterUpdate) {
      draw()
    }
    blocs.forEach((bloc) => {
      Object.keys(bloc.effects).forEach((key) => {
        mutateBloc(bloc, bloc.effects[key](bloc, { blocs, msEllapsed }))
      })
    })

    draw()
  }

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    blocs.sort((leftBloc, rightBloc) => {
      if (leftBloc.zIndex > rightBloc.zIndex) {
        return 1
      }
      if (leftBloc.zIndex < rightBloc.zIndex) {
        return -1
      }
      if (leftBloc.positionY > rightBloc.positionY) {
        return 1
      }
      if (leftBloc.positionY < rightBloc.positionY) {
        return -1
      }
      if (leftBloc.positionX > rightBloc.positionX) {
        return 1
      }
      if (leftBloc.positionX < rightBloc.positionX) {
        return -1
      }
      return 0
    })
    blocs.forEach((bloc) => {
      bloc.draw(bloc, context)
    })
  }

  let animationFrame
  let started = false

  const stop = () => {
    started = false
    window.cancelAnimationFrame(animationFrame)
  }

  const start = () => {
    if (started) return
    started = true

    tick(0)
    let msPrevious = performance.now()

    const next = () => {
      if (!started) {
        return
      }
      animationFrame = window.requestAnimationFrame(() => {
        const msNow = performance.now()
        const msEllapsed = msNow - msPrevious
        msPrevious = msNow
        tick(msEllapsed)
        next()
      })
    }

    next()
  }

  const blocsFromPoint = ({ x, y }) => {
    return blocs.filter((unit) => {
      return context.isPointInPath(unit.path, x, y)
    })
  }

  return {
    canvas,
    start,
    stop,
    draw,
    blocsFromPoint,
    addTickCallback: (callback) => {
      tickCallbacks.push(callback)
    },
  }
}

const createCanvas = ({ width, height }) => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}
