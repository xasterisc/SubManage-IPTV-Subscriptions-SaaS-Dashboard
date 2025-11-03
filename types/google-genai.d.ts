declare module '@google/genai' {
  interface GenerateContentParams {
    model: string;
    contents: string;
  }

  interface GenerateContentResponse {
    text: string;
  }

  interface Models {
    generateContent(params: GenerateContentParams): Promise<GenerateContentResponse>;
  }

  interface GoogleGenAIOptions {
    apiKey: string;
  }

  export class GoogleGenAI {
    constructor(options: GoogleGenAIOptions);
    models: Models;
  }
}
