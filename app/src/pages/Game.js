import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';
import ChatWindow from "../components/ChatWindow";
import ChatComposer from "../components/ChatComposer";
import Button from '../components/Button';
import { createGame, evaluate, queryModel } from '../api/api';
import toast, { Toaster } from 'react-hot-toast';


function Game() {

  const [ gameCreated, setGameCreated ] = useState(false);
  const [ messages, setMessages ] = useState([]);
  const [ gettingQuery, setGettingQuery ] = useState(false);
  const [ queries, setQueries ] = useState(0);
  const [ submitted, setSubmitted ] = useState(false);
  const [ results, setResults ] = useState(null);

  const submitQuery = async (getNewMessage) => {
    if (!canQuery()) return;
    if (getNewMessage === "") return;

    // display query message
    setGettingQuery(true);
    let updatedMessages = [...messages, { text: getNewMessage, type: "query" }];
    setMessages(updatedMessages);

    // get response from server
    try {
      const response = await queryModel(getNewMessage);
      updatedMessages = [...updatedMessages, { text: response, type: "response" }];
      setMessages(updatedMessages);
      setQueries(queries + 1);
      setGettingQuery(false);
    } catch (err) {
      setGettingQuery(false);
      console.log(err);
    }
  };

  const canQuery = () => { return gameCreated && !gettingQuery && queries < 3 && !submitted; };

  const canEvaluate = () => { return gameCreated && queries > 0 && !submitted; };

  const submitEvaluation = async (evaluation) => {
    if (!canEvaluate()) return;

    setSubmitted(true);
    try {
      const evaluateRes = await evaluate(evaluation);
      setResults(evaluateRes);
      if (evaluation === evaluateRes) {
        toast.success("Correct!");
      } else {
        toast.error("Incorrect!");
      }
    } catch (err) {
      console.log(err);
      setSubmitted(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const gameRes = await createGame();
        setGameCreated(true);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
    <div className="App">
      <div>
        <Toaster
        toastOptions={{
          className: 'toast'
        }}
        />
      </div>
      <ChatWindow messagesList={messages} />
      <ChatComposer submitted={submitQuery} canQuery={canQuery()} />
        {results == null ? (
          <div className='eval-box'>
            <Button disabled={!canEvaluate()} onClick={async () => { await submitEvaluation("ai")}} >AI</Button>
            <Button disabled={!canEvaluate()} onClick={async () => { await submitEvaluation("human")}} >Human</Button>
          </div>
        ) : (
          <div className='eval-box'>
            <button className={results === 'ai' ? 'correct-btn' : 'incorrect-btn'}>AI</button>
            <button className={results === 'human' ? 'correct-btn' : 'incorrect-btn'}>Human</button>
          </div>
        )}
      <Link to="/"><button className='back-btn clickable-btn' >Back to Scoreboard</button></Link>
    </div>
  );
}

export default Game;

