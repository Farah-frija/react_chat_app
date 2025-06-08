// src/components/Conversation/Footer.js
import { Box, Fab, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import React, { useState ,useEffect} from 'react';
import { styled, useTheme } from "@mui/material/styles";
import { LinkSimple, PaperPlaneTilt, Smiley, Camera, File, Image, Sticker, User } from 'phosphor-react';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useChat } from '../../agoraService/Agora_chat';

const StyledInput = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-input": {
      paddingTop: '12px',
      paddingBottom: '12px',
    }  
}));

const Actions = [
    // ... (keep your existing actions array)
];

const ChatInput = ({setOpenPicker, onSendMessage, message, setMessage}) =>{
    const [openAction, setOpenAction] = useState(false);
    
    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <StyledInput 
            fullWidth 
            placeholder='Write a message...' 
            variant='filled' 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
                disableUnderline: true,
                startAdornment: (
                    <Stack sx={{width:'max-content'}}>
                        <Stack sx={{position:'relative', display: openAction ? 'inline-block' : 'none'}}>
                            {Actions.map((el)=>(
                                <Tooltip placement='right' title={el.title} key={el.title}>
                                    <Fab sx={{position:'absolute', top: -el.y, backgroundColor: el.color}}>
                                        {el.icon}
                                    </Fab>
                                </Tooltip>
                            ))}
                        </Stack>
                        <InputAdornment>
                            <IconButton onClick={()=>{
                                setOpenAction((prev)=>!prev)
                            }}>
                                <LinkSimple/>
                            </IconButton>
                        </InputAdornment>
                    </Stack>
                ),
                endAdornment: (
                    <InputAdornment>
                        <IconButton onClick={()=>{
                            setOpenPicker((prev)=> !prev);
                        }}>
                            <Smiley/>
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    )
}

const Footer = ({ selectedChat, activeRendezvous }) => {
    const theme = useTheme();
    const [openPicker, setOpenPicker] = useState(false);
    const [message, setMessage] = useState('');
    const { sendMessage, currentUser } = useChat();
    const [recipientId, setRecipientId] = useState(null);
    const [isActiveMeeting, setIsActiveMeeting] = useState(false);

    useEffect(() => {
        const meetingActive = activeRendezvous && 
                            activeRendezvous.conversationId === selectedChat?.id;
        setIsActiveMeeting(meetingActive);
    }, [activeRendezvous, selectedChat]);

    useEffect(() => {
        if (selectedChat?.otherParticipantId) {
            setRecipientId(selectedChat.otherParticipantId);
        }
    }, [selectedChat]);

    const handleSendMessage = (msg) => {
        if (currentUser && msg.trim() && recipientId && isActiveMeeting) {
            sendMessage(recipientId, msg, selectedChat?.id);
            setMessage('');
        }
    };

    return (
        <Box p={2} sx={{ 
            width: '100%', 
            backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.paper, 
            boxShadow: '0px 0px 2px rgba(0,0,0,0.25)'
        }}>
            <Stack direction='row' alignItems={'center'} spacing={3}>
                <Stack sx={{width: '100%'}}> 
                    {/* Emoji picker and chat input remain unchanged */}
                    <ChatInput 
                        setOpenPicker={setOpenPicker} 
                        onSendMessage={handleSendMessage}
                        message={message}
                        setMessage={setMessage}
                    />
                </Stack>
                
                {/* Modified Send Button */}
                <Box sx={{
                    height: 48, 
                    width: 48, 
                    backgroundColor: isActiveMeeting 
                        ? theme.palette.primary.main 
                        : theme.palette.grey[400],
                    borderRadius: 1.5,
                    opacity: isActiveMeeting ? 1 : 0.7
                }}>
                    <Stack sx={{
                        height: '100%', 
                        width: '100%', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                    }}>
                        <IconButton 
                            onClick={() => isActiveMeeting && handleSendMessage(message)}
                            disabled={!isActiveMeeting}
                            sx={{
                                '&.Mui-disabled': {
                                    color: theme.palette.grey[600]
                                }
                            }}
                        >
                            <PaperPlaneTilt color={isActiveMeeting ? '#fff' : theme.palette.grey[600]}/>
                        </IconButton>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    )
}

export default Footer;