const express = require("express");
const router = express.Router();

const Defs = require("iipzy-shared/src/defs");
const { log, timestampToString } = require("iipzy-shared/src/utils/logFile");

router.get("/", async (req, res) => {
  log(
    "GET - reqHandler: timestamp = " +
      timestampToString(req.header("x-timestamp")),
    "rout",
    "info"
  );

  log(
    "GET reqHandler: response = " + JSON.stringify(data, null, 2),
    "rout",
    "info"
  );

  res.status(Defs.httpStatusOk).send({});
});

// request from client.
router.post("/", async (req, res) => {
  log(
    "POST - reqHandler: timestamp = " +
      timestampToString(req.header("x-timestamp")),
    "rout",
    "info"
  );
  log("POST - updater: " + JSON.stringify(req.body, null, 2), "rout", "info");

  //const request = req.body;

  res.status(Defs.httpStatusOk).send({ data });
});

module.exports = router;
