import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import * as ReactBootStrap from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
const SeasonDetail = () => {
  const URL = window.location.href.split("/");
  let id = URL[URL.length - 1];
  const [info, setSeason] = useState({ season: [], rank: [], sumgoal:[], match:[] });

  useEffect(() => {
    const fetchSeasonsList = async () => {
      console.log(id);
      const season = await axios.get("/api/seasons/" + id);
      const rank = await axios.post("/api/rankings/search", { season: id });
      const sumgoal = await axios.get("/api/rankings/" + id+"/players");
      const match = await axios.post("/api/matches/search", { season: id });
      setSeason({ season: season.data, rank: rank.data,sumgoal:sumgoal.data ,match:match.data});
      console.log(match.data)
    };
    fetchSeasonsList();
  }, [setSeason]);
  return (
    <>
      <h1>{info.season.name}</h1>
      <br></br>
      <h4 style={{ textAlign: "left" }}>Season's infomation: </h4>
      <Container className="info-container">
        <Row>
          <Col>
            <b>Start date:</b> {info.season.start_date}
          </Col>
          <Col>
            <b>End date:</b> {info.season.end_date}
          </Col>
        </Row>
        <Row>
          <Col>
            <Row>
              <Row>
                <b>Point:</b>
              </Row>
              <Row>
                <div>+ Win: {info.season.win_point}</div>
              </Row>
              <Row>
                <div>+ Draw: {info.season.draw_point}</div>
              </Row>
              <Row>
                <div>+ Lose: {info.season.lose_point}</div>
              </Row>
            </Row>
          </Col>
          <Col>
            <Row>
              <b>Player:</b>
            </Row>
            <Row>
              <div>
                + Number of player: {info.season.min_player} -{" "}
                {info.season.max_player}
              </div>
            </Row>
            <Row>
              <div>
                + Number of foreign player: {info.season.min_foreign_player} -{" "}
                {info.season.max_foreign_player}
              </div>
            </Row>
            <Row>
              <div>
                + Player age: {info.season.min_age} - {info.season.max_age}
              </div>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col>
            <div>
              <b>Match duration:</b> {info.season.play_duration}
            </div>
          </Col>
          <Col>
            <b>Goal Type:</b>
            {info.season.goal_type &&
              info.season.goal_type.map((item, index) => <span> {item}</span>)}
          </Col>
        </Row>
        <Row>
          <b>Ranking order:</b>
          <div>+ Goal difference: {info.season.goal_difference_rank}</div>
          <div>+ Point: {info.season.point_rank}</div>
          <div>+ Win: {info.season.win_rank}</div>
          <div>+ Draw: {info.season.draw_rank}</div>
          <div>+ Lose: {info.season.lose_rank}</div>
        </Row>
      </Container>
      <br></br>
      <h4 style={{ textAlign: "left" }}>Season's Club Rank: </h4>

      <ReactBootStrap.Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Win</th>
            <th>Draw</th>
            <th>Lose</th>
            <th>Point</th>
            <th>G-diff</th>
            <th>Rank</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {info.rank &&
            info.rank.map((item, index) => (
              <tr key={item._id}>
                <td>{index}</td>
                <td>{item.clubname}</td>
                <td>{item.win}</td>
                <td>{item.draw}</td>
                <td>{item.lose}</td>
                <td>{item.point}</td>
                <td>{item.goal_difference}</td>
                <td>{item.rank}</td>
                <td>
                  <Link to={`/clubs/${item.club}`}>
                    <BsSearch />
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </ReactBootStrap.Table>

      <h4 style={{ textAlign: "left" }}>Player's goals: </h4>
      <ReactBootStrap.Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Club</th>
            <th>Player type</th>
            <th>Goals</th>
          </tr>
        </thead>
        <tbody>
        {info.sumgoal &&
            info.sumgoal.map((item, index) => (
              <tr key={item._id}>
                <td>{index}</td>
                <td>{item.name}</td>
                <td>{item.clubname}</td>
                <td>{item.type}</td>
                <td>{item.goals}</td>
              </tr>
            ))}
        </tbody>
      </ReactBootStrap.Table>

      <h4 style={{ textAlign: "left" }}>Matches: </h4>
      <ReactBootStrap.Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Round</th>
            <th>Home</th>
            <th>Away</th>
            <th>Date</th>
            <th>Home point</th>
            <th>Away point</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {info.match &&
            info.match.map((item, index) => (
              <tr key={item._id}>
                <td>{index}</td>
                <td>{item.round}</td>
                <td>{item.homename}</td>
                <td>{item.awayname}</td>
                <td>{item.on_date}</td>
                <td>{item.home_point}</td>
                <td>{item.away_point}</td>
                <td>
                  <Link to={`/goals/${item._id}`}>
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

export default SeasonDetail;
