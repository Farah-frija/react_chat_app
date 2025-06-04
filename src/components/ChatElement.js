import { Avatar, Badge, Box, Stack, Typography } from '@mui/material';
import {useTheme , styled} from '@mui/material/styles';
import StyledBadge from './StyledBadge';
import { useChat } from '../agoraService/Agora_chat';
import React, { useEffect,useState } from 'react';
//single chat element
const ChatElement = ({id, name, img, msg, time, online, unread, onClick, isSelected}) => {
  const [lastMessage, setLastMessage] = useState(msg); 
  const [LastTime, setLastTime] = useState(time); 
  const { messages} = useChat();
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  useEffect(() => {
    console.log("chet element in");
    if (!messages || messages.length === 0) return;

    // Filter messages for this conversation (convId === id)
    const conversationMessages = messages.filter(
      
      (message) =>{console.log("Checking message:", message);
        console.log("Message convId (ext.convId):", message.convId);
        console.log("Target chat ID (id):", id);
        return message.convId == id} 
    );
     console.log(conversationMessages);
    if (conversationMessages.length > 0) {
      // Sort by timestamp (newest first) and pick the first one
      const sortedMessages = [...conversationMessages].sort(
        (a, b) => new Date(b.time) - new Date(a.time)
      );
      console.log("lasttttttttttttttttt",sortedMessages[0]);
      setLastMessage(sortedMessages[0].message); // Update last message
      setLastTime(sortedMessages[0].time)
    }
  }, [messages,id]); 
  useEffect(() => {
    console.log("Messages updated chatt:", messages);
  }, [messages]);// Re-run when messages or conversation ID changes
    const theme = useTheme();
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
            {online ? <StyledBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot">
            <Avatar src={img} />
            </StyledBadge> : <Avatar src={img} /> }
            
            <Stack spacing={0.3}>
              <Typography variant='subtitle2'>
                {name}
              </Typography>
              <Typography variant='caption'>
                {lastMessage}
              </Typography>
            </Stack>
            </Stack>
            <Stack spacing={2} alignItems='center'>
              <Typography sx={{fontWeight:600}} variant='caption'>
                {formatTime(LastTime)}
              </Typography>
              <Badge color='primary' badgeContent={unread}>
  
              </Badge>
            </Stack>
          
          
        </Stack>
  
  
      </Box>
    )
  };

  export default ChatElement