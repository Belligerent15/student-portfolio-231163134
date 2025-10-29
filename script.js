// script.js — interactions, theme toggle, modal, form handling, project filter

(function(){
  // Utilities
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // Set current year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Theme toggle with persistence
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const preferred = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', preferred === 'dark' ? 'dark' : 'light');
  themeToggle.setAttribute('aria-pressed', preferred === 'dark' ? 'true' : 'false');
  themeToggle.textContent = preferred === 'dark' ? '☀️' : '🌙';

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  // Mobile menu
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileBtn.addEventListener('click', () => {
    const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
    mobileBtn.setAttribute('aria-expanded', !expanded);
    mobileMenu.hidden = expanded;
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if(id.length > 1){
        e.preventDefault();
        const el = document.querySelector(id);
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
        // close mobile menu if open
        if(!mobileMenu.hidden) { mobileMenu.hidden = true; mobileBtn.setAttribute('aria-expanded','false'); }
      }
    });
  });

  // Intersection observer for reveals
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});

  document.querySelectorAll('.card, .highlight-card, .project-card, .testimonial').forEach(node=>{
    node.style.opacity = 0;
    node.style.transform = 'translateY(18px)';
    node.style.transition = 'opacity 520ms ease, transform 520ms ease';
    io.observe(node);
  });

  // Project modal
  const modal = document.getElementById('project-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('project-modal-title');
  const modalDesc = document.getElementById('project-modal-desc');
  const modalLive = document.getElementById('modal-live');
  const modalCode = document.getElementById('modal-code');

  function openModal(data){
    modalImage.src = data.image || '';
    modalImage.alt = data.title || 'Project image';
    modalTitle.textContent = data.title || '';
    modalDesc.textContent = data.description || '';
    // Set defaults; replace with real links if available in your project objects
    modalLive.href = data.live || '#';
    modalCode.href = data.code || '#';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    // focus management
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn && closeBtn.focus();
  }

  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.view-project').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const data = JSON.parse(btn.getAttribute('data-project'));
      openModal(data);
    });
  });

  modal.addEventListener('click', (e)=>{
    const close = e.target.closest('[data-close]');
    if(close) closeModal();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Project filter
  const filter = document.getElementById('project-filter');
  const projectGrid = document.getElementById('projects-grid');
  filter.addEventListener('change', () => {
    const val = filter.value;
    const cards = projectGrid.querySelectorAll('.project-card');
    cards.forEach(card=>{
      const type = card.getAttribute('data-type');
      if(val === 'all' || type === val){
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Contact form basic client validation + copy email
  const contactForm = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('brilliant@example.com');
      copyBtn.textContent = 'Copied!';
      setTimeout(()=>copyBtn.textContent = 'Copy email', 2000);
    } catch(e){
      copyBtn.textContent = 'brilliant@example.com';
    }
  });

  contactForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    status.textContent = 'Sending…';
    const formData = new FormData(contactForm);
    // Basic client validation
    const name = formData.get('name');
    const email = formData.get('email');
    const msg = formData.get('message');
    if(!name || !email || !msg){
      status.textContent = 'Please fill the required fields.';
      return;
    }

    // Submit to Formspree or similar - update action attribute with your endpoint
    try {
      const resp = await fetch(contactForm.action, {
        method: contactForm.method,
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      if(resp.ok){
        status.textContent = 'Thanks — I will reply shortly.';
        contactForm.reset();
      } else {
        const data = await resp.json();
        status.textContent = data.error || 'Submission failed. Please email directly.';
      }
    } catch (err) {
      status.textContent = 'Network error. Please try again or email directly.';
    }
  });

  // Accessibility: focus trap when modal open (lightweight)
  document.addEventListener('focus', (event) => {
    if(!modal.classList.contains('open')) return;
    if(!modal.contains(event.target)){
      event.stopPropagation();
      modal.querySelector('.modal-close').focus();
    }
  }, true);

})();
