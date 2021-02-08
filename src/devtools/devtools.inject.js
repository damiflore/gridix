/**

On va commencer par le truc numéro un:

Un bouton ouvrir les devtools.
Lorsqu'on clique dessus:

- Le jeu est mit en pause
- On lazy load (dynamic import) des devtools
- Un seul bouton: inspecter
Le bouton "inspecter" permet (comme dans chrome devtool) de voir
les éléments au survol de la souris. Et lorsque l'on click sur un élement
qu'il s'ouvre des informations sur cet élement

Lorsqu'on ferme les devtools

- Le jeu reprend

*/

import { createDOM, injectStylesheetIntoDocument } from "src/helper/dom.js"

const devtoolsCssUrl = new URL("./devtools.css", import.meta.url)

export const injectDevtools = ({ worldContainer }) => {
  injectStylesheetIntoDocument(devtoolsCssUrl)

  const devtoolsRootNode = createDOM(`<div class="devtools">
  <div class="devtools-resize-top"></div>
  <div class="devtools-header">
      <button name="button-close-devtools">X</button>
      <button name="button-display-mode-devtool-first">

      </button>
  </div>
  <div class="devtools-body">
    <div class="devtools-placeholder"></div>
  </div>
</div>`)

  const devtoolsRootNode = document.createElement("div")
  devtoolsRootNode.className = "devtools"
  worldContainer.appendChild(devtoolsRootNode)

  const resizeTop = document.createElement("div")
  resizeTop.className = "devtools-resize-top"
  devtoolsRootNode.appendChild(resizeTop)

  const placeholder = document.createElement("div")
  placeholder.className = "devtools-placeholder"
  devtoolsRootNode.appendChild(placeholder)

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

  let devtoolsOpened = false
  let closeDevtools = () => {}

  const openDevtools = async () => {
    if (devtoolsOpened) return
    devtoolsOpened = true

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

    resizeTop.onmousedown = (mousedownEvent) => {
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
      closeDevtools = () => {}

      observer.disconnect()
    }
  }

  const worldRootNode = worldContainer.children[0]
  const worldMinHeight = 150
  const devtoolsMinHeight = 50
  const updateDevtoolsHeight = (devtoolsNewHeight) => {
    const availableHeight = worldContainer.offsetHeight
    const remainingHeight = availableHeight - worldMinHeight
    const devtoolsHeight = Math.min(Math.max(devtoolsNewHeight, devtoolsMinHeight), remainingHeight)
    const worldHeight = Math.max(availableHeight - devtoolsHeight, worldMinHeight)

    worldRootNode.style.height = `${worldHeight}px`
    devtoolsRootNode.style.height = `${devtoolsHeight}px`
  }
}
