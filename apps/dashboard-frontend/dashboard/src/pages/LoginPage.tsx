import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(username, password);
      if (ok) {
        navigate('/');
      } else {
        setError("Login yoki parol noto‘g‘ri!");
      }
    } catch (err: any) {
      setError(err?.message || "Login yoki parol noto‘g‘ri!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Admin panelga kirish
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Foydalanuvchi nomi"
            placeholder="Loginni kiriting"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
          <TextField
            label="Parol"
            placeholder="Parolni kiriting"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
          <span>Login va parolingizni unutsangiz, administratorga murojaat qiling.</span>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
