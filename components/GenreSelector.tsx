import React from 'react';

const genres = ['General', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romantic', 'Gothic'];

interface GenreSelectorProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  isLoading: boolean;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ selectedGenre, onGenreChange, isLoading }) => {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-lg font-semibold text-gray-400 mb-3 font-serif">Choose a Writing Style</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 border-2
              ${selectedGenre === genre
                ? 'bg-amber-500 border-amber-500 text-slate-900'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-gray-300'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreSelector;