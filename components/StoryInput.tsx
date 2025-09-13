
import React from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface StoryInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const StoryInput: React.FC<StoryInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !isLoading) {
            onSubmit();
        }
    };

  return (
    <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm py-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          placeholder="e.g., 'A lone cartographer in a city of secrets...'"
          className="w-full px-5 py-3 text-lg bg-slate-800 border-2 border-slate-700 rounded-full focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-colors duration-300 text-gray-200 placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 font-bold rounded-full text-lg shadow-lg hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-t-transparent border-slate-900 rounded-full animate-spin"></div>
              <span>Weaving...</span>
            </>
          ) : (
            <>
              <SparkleIcon className="w-6 h-6" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StoryInput;
