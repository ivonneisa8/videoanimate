import React from 'react';

interface ApiKeySelectorProps {
  onApiKeySelected: () => void;
}

// NOTE: This component assumes `window.aistudio` is available in the execution environment.
// Fix: Define the AIStudio interface to resolve a global type conflict.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onApiKeySelected }) => {
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          onApiKeySelected();
        }
      }
      setIsChecking(false);
    };
    checkApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume selection was successful and proceed.
        // This mitigates a potential race condition where hasSelectedApiKey might not be immediately true.
        onApiKeySelected();
      } catch (error) {
        console.error("Error opening API key selection dialog:", error);
      }
    } else {
      alert("AI Studio SDK not found. This application requires a specific environment to run.");
    }
  };

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Checking API Key status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 p-8 rounded-lg shadow-2xl text-center">
      <h2 className="text-3xl font-bold mb-4 text-cyan-400">Welcome to Video Animator AI</h2>
      <p className="text-lg mb-6 text-gray-300">
        This application uses Google's Veo model for video generation, which requires you to select an API key.
      </p>
      <p className="text-sm mb-2 text-gray-400">
        Your API key is securely managed and used only for processing your requests.
      </p>
      <p className="text-sm mb-8 text-gray-400">
        For more information on billing, please visit{' '}
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          Google AI Billing Documentation
        </a>.
      </p>
      <button
        onClick={handleSelectKey}
        className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
      >
        Select Your API Key to Begin
      </button>
    </div>
  );
};

export default ApiKeySelector;