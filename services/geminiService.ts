
import { GoogleGenAI } from "@google/genai";
import { AnimationStyle } from "../types";

// Helper to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix e.g. "data:video/mp4;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getPrompt = (style: AnimationStyle): string => {
    return `Analyze this input video. Identify the main person(s), their movements, facial expressions, and actions, as well as the key background elements.

Generate a new video with the same duration, rhythm, and sequence of actions as the original.

Apply the following visual style: ${style}.

Stylization Directives:
- Characters: Transform people into cartoon characters corresponding to the chosen style, simplifying their features but maintaining recognizable characteristics (hair color, clothing, build). Facial expressions should be subtly exaggerated to fit the animation style.
- Backgrounds and Objects: Redraw the environment and objects to match the aesthetics of the selected style.
- Movement: Ensure that the movement is fluid and natural within the conventions of the animation style. Avoid visual artifacts or inconsistencies between frames. Temporal coherence is crucial.
- Color and Light: Apply a color palette and lighting scheme that are characteristic of the chosen animation style.`;
}

export const generateVideo = async (
    videoFile: File,
    style: AnimationStyle,
    onProgress: (message: string) => void
  ): Promise<string> => {
    
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please select an API key.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const videoBase64 = await fileToBase64(videoFile);
    const prompt = getPrompt(style);

    onProgress("Starting video generation...");
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: {
            imageBytes: videoBase64,
            mimeType: videoFile.type,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9' // Assuming standard landscape, Veo can also do 9:16
        }
    });

    onProgress("Video processing has started. This may take a few minutes...");
    
    // Polling logic
    let pollCount = 0;
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between polls
        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
            pollCount++;
            onProgress(`Checking status (attempt ${pollCount})... Still processing.`);
        } catch (error) {
            console.error("Error polling for video status:", error);
            // Re-throw specific errors if needed, e.g. auth errors
            if (error instanceof Error && error.message.includes("Requested entity was not found")) {
              throw new Error("API key may be invalid. Please try selecting it again.");
            }
            throw new Error("Failed to get video generation status.");
        }
    }

    onProgress("Video generation complete! Fetching the result...");

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Generated video URI not found in the response.");
    }

    // The download link needs the API key appended
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download the generated video. Status: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
