# Notification System Design

---

# Stage 1

## Overview

This document defines the REST API contract for a campus notification platform. The system supports notifying students about Events, Results, and Placement opportunities when they are logged in.

---

## Core Actions Supported

1. Fetch all notifications for a user
2. Fetch a single notification
3. Mark a notification as read
4. Mark all notifications as read
5. Delete a notification
6. Get unread notification count
7. Real-time notification streaming (SSE)

---

## Base URL

```
https://api.campusnotify.com/api/v1
```

---

## Authentication

All endpoints are protected. Every request must include:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## API Endpoints

---

### 1. Get All Notifications

Fetch all notifications for the logged-in user with optional filters.

**Endpoint:**
```
GET /notifications
```

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Results per page (default: 20) |
| notification_type | string | No | Filter by type: Event, Result, Placement |
| is_read | boolean | No | Filter by read status |

**Example Request:**
```
GET /notifications?page=1&limit=20&notification_type=Placement&is_read=false
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
        "type": "Placement",
        "message": "CSX Corporation hiring",
        "is_read": false,
        "created_at": "2026-04-22T17:51:18Z"
      },
      {
        "id": "81589ada-0ad3-4f77-9554-f52fb558e09d",
        "type": "Event",
        "message": "farewell",
        "is_read": false,
        "created_at": "2026-04-22T17:51:06Z"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 20,
      "total_pages": 6
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

### 2. Get Single Notification

**Endpoint:**
```
GET /notifications/:id
```

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "type": "Result",
      "message": "mid-sem",
      "is_read": false,
      "created_at": "2026-04-22T17:51:30Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found"
  }
}
```

---

### 3. Mark a Notification as Read

**Endpoint:**
```
PATCH /notifications/:id/read
```

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
    "is_read": true,
    "updated_at": "2026-05-09T10:00:00Z"
  }
}
```

---

### 4. Mark All Notifications as Read

**Endpoint:**
```
PATCH /notifications/read-all
```

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updated_count": 15
  }
}
```

---

### 5. Delete a Notification

**Endpoint:**
```
DELETE /notifications/:id
```

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 6. Get Unread Notification Count

**Endpoint:**
```
GET /notifications/unread-count
```

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "unread_count": 42
  }
}
```

---

## Real-Time Notifications — Server-Sent Events (SSE)

### Why SSE?

| Feature | SSE | WebSockets |
|---|---|---|
| Direction | Server → Client (one-way) | Bi-directional |
| Complexity | Simple, uses HTTP | Requires separate protocol |
| Auto-reconnect | Built-in | Manual |
| Best for | Notifications, feeds | Chat, games |
| Firewall friendly | Yes | Sometimes blocked |

Notifications are one-directional (server pushes to client), making SSE the ideal and simpler choice over WebSockets.

---

### SSE Endpoint

**Endpoint:**
```
GET /notifications/stream
```

**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Accept": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive"
}
```

**Server Response Format:**
```
Content-Type: text/event-stream

data: {"id":"d146095a-0d86-4a34-9e69-3900a14576bc","type":"Placement","message":"CSX Corporation hiring","created_at":"2026-05-09T10:00:00Z"}

data: {"id":"81589ada-0ad3-4f77-9554-f52fb558e09d","type":"Event","message":"farewell","created_at":"2026-05-09T10:01:00Z"}
```

### Client-Side Usage (JavaScript):

```javascript
const eventSource = new EventSource('/api/v1/notifications/stream', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
  // Update UI to show new notification
};

eventSource.onerror = () => {
  // SSE auto-reconnects on error
  console.log('Connection lost, reconnecting...');
};
```

---

## Error Codes Summary

| HTTP Status | Code | Meaning |
|---|---|---|
| 200 | OK | Success |
| 400 | BAD_REQUEST | Invalid parameters |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Access denied |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_SERVER_ERROR | Server error |

---

## Naming Conventions Used

- **snake_case** for all JSON fields
- **kebab-case** for URL paths
- **Plural nouns** for resource endpoints (`/notifications`)
- **Versioned API** (`/api/v1`) for future compatibility
- **PATCH** for partial updates (read status), **DELETE** for removal

---

*End of Stage 1*

---

# Stage 2

## Database Choice: PostgreSQL

### Why PostgreSQL over MongoDB?

| Feature | PostgreSQL (SQL) | MongoDB (NoSQL) |
|---|---|---|
| Data structure | Structured, relational | Flexible, document-based |
| Relationships | Strong (foreign keys) | Weak (manual references) |
| Queries | Powerful SQL joins | Limited aggregation |
| ACID compliance | Full | Partial |
| Indexing | Advanced | Basic |
| Best for | Notifications with user relations | Unstructured/flexible data |

