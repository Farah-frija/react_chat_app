// src/components/Conversation/index.js
import { Box, Stack } from '@mui/material';
import React, { useEffect } from 'react';
import { useTheme } from "@mui/material/styles";
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import { useChat } from '../../agoraService/Agora_chat';

const Conversation = ({ selectedChat }) => {
  const theme = useTheme();
  const { messages, login, isConnected } = useChat();
  
  // Hardcoded login - replace with your actual user ID and token
 /* useEffect(() => {
    const hardcodedUserId = "1111"; // Replace with your user ID
    const hardcodedToken = "007eJxTYHjT+PjoRaWU9F/MliYbpDbqn/08ecJUDs9ln3843sjZaftSgSExMTkpLdUozTAt1dzEMDktydQkLTnNzCzVIsnE2MTIgLfOJqMhkJHhvzgXCyMDKwMjEIL4KgzmBkaJFkapBrpGRhapuoaGaQa6FsYWKboGpknGaQaWhhYmphYAWqUoNg==";
    
    if (!isConnected) {
      login(hardcodedUserId, hardcodedToken);

    }
  }, [isConnected, login]);*/
  useEffect(() => {
    const fetchAndLogin = async () => {
      const userId = "1"; // Replace with dynamic user ID if needed
      const expireTime = 360000; // Token expiry in seconds
  
      try {
        // Call your backend token API
        const response = await fetch(
          `http://localhost:3001/chat/token/generateUserToken?account=${userId}&expireTimeInSeconds=${expireTime}`
        );
        
        const data = await response.json();
        
        if (data.token && !isConnected) {
          login(userId, data.token);
        }
      } catch (error) {
        console.error("Token generation failed:", error);
        // Fallback or retry logic here
      }
    };
  
    if (!isConnected) {
      fetchAndLogin();
    }
  }, [isConnected, login]);

  return (
    <Stack height={'100%'} maxHeight={'100vh'} width={'auto'}>
      {/* Chat header */}
      <Header selectedChat={selectedChat} />
      {/* Msg */}
      <Box className='scrollbar' width={"100%"} sx={{flexGrow:1, height:'100%', overflowY:'scroll'}}>
        <Message menu={true} messages={messages}/>
      </Box>
      {/* Chat footer */}
      <Footer/>
    </Stack>
  )
}

export default Conversation;