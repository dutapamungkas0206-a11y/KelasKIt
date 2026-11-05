(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const items = [...document.querySelectorAll('#faqList details')];

  $('#faqSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    let n = 0;
    items.forEach(d => {
      const ok = !q || d.textContent.toLowerCase().includes(q);
      d.hidden = !ok; if (ok) n++;
      if (q && ok) d.open = true;
    });
    $('#faqEmpty').hidden = n > 0;
  });
  $('#faqSearchForm').addEventListener('submit', e => e.preventDefault());

  const form = $('#contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements, errs = {};
    if (f.cname.value.trim().length < 3) errs.cname = 'Nama minimal 3 huruf.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.cemail.value.trim())) errs.cemail = 'Masukkan email yang valid.';
    if (f.cmsg.value.trim().length < 10) errs.cmsg = 'Pesan minimal 10 karakter.';
    form.querySelectorAll('.err').forEach(el => { el.textContent = errs[el.dataset.for] || ''; });
    const msg = $('#contactMsg');
    msg.classList.toggle('ok', !Object.keys(errs).length);
    if (Object.keys(errs).length) { msg.textContent = ''; return; }
    msg.textContent = 'Pesan terkirim. Pengelola akan membalas lewat email.';
    form.reset();
  });
})();
