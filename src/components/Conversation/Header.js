import { Avatar, Box, Typography,IconButton, Divider,Stack,Button } from '@mui/material'
import { CaretDown, MagnifyingGlass, Phone,VideoCamera } from 'phosphor-react'
import {React,useEffect,useState} from 'react';
import { useTheme } from "@mui/material/styles";
import { faker } from '@faker-js/faker';
import StyledBadge from '../StyledBadge';
import { ToggleSidebar } from '../../redux/slices/app';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


  const Header = ({ selectedChat ,activeRendezvous,onMeetingEnd}) => {
    const getPath = (index) =>{
      if (!selectedChat) return '/meeting';
     
      return `/meeting?convId=${encodeURIComponent(selectedChat.id)}`;
      
     
    
    };
    const [timeRemaining, setTimeRemaining] = useState(null);
  
    const [isActiveMeeting, setIsActiveMeeting] = useState(false);
    
    useEffect(() => {
      const meetingActive = activeRendezvous && 
                          activeRendezvous.conversationId == selectedChat?.id;
      console.log(activeRendezvous,'meetingg activeee');
      setIsActiveMeeting(meetingActive);
      
      // Reset timer if no active meeting
      if (!meetingActive) {
        setTimeRemaining(null);
      }
    }, [activeRendezvous, selectedChat]);
    const handleMeetingClick = () => {
      // Option 1: Open in same tab (current behavior)
      // navigate(getPath(0));
      
      // Option 2: Open in new tab (recommended)
      window.open(getPath(0), '_blank', 'noopener,noreferrer');
    };
    console.log('Header selectedChat:', selectedChat);
 const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  useEffect(() => {
    if (!isActiveMeeting || !activeRendezvous) return;

    const interval = setInterval(() => {
      const remaining = new Date(activeRendezvous.endTime) - new Date();
      if (remaining <= 0) {
        setTimeRemaining(0);
        clearInterval(interval);
        setIsActiveMeeting(false); // Meeting ended
        if (onMeetingEnd) {
          onMeetingEnd(); // Notify parent component
        }
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActiveMeeting, activeRendezvous]);

  // Rest of your component remains the same...
  const formatTime = (ms) => {
    if (ms <= 0) return "00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  return (
    <Box p={2} sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.paper, 
      boxShadow: '0px 0px 2px rgba(0,0,0,0.25)'
    }}>
      <Stack 
        alignItems={'center'} 
        direction='row' 
        justifyContent={'space-between'}
        sx={{ width: '100%', height: '100%' }}
      >
        <Stack direction={'row'} spacing={2} alignItems="center">
          <Box>
            <StyledBadge overlap="circular" variant="dot" invisible={!isActiveMeeting}>
              <Avatar alt={selectedChat?.name} src={selectedChat?.img} />
            </StyledBadge>
          </Box>
          <Stack spacing={0.2}>
            <Typography variant='subtitle2'>
              {selectedChat?.name || 'Select a chat'}
            </Typography>
            <Typography variant='caption'>
              {isActiveMeeting ? 'Online' : 'Offline'}
            </Typography>
          </Stack>
          {isActiveMeeting ? (
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#4CAF50',
            color: 'white',
            '&:hover': { backgroundColor: '#3e8e41' },
            ml: 2,
            minWidth: '120px'
          }}
        >
          Remaining: {formatTime(timeRemaining || activeRendezvous.timeRemaining)} mins
        </Button>
      ) : (
        <Button
          variant="contained"
          size="small"
          disabled
          sx={{
            backgroundColor: theme.palette.grey[400],
            color: theme.palette.grey[700],
            ml: 2,
            minWidth: '120px',
            cursor: 'not-allowed'
          }}
        >
          No Active Paiement
        </Button>
      )}
        </Stack>
        
        <Stack direction='row' alignItems='center' spacing={3}>
        <IconButton 
    onClick={handleMeetingClick}
    disabled={!isActiveMeeting}  // Disabled when no active meeting
    sx={{ 
      color: isActiveMeeting 
        ? theme.palette.primary.main 
        : theme.palette.text.disabled,
      '&:hover': { 
        backgroundColor: isActiveMeeting 
          ? theme.palette.primary.light 
          : 'transparent',
      },
      '&.Mui-disabled': {
        color: theme.palette.text.disabled, // Ensure disabled state color
      }
    }}
  >
    <VideoCamera />
  </IconButton>
          
          <IconButton onClick={() => dispatch(ToggleSidebar())}>
            <MagnifyingGlass />
          </IconButton>
          
          <Divider orientation='vertical' flexItem />
          
          <IconButton>
            <CaretDown />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );

}

export default Header