**Decision: PostgreSQL**

Reasons:
- Notifications have a clear, fixed structure (id, type, message, timestamp, is_read)
- Strong relationship between students and notifications (foreign key)
- Need for complex queries (filter by type, date range, read status)
- ACID compliance ensures no notification is lost or duplicated
- Advanced indexing support which is critical for 5M+ records

---

## Database Schema

### Table 1: students

```sql
CREATE TABLE students (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    roll_number   VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);
```

### Table 2: notifications

```sql
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    message           TEXT NOT NULL,
    is_read           BOOLEAN DEFAULT false,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);
```

### Table 3: notification_logs (for audit/delivery tracking)

```sql
CREATE TABLE notification_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    delivered_at    TIMESTAMP DEFAULT NOW(),
    channel         VARCHAR(50) DEFAULT 'in-app'  -- 'email', 'in-app', 'push'
);
```

---

## Schema Diagram

```
students
---------
id (PK)
name
email
roll_number
password_hash
created_at
updated_at
     |
     | 1 : Many
     |
notifications
--------------
id (PK)
student_id (FK → students.id)
notification_type  (ENUM: Event, Result, Placement)
message
is_read
created_at
updated_at
     |
     | 1 : Many
     |
notification_logs
------------------
id (PK)
notification_id (FK → notifications.id)
student_id (FK → students.id)
delivered_at
channel
```

---

## Problems That Arise as Data Volume Increases

### Problem 1: Slow Queries
With 50,000 students and 5,000,000 notifications, a simple `SELECT * FROM notifications WHERE student_id = ?` will do a **full table scan** across 5M rows — extremely slow.

**Solution:** Add indexes on `student_id`, `is_read`, and `created_at` (covered in Stage 3).

### Problem 2: Database Overload
Every page load fires a DB query per student. With 50,000 concurrent users, that's 50,000 queries/second hitting the DB.

**Solution:** Introduce Redis caching layer (covered in Stage 4).

### Problem 3: Storage Growth
5M notifications × average 500 bytes = ~2.5 GB and growing daily. Old notifications slow down queries.

**Solution:** Archival strategy — move notifications older than 6 months to a cold storage table or archive DB.

### Problem 4: Bulk Insert Bottleneck
Sending notifications to all 50,000 students simultaneously causes DB write spikes.

**Solution:** Use a message queue (Bull/RabbitMQ) for async batch inserts (covered in Stage 5).

### Problem 5: Notification Delivery Failures
If the server crashes mid-send, some students won't receive notifications with no way to retry.

**Solution:** Track delivery status in `notification_logs` table and implement retry logic.

---

## SQL Queries

### Query 1: Get all notifications for a student (paginated)

```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = 'your-student-uuid'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Query 2: Get all unread notifications for a student

```sql
SELECT id, notification_type, message, created_at
FROM notifications
WHERE student_id = 'your-student-uuid'
  AND is_read = false
ORDER BY created_at DESC;
```

### Query 3: Get unread notification count for a student

```sql
SELECT COUNT(*) AS unread_count
FROM notifications
WHERE student_id = 'your-student-uuid'
  AND is_read = false;
```

### Query 4: Mark a single notification as read

```sql
UPDATE notifications
SET is_read = true, updated_at = NOW()
WHERE id = 'notification-uuid'
  AND student_id = 'your-student-uuid';
```

### Query 5: Mark all notifications as read for a student

```sql
UPDATE notifications
SET is_read = true, updated_at = NOW()
WHERE student_id = 'your-student-uuid'
  AND is_read = false;
```

### Query 6: Get notifications filtered by type

```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = 'your-student-uuid'
  AND notification_type = 'Placement'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Query 7: Delete a notification

```sql
DELETE FROM notifications
WHERE id = 'notification-uuid'
  AND student_id = 'your-student-uuid';
```

---

*End of Stage 2*

---

# Stage 3

## Analyzing the Slow Query

### Original Query:
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### Is this query accurate?
The query is **logically correct** but has the following issues:
- Uses `SELECT *` — fetches all columns including unnecessary ones, increasing I/O
- No index on `studentID` or `isRead` — causes full table scan across 5M rows
- `ORDER BY createdAt ASC` without an index means database sorts all matching rows in memory

### Why is it slow?
With 5,000,000 notifications and 50,000 students:
- Average notifications per student = 100
- Without an index, DB scans ALL 5M rows to find matching student's records
- Full table scan time complexity = **O(n)** where n = 5,000,000
- Sorting on top of that adds extra computation

