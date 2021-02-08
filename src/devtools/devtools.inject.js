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

  const devtoolsDocument = createDOM(`<div class="devtools">
  <div class="devtools-resize-top"></div>
  <div class="devtools-header">
      <button name="button-inspect">
        <svg viewBox="0 0 432.568 432.568">
          <g>
            <path d="M65.46,129.429C65.46,74.604,110.064,30,164.89,30s99.43,44.604,99.43,99.429c0,11.408-1.92,22.602-5.707,33.27
      l28.271,10.036c4.934-13.898,7.436-28.469,7.436-43.306C294.32,58.062,236.258,0,164.89,0S35.46,58.062,35.46,129.429
      c0,26.908,8.183,52.709,23.664,74.615c15.128,21.405,36.056,37.545,60.522,46.675l10.488-28.106
      C91.451,208.177,65.46,170.729,65.46,129.429z"/>
            <path d="M164.89,80c27.256,0,49.43,22.174,49.43,49.43c0,0.252-0.011,0.502-0.02,0.752l-0.02,0.643l29.988,0.826l0.015-0.45
      c0.02-0.589,0.037-1.178,0.037-1.771c0-43.798-35.632-79.43-79.43-79.43c-43.797,0-79.429,35.632-79.429,79.43
      c0,24.33,10.97,47,30.098,62.197l18.662-23.489c-11.922-9.472-18.76-23.581-18.76-38.708C115.461,102.174,137.635,80,164.89,80z"/>
            <polygon points="164.89,129.43 164.89,432.568 255.511,323.766 397.108,324.283"/>
          </g>
        </svg>
      </button>
      <button name="button-layout-balanced">
        <svg viewBox="0 0 100 100">
          <g>
            <rect x="10" y="10" width="80" height="35" fill="currentColor" />
            <rect x="10" y="55" width="80" height="35" fill="currentColor" />
          </g>
        </svg>
      </button>
      <button name="button-layout-devtool-first">
        <svg viewBox="0 0 100 100">
          <g>
            <rect x="10" y="10" width="80" height="20" fill="currentColor" />
            <rect x="10" y="40" width="80" height="50" fill="currentColor" />
          </g>
        </svg>
      </button>
      <button name="button-layout-game-first">
        <svg viewBox="0 0 100 100">
          <g>
            <rect x="10" y="10" width="80" height="50" fill="currentColor" />
            <rect x="10" y="70" width="80" height="20" fill="currentColor" />
          </g>
        </svg>
      </button>
      <button name="button-close-devtools">
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>
  </div>
  <div class="devtools-body">
    <div class="devtools-placeholder"></div>
  </div>
</div>`)

  const devtoolsRootNode = devtoolsDocument.querySelector(".devtools")
  const resizeTopNode = devtoolsRootNode.querySelector(".devtools-resize-top")
  worldContainer.appendChild(devtoolsRootNode)

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

  openDevtools()
}
