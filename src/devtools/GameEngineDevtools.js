import React from "react"

export const GameEngineDevtools = ({ gameEngine }) => {
  const [paused, pausedSetter] = React.useState(false)
  React.useEffect(() => {
    gameEngine.onPausedStateChange = (paused) => {
      pausedSetter(paused)
    }
  }, [])

  React.useEffect(() => {
    gameEngine.pauseGameLoop()
    return () => {
      gameEngine.resumeGameLoop()
    }
  }, [])

  return (
    <>
      {/* <GameEngineIndicator paused={paused} /> */}
      <GameEngineButtonPlayback
        paused={paused}
        onClickResume={() => {
          gameEngine.resumeGameLoop()
        }}
        onClickPause={() => {
          gameEngine.pauseGameLoop()
        }}
      />
      <GameEngineButtonStep
        paused={paused}
        onClick={() => {
          gameEngine.nextGameStep()
        }}
      />
    </>
  )
}

// const GameEngineIndicator = ({ paused }) => {
//   if (paused) {
//     return (
//       <button className="game-engine-indicator game-engine-indicator--off">
//         <svg viewBox="0 0 100 100">
//           <circle cx="50" cy="50" r="15" fill="currentColor" />
//         </svg>
//       </button>
//     )
//   }

//   return (
//     <button className="game-engine-indicator game-engine-indicator--on">
//       <svg viewBox="0 0 100 100">
//         <circle className="circle" cx="50" cy="50" r="15" fill="currentColor" />
//         <circle className="ring" cx="50" cy="50" r="50" stroke="currentColor" />
//       </svg>
//     </button>
//   )
// }

const GameEngineButtonPlayback = ({ paused, onClickResume, onClickPause }) => {
  if (paused) {
    return (
      <button className="game-engine-button-resume" onClick={onClickResume} title="Play game">
        <svg viewBox="0 0 100 100">
          <polygon points="40,30 70,50, 40,70" fill="currentColor"></polygon>
        </svg>
      </button>
    )
  }

  return (
    <button className="game-engine-button-pause" onClick={onClickPause} title="Pause game">
      <svg viewBox="0 0 50 50">
        {/* <circle opacity=".4" fill="currentColor" cx="25" cy="25" r="25" /> */}
        <path d="M30 17a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V18a1 1 0 0 1 1-1h2zm-8 0a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V18a1 1 0 0 1 1-1h2z" />
      </svg>
    </button>
  )
}

const GameEngineButtonStep = ({ paused, onClick }) => {
  const disabled = !paused

  return (
    <button
      className="game-engine-button-step"
      disabled={disabled}
      onClick={onClick}
      title="Play one step"
    >
      <svg viewBox="0 0 100 100">
        <g transform="translate(-5)">
          <polygon points="40,30 70,50, 40,70" fill="currentColor"></polygon>
          <line x1="70" y1="30" x2="70" y2="70" strokeWidth="6" stroke="currentColor"></line>
        </g>
      </svg>
      `
    </button>
  )
}
