import pino, { Logger } from "pino";
import "pino-pretty";

const LOG_LEVEL_DATA = {
  "*": "silent",
  home: "info",
  api: "debug",
};

const logLevels = new Map<string, string>(Object.entries(LOG_LEVEL_DATA));

export function getLogLevel(logger: string): string {
  // if string starts with api/ then return api
  // else return string
  if (logger.startsWith("api/")) {
    return logLevels.get("api") || logLevels.get("*") || "info";
  }

  return logLevels.get(logger) || logLevels.get("*") || "info";
}

export function getLogger(name: string): Logger {
  return pino({
    name,
    level: getLogLevel(name),
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  });
}
