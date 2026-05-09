import axios from 'axios';

const BASE_URL = 'http://4.224.186.213/evaluation-service';

// Priority weights for sorting
export const PRIORITY_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// Fetch all notifications (with optional query params)
export const fetchNotifications = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/notifications${query ? '?' + query : ''}`;
  const response = await axios.get(url);
  return response.data.notifications || [];
};

// Get top-n priority notifications
export const getTopNNotifications = (notifications, n) => {
  return [...notifications]
    .sort((a, b) => {
      const weightDiff =
        (PRIORITY_WEIGHT[b.Type] || 0) - (PRIORITY_WEIGHT[a.Type] || 0);
      if (weightDiff !== 0) return weightDiff;
      // Same priority → sort by recency
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    })
    .slice(0, n);
};
