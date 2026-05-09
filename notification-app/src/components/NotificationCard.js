import React from 'react';
import {
  Card, CardContent, Typography, Chip, Box, IconButton, Tooltip
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventIcon from '@mui/icons-material/Event';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const TYPE_CONFIG = {
  Placement: {
    color: '#e53935',
    bg: '#ffebee',
    icon: <WorkIcon fontSize="small" />,
    label: 'Placement',
  },
  Result: {
    color: '#f57c00',
    bg: '#fff3e0',
    icon: <EmojiEventsIcon fontSize="small" />,
    label: 'Result',
  },
  Event: {
    color: '#1976d2',
    bg: '#e3f2fd',
    icon: <EventIcon fontSize="small" />,
    label: 'Event',
  },
};

export default function NotificationCard({ notification, isRead, onMarkRead }) {
  const config = TYPE_CONFIG[notification.Type] || TYPE_CONFIG.Event;
  const timeAgo = getTimeAgo(notification.Timestamp);

  return (
    <Card
      elevation={isRead ? 0 : 2}
      sx={{
        mb: 1.5,
        border: isRead ? '1px solid #e0e0e0' : `2px solid ${config.color}`,
        bgcolor: isRead ? '#fafafa' : '#fff',
        borderRadius: 3,
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            {/* Unread dot */}
            {!isRead && (
              <FiberManualRecordIcon sx={{ fontSize: 10, color: config.color, mt: 0.3 }} />
            )}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={0.3}>
                <Chip
                  icon={config.icon}
                  label={config.label}
                  size="small"
                  sx={{
                    bgcolor: config.bg,
                    color: config.color,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                    '& .MuiChip-icon': { color: config.color },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {timeAgo}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isRead ? 400 : 600,
                  color: isRead ? 'text.secondary' : 'text.primary',
                  fontSize: '0.92rem',
                }}
              >
                {notification.Message}
              </Typography>
            </Box>
          </Box>

          {!isRead && (
            <Tooltip title="Mark as read">
              <IconButton
                size="small"
                onClick={() => onMarkRead(notification.ID)}
                sx={{ color: config.color, ml: 1 }}
              >
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
