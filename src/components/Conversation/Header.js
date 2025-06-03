import { Avatar, Box, Typography,IconButton, Divider,Stack, } from '@mui/material'
import { CaretDown, MagnifyingGlass, Phone,VideoCamera } from 'phosphor-react'
import React from 'react';
import { useTheme } from "@mui/material/styles";
import { faker } from '@faker-js/faker';
import StyledBadge from '../StyledBadge';
import { ToggleSidebar } from '../../redux/slices/app';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const getPath = (index) =>{
 
    return '/meeting'
  
 

};
const handleMeetingClick = () => {
    // Option 1: Open in same tab (current behavior)
    // navigate(getPath(0));
    
    // Option 2: Open in new tab (recommended)
    window.open(getPath(0), '_blank', 'noopener,noreferrer');
  };
  const Header = ({ selectedChat }) => {
    console.log('Header selectedChat:', selectedChat);
 const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  return (
    <Box p={2} sx={{ width:'100%', backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.paper, boxShadow:'0px 0px 2px rgba(0,0,0,0.25)'}}>
    <Stack alignItems={'center'} direction='row' justifyContent={'space-between'}
    sx={{width:'100%', height:'100%'}}>
        <Stack onClick={()=>{
            dispatch(ToggleSidebar());
        }}direction={'row'} spacing={2}>
        <Box>
          <StyledBadge overlap="circular" variant="dot">
            <Avatar alt={selectedChat?.name} src={selectedChat?.img} />
          </StyledBadge>
        </Box>
        <Stack spacing={0.2}>
          <Typography variant='subtitle2'>
            {selectedChat?.name || 'Select a chat'}
          </Typography>
          <Typography variant='caption'>
            {selectedChat?.online ? 'Online' : 'Offline'}
          </Typography>
        </Stack>
      </Stack>
        <Stack direction='row' alignItems='center' spacing={3}>
            <IconButton onClick={  handleMeetingClick } >
                <VideoCamera/>
            </IconButton>
            <IconButton>
                <Phone/>
            </IconButton>
            <IconButton>
                <MagnifyingGlass/>
            </IconButton>
            <Divider orientation='vertical' flexItem/>
            <IconButton>
                <CaretDown/>
            </IconButton>
        </Stack>
    </Stack>
</Box>
  )
}

export default Header