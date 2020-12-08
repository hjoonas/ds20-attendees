const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
var fs = require("fs");

app.use(bodyParser.json());
app.use(cors());

var servers = [];

/*
Responding to requests
*/

app.get("/services", (req, res) => {
  updateStatuses();
  res.status(200).send(JSON.stringify(servers));
  console.log(new Date(), "/services- GET RESPONSE -", 200);
});

/*
Updating services
*/

app.post("/service", (req, res) => {
  updateStatuses();
  serversUpdate(req.body);
  console.log(new Date(), "/service - POST RESPONSE -", 200);
  res.status(200).send();
});

/* Expired server statuses will be removed from the listing*/
function updateStatuses() {
  servers.forEach((server) => {
    var ageNow = new Date().getTime() - server.age;
    if (ageNow > 15000) {
      serversRemoveExpired(server);
      console.log(
        new Date(),
        "Server status has expired -",
        server.name,
        server.url
      );
      console.log(
        new Date(),
        "Fetching status from -",
        server.name,
        server.url
      );
      updateServerStatus(server);
      console.log(
        new Date(),
        "Server status updated -",
        server.name,
        server.url
      );
    }
  });
}

function serversUpdate(props) {
  var server = {
    name: props.name,
    url: props.url,
    age: new Date().getTime(),
    status: 200,
  };
  servers = servers.filter((s) => s.url !== props.url);
  servers.push(server);
}

function serversRemoveExpired(props) {
  servers = servers.filter((s) => s.url !== props.url);
  console.log(new Date(), props.url, props.name, "REMOVED");
}

/* Get status from server */
function updateServerStatus(props) {
  console.log(new Date(), "HTTP POST ", props.url + "/status");
  fetch(props.url + "/status")
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error" + response.status);
      }
      return response;
    })
    .then((response) => {
      console.log(new Date(), "SERVER STATUS:", response.status);
      serversUpdate(props);
      return response;
    })
    .catch((error) => {
      console.log(new Date(), "Service not available", props.url);
      console.log(error);
    });
  console.log(new Date(), "HTTP GET " + props.url + "/status");
}

/*
Set the port from arguments. Starting the server.
*/

const PORT = process.argv[2];
app.listen(PORT, () => {
  console.log(new Date(), `Server running on port ${PORT}`);
});
