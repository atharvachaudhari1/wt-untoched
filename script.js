(function () {
  'use strict';

  // ----- Auth check: redirect to login if no token -----
  if (typeof ECS_API !== 'undefined' && !ECS_API.isLoggedIn()) {
    window.location.href = 'login.html';
    throw new Error('Redirecting to login');
  }

  var user = typeof ECS_API !== 'undefined' ? ECS_API.getUser() : null;
  var navUserName = document.getElementById('nav-user-name');
  if (navUserName && user && user.name) {
    navUserName.textContent = user.name;
  }

  // ----- Logout -----
  var btnLogout = document.getElementById('btn-logout');
  if (btnLogout && typeof ECS_API !== 'undefined') {
    btnLogout.addEventListener('click', function (e) {
      e.preventDefault();
      ECS_API.clearAuth();
      window.location.href = 'login.html';
    });
  }

  // ----- Sidebar: active page -----
  var navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-page]');
  function setActive(el) {
    navItems.forEach(function (item) { item.classList.remove('active'); });
    if (el) el.classList.add('active');
  }
  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      setActive(item);
    });
  });

  // ----- Load student dashboard and populate UI -----
  function mentorName(session) {
    if (!session || !session.teacher) return '—';
    var t = session.teacher;
    if (t.user && t.user.name) return t.user.name;
    if (t.department) return t.department;
    return 'Mentor';
  }

  function renderCards(sessions) {
    var cards = document.querySelectorAll('#cards-row .mentor-card');
    var tags = ['Design', 'Business', 'Programming'];
    (sessions || []).slice(0, 3).forEach(function (session, i) {
      var card = cards[i];
      if (!card) return;
      card.setAttribute('data-session-id', session._id || '');
      var tag = card.querySelector('.card-tag');
      var title = card.querySelector('.card-title');
      var progressBar = card.querySelector('.progress-bar');
      var progressText = card.querySelector('.progress-text');
      var avatars = card.querySelector('.card-avatars');
      var btn = card.querySelector('.btn-continue');
          if (tag) tag.textContent = tags[i] || 'Session';
      if (title) title.textContent = session.title || 'Session';
      if (progressBar) progressBar.style.setProperty('--progress', '50%');
      if (progressText) progressText.textContent = session.duration ? session.duration + ' min' : '—';
      if (avatars) {
        avatars.innerHTML = '<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=' + (session._id || i) + '" alt="Mentor" width="32" height="32">';
      }
      if (btn) {
        btn.setAttribute('data-session-id', session._id || '');
        btn.textContent = 'Continue';
      }
    });
    for (var j = (sessions || []).length; j < 3; j++) {
      var c = cards[j];
      if (!c) continue;
      c.setAttribute('data-session-id', '');
      var t = c.querySelector('.card-title');
      if (t) t.textContent = 'No upcoming session';
      var b = c.querySelector('.btn-continue');
      if (b) { b.setAttribute('data-session-id', ''); b.textContent = 'View sessions'; }
    }
  }

  function renderSessionsTable(sessions) {
    var tbody = document.getElementById('sessions-tbody');
    if (!tbody) return;
    if (!sessions || sessions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-muted">No upcoming sessions.</td></tr>';
      return;
    }
    tbody.innerHTML = sessions.map(function (s) {
      return '<tr><td>' + (s.title || '—') + '</td><td>' + mentorName(s) + '</td><td>' + (s.duration ? s.duration + ' min' : '—') + '</td></tr>';
    }).join('');
  }

  function loadDashboard() {
    if (typeof ECS_API === 'undefined') return;
    if (user && user.role !== 'student') {
      renderCards([]);
      renderSessionsTable([]);
      var tbody = document.getElementById('sessions-tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="3" class="text-muted">This dashboard is for students. You are logged in as ' + (user.role || 'user') + '.</td></tr>';
      return;
    }
    ECS_API.student.dashboard()
      .then(function (data) {
        if (data.upcomingSessions) {
          renderCards(data.upcomingSessions);
          renderSessionsTable(data.upcomingSessions);
        } else if (data.sessions) {
          renderCards(data.sessions);
          renderSessionsTable(data.sessions);
        } else {
          renderCards([]);
          renderSessionsTable([]);
        }
      })
      .catch(function () {
        renderCards([]);
        renderSessionsTable([]);
        var tbody = document.getElementById('sessions-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="3" class="text-muted">Could not load sessions. Check backend and login as student.</td></tr>';
      });
  }

  loadDashboard();

  // ----- Continue: open Meet link for session -----
  document.querySelectorAll('.btn-continue').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-session-id');
      if (!id || typeof ECS_API === 'undefined') return;
      btn.textContent = 'Opening...';
      ECS_API.student.meetLink(id)
        .then(function (data) {
          if (data.meetLink) window.open(data.meetLink, '_blank');
          btn.textContent = 'Continue';
        })
        .catch(function () { btn.textContent = 'Continue'; });
    });
  });

  // ----- CTA button -----
  var ctaBtn = document.querySelector('.btn-cta');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', function () {
      ctaBtn.textContent = 'Finding...';
      setTimeout(function () { ctaBtn.textContent = 'Find my mentor'; }, 800);
    });
  }

  // ----- Search -----
  var searchInput = document.querySelector('.search-input');
  if (searchInput) {
    var placeholder = searchInput.getAttribute('placeholder');
    searchInput.addEventListener('focus', function () {
      searchInput.setAttribute('data-placeholder', placeholder);
      searchInput.setAttribute('placeholder', '');
    });
    searchInput.addEventListener('blur', function () {
      searchInput.setAttribute('placeholder', searchInput.getAttribute('data-placeholder') || placeholder);
    });
  }

  // ----- Notifications: fetch and show unread count -----
  var notifyBtn = document.getElementById('btn-notify');
  var notifyDot = document.getElementById('notify-dot');
  if (typeof ECS_API !== 'undefined' && notifyDot) {
    ECS_API.student.notifications().then(function (data) {
      var unread = (data.notifications || []).filter(function (n) { return !n.read; });
      notifyDot.style.visibility = unread.length > 0 ? 'visible' : 'hidden';
    }).catch(function () {});
  }
  if (notifyBtn) {
    notifyBtn.addEventListener('click', function () {
      notifyBtn.classList.toggle('notify-open');
      if (notifyDot) notifyDot.style.visibility = notifyBtn.classList.contains('notify-open') ? 'hidden' : 'visible';
    });
  }
})();
