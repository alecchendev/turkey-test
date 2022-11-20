import './App.css';
import { useRef, useState } from 'react';
import ChatWindow from "./ChatWindow";
import ChatComposer from "./ChatComposer";
import axios from 'axios';

const api = "http://localhost:5000/api/v0";

function App() {

  const [ messages, setMessages] = useState([
    { text: "First stored message" },
    { text: "Second stored message" }
  ]);

  // // function to make request to api and append the response to messages
  // const submitted = async (message) => {
  //   const response = await axios.post(`${api}/query?q=${message}`);
  //   const { data } = response;
  //   setMessages([...messages, { text: data.message }]);
  // };

  const submitted = async (getNewMessage) => {
    if (getNewMessage !== "") {
      // match the state format
      // const newMessage = { text: getNewMessage };
      const newMessageRes = await axios.get(`${api}/query?q=${getNewMessage}`);
      const newMessage = { text: newMessageRes.data};
      // merge new message in copy of state stored messages
      const updatedMessages = [...messages, newMessage];
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

