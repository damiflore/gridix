import React from "react"

export const GameEngineDevtools = ({ gameEngine }) => {
  const [paused, pausedSetter] = React.useState(gameEngine.isPaused())
  React.useEffect(() => {
    gameEngine.onPausedStateChange = (paused) => {
      pausedSetter(paused)
    }
  }, [])

  return (
    <>
      <GameEngineIndicator paused={paused} />
      <GameEngineButtonPlayback
        paused={paused}
        onClickResume={() => {
          gameEngine.resumeGameLoop()
        }}
        onClickPause={() => {
          gameEngine.pauseGameLoop()
        }}
      />
    </>
  )
}

const GameEngineIndicator = ({ paused }) => {
  if (paused) {
    return (
      <button className="game-engine-indicator game-engine-indicator--off">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="15" fill="currentColor" />
        </svg>
      </button>
    )
  }

  return (
    <button className="game-engine-indicator game-engine-indicator--on">
      <svg viewBox="0 0 100 100">
        <circle className="circle" cx="50" cy="50" r="15" fill="currentColor" />
        <circle className="ring" cx="50" cy="50" r="50" stroke="currentColor" />
      </svg>
    </button>
  )
}

const GameEngineButtonPlayback = ({ paused, onClickResume, onClickPause }) => {
  if (paused) {
    return (
      <button className="game-engine-button-resume" onClick={onClickResume}>
        <svg viewBox="0 0 50 50">
          {/* <circle opacity=".4" fill="currentColor" cx="25" cy="25" r="25" /> */}
          <path d="M21.35 16.12a.878.878 0 0 0-.901.009.946.946 0 0 0-.449.81V33.06c0 .334.17.642.449.811a.888.888 0 0 0 .9.01l12.187-8.062A.946.946 0 0 0 34 25a.944.944 0 0 0-.464-.819L21.35 16.12z" />
        </svg>
      </button>
    )
  }

  return (
    <button className="game-engine-button-pause" onClick={onClickPause}>
      <svg viewBox="0 0 50 50">
        {/* <circle opacity=".4" fill="currentColor" cx="25" cy="25" r="25" /> */}
        <path d="M30 17a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V18a1 1 0 0 1 1-1h2zm-8 0a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V18a1 1 0 0 1 1-1h2z" />
      </svg>
    </button>
  )
}

// const GameEngineButtonPause = () => {}

// const GameEngineButtonStep = () => {}
