import React from 'react';

export default function PreferencesSection({ preferences = {}, disabled, onChange }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Preferencias</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Notificaciones por email</span>
          <input
            type="checkbox"
            checked={preferences?.notifications || false}
            onChange={(e) => onChange({
              ...preferences,
              notifications: e.target.checked,
            })}
            className="rounded"
            disabled={disabled}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Tema</span>
          <select
            value={preferences?.theme || 'light'}
            onChange={(e) => onChange({
              ...preferences,
              theme: e.target.value,
            })}
            className="text-sm border rounded px-2 py-1"
            disabled={disabled}
          >
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
      </div>
    </div>
  );
}