import {
  Link
} from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <h1>Home</h1>
      <div>
        [Scoreboard goes here]
        {/* Scoreboard */}
      </div>
      <Link to="/game">Start Game</Link>
    </div>
  );
}

export default Home;