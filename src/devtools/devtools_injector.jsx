import { render } from "preact";
import { injectStylesheetIntoDocument } from "../helper/dom.js";
import { Devtools } from "./devtools.jsx";

const devtoolsCssUrl = new URL("./devtools.css", import.meta.url);

export const injectDevtools = ({ world, worldNode }) => {
  injectStylesheetIntoDocument(devtoolsCssUrl);

  const worldDevtoolsNode = document.createElement("div");
  worldDevtoolsNode.className = "world-devtools";
  worldNode.appendChild(worldDevtoolsNode);

  render(
    <Devtools world={world} worldNode={worldNode}></Devtools>,
    worldDevtoolsNode,
  );
};
