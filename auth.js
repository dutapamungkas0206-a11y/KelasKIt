(() => {
  'use strict';
  /* CATATAN: ini simulasi di browser (localStorage). Untuk produksi, pakai backend + database sungguhan. */
  const $ = (s) => document.querySelector(s);
  const read = () => { try { return JSON.parse(localStorage.getItem('kk-users') || '[]'); } catch { return []; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  /* Akun admin bawaan (untuk simulasi). GANTI email dan sandi ini sebelum dipakai sungguhan. */
  const ADMIN = { name: 'Admin KelasKit', email: 'admin@kelaskit.example', pass: 'admin12345' };
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  async function hash(text) {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (const c of text) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return 'x' + h;
  }

  function setErrors(form, errs) {
    form.querySelectorAll('.err').forEach(el => { el.textContent = errs[el.dataset.for] || ''; });
    [...form.elements].forEach(el => { if (el.name) el.setAttribute('aria-invalid', !!errs[el.name]); });
    const first = Object.keys(errs)[0];
    if (first && form.elements[first]) form.elements[first].focus();
    return Object.keys(errs).length === 0;
  }
  function message(text, ok) {
    const m = $('#formMsg'); m.textContent = text; m.classList.toggle('ok', !!ok);
  }

  document.querySelectorAll('.pw-toggle').forEach(b => b.addEventListener('click', () => {
    const inp = document.getElementById(b.dataset.target);
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.textContent = show ? 'Sembunyikan' : 'Tampilkan';
  }));

  /* Akun guru contoh (untuk simulasi). Ganti atau hapus sebelum dipakai sungguhan. */
  const GURU = { name: 'Guru Contoh', email: 'guru@kelaskit.example', pass: 'guru12345', kelas: 'Matematika' };
  async function seedAccounts() {
    const users = read();
    let changed = false;
    for (const a of [{ ...ADMIN, kelas: '-', role: 'admin' }, { ...GURU, role: 'guru' }]) {
      if (users.some(u => u.email === a.email)) continue;
      users.push({ name: a.name, email: a.email, kelas: a.kelas, role: a.role, pass: await hash(a.pass) });
      changed = true;
    }
    if (changed) save('kk-users', users);
  }
  const ready = seedAccounts();

  const login = $('#loginForm');
  if (login) login.addEventListener('submit', async e => {
    e.preventDefault();
    const f = login.elements, email = f.email.value.trim().toLowerCase(), pass = f.password.value;
    const errs = {};
    if (!emailOk(email)) errs.email = 'Masukkan email yang valid.';
    if (!pass) errs.password = 'Kata sandi wajib diisi.';
    if (!setErrors(login, errs)) return;
    await ready;
    const user = read().find(u => u.email === email);
    if (!user || user.pass !== await hash(pass)) { message('Email atau kata sandi salah.'); return; }
    const role = user.role || 'siswa';
    save('kk-session', { name: user.name, email: user.email, kelas: user.kelas || '', role });
    message('Berhasil masuk. Mengalihkan...', true);
    setTimeout(() => { location.href = role === 'admin' ? 'admin.html' : 'katalog.html'; }, 700);
  });

  const reg = $('#registerForm');
  if (reg) reg.addEventListener('submit', async e => {
    e.preventDefault();
    const f = reg.elements;
    const v = { name: f.fullname.value.trim(), email: f.email.value.trim().toLowerCase(), kelas: f.kelas.value.trim(), pass: f.password.value };
    const errs = {};
    if (v.name.length < 3) errs.fullname = 'Nama lengkap minimal 3 huruf.';
    if (!emailOk(v.email)) errs.email = 'Masukkan email yang valid.';
    const role = f.role.value === 'guru' ? 'guru' : 'siswa';
    if (!v.kelas) errs.kelas = role === 'guru' ? 'Mata pelajaran wajib diisi.' : 'Kelas wajib diisi.';
    if (v.pass.length < 8) errs.password = 'Kata sandi minimal 8 karakter.';
    if (f.confirm.value !== v.pass) errs.confirm = 'Kata sandi tidak sama.';
    if (!f.terms.checked) errs.terms = 'Centang persetujuan untuk melanjutkan.';
    if (!setErrors(reg, errs)) return;
    await ready;
    const users = read();
    if (users.some(u => u.email === v.email)) { setErrors(reg, { email: 'Email ini sudah terdaftar. Silakan masuk.' }); return; }
    users.push({ name: v.name, email: v.email, kelas: v.kelas, role, pass: await hash(v.pass) });
    if (!save('kk-users', users)) { message('Gagal menyimpan akun. Pastikan penyimpanan browser aktif.'); return; }
    save('kk-session', { name: v.name, email: v.email, kelas: v.kelas, role });
    message('Akun berhasil dibuat. Mengalihkan...', true);
    setTimeout(() => { location.href = 'katalog.html'; }, 900);
  });
  /* Ubah label kolom sesuai pilihan Siswa / Guru */
  document.querySelectorAll('input[name=role]').forEach(r => r.addEventListener('change', () => {
    const guru = r.value === 'guru';
    $('#kelasLabel').textContent = guru ? 'Mata pelajaran' : 'Kelas';
    $('#kelas').placeholder = guru ? 'Contoh: Matematika' : 'Contoh: XI IPA 2';
  }));
})();
