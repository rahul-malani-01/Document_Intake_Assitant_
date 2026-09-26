import React, { useState } from 'react';

export function StructuredState({ state, updatedKeys = [], onDirectSave }) {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  if (!state) {
    return (
      <div className="card-panel">
        <div className="panel-header">
          <h2>Structured Canonical State</h2>
        </div>
        <div className="state-content">
          <p className="field-value null-val">No canonical state recorded yet.</p>
        </div>
      </div>
    );
  }

  const milestones = [
    { label: 'Name', done: Boolean(state.full_name) },
    { label: 'Address', done: Boolean(state.home_address) },
    { label: 'Assets', done: state.covers_worldwide_assets !== null },
    { label: 'Children', done: state.has_children !== null },
    { label: 'Executor', done: Boolean(state.executor?.name) }
  ];

  const completedCount = milestones.filter((m) => m.done).length;
  const readinessPercentage = Math.round((completedCount / milestones.length) * 100);

  const startEdit = (fieldKey, currentValue) => {
    setEditingField(fieldKey);
    setEditValue(currentValue || '');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = (fieldKey) => {
    if (!onDirectSave) return;

    if (fieldKey === 'executor.name') {
      onDirectSave({ executor: { name: editValue, relationship: state.executor?.relationship || null } });
    } else if (fieldKey === 'executor.relationship') {
      onDirectSave({ executor: { name: state.executor?.name || null, relationship: editValue } });
    } else {
      onDirectSave({ [fieldKey]: editValue });
    }
    setEditingField(null);
  };

  const isHighlighted = (key) => updatedKeys.includes(key);

  const renderField = (fieldKey, label, value, displayValue) => {
    const isEditing = editingField === fieldKey;

    if (isEditing) {
      return (
        <div className="state-field-row">
          <div className="inline-edit-form">
            <input
              type="text"
              className="inline-edit-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
            />
            <button className="btn-success" onClick={() => handleSave(fieldKey)}>Save</button>
            <button className="btn-cancel" onClick={cancelEdit}>✕</button>
          </div>
        </div>
      );
    }

    return (
      <div className={`state-field-row ${isHighlighted(fieldKey) ? 'diff-highlight' : ''}`}>
        <span className="field-label">
          {label}
          <button
            className="edit-trigger"
            title={`Edit ${label}`}
            onClick={() => startEdit(fieldKey, value)}
          >
            ✎
          </button>
        </span>
        <span className={`field-value ${!value && value !== false ? 'null-val' : ''}`}>
          {displayValue || (value ? String(value) : 'Not provided')}
        </span>
      </div>
    );
  };

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h2>Structured Canonical State</h2>
        <span className="session-pill">Source of Truth</span>
      </div>

      <div className="progress-container">
        <div className="progress-meta">
          <span>Intake Progress</span>
          <span>{readinessPercentage}% Complete</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${readinessPercentage}%` }}></div>
        </div>

        <div className="checklist-tags">
          {milestones.map((m, idx) => (
            <span key={idx} className={`check-pill ${m.done ? 'completed' : ''}`}>
              {m.done ? '✓ ' : '○ '}{m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="state-content">
        {renderField('full_name', 'Full Name', state.full_name, state.full_name)}
        {renderField('home_address', 'Address', state.home_address, state.home_address)}

        <div className={`state-field-row ${isHighlighted('covers_worldwide_assets') ? 'diff-highlight' : ''}`}>
          <span className="field-label">Worldwide Assets</span>
          <span className={`field-value ${state.covers_worldwide_assets === null ? 'null-val' : ''}`}>
            {state.covers_worldwide_assets === null ? 'Not specified' : state.covers_worldwide_assets ? 'Yes' : 'No'}
          </span>
        </div>

        <div className={`state-field-row ${isHighlighted('has_children') ? 'diff-highlight' : ''}`}>
          <span className="field-label">Has Children</span>
          <span className={`field-value ${state.has_children === null ? 'null-val' : ''}`}>
            {state.has_children === null ? 'Not specified' : state.has_children ? 'Yes' : 'No'}
          </span>
        </div>

        {state.children?.length > 0 && (
          <div className={`state-field-row ${isHighlighted('children') ? 'diff-highlight' : ''}`}>
            <span className="field-label">Children</span>
            <div className="field-value">
              {state.children.map((child, idx) => (
                <span key={idx} className="badge-tag">{child}</span>
              ))}
            </div>
          </div>
        )}

        {renderField('executor.name', 'Executor Name', state.executor?.name, state.executor?.name || 'Not appointed')}
        {renderField('executor.relationship', 'Executor Relationship', state.executor?.relationship, state.executor?.relationship || 'Not specified')}

        {state.specific_gifts?.length > 0 && (
          <div className="state-field-row">
            <span className="field-label">Specific Gifts</span>
            <div className="field-value">
              {state.specific_gifts.map((g, idx) => (
                <span key={idx} className="badge-tag">{g}</span>
              ))}
            </div>
          </div>
        )}

        {renderField('additional_wishes', 'Additional Wishes', state.additional_wishes, state.additional_wishes || 'None')}
      </div>
    </div>
  );
}