const Defs = require("iipzy-shared/src/defs");
const http = require("iipzy-shared/src/services/httpService");
const { log } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");

const { handleRequest } = require("./handleProxyIO");

class Proxy {
  //constructor(clientToken) {
  constructor() {
    log("Proxy.constructor", "prxy", "info");

    //this.clientToken = clientToken;

    this.CHUNK_SIZE = 4096;
  }

  async run() {
    log("Proxy.run", "prxy", "info");

      try {
        //http.setClientTokenHeader(this.clientToken);
        this.proxyRequest();
    } catch (ex) {
      log("(Exception) Proxy.run: " + ex, "prxy", "error");
    }
  }

  // NB: assumes request is an object.
  async post_chunks(request, first_time) {
    const s = JSON.stringify(request);
    let response = null;
    for (let i = 0; i < s.length; i += this.CHUNK_SIZE) {
      const chunk = s.slice(i, i + this.CHUNK_SIZE); 
      const last_chunk = (i + this.CHUNK_SIZE) >= s.length;
      response = await http.post("/proxy_req", {chunk, last_chunk, first_time});
      //log("eventWait: writing chunk: length = " + chunk.length, "ewat", "info");
      //log("eventWait: writing chunk: chunk  = '" + chunk + "'", "ewat", "info");
    }
    return response;
  }

  // requests from server proxy.
  async proxyRequest() {
    let response = {};
    let count_rsp = 0;
    let first_time = true;
    while (true) {
      try {
        log("Proxy.proxyRequest[" + count_rsp + "] - BEFORE posting", "prxy", "info");
        //const { data : data_req, status } = await http.post("/proxy_req", {data: response, count: count_rsp});
        const { data : data_req, status } = await this.post_chunks({data: response, count: count_rsp}, first_time);
        log("Proxy.proxyRequest[" + data_req.count + "] - AFTER posting: status = " + status + ", response = " + JSON.stringify(data_req), "prxy", "info");
        first_time = false;

        try {
          log("Proxy.proxyRequest[" + data_req.count + "]: BEFORE handleDownRequest", "prxy", "info");
          const { data: data_rsp } = await handleRequest(data_req);
          response = data_rsp;

          log("Proxy.proxyRequest[" + data_req.count + "]: AFTER handleDownRequest: " + JSON.stringify(response, null, 2), "prxy", "info");
          //response = data_rsp;
          count_rsp = data_req.count;
        } catch (ex) {
          log("(Exception) Proxy.proxyRequest.1: AFTER handleDownRequest" + ex, "prxy", "error");
          log("(Exception) Proxy.proxyRequest.1: AFTER handleDownRequest - response length = " + JSON.stringify(response).length, "prxy", "error");
          await sleep(5*1000);
          response = { __hadError__: { errorMessage: ex } };
        }
        // simulate sending request to sentinel.
        //count++;
        //response = { count, data: "from sentinel"};
      } catch (ex) {

        log("(Exception) Proxy.proxyRequest.2: " + ex, "prxy", "error");
        log("(Exception) Proxy.proxyRequest.2: response length = " + JSON.stringify(response).length, "prxy", "error");
        await sleep(5*1000);
        response = {};
        first_time = true;
      }
    }
  }

  // keep-alive to server proxy.
  async proxyControl() {
    while (true) {
      try {
        log("Proxy.proxyControl", "prxy", "info");
        const { data, status } = await http.post("/proxy_ctl", {});
        //const { data, status } = await http.get("/proxy_up");
        log("Proxy.proxyControl: AFTER posting: status = " + status + ", response = " + JSON.stringify(data), "prxy", "info");
        await sleep(5*1000);
      } catch (ex) {
        log("(Exception) Proxy.proxyControl: " + ex, "prxy", "error");
      }
    }
  }
}

module.exports = Proxy;