import React, { useEffect, useState } from 'react';
import { PayrollReportTable } from '../payroll/PayrollReportTable';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material';

// DashboardLayout faqat React layout va navigatsiyani o'z ichiga oladi
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Payroll report demo integration
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Demo params; replace with real user selection
    fetch('/payroll/report?userId=1&companyId=1&period=2025-05')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => setPayrollData({
        user: 'Aliyev Ali', // Demo; ideally fetch from user API
        company: 'FinCo MCHJ',
        period: '2025-05',
        ...data,
      }))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 220,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button component="a" href="/">
              <ListItemText primary="Bosh sahifa" />
            </ListItem>
            <ListItem button component="a" href="/users">
              <ListItemText primary="Foydalanuvchilar" />
            </ListItem>
            <ListItem button component="a" href="/roles">
              <ListItemText primary="Rollar" />
            </ListItem>
            <ListItem button component="a" href="/kpi">
              <ListItemText primary="KPI" />
            </ListItem>
            <ListItem button component="a" href="/reports">
              <ListItemText primary="Hisobotlar" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              FinCo Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <div>
          {/* Payroll report demo block */}
          <div style={{ margin: '32px 0' }}>
            {loading && <div>Loading payroll report...</div>}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
            {payrollData && <PayrollReportTable {...payrollData} />}
          </div>
          {/* Dashboard content here */}
          {children}
        </div>
      </Box>
    </Box>
  );
}