import React, { useState, useEffect, useRef } from 'react';
import { createSession, getSession, sendMessage, updateStateDirect } from './services/api.js';
import { Chat } from './components/Chat.jsx';
import { StructuredState } from './components/StructuredState.jsx';
import { DocumentPreview } from './components/DocumentPreview.jsx';

const SESSION_STORAGE_KEY = 'document_intake_session_id';

function getDiffKeys(oldState, newState) {
  if (!oldState || !newState) return [];
  const changed = [];
  const keys = ['full_name', 'home_address', 'covers_worldwide_assets', 'has_children', 'children', 'additional_wishes'];

  for (const k of keys) {
    if (JSON.stringify(oldState[k]) !== JSON.stringify(newState[k])) {
      changed.push(k);
    }
  }

  if (oldState.executor?.name !== newState.executor?.name) {
    changed.push('executor.name');
  }
  if (oldState.executor?.relationship !== newState.executor?.relationship) {
    changed.push('executor.relationship');
  }

  return changed;
}

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState(null);
  const [updatedKeys, setUpdatedKeys] = useState([]);
  const [documentText, setDocumentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const prevStateRef = useRef(null);

  const loadOrInitSession = async (forceNew = false) => {
    try {
      setLoading(true);
      setError(null);

      const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);

      if (!forceNew && savedSessionId) {
        try {
          const existingData = await getSession(savedSessionId);
          setSessionId(existingData.session._id);
          setState(existingData.state);
          prevStateRef.current = existingData.state;
          setDocumentText(existingData.document);
          setMessages(existingData.messages || []);
          return;
        } catch (fetchErr) {
          console.warn('[Session] Previous session could not be resumed. Creating a new one...', fetchErr);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      const newData = await createSession();
      setSessionId(newData.sessionId);
      localStorage.setItem(SESSION_STORAGE_KEY, newData.sessionId);
      setState(newData.state);
      prevStateRef.current = newData.state;
      setDocumentText(newData.document);
      setMessages(newData.messages || [{ role: 'assistant', content: newData.assistantMessage }]);
    } catch (err) {
      setError(`Cannot initialize session. Is the backend running? Details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrInitSession();
  }, []);

  const handleNewSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUpdatedKeys([]);
    loadOrInitSession(true);
  };

  const handleSendMessage = async (userText) => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);

      setMessages((prev) => [...prev, { role: 'user', content: userText }]);

      const data = await sendMessage(sessionId, userText);

      const diffs = getDiffKeys(prevStateRef.current, data.state);
      setUpdatedKeys(diffs);
      prevStateRef.current = data.state;

      setState(data.state);
      setDocumentText(data.document);
      setMessages(data.messages);
    } catch (err) {
      setError(`Failed to send message: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSave = async (patch) => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const data = await updateStateDirect(sessionId, patch);
      const diffs = getDiffKeys(prevStateRef.current, data.state);
      setUpdatedKeys(diffs);
      prevStateRef.current = data.state;
      setState(data.state);
      setDocumentText(data.document);
    } catch (err) {
      setError(`Direct update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="top-navbar">
        <div>
          <h1>Personal Wishes Document Intake Assistant</h1>
          <span className="subhead">Engineered LLM State Separation Demo</span>
        </div>
        <div className="session-info">
          <span className="session-pill">Session: {sessionId ? sessionId.slice(-6) : 'Connecting...'}</span>
          <button className="btn-secondary" onClick={handleNewSession}>New Session</button>
        </div>
      </header>

      <div className="workspace-grid">
        <Chat
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
          error={error}
        />
        <StructuredState
          state={state}
          updatedKeys={updatedKeys}
          onDirectSave={handleDirectSave}
        />
        <DocumentPreview documentText={documentText} />
      </div>
    </div>
  );
}