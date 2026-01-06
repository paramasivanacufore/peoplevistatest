import React from "react";

export const Input = ({ label, name, fieldErrors = {}, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      name={name}
      {...props}
      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500
        ${fieldErrors[name] ? "border-red-500" : ""}`}
    />
    {fieldErrors[name] && <p className="text-red-500 text-sm mt-1">{fieldErrors[name]}</p>}
  </div>
);

export const Textarea = ({ label, name, fieldErrors = {}, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor={name}>
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      rows={3}
      {...props}
      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500
        ${fieldErrors[name] ? "border-red-500" : ""}`}
    />
    {fieldErrors[name] && <p className="text-red-500 text-sm mt-1">{fieldErrors[name]}</p>}
  </div>
);

export const Select = ({ label, name, options = [], fieldErrors = {}, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor={name}>
      {label}
    </label>
    <select
      id={name}
      name={name}
      {...props}
      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500
        ${fieldErrors[name] ? "border-red-500" : ""}`}
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.v} value={opt.v}>
          {opt.label || opt.v}
        </option>
      ))}
    </select>
    {fieldErrors[name] && <p className="text-red-500 text-sm mt-1">{fieldErrors[name]}</p>}
  </div>
);
