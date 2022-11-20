import { useEffect } from "react";

function ChatWindow({ messagesList }) {

  useEffect(() => {
    const messageListEnd = document.getElementById("message-list-end");
    messageListEnd.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  return (
    <div className="chat-window">
      <div className="box">
        <div className="inner">
          {Array.isArray(messagesList) &&
            messagesList.map((oneMessage, index) => (
              <p key={index} className="message">
                {oneMessage.text}
              </p>
            ))}
          <div
            id="message-list-end"
            className="reference"
          />
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;