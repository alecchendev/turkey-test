import '../styles/App.css';
import { useEffect, useState } from 'react';
import ChatWindow from "../components/ChatWindow";
import ChatComposer from "../components/ChatComposer";
import { createGame, evaluate, queryModel } from '../api/api';

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

  const submitEvaluation = async (evaluation) => {
    const evaluationRes = await evaluate(evaluation);
  }

  useEffect(() => {
    (async () => {
      const res = await createGame();
      if (res == null) {
        console.log("Error creating game");
      } else {
        console.log("Game created");
      }
    })();
  }, []);

  return (
    <div className="App">
      <ChatWindow messagesList={messages} />
      <ChatComposer submitted={submitted} />
      <div className='eval-box'>
        <button onClick={async () => { await submitEvaluation("ai")}}>AI</button>
        <button onClick={async () => { await submitEvaluation("human")}}>Human</button>
      </div>
    </div>
  );
}

export default Game;

