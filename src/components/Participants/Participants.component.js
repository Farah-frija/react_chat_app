import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import './Participants.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
const MeetingRoom = () => {
  const [localTracks, setLocalTracks] = useState({
    videoTrack: null,
    audioTrack: null
  });
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const location = useLocation();
  const [roomDetails, setRoomDetails] = useState({
    appId: 'aacbfe2f1fe741cfb54fcf66e8b43420',
    channel: new URLSearchParams(location.search).get('convId'),
    token: "null" // Initialize as null
  });
  
  const fetchToken = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/chat/token/generateChannelToken?channelName=${roomDetails.channel}`
      );
      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error("Token fetch failed:", error);
      return null;
    }
  };
  const clientRef = useRef(null);
  const localPlayerRef = useRef(null);
  const remotePlayersContainerRef = useRef(null);
  const remotePlayersRef = useRef({});
  


  useEffect(() => {
    // Initialize Agora client
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  
     //joinRoom();
    return () => {
      leaveRoom();
    };
  }, []); // Empty dependency array for mount/unmount only
  
  const joinRoom = async() => {
    try {
      const client = clientRef.current;
      var token=null;
      console.log('Token value:', roomDetails.token);
console.log('Type of token:', typeof roomDetails.token);
console.log('Strict equality:', roomDetails.token === null);
      
      if (roomDetails.token=="null")
      { console.log("dkhal")
        token = await fetchToken();
        console.log('Token obtained:', token ? '*****' + token.slice(-5) : 'NULL');
        setRoomDetails(prev => ({ ...prev, token }));
        console.log(roomDetails.token,'tokeeeeeen');
      }
      else
        token=roomDetails.token;
       // Create meeting session record first
    
      const response = await axios.post(
        'http://localhost:3001/meeting-history/record',
        {
          conversationId: roomDetails.channel, // Assuming channel is the conversationId
          participantId: 1, // Replace with actual participant ID
          actionType: 'join'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Meeting session created:', response.data);
  
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      client.on("user-joined", handleUserJoined);
      client.on("user-left", handleUserLeft);
      console.log(roomDetails.token,'tokeeeeeen1');
      const [uid, audioTrack, videoTrack] = await Promise.all([
        client.join(roomDetails.appId, roomDetails.channel, token || null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
      ]);

      setLocalTracks({ videoTrack, audioTrack });

      if (localPlayerRef.current) {
        videoTrack.play(localPlayerRef.current);
      }

      await client.publish([audioTrack, videoTrack]);
      setIsJoined(true);
      
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const leaveRoom = async () => {
    const client = clientRef.current;
    if (!client) return;
    const response = await axios.post(
      'http://localhost:3001/meeting-history/record',
      {
        conversationId: roomDetails.channel, // Assuming channel is the conversationId
        participantId: 1, // Replace with actual participant ID
        actionType: 'leave'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Meeting session created:', response.data);
    Object.values(localTracks).forEach(track => {
      if (track) {
        track.stop();
        track.close();
      }
    });

    Object.values(remotePlayersRef.current).forEach(player => {
      if (player?.container) {
        player.container.remove();
      }
    });


    setLocalTracks({ videoTrack: null, audioTrack: null });
    setRemoteUsers({});
    setIsJoined(false);
    setIsScreenSharing(false);
    remotePlayersRef.current = {};

    await client.leave();
  };

  const toggleMic = () => {
    if (localTracks.audioTrack) {
      localTracks.audioTrack.setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localTracks.videoTrack) {
      localTracks.videoTrack.setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      await clientRef.current.unpublish([localTracks.videoTrack]);
      localTracks.videoTrack.stop();
      localTracks.videoTrack.close();
      
      await clientRef.current.publish([videoTrack]);
      videoTrack.play(localPlayerRef.current);
      setLocalTracks(prev => ({ ...prev, videoTrack }));
      setIsScreenSharing(false);
    } else {
      const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "auto");
      await clientRef.current.unpublish([localTracks.videoTrack]);
      localTracks.videoTrack.stop();
      localTracks.videoTrack.close();
      
      await clientRef.current.publish([screenTrack]);
      screenTrack.play(localPlayerRef.current);
      setLocalTracks(prev => ({ ...prev, videoTrack: screenTrack }));
      setIsScreenSharing(true);
      
      screenTrack.on("track-ended", toggleScreenShare);
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    try {
      await clientRef.current.subscribe(user, mediaType);
      
      setRemoteUsers(prev => {
        const newUsers = {...prev};
        if (!newUsers[user.uid]) {
          newUsers[user.uid] = { ...user };
        } else {
          newUsers[user.uid][mediaType === 'video' ? 'videoTrack' : 'audioTrack'] = user[mediaType];
        }
        return newUsers;
      });

      if (mediaType === 'video') {
        // Create or reuse player element
        let playerElement = document.getElementById(`player-${user.uid}`);
        let wrapper = remotePlayersRef.current[user.uid]?.container;
        
        if (!wrapper) {
          wrapper = document.createElement('div');
          wrapper.className = 'remote-video';
          remotePlayersContainerRef.current.appendChild(wrapper);
          
          playerElement = document.createElement('div');
          playerElement.id = `player-${user.uid}`;
          playerElement.className = 'video-player';
          wrapper.appendChild(playerElement);
          
          const userInfo = document.createElement('div');
          userInfo.className = 'user-info';
          userInfo.textContent = `Participant ${user.uid}`;
          wrapper.appendChild(userInfo);
          
          remotePlayersRef.current[user.uid] = {
            container: wrapper,
            videoElement: playerElement
          };
        }
        
        // Play the video track
        user.videoTrack.play(`player-${user.uid}`);
      } else if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    } catch (error) {
      console.error('Subscribe failed:', error);
    }
  };

  const handleUserUnpublished = async (user, mediaType) => {
    setRemoteUsers(prev => {
      const newUsers = {...prev};
      if (newUsers[user.uid]) {
        if (mediaType === 'video') {
          delete newUsers[user.uid].videoTrack;
        } else {
          delete newUsers[user.uid].audioTrack;
        }
        
        if (!newUsers[user.uid].videoTrack && !newUsers[user.uid].audioTrack) {
          delete newUsers[user.uid];
        }
      }
      return newUsers;
    });

    if (mediaType === 'video' && remotePlayersRef.current[user.uid]) {
      // Keep the container but clear the video
      const playerElement = remotePlayersRef.current[user.uid].videoElement;
      if (playerElement) {
        playerElement.innerHTML = '';
      }
    }
  };

  const handleUserJoined = (user) => {
    console.log("User joined:", user.uid);
  };

  const handleUserLeft = (user) => {
    setRemoteUsers(prev => {
      const newUsers = {...prev};
      delete newUsers[user.uid];
      return newUsers;
    });

    if (remotePlayersRef.current[user.uid]) {
      remotePlayersRef.current[user.uid].container.remove();
      delete remotePlayersRef.current[user.uid];
    }
  };

  return (
    <div className="meeting-room">
      <header className="meeting-header">
        <h1> VetWise call</h1>
        <div className="room-info">
          <span>Room: {roomDetails.channel}</span>
          {isJoined && <span className="connection-status connected">● Connected</span>}
        </div>
      </header>

      <div className="meeting-container">
        <div className={`local-video ${isVideoOff ? 'video-off' : ''}`}>
          <div ref={localPlayerRef} className="video-player"></div>
          <div className="user-info">
            <span>You ({isJoined ? "Connected" : "Disconnected"})</span>
            {isVideoOff && <div className="video-off-placeholder">🎥 Camera Off</div>}
          </div>
        </div>

        <div className="remote-videos" ref={remotePlayersContainerRef}>
          {Object.keys(remoteUsers).length === 0 && (
            <div className="empty-state">
              
              
            </div>
          )}
        </div>
      </div>

      <div className="meeting-controls">
        {!isJoined ? (
          <button onClick={joinRoom} className="join-button">
            Join Meeting
          </button>
        ) : (
          <>
            <button 
              onClick={toggleMic} 
              className={`control-button ${isMuted ? 'muted' : ''}`}
            >
              {isMuted ? '🎤 Unmute' : '🎤 Mute'}
            </button>
            <button 
              onClick={toggleVideo} 
              className={`control-button ${isVideoOff ? 'video-off' : ''}`}
            >
              {isVideoOff ? '🎥 Start Video' : '🎥 Stop Video'}
            </button>
           
            <button onClick={leaveRoom} className="leave-button">
              Leave Meeting
            </button>
          </>
        )}
      </div>

      <div className="status-bar">
        <div className="status-item">
          <span className="status-icon">📶</span>
          <span>Good connection</span>
        </div>
        <div className="status-item">
          <span className="status-icon">👥</span>
          <span>{Object.keys(remoteUsers).length + 1} participants</span>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;