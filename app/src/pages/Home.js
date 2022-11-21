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
      const scoreboardRes = await getScoreboard("basic");
      if (scoreboardRes) {
        setScoreboard(scoreboardRes);
      }
    })();
  }, []);

  return (
    <div className="App">
      <Scoreboard {...scoreboard} />
      <Link to="/game"><button>Start Game</button></Link>
    </div>
  );
}

export default Home;