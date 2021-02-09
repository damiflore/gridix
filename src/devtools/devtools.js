import React from "react"
import { addDOMEventListener } from "src/helper/dom.js"
import { DevtoolsView } from "./devtools.view.js"
import { clamp } from "src/math/math.js"

export const Devtools = ({ world, worldContainer }) => {
  const worldMinHeight = 150
  const devtoolsMinHeight = 100
  const stateFromStorage = fromStorage() || { opened: false, height: 0 }

  const [opened, openedSetter] = React.useState(stateFromStorage.opened)
  const [worldHeight, worldHeightSetter] = React.useState(0)
  const [devtoolsHeight, devtoolsHeightSetter] = React.useState(0)
  const [height, heightSetter] = React.useState(stateFromStorage.height)
  const [heightAvailable, heightAvailableSetter] = React.useState(0)

  const open = () => {
    openedSetter(true)
  }
  const close = () => {
    openedSetter(false)
  }

  React.useEffect(() => {
    world.devtools.opened = opened
  }, [opened])

  React.useEffect(() => {
    localStorage.setItem(
      "game-devtool",
      JSON.stringify({
        opened,
        height,
      }),
    )
  }, [opened, height])

  React.useEffect(() => {
    // https://stackoverflow.com/questions/11941180/available-keyboard-shortcuts-for-web-applications
    // pour etre safe, le focus ne devrait pas etre dans un input etc
    // pour le moment osef
    const removeKeydownListener = addDOMEventListener(document, "keydown", (keydownEvent) => {
      if (keydownEvent.metaKey && keydownEvent.code === "KeyI") {
        keydownEvent.preventDefault()
        if (opened) {
          close()
        } else {
          open()
        }
      }
    })
    return () => {
      removeKeydownListener()
    }
  }, [opened])

  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      heightAvailableSetter(entry.contentRect.height)
    })
    heightAvailableSetter(worldContainer.getBoundingClientRect().height)
    observer.observe(worldContainer)
    return () => {
      observer.disconnect()
    }
  }, [])

  React.useEffect(() => {
    const remainingHeight = heightAvailable - worldMinHeight
    devtoolsHeightSetter(clamp(height, devtoolsMinHeight, remainingHeight))
  }, [heightAvailable, height])

  React.useEffect(() => {
    if (opened) {
      worldHeightSetter(clamp(heightAvailable - devtoolsHeight, worldMinHeight))
    } else {
      worldHeightSetter(heightAvailable)
    }
  }, [heightAvailable, devtoolsHeight, opened])

  React.useEffect(() => {
    const worldRootNode = worldContainer.children[0]
    worldRootNode.style.height = `${worldHeight}px`
  }, [worldHeight])

  React.useEffect(() => {
    const devtoolsRootNode = worldContainer.children[1]
    devtoolsRootNode.style.height = `${devtoolsHeight}px`
  }, [devtoolsHeight])

  React.useEffect(() => {
    const devtoolsRootNode = worldContainer.children[1]
    devtoolsRootNode.style.display = opened ? "" : "none"
  }, [opened])

  return opened ? (
    <DevtoolsView
      onResizeTop={(data) => {
        const { moveY } = data
        heightSetter((height) => {
          return height + moveY * -1
        })
      }}
      onClickLayoutBottomSmall={() => {
        heightSetter(heightAvailable * 0.2)
      }}
      onClickLayoutBottomMedium={() => {
        heightSetter(heightAvailable * 0.5)
      }}
      onClickLayoutBottomBig={() => {
        heightSetter(heightAvailable * 0.8)
      }}
      onClickCloseDevtools={() => {
        close()
      }}
    />
  ) : null
}

const fromStorage = () => {
  const localStorageSource = localStorage.getItem("game-devtool")
  try {
    return JSON.parse(localStorageSource)
  } catch (e) {
    console.warn(e)
    return null
  }
}
