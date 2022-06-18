import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import * as ReactBootStrap from "react-bootstrap";
import { BsSearch } from "react-icons/bs";
import { Link } from "react-router-dom";
const SeasonTable = () => {
  const [info, setSeasons] = useState({ seasons: [] });
  useEffect(() => {
    const fetchSeasonsList = async () => {
      const { data } = await axios.get("/api/seasons");
      setSeasons({ seasons: data });
      console.log(data);
    };
    fetchSeasonsList();
  }, [setSeasons]);

  return (
    <>
      <ReactBootStrap.Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Date start</th>
            <th>Date end</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {info.seasons &&
            info.seasons.map((item, index) => (
              <tr key={item._id}>
                <td>{index}</td>
                <td>{item.name}</td>
                <td>{item.start_date}</td>
                <td>{item.end_date}</td>
                <td>
                  <Link to={`/seasons/${item._id}`}>
                    <BsSearch />
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </ReactBootStrap.Table>
    </>
  );
};

export default SeasonTable;
