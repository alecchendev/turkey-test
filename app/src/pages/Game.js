import '../styles/App.css';
import { useEffect, useState } from 'react';
import ChatWindow from "../components/ChatWindow";
import ChatComposer from "../components/ChatComposer";
import axios from 'axios';
import { createGame, queryModel } from '../api/api';

const api = "http://localhost:5000/api/v0";

function Game() {

  const [ messages, setMessages ] = useState([]);

  const submitted = async (getNewMessage) => {
    if (getNewMessage !== "") {
      // add query message
      let updatedMessages = [...messages, { text: getNewMessage }];
      setMessages(updatedMessages);
      // get response from server
      const newMessageRes = await queryModel(getNewMessage);
      const newMessage = { text: newMessageRes };
      // merge new message in copy of state stored messages
      updatedMessages = [...updatedMessages, newMessage];
      // update state
      setMessages(updatedMessages);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await createGame();
      if (res == null) {
        console.log("Error creating game");
      }
    })();
  }, []);

  return (
    <div className="App">
      <h1>Title</h1>
      <ChatWindow messagesList={messages} />
      <ChatComposer submitted={submitted} />
    </div>
  );
}

export default Game;

