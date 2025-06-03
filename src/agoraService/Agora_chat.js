// src/contexts/ChatContext.js
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import AgoraChat from 'agora-chat';
import catSound from './cat.mp3';
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
        console.log(message);
        setMessages(prev => [...prev, {
          id: Date.now(),
          message: message.msg,
          incoming: true,
          subtype: 'text',
          from: message.from
        }]);
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
  const sendMessage = async (to, message) => {
    console.log("message");
    if (!message.trim()) return;

    try {
      const options = {
        chatType: "singleChat",
        type: "txt",
        to: to,
        msg: message,
      };
      let msg = AgoraChat.message.create(options);
      await chatClient.current.send(msg);
      
      // Add to local state immediately for optimistic UI update
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: message,
        incoming: false,
        subtype: 'text',
        from: currentUser
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