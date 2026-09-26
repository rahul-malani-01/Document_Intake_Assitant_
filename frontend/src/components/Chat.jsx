import React, { useState, useEffect, useRef } from 'react';

export function Chat({ messages, onSendMessage, loading, error }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h2>Conversational Interview</h2>
        <span className="session-pill">{messages.length} Turns</span>
      </div>

      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`message-bubble ${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="message-bubble assistant">
            <div className="typing-dots">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div style={{ padding: '8px 16px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.8rem' }}>
          {error}
        </div>
      )}

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Answer assistant or update wishes..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
        />
        <button className="btn-primary" type="submit" disabled={loading || !inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}