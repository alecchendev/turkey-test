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
      <h1>Laughing Hand</h1>
      <p>
        Hey there! Welcome to Laughing Hand (WIP), a game where you
        get to ask 3 questions to see if you can guess whether you're talking to
        an AI or a human! In theory, this website is meant to crowdsource turing
        tests for open source ML models.
      </p>
      <Link to="/game"><button className="start-btn clickable-btn">Start Game</button></Link>
      <Scoreboard {...scoreboard} />
    </div>
  );
}

export default Home;