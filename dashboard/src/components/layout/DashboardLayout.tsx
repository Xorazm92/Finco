import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material';

// DashboardLayout faqat React layout va navigatsiyani o'z ichiga oladi
export default function DashboardLayout() {
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
        <Outlet />
      </Box>
    </Box>
  );
}