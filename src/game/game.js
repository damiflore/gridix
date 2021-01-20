import { Bloc, mutateBloc } from "./bloc.js"
import { blocEffectContainer } from "./bloc.effects.js"

export const createGame = ({ worldContainer = false, worldWidth, worldHeight, blocs } = {}) => {
  const canvas = createCanvas({
    width: worldWidth,
    height: worldHeight,
  })
  const context = canvas.getContext("2d")

  if (worldContainer) {
    const blocForWorld = {
      ...Bloc,
      name: "world",
      positionX: 0,
      positionY: 0,
      width: worldWidth,
      height: worldHeight,
      restitution: 0,
      effects: {
        ...Bloc.effects,
        ...blocEffectContainer,
      },
    }
    // il faut le garder tout en haut pour tester la collision en tout premier
    // puisqu'elle modifie la position d'un autre gameobject
    blocs.unshift(blocForWorld)
  }

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
    blocs.forEach((bloc) => {
      Object.keys(bloc.effects).forEach((key) => {
        mutateBloc(bloc, bloc.effects[key](bloc, { blocs, msEllapsed }))
      })
    })

    context.clearRect(0, 0, canvas.width, canvas.height)
    blocs.sort((leftBloc, rightBloc) => {
      if (leftBloc.positionZ > rightBloc.positionZ) {
        return 1
      }
      if (leftBloc.positionZ < rightBloc.positionZ) {
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
  let stopped = false

  const stop = () => {
    stopped = true
    window.cancelAnimationFrame(animationFrame)
  }

  const start = () => {
    tick(0)
    let msPrevious = performance.now()

    const next = () => {
      if (stopped) {
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
