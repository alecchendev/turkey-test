import './App.css';
import { useState } from 'react';
import ChatWindow from "./ChatWindow";
import ChatComposer from "./ChatComposer";

function App() {

  const [ messages, setMessages ] = useState([
    { text: "First stored message" },
    { text: "Second stored message" }
  ]);

  const submitted = (getNewMessage) => {
    if (getNewMessage !== "") {
      // match the state format
      const newMessage = { text: getNewMessage };
      // merge new message in copy of state stored messages
      let updatedMessages = [...messages, newMessage];
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

