import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert,
  ToggleButton, ToggleButtonGroup, Badge, Button, Divider,
  Paper
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchNotifications } from '../api';
import NotificationCard from './NotificationCard';

const FILTERS = ['All', 'Placement', 'Result', 'Event'];

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNotifications();
      // Sort by timestamp descending (newest first)
      const sorted = [...data].sort(
        (a, b) => new Date(b.Timestamp) - new Date(a.Timestamp)
      );
      setNotifications(sorted);
    } catch (err) {
      setError('Failed to load notifications. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = (id) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const handleMarkAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.ID)));
  };

  const filtered = filter === 'All'
    ? notifications
    : notifications.filter((n) => n.Type === filter);

  const unreadCount = notifications.filter((n) => !readIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon sx={{ fontSize: 32, color: '#1a237e' }} />
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#1a237e">
              All Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unreadCount} unread · {notifications.length} total
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadNotifications}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            variant="contained"
            sx={{ borderRadius: 2 }}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </Box>
      </Box>

      {/* Filter tabs */}
      <Paper elevation={0} sx={{ mb: 2, p: 1, bgcolor: '#eff1f8', borderRadius: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val && setFilter(val)}
          size="small"
          fullWidth
        >
          {FILTERS.map((f) => {
            const count = f === 'All'
              ? notifications.length
              : notifications.filter((n) => n.Type === f).length;
            return (
              <ToggleButton
                key={f}
                value={f}
                sx={{
                  borderRadius: '8px !important',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  border: 'none',
                  '&.Mui-selected': {
                    bgcolor: '#1a237e',
                    color: '#fff',
                    '&:hover': { bgcolor: '#283593' },
                  },
                }}
              >
                {f} ({count})
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Paper>

      <Divider sx={{ mb: 2 }} />

      {/* Content */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress sx={{ color: '#1a237e' }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && filtered.length === 0 && (
        <Box textAlign="center" mt={6}>
          <NotificationsIcon sx={{ fontSize: 60, color: '#bdbdbd' }} />
          <Typography color="text.secondary" mt={1}>No notifications found</Typography>
        </Box>
      )}

      {!loading && !error && filtered.map((notif) => (
        <NotificationCard
          key={notif.ID}
          notification={notif}
          isRead={readIds.has(notif.ID)}
          onMarkRead={handleMarkRead}
        />
      ))}
    </Container>
  );
}
