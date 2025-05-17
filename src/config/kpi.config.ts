export const KPI_CONFIG = {
  RESPONSE_TIME_WINDOW_MS: 10 * 60 * 1000, // 10 minut
  KEYWORD_MATCH_THRESHOLD: 2,
  KPI_WEIGHTS: {
    responseTime: 0.5,
    answerRatio: 0.3,
    supervisorIntervention: 0.2,
  },
};
