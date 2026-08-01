document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuBtn = document.getElementById('menuBtn');
  const navList = document.getElementById('navList');
  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => navList.classList.toggle('open'));
    navList.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navList.classList.remove('open'))
    );
  }

  // Mark the nav link matching the current page as active
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
});

function scrollGallery(dir) {
  const g = document.getElementById('gallery');
  if (!g) return;
  const amount = g.clientWidth * 0.9;
  g.scrollBy({ left: dir * amount, behavior: 'smooth' });
}
