import './styles/App.css';
import { useState } from 'react';
import ChatWindow from "./components/ChatWindow";
import ChatComposer from "./components/ChatComposer";
import axios from 'axios';

const api = "http://localhost:5000/api/v0";

function App() {

  const [ messages, setMessages ] = useState([
    { text: "First stored message" },
    { text: "Second stored message" }
  ]);

  const submitted = async (getNewMessage) => {
    if (getNewMessage !== "") {
      // add query message
      let updatedMessages = [...messages, { text: getNewMessage }];
      setMessages(updatedMessages);
      // get response from server
      const newMessageRes = await axios.get(`${api}/query?q=${getNewMessage}`);
      const newMessage = { text: newMessageRes.data};
      // merge new message in copy of state stored messages
      updatedMessages = [...updatedMessages, newMessage];
      // update state
      setMessages(updatedMessages);
    }
  };

  return (
    <div className="App">
      <h1>Title</h1>
      <ChatWindow messagesList={messages} />
      <ChatComposer submitted={submitted} />
    </div>
  );
}

export default App;

