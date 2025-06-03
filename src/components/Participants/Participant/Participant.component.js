import React from "react";
import Card from "../../Shared/Card/Card.component";
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Participant.css";
import { blueGrey } from "@mui/material/colors";

export const Participant = (props) => {
  const {
    id,
    currentUser,
    hideVideo,
    showAvatar,
    name,
    audio,
    video
  } = props.participantData; 
  if (!id) return <></>;
  return (
    <div className={`participant ${hideVideo ? "hide" : ""}`}>
      <Card>
        <video
          ref={video}
          className="video"
          id={`participantVideo${id}`}
          autoPlay
          playsInline
        ></video>
        {!audio && (
          <FontAwesomeIcon
            className="muted"
            icon={faMicrophoneSlash}
            title="Muted"
          />
        )}
        {showAvatar && (
          <div
            style={{ background: blueGrey }}
            className="avatar"
          >
            {name}
          </div>
        )}
        <div className="name">
          {name}
          {currentUser ? "(You)" : ""}
        </div>
      </Card>
    </div>
  );
};
