import { createPortal } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";
import { drawPath } from "../draw/path.js";

export const HighlightCanvas = ({
  world,
  worldNode,
  gameObjectToHighlight,
}) => {
  const worldViewWrapperNode = worldNode.querySelector(".world-view-wrapper");
  const canvasNodeRef = useRef();

  useEffect(() => {
    const canvasNode = canvasNodeRef.current;
    const context = canvasNode.getContext("2d");

    context.clearRect(0, 0, canvasNode.width, canvasNode.height);
    if (gameObjectToHighlight) {
      context.save();
      drawPath(gameObjectToHighlight, context);
      context.fillStyle = "orange";
      context.globalAlpha = 0.4;
      context.fill();
      context.restore();
    }
  }, [gameObjectToHighlight]);

  return createPortal(
    <canvas
      ref={canvasNodeRef}
      width={world.worldWidth}
      height={world.worldHeight}
    ></canvas>,
    worldViewWrapperNode,
  );
};
