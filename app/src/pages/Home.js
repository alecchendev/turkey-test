import { useEffect, useState } from "react";
import {
  Link
} from "react-router-dom";
import Scoreboard from "../components/Scoreboard";
import {getScoreboard, socket} from "../api/api";
import { useCookies } from "react-cookie";

function Home() {

  const [ cookies ] = useCookies(['user']);

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
      <p>
        If this app doesn't work properly in any way, please contact me at
        <a href="mailto:alecchendev@gmail.com"> alecchendev@gmail.com</a> or
        open an issue on <a href="https://github.com/alecchendev/turkey-test">GitHub</a>.
      </p>

      <div className="role-btn-box">
        <Link to="/game/investigator"><button className="start-btn clickable-btn">Play Investigator</button></Link>
        <Link to="/game/responder"><button className="start-btn clickable-btn">Play Responder</button></Link>
      </div>
      {cookies.stats && <Link to="/stats"><button className='clickable-btn' >See your Stats</button></Link>}
      <Scoreboard {...scoreboard} title={'Results'}/>
    </div>
  );
}

export default Home;