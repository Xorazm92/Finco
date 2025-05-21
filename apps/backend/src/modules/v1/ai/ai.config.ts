export const aiConfig = {
  ollamaUrl: 'http://localhost:11434',
  defaultModel: 'qwen2.5-7b-instruct',
  defaultParams: {
    temperature: 0.3,
    top_p: 0.95,
    max_tokens: 512,
  },
  promptDir: __dirname + '/prompts',
};
