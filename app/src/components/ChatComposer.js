import { useState } from "react";
import Button from "./Button";

function ChatComposer({ submitted, canQuery, gameCreated, maxLength }) {
  const [ newMessage, setNewMessage ] = useState("");

  const handleChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitted(newMessage);
    setNewMessage("");
  };

  return (
    <div className="chat-composer">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={gameCreated ? "Type your message here" : "Creating new game..."}
          onChange={handleChange}
          value={newMessage}
          disabled={!canQuery}
          className={canQuery ? "" : "disabled-input"}
          maxLength={maxLength}
        />
        <Button type="submit" disabled={!canQuery}>Send</Button>
      </form>
    </div>
  );
}

export default ChatComposer;
