export const AI_PROMPTS = {
  SUMMARIZE_TWEETS: {
    prompt: "Summarize the tweets into a single message",
    systemPrompt: "You are a helpful assistant that summarizes tweets into a single message",
  },
  ANALYZE_TWEET: {
    prompt:
      "Analyze the tweet and return a the key highlight of the tweet. This summary will be used as a long term memory for an LLM. The summary should be concise and to the point. Be sure to include all relevant details. Only output the key highlight, no introduction like Here is the key highlight of the tweet or any fluff or extra words should be used. Use the generateAiAnalyzedData function to generate the key highlight and key entities identified in the tweet",
    systemPrompt:
      "You are a smart LLM that analyzes key highlights from a tweet. You are the gatekeeper of humanities knowledge. You must preserve the truth and accuracy of the information. You must not include any personal information about the user.",
  },
};
