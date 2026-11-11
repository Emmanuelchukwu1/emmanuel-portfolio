/* ============================================
   Emmanuel Chukwuma — Site Scripts
   Theme toggle, mobile nav, planner, form validation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initPlanner();
  initContactForm();
});

/* ---------- Theme Toggle ---------- */
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (toggle) toggle.textContent = '☀️';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    if (toggle) toggle.textContent = '🌙';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }
}

/* ---------- Mobile Navigation ---------- */
function initMobileNav() {
  const btn = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');

  if (btn && links) {
    btn.addEventListener('click', () => {
      links.classList.toggle('open');
      btn.setAttribute('aria-expanded', links.classList.contains('open'));
    });

    // Close on link click (mobile)
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ---------- Academic Planner ---------- */
function initPlanner() {
  const form = document.getElementById('taskForm');
  const input = document.getElementById('taskInput');
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  const progressFill = document.getElementById('progressFill');
  const statsEl = document.getElementById('taskStats');

  if (!form || !list) return; // not on planner page

  let tasks = JSON.parse(localStorage.getItem('emmanuelTasks') || '[]');

  function save() {
    localStorage.setItem('emmanuelTasks', JSON.stringify(tasks));
  }

  function render() {
    list.innerHTML = '';

    if (tasks.length === 0) {
      if (empty) empty.style.display = 'block';
      if (progressFill) progressFill.style.width = '0%';
      if (statsEl) statsEl.textContent = 'No tasks yet';
      return;
    }

    if (empty) empty.style.display = 'none';

    const completed = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const pct = total ? Math.round((completed / total) * 100) : 0;

    if (progressFill) progressFill.style.width = pct + '%';
    if (statsEl) {
      statsEl.textContent = `${completed} of ${total} completed (${pct}%)`;
    }

    tasks.forEach((task, index) => {
      const item = document.createElement('div');
      item.className = 'task-item' + (task.done ? ' completed' : '');
      item.innerHTML = `
        <button class="task-check" aria-label="Mark as ${task.done ? 'incomplete' : 'complete'}" data-index="${index}">
          ${task.done ? '✓' : ''}
        </button>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <div class="task-actions">
          <button class="btn btn-danger btn-sm" data-delete="${index}" aria-label="Delete task">Delete</button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    tasks.unshift({ text, done: false, id: Date.now() });
    save();
    input.value = '';
    render();
    input.focus();
  });

  list.addEventListener('click', (e) => {
    const checkBtn = e.target.closest('[data-index]');
    const deleteBtn = e.target.closest('[data-delete]');

    if (checkBtn) {
      const i = parseInt(checkBtn.dataset.index, 10);
      tasks[i].done = !tasks[i].done;
      save();
      render();
    }

    if (deleteBtn) {
      const i = parseInt(deleteBtn.dataset.delete, 10);
      tasks.splice(i, 1);
      save();
      render();
    }
  });

  render();
}

/* ---------- Contact Form Validation ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');
  const successMsg = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Reset
    [nameInput, emailInput, phoneInput, messageInput].forEach(el => {
      el.parentElement.classList.remove('invalid');
    });

    // Name
    if (!nameInput.value.trim()) {
      nameInput.parentElement.classList.add('invalid');
      valid = false;
    }

    // Email
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      emailInput.parentElement.classList.add('invalid');
      valid = false;
    }

    // Phone — only digits (and optional spaces/dashes cleaned)
    const phoneVal = phoneInput.value.trim().replace(/[\s\-()]/g, '');
    if (!phoneVal || !/^\d+$/.test(phoneVal)) {
      phoneInput.parentElement.classList.add('invalid');
      valid = false;
    }

    // Message
    if (!messageInput.value.trim()) {
      messageInput.parentElement.classList.add('invalid');
      valid = false;
    }

    if (valid) {
      if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.textContent = 'Thank you. Your message has been received. I will get back to you soon.';
      }
      form.reset();
      // Hide success after a few seconds
      setTimeout(() => {
        if (successMsg) successMsg.style.display = 'none';
      }, 5000);
    }
  });

  // Live clear error on input
  [nameInput, emailInput, phoneInput, messageInput].forEach(el => {
    el.addEventListener('input', () => {
      el.parentElement.classList.remove('invalid');
    });
  });
}
