import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import * as ReactBootStrap from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
const ClubDetail = () => {
  const URL = window.location.href.split("/");
  let id = URL[URL.length - 1];
  const [info, setClub] = useState({ club: [], player: []});

  useEffect(() => {
    const fetchClubsList = async () => {
      console.log(id);
      const club = await axios.get("/api/clubs/" + id);
      const player = await axios.post("/api/players/search", { club: id });
      console.log(club)
      setClub({ club: club.data, player: player.data});
    };
    fetchClubsList();
  }, [setClub]);
  return (
    <>
      <h1>{info.club.name}</h1>
      <h2>Stadium: {info.club.stadium}</h2>
      <h4>Manager: {info.club.username}</h4>

      <ReactBootStrap.Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>dob</th>
            <th>note</th>
            <th>type</th>
          </tr>
        </thead>
        <tbody>
        {info.player &&
            info.player.map((item, index) => (
              <tr key={item._id}>
                <td>{index}</td>
                <td>{item.name}</td>
                <td>{item.dob}</td>
                <td>{item.note}</td>
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

export default ClubDetail;
