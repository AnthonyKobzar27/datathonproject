'use client';

import type { InputFieldProps } from '@/types/patient';

export default function InputField({
  label,
  name,
  type,
  value,
  onChange,
  min,
  max,
  step,
  options,
  placeholder,
  required = false,
}: InputFieldProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newValue =
      type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(name, newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'select' && options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          className="px-4 py-2.5 border border-gray-300 rounded-lg 
                     bg-white text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                     transition-all text-sm"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          required={required}
          className="px-4 py-2.5 border border-gray-300 rounded-lg 
                     bg-white text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                     transition-all text-sm"
        />
      )}
    </div>
  );
}

