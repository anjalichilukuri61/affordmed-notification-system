import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, CssBaseline,
  createTheme, ThemeProvider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import AllNotificationsPage from './components/AllNotificationsPage';
import PriorityInboxPage from './components/PriorityInboxPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1a237e' },
    secondary: { main: '#e53935' },
    background: { default: '#f4f6fb' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
      },
    },
  },
});

function NavBar() {
  const location = useLocation();
  return (
    <AppBar position="sticky" elevation={2} sx={{ bgcolor: '#1a237e' }}>
      <Toolbar>
        <NotificationsIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
          Campus Notify
        </Typography>
        <Button
          component={Link}
          to="/"
          color="inherit"
          startIcon={<NotificationsIcon />}
          sx={{
            mr: 1,
            bgcolor: location.pathname === '/' ? 'rgba(255,255,255,0.2)' : 'transparent',
            borderRadius: 2,
          }}
        >
          All Notifications
        </Button>
        <Button
          component={Link}
          to="/priority"
          color="inherit"
          startIcon={<StarIcon />}
          sx={{
            bgcolor: location.pathname === '/priority' ? 'rgba(255,255,255,0.2)' : 'transparent',
            borderRadius: 2,
          }}
        >
          Priority Inbox
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavBar />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
          <Routes>
            <Route path="/" element={<AllNotificationsPage />} />
            <Route path="/priority" element={<PriorityInboxPage />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
