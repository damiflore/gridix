// https://github.com/jsenv/core/tree/main/packages/independent/service-worker

self.importScripts("@jsenv/service-worker/src/jsenv_service_worker.js");

self.__sw__.init({
  name: "product-name",
  // logLevel: "debug",
  resources: {
    "/": true,
    ...(self.resourcesFromJsenvBuild || {}),
  },
});
