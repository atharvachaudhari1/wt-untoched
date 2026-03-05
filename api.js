/**
 *
 */
(function (global) {
  function getApiBase() {
    if (typeof window !== 'undefined' && window.ECS_API_BASE) {
      return window.ECS_API_BASE;
    }
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return window.location.protocol + '//' + window.location.hostname + ':3000/api';
    }
    return 'http://localhost:3000/api';
  }
  var API_BASE = getApiBase();
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
    var base = getApiBase();
    var url = path.indexOf('http') === 0 ? path : base + path;
    var isLoginRequest = (method === 'POST' && path === '/auth/login');
    var options = { method: method, headers: getAuthHeaders() };
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    return fetch(url, options).then(function (res) {
      return res.text().then(function (text) {
        var data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (_) {}
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
        if (!res.ok) {
          var msg = data.message || ('Request failed (' + res.status + ')');
          return Promise.reject(new Error(msg));
        }
        return data;
      });
    }).catch(function (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        return Promise.reject(new Error('Cannot reach server. Start the backend (port 3000), then refresh this page.'));
      }
      return Promise.reject(err);
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
      me: function () { return request('GET', '/auth/me'); },
      updateMe: function (body) { return request('PATCH', '/auth/me', body); }
    },
    student: {
      dashboard: function () { return request('GET', '/student/dashboard'); },
      liveSessions: function () { return request('GET', '/student/live-sessions'); },
      sessionsUpcoming: function () { return request('GET', '/student/sessions/upcoming'); },
      meetLink: function (sessionId) { return request('GET', '/student/sessions/' + sessionId + '/meet-link'); },
      mentor: function () { return request('GET', '/student/mentor'); },
      attendance: function () { return request('GET', '/student/attendance'); },
      courseAttendance: function () { return request('GET', '/student/course-attendance'); },
      notes: function () { return request('GET', '/student/notes'); },
      notepad: function () { return request('GET', '/student/notepad'); },
      activities: function (query) {
        var q = query || {};
        var params = new URLSearchParams();
        if (q.status) params.set('status', q.status);
        if (q.limit) params.set('limit', q.limit);
        var path = '/student/activities';
        if (params.toString()) path += '?' + params.toString();
        return request('GET', path);
      },
      createActivity: function (body) { return request('POST', '/student/activities', body); },
      deleteAllActivities: function () { return request('DELETE', '/student/activities'); },
      announcements: function () { return request('GET', '/student/announcements'); },
      notifications: function () { return request('GET', '/notifications'); }
    },
    teacher: {
      students: function (query) {
        var q = query || {};
        var params = new URLSearchParams();
        if (q.limit) params.set('limit', q.limit);
        var path = '/teacher/students';
        if (params.toString()) path += '?' + params.toString();
        return request('GET', path);
      },
      getStudentProgress: function (studentId) {
        return request('GET', '/teacher/students/' + encodeURIComponent(studentId) + '/progress');
      },
      getStudentNotepad: function (studentId) {
        return request('GET', '/teacher/students/' + encodeURIComponent(studentId) + '/notepad');
      },
      updateStudentNotepad: function (studentId, body) {
        return request('PUT', '/teacher/students/' + encodeURIComponent(studentId) + '/notepad', body);
      },
      sessions: function (query) {
        var q = query || {};
        var params = new URLSearchParams();
        if (q.forNotes) params.set('forNotes', q.forNotes);
        if (q.upcoming) params.set('upcoming', q.upcoming);
        if (q.limit) params.set('limit', q.limit);
        var path = '/teacher/sessions';
        if (params.toString()) path += '?' + params.toString();
        return request('GET', path);
      },
      createSession: function (body) { return request('POST', '/teacher/sessions', body); },
      updateMeetLink: function (sessionId, body) { return request('PUT', '/teacher/session/' + sessionId + '/meet-link', body); },
      updateSession: function (sessionId, body) { return request('PUT', '/teacher/sessions/' + sessionId, body); }
    },
    notifications: {
      list: function () { return request('GET', '/notifications'); },
      markRead: function (id) { return request('PATCH', '/notifications/' + id + '/read'); },
      markAllRead: function () { return request('PATCH', '/notifications/read-all'); }
    },
    admin: {
      createUser: function (body) { return request('POST', '/admin/users', body); },
      updateUserEmail: function (userId, body) { return request('PATCH', '/admin/users/' + encodeURIComponent(userId) + '/email', body); },
      deleteStudent: function (studentId) { return request('DELETE', '/admin/students/' + encodeURIComponent(studentId)); },
      deleteTeacher: function (teacherId) { return request('DELETE', '/admin/teachers/' + encodeURIComponent(teacherId)); },
      students: function (query) {
        var q = query || {};
        var params = new URLSearchParams();
        if (q.department) params.set('department', q.department);
        if (q.year) params.set('year', q.year);
        if (q.limit) params.set('limit', q.limit);
        var path = '/admin/students';
        if (params.toString()) path += '?' + params.toString();
        return request('GET', path);
      },
      getStudentProgress: function (studentId) {
        return request('GET', '/admin/students/' + encodeURIComponent(studentId) + '/progress');
      },
      teachers: function (query) {
        var q = query || {};
        var params = new URLSearchParams();
        if (q.department) params.set('department', q.department);
        if (q.limit) params.set('limit', q.limit);
        var path = '/admin/teachers';
        if (params.toString()) path += '?' + params.toString();
        return request('GET', path);
      },
      assignMentor: function (studentId, mentorId) {
        return request('POST', '/admin/assign-mentor', { studentId: studentId, mentorId: mentorId });
      },
      syncMentorAssignments: function () {
        return request('POST', '/admin/sync-mentor-assignments');
      },
      activities: function (query) {
        var q = query || {};
        var params = new URLSearchParams();
        if (q.status) params.set('status', q.status);
        if (q.studentId) params.set('studentId', q.studentId);
        if (q.rollNo) params.set('rollNo', q.rollNo);
        if (q.limit) params.set('limit', q.limit);
        var path = '/admin/activities';
        if (params.toString()) path += '?' + params.toString();
        return request('GET', path);
      },
      approveActivity: function (id) { return request('PATCH', '/admin/activities/' + id + '/approve'); },
      rejectActivity: function (id, body) { return request('PATCH', '/admin/activities/' + id + '/reject', body || {}); },
      deleteAllActivities: function (studentId) {
        var path = '/admin/activities';
        if (studentId) path += '?studentId=' + encodeURIComponent(studentId);
        return request('DELETE', path);
      },
      deleteActivity: function (id) { return request('DELETE', '/admin/activities/' + id); },
      deleteSelectedActivities: function (ids) { return request('POST', '/admin/activities/delete-selected', { ids: ids }); },
      getAcademicUpdates: function () { return request('GET', '/academic-updates'); },
      createAcademicUpdate: function (formData) {
        var base = getApiBase();
        var url = base + '/admin/academic-updates';
        var token = getToken();
        var options = { method: 'POST', headers: { Authorization: token ? 'Bearer ' + token : '' } };
        options.body = formData;
        return fetch(url, options).then(function (res) { return res.text().then(function (text) {
          var data = {};
          try { data = text ? JSON.parse(text) : {}; } catch (_) {}
          if (res.status === 401) { clearAuth(); if (typeof window !== 'undefined' && window.location.pathname.indexOf('login') === -1) window.location.href = 'login.html'; return Promise.reject(new Error('Session expired')); }
          if (!res.ok) return Promise.reject(new Error(data.message || 'Request failed (' + res.status + ')'));
          return data;
        }); });
      },
      deleteAcademicUpdate: function (id) { return request('DELETE', '/admin/academic-updates/' + id); }
    },
    counselor: {
      getStudents: function (query) {
        var q = query || {};
        var params = new URLSearchParams();
        if (q.department) params.set('department', q.department);
        if (q.year) params.set('year', q.year);
        if (q.limit) params.set('limit', q.limit);
        var path = '/counselor/students';
        if (params.toString()) path += '?' + params.toString();
        return request('GET', path);
      },
      getStudentDetail: function (studentId) { return request('GET', '/counselor/students/' + encodeURIComponent(studentId)); },
      getStudentNotepad: function (studentId) {
        return request('GET', '/counselor/students/' + encodeURIComponent(studentId) + '/notepad');
      },
      updateStudentNotepad: function (studentId, body) {
        return request('PUT', '/counselor/students/' + encodeURIComponent(studentId) + '/notepad', body);
      },
      updateSessionNotes: function (sessionId, body) { return request('PATCH', '/counselor/sessions/' + encodeURIComponent(sessionId) + '/notes', body); }
    },
    academicUpdates: {
      list: function () { return request('GET', '/academic-updates'); }
    },
    parent: {
      linkedStudents: function () { return request('GET', '/parent/linked-students'); },
      getChildProgress: function () { return request('GET', '/parent/child-progress'); },
      studentSchedule: function (studentId) { return request('GET', '/parent/student/' + encodeURIComponent(studentId) + '/schedule'); },
      studentAttendance: function (studentId) { return request('GET', '/parent/student/' + encodeURIComponent(studentId) + '/attendance'); },
      studentAcademicUpdates: function (studentId) { return request('GET', '/parent/student/' + encodeURIComponent(studentId) + '/academic-updates'); }
    },
    chat: {
      contacts: function () { return request('GET', '/chat/contacts'); },
      conversations: function () { return request('GET', '/chat/conversations'); },
      getOrCreateConversation: function (otherUserId) { return request('POST', '/chat/conversations', { otherUserId: otherUserId }); },
      getConversation: function (conversationId, query) {
        var q = query || {};
        var params = new URLSearchParams();
        if (q.limit) params.set('limit', q.limit);
        if (q.before) params.set('before', q.before);
        var path = '/chat/conversations/' + conversationId;
        if (params.toString()) path += '?' + params.toString();
        return request('GET', path);
      },
      sendMessage: function (conversationId, content) { return request('POST', '/chat/conversations/' + conversationId + '/messages', { content: content }); },
      clearChat: function (conversationId) { return request('DELETE', '/chat/conversations/' + conversationId + '/messages'); },
      markMessageRead: function (messageId) { return request('PATCH', '/chat/messages/' + messageId + '/read'); }
    }
  };
})(typeof window !== 'undefined' ? window : this);
