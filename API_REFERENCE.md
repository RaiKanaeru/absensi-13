# Smart Attend API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT token in Authorization header (except login):
```http
Authorization: Bearer <jwt_token>
```

## Core Endpoints

### 🔐 Authentication
```http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/change-password
```

### 👥 Users Management
```http
GET    /api/users              # List users
POST   /api/users              # Create user
GET    /api/users/:id          # Get user details
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### 🎓 Students
```http
GET    /api/students           # List all students
POST   /api/students           # Create student
GET    /api/students/:id       # Get student details
PUT    /api/students/:id       # Update student
DELETE /api/students/:id       # Delete student
GET    /api/students/:id/attendance  # Student attendance history
```

### 🏫 Classes
```http
GET    /api/classes            # List all classes
POST   /api/classes            # Create class
GET    /api/classes/:id        # Get class details
PUT    /api/classes/:id        # Update class
DELETE /api/classes/:id        # Delete class
GET    /api/classes/:id/students    # Get students in class
GET    /api/classes/:id/schedules   # Get class schedules
```

### ✅ Attendance
```http
# Sessions
GET    /api/attendance/sessions          # List sessions
POST   /api/attendance/sessions          # Create session
GET    /api/attendance/sessions/:id      # Get session
PUT    /api/attendance/sessions/:id      # Update session
DELETE /api/attendance/sessions/:id      # Delete session
POST   /api/attendance/sessions/:id/start  # Start session
POST   /api/attendance/sessions/:id/end    # End session

# Student Attendance
GET    /api/attendance/students          # List attendance records
POST   /api/attendance/students          # Record attendance
PUT    /api/attendance/students/:id      # Update attendance
GET    /api/attendance/students/:id      # Get attendance record

# Quick Access
GET    /api/attendance/today             # Today's summary
GET    /api/attendance/class/:id/today   # Class attendance today
```

### 📊 Reports
```http
GET /api/reports/daily            # Daily reports
GET /api/reports/monthly          # Monthly reports
GET /api/reports/yearly           # Yearly reports
GET /api/reports/student/:id      # Individual student report
GET /api/reports/class/:id        # Class report
GET /api/reports/teacher/:id      # Teacher report

# Export Functions
GET /api/reports/export/daily     # Export daily report
GET /api/reports/export/monthly   # Export monthly report
GET /api/reports/export/student/:id # Export student report
```

## Request Examples

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Create Attendance Session
```http
POST /api/attendance/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "class_id": 1,
  "subject_id": 2,
  "date": "2024-12-20",
  "hour": 1,
  "notes": "Regular session"
}
```

### Record Student Attendance
```http
POST /api/attendance/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_id": 123,
  "student_id": 456,
  "status": "Hadir",
  "notes": "",
  "arrival_time": null
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "pagination": {  // For paginated results
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (Duplicate)
- `429` - Too Many Requests
- `500` - Internal Server Error

## Error Codes

- `AUTH_REQUIRED` - Authentication required
- `AUTH_INVALID` - Invalid credentials or token
- `AUTH_EXPIRED` - Token expired
- `PERMISSION_DENIED` - Insufficient permissions
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Duplicate data
- `SERVER_ERROR` - Internal server error

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-*` headers included in response
- **Exceeded**: Returns 429 status with retry information

## Testing with curl

```bash
# Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use token for authenticated request
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer <your_token_here>"

# Create new student
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "nis": "2024001",
    "full_name": "John Doe",
    "gender": "L",
    "class_id": 1
  }'
```

## WebSocket Events (Future)

```javascript
// Real-time attendance updates
socket.on('attendance:updated', (data) => {
  // Handle attendance update
});

// Session status changes
socket.on('session:started', (data) => {
  // Handle session start
});

socket.on('session:ended', (data) => {
  // Handle session end
});
```

For more detailed information, see [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md).