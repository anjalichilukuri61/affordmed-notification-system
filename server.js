const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzQ4MWEwNTQzQGdlY2d1ZGxhdmFsbGVydW1pYy5pbiIsImV4cCI6MTc3ODMwNjUzNSwiaWF0IjoxNzc4MzA1NjM1LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZTAwOTJhNTItYjAxZC00MTk2LTk4MTEtYzdmYWUzYTliOWY5IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYW5qYWxpIGNoaWx1a3VyaSIsInN1YiI6IjZhM2I0OGFkLWMyYjEtNDMwMi1iYzc4LWQxYzRiYzQ4MDE0YSJ9LCJlbWFpbCI6IjIzNDgxYTA1NDNAZ2VjZ3VkbGF2YWxsZXJ1bWljLmluIiwibmFtZSI6ImFuamFsaSBjaGlsdWt1cmkiLCJyb2xsTm8iOiIyMzQ4MWEwNTQzIiwiYWNjZXNzQ29kZSI6ImVKZEN1QyIsImNsaWVudElEIjoiNmEzYjQ4YWQtYzJiMS00MzAyLWJjNzgtZDFjNGJjNDgwMTRhIiwiY2xpZW50U2VjcmV0IjoiQldKVlZ0QmRGR1NyUVBGaiJ9.0Fwl_wn33ygaDtSSDQ1ZPbJcbxK3eTtCPgHyqJvnh8E';

app.get('/notifications', async (req, res) => {
  try {
    const response = await axios.get(
      'http://4.224.186.213/evaluation-service/notifications',
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.listen(5000, () => {
  console.log('Proxy server running on http://localhost:5000');
});