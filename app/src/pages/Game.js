import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';
import ChatWindow from "../components/ChatWindow";
import ChatComposer from "../components/ChatComposer";
import Button from '../components/Button';
import { createGame, evaluate, queryModel } from '../api/api';


function Game() {

  const [ messages, setMessages ] = useState([]);
  const [ gettingQuery, setGettingQuery ] = useState(false);
  const [ queries, setQueries ] = useState(0);
  const [ submitted, setSubmitted ] = useState(false);

  const submitQuery = async (getNewMessage) => {
    if (!canQuery()) return;
    if (getNewMessage === "") return;

    // display query message
    setGettingQuery(true);
    let updatedMessages = [...messages, { text: getNewMessage }];
    setMessages(updatedMessages);

    // get response from server
    try {
      const response = await queryModel(getNewMessage);
      updatedMessages = [...updatedMessages, { text: response }];
      setMessages(updatedMessages);
      setQueries(queries + 1);
      setGettingQuery(false);
    } catch (err) {
      setGettingQuery(false);
      console.log(err);
    }
  };

  const canQuery = () => { return !gettingQuery && queries < 3 && !submitted; };

  const canEvaluate = () => { return queries > 0 && !submitted; };

  const submitEvaluation = async (evaluation) => {
    if (!canEvaluate()) return;

    setSubmitted(true);
    try {
      await evaluate(evaluation);
    } catch (err) {
      console.log(err);
      setSubmitted(false);
    }
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
      <ChatComposer submitted={submitQuery} canQuery={canQuery()} />
      <div className='eval-box'>
        <Button disabled={!canEvaluate()} onClick={async () => { await submitEvaluation("ai")}} >AI</Button>
        <Button disabled={!canEvaluate()} onClick={async () => { await submitEvaluation("human")}} >Human</Button>
      </div>
      <Link to="/"><button className='back-btn' >Back to Scoreboard</button></Link>
    </div>
  );
}

export default Game;

