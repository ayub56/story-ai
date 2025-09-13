import React, { useState, useEffect } from 'react';
import { SavedStory } from '../types';
import TrashIcon from './icons/TrashIcon';
import BookOpenIcon from './icons/BookOpenIcon';

const STORAGE_KEY = 'storyWeaver-savedStories';

interface SavedStoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadStory: (story: SavedStory) => void;
}

const SavedStoriesModal: React.FC<SavedStoriesModalProps> = ({ isOpen, onClose, onLoadStory }) => {
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const storiesJson = localStorage.getItem(STORAGE_KEY);
        if (storiesJson) {
          setSavedStories(JSON.parse(storiesJson));
        } else {
          setSavedStories([]);
        }
      } catch (error) {
        console.error("Failed to load stories from local storage:", error);
        setSavedStories([]);
      }
    }
  }, [isOpen]);

  const handleDeleteStory = (storyId: number) => {
    const updatedStories = savedStories.filter(story => story.id !== storyId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStories));
      setSavedStories(updatedStories);
    } catch (error) {
        console.error("Failed to delete story from local storage:", error);
    }
  };

  const handleLoad = (story: SavedStory) => {
    onLoadStory(story);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-slate-800 w-full max-w-2xl rounded-lg shadow-2xl p-6 border border-slate-700 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
          <h2 id="modal-title" className="text-2xl font-bold font-serif text-amber-400">My Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-3xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto pr-2 -mr-2">
          {savedStories.length === 0 ? (
            <p className="text-center text-gray-500 py-10">You have no saved stories yet.</p>
          ) : (
            <ul className="space-y-3">
              {savedStories.map((story) => (
                <li key={story.id} className="bg-slate-900/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-lg text-gray-200 truncate" title={story.idea}>{story.idea}</h3>
                    <p className="text-sm text-gray-400">Genre: {story.genre}</p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      onClick={() => handleLoad(story)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-md transition-colors"
                      aria-label={`Load story: ${story.idea}`}
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      <span>Load</span>
                    </button>
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="p-2 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded-md transition-colors"
                      aria-label={`Delete story: ${story.idea}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedStoriesModal;
