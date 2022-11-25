import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/App.css';
import ChatWindow from "../components/ChatWindow";
import ChatComposer from "../components/ChatComposer";
import Button from '../components/Button';
import { evaluate, socket } from '../api/api';
import toast, { Toaster } from 'react-hot-toast';

const maxLength = 280;



function Game() {

  const { role } = useParams();
  const responder = role === 'responder';
  const investigator = role === 'investigator';

  const [ gameCreated, setGameCreated ] = useState(false);
  const [ token, setToken ] = useState(null);
  const [ matched, setMatched ] = useState(false);
  const [ messages, setMessages ] = useState([]);
  const [ gettingQuery, setGettingQuery ] = useState(false);
  const [ queries, setQueries ] = useState(0);
  const [ responses, setResponses ] = useState(0);
  const [ submitted, setSubmitted ] = useState(false);
  const [ results, setResults ] = useState(null);

  const submitMessage = async (message) => {
    if (!canQuery()) return;
    if (message === "" || message.length > maxLength) return;

    // Input sanitization
    message = message.trim();
    // add punctuation to message if it doesn't have any
    if (!message.endsWith(".") && !message.endsWith("?") && !message.endsWith("!")) {
      message += ".";
    }

    // display query message
    setGettingQuery(true);

    // send to human
    const messageType = responder ? "response" : "query";
    socket.emit('message', { token: token, message: { text: message, type: messageType } });
  };

  const canQuery = () => {
    if (responder) return matched && !gettingQuery && queries > 0 && !submitted;
    if (investigator) return matched && !gettingQuery && queries < 3 && !submitted;
  };

  const canEvaluate = () => { return gameCreated && queries > 0 && !submitted; };

  const submitEvaluation = async (evaluation) => {
    if (!canEvaluate()) return;

    setSubmitted(true);
    try {
      const evaluateRes = await evaluate(token, evaluation);
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

  const handleMessage = (messages, data) => {
    const updatedMessages = [...messages, data];
    setMessages(updatedMessages);
    if (data.type === "query") {
      setQueries(queries + 1);
      if (role === "responder") {
        setGettingQuery(false);
      }
    } else if (data.type === "response") {
      setResponses(responses + 1);
      if (role === "investigator") {
        setGettingQuery(false);
      }
    }
  }

  useEffect(() => {
    (async () => {
      try {

        // Setup socket and handlers
        socket.connect();
        socket.on('connect', function() {
          console.log('connected');
        });
        socket.on('disconnect', function(data) {
          console.log('disconnect', data);
        });
        socket.on('join', function(data) {
          console.log('join', data);
          const { token, gotMatch } = data;
          setToken(token);
          setGameCreated(true);
          setMatched(gotMatch);
        });
        socket.on('leave', function(data) {
          console.log('leave', data);
        });
        socket.on('message', (data) => handleMessage(messages, data));

        // Join game
        // socket.emit('join', { token: gameRes })
        socket.emit('join', { role: role })

        return () => {
          socket.disconnect();

          socket.off('connect');
          socket.off('disconnect');
          socket.off('join');
          socket.off('leave');
          socket.off('message');
        };

      } catch (err) {
        console.log(err);
      }
    })();


  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (data) => handleMessage(messages, data));
    }
  }, [messages]);

  return (
    <div className="App">
      <div>
        <Toaster
        toastOptions={{
          className: 'toast'
        }}
        />
      </div>
      {!matched &&
        <>
          <p className="finding-match">Finding match...</p>
          <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </>
      }
      <div className="game-container">
        <ChatWindow messagesList={messages} />
        <div className='input-container'>
          <ChatComposer submitted={submitMessage} canQuery={canQuery()} matched={matched} maxLength={maxLength} />
          {
            investigator &&
            <div>{results == null ? (
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
            </div>
          }
        </div>
      </div>
      {/* <button className="clickable-btn" onClick={sendSocketMessage}>Send Socket Message</button> */}
      <div className="bottom-btn-box" >
        {submitted && <button className='clickable-btn' onClick={() => window.location.reload(false)}>New Game</button>}
        <Link to="/"><button className='clickable-btn' >Back to Scoreboard</button></Link>
      </div>
    </div>
  );
}

export default Game;

