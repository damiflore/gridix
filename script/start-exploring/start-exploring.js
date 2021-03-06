import { startExploring } from "@jsenv/core"
import * as jsenvConfig from "../../jsenv.config.js"

startExploring({
  ...jsenvConfig,
  compileServerPort: 3472,
  explorableConfig: {
    "app": {
      "./main.html": true,
    },
    "example": {
      "src/**/*.html": true,
      "example/**/*.html": true,
    },
    "unit tests": {
      "test/**/*.test.html": true,
    },
  },
})
