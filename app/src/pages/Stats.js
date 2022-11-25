import { useCookies } from 'react-cookie';
import Scoreboard from '../components/Scoreboard';
import { Link } from 'react-router-dom';

function Stats() {

  const [ cookies ] = useCookies(['user']);

  let win_rate = 0;
  let ai_win_rate = 0;
  let human_win_rate = 0;
  if (cookies.stats !== undefined) {
    const stats = cookies.stats;
    const total = stats.investigator.ai_right + stats.investigator.ai_wrong + stats.investigator.human_right + stats.investigator.human_wrong;
    if (total !== 0) {
      win_rate = (stats.investigator.ai_right + stats.investigator.human_right) / total * 100;
    }
    const ai_total = stats.investigator.ai_right + stats.investigator.ai_wrong;
    if (ai_total !== 0) {
      ai_win_rate = stats.investigator.ai_right / ai_total * 100;
    }
    const human_total = stats.investigator.human_right + stats.investigator.human_wrong;
    if (human_total !== 0) {
      human_win_rate = stats.investigator.human_right / human_total * 100;
    }
  }

  return (
    <div className="App">
      {/* button to go back home */}
      <Link to="/">
        <button className="clickable-btn">Back to Home</button>
      </Link>
      <header className="stats-header">
        <h1>Stats</h1>
      </header>
      {cookies.stats ?
        <div className="stats-body">
          <div>
            <div>
              Overall win rate: {Math.round(win_rate)}%<br/>
              AI win rate: {Math.round(ai_win_rate)}%<br/>
              Human win rate: {Math.round(human_win_rate)}%
            </div>
            <Scoreboard {...cookies.stats.investigator} title={'Investigator Stats'}/>
          </div>

          <div>
            <h2>Responder Stats</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Helped Human</td>
                  <td>{cookies.stats.responder.helped}</td>
                </tr>
                <tr>
                  <td>Fooled Human</td>
                  <td>{cookies.stats.responder.fooled}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        :
        <div className="stats-body">
          <p>You have not played any games yet.</p>
        </div>
      }
    </div>
  )
}

export default Stats;