### Computation Cost (Before Fix):
- Table scan: ~5,000,000 row reads
- Sort: ~100 rows sorted in memory per query
- Estimated query time: **2–10 seconds** on a standard server

---

## What Would You Change?

### Fixed Query:
```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = 1042
  AND is_read = false
ORDER BY created_at ASC;
```

Changes made:
- Replace `SELECT *` with only required columns
- Consistent snake_case column names
- Add proper indexes (see below)

### Indexes to Add:
```sql
-- Index 1: Most important — covers student_id + is_read filter
CREATE INDEX idx_notifications_student_read
ON notifications (student_id, is_read);

-- Index 2: For sorting by created_at
CREATE INDEX idx_notifications_student_created
ON notifications (student_id, created_at DESC);

-- Index 3: Composite index for all three together (best performance)
CREATE INDEX idx_notifications_student_read_created
ON notifications (student_id, is_read, created_at DESC);
```

### Computation Cost (After Fix):
- Index lookup: ~100 row reads (only this student's records)
- Sort: already ordered via index
- Estimated query time: **< 10 milliseconds** ✅

---

## Should You Add Indexes on Every Column?

**NO. This is bad advice.** Here's why:

| | Indexes on Every Column | Targeted Indexes |
|---|---|---|
| Read speed | Fast | Fast |
| Write speed | Very slow (every INSERT/UPDATE rebuilds all indexes) | Normal |
| Storage | Huge overhead | Minimal |
| Maintenance | Complex | Simple |

**Rule:** Only index columns used in WHERE, ORDER BY, or JOIN clauses.

For this table, index: `student_id`, `is_read`, `created_at`, `notification_type`
Do NOT index: `message`, `password_hash`, `updated_at`

---

## Query: Students Who Got Placement Notification in Last 7 Days

```sql
SELECT DISTINCT s.id, s.name, s.email, s.roll_number
FROM students s
JOIN notifications n ON s.id = n.student_id
WHERE n.notification_type = 'Placement'
  AND n.created_at >= NOW() - INTERVAL '7 days'
ORDER BY s.name ASC;
```

### Supporting Index:
```sql
CREATE INDEX idx_notifications_type_created
ON notifications (notification_type, created_at DESC);
```

---

*End of Stage 3*

---

# Stage 4

## Problem
Notifications are fetched from the database on **every page load** for every student. With 50,000 students simultaneously active, this causes:
- 50,000 DB queries per page load cycle
- Database CPU spikes to 100%
- Slow response times (2–5 seconds per request)
- Bad user experience

---

## Suggested Solution: Redis Caching

### Architecture:

```
Student Request
      ↓
   API Server
      ↓
  Check Redis Cache
      ↓              ↓
Cache HIT         Cache MISS
      ↓              ↓
Return cached    Query PostgreSQL
notifications         ↓
                 Store in Redis
                      ↓
                 Return result
```

### Implementation:

```javascript
// Pseudocode for caching layer
async function getNotifications(studentId, page, limit) {
  const cacheKey = `notifications:${studentId}:page:${page}:limit:${limit}`;

  // 1. Check Redis first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached); // Return instantly from cache
  }

  // 2. Cache miss — query DB
  const notifications = await db.query(
    `SELECT id, notification_type, message, is_read, created_at
     FROM notifications
     WHERE student_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [studentId, limit, (page - 1) * limit]
  );

  // 3. Store in Redis with 5 minute expiry
  await redis.setex(cacheKey, 300, JSON.stringify(notifications));

  return notifications;
}

// Invalidate cache when notification is read/deleted
async function markAsRead(notificationId, studentId) {
  await db.query(
    `UPDATE notifications SET is_read = true WHERE id = $1`,
    [notificationId]
  );
  // Clear student's cache so next fetch gets fresh data
  await redis.del(`notifications:${studentId}:*`);
}
```

---

## Tradeoffs of Each Strategy

### Strategy 1: Redis Cache (Recommended ✅)
| Pros | Cons |
|---|---|
| Response time drops from 2s to <50ms | Cache can serve stale data |
| DB load reduced by ~80% | Extra infrastructure (Redis server) |
| Scales to millions of users | Cache invalidation logic needed |
| TTL auto-expires stale data | Memory cost for cached data |

**Cache TTL:** 5 minutes for notification list, invalidate immediately on read/delete

---

### Strategy 2: Pagination Only
| Pros | Cons |
|---|---|
| Simple to implement | Still hits DB every request |
| Reduces data transfer size | Doesn't solve DB overload |
| Already in Stage 1 API | Only partial improvement |

---

### Strategy 3: CDN / Edge Caching
| Pros | Cons |
|---|---|
| Globally fast responses | Not suitable for user-specific data |
| Reduces server load | Notifications are private per user |

---

### Strategy 4: Database Read Replicas
| Pros | Cons |
|---|---|
| Scales reads horizontally | Replication lag (slight stale data) |
| No code changes needed | More expensive infrastructure |
| Works alongside caching | Doesn't eliminate query overhead |

---

## Final Recommendation

Use **Redis + Pagination + Read Replicas** together:
1. **Redis** handles repeated requests for same data
2. **Pagination** reduces data per response
3. **Read replicas** handle cache misses at scale
4. **Indexes** (Stage 3) ensure DB queries are fast when cache misses occur

---

*End of Stage 4*

---

# Stage 5

## Original Pseudocode (Broken):

```
function notify_all(student_ids: array, message: string):
  for student_id in student_ids:
    send_email(student_id, message)      # calls Email API
    save_to_db(student_id, message)      # DB insert
    push_to_app(student_id, message)     # real-time push
