import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';

// This is a placeholder. Adjust the API endpoint as needed.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface TelegramStats {
  totalUsers: number;
  activeGroups: number;
  totalMessages: number;
  kpiStats: {
    total: number;
    approved: number;
    rejected: number;
    percent: number;
  };
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<TelegramStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/telegram/stats`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Statistikani olishda xatolik!');
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Telegram va KPI Statistikasi
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : stats ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">Telegram Guruhlar</Typography>
              <Typography>Foydalanuvchilar soni: {stats.totalUsers}</Typography>
              <Typography>Faol guruhlar: {stats.activeGroups}</Typography>
              <Typography>Jami xabarlar: {stats.totalMessages}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">KPI Statistikasi</Typography>
              <Typography>Jami natija: {stats.kpiStats.total}</Typography>
              <Typography>Tasdiqlangan: {stats.kpiStats.approved}</Typography>
              <Typography>Rad etilgan: {stats.kpiStats.rejected}</Typography>
              <Typography>To'g'ri tahlil foizi: {stats.kpiStats.percent}%</Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default DashboardPage;
