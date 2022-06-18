import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Navibar from "./components/Navibar";
import Seasons from "./pages/Seasons";
import SeasonDetail from "./pages/SeasonDetail"
import ClubDetail from "./pages/ClubDetail"
import Clubs from "./pages/Clubs"
import Goals from "./pages/Goals"
function App() {
  return (
    <>
     
      <Router>
        <div className="container">
          <Navibar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/seasons/:id" element={<SeasonDetail />} />
            <Route path="/clubs/:id" element={<ClubDetail />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/goals/:id" element={<Goals />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
