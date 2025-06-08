// src/contexts/ChatContext.js
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import AgoraChat from 'agora-chat';
import catSound from './cat.mp3';
import axios from 'axios';
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const appKey = "711336456#1540221";
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const chatClient = useRef(null);

  // Initialize the chat client
  useEffect(() => {
    chatClient.current = new AgoraChat.connection({
      appKey: appKey,
    });

    // Add event handlers
    chatClient.current.addEventHandler('connection&message', {
      onConnected: () => {
        setIsConnected(true);
        console.log('Connected to Agora Chat');
        console.log("connecteeed");
      },
      onDisconnected: () => {
        setIsConnected(false);
        console.log('Disconnected from Agora Chat');
      },
      onTextMessage: (message) => {
        console.log("message jekkk fiik",message);
        setMessages(prev => [...prev, {
          id: message.id,
          time:message.time,
          message: message.msg,
          incoming: true,
          subtype: 'text',
          from: message.from,
          convId:message.ext.convId
        }]);
        console.log(messages,"messagee heeee");
        const audio = new Audio(catSound);
        console.log(audio);
        audio.load();
        audio.currentTime=0;
        audio.play().catch(e => console.log('Audio play error:', e));
      },
      onError: (error) => {
        console.error('Chat error:', error);
        console.log("error",error);
      }
    }
  );
  console.log(messages);
    return () => {
      if (chatClient.current) {
        chatClient.current.close();
      }
    };
  }, []);

  // Hardcoded login function
  const login = async (userId, token) => {
    try {
      await chatClient.current.open({
        user: userId,
        accessToken: token
      });
      setCurrentUser(userId);
      console.log("connecteed");
      return true;
    } catch (error) {
      console.error('Login failed:', error);
       console.log("faileed");
      return false;
    }
  };

  // Send message function
  const sendMessage = async (too, message,conversationId) => {
    console.log("message",message);
    console.log("too",too);
    if (!message.trim()) return;
    
    try {
     const  port=process.env.REACT_APP_PORT;

      const response = await fetch(`http://localhost:${port}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: conversationId,
          senderId: currentUser,
          content: message
        })
      });
      const data = await response.json(); // This is needed with fetch
      console.log(data, 'data after message sent');
      const options = {
        id:data.id,
        chatType: "singleChat",
        type: "txt",
        to: String(too),
        msg: message,
         ext: { // ✅ Store custom data in `ext`
            convId: conversationId,
            
          }
      };
      let msg = AgoraChat.message.create(options);
      await chatClient.current.send(msg);
      
      // Add to local state immediately for optimistic UI update
      setMessages(prev => [...prev, {
        id: data.id,
        time:data.timestamp,
        to: too,
        message: message,
        incoming: false,
        subtype: 'text',
        from: currentUser,
        convId:conversationId

      }]);
    } catch (error) {
      console.error('Message send failed:', error);
    }
  };

  return (
    <ChatContext.Provider value={{
      currentUser,
      isConnected,
      messages,
      login,
      sendMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);