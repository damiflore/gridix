import { startBuildServer } from "@jsenv/core";
import { requestCertificate } from "@jsenv/https-local";
import open from "open";

const { certificate, privateKey } = requestCertificate();

export const buildServer = await startBuildServer({
  logLevel: process.env.LOG_LEVEL,
  https: { certificate, privateKey },
  buildDirectoryUrl: new URL("../dist/", import.meta.url),
});

if (process.argv.includes("--open")) {
  open(buildServer.origin);
}
