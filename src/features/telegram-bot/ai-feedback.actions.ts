import axios from 'axios';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

export async function getLatestAiResults(type = 'sentiment', limit = 5) {
  const res = await axios.get(`${API_BASE}/ai-analysis-result/latest`, { params: { type, limit } });
  return res.data;
}

export async function submitFeedback({ aiAnalysisResultId, reviewerTelegramId, verdict, comment }: {
  aiAnalysisResultId: number;
  reviewerTelegramId?: string;
  verdict: 'approved' | 'rejected' | 'corrected';
  comment?: string;
}) {
  const res = await axios.post(`${API_BASE}/human-feedback/add`, {
    aiAnalysisResultId,
    reviewerTelegramId,
    verdict,
    comment,
  });
  return res.data;
}
