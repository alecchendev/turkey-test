import { useEffect, useState } from "react";
import {
  Link
} from "react-router-dom";
import Scoreboard from "../components/Scoreboard";
import {getScoreboard} from "../api/api";

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
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  return (
    <div className="App">
      <h1>🦃 Turkey Test</h1>
      <p>
        Hey there! Welcome to Turkey Test, a game where you can play as an
        investigator or a responder.
      </p>
      <p> 
        As an investigator, you're matched up randomly with either an AI or a
        human responder, and you're allowed to ask 3 questions before guessing
        which one you're talking to. As a responder you answer the
        investigator's questions however you would like.
      </p>
      <p>
        In theory, this website is meant to crowdsource turing tests for language models.
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