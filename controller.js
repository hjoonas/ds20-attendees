const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");

app.use(bodyParser.json());
app.use(cors());

var users = [];
var time = "";
var servers = [];
/*
Responding to requests
*/
app.get("/time", (req, res) => {
  getTimeFromDB();
  res.status(200).send(time);
  console.log(new Date(), "/time - GET RESPONSE -", 200);
});

app.get("/users", (req, res) => {
  getUsersFromDB();
  res.status(200).send(JSON.stringify(users));
  console.log(new Date(), "/users - GET RESPONSE -", 200);
});

/*
Server status
*/

app.get("/status", (req, res) => {
  res.send(200, new Date());
  console.log(new Date(), "/status - GET RESPONSE -", 200);
});

/*
Post requests to DB
 */
app.post("/users", (req, res) => {
  getTimeFromDB();

  var user = {
    name: req.body.user,
    time: time,
  };
  setUserToDB(user);
  console.log(new Date(), "/users - POST RESPONSE -", 200);
});

/*
Functions to fetch results from DB
*/
function getTimeFromDB() {
  DB_ADDRESS = servers.filter((s) => s.name == "Model")[0];
  if (typeof DB_ADDRESS !== "undefined") {
    DB_ADDRESS = DB_ADDRESS.url;
    fetch(DB_ADDRESS + "/time")
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error" + response.status);
        }
        return response.text();
      })
      .then((response) => {
        console.log(new Date(), "- POST RESPONSE -");
        time = response;
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(new Date(), "HTTP GET " + DB_ADDRESS);
    console.log();
  } else {
    console.log(new Date(), "Service not available");
  }
}

function getUsersFromDB() {
  DB_ADDRESS = servers.filter((s) => s.name == "Model")[0];
  if (typeof DB_ADDRESS !== "undefined") {
    DB_ADDRESS = DB_ADDRESS.url;
    fetch(DB_ADDRESS + "/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error" + response.status);
        }
        console.log(new Date(), "- POST RESPONSE -", response.status);
        return response.json();
      })
      .then((response) => {
        users = response;
      })
      .catch((error) =>
        console.log(new Date(), "Service not available: ", error)
      );
    console.log(new Date(), "HTTP GET " + DB_ADDRESS);
  } else {
    console.log(new Date(), "DB Service not available");
  }
}

/*
Functions for updating database
*/

function setUserToDB(props) {
  DB_ADDRESS = servers.filter((s) => s.name == "Model")[0];
  if (typeof DB_ADDRESS !== "undefined") {
    DB_ADDRESS = DB_ADDRESS.url;
    fetch(DB_ADDRESS + "/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        user: props.name,
        information: "Setting user",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        console.log(response);
        console.log(new Date(), "HTTP POST " + DB_ADDRESS);
      })
      .catch((error) =>
        console.log(new Date(), "DB Service not available: ", error)
      );
  } else {
    console.log(new Date(), "DB Service not available");
  }
}
/* Communicating with Service Registry*/
function postStatusAvailable() {
  fetch(serviceRegistryUrl + "/service", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: ServerName,
      url: ADDRESS,
      status: 200,
    }),
  })
    .then(handleErrors)
    .then((response) => {
      console.log(new Date(), "- POST RESPONSE -", response.status);
    })
    .catch((error) =>
      console.log(new Date(), "Service Registry not available: ", error)
    );

  console.log(new Date(), "HTTP POST " + serviceRegistryUrl + "/services");
}

function getAvailableServices(props) {
  fetch(serviceRegistryUrl + "/services")
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then((response) => {
      servers = response;
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(new Date(), "HTTP GET ", serviceRegistryUrl + "/services");
}

/* Error handling */
function handleErrors(response) {
  if (!response.ok) {
    console.log(response.statusText);
  }
  return response;
}

/*
Set the port from arguments. Starting the server.
*/
const PORT = process.argv[2];
const ServerName = "Controller";
const ADDRESS = "http://localhost:" + PORT;
const serviceRegistryUrl = "http://localhost:3005";

var interval = null;
app.listen(PORT, () => {
  console.log(new Date(), `Server running on port ${PORT}. Server time`);
  postStatusAvailable();
  getAvailableServices();
  interval = setInterval(() => {
    postStatusAvailable();
    getAvailableServices();
  }, 15000);
});
clearInterval(interval);
