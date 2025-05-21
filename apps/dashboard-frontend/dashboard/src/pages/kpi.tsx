import React from 'react';
import { useSearchParams } from 'react-router-dom';
import KpiDashboard from '../components/kpi/KpiDashboard';

// KPI sahifasi: telegramId query param orqali KPI ko‘rsatadi
const KpiPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const telegramId = searchParams.get('telegramId') || 'demo'; // demo yoki default id

  return <KpiDashboard telegramId={telegramId} />;
};

export default KpiPage;
