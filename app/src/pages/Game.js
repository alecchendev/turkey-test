import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/App.css';
import ChatWindow from "../components/ChatWindow";
import ChatComposer from "../components/ChatComposer";
import Button from '../components/Button';
import { socket } from '../api/api';
import toast, { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';

const maxLength = 280;

function Game() {

  const [ cookies, setCookies ] = useCookies(['user']);
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

    const updatedMessages = [...messages, { text: message, type: "query" }];
    // const query = updatedMessages.map((message) => message.text).join("\n\n");
    const query = updatedMessages.map((message) => {
      if (message.type === "query") {
        return "A: " + message.text;
      }
      return "B: " + message.text;
    }).join("\n");

    // display query message
    setGettingQuery(true);

    // send to human
    const messageType = responder ? "response" : "query";
    socket.emit('message', { token: token, message: { text: query, type: messageType } });
  };

  const canQuery = () => {
    if (responder) return matched && !gettingQuery && queries > 0 && !submitted;
    if (investigator) return matched && !gettingQuery && queries < 3 && !submitted;
  };

  const canEvaluate = () => { return gameCreated && queries > 0 && !submitted; };

  const submitEvaluation = async (evaluation) => {
    if (!canEvaluate()) return;

    setSubmitted(true);
    socket.emit('evaluate', { token: token, evaluation: evaluation });
    console.log("submitted evaluation");
  }

  const handleDisconnect = (messages, data) => {
    console.log('disconnect', data);
    const updatedMessages = [...messages, { text: "Other player disconnected.", type: "disconnect" }];
    setMessages(updatedMessages);
    setSubmitted(true);
    setResults("disconnected");
  }

  const handleMessage = (messages, data) => {
    data['text'] = data['text'].trim();
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

  const shareConversation = () => {
    // copy to clipboard
    const header = "🦃 Turkey Test\n"
    const convo = messages.map((message) => {
      if (message.type === "query") {
        return "A: " + message.text;
      } else if (message.type === "response") {
        return "B: " + message.text;
      } else {
        return message.text;
      }
    }).join("\n");
    navigator.clipboard.writeText(header + convo);

    // display toast
    toast.success("Copied to clipboard!");
  }

  const saveResults = (data) => {
    console.log('saving result')
    let stats = cookies.stats;
    if (stats === undefined) {
      stats = {
        responder: {
          fooled: 0,
          helped: 0,
        },
        investigator: {
          ai_right: 0,
          ai_wrong: 0,
          human_right: 0,
          human_wrong: 0,
        }
      };
      setCookies('stats', stats, { path: '/' });
    }

    console.log(stats);
    const correct = data.evaluation === data.results;
    if (responder) {
      if (correct === true) {
        stats.responder.helped += 1;
      }
      else {
        stats.responder.fooled += 1;
      }
    }
    if (investigator) {
      if (data.evaluation === "ai") {
        if (correct === true) {
          stats.investigator.ai_right += 1;
        }
        else {
          stats.investigator.ai_wrong += 1;
        }
      } else {
        if (correct === true) {
          stats.investigator.human_right += 1;
        }
        else {
          stats.investigator.human_wrong += 1;
        }
      }
    }
    setCookies('stats', stats, { path: '/' });
  }

  useEffect(() => {
    (async () => {
      try {

        // Setup socket and handlers
        socket.connect();
        socket.on('connect', function() {
          console.log('connected');
        });
        socket.on('disconnect', (data) => handleDisconnect(messages, data));
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
        socket.on('evaluate', function(data) {
          console.log(data);
          if (data.error) {
            console.log(data.error);
            setSubmitted(false);
            return;
          }
          setSubmitted(true);
          setResults(data);
          if (investigator === true) {
            if (data.evaluation === data.results) {
              toast.success("Correct!");
            } else {
              toast.error("Incorrect!");
            }
          } else if (responder === true) {
            if (data.evaluation === data.results) {
              toast.success("Helped fellow human!");
            } else {
              toast.success("Fooled silly human!");
            }
          }


          saveResults(data);

        });

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
          socket.off('evaluate');
        };

      } catch (err) {
        console.log(err);
      }
    })();


  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (data) => handleMessage(messages, data));
      socket.on('disconnect', (data) => handleDisconnect(messages, data));
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
          <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </>
      }
      <div className="game-container">
        <ChatWindow messagesList={messages} />
        <div className='input-container'>
          <ChatComposer submitted={submitMessage} canQuery={canQuery()} matched={matched} maxLength={maxLength} />
          {
            investigator ?
            <div>{results == null ? (
              <div className='eval-box'>
                <Button disabled={!canEvaluate()} onClick={async () => { await submitEvaluation("ai")}} >AI</Button>
                <Button disabled={!canEvaluate()} onClick={async () => { await submitEvaluation("human")}} >Human</Button>
              </div>
            ) : (
              <div className='eval-box'>
                <button className={results.results === 'ai' ? 'correct-btn' : 'incorrect-btn'}>AI</button>
                <button className={results.results === 'human' ? 'correct-btn' : 'incorrect-btn'}>Human</button>
              </div>
            )}
            </div>
            :
            <p className="investigator-choice">Investigator choice: {results && results.evaluation}</p>
          }
        </div>
      </div>
      <div className="bottom-btn-box" >
        {submitted &&
        <>
          <button className='clickable-btn' onClick={shareConversation}>Share Conversation</button>
          <button className='clickable-btn' onClick={() => window.location.reload(false)}>New Game</button>
          {/* <Link to="/stats"><button className='clickable-btn' >See your Stats</button></Link> */}
        </>
        }
        <Link to="/"><button className='clickable-btn' >Back to Home</button></Link>
      </div>
    </div>
  );
}

export default Game;

