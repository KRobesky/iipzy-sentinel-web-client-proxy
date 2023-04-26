const axios = require("axios");
const http = require("http");

const Defs = require("iipzy-shared/src/defs");
const { log } = require("iipzy-shared/src/utils/logFile");

const httpInstance = axios.create({
  httpAgent: new http.Agent({
    keepAlive: true
  }),
  validateStatus: function(status) {
    // return success for all http response codes.
    //console.log("-------validateStatus: status = " + status);
    return true;
  }
});

function handleHttpException(title, ex) {
  log("(Exception) " + title + ": " + ex + ", code = " + ex.code, "http", "info");
  let status = Defs.httpStatusException;
  switch (ex.code) {
    case "ECONNREFUSED": {
      status = Defs.httpStatusConnRefused;
      break;
    }
    case "ECONNABORTED": {
      status = Defs.httpStatusConnAborted;
      break;
    }
    case "ECONNRESET": {
      status = Defs.httpStatusConnReset;
      break;
    }
    default: {
      status = Defs.httpStatusConnRefused;
      break;
    }
  }

  return { status };
}

async function _delete(url, config) {
  try {
    return await httpInstance.delete(url, addHeaders(config));
  } catch (ex) {
    return handleHttpException("delete", ex);
  }
}

async function _get(url, config) {
  log("httpService.get: url " + url);
  try {
    return await httpInstance.get(url, addHeaders(config));
  } catch (ex) {
    log("(Exception) httpService.get: ex " + ex.code, "http", "error");
    return handleHttpException("get", ex);
  }
}

async function _post(url, params, config) {
  log("httpService.post: url " + url);
  try {
    return await httpInstance.post(url, params, addHeaders(config));
  } catch (ex) {
    console.log("(Exception) httpService.post: ex " + ex.code, "http", "error");
    return handleHttpException("post", ex);
  }
}

async function _put(url, params, config) {
  log("httpService.put: url " + url);
  try {
    return await httpInstance.put(url, params, addHeaders(config));
  } catch (ex) {
    return handleHttpException("put", ex);
  }
}

function logAuthToken() {
  console.log(
    "authToken: " +
      axios.defaults.headers.common[Defs.httpCustomHeader_XAuthToken]
  );
}

function setAuthTokenHeader(authToken) {
  console.log("setAuthTokenHeader = " + authToken);
  axios.defaults.headers.common[Defs.httpCustomHeader_XAuthToken] = authToken;
}

function setBaseURL(baseURL) {
  axios.defaults.baseURL = "http://" + baseURL + "/";
  console.log("setBaseURL = " + axios.defaults.baseURL);
}

function setClientTokenHeader(clientToken) {
  console.log("setClientTokenHeader = " + clientToken);
  axios.defaults.headers.common[
    Defs.httpCustomHeader_XClientToken
  ] = clientToken;
}

function setConnTokenHeader(connToken) {
  console.log("setConnTokenHeader = " + connToken);
  axios.defaults.headers.common[Defs.httpCustomHeader_XConnToken] = connToken;
}

function setHeader(header, value) {
  //console.log("setHeader: header " + header + ", value = " + value, "http", "info");
  axios.defaults.headers.common[header] = value;
}

function addHeaders(config) {
  const configWithHeaders = config ? config : {};
  configWithHeaders.headers = {};
  configWithHeaders.headers[Defs.httpCustomHeader_XTimestamp] = Date.now();
  configWithHeaders.headers[Defs.httpCustomHeader_XWebClient] = 1;
  if (axios.defaults.headers.common[Defs.httpCustomHeader_XAuthToken])
    configWithHeaders.headers[Defs.httpCustomHeader_XAuthToken] =
      axios.defaults.headers.common[Defs.httpCustomHeader_XAuthToken];
  if (axios.defaults.headers.common[Defs.httpCustomHeader_XClientToken])
    configWithHeaders.headers[Defs.httpCustomHeader_XClientToken] =
      axios.defaults.headers.common[Defs.httpCustomHeader_XClientToken];
  if (axios.defaults.headers.common[Defs.httpCustomHeader_XConnToken])
    configWithHeaders.headers[Defs.httpCustomHeader_XConnToken] =
      axios.defaults.headers.common[Defs.httpCustomHeader_XConnToken];

  return configWithHeaders;
}

module.exports = {
  delete: _delete,
  get: _get,
  post: _post,
  put: _put,
  logAuthToken,
  setAuthTokenHeader,
  setBaseURL,
  setClientTokenHeader,
  setConnTokenHeader,
  setHeader
};
