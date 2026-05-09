import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert,
  Slider, Paper, Chip, Divider, Button
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventIcon from '@mui/icons-material/Event';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchNotifications, getTopNNotifications, PRIORITY_WEIGHT } from '../api';
import NotificationCard from './NotificationCard';

const RANK_LABELS = { 1: 'Top 5', 2: 'Top 10', 3: 'Top 15', 4: 'Top 20' };

export default function PriorityInboxPage() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNotifications();
      setAllNotifications(data);
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

  const topNotifications = getTopNNotifications(allNotifications, topN);

  // Stats
  const placementCount = topNotifications.filter((n) => n.Type === 'Placement').length;
  const resultCount = topNotifications.filter((n) => n.Type === 'Result').length;
  const eventCount = topNotifications.filter((n) => n.Type === 'Event').length;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <StarIcon sx={{ fontSize: 32, color: '#f57c00' }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#1a237e">
              Priority Inbox
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing top {topN} notifications by importance
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={loadNotifications}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Top-N Slider */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#eff1f8', borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Show top N notifications
        </Typography>
        <Box px={1}>
          <Slider
            value={topN}
            onChange={(_, val) => setTopN(val)}
            min={5}
            max={20}
            step={5}
            marks={[
              { value: 5, label: '5' },
              { value: 10, label: '10' },
              { value: 15, label: '15' },
              { value: 20, label: '20' },
            ]}
            valueLabelDisplay="auto"
            sx={{ color: '#1a237e' }}
          />
        </Box>

        {/* Priority legend */}
        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
          <Chip
            icon={<WorkIcon />}
            label={`Placement (${placementCount})`}
            size="small"
            sx={{ bgcolor: '#ffebee', color: '#e53935', fontWeight: 700, '& .MuiChip-icon': { color: '#e53935' } }}
          />
          <Chip
            icon={<EmojiEventsIcon />}
            label={`Result (${resultCount})`}
            size="small"
            sx={{ bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 700, '& .MuiChip-icon': { color: '#f57c00' } }}
          />
          <Chip
            icon={<EventIcon />}
            label={`Event (${eventCount})`}
            size="small"
            sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700, '& .MuiChip-icon': { color: '#1976d2' } }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          Priority order: 🔴 Placement &gt; 🟡 Result &gt; 🟢 Event, then by recency
        </Typography>
      </Paper>

      <Divider sx={{ mb: 2 }} />

      {/* Content */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress sx={{ color: '#1a237e' }} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && topNotifications.length === 0 && (
        <Box textAlign="center" mt={6}>
          <StarIcon sx={{ fontSize: 60, color: '#bdbdbd' }} />
          <Typography color="text.secondary" mt={1}>No notifications found</Typography>
        </Box>
      )}

      {!loading && !error && topNotifications.map((notif, index) => (
        <Box key={notif.ID} display="flex" alignItems="flex-start" gap={1}>
          {/* Rank badge */}
          <Box
            sx={{
              minWidth: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: index < 3 ? '#1a237e' : '#e0e0e0',
              color: index < 3 ? '#fff' : '#757575',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              mt: 1.5,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>
          <Box flex={1}>
            <NotificationCard
              notification={notif}
              isRead={readIds.has(notif.ID)}
              onMarkRead={handleMarkRead}
            />
          </Box>
        </Box>
      ))}
    </Container>
  );
}
