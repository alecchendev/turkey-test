
function Scoreboard({ ai_right, ai_wrong, human_right, human_wrong }) {

  return (
    <div className="Scoreboard">
      <h2>Results</h2>
      <table>
        <tr>
          <th>Responder</th>
          <th>Identified</th>
          <th>Score</th>
        </tr>
        <tr>
          <td rowspan="2">AI</td>
          <td>Correctly</td>
          <td>{ai_right}</td>
        </tr>
        <tr>
          <td>Incorrectly</td>
          <td>{ai_wrong}</td>
        </tr>
        <tr>
          <td rowspan="2">Human</td>
          <td>Correctly</td>
          <td>{human_right}</td>
        </tr>
        <tr>
          <td>Incorrectly</td>
          <td>{human_wrong}</td>
        </tr>
      </table>
    </div>
  )
}

export default Scoreboard;