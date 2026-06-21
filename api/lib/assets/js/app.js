/* ═══════════════════════════════════════════
   LodgeKonnect v2 — Shared Utilities
   API base updated for Vercel deployment
═══════════════════════════════════════════ */

const API = {
  // ↓ Replace this with your actual Vercel deployment URL after deploying
  // e.g. 'https://lodgekonnect.vercel.app/api'
  base: 'https://lodgekonnect.vercel.app/api',

  token: () => localStorage.getItem('lk_token'),

  headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token()}`
    };
  },

  async get(endpoint, params = {}) {
    // Strip .php extension if still used anywhere in HTML pages
    const clean = endpoint.replace(/\.php$/, '');
    const url = new URL(this.base + clean, location.href);
    Object.entries(params).forEach(([k, v]) => v !== '' && url.searchParams.set(k, v));
    const res = await fetch(url, { headers: this.headers() });
    return res.json();
  },

  async post(endpoint, body) {
    const clean = endpoint.replace(/\.php$/, '');
    const res = await fetch(this.base + clean, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async postForm(endpoint, formData) {
    const clean = endpoint.replace(/\.php$/, '');
    const res = await fetch(this.base + clean, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token()}` },
      body: formData
    });
    return res.json();
  }
};

// ── Auth helpers ───────────────────────────────────────────
const Auth = {
  set(data) {
    localStorage.setItem('lk_token',    data.token);
    localStorage.setItem('lk_user_id',  data.user_id);
    localStorage.setItem('lk_name',     data.user_name);
    localStorage.setItem('lk_type',     data.user_type);
    localStorage.setItem('lk_email',    data.user_email || '');
    localStorage.setItem('lk_phone',    data.user_phone || '');
    localStorage.setItem('lk_gender',   data.user_gender || '');
    localStorage.setItem('lk_dept',     data.user_dept || '');
    localStorage.setItem('lk_level',    data.user_level || '');
    localStorage.setItem('lk_avatar',   data.profile_image || '');
  },
  get(key) { return localStorage.getItem('lk_' + key); },
  clear()  { ['token','user_id','name','type','email','phone','gender','dept','level','avatar'].forEach(k => localStorage.removeItem('lk_' + k)); },
  async verify() {
    const token = this.get('token');
    if (!token) return false;
    try {
      const data = await API.post('/verify', { token });
      return data.valid;
    } catch { return false; }
  },
  async logout() {
    await API.post('/logout', { token: this.get('token') }).catch(() => {});
    this.clear();
    location.href = 'login.html';
  }
};

// ── Toast ──────────────────────────────────────────────────
function toast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    el.addEventListener('animationend', () => el.remove());
  }, duration);
}

// ── Modal ──────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

// ── Lightbox ───────────────────────────────────────────────
let lbImages = [], lbIdx = 0;
function openLightbox(images, idx = 0) {
  lbImages = images; lbIdx = idx;
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.querySelector('img').src = images[idx];
  lb.classList.add('open');
}
function lbNav(dir) {
  lbIdx = (lbIdx + dir + lbImages.length) % lbImages.length;
  document.querySelector('#lightbox img').src = lbImages[lbIdx];
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lightbox')?.addEventListener('click', e => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
});
function closeLightbox() { document.getElementById('lightbox')?.classList.remove('open'); }

// ── Formatters ─────────────────────────────────────────────
const fmt = {
  currency: n => '₦' + Number(n).toLocaleString('en-NG'),
  date: s => new Date(s).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }),
  ago: s => {
    const diff = Date.now() - new Date(s);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  },
  initials: name => name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?'
};

// ── Avatar helper ──────────────────────────────────────────
function avatarEl(name, imgSrc, cls = '') {
  if (imgSrc) return `<img src="${imgSrc}" class="avatar ${cls}" alt="${name}">`;
  return `<div class="avatar ${cls}">${fmt.initials(name)}</div>`;
}

// ── Upload zone ────────────────────────────────────────────
function initUploadZone(zoneId, inputId, previewId) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); input.files = e.dataTransfer.files; renderPreviews(); });
  input.addEventListener('change', renderPreviews);

  function renderPreviews() {
    if (!preview) return;
    preview.innerHTML = '';
    Array.from(input.files).forEach((file, i) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'upload-preview';
        div.innerHTML = `<img src="${e.target.result}" alt="Preview ${i+1}">
          <button class="remove-photo" onclick="removePhoto(${i})"><i class="fas fa-times"></i></button>`;
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  }
}

// ── Debounce ───────────────────────────────────────────────
function debounce(fn, ms = 350) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Loader helper ──────────────────────────────────────────
function showLoader(container, msg = 'Loading...') {
  container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div><span>${msg}</span></div>`;
}
