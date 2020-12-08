const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");

app.use(bodyParser.json());
app.use(cors());

var users = [];

/*
Responding to requests
*/
app.get("/time", (req, res) => {
  res.send(serverTime());
  console.log(new Date(), "/time - GET RESPONSE -", 200);
});

app.get("/status", (req, res) => {
  res.send(200, serverTime());
  console.log(new Date(), "/status - GET RESPONSE -", 200);
});

app.get("/users", (req, res) => {
  res.send(JSON.stringify(users));
  console.log(new Date(), "/users - GET RESPONSE -", 200);
});

/*
Updating database
*/
app.post("/users", (req, res) => {
  var user = {
    name: req.body.user,
    time: serverTime(),
  };
  users.push(user);
  console.log(new Date(), "- POST RESPONSE -", 200);
});

/* Communicating with Service Registry*/
function postStatusAvailable() {
  if (typeof serviceRegistryUrl !== "undefined") {
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
        console.log(new Date(), "Service registry down: ", error)
      );

    console.log(new Date(), "HTTP POST " + ADDRESS + "/service");
  } else {
    console.log(new Date(), "Service Registry not available");
  }
}
/*
Calculating server time
*/
function serverTime() {
  var time = new Date();
  var minutes = time.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  time = time.getHours() + ":" + minutes;
  return time;
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
const ServerName = "Model";
const ADDRESS = "http://localhost:" + PORT;
const serviceRegistryUrl = "http://localhost:3005";

var interval = null;
app.listen(PORT, () => {
  console.log(new Date(), `Server running on port ${PORT}`);
  postStatusAvailable();
  interval = setInterval(() => {
    postStatusAvailable();
  }, 15000);
});
clearInterval(interval);
