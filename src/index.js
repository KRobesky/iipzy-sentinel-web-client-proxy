const express = require("express");
const app = express();
const http_ = require("http");
const fs = require("fs");

const Defs = require("iipzy-shared/src/defs");
const { log, logInit, setLogLevel } = require("iipzy-shared/src/utils/logFile");
const logPath = "/var/log/iipzy";
logInit(logPath, "iipzy-sentinel-web-client-proxy");
const http = require("iipzy-shared/src/services/httpService");
const { ConfigFile } = require("iipzy-shared/src/utils/configFile");
//const { set_os_id } = require("iipzy-shared/src/utils/globals");
//const { spawnAsync } = require("iipzy-shared/src/utils/spawnAsync");
const { processErrorHandler, sleep } = require("iipzy-shared/src/utils/utils");

const Proxy = require("./backgroundServices/proxy");

require("./startup/routes")(app);

const userDataPath = "/etc/iipzy";
let configFile = null;

let clientToken = null;

let logLevel = undefined;

let server = null;

let proxy = null;

function createServer() {
  log("main.createServer", "strt", "info");
  try {
    server = app.listen(Defs.port_sentinel_web_client_proxy, async () => {
      log(`Listening on port ${Defs.port_sentinel_web_client_proxy}...`, "main", "info");
    });
  } catch (ex) {
    log("(Exception) main.createServer: " + ex, "strt", "error");
    return false;
  }
  return true;
}

async function main() {
  configFile = new ConfigFile(userDataPath, Defs.configFilename);
  await configFile.init();
  
  logLevel = configFile.get("logLevel");
  if (logLevel) setLogLevel(logLevel);

  // wait forever to get a client token.
  while (true) {
    clientToken = configFile.get("clientToken");
    if (clientToken) {
      http.setClientTokenHeader(clientToken);
      break;
    }
    await sleep(5*1000);
  }

  http.setBaseURL(configFile.get("serverAddress") + ":" + Defs.port_sentinel_web_server_proxy);

  configFile.watch(configWatchCallback);
  
  createServer();

  await sleep(1000);

  proxy = new Proxy(clientToken);
  proxy.run();
}

processErrorHandler();

main();

function configWatchCallback() {
  log("configWatchCallback", "main", "info");

  // handle log level change.
  const logLevel_ = configFile.get("logLevel");
  if (logLevel_ !== logLevel) {
    log(
      "configWatchCallback: logLevel change: old = " +
        logLevel +
        ", new = " +
        logLevel_,
      "main",
      "info"
    );
  }
  if (logLevel_) {
    // tell log.
    logLevel = logLevel_;
    setLogLevel(logLevel);
  }
}

// process.on("uncaughtException", function(err) {
//   log("(Exception) uncaught exception: " + err, "strt", "error");
//   log("stopping in 2 seconds", "strt", "info");
//   setTimeout(() => {
//     process.exit(1);
//   }, 2 * 1000);
// });

module.exports = server;
