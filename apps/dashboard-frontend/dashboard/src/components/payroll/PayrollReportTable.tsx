import React from 'react';

type KpiBreakdown = {
  [kpi: string]: {
    value: number;
    weight: number;
    bonus: number;
  };
};

interface PayrollReportTableProps {
  user: string;
  company: string;
  period: string;
  baseSalary: number;
  salaryShare: number;
  kpiBonus: number;
  kpiBreakdown: KpiBreakdown;
  bonuses: number;
  advances: number;
  penalties: number;
  total: number;
  net: number;
}

export const PayrollReportTable: React.FC<PayrollReportTableProps> = ({
  user,
  company,
  period,
  baseSalary,
  salaryShare,
  kpiBonus,
  kpiBreakdown,
  bonuses,
  advances,
  penalties,
  total,
  net,
}) => {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Oylik Hisobot</h2>
      <div style={{ marginBottom: 8, fontWeight: 500 }}>
        <span>{user} | {company} | {period}</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th>KPI turi</th>
            <th>Qiymat (%)</th>
            <th>Og‘irlik (%)</th>
            <th>Bonus (so‘m)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(kpiBreakdown).map(([kpi, val]) => (
            <tr key={kpi}>
              <td>{kpi}</td>
              <td>{val.value}</td>
              <td>{val.weight}</td>
              <td>{val.bonus.toLocaleString()}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 600, background: '#f9f9f9' }}>
            <td colSpan={3}>Jami KPI bonus</td>
            <td>{kpiBonus.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <tbody>
          <tr><td>Oklad</td><td>{baseSalary.toLocaleString()}</td></tr>
          <tr><td>KPI bonus</td><td>{kpiBonus.toLocaleString()}</td></tr>
          <tr><td>Bonus</td><td>{bonuses.toLocaleString()}</td></tr>
          <tr><td>Avans</td><td>-{advances.toLocaleString()}</td></tr>
          <tr><td>Jarima</td><td>-{penalties.toLocaleString()}</td></tr>
          <tr style={{ fontWeight: 600, background: '#f5f5f5' }}>
            <td>Qo‘lga tegadigan</td>
            <td>{net.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
