const routes = ['dashboard','campaigns','create-campaign','content','calendar','tasks','reports','settings'];
const loginView = document.getElementById('loginView');
const appShell = document.getElementById('appShell');
const sidebar = document.getElementById('sidebar');
const overlay = document.querySelector('[data-close-menu]');

function isLoggedIn(){ return localStorage.getItem('mzj_logged_in') === '1'; }
function openApp(){ loginView.classList.add('is-hidden'); appShell.classList.remove('is-hidden'); renderRoute(); }
function openLogin(){ appShell.classList.add('is-hidden'); loginView.classList.remove('is-hidden'); }
function getRoute(){ return (location.hash || '#dashboard').replace('#',''); }
function renderRoute(){
  const route = routes.includes(getRoute()) ? getRoute() : 'dashboard';
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === route));
  document.querySelectorAll('.nav a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  sidebar?.classList.remove('open'); overlay?.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-menu]')?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); });
  overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });
  document.getElementById('loginForm')?.addEventListener('submit', event => {
    event.preventDefault();
    localStorage.setItem('mzj_logged_in','1');
    openApp();
  });
  document.getElementById('logoutBtn')?.addEventListener('click', () => { localStorage.removeItem('mzj_logged_in'); openLogin(); });
  window.addEventListener('hashchange', () => { if(isLoggedIn()) renderRoute(); });
  isLoggedIn() ? openApp() : openLogin();
});
