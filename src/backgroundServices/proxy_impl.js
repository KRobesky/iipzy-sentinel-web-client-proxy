const Defs = require("iipzy-shared/src/defs");
const http = require("iipzy-shared/src/services/httpService");
const { log } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");

class Proxy {
  constructor() {
    log("Proxy.constructor", "prxy", "info");

    this.clientToken = null;
  }

  async run() {
    this.proxyDown();
    this.proxyUp();

    while (true) {
      if (this.checkClientToken()) break;
      await sleep(5*1000);
    }

    //?? TODO: handle client token change.
  }

  async checkClientToken() {
    if (!this.clientToken) {
      this.clientToken = configFile.get("clientToken");
      if (this.clientToken) {
        http.setClientTokenHeader(clientToken);
        return true;
      }
      // no client token yet.
      else return false;
    }
  }

  // requests from server proxy.
  async proxyDown() {
    while (true) {
      try {
        log("Proxy.proxyDown", "prxy", "info");
        const { data, status } = await http.post("/proxy_down", {});
         log("Proxy.proxyDown: AFTER posting: status = " + status + ", response = " + JSON.stringify(data), "prxy", "info");
         await sleep(5*1000);
      } catch (ex) {
          log("(Exception) Proxy.proxyDown: " + ex, "prxy", "error");
      }
    }
   }

  // events/updates to server proxy.
  async proxyUp() {
    while (true) {
      try {
        log("Proxy.proxyUp", "prxy", "info");
        const { data, status } = await http.post("/proxy_up", {});
         log("Proxy.proxyUp: AFTER posting: status = " + status + ", response = " + JSON.stringify(data), "prxy", "info");
         await sleep(5*1000);
      } catch (ex) {
        log("(Exception) Proxy.proxyUp: " + ex, "prxy", "error");
      }
    }
  }
}

module.exports = Proxy;