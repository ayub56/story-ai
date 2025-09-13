import React, { useState } from 'react';
import QuillIcon from './icons/QuillIcon';
import CopyIcon from './icons/CopyIcon';
import ImageIcon from './icons/ImageIcon';
import VideoIcon from './icons/VideoIcon';
import SaveIcon from './icons/SaveIcon';
import { translateText, generateImagesFromStory, generateVideoFromStory } from '../services/geminiService';
import { SavedStory } from '../types';

const STORAGE_KEY = 'storyWeaver-savedStories';

interface StoryDisplayProps {
  story: string;
  isLoading: boolean;
  error: string | null;
  idea: string;
  genre: string;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading, error, idea, genre }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<'Urdu' | 'Arabic' | null>(null);

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoStatusMessage, setVideoStatusMessage] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);

  const handleCopy = () => {
    if (!story) return;
    navigator.clipboard.writeText(story.replace(/\u00A0/g, ' '));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTranslate = async (language: 'Urdu' | 'Arabic') => {
    if (!story || isTranslating) return;

    setIsTranslating(true);
    setTranslationError(null);
    setTargetLanguage(language);
    setTranslatedText('');

    try {
      const translation = await translateText(story, language);
      setTranslatedText(translation);
    } catch (err) {
      setTranslationError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!story || isGeneratingImages) return;
    setIsGeneratingImages(true);
    setImageError(null);
    setGeneratedImages([]);

    try {
        const images = await generateImagesFromStory(story);
        setGeneratedImages(images);
    } catch (err) {
        setImageError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsGeneratingImages(false);
    }
  };

  const handleGenerateVideo = async () => {
      if (!story || isGeneratingVideo) return;
      setIsGeneratingVideo(true);
      setVideoError(null);
      setGeneratedVideoUrl(null);
      setVideoStatusMessage('');

      try {
          const videoUrl = await generateVideoFromStory(story, setVideoStatusMessage);
          setGeneratedVideoUrl(videoUrl);
      } catch (err) {
          setVideoError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
          setIsGeneratingVideo(false);
          setVideoStatusMessage('');
      }
  };

  const handleSaveStory = () => {
    if (!story.trim() || !idea.trim()) return;

    try {
      const storiesJson = localStorage.getItem(STORAGE_KEY);
      const savedStories: SavedStory[] = storiesJson ? JSON.parse(storiesJson) : [];

      const newStory: SavedStory = {
        id: Date.now(),
        idea,
        genre,
        story
      };
      
      const isDuplicate = savedStories.some(s => s.story === newStory.story && s.idea === newStory.idea);
      if (isDuplicate) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
          return;
      }

      const updatedStories = [newStory, ...savedStories];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStories));

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save story:", err);
    }
  };

  const isAnyActionLoading = isLoading || isTranslating || isGeneratingImages || isGeneratingVideo;

  return (
    <div className="flex-grow bg-slate-800/50 rounded-lg p-6 md:p-8 border border-slate-700 shadow-2xl min-h-[400px] flex flex-col">
      {error && (
        <div className="m-auto text-center text-red-400">
          <h3 className="text-xl font-bold mb-2">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      )}

      {!error && isLoading && !story && (
        <div className="m-auto text-center text-gray-400 animate-pulse">
            <QuillIcon className="w-12 h-12 mx-auto mb-4 text-amber-400" />
          <h3 className="text-xl font-serif">The author is preparing the ink...</h3>
          <p className="mt-2">Your story will begin to unfold shortly.</p>
        </div>
      )}

      {!error && !isLoading && !story && (
        <div className="m-auto text-center text-gray-500">
          <QuillIcon className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-serif">Your story awaits</h3>
          <p className="mt-2">Enter a title or idea above to begin your adventure.</p>
        </div>
      )}

      {(story || (isLoading && story)) && (
        <>
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4 border-b border-slate-700 pb-4">
            <button onClick={handleGenerateImages} disabled={isAnyActionLoading} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isGeneratingImages ? (<><div className="w-4 h-4 border-2 border-t-transparent border-slate-300 rounded-full animate-spin"></div><span>Creating...</span></>) : (<><ImageIcon className="w-4 h-4" /><span>Generate Images</span></>)}
            </button>
            <button onClick={handleGenerateVideo} disabled={isAnyActionLoading} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isGeneratingVideo ? (<><div className="w-4 h-4 border-2 border-t-transparent border-slate-300 rounded-full animate-spin"></div><span>Filming...</span></>) : (<><VideoIcon className="w-4 h-4" /><span>Generate Video</span></>)}
            </button>
            <button onClick={() => handleTranslate('Urdu')} disabled={isAnyActionLoading} className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Translate to Urdu</button>
            <button onClick={() => handleTranslate('Arabic')} disabled={isAnyActionLoading} className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Translate to Arabic</button>
             <button onClick={handleSaveStory} disabled={isAnyActionLoading || !story.trim()} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SaveIcon className="w-4 h-4" />
                <span>{isSaved ? 'Saved!' : 'Save Story'}</span>
            </button>
            <button onClick={handleCopy} disabled={isLoading || !story.trim()} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"><CopyIcon className="w-4 h-4" /><span>{isCopied ? 'Copied!' : 'Copy Story'}</span></button>
          </div>
          <div className="prose prose-lg prose-invert max-w-none font-serif text-gray-300">
            {story.split('\n').map((paragraph, index) => (<p key={index} className="mb-4 leading-relaxed">{paragraph || '\u00A0'}</p>))}
            {isLoading && <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-1" aria-hidden="true"></span>}
          </div>

          {(isGeneratingImages || generatedImages.length > 0 || imageError) && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-xl font-bold font-serif mb-4 text-amber-400">Visual Interpretation</h3>
              {isGeneratingImages && (
                <div className="text-center py-8"><div className="w-8 h-8 border-4 border-t-transparent border-slate-500 rounded-full animate-spin mx-auto mb-4"></div><p className="font-serif text-lg text-gray-400">The artist is sketching the scenes...</p></div>
              )}
              {imageError && (<div className="text-red-400"><p>{imageError}</p></div>)}
              {generatedImages.length > 0 && !isGeneratingImages && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedImages.map((img, index) => (<a href={`data:image/jpeg;base64,${img}`} download={`story_image_${index + 1}.jpg`}><img key={index} src={`data:image/jpeg;base64,${img}`} alt={`Generated image ${index + 1} from story`} className="rounded-lg shadow-lg w-full h-full object-cover aspect-video hover:opacity-80 transition-opacity" /></a>))}
                </div>
              )}
            </div>
          )}

          {(isGeneratingVideo || generatedVideoUrl || videoError) && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-xl font-bold font-serif mb-4 text-amber-400">Cinematic Trailer</h3>
              {isGeneratingVideo && (
                <div className="text-center py-8"><div className="w-8 h-8 border-4 border-t-transparent border-slate-500 rounded-full animate-spin mx-auto mb-4"></div><p className="font-serif text-lg text-gray-400">{videoStatusMessage || "Starting the production..."}</p></div>
              )}
              {videoError && (<div className="text-red-400"><p>{videoError}</p></div>)}
              {generatedVideoUrl && !isGeneratingVideo && (<video controls src={generatedVideoUrl} className="w-full rounded-lg shadow-lg aspect-video bg-black"></video>)}
            </div>
          )}

          {(isTranslating || translatedText || translationError) && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-xl font-bold font-serif mb-4 text-amber-400">{isTranslating ? `Translating to ${targetLanguage}...` : `${targetLanguage} Translation`}</h3>
              {isTranslating && (<div className="text-center py-8"><div className="w-8 h-8 border-4 border-t-transparent border-slate-500 rounded-full animate-spin mx-auto"></div></div>)}
              {translationError && (<div className="text-red-400"><p>{translationError}</p></div>)}
              {translatedText && !isTranslating && (<div dir="rtl" className="prose prose-lg max-w-none font-arabic text-gray-200 text-right">{translatedText.split('\n').map((paragraph, index) => (<p key={index} className="mb-4 leading-loose">{paragraph || '\u00A0'}</p>))}</div>)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoryDisplay;
