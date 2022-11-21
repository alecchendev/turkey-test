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
            messagesList.map((oneMessage, index) => { 
              if (oneMessage.type === "query") {
                return (
                  <div className="message q" key={index}>
                    <div className="message-text query">{oneMessage.text}</div>
                  </div>
                );
              } else if (oneMessage.type === "response") {
                return (
                  <div className="message" key={index}>
                    <div className="message-text response">{oneMessage.text}</div>
                  </div>
                );
              }
              return null;
            })}
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