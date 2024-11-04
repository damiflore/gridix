import { build } from "@jsenv/core";
import { jsenvPluginPreact } from "@jsenv/plugin-preact";

await build({
  sourceDirectoryUrl: new URL("../src/", import.meta.url),
  buildDirectoryUrl: new URL("../dist/", import.meta.url),
  entryPoints: {
    "./index.html": "index.html",
  },
  plugins: [jsenvPluginPreact()],
  serviceWorkers: {
    "./service-worker.js": "./service-worker.js",
  },
  bundling: {
    js_module: {
      chunks: {
        vendors: { "file:///**/node_modules/": true },
      },
    },
  },
  // disable preserveEntrySignatures otherwise an empty (and useless) file is generated
  // as main js entry point
  preserveEntrySignatures: false,
  minification: true,
  assetManifestFile: true,
  assetManifestFileRelativeUrl: "asset-manifest.json",
});
