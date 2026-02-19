/**
 * ECS Mentoring Portal - API client (vanilla JS).
 */
(function (global) {
  var API_BASE = 'http://localhost:3000/api';
  var TOKEN_KEY = 'ecs_token';
  var USER_KEY = 'ecs_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getAuthHeaders() {
    var token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? 'Bearer ' + token : ''
    };
  }

  function setAuth(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getUser() {
    try {
      var u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (_) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function request(method, path, body) {
    var url = path.indexOf('http') === 0 ? path : API_BASE + path;
    var isLoginRequest = (method === 'POST' && path === '/auth/login');
    var options = { method: method, headers: getAuthHeaders() };
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    return fetch(url, options).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401) {
          if (!isLoginRequest) {
            clearAuth();
            if (typeof window !== 'undefined' && window.location.pathname.indexOf('login') === -1) {
              window.location.href = 'login.html';
            }
            return Promise.reject(new Error('Session expired'));
          }
          return Promise.reject(new Error(data.message || 'Invalid email or password'));
        }
        if (!res.ok) return Promise.reject(new Error(data.message || 'Request failed'));
        return data;
      });
    });
  }

  global.ECS_API = {
    getToken: getToken,
    getAuthHeaders: getAuthHeaders,
    setAuth: setAuth,
    clearAuth: clearAuth,
    getUser: getUser,
    isLoggedIn: isLoggedIn,
    get: function (path) { return request('GET', path); },
    post: function (path, body) { return request('POST', path, body); },
    put: function (path, body) { return request('PUT', path, body); },
    patch: function (path, body) { return request('PATCH', path, body); },
    delete: function (path) { return request('DELETE', path); },
    auth: {
      login: function (email, password, role) { return request('POST', '/auth/login', { email: email, password: password, role: role }); },
      me: function () { return request('GET', '/auth/me'); }
    },
    student: {
      dashboard: function () { return request('GET', '/student/dashboard'); },
      sessionsUpcoming: function () { return request('GET', '/student/sessions/upcoming'); },
      meetLink: function (sessionId) { return request('GET', '/student/sessions/' + sessionId + '/meet-link'); },
      announcements: function () { return request('GET', '/student/announcements'); },
      notifications: function () { return request('GET', '/notifications'); }
    }
  };
})(typeof window !== 'undefined' ? window : this);
