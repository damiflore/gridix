import React from "react"
import ReactDOM from "react-dom"
import { addDOMEventListener } from "src/helper/dom.js"
import { drawPath } from "src/draw/path.js"

export const InspectCanvas = ({
  world,
  worldNode,
  onGameObjectHoveredChange,
  onGameObjectSelectedChange,
}) => {
  const worldViewWrapperNode = worldNode.querySelector(".world-view-wrapper")
  const canvasNodeRef = React.useRef()
  const [gameObjectHovered, gameObjectHoveredSetter] = React.useState(null)

  React.useEffect(() => {
    const canvasNode = canvasNodeRef.current
    return addDOMEventListener(canvasNode, "mousemove", (mousemoveEvent) => {
      const x = mousemoveEvent.layerX
      const y = mousemoveEvent.layerY
      const pointerPoint = {
        x,
        y,
      }
      const gameObjectUnderPointer = world.gameObjectFromPoint(pointerPoint)
      gameObjectHoveredSetter(gameObjectUnderPointer)
      onGameObjectHoveredChange(gameObjectUnderPointer)
    })
  }, [])

  React.useEffect(() => {
    const canvasNode = canvasNodeRef.current
    return addDOMEventListener(canvasNode, "click", (clickEvent) => {
      const x = clickEvent.layerX
      const y = clickEvent.layerY
      const pointerPoint = {
        x,
        y,
      }
      const gameObjectUnderPointer = world.gameObjectFromPoint(pointerPoint)
      onGameObjectSelectedChange(gameObjectUnderPointer)
    })
  }, [])

  React.useEffect(() => {
    const canvasNode = canvasNodeRef.current
    const context = canvasNode.getContext("2d")

    context.clearRect(0, 0, canvasNode.width, canvasNode.height)
    if (gameObjectHovered) {
      context.save()
      drawPath(gameObjectHovered, context)
      context.fillStyle = "orange"
      context.globalAlpha = 0.4
      context.fill()
      context.restore()
    }
  }, [gameObjectHovered])

  return ReactDOM.createPortal(
    <canvas ref={canvasNodeRef} width={world.worldWidth} height={world.worldHeight}></canvas>,
    worldViewWrapperNode,
  )
}
