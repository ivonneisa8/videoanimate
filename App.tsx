import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo } from './services/geminiService';
import { AnimationStyle } from './types';
import { ANIMATION_STYLES, LOADING_MESSAGES } from './constants';
import type { StyleOption } from './types';
import ApiKeySelector from './components/ApiKeySelector';

const App: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<AnimationStyle>(AnimationStyle.CLASSIC_ANIME);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fix: Use ReturnType<typeof setTimeout> for interval ID type to ensure browser compatibility.
    let interval: ReturnType<typeof setTimeout>;
    if (isLoading) {
      let messageIndex = 0;
      setLoadingMessage(LOADING_MESSAGES[0]);
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100 MB limit
        setError("File is too large. Please upload a video under 100MB.");
        return;
      }
      // Simple duration check, not foolproof
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > 16) { // allow a little buffer
          setError("Video is longer than 15 seconds. Please upload a shorter video.");
          setVideoFile(null);
          setVideoPreviewUrl(null);
        } else {
          setVideoFile(file);
          setVideoPreviewUrl(URL.createObjectURL(file));
          setError(null);
        }
      };
      videoElement.src = URL.createObjectURL(file);
    }
  };

  const onProgress = useCallback((message: string) => {
    console.log("Progress:", message);
    setLoadingMessage(message);
  }, []);

  const handleSubmit = async () => {
    if (!videoFile || !selectedStyle) {
      setError("Please upload a video and select a style.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedVideoUrl(null);
    try {
      const resultUrl = await generateVideo(videoFile, selectedStyle, onProgress);
      setGeneratedVideoUrl(resultUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      if (errorMessage.includes("API key may be invalid")) {
        // Reset the API key selection state to re-trigger the selector
        setApiKeySelected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setGeneratedVideoUrl(null);
    setError(null);
    setIsLoading(false);
  };
  
  if (!apiKeySelected) {
    return <ApiKeySelector onApiKeySelected={() => setApiKeySelected(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Video Animator AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Transform your real-world videos into stunning animations with AI.
          </p>
        </header>

        {error && (
          <div className="bg-red-800/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mx-auto"></div>
            <p className="mt-6 text-xl font-semibold text-gray-300">{loadingMessage}</p>
          </div>
        ) : generatedVideoUrl ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 text-cyan-300">Animation Complete!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Original Video</h3>
                {videoPreviewUrl && <video src={videoPreviewUrl} controls className="w-full rounded-md" />}
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Generated Animation</h3>
                <video src={generatedVideoUrl} controls className="w-full rounded-md" />
              </div>
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <a href={generatedVideoUrl} download="animated_video.mp4" className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                Download MP4
              </a>
              <button onClick={handleReset} className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-colors">
                Animate Another Video
              </button>
            </div>
          </div>
        ) : (
          <main className="space-y-8">
            <section id="upload" className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">1. Upload Your Video</h2>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <input type="file" id="video-upload" accept="video/mp4,video/mov" onChange={handleFileChange} className="hidden" />
                <label htmlFor="video-upload" className="cursor-pointer bg-cyan-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-cyan-700 transition-colors">
                  Choose File
                </label>
                <p className="mt-3 text-sm text-gray-400">MP4 or MOV, up to 15 seconds & 100MB.</p>
              </div>
              {videoPreviewUrl && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Preview:</h3>
                  <video src={videoPreviewUrl} controls className="w-full max-w-md mx-auto rounded-md" />
                </div>
              )}
            </section>

            {videoFile && (
              <>
                <section id="style" className="bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-cyan-300">2. Select Animation Style</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {ANIMATION_STYLES.map((style: StyleOption) => (
                      <div
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border-4 ${selectedStyle === style.id ? 'border-cyan-500 scale-105' : 'border-transparent hover:border-gray-600'}`}
                      >
                        <img src={style.thumbnail} alt={style.name} className="w-full h-auto rounded-md aspect-square object-cover" />
                        <p className="text-center mt-2 font-medium">{style.name}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={!videoFile || isLoading}
                    className="w-full max-w-xs px-8 py-4 bg-purple-600 text-white font-bold text-lg rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    Generate Animation
                  </button>
                </section>
              </>
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default App;