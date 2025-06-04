import { Box, IconButton, Stack, Typography, InputBase, Button, Divider, Avatar, Badge } from '@mui/material'
import { ArchiveBox, CircleDashed, MagnifyingGlass } from 'phosphor-react';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { faker } from '@faker-js/faker';
import { Search, SearchIconWrapper, StyledInputBase } from '../../components/Search';
import ChatElement from '../../components/ChatElement';

const Chats =  ({ onSelectChat }) => {
  const theme = useTheme();
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null); // Add this line
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('http://localhost:3001/conversations/user/1');
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        
        // Transform the API data to match your ChatElement props
        const transformedData = data.map(chat => ({
          id: chat.id,
          name: chat.otherParticipant.fullName,
          otherParticipantId: chat.otherParticipant.id,
          img: faker.image.avatar(), // Using faker for avatar since API doesn't provide
          msg: chat.lastMessage,
          time:new Date( chat.lastMessageAt).getTime(),
          online: chat.otherParticipant.isOnline,
          unread: 0, // You might want to add this to your API response
          pinned: false // You might want to add this to your API response
        }));
        
        setChatList(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);
  const handleChatSelect = (chat) => {
    console.log(chat,'chh')
    setSelectedChat(chat);
   
    onSelectChat(chat); // Cela mettra à jour l'état dans GeneralApp
    console.log(selectedChat,'sell');
  };

  if (loading) {
    return (
      <Box sx={{
        position: "relative", width: 320, 
        backgroundColor: theme.palette.mode === 'light'? "#F8FAFF" : theme.palette.background.paper,
        boxShadow: '0px 0px 2px rgba(0,0,0,0.25)'
      }}>
        <Typography p={3}>Loading chats...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        position: "relative", width: 320, 
        backgroundColor: theme.palette.mode === 'light'? "#F8FAFF" : theme.palette.background.paper,
        boxShadow: '0px 0px 2px rgba(0,0,0,0.25)'
      }}>
        <Typography p={3} color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (    
    <Box sx={{
      position: "relative", width: 320, 
      backgroundColor: theme.palette.mode === 'light'? "#F8FAFF" : theme.palette.background.paper,
      boxShadow: '0px 0px 2px rgba(0,0,0,0.25)'
    }}>
      <Stack p={3} spacing={2} sx={{height:"100vh"}}>
        <Stack direction="row" alignItems='center' justifyContent='space-between'>
          <Typography variant='h5'>
            Chats
          </Typography>
          <IconButton>
            <CircleDashed />
          </IconButton>
        </Stack>

        <Stack sx={{ width: "100%" }}>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase placeholder='Search...' inputProps={{ "aria-label": "search" }} />
          </Search>
        </Stack>

        <Stack spacing={1}>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <ArchiveBox size={24} />
            <Button>
              Archive
            </Button>
          </Stack>
          <Divider />
        </Stack>

        <Stack className='scrollbar' spacing={2} direction='column' sx={{flexGrow:1, overflow:'scroll', height:'100%'}}>
          <Stack spacing={2.4}>
            <Typography variant='subtitle2' sx={{color:"#676767"}}>
              Pinned
            </Typography>
            {chatList.filter((el) => el.pinned).map((el) => (
              <ChatElement key={el.id} {...el} />
            ))}
          </Stack>
          
          <Stack spacing={2.4}>
            <Typography variant='subtitle2' sx={{color:"#676767"}}>
              All Chats
            </Typography>
            {chatList.filter((el) => !el.pinned).map((el) => (
    <ChatElement 
      key={el.id} 
      {...el}
      onClick={() => handleChatSelect(el)}
      isSelected={selectedChat?.id === el.id}
    />
  ))}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}

export default Chats;