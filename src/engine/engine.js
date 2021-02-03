const UPDATE_MAX_MS = 10
const DRAW_MAX_MS = 10

export const createGameEngine = ({
  framePerSecond = 60,
  maxUpdatePerFrame = 30,
  update = () => {},
  draw = () => {},
}) => {
  let previousMs
  let frame
  let looping = false
  let paused = false

  if (import.meta.dev) {
    const updateOriginal = update
    update = (stepInfo) => {
      const updateStartMs = Date.now()
      updateOriginal(stepInfo)
      const updateEndMs = Date.now()
      const updateDuration = updateEndMs - updateStartMs
      if (updateDuration > DRAW_MAX_MS) {
        console.warn(
          `update is too slow, took ${updateDuration}ms (should be less than ${UPDATE_MAX_MS})`,
        )
      }
    }

    const drawOriginal = draw
    draw = (stepInfo) => {
      const drawStartMs = Date.now()
      drawOriginal(stepInfo)
      const drawEndMs = Date.now()
      const drawDuration = drawEndMs - drawStartMs
      if (drawDuration > DRAW_MAX_MS) {
        console.warn(
          `draw is too slow, took ${drawDuration}ms (should be less than ${DRAW_MAX_MS})`,
        )
      }
    }
  }

  const gameEngine = {
    framePerSecond,
    maxUpdatePerFrame,
  }

  const stepInfo = {
    // maybe rename stepInfo.time into stepInfo.gameTime ?
    time: 0,
    timePerFrame: 0,
    framePerSecondEstimation: 0,
    memoryUsed: null,
    memoryLimit: null,
    // frameCount: 0,
  }

  const step = () => {
    // reread them in case they got updated from outside
    const { framePerSecond, maxUpdatePerFrame } = gameEngine
    const timePerFrame = 1 / framePerSecond
    stepInfo.timePerFrame = timePerFrame

    const msPerFrame = timePerFrame * 1000
    // stepInfo.frameCount++

    const currentMs = Date.now()
    // when it is called for the first time,
    // or after resumeGameLoop() or nextGameStep()
    // previousMs is undefined and running update once is what we want
    const ellapsedMs = previousMs ? currentMs - previousMs : msPerFrame
    previousMs = currentMs

    const updateIdealCount = Math.floor(ellapsedMs / msPerFrame)
    let updateCount
    if (updateIdealCount > maxUpdatePerFrame) {
      console.warn(
        `too many updates to perform, only ${maxUpdatePerFrame} out of ${updateIdealCount} iterations will be done`,
      )
      updateCount = maxUpdatePerFrame
    } else {
      updateCount = updateIdealCount
    }
    stepInfo.framePerSecondEstimation = Math.round(1000 / ellapsedMs)
    stepInfo.memoryUsed = Math.round(window.performance.memory.usedJSHeapSize / 1048576)
    stepInfo.memoryLimit = window.performance.memory.jsHeapSizeLimit / 1048576
    while (updateCount--) {
      stepInfo.time += timePerFrame
      update(stepInfo)
    }

    draw(stepInfo)
  }

  const gameLoop = () => {
    if (!looping) {
      return
    }
    frame = requestAnimationFrame(gameLoop)
    if (paused) {
      return
    }
    step()
  }

  const startGameLoop = () => {
    if (looping) {
      return
    }
    looping = true
    gameLoop()
  }

  const pauseGameLoop = () => {
    if (paused) {
      return
    }
    paused = true
  }

  const resumeGameLoop = () => {
    if (!paused) {
      return
    }
    paused = false
    previousMs = undefined
  }

  const nextGameStep = () => {
    previousMs = undefined
    step()
  }

  const stopGameLoop = () => {
    if (!looping) {
      return
    }
    looping = false
    window.cancelAnimationFrame(frame)
    previousMs = undefined
  }

  Object.assign(gameEngine, {
    startGameLoop,
    pauseGameLoop,
    resumeGameLoop,
    nextGameStep,
    stopGameLoop,
  })

  return gameEngine
}
