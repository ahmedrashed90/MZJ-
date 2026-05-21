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

// Campaign builder interactions
function clearEmptyRow(tbody){
  const empty = tbody.querySelector('.empty-row');
  if(empty) empty.remove();
}
function restoreEmptyRow(tbody, colSpan, text){
  if(tbody.children.length === 0){
    const row = document.createElement('tr');
    row.className = 'empty-row';
    row.innerHTML = `<td colspan="${colSpan}">${text}</td>`;
    tbody.appendChild(row);
  }
}
function makeSelect(label){
  return `<select aria-label="${label}"><option value="">اختر</option></select>`;
}
function showToast(text){
  let toast = document.querySelector('.save-toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'save-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}
function bindCampaignBuilder(){
  const creativeRows = document.getElementById('creativeRows');
  const publishRows = document.getElementById('publishRows');
  const budgetRows = document.getElementById('budgetRows');

  document.getElementById('addCreativeBtn')?.addEventListener('click', () => {
    clearEmptyRow(creativeRows);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="creative-title"><input type="text" aria-label="اسم الكريتيف" /></td>
      <td><input type="text" aria-label="اسم القسم" /></td>
      <td class="task-cell">${makeSelect('نوع التاسك')}</td>
      <td><input type="text" aria-label="مسؤول المحتوى" /></td>
      <td><input type="text" aria-label="مسؤول التصوير" /></td>
      <td><input type="text" aria-label="مسؤول التصميم" /></td>
      <td><input type="text" aria-label="مسؤول المونتاج" /></td>
      <td><input type="text" aria-label="المنتجات" /></td>
      <td>${makeSelect('النشر')}</td>
      <td><button class="delete-row" type="button" aria-label="حذف الصف">×</button></td>`;
    creativeRows.appendChild(row);
  });

  document.getElementById('addPublishRowBtn')?.addEventListener('click', () => {
    clearEmptyRow(publishRows);
    const row = document.createElement('tr');
    row.innerHTML = `<td><input type="text" /></td><td>${makeSelect('القناة')}</td><td><input type="date" /></td><td><input type="time" /></td><td>${makeSelect('الحالة')}</td><td><button class="delete-row" type="button">×</button></td>`;
    publishRows.appendChild(row);
  });

  document.getElementById('addBudgetRowBtn')?.addEventListener('click', () => {
    clearEmptyRow(budgetRows);
    const row = document.createElement('tr');
    row.innerHTML = `<td><input type="text" /></td><td><input type="number" min="0" step="0.01" /></td><td><input type="text" /></td><td><button class="delete-row" type="button">×</button></td>`;
    budgetRows.appendChild(row);
  });

  document.addEventListener('click', event => {
    const btn = event.target.closest('.delete-row');
    if(!btn) return;
    const tbody = btn.closest('tbody');
    btn.closest('tr')?.remove();
    if(tbody?.id === 'creativeRows') restoreEmptyRow(tbody, 10, 'ابدأ بإضافة كريتيف جديد للحملة.');
    if(tbody?.id === 'publishRows') restoreEmptyRow(tbody, 6, 'لا توجد مواعيد نشر.');
    if(tbody?.id === 'budgetRows') restoreEmptyRow(tbody, 4, 'لا توجد بنود ميزانية.');
  });

  document.getElementById('resetCampaignBuilder')?.addEventListener('click', () => {
    document.getElementById('campaignRequestForm')?.reset();
    creativeRows.innerHTML = '<tr class="empty-row"><td colspan="10">ابدأ بإضافة كريتيف جديد للحملة.</td></tr>';
    publishRows.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد مواعيد نشر.</td></tr>';
    budgetRows.innerHTML = '<tr class="empty-row"><td colspan="4">لا توجد بنود ميزانية.</td></tr>';
  });

  document.getElementById('saveCampaignDraft')?.addEventListener('click', () => showToast('تم حفظ شكل الحملة محلياً للمعاينة'));
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', bindCampaignBuilder);
}else{
  bindCampaignBuilder();
}
