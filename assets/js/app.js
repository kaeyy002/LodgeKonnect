const API = {
  base: 'https://lodgekonnect.vercel.app/api',
  token: () => localStorage.getItem('lk_token'),
  headers() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token()}` }; },
  async get(endpoint, params = {}) { const clean = endpoint.replace(/\.php$/, ''); const url = new URL(this.base + clean, location.href); Object.entries(params).forEach(([k, v]) => v !== '' && url.searchParams.set(k, v)); const res = await fetch(url, { headers: this.headers() }); return res.json(); },
  async post(endpoint, body) { const clean = endpoint.replace(/\.php$/, ''); const res = await fetch(this.base + clean, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) }); return res.json(); },
  async postForm(endpoint, formData) { const clean = endpoint.replace(/\.php$/, ''); const res = await fetch(this.base + clean, { method: 'POST', headers: { 'Authorization': `Bearer ${this.token()}` }, body: formData }); return res.json(); }
};
const Auth = {
  set(data) { localStorage.setItem('lk_token', data.token); localStorage.setItem('lk_user_id', data.user_id); localStorage.setItem('lk_name', data.user_name); localStorage.setItem('lk_type', data.user_type); localStorage.setItem('lk_email', data.user_email || ''); localStorage.setItem('lk_phone', data.user_phone || ''); localStorage.setItem('lk_gender', data.user_gender || ''); localStorage.setItem('lk_dept', data.user_dept || ''); localStorage.setItem('lk_level', data.user_level || ''); localStorage.setItem('lk_avatar', data.profile_image || ''); },
  get(key) { return localStorage.getItem('lk_' + key); },
  clear() { ['token','user_id','name','type','email','phone','gender','dept','level','avatar'].forEach(k => localStorage.removeItem('lk_' + k)); },
  async verify() { const token = this.get('token'); if (!token) return false; try { const data = await API.post('/verify', { token }); return data.valid; } catch { return false; } },
  async logout() { await API.post('/logout', { token: this.get('token') }).catch(() => {}); this.clear(); location.href = 'login.html'; }
};
function toast(message, type = 'info', duration = 3500) { let container = document.getElementById('toast-container'); if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); } const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' }; const el = document.createElement('div'); el.className = `toast ${type}`; el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`; container.appendChild(el); setTimeout(() => { el.classList.add('hide'); el.addEventListener('animationend', () => el.remove()); }, duration); }
function openModal(id) { document.getElementById(id)?.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow = ''; }
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) { e.target.classList.remove('open'); document.body.style.overflow = ''; } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); document.body.style.overflow = ''; } });
let lbImages = [], lbIdx = 0;
function openLightbox(images, idx = 0) { lbImages = images; lbIdx = idx; const lb = document.getElementById('lightbox'); if (!lb) return; lb.querySelector('img').src = images[idx]; lb.classList.add('open'); }
function lbNav(dir) { lbIdx = (lbIdx + dir + lbImages.length) % lbImages.length; document.querySelector('#lightbox img').src = lbImages[lbIdx]; }
function closeLightbox() { document.getElementById('lightbox')?.classList.remove('open'); }
document.addEventListener('DOMContentLoaded', () => { document.getElementById('lightbox')?.addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); }); });
const fmt = {
  currency: n => '₦' + Number(n).toLocaleString('en-NG'),
  date: s => new Date(s).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }),
  ago: s => { const diff = Date.now() - new Date(s); const mins = Math.floor(diff/60000); if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins/60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs/24)}d ago`; },
  initials: name => name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?'
};
function avatarEl(name, imgSrc, cls = '') { if (imgSrc) return `<img src="${imgSrc}" class="avatar ${cls}" alt="${name}">`; return `<div class="avatar ${cls}">${fmt.initials(name)}</div>`; }
function debounce(fn, ms = 350) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }
function showLoader(container, msg = 'Loading...') { container.innerHTML = `<div class="loading-overlay"><div class="spinner"></div><span>${msg}</span></div>`; }
