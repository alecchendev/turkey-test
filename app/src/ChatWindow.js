import React, { useEffect } from "react";

// we are using class component here bcoz functional components cant use react life cycle hooks such as componentDidUpdate
function ChatWindow({ messagesList }) {
  // if this component received new props, move scroll chat window
  // to view latest message
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
          {/* define ref and call it if component is updated */}
          <div
            id="message-list-end"
            className="reference"
            // ref={node => (messageListEnd = node)}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;