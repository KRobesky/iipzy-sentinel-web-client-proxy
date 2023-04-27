const Defs = require("iipzy-shared/src/defs");
const http = require("iipzy-shared/src/services/httpService");
const { log } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");

const { handleDownRequest } = require("./handleProxyIO");

class Proxy {
  constructor(configFile) {
    log("Proxy.constructor", "prxy", "info");

    this.configFile = configFile;
    this.clientToken = null;
  }

  async run() {
    log("Proxy.run", "prxy", "info");

      try {
        await this.checkClientToken();
        this.proxyDown();
        this.proxyUp();

        while (!this.clientToken) {
          await sleep(5*1000);
          await this.checkClientToken();
        }
    } catch (ex) {
      log("(Exception) Proxy.run: " + ex, "prxy", "error");
    }

    //?? TODO: handle client token change.
  }

  async checkClientToken() {
    if (!this.clientToken) {
      this.clientToken = this.configFile.get("clientToken");
      if (this.clientToken) {
        http.setClientTokenHeader(this.clientToken);
        return true;
      }
      // no client token yet.
      else return false;
    }
  }

  //?? TODO - heartbeat - so that server side can detect if client goes off line.

  // requests from server proxy.
  async proxyDown() {
    let response = {};
    let count_rsp = 0;
    while (true) {
      try {
        log("Proxy.proxyDown - BEFORE posting: count_rsp = " + count_rsp, "prxy", "info");
        const { data : data_req, status } = await http.post("/proxy_down", {data: response, count: count_rsp});
        log("Proxy.proxyDown - AFTER posting: count_req = " + data_req.count + ", status = " + status + ", response = " + JSON.stringify(data_req), "prxy", "info");

        try {
          log("Proxy.proxyDown: BEFORE handleDownRequest", "prxy", "info");
           const { data: data_rsp, status } = await handleDownRequest(data_req);
          log("Proxy.proxyDown: AFTER handleDownRequest" + JSON.stringify(data_rsp, null, 2), "prxy", "info");
          response = data_rsp;
          count_rsp = data_req.count;
        } catch (ex) {
          log("(Exception) Proxy.proxyDown: AFTER handleDownRequest" + ex, "prxy", "error");
        }
        // simulate sending request to sentinel.
        //count++;
        //response = { count, data: "from sentinel"};
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
        //const { data, status } = await http.get("/proxy_up");
        log("Proxy.proxyUp: AFTER posting: status = " + status + ", response = " + JSON.stringify(data), "prxy", "info");
        await sleep(5*1000);
      } catch (ex) {
        log("(Exception) Proxy.proxyUp: " + ex, "prxy", "error");
      }
    }
  }
}

module.exports = Proxy;