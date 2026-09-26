import React from 'react';

export function Message({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        <div className="message-sender">{isUser ? 'You' : 'Assistant'}</div>
        <div className="message-content">{content}</div>
      </div>
    </div>
  );
}