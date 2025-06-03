// src/components/Conversation/Message.js
import { Box, Stack } from '@mui/material'
import React from 'react';
import { DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg, TimeLine } from './MsgTypes';

const Message = ({menu, messages}) => {
  return (
    <Box p={3}>
        <Stack spacing={3}>
            {messages.map((el, index) => {
                // Add divider for first message
                if (index === 0) {
                    return (
                        <>
                            <TimeLine el={{type: 'divider', text: 'Today'}}/>
                            <TextMsg el={el} menu={menu} key={el.id}/>
                        </>
                    );
                }
                
                return <TextMsg el={el} menu={menu} key={el.id}/>;
            })}
        </Stack>
    </Box>
  )
}

export default Message;