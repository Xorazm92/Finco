import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Typography, CircularProgress, Grid, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const KpiDashboard: React.FC<{ telegramId: string, chatId?: string }> = ({ telegramId, chatId }) => {
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`/api/kpi/user/${telegramId}`)
      .then((res) => setKpi(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // Trend fetch
    if (chatId) {
      axios.get(`/api/kpi/trend?chatId=${chatId}&weeks=4`).then(res => setTrendData(res.data));
    }
  }, [telegramId, chatId]);

  // Chart.js uchun data tayyorlash
  const chartData = {
    labels: trendData.map(w => w.week),
    datasets: [
      {
        label: "Javobsiz savollar (%)",
        data: trendData.map(w => w.unansweredPercent),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress size={48} /></Box>;
  if (error) return <Typography sx={{ color: 'red' }}>KPI olishda xatolik: {error}</Typography>;
  if (!kpi) return null;

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h2">Foydalanuvchi KPI Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="body2">KPI o'rtacha: {kpi?.weekAvg?.toFixed(2)}</Typography>
            <Typography variant="body1">Javobsiz savollar (%): {kpi.unansweredPercent}%</Typography>
            <Typography variant="body1">O'rtacha javob vaqti (sek): {kpi.avgResponseTimeSeconds ?? '-'}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="body2">Hisobotlar soni: {kpi.totalReports}</Typography>
            <Typography variant="body1">Kechikkan hisobotlar (%): {kpi.lateReportsPercent}%</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="body2">KPI trend: {kpi?.trend}</Typography>
            <Typography variant="body1">Javobsiz savollar progress:</Typography>
            <Box sx={{ width: '100%', mt: 1 }}>
              <Typography variant="body2">Javobsiz savollar: {kpi.unansweredPercent}%</Typography>
              <Box sx={{ bgcolor: '#eee', borderRadius: 1, height: 10, width: '100%' }}>
                <Box sx={{
                  bgcolor: kpi.unansweredPercent > 30 ? 'error.main' : 'success.main',
                  width: `${100 - kpi.unansweredPercent}%`,
                  height: '100%',
                  borderRadius: 1
                }} />
              </Box>
            </Box>
            <Typography variant="body1">Kechikkan hisobotlar progress:</Typography>
            <Box sx={{ width: '100%', mt: 1 }}>
              <Typography variant="body2">Kechikkan hisobotlar: {kpi.lateReportsPercent}%</Typography>
              <Box sx={{ bgcolor: '#eee', borderRadius: 1, height: 10, width: '100%' }}>
                <Box sx={{
                  bgcolor: kpi.lateReportsPercent > 30 ? 'error.main' : 'success.main',
                  width: `${100 - kpi.lateReportsPercent}%`,
                  height: '100%',
                  borderRadius: 1
                }} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
      {/* KPI Trend Chart */}
      {chatId && trendData.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6">KPI Trend (Javobsiz savollar %)</Typography>
          <Line data={chartData} />
        </Box>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h2">Foydalanuvchi KPI Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <Typography variant="body2">KPI o'rtacha: {kpi?.weekAvg?.toFixed(2)}</Typography>
            <Typography variant="body1">Javobsiz savollar (%): {kpi.unansweredPercent}%</Typography>
            <Typography variant="body1">O'rtacha javob vaqti (sek): {kpi.avgResponseTimeSeconds ?? '-'}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <Typography variant="body2">Hisobotlar soni: {kpi.totalReports}</Typography>
            <Typography variant="body1">Kechikkan hisobotlar (%): {kpi.lateReportsPercent}%</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <Typography variant="body2">KPI trend: {kpi?.trend}</Typography>
            <Typography variant="body1">Javobsiz savollar progress:</Typography>
            <Box sx={{ width: '100%', mt: 1 }}>
              <Typography variant="body2">Javobsiz savollar: {kpi.unansweredPercent}%</Typography>
              <Box sx={{ bgcolor: '#eee', borderRadius: 1, height: 10, width: '100%' }}>
                <Box sx={{ bgcolor: kpi.unansweredPercent > 30 ? 'error.main' : 'success.main', width: `${100 - kpi.unansweredPercent}%`, height: '100%', borderRadius: 1 }} />
              </Box>
            </Box>
            <Typography variant="body1">Kechikkan hisobotlar progress:</Typography>
            <Box sx={{ width: '100%', mt: 1 }}>
              <Typography variant="body2">Kechikkan hisobotlar: {kpi.lateReportsPercent}%</Typography>
              <Box sx={{ bgcolor: '#eee', borderRadius: 1, height: 10, width: '100%' }}>
                <Box sx={{ bgcolor: kpi.lateReportsPercent > 30 ? 'error.main' : 'success.main', width: `${100 - kpi.lateReportsPercent}%`, height: '100%', borderRadius: 1 }} />
              </Box>
            </Box>
            
          </Card>
        </Grid>
      </Grid>
      {/* KPI Trend Chart */}
      {chatId && trendData.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6">KPI Trend (Javobsiz savollar %)</Typography>
          <Line data={chartData} />
        </Box>
      )}
    </div>
  );
};

export default KpiDashboard;
