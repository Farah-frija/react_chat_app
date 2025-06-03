import React from "react";
import Participants from "../Participants/Participants.component";
import "./MainScreen.css";

const MainScreen = () => {
  return (
    <div className="wrapper">
      <div className="main-screen">
        <Participants />
      </div>
      <div className="footer">
        {/* Footer content */}
      </div>
    </div>
  );
};

export default MainScreen;
