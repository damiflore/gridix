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

import React from "react"
import ReactDOM from "react-dom"
import { injectStylesheetIntoDocument } from "src/helper/dom.js"
import { Devtools } from "./devtools.js"

const devtoolsCssUrl = new URL("./devtools.css", import.meta.url)

export const injectDevtools = ({ world, worldNode }) => {
  injectStylesheetIntoDocument(devtoolsCssUrl)

  const worldDevtoolsNode = document.createElement("div")
  worldDevtoolsNode.className = "world-devtools"
  worldNode.appendChild(worldDevtoolsNode)

  ReactDOM.render(<Devtools world={world} worldNode={worldNode}></Devtools>, worldDevtoolsNode)
}
