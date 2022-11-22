
function Scoreboard({ ai_right, ai_wrong, human_right, human_wrong }) {

  return (
    <div className="Scoreboard">
      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th>Responder</th>
            <th>Identified</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan="2">AI</td>
            <td>Correctly</td>
            <td>{ai_right}</td>
          </tr>
          <tr>
            <td>Incorrectly</td>
            <td>{ai_wrong}</td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <td rowSpan="2">Human</td>
            <td>Correctly</td>
            <td>{human_right}</td>
          </tr>
          <tr>
            <td>Incorrectly</td>
            <td>{human_wrong}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Scoreboard;