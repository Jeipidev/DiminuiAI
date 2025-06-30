import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Selecione uma opção",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative isolate ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className=" z-50 w-full p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-300 hover:bg-white/15 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon && (
            <span className={selectedOption.color || "text-white"}>
              {selectedOption.icon}
            </span>
          )}
          <div className="text-left">
            <div className="font-medium">
              {selectedOption ? selectedOption.label : placeholder}
            </div>
            {selectedOption?.description && (
              <div className="text-sm text-slate-400">
                {selectedOption.description}
              </div>
            )}
          </div>
        </div>
        <FiChevronDown 
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl ">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full p-4 text-left hover:bg-white/10 transition-all duration-200 flex items-center gap-3 border-b border-white/5 last:border-b-0 ${
                  value === option.value ? 'bg-blue-500/20 border-blue-500/30' : ''
                }`}
              >
                {option.icon && (
                  <span className={option.color || "text-white"}>
                    {option.icon}
                  </span>
                )}
                <div className="flex-1">
                  <div className={`font-medium ${option.color || "text-white"}`}>
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-slate-400 mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
                {value === option.value && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;