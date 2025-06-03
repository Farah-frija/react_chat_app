// src/components/Conversation/Footer.js
import { Box, Fab, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import React, { useState } from 'react';
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

const Footer = () => {
    const theme = useTheme();
    const [openPicker, setOpenPicker] = useState(false);
    const [message, setMessage] = useState(''); // State moved here
    const { sendMessage, currentUser } = useChat();
    
    const recipientId = "1111";
    
    const handleSendMessage = (msg) => {
        if (currentUser && msg.trim()) {
            sendMessage(recipientId, msg);
            setMessage(''); // Clear the message after sending
        }
    };

    return (
        <Box p={2} sx={{ width:'100%', backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' :
         theme.palette.background.paper, boxShadow:'0px 0px 2px rgba(0,0,0,0.25)'}}>
            <Stack direction='row' alignItems={'center'} spacing={3}>
                <Stack sx={{width:'100%'}}> 
                    <Box sx={{ display: openPicker ? 'inline' : 'none' , zIndex:10, position:'fixed',bottom:81, right:100}}>
                        <Picker 
                            theme={theme.palette.mode} 
                            data={data} 
                            onEmojiSelect={(emoji) => {
                                setMessage(prev => prev + emoji.native); // Fixed emoji selection
                                setOpenPicker(false); // Close picker after selection
                            }}
                        />
                    </Box> 
                    <ChatInput 
                        setOpenPicker={setOpenPicker} 
                        onSendMessage={handleSendMessage}
                        message={message}
                        setMessage={setMessage}
                    />
                </Stack>
                
                <Box sx={{height:48, width: 48, backgroundColor:theme.palette.primary.main, 
                borderRadius: 1.5}}>
                    <Stack sx={{height:'100%', width:'100%', alignItems:'center', justifyContent:'center'}}>
                        <IconButton onClick={() => handleSendMessage(message)}>
                            <PaperPlaneTilt color='#fff'/>
                        </IconButton>
                    </Stack>
                </Box>
            </Stack>
        </Box>
    )
}

export default Footer;