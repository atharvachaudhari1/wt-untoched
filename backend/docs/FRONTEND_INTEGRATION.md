# Frontend Integration

## Base URL
```javascript
const API_BASE = 'http://localhost:3000/api';
```

## Storing JWT
After login success:
```javascript
localStorage.setItem('ecs_token', data.token);
localStorage.setItem('ecs_user', JSON.stringify(data.user));
```

## Sending token on requests
```javascript
function getAuthHeaders() {
  const token = localStorage.getItem('ecs_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
  };
}
fetch(API_BASE + '/student/dashboard', { headers: getAuthHeaders() });
```

## Login
POST /api/auth/login with body: { email, password, role? }. On 401 clear token and redirect to login.

## CORS
Set CORS_ORIGIN in .env to your frontend origin (e.g. http://localhost:8080).
