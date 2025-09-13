import React from 'react';
import BookIcon from './icons/BookIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface HeaderProps {
    onOpenSavedStories: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSavedStories }) => {
  return (
    <header className="text-center mb-8 md:mb-12 relative">
        <div className="flex items-center justify-center gap-4 mb-2">
            <BookIcon className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 font-serif">
                Story Weaver AI
            </h1>
        </div>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">
        Provide a title or an idea, and let the AI craft a rich story for you.
      </p>
      <div className="absolute top-0 right-0">
          <button
            onClick={onOpenSavedStories}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors backdrop-blur-sm"
            aria-label="Open saved stories"
          >
            <BookOpenIcon className="w-5 h-5" />
            <span>My Library</span>
          </button>
      </div>
    </header>
  );
};

export default Header;
