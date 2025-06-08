import { Avatar, Badge, Box, Stack, Typography } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import StyledBadge from './StyledBadge';
import { useChat } from '../agoraService/Agora_chat';
import React, { useEffect, useState } from 'react';
import { Circle } from 'phosphor-react'; // Import the Circle icon for the indicator

// Single chat element
const ChatElement = ({
  id, 
  name, 
  img, 
  msg, 
  time, 
  online, 
  unread, 
  onClick, 
  isSelected,
  
  activeRendezvous
}) => {
  const [lastMessage, setLastMessage] = useState(msg); 
  const [LastTime, setLastTime] = useState(time); 
  const { messages } = useChat();
  const theme = useTheme();
    const [isActiveMeeting, setIsActiveMeeting] = useState(false);
     
     useEffect(() => {
       const meetingActive = activeRendezvous && 
                           activeRendezvous.conversationId == id;
       console.log(activeRendezvous,'meetingg activeee');
       setIsActiveMeeting(meetingActive);
       console.log("meeting active",meetingActive);
       // Reset timer if no active meeting
       
     }, [activeRendezvous, id]);
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    console.log("chet element in");
    if (!messages || messages.length === 0) return;

    const conversationMessages = messages.filter(
      (message) => {
        console.log("Checking message:", message);
        console.log("Message convId (ext.convId):", message.convId);
        console.log("Target chat ID (id):", id);
        return message.convId == id
      } 
    );
    
    if (conversationMessages.length > 0) {
      const sortedMessages = [...conversationMessages].sort(
        (a, b) => new Date(b.time) - new Date(a.time)
      );
      setLastMessage(sortedMessages[0].message);
      setLastTime(sortedMessages[0].time);
    }
  }, [messages, id]); 

  useEffect(() => {
    console.log("Messages updated chatt:", messages);
  }, [messages]);

  return (
    <Box 
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor: isSelected ? '#E5EFFD' : (theme.palette.mode === 'light' ? "#fff" : theme.palette.background.default),
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#F5F5F5'
        }
      }}
      p={2}
      onClick={onClick}
    >
      <Stack direction="row" alignItems='center' justifyContent='space-between'>
        <Stack direction='row' spacing={2}>
          {online ? (
            <StyledBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot">
              <Avatar src={img} />
            </StyledBadge>
          ) : (
            <Avatar src={img} />
          )}
          
          <Stack spacing={0.3}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant='subtitle2'>
                {name}
              </Typography>
              {isActiveMeeting&& (
                <Circle 
                  size={12} 
                  weight="fill" 
                  color="#4CAF50" // Green color for active indicator
                  style={{ marginLeft: 4 }} 
                />
              )}
            </Stack>
            <Typography variant='caption'>
              {lastMessage}
            </Typography>
          </Stack>
        </Stack>
        
        <Stack spacing={2} alignItems='center'>
          <Typography sx={{ fontWeight: 600 }} variant='caption'>
            {formatTime(LastTime)}
          </Typography>
          <Badge color='primary' badgeContent={unread} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatElement;