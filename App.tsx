
import React, { useState, useCallback } from 'react';
import { generateStoryStream } from './services/geminiService';
import Header from './components/Header';
import StoryInput from './components/StoryInput';
import StoryDisplay from './components/StoryDisplay';
import GenreSelector from './components/GenreSelector';
import SavedStoriesModal from './components/SavedStoriesModal';
import { SavedStory } from './types';

const App: React.FC = () => {
  const [idea, setIdea] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [genre, setGenre] = useState<string>('General');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleGenerateStory = useCallback(async () => {
    if (!idea.trim() || isLoading) return;

    setIsLoading(true);
    setStory('');
    setError(null);

    try {
      const stream = await generateStoryStream(idea, genre);
      for await (const chunk of stream) {
        setStory((prevStory) => prevStory + chunk);
      }
    // FIX: Added curly braces to the catch block to fix syntax error.
    } catch (err) {
      console.error('Failed to generate story:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [idea, isLoading, genre]);

  const handleLoadStory = (savedStory: SavedStory) => {
    setIdea(savedStory.idea);
    setGenre(savedStory.genre);
    setStory(savedStory.story);
    setError(null);
  };


  return (
    <div className="min-h-screen bg-slate-900 text-gray-300 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
        <Header onOpenSavedStories={() => setIsModalOpen(true)} />
        <main className="flex-grow flex flex-col">
          <StoryInput
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onSubmit={handleGenerateStory}
            isLoading={isLoading}
          />
          <GenreSelector
            selectedGenre={genre}
            onGenreChange={setGenre}
            isLoading={isLoading}
          />
          <StoryDisplay
            story={story}
            isLoading={isLoading}
            error={error}
            idea={idea}
            genre={genre}
          />
        </main>
      </div>
       <SavedStoriesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoadStory={handleLoadStory}
      />
    </div>
  );
};

export default App;