import { useEffect, useState } from "preact/hooks";
import { addDOMEventListener } from "../helper/dom.js";
import { useNodeSize } from "../helper/hooks.js";
import { clamp } from "../math/math.js";
import { DevtoolsContent } from "./devtools_content.jsx";
import { HighlightCanvas } from "./HighlightCanvas.jsx";
import { InspectGesture } from "./InspectGesture.jsx";

export const Devtools = ({ world, worldNode }) => {
  const worldMinHeight = 150;
  const devtoolsMinHeight = 100;
  const stateFromStorage = fromStorage() || { opened: false, height: 0 };

  const [opened, openedSetter] = useState(stateFromStorage.opened);
  const [worldHeight, worldHeightSetter] = useState(0);
  const [devtoolsHeight, devtoolsHeightSetter] = useState(0);
  const [height, heightSetter] = useState(stateFromStorage.height);
  const [inspecting, inspectingSetter] = useState(false);

  const worldSize = useNodeSize({ current: worldNode });
  const heightAvailable = worldSize.height;

  const open = () => {
    openedSetter(true);
  };
  const close = () => {
    openedSetter(false);
  };

  useEffect(() => {
    world.devtools.opened = opened;
  }, [opened]);

  useEffect(() => {
    localStorage.setItem(
      "game-devtool",
      JSON.stringify({
        opened,
        height,
      }),
    );
  }, [opened, height]);

  useEffect(() => {
    // https://stackoverflow.com/questions/11941180/available-keyboard-shortcuts-for-web-applications
    // pour etre safe, le focus ne devrait pas etre dans un input etc
    // pour le moment osef
    const removeKeydownListener = addDOMEventListener(
      document,
      "keydown",
      (keydownEvent) => {
        if (keydownEvent.metaKey && keydownEvent.code === "KeyI") {
          keydownEvent.preventDefault();
          if (opened) {
            close();
          } else {
            inspectingSetter(true);
            open();
          }
        }
      },
    );
    return () => {
      removeKeydownListener();
    };
  }, [opened]);

  useEffect(() => {
    const remainingHeight = heightAvailable - worldMinHeight;
    devtoolsHeightSetter(clamp(height, devtoolsMinHeight, remainingHeight));
  }, [heightAvailable, height]);

  useEffect(() => {
    if (opened) {
      worldHeightSetter(
        clamp(heightAvailable - devtoolsHeight, worldMinHeight),
      );
    } else {
      worldHeightSetter(heightAvailable);
    }
  }, [heightAvailable, devtoolsHeight, opened]);

  useEffect(() => {
    const worldViewNode = worldNode.children[0];
    worldViewNode.style.height = `${worldHeight}px`;
  }, [worldHeight]);

  useEffect(() => {
    const worldDevtoolsNode = worldNode.children[1];
    worldDevtoolsNode.style.height = `${devtoolsHeight}px`;
  }, [devtoolsHeight]);

  useEffect(() => {
    const worldDevtoolsNode = worldNode.children[1];
    worldDevtoolsNode.style.display = opened ? "" : "none";
  }, [opened]);

  const [gameObjectInspected, gameObjectInspectedSetter] = useState(world.hero);
  const [gameObjectToHighlight, gameObjectToHighlightSetter] = useState(null);

  return (
    <>
      {inspecting ? (
        <InspectGesture
          world={world}
          worldNode={worldNode}
          onInspectHover={(gameObjectOrNull) => {
            gameObjectToHighlightSetter(gameObjectOrNull);
          }}
          onInspectSelect={(gameObjectOrNull) => {
            gameObjectInspectedSetter(gameObjectOrNull);
            gameObjectToHighlightSetter(null);

            // stop inspection
            inspectingSetter(false);
          }}
        />
      ) : null}
      {gameObjectToHighlight ? (
        <HighlightCanvas
          world={world}
          worldNode={worldNode}
          gameObjectToHighlight={gameObjectToHighlight}
        />
      ) : null}
      {opened ? (
        <DevtoolsContent
          world={world}
          inspecting={inspecting}
          gameObjectInspected={gameObjectInspected}
          onInspectStart={() => {
            inspectingSetter(true);
          }}
          onInspectStop={() => {
            inspectingSetter(false);
          }}
          onResizeTop={(data) => {
            const { moveY } = data;
            heightSetter((height) => {
              return height + moveY * -1;
            });
          }}
          onClickLayoutBottomSmall={() => {
            heightSetter(heightAvailable * 0.2);
          }}
          onClickLayoutBottomMedium={() => {
            heightSetter(heightAvailable * 0.5);
          }}
          onClickLayoutBottomBig={() => {
            heightSetter(heightAvailable * 0.8);
          }}
          onClickCloseDevtools={() => {
            close();
          }}
        />
      ) : null}
    </>
  );
};

const fromStorage = () => {
  const localStorageSource = localStorage.getItem("game-devtool");
  try {
    return JSON.parse(localStorageSource);
  } catch (e) {
    console.warn(e);
    return null;
  }
};
