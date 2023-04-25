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

let serverAddress = undefined;
let clientToken = undefined;
let logLevel = undefined;

let server = null;

let proxy = null;

function createServer() {
  log("main.createServer", "strt", "info");
  try {
    const port = 23167; //Defs.port_sentinel_web_client_proxy;
    server = app.listen(port, async () => {
      log(`Listening on port ${port}...`, "main", "info");
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

  serverAddress = configFile.get("serverAddress");
  //?? TODO http.setBaseURL(serverAddress);
  http.setBaseURL("iipzy.net:8002");

  clientToken = configFile.get("clientToken");

  logLevel = configFile.get("logLevel");
  if (logLevel) setLogLevel(logLevel);

  await sleep(1000);

  /*
  const { stdout, stderr } = await spawnAsync("os-id", []);
  if (stderr)
      log("(Error) os-id: stderr = " + stderr, "preq", "error");
  else
  {
    log("main: os_id = " + stdout, "preq", "info");
    set_os_id(stdout);
  }
  */
  configFile.watch(configWatchCallback);

  await sleep(1000);
  
  createServer();

  
  await sleep(1000);

  proxy = new Proxy(configFile);
  await sleep(1000);
  proxy.run();
}

processErrorHandler();

main();

function configWatchCallback() {
  log("configWatchCallback", "main", "info");

  // TODO.
  return;

  // handle server address change.
  const serverAddress_ = configFile.get("serverAddress");
  if (serverAddress_ !== serverAddress) {
    log(
      "configWatchCallback: serverAddress change: old = " +
        serverAddress +
        ", new = " +
        serverAddress_,
      "main",
      "info"
    );

    if (serverAddress_) {
      serverAddress = serverAddress_;
      http.setBaseURL(serverAddress);
    }
  }

  clientToken_ = configFile.get("clientToken");
  if (clientToken_ !== clientToken) {
    log(
      "configWatchCallback: clientToken change: old = " +
        clientToken +
        ", new = " +
        clientToken_,
      "main",
      "info"
    );

    if (clientToken_) {
      clientToken = clientToken_;
      http.setClientTokenHeader(clientToken);
    }
  }

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
