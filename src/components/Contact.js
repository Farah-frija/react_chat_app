import { useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Divider,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { format } from 'date-fns';

const Contact = ({ selectedChat }) => {
  const [meetingSessions, setMeetingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const conversationId = selectedChat?.id;
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchMeetingHistory = async () => {
      try {
        const port=process.env.REACT_APP_PORT;
        console.log(`http://localhost:${port}/meeting-history/conversation/${conversationId}`);
        const response = await axios.get(
          `http://localhost:${port}/meeting-history/conversation/${conversationId}`
        );
        setMeetingSessions(response.data);
      } catch (error) {
        console.error('Error fetching meeting history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMeetingHistory();
    }
  }, [conversationId]);

  const getActionText = (session) => {
    const isCurrentUser = session.participant.id === currentUserId;
    const action = session.actionType === 'join' ? 'joined' : 'left';
    const time = format(new Date(session.actionTime), 'h:mm a');
    
    return isCurrentUser 
      ? `You ${action} at ${time}`
      : `${session.participant.fullName} ${action} at ${time}`;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <CircularProgress size={24} />
    </Box>
  );

  if (!meetingSessions.length) return (
    <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
      No meeting history found
    </Typography>
  );

  return (
    <Box sx={{ 
      p: 1.5, 
      backgroundColor: theme.palette.background.paper,
      borderRadius: 1,
      boxShadow: theme.shadows[1]
    }}>
      <Typography variant="subtitle2" gutterBottom sx={{ 
        fontWeight: 500,
        color: 'text.primary',
        mb: 1.5
      }}>
        Meeting History
      </Typography>
      <List dense sx={{ py: 0 }}>
        {meetingSessions.map((session) => (
          <React.Fragment key={session.id}>
            <ListItem alignItems="flex-start" sx={{ py: 0.75, px: 1 }}>
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar 
                  alt={session.participant.fullName} 
                  sx={{ width: 32, height: 32 }} 
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ 
                    fontWeight: session.participant.id === currentUserId ? 500 : 400,
                    color: 'text.primary'
                  }}>
                    {getActionText(session)}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }}>
                    {format(new Date(session.actionTime), 'PP')}
                  </Typography>
                }
                sx={{ my: 0 }}
              />
            </ListItem>
            <Divider variant="inset" component="li" sx={{ ml: 6 }} />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Contact;