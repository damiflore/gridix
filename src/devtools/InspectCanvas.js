import React from "react"
import ReactDOM from "react-dom"
import { addDOMEventListener } from "src/helper/dom.js"

export const InspectCanvas = ({ world, worldNode }) => {
  const worldViewWrapperNode = worldNode.querySelector(".world-view-wrapper")
  const canvasNodeRef = React.useRef()

  React.useEffect(() => {
    const canvasNode = canvasNodeRef.current
    return addDOMEventListener(canvasNode, "mousemove", (mousemoveEvent) => {
      const x = mousemoveEvent.layerX
      const y = mousemoveEvent.layerY
      const pointerPoint = {
        x,
        y,
      }
      const gameObjectUnderClick = world.gameObjectFromPoint(pointerPoint)
      console.log(gameObjectUnderClick)
    })
  }, [])

  return ReactDOM.createPortal(<canvas ref={canvasNodeRef}></canvas>, worldViewWrapperNode)
}
