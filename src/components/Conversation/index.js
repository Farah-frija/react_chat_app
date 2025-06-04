// src/components/Conversation/index.js
import { Box, Stack } from '@mui/material';
import React, { useEffect,useState } from 'react';
import { useTheme } from "@mui/material/styles";
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import { useChat } from '../../agoraService/Agora_chat';

const Conversation = ({ selectedChat }) => {
  const theme = useTheme();
  const [dbMessages, setDbMessages] = useState([]);
  const { messages, login, isConnected } = useChat();
  const [loading, setLoading] = useState(true);
  const [displayMessages, setDisplayMessages] = useState([]); // Combined display list
  
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
  useEffect(() => {
    const userId = "1";
    const fetchMessages = async () => {
      if (!selectedChat) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/conversations/${selectedChat.id}/messages/?userId=1`
        );
        const data = await response.json();
        console.log(data.messages,"dataaa");
        //tDbMessages(data);
        
        const messagesArray = data.messages.map(msg => ({
          id: msg.id, // use the db id
          message: msg.content,
          time:msg.timestamp,
          incoming: msg.sender.id!= userId, // or compare by id if you have it
          subtype: 'text', // assuming all are text messages
          from: msg.sender.fullName,
          convId:selectedChat.id
        }));

       

      // 3. Set state and log the value we're setting
      console.log("Setting messages:", messagesArray);
      setDisplayMessages(messagesArray);
      setDbMessages(messagesArray);

        console.log(displayMessages);
        console.log(dbMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat?.id]); // Re-fetch when conversation ID changes
// 2. Handle real-time Agora updates (runs when new messages arrive)
useEffect(() => {
  console.log("Updated displayMessages:", displayMessages);
}, [displayMessages]); 
useEffect(() => {
  if (!selectedChat ) return;

  const otherUserId = selectedChat.otherParticipantId;

  const newRelevantMessages = messages.filter(agoraMsg => {
    const isParticipant = agoraMsg.from == otherUserId || agoraMsg.to == otherUserId;
    const isNew = !displayMessages.some(dbMsg => dbMsg.id == agoraMsg.id);
    return isParticipant && isNew;
  });

  // Only update if we found genuinely new messages
  if (newRelevantMessages.length > 0) {
    setDisplayMessages(prev => [...prev, ...newRelevantMessages]);
  }
  console.log(displayMessages)
}, [messages]); // Run when Agora messages change

  return (
    <Stack height={'100%'} maxHeight={'100vh'} width={'auto'}>
      {/* Chat header */}
      <Header selectedChat={selectedChat} />
      {/* Msg */}
      <Box className='scrollbar' width={"100%"} sx={{flexGrow:1, height:'100%', overflowY:'scroll'}}>
        <Message menu={true} messages={displayMessages}/>
      </Box>
      {/* Chat footer */}
      <Footer selectedChat={selectedChat}/>
    </Stack>
  )
}

export default Conversation;