/*
 * This file uses "@jsenv/core" to start a development server.
 * https://github.com/jsenv/jsenv-core/tree/master/docs/dev_server#jsenv-dev-server
 */

import { startDevServer } from "@jsenv/core";
import { requestCertificate } from "@jsenv/https-local";
import { jsenvPluginCommonJs } from "@jsenv/plugin-commonjs";
import { jsenvPluginExplorer } from "@jsenv/plugin-explorer";
import { jsenvPluginPreact } from "@jsenv/plugin-preact";
import open from "open";

const { certificate, privateKey } = requestCertificate();

export const devServer = await startDevServer({
  sourceDirectoryUrl: new URL("../src/", import.meta.url),
  port: 3472,
  https: { certificate, privateKey },
  plugins: [
    jsenvPluginExplorer({
      groups: {
        "app": {
          "./index.html": true,
        },
        "example": {
          "src/**/*.html": true,
          "example/**/*.html": true,
        },
        "unit tests": {
          "test/**/*.test.html": true,
        },
      },
    }),
    jsenvPluginPreact(),
    jsenvPluginCommonJs({
      include: {
        "./node_modules/phaser/src/phaser.js": true,
        "./node_modules/react/index.js": true,
        "./node_modules/react-dom/index.js": {
          external: ["react"],
        },
      },
    }),
  ],
});

if (process.argv.includes("--open")) {
  open(`${devServer.origin}/index.html`);
}
