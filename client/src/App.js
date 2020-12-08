import "./App.css";
import React, { Component } from "react";

class DisplayThings extends Component {
  constructor(props) {
    super(props);
    this.serverName = "View";
    this.serviceRegistryUrl = "http://localhost:3005";
    this.ADDRESS = "http://localhost:" + 3000;
    this.servers = [];

    this.state = {
      time: "",
      value: "",
      users: [],
      serverStatus: [],
    };
  }

  /* 
Refresh values to synchronize multiple sessions.
*/
  componentDidMount() {
    this.postStatusAvailable();
    this.getAvailableServices();
    this.getTime();
    this.getUsers();
    this.interval = setInterval(() => {
      this.getTime();
      this.getUsers();
    }, 1000);
    this.interval2 = setInterval(() => {
      this.getAvailableServices();
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.interval2);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.users.length !== this.state.users.length) {
      this.getUsers();
    }
  }

  /*
Functions to handle updating state
*/

  formStateHandler = (event) => {
    this.setState({ value: event.target.value });
  };

  formSubmitHandler = (event) => {
    alert("Attendee has been saved");
    console.log(event);
    this.setUser();
  };

  /*
Fetching values for frontpage. Server values set here.
*/

  getTime() {
    var serverToUse = this.getServerFromRegistry();
    if (serverToUse !== 400) {
      console.log(new Date(), "HTTP GET " + serverToUse + "/time");
      fetch(serverToUse + "/time")
        .then((response) => {
          if (!response.ok) {
            throw new Error(new Date(), "HTTP error " + response.status);
          }
          return response.text();
        })
        .then((response) => {
          this.setState({ time: response });
        });
    } else {
      console.log(new Date(), "Service not available");
    }
  }

  /* Functions for updating status to Service Registry */
  getStatus(props) {
    var serverToUse = props;
    console.log(new Date(), "HTTP GET " + serverToUse + "/status");
    fetch(serverToUse + "/status")
      .then((response) => {
        if (!response.ok) {
          throw new Error(new Date(), "HTTP error " + response.status);
        }
        return response.status;
      })
      .then((response) => {
        this.setState({ serverStatus: response });
      });
  }

  getServerFromRegistry() {
    var be_address = this.servers.filter((s) => s.name === "Controller")[0];
    if (typeof be_address !== "undefined") {
      return be_address.url;
    } else {
      return 400;
    }
  }

  getAvailableServices() {
    console.log(new Date(), "HTTP GET ", this.serviceRegistryUrl + "/services");
    fetch(this.serviceRegistryUrl + "/services")
      .then((response) => {
        if (!response.ok) {
          throw new Error(new Date(), "HTTP error " + response.status);
        }
        return response.json();
      })
      .then((response) => {
        this.servers = response;
        return response;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  postStatusAvailable() {
    console.log(
      new Date(),
      "HTTP POST ",
      this.serviceRegistryUrl + "/services"
    );
    fetch(this.serviceRegistryUrl + "/service", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: this.serverName,
        url: this.ADDRESS,
        status: 200,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(new Date(), "HTTP error " + response.status);
        }
        return response;
      })
      .then((response) => {
        console.log(new Date(), "Registry status:", response.status);
      })
      .catch((error) =>
        console.log(new Date(), "Service not available: ", error)
      );
  }

  /* Values to and from backend servers */

  getUsers() {
    var serverToUse = this.getServerFromRegistry();
    if (serverToUse !== 400) {
      console.log(new Date(), "HTTP GET " + serverToUse + "/users");
      fetch(serverToUse + "/users")
        .then((response) => {
          if (!response.ok) {
            throw new Error(new Date(), "HTTP error " + response.status);
          }
          return response.json();
        })
        .then((response) => {
          this.setState({ users: response });
        })
        .catch((error) =>
          console.log(new Date(), "Service not available: ", error)
        );
    } else {
      console.log(new Date(), "Service not available");
    }
  }

  setUser() {
    var serverToUse = this.getServerFromRegistry();
    console.log(new Date(), "HTTP POST " + serverToUse + "/users");
    if (serverToUse !== 400) {
      console.log("POST USER " + serverToUse);
      fetch(serverToUse + "/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user: this.state.value,
          information: "Setting user",
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("HTTP error" + response.status);
          }
          this.setState({ status: response });
          console.log(response);
        })
        .catch((error) =>
          console.log(new Date(), "Service not available: ", error)
        );
    } else {
      console.log(new Date(), "Service not available");
    }
  }
  /*
Render front end. List of attendees, form to add attendees.
*/
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <div style={{ paddingBottom: "20%" }}>
              <h2> Attendees</h2>
              <ol>
                {this.state.users.map((user, i) => (
                  <li key={i}>
                    {user.name} {user.time}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <form onSubmit={this.formSubmitHandler}>
                <h4> Enter names of attendees </h4>
                <p> Name of an attendee</p>
                <input
                  type="text"
                  value={this.state.value}
                  onChange={this.formStateHandler}
                />
                <input type="submit" />
              </form>
              <h6
                style={{
                  textAlign: "left",
                  marginLeft: "35%",
                }}
              >
                {" "}
                Time is {this.state.time}
              </h6>
            </div>
          </div>
        </header>
      </div>
    );
  }
}

export default DisplayThings;
