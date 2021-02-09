import React from "react"
import { addDOMEventListener } from "src/helper/dom.js"
import { GameEngineDevtools } from "./GameEngineDevtools.js"

export const DevtoolsView = ({
  onResizeTop,
  onClickInspect,
  onClickLayoutBottomSmall,
  onClickLayoutBottomMedium,
  onClickLayoutBottomBig,
  onClickCloseDevtools,
}) => {
  return (
    <div className="devtools-document">
      <DevtoolsResizeTop onResizeTop={onResizeTop} />
      <div className="devtools-head">
        <GameEngineDevtools gameEngine={window.gameEngine} />
        <ButtonInspect onClick={onClickInspect} />
        <div className="spacer"></div>
        <ButtonCloseDevtools onClick={onClickCloseDevtools} />
      </div>
      <div className="devtools-body">
        <div className="devtools-left">Left</div>
        <div className="devtools-center">Center</div>
        <div className="devtools-right">Right</div>
      </div>
      <div className="devtools-foot">
        <ButtonLayoutBottomSmall onClick={onClickLayoutBottomSmall} />
        <ButtonLayoutBottomMedium onClick={onClickLayoutBottomMedium} />
        <ButtonLayoutBottomBig onClick={onClickLayoutBottomBig} />
      </div>
    </div>
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

const ButtonInspect = () => {
  return (
    <button name="button-inspect">
      <svg viewBox="0 0 432.568 432.568">
        <g>
          <path
            d="M65.46,129.429C65.46,74.604,110.064,30,164.89,30s99.43,44.604,99.43,99.429c0,11.408-1.92,22.602-5.707,33.27
      l28.271,10.036c4.934-13.898,7.436-28.469,7.436-43.306C294.32,58.062,236.258,0,164.89,0S35.46,58.062,35.46,129.429
      c0,26.908,8.183,52.709,23.664,74.615c15.128,21.405,36.056,37.545,60.522,46.675l10.488-28.106
      C91.451,208.177,65.46,170.729,65.46,129.429z"
          />
          <path
            d="M164.89,80c27.256,0,49.43,22.174,49.43,49.43c0,0.252-0.011,0.502-0.02,0.752l-0.02,0.643l29.988,0.826l0.015-0.45
      c0.02-0.589,0.037-1.178,0.037-1.771c0-43.798-35.632-79.43-79.43-79.43c-43.797,0-79.429,35.632-79.429,79.43
      c0,24.33,10.97,47,30.098,62.197l18.662-23.489c-11.922-9.472-18.76-23.581-18.76-38.708C115.461,102.174,137.635,80,164.89,80z"
          />
          <polygon points="164.89,129.43 164.89,432.568 255.511,323.766 397.108,324.283" />
        </g>
      </svg>
    </button>
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
