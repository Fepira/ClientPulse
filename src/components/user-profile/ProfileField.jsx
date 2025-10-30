import React from 'react';

export default function ProfileField({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {Icon ? <Icon className="w-4 h-4 inline mr-2" /> : null}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field ${disabled ? 'bg-gray-50' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}