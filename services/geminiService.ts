import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getStoryPrompt = (titleOrIdea: string, genre: string): string => {
  const genreInstruction = genre !== 'General'
    ? `The story must be written in the **${genre}** genre.`
    : 'The story should be a general fiction piece.';

  return `
You are a master storyteller. Your task is to write a detailed and engaging story based on the following title/idea: "${titleOrIdea}".

**Instructions:**
- **Genre and Style:** ${genreInstruction}
- **Readability:** Use simple, clear, and accessible English. The language should be very easy for a non-native English speaker to understand. Use common words and straightforward sentence structures, but still create a rich, descriptive story.

Follow these rules meticulously:
1.  **Atmospheric Opening:** Begin with a strong introduction that immerses the reader in the story's world.
2.  **Engaging Narrative:** The story must read like a well-crafted short story, not a summary. It should have a natural, continuous flow.
3.  **Rich Detail:** Weave in vivid descriptions of settings, characters, and actions.
4.  **Emotional Depth:** Explore the characters' inner thoughts and feelings.
5.  **Engaging Plot:** Include key events, conflicts, and turning points.
6.  **Authentic Dialogue:** Write dialogue that is natural and easy to understand.
7.  **Pacing and Tone:** Maintain a consistent tone appropriate for the chosen genre.

Do not break the narrative with headings, summaries, or author's notes. Write only the story itself.
`;
};

export async function* generateStoryStream(titleOrIdea: string, genre: string) {
  const prompt = getStoryPrompt(titleOrIdea, genre);
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  for await (const chunk of stream) {
    yield chunk.text;
  }
}

export async function translateText(text: string, language: 'Urdu' | 'Arabic'): Promise<string> {
  const prompt = `Translate the following English text into ${language}. Provide only the translated text, with no extra explanations or introductions. Ensure the translation is natural and accurate.\n\nEnglish Text:\n"""\n${text}\n"""\n\n${language} Translation:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`Translation to ${language} failed:`, error);
    throw new Error(`Failed to translate the text. Please try again.`);
  }
}

export async function generateImagesFromStory(story: string): Promise<string[]> {
  const prompt = `Based on the following story, generate 4 distinct, visually compelling, 16:9 cinematic images that represent key scenes or the overall mood. Focus on the core emotional and visual elements described in the text.

Story: """
${story.substring(0, 4000)}
"""`;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 4,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    return response.generatedImages.map(img => img.image.imageBytes);
  } catch (error) {
    console.error(`Image generation failed:`, error);
    throw new Error(`Failed to generate images. The AI might be camera shy.`);
  }
}

export async function generateVideoFromStory(
  story: string,
  onProgress: (message: string) => void
): Promise<string> {
    const prompt = `Create a short, cinematic video, like a movie trailer, that captures the essence and mood of this story. Focus on dynamic visuals and atmosphere.

Story: """
${story.substring(0, 2000)}
"""`;

  try {
    onProgress("Sending your story to the film studio...");
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1
      }
    });

    const progressMessages = [
        "The director is reviewing the script...",
        "Setting up the cameras and lighting...",
        "Filming the first scenes...",
        "Adding visual effects in post-production...",
        "Finalizing the edit, this can take a moment...",
    ];
    let messageIndex = 0;

    while (!operation.done) {
      onProgress(progressMessages[messageIndex % progressMessages.length]);
      messageIndex++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    onProgress("Premiere! Your video is ready.");

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("The video was generated but the download link is missing.");
    }
    
    onProgress("Downloading the final cut...");
    const response = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download the generated video. Status: ${response.status}`);
    }
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error(`Video generation failed:`, error);
    throw new Error(`Failed to generate the video. Please try another story.`);
  }
}
