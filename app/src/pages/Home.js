import { useEffect, useState } from "react";
import {
  Link
} from "react-router-dom";
import Scoreboard from "../components/Scoreboard";
import {getScoreboard, socket} from "../api/api";

function Home() {

  const [ scoreboard, setScoreboard ] = useState({
    ai_right: 0,
    ai_wrong: 0,
    human_right: 0,
    human_wrong: 0
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await getScoreboard("basic");
        setScoreboard(response);
        socket.disconnect();
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
    <div className="App">
      <h1>🦃 Turkey Test</h1>
      <p>
        Hey there! Welcome to Turkey Test!
      </p>
      <p>
        Get matched up randomly with either a human or AI, and ask
        up to 3 questions to decide whether you're talking to an AI or a human.
        Or play the responder on the other side, answering questions
        in order to help or fool your fellow human.
      </p>

      <div className="role-btn-box">
        <Link to="/game/investigator"><button className="start-btn clickable-btn">Play Investigator</button></Link>
        <Link to="/game/responder"><button className="start-btn clickable-btn">Play Responder</button></Link>
      </div>
      <Scoreboard {...scoreboard} />
    </div>
  );
}

export default Home;