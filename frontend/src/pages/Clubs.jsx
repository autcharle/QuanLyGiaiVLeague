import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import * as ReactBootStrap from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
const Clubs = () => {
  const URL = window.location.href.split("/");
  let id = URL[URL.length - 1];
  const [info, setGoals] = useState({ clubs: [] });

  useEffect(() => {
    const fetchSeasonsList = async () => {
      
      const clubs = await axios.get("/api/clubs");
      setGoals({ clubs: clubs.data });
      console.log('asd');
      console.log(clubs.data);
    };
    fetchSeasonsList();
  }, [setGoals]);
  return (
    <>
      {" "}
      <br></br>
      <br></br>
      <h1>Clubs</h1>
      <ReactBootStrap.Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>User</th>
            <th>Stadium</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {info.clubs &&
            info.clubs.map((item, index) => (
              <tr key={item._id}>
                <td>{index}</td>
                <td>{item.name}</td>
                <td>{item.username}</td>
                <td>{item.stadium}</td>
                <td>
                  <Link to={`/clubs/${item._id}`}>
                    <BsSearch />
                  </Link>
                </td>
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

export default Clubs;
