(() => {
  'use strict';

  const ICONS = {
    box: '<svg viewBox="0 0 24 24"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Zm0 9L4 7.5M12 12l8-4.5M12 12v9"/></svg>',
    monitor: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    laptop: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2.5 19h19"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l1.5-2.5h7L17 8h3v11H4V8Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" style="fill:currentColor;stroke-width:1"><path d="M14 3c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6ZM6.5 14c.4 2.5 1.2 3.3 3.5 3.7-2.3.4-3.1 1.2-3.5 3.6-.4-2.4-1.2-3.2-3.5-3.6 2.3-.4 3.1-1.2 3.5-3.700Z"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M8 17h8"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10Z"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>'
  };

  const CATEGORIES = [
    { id: 'elektronik', label: 'Elektronik', count: 18, icon: 'monitor' },
    { id: 'multimedia', label: 'Multimedia', count: 12, icon: 'camera' },
    { id: 'alat-tulis', label: 'Alat Tulis', count: 10, icon: 'book' },
    { id: 'perlengkapan', label: 'Perlengkapan', count: 8, icon: 'sparkle' }
  ];

  const THEME = {
    'elektronik': { bg: '#e8ebfa', fg: '#4f6bbf' },
    'multimedia': { bg: '#f7e8de', fg: '#b4623c' },
    'alat-tulis': { bg: '#efe9fa', fg: '#7a5bb8' },
    'perlengkapan': { bg: '#e1f3eb', fg: '#2f8a68' }
  };

  /* Ubah / tambah barang di sini. Opsional: img: 'images/foto.jpg' */
  const ITEMS = [
    { name: 'Proyektor Epson EB-X06', cat: 'elektronik', icon: 'monitor', stock: 4, days: 3 },
    { name: 'Laptop ASUS ExpertBook', cat: 'elektronik', icon: 'laptop', stock: 6, days: 3, bg: '#dfeefa', fg: '#3f72bd' },
    { name: 'Kamera Canon EOS 1500D', cat: 'multimedia', icon: 'camera', stock: 2, days: 3 },
    { name: 'Speaker Portable JBL', cat: 'perlengkapan', icon: 'sparkle', stock: 8, days: 3 },
    { name: 'Tripod Kamera Velbon', cat: 'multimedia', icon: 'camera', stock: 5, days: 2 },
    { name: 'Mikrofon Wireless', cat: 'multimedia', icon: 'sparkle', stock: 3, days: 2 },
    { name: 'Kabel HDMI 10 Meter', cat: 'elektronik', icon: 'monitor', stock: 1, days: 3 },
    { name: 'Kabel Roll 15 Meter', cat: 'perlengkapan', icon: 'sparkle', stock: 7, days: 3 },
    { name: 'Penghapus Papan Tulis', cat: 'alat-tulis', icon: 'book', stock: 12, days: 5 },
    { name: 'Spidol Whiteboard Set', cat: 'alat-tulis', icon: 'book', stock: 15, days: 5 },
    { name: 'Penggaris Papan Tulis 100 cm', cat: 'alat-tulis', icon: 'book', stock: 6, days: 5 },
    { name: 'Proyektor Sanyo XE-30', cat: 'elektronik', icon: 'monitor', stock: 0, days: 3 }
  ];

  /* ---------- Data pengajuan (tersimpan di browser) ---------- */
  const readLoans = () => { try { return JSON.parse(localStorage.getItem('kk-loans') || '[]'); } catch { return []; } };
  const writeLoans = (l) => { try { localStorage.setItem('kk-loans', JSON.stringify(l)); return true; } catch { return false; } };
  const getSession = () => { try { return JSON.parse(localStorage.getItem('kk-session') || 'null'); } catch { return null; } };
  /* stok tersedia = stok total - barang yang sedang dipinjam (status "disetujui") */
  const applyStock = () => {
    const loans = readLoans();
    ITEMS.forEach(i => {
      if (i.total === undefined) i.total = i.stock;
      const out = loans.filter(x => x.item === i.name && x.status === 'disetujui').reduce((n, x) => n + x.qty, 0);
      i.stock = Math.max(0, i.total - out);
    });
  };
  applyStock();

  const theme = (i) => (i.bg ? i : THEME[i.cat]);
  const catLabel = (id) => CATEGORIES.find(c => c.id === id).label;

  /* ---------- Favorit (tersimpan di browser) ---------- */
  let favs;
  try { favs = new Set(JSON.parse(localStorage.getItem('kk-favs') || '[]')); } catch { favs = new Set(); }
  const saveFavs = () => { try { localStorage.setItem('kk-favs', JSON.stringify([...favs])); } catch {} };

  /* ---------- Kartu barang ---------- */
  function cardHTML(i) {
    const th = theme(i), fav = favs.has(i.name);
    const out = i.stock === 0, low = i.stock > 0 && i.stock <= 2;
    const media = i.img
      ? `<img src="${i.img}" alt="${i.name}" data-icon="${i.icon}" loading="lazy">`
      : `<div class="card__ring">${ICONS[i.icon]}</div>`;
    return `
    <article class="card">
      <div class="card__img" style="background:${th.bg};color:${th.fg}">
        ${media}
        <button type="button" class="fav ${fav ? 'on' : ''}" data-fav="${i.name}" aria-label="Simpan ${i.name}" aria-pressed="${fav}">${ICONS.heart}</button>
      </div>
      <div class="card__body">
        <span class="card__cat">${catLabel(i.cat)}</span>
        <h4>${i.name}</h4>
        <div class="stock ${out ? 'out' : low ? 'low' : ''}"><i></i>${out ? 'Sedang dipinjam' : i.stock + ' unit tersedia'}</div>
        <div class="max">${ICONS.clock}Maks. ${i.days} hari</div>
        <button type="button" class="btn-detail" data-item="${i.name}">Lihat Detail ${ICONS.chevron}</button>
      </div>
    </article>`;
  }

  /* Jika file foto tidak ditemukan, tampilkan ikon sebagai cadangan */
  document.addEventListener('error', e => {
    const im = e.target;
    if (im.tagName === 'IMG' && im.dataset.icon) im.outerHTML = `<div class="card__ring">${ICONS[im.dataset.icon]}</div>`;
  }, true);

  /* ---------- Dialog detail + form peminjaman ---------- */
  const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const fmtDate = (s) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  function getDialog() {
    let d = document.getElementById('detail');
    if (d) return d;
    d = document.createElement('dialog');
    d.id = 'detail'; d.className = 'modal';
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('input', e => {
      if (e.target.name === 'start') { const end = d.querySelector('[name=end]'); end.min = e.target.value || todayISO(); }
    });
    d.addEventListener('submit', e => {
      e.preventDefault();
      const item = ITEMS.find(x => x.name === d.dataset.item);
      const fd = new FormData(e.target);
      const s = fd.get('start'), en = fd.get('end'), q = +fd.get('qty');
      const err = !s || !en ? 'Pilih tanggal pinjam dan tanggal kembali.'
        : en < s ? 'Tanggal kembali tidak boleh sebelum tanggal pinjam.'
        : (new Date(en) - new Date(s)) / 864e5 > item.days ? `Lama peminjaman maksimal ${item.days} hari.`
        : !(q >= 1 && q <= item.stock) ? `Jumlah unit harus antara 1 dan ${item.stock}.` : '';
      d.querySelector('#formMsg').textContent = err;
      if (err) return;
      const me = getSession();
      if (!me) { d.querySelector('#formMsg').innerHTML = 'Silakan <a href="masuk.html"><b>masuk</b></a> dulu untuk mengajukan peminjaman.'; return; }
      const loans = readLoans();
      loans.push({
        id: 'P' + Date.now(), item: item.name, qty: q, start: s, end: en,
        note: String(fd.get('note') || '').trim(),
        user: { name: me.name, email: me.email, kelas: me.kelas || '', role: me.role || 'siswa' },
        status: 'menunggu', created: new Date().toISOString()
      });
      if (!writeLoans(loans)) { d.querySelector('#formMsg').textContent = 'Gagal menyimpan pengajuan. Pastikan penyimpanan browser aktif.'; return; }
      d.querySelector('.modal__box').innerHTML = `
        <div class="modal__done"><span class="step__icon">${ICONS.check}</span>
        <h3>Permintaan terkirim</h3>
        <p>Pengajuan ${item.name} (${q} unit), ${fmtDate(s)} sampai ${fmtDate(en)}, menunggu persetujuan pengelola.</p>
        <button type="button" class="btn btn--primary btn--block" data-close>Selesai</button></div>`;
    });
    return d;
  }

  function openDetail(item) {
    const d = getDialog(), th = theme(item), t = todayISO(), out = item.stock === 0;
    d.dataset.item = item.name;
    d.innerHTML = `
    <form class="modal__box" novalidate>
      <button type="button" class="modal__x" data-close aria-label="Tutup">&times;</button>
      <div class="modal__top" style="background:${th.bg};color:${th.fg}">${item.img ? `<img src="${item.img}" alt="${item.name}">` : ICONS[item.icon]}</div>
      <span class="card__cat">${catLabel(item.cat)}</span>
      <h3>${item.name}</h3>
      <p class="modal__meta">${out ? 'Sedang dipinjam' : item.stock + ' unit tersedia'} &middot; Maks. ${item.days} hari</p>
      <div class="fields">
        <label>Tanggal pinjam<input type="date" name="start" min="${t}" ${out ? 'disabled' : ''}></label>
        <label>Tanggal kembali<input type="date" name="end" min="${t}" ${out ? 'disabled' : ''}></label>
        <label>Jumlah unit<input type="number" name="qty" min="1" max="${item.stock}" value="1" ${out ? 'disabled' : ''}></label>
        <label class="full">Keperluan<textarea name="note" rows="2" placeholder="Contoh: presentasi kelompok pelajaran IPA" ${out ? 'disabled' : ''}></textarea></label>
      </div>
      <p class="form-msg" id="formMsg" role="alert">${out ? 'Barang ini sedang dipinjam. Coba lagi nanti.' : ''}</p>
      <button type="submit" class="btn btn--primary btn--block" ${out ? 'disabled' : ''}>Ajukan Peminjaman</button>
    </form>`;
    d.showModal();
  }

  document.addEventListener('click', e => {
    const f = e.target.closest('.fav');
    if (f) {
      const n = f.dataset.fav;
      favs.has(n) ? favs.delete(n) : favs.add(n);
      f.classList.toggle('on', favs.has(n)); f.setAttribute('aria-pressed', favs.has(n));
      saveFavs(); return;
    }
    const b = e.target.closest('[data-item]');
    if (b && b.tagName === 'BUTTON') { const it = ITEMS.find(x => x.name === b.dataset.item); if (it) openDetail(it); }
  });

  /* ---------- Navigasi & footer ---------- */
  const toggle = document.getElementById('navToggle'), menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', menu.classList.toggle('open')));
    menu.addEventListener('click', e => {
      if (e.target.tagName === 'A') { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', false); }
    });
  }
  /* Jika sudah masuk: tampilkan nama dan tombol Keluar */
  let user = null;
  try { user = JSON.parse(localStorage.getItem('kk-session') || 'null'); } catch {}
  const liLogin = document.getElementById('navLogin'), liReg = document.getElementById('navRegister');
  if (user && user.name && liLogin && liReg) {
    liLogin.textContent = 'Halo, ' + user.name.split(' ')[0];
    liLogin.removeAttribute('href');
    if (user.role === 'admin') { liLogin.textContent = 'Panel Admin'; liLogin.href = 'admin.html'; }
    liReg.textContent = 'Keluar'; liReg.href = '#';
    liReg.addEventListener('click', e => {
      e.preventDefault();
      try { localStorage.removeItem('kk-session'); } catch {}
      location.href = 'index.html';
    });
  }
  /* ---------- Notifikasi pengajuan untuk siswa ---------- */
  const myUnread = () => {
    const me = getSession();
    if (!me || me.role === 'admin') return [];
    return readLoans().filter(l => l.user && l.user.email === me.email && l.unread);
  };
  let navMine = null;
  function refreshBadge() {
    const me = getSession(), log = document.getElementById('navLogin');
    if (!me || me.role === 'admin' || !log) return;
    if (!navMine) {
      navMine = document.createElement('a');
      navMine.href = 'pengajuan-saya.html'; navMine.id = 'navMine';
      if (location.pathname.endsWith('pengajuan-saya.html')) navMine.classList.add('is-active');
      log.parentNode.insertBefore(navMine, log);
    }
    const n = myUnread().length;
    navMine.innerHTML = 'Pengajuan Saya' + (n ? ` <span class="nav-badge" aria-label="${n} pembaruan baru">${n}</span>` : '');
  }
  function showToast() {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const un = myUnread();
    if (!un.length || location.pathname.endsWith('pengajuan-saya.html')) return;
    const sig = un.map(l => l.id + l.status).join(',');
    try { if (sessionStorage.getItem('kk-toast') === sig) return; sessionStorage.setItem('kk-toast', sig); } catch {}
    const one = un.length === 1 ? un[0] : null;
    const t = document.createElement('div');
    t.className = 'toast' + (one && one.status === 'ditolak' ? ' toast--no' : '');
    t.setAttribute('role', 'status');
    t.innerHTML = '<div><strong></strong><a href="pengajuan-saya.html">Lihat detail</a></div><button type="button" aria-label="Tutup">&times;</button>';
    t.querySelector('strong').textContent = one
      ? `Pengajuan ${one.item} ${one.status === 'disetujui' ? 'disetujui' : 'ditolak'}.`
      : `${un.length} pembaruan baru pada pengajuanmu.`;
    t.querySelector('button').addEventListener('click', () => t.remove());
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 9000);
  }
  refreshBadge(); showToast();
  window.addEventListener('storage', e => { if (e.key === 'kk-loans' || e.key === 'kk-session') { refreshBadge(); showToast(); } });

  const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

  window.KK = { ICONS, CATEGORIES, ITEMS, cardHTML, catLabel, readLoans, writeLoans, getSession, applyStock, refreshBadge };
})();
