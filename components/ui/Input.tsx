import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 text-lg font-mono bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-white transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
