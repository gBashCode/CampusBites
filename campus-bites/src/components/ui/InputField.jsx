import React from 'react';

export default function InputField({ icon: Icon, label, error, toggleIcon: ToggleIcon, onToggle, ...props }) {
  return (
    <div className="input-wrapper">
      {label && <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#8B949E', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>}
      <input className={`input-field ${error ? 'input-error' : ''}`} {...props} />
      {Icon && <span className="input-icon"><Icon size={18} /></span>}
      {ToggleIcon && (
        <button type="button" className="input-toggle" onClick={onToggle} tabIndex={-1}>
          <ToggleIcon size={18} />
        </button>
      )}
      {error && <p className="error-display" style={{ marginTop: '6px', marginBottom: 0, fontSize: '0.8rem', padding: '6px 10px' }}>{error}</p>}
    </div>
  );
}