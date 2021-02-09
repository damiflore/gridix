import React from "react"
import { addDOMEventListener } from "src/helper/dom.js"
import { GameEngineDevtools } from "./GameEngineDevtools.js"

export const DevtoolsView = ({
  inspecting,
  onResizeTop,
  onInspectStart,
  onInspectStop,
  onClickLayoutBottomSmall,
  onClickLayoutBottomMedium,
  onClickLayoutBottomBig,
  onClickCloseDevtools,
}) => {
  return (
    <>
      <DevtoolsResizeTop onResizeTop={onResizeTop} />
      <div className="devtools-head">
        <InputInspect
          inspecting={inspecting}
          onInspectStart={onInspectStart}
          onInspectStop={onInspectStop}
        />
        <GameEngineDevtools gameEngine={window.gameEngine} />
        <div className="spacer"></div>
        <ButtonCloseDevtools onClick={onClickCloseDevtools} />
      </div>
      <div className="devtools-body">
        <div className="devtools-left"></div>
        <div className="devtools-center">Center</div>
        <div className="devtools-right"></div>
      </div>
      <div className="devtools-foot">
        <ButtonLayoutBottomSmall onClick={onClickLayoutBottomSmall} />
        <ButtonLayoutBottomMedium onClick={onClickLayoutBottomMedium} />
        <ButtonLayoutBottomBig onClick={onClickLayoutBottomBig} />
      </div>
    </>
  )
}

const useDragGesture = () => {
  const nodeRef = React.useRef()

  const [dragGesture, dragGestureSetter] = React.useState({ type: "end" })

  React.useEffect(() => {
    const node = nodeRef.current

    let removeMousemoveListener = () => {}
    let removeMouseupListener = () => {}
    const removeMousedownListener = addDOMEventListener(node, "mousedown", (mousedownEvent) => {
      dragGestureSetter({
        type: "start",
      })

      removeMouseupListener = addDOMEventListener(document, "mouseup", () => {
        removeMousemoveListener()
        dragGestureSetter({
          type: "end",
        })
      })

      const startPageX = mousedownEvent.pageX
      const startPageY = mousedownEvent.pageY
      let previousPageX = startPageX
      let previousPageY = startPageY

      removeMousemoveListener = addDOMEventListener(document, "mousemove", (mousemoveEvent) => {
        const nowPageX = mousemoveEvent.pageX
        const nowPageY = mousemoveEvent.pageY
        const moveX = nowPageX - previousPageX
        const moveY = nowPageY - previousPageY
        previousPageX = nowPageX
        previousPageY = nowPageY
        dragGestureSetter({
          type: "move",
          data: {
            moveX,
            moveY,
          },
        })
      })
    })

    return () => {
      removeMousedownListener()
      removeMousemoveListener()
      removeMouseupListener()
    }
  }, [])

  return [nodeRef, dragGesture]
}

const DevtoolsResizeTop = ({
  // onResizeTopStart,
  onResizeTop,
  // onResizeTopEnd
}) => {
  const [nodeRefForDrag, dragGesture] = useDragGesture()
  const dragGesturePreviousRef = React.useRef(dragGesture)

  React.useEffect(() => {
    // const dragGesturePrevious = dragGesturePreviousRef.current
    dragGesturePreviousRef.current = dragGesture

    // if (dragGesturePrevious.type === "end" && dragGesture.type === "start") {
    //   onResizeTopStart()
    // }
    if (dragGesture.type === "move") {
      onResizeTop(dragGesture.data)
    }
    // if (dragGesturePrevious.type !== "end" && dragGesture.type === "end") {
    //   onResizeTopEnd()
    // }
  }, [dragGesture])

  return <div ref={nodeRefForDrag} className="devtools-resize-top"></div>
}

const InputInspect = ({ inspecting, onInspectStart, onInspectStop }) => {
  React.useEffect(() => {
    if (!inspecting) {
      return null
    }

    return addDOMEventListener(document, "keydown", (keydownEvent) => {
      if (keydownEvent.key === "Escape") {
        keydownEvent.preventDefault()
        onInspectStop()
      }
    })
  }, [inspecting])

  return (
    <label className="devtools-input">
      <input
        type="checkbox"
        checked={inspecting}
        onChange={(e) => {
          if (e.target.checked) {
            onInspectStart()
          } else {
            onInspectStop()
          }
        }}
      />
      <svg viewBox="0 0 100 100">
        <g>
          <rect
            x="20"
            y="20"
            width="60"
            height="50"
            rx="5"
            ry="5"
            stroke="currentColor"
            strokeWidth="5"
            fill="transparent"
          ></rect>
          <polygon
            transform="translate(20, 20)"
            points="40,30 70,50, 40,70"
            fill="currentColor"
          ></polygon>
        </g>
      </svg>
    </label>
  )
}

const ButtonLayoutBottomSmall = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <svg viewBox="0 0 100 100">
        <g>
          <rect x="10" y="80" width="80" height="20" fill="currentColor" />
        </g>
      </svg>
    </button>
  )
}

const ButtonLayoutBottomMedium = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <svg viewBox="0 0 100 100">
        <g>
          <rect x="10" y="50" width="80" height="50" fill="currentColor" />
        </g>
      </svg>
    </button>
  )
}

const ButtonLayoutBottomBig = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <svg viewBox="0 0 100 100">
        <g>
          <rect x="10" y="20" width="80" height="80" fill="currentColor" />
        </g>
      </svg>
    </button>
  )
}

const ButtonCloseDevtools = ({ onClick }) => {
  return (
    <button name="button-close-devtools" onClick={onClick}>
      <svg viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        />
      </svg>
    </button>
  )
}