```

---

## Shortcomings Observed

1. **No error handling** — if `send_email` fails for student 200, the loop crashes and remaining 49,800 students never get notified
2. **Synchronous loop** — processes one student at a time, 50,000 students sequentially = extremely slow (hours)
3. **Tight coupling** — email sending and DB saving happen together; if email API is down, DB insert also fails
4. **No retry mechanism** — failed emails are lost permanently
5. **No progress tracking** — no way to know how many succeeded/failed
6. **Memory risk** — loading all 50,000 student IDs in memory at once can crash the server

---

## Should DB Save and Email Happen Together?

**NO.** They should be **decoupled** because:
- Email API can be slow or fail — shouldn't block DB insert
- DB insert should always succeed first (source of truth)
- Email is a side effect — it can be retried independently
- Tying them together means one failure causes both to fail

---

## Redesigned Solution: Message Queue Architecture

```
HR clicks "Notify All"
         ↓
   API Server receives request
         ↓
   Save job to Message Queue (Bull/RabbitMQ)
         ↓
   Return 202 Accepted to HR immediately
         ↓
   Worker processes queue in background
         ↓
   For each student (in batches of 100):
         ↓
    ┌────────────────────────────────┐
    │  1. save_to_db()               │
    │  2. push_to_app()              │
    │  3. send_email() (async)       │
    │  4. On failure → retry 3x      │
    │  5. On final failure → log it  │
    └────────────────────────────────┘
```

---

## Revised Pseudocode:

```python
import queue
import threading
import time

MAX_RETRIES = 3
BATCH_SIZE = 100

def notify_all(student_ids: list, message: str):
    # Split into batches to avoid memory overload
    batches = [student_ids[i:i+BATCH_SIZE]
               for i in range(0, len(student_ids), BATCH_SIZE)]

    for batch in batches:
        # Push each batch to message queue
        message_queue.enqueue('process_batch', {
            'student_ids': batch,
            'message': message
        })

    return {"status": "queued", "total_students": len(student_ids)}


def process_batch(student_ids: list, message: str):
    for student_id in student_ids:
        notify_single(student_id, message)


def notify_single(student_id: str, message: str, retry_count: int = 0):
    try:
        # Step 1: Always save to DB first (source of truth)
        save_to_db(student_id, message)

        # Step 2: Push real-time notification
        push_to_app(student_id, message)

        # Step 3: Send email asynchronously (non-blocking)
        thread = threading.Thread(
            target=send_email_with_retry,
            args=(student_id, message)
        )
        thread.start()

    except Exception as e:
        if retry_count < MAX_RETRIES:
            time.sleep(2 ** retry_count)  # Exponential backoff
            notify_single(student_id, message, retry_count + 1)
        else:
            # Log permanently failed notification
            log_failure(student_id, message, str(e))


def send_email_with_retry(student_id: str, message: str):
    for attempt in range(MAX_RETRIES):
        try:
            send_email(student_id, message)
            return  # Success
        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                log_failure(student_id, message, f"Email failed: {e}")
            else:
                time.sleep(2 ** attempt)  # Exponential backoff


def log_failure(student_id: str, message: str, error: str):
    # Save to failed_notifications table for manual review
    save_to_failed_log(student_id, message, error)
```

---

## Key Improvements Made

| Issue | Fix |
|---|---|
| Loop crashes on failure | Try/catch with retry per student |
| Sequential processing | Message queue with batch workers |
| Email blocks DB save | Decoupled — DB first, email async |
| No retries | Exponential backoff, 3 retries |
| Memory overload | Batches of 100 students |
| No tracking | Failed notifications logged to DB |

---

*End of Stage 5*
