import React from 'react';

export default function ProfileAvatar({ initial }) {
  const letter = (initial || 'U').toUpperCase();
  return (
    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
      {letter}
    </div>
  );
}