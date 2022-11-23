import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/App.css';
import ChatWindow from "../components/ChatWindow";
import ChatComposer from "../components/ChatComposer";
import Button from '../components/Button';
import { createGame, evaluate, queryModel } from '../api/api';
import toast, { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';

const maxLength = 280;



function Game() {

  const { role } = useParams();
  const responder = role === 'responder';
  const investigator = role === 'investigator';

  const [ gameCreated, setGameCreated ] = useState(false);
  const [ token, setToken ] = useState(null);
  const [ socket, setSocket ] = useState(null);
  const [ messages, setMessages ] = useState([]);
  const getMessages = () => messages;
  const [ gettingQuery, setGettingQuery ] = useState(false);
  const [ queries, setQueries ] = useState(0);
  const [ submitted, setSubmitted ] = useState(false);
  const [ results, setResults ] = useState(null);

  const submitQuery = async (getNewMessage) => {
    if (!canQuery()) return;
    if (getNewMessage === "" || getNewMessage.length > maxLength) return;

    // Input sanitization
    getNewMessage = getNewMessage.trim();
    // add punctuation to getNewMessage if it doesn't have any
    if (!getNewMessage.endsWith(".") && !getNewMessage.endsWith("?") && !getNewMessage.endsWith("!")) {
      getNewMessage += ".";
    }

    // display query message
    setGettingQuery(true);

    // send to human
    const messageType = responder ? "response" : "query";
    const message = { text: getNewMessage, type: messageType };
    socket.emit('message', { token: token, message: message });

    // // send to ai
    // let updatedMessages = [...messages, { text: getNewMessage, type: "query" }];
    // setMessages(updatedMessages);

    // // get response from server
    // try {
    //   const query = updatedMessages.map((message) => message.text).join("\n\n");
    //   const response = await queryModel(token, query);
    //   updatedMessages = [...updatedMessages, { text: response.trim(), type: "response" }];
    //   setMessages(updatedMessages);
    //   setQueries(queries + 1);
    //   setGettingQuery(false);
    // } catch (err) {
    //   setGettingQuery(false);
    //   console.log(err);
    // }
  };

  const canQuery = () => { return gameCreated && !gettingQuery && queries < 3 && !submitted; };

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

  const sendSocketMessage = () => {
    // send message to socket
    socket.emit('message', { message: { text: "asdf", type: "response" }, token: token });
  }

  const handleMessage = (messages, data) => {
    console.log('message', data);
    console.log(messages);
    const updatedMessages = [...messages, data];
    setMessages(updatedMessages);
    if (data.type === "query") {
      setQueries(queries + 1);
    }
    setGettingQuery(false);
  }

  useEffect(() => {
    (async () => {
      try {
        const gameRes = await createGame(role);
        setToken(gameRes);
        setGameCreated(true);
        console.log(gameRes);

        const socket = io.connect('http://localhost:5000');
        socket.on('connect', function() {
          console.log('connected');
        });
        socket.on('join', function(data) {
          console.log('join', data);
        });
        socket.on('leave', function(data) {
          console.log('leave', data);
        });
        socket.on('message', (data) => handleMessage(messages, data));

        socket.emit('join', { token: gameRes })

        setSocket(socket);

        return () => {
          socket.off('connect');
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
      <div className="game-container">
        <ChatWindow messagesList={messages} />
        <div className='input-container'>
          <ChatComposer submitted={submitQuery} canQuery={canQuery()} gameCreated={gameCreated} maxLength={maxLength} />
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

