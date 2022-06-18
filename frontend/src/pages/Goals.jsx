import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import * as ReactBootStrap from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
const Goals = () => {
  const URL = window.location.href.split("/");
  let id = URL[URL.length - 1];
  const [info, setGoals] = useState({ goals: [] });

  useEffect(() => {
    const fetchSeasonsList = async () => {
      console.log(id);
      const goals = await axios.post("/api/goals/search", { match: id });
      setGoals({ goals: goals.data });
      console.log(goals.data);
    };
    fetchSeasonsList();
  }, [setGoals]);
  return (
    <>
      {" "}
      <br></br>
      <br></br>
      <h1>{id}</h1>
      <ReactBootStrap.Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Club</th>
            <th>Goal minute</th>
            <th>type</th>
          </tr>
        </thead>
        <tbody>
          {info.goals &&
            info.goals.map((item, index) => (
              <tr key={item._id}>
                <td>{index}</td>
                <td>{item.playername}</td>
                <td>{item.clubname}</td>
                <td>{item.goal_minute}</td>
                <td>{item.type}</td>
              </tr>
            ))}
        </tbody>
      </ReactBootStrap.Table>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </>
  );
};

export default Goals;
