/**

On va commencer par le truc numéro un:

Un bouton ouvrir les devtools.
Lorsqu'on clique dessus:

- Le jeu est mit en pause
Le bouton "inspecter" permet (comme dans chrome devtool) de voir
les éléments au survol de la souris. Et lorsque l'on click sur un élement
qu'il s'ouvre des informations sur cet élement

Comment dessiner sur le canvas ?
Je suppose qu'on a besoin d'un canvas dédié (surtout si le jeu est en pause)

Lorsqu'on ferme les devtools

- Le jeu reprend

*/

import { injectStylesheetIntoDocument } from "src/helper/dom.js"
import { createDevtoolsDocument } from "./devtools.dom.js"

const devtoolsCssUrl = new URL("./devtools.css", import.meta.url)

export const injectDevtools = ({ worldContainer }) => {
  const worldRootNode = worldContainer.children[0]
  const worldMinHeight = 150
  const devtoolsMinHeight = 50
  let devtoolsOpened = false
  let devtoolsHeight = 0
  let closeDevtools = () => {}

  injectStylesheetIntoDocument(devtoolsCssUrl)

  // https://stackoverflow.com/questions/11941180/available-keyboard-shortcuts-for-web-applications
  // pour etre safe, le focus ne devrait pas etre dans un input etc
  // pour le moment osef
  document.addEventListener("keydown", (keydownEvent) => {
    if (keydownEvent.metaKey && keydownEvent.code === "KeyI") {
      keydownEvent.preventDefault()
      if (devtoolsOpened) {
        closeDevtools()
      } else {
        openDevtools()
      }
    }
  })

  const saveDevtoolState = () => {
    localStorage.setItem(
      "game-devtool",
      JSON.stringify({
        opened: devtoolsOpened,
        height: devtoolsHeight,
      }),
    )
  }

  const openDevtools = async () => {
    if (devtoolsOpened) return
    devtoolsOpened = true
    saveDevtoolState()

    const devtoolsDocument = createDevtoolsDocument()

    const devtoolsRootNode = devtoolsDocument.querySelector(".devtools")
    const resizeTopNode = devtoolsRootNode.querySelector(".devtools-resize-top")
    worldContainer.appendChild(devtoolsRootNode)

    const updateDevtoolsHeight = (devtoolsNewHeight) => {
      const availableHeight = worldContainer.offsetHeight
      const remainingHeight = availableHeight - worldMinHeight
      devtoolsHeight = Math.min(Math.max(devtoolsNewHeight, devtoolsMinHeight), remainingHeight)
      const worldHeight = Math.max(availableHeight - devtoolsHeight, worldMinHeight)

      worldRootNode.style.height = `${worldHeight}px`
      devtoolsRootNode.style.height = `${devtoolsHeight}px`

      saveDevtoolState()
    }

    devtoolsRootNode.querySelector(`button[name="button-layout-balanced"]`).onclick = () => {
      const availableHeight = worldContainer.offsetHeight
      updateDevtoolsHeight(availableHeight * 0.5)
    }
    devtoolsRootNode.querySelector(`button[name="button-layout-devtool-first"]`).onclick = () => {
      const availableHeight = worldContainer.offsetHeight
      updateDevtoolsHeight(availableHeight * 0.8)
    }
    devtoolsRootNode.querySelector(`button[name="button-layout-game-first"]`).onclick = () => {
      const availableHeight = worldContainer.offsetHeight
      updateDevtoolsHeight(availableHeight * 0.2)
    }
    devtoolsRootNode.querySelector(`button[name="button-close-devtools"]`).onclick = () => {
      closeDevtools()
    }

    // faudrais un resize observer aussi pour mettre a jour
    // mais bon plus tard
    const observer = new ResizeObserver((entries) => {
      const devtoolResized = entries.find((entry) => entry.target === devtoolsRootNode)
      if (devtoolResized) {
        updateDevtoolsHeight(devtoolResized.contentRect.height)
      } else {
        // const entry = entries[0]
        updateDevtoolsHeight(devtoolsRootNode.offsetHeight)
      }
    })

    observer.observe(worldContainer)
    observer.observe(devtoolsRootNode)

    resizeTopNode.onmousedown = (mousedownEvent) => {
      let startPageY = mousedownEvent.pageY
      const startHeight = devtoolsRootNode.offsetHeight
      document.onmousemove = (mousemoveEvent) => {
        const nowPageY = mousemoveEvent.pageY
        const heightToAdd = startPageY - nowPageY
        const height = startHeight + heightToAdd
        // si la hauteur des devtools < 30px mettons
        // -> alors on ferme les devtools ?
        updateDevtoolsHeight(height)
      }
      document.onmouseup = () => {
        document.onmousemove = () => {}
      }
    }

    closeDevtools = () => {
      devtoolsOpened = false
      saveDevtoolState()
      closeDevtools = () => {}

      worldContainer.removeChild(devtoolsRootNode)
      observer.disconnect()
    }
  }

  const gameDevtool = fromStorage() || {}
  if (gameDevtool.opened) {
    openDevtools()
  }
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
