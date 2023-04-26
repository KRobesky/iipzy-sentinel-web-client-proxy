const Defs = require("iipzy-shared/src/defs");
const { log } = require("iipzy-shared/src/utils/logFile");

const http = require("../ipc/httpService");

//http.setBaseURL("localhost:8002");
const sentinelIPAddress = "localhost:8002";

async function handleDownRequest(request) {
  try {
    log("handleDownRequest: " + JSON.stringify(request, null, 2), "prxy", "info");
    /*
    log("handleDownRequest: method = " + request.method, "prxy", "info");
    log("handleDownRequest: originalUrl = " + request.originalUrl, "prxy", "info");key
    log("handleDownRequest: body = " + request.body, "prxy", "info");
    log("handleDownRequest: headers = " + request.headers, "prxy", "info");
    */
    //return;

    // set custom headers
    for (let i = 0; i < request.headers.length; i ++) {
      const { key, value } = request.headers[i];
      //log("handleDownRequest.setHeaders: key = " + key + ", value = " + value, "prxy", "info");
      http.setHeader(key, value);
    }

    switch (request.method) {
      case "DELETE" : {
        return await http.delete("http://" + sentinelIPAddress + request.originalUrl, {});
        break;
      }
      case "GET" : {
        return await http.get("http://" + sentinelIPAddress + request.originalUrl, {});
        break;
      }
      case "POST" : {
        return await http.post("http://" + sentinelIPAddress + request.originalUrl, request.body);
        break;
      }
      case "PUT" : {
        return await http.put("http://" + sentinelIPAddress + request.originalUrl, request.body);
        break;
      }
      default: {

      }
    }
  } catch (ex) {
    log("(Exception) handleDownRequest: " + ex, "prxy", "error");
  }
}

module.exports = { handleDownRequest };

