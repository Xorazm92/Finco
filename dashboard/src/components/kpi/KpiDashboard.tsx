import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Progress, Row, Col, Statistic, Spin, Typography } from 'antd';

const { Title } = Typography;

export const KpiDashboard: React.FC<{ telegramId: string }> = ({ telegramId }) => {
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`/api/kpi/user/${telegramId}`)
      .then((res) => setKpi(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [telegramId]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (error) return <div style={{ color: 'red' }}>KPI olishda xatolik: {error}</div>;
  if (!kpi) return null;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Foydalanuvchi KPI Dashboard</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Umumiy savollar" value={kpi.totalQuestions} />
            <Statistic title="Javobsiz savollar (%)" value={kpi.unansweredPercent} suffix="%" />
            <Statistic title="O'rtacha javob vaqti (sek)" value={kpi.avgResponseTimeSeconds ?? '-'} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Hisobotlar soni" value={kpi.totalReports} />
            <Statistic title="Kechikkan hisobotlar (%)" value={kpi.lateReportsPercent} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Javobsiz savollar progress</Title>
            <Progress percent={100 - kpi.unansweredPercent} status={kpi.unansweredPercent > 30 ? 'exception' : 'active'} />
            <Title level={5}>Kechikkan hisobotlar progress</Title>
            <Progress percent={100 - kpi.lateReportsPercent} status={kpi.lateReportsPercent > 30 ? 'exception' : 'active'} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KpiDashboard;
