
function Scoreboard({ ai_right, ai_wrong, human_right, human_wrong }) {

  return (
    <div className="Scoreboard">
      <h2>Scoreboard</h2>
      <table>
        <tr>
          <th>AI Classified Correctly</th>
          <th>AI Classified Incorrectly</th>
          <th>Human Classified Correctly</th>
          <th>Human Classified Incorrectly</th>
        </tr>
        <tr>
          <td>{ai_right}</td>
          <td>{ai_wrong}</td>
          <td>{human_right}</td>
          <td>{human_wrong}</td>
        </tr>
      </table>
    </div>
  )
}

export default Scoreboard;