window.MZJ_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCQYrkIcCkaNr5jJ6i0Mm_jZueMG5xxYfo",
  authDomain: "mzj-marketing.firebaseapp.com",
  projectId: "mzj-marketing",
  storageBucket: "mzj-marketing.firebasestorage.app",
  messagingSenderId: "248608341168",
  appId: "1:248608341168:web:1671790c1bc4b609328f75",
  measurementId: "G-NGV75EXFRM"
};

window.MZJ_STOCK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBaor-9gU1XYmTD-3YCP14Kstf7HvMEC_M",
  authDomain: "mzj-workflow.firebaseapp.com",
  projectId: "mzj-workflow",
  storageBucket: "mzj-workflow.firebasestorage.app",
  messagingSenderId: "71098850303",
  appId: "1:71098850303:web:ac5d165282c197f8fa65ca",
  measurementId: "G-N5Q63YGLWF"
};

window.MZJ_DEPARTMENTS_COLLECTION = "departments";
window.MZJ_USERS_COLLECTION = "users";
window.MZJ_STOCK_CARS_COLLECTION = "cars";

const routes = ['dashboard','campaigns','create-campaign','departments','calendar','tasks','stock','reports','settings'];
const loginView = document.getElementById('loginView');
const appShell = document.getElementById('appShell');
const sidebar = document.getElementById('sidebar');
const overlay = document.querySelector('[data-close-menu]');

let mainDb = null;
let stockDb = null;
let departments = [];
let users = [];
let cars = [];

function isLoggedIn(){ return localStorage.getItem('mzj_logged_in') === '1'; }
function getRoute(){ return (location.hash || '#dashboard').replace('#',''); }
function openApp(){ loginView.classList.add('is-hidden'); appShell.classList.remove('is-hidden'); renderRoute(); bootstrapData(); }
function openLogin(){ appShell.classList.add('is-hidden'); loginView.classList.remove('is-hidden'); }
function renderRoute(){
  const route = routes.includes(getRoute()) ? getRoute() : 'dashboard';
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === route));
  document.querySelectorAll('.nav a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  sidebar?.classList.remove('open');
  overlay?.classList.remove('show');
}

function showMessage(id, text){ const el = document.getElementById(id); if(el) el.textContent = text || ''; }
function escapeHtml(value){ return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function normalizeText(value){ return String(value ?? '').trim(); }
function getDocName(data){ return normalizeText(data.name || data.fullName || data.displayName || data.username || data.email || data.title); }
function uniqueList(list){ return [...new Set(list.map(normalizeText).filter(Boolean))]; }

function initFirebase(){
  if(!window.firebase || !firebase.apps){ return; }
  try{
    const mainApp = firebase.apps.find(app => app.name === '[DEFAULT]') || firebase.initializeApp(window.MZJ_FIREBASE_CONFIG);
    mainDb = firebase.firestore(mainApp);
  }catch(error){ console.error('Main Firebase init error', error); }
  try{
    const stockApp = firebase.apps.find(app => app.name === 'stockApp') || firebase.initializeApp(window.MZJ_STOCK_FIREBASE_CONFIG, 'stockApp');
    stockDb = firebase.firestore(stockApp);
  }catch(error){ console.error('Stock Firebase init error', error); }
}

function userOptions(selectedValue = ''){
  const base = '<option value="">اختر اليوزر</option>';
  return base + users.map(user => {
    const value = escapeHtml(user.id);
    const label = escapeHtml(user.name || user.email || user.id);
    const selected = selectedValue === user.id ? ' selected' : '';
    return `<option value="${value}"${selected}>${label}</option>`;
  }).join('');
}

function departmentOptions(selectedValue = ''){
  const base = '<option value="">اختر القسم</option>';
  return base + departments.map(dep => {
    const selected = selectedValue === dep.id ? ' selected' : '';
    return `<option value="${escapeHtml(dep.id)}"${selected}>${escapeHtml(dep.name)}</option>`;
  }).join('');
}

function creativeOptions(departmentId = '', selectedValue = ''){
  const dep = departments.find(item => item.id === departmentId);
  const creatives = dep ? dep.creatives : departments.flatMap(item => item.creatives || []);
  const uniqueCreatives = uniqueList(creatives);
  return '<option value="">اختر الكريتيف</option>' + uniqueCreatives.map(name => {
    const selected = selectedValue === name ? ' selected' : '';
    return `<option value="${escapeHtml(name)}"${selected}>${escapeHtml(name)}</option>`;
  }).join('');
}

function refreshDynamicSelects(){
  document.querySelectorAll('.js-department-select').forEach(select => {
    const value = select.value;
    select.innerHTML = departmentOptions(value);
  });
  document.querySelectorAll('.js-creative-select').forEach(select => {
    const row = select.closest('tr');
    const depId = row?.querySelector('.js-department-select')?.value || '';
    const value = select.value;
    select.innerHTML = creativeOptions(depId, value);
  });
  document.querySelectorAll('.js-user-select').forEach(select => {
    const value = select.value;
    select.innerHTML = userOptions(value);
  });
  const creativeDepartment = document.getElementById('creativeDepartment');
  if(creativeDepartment){
    const value = creativeDepartment.value;
    creativeDepartment.innerHTML = departmentOptions(value);
  }
  updateAllProductOutputs();
}

function loadDepartments(){
  const list = document.getElementById('departmentsList');
  if(!mainDb){
    if(list) list.innerHTML = '<div class="empty-state">لم يتم تفعيل اتصال Firebase.</div>';
    return;
  }
  mainDb.collection(window.MZJ_DEPARTMENTS_COLLECTION).orderBy('name').onSnapshot(snapshot => {
    departments = snapshot.docs.map(doc => {
      const data = doc.data() || {};
      const creatives = Array.isArray(data.creatives) ? data.creatives.map(item => typeof item === 'string' ? item : item?.name).filter(Boolean) : [];
      return { id: doc.id, name: getDocName(data) || doc.id, creatives };
    });
    renderDepartments();
    refreshDynamicSelects();
    const count = document.getElementById('dashboardDepartmentsCount');
    if(count) count.textContent = departments.length || '—';
  }, error => {
    console.error(error);
    if(list) list.innerHTML = '<div class="empty-state">تعذر تحميل الأقسام.</div>';
  });
}

function renderDepartments(){
  const list = document.getElementById('departmentsList');
  if(!list) return;
  if(!departments.length){
    list.innerHTML = '<div class="empty-state">لا توجد أقسام حتى الآن.</div>';
    return;
  }
  list.innerHTML = departments.map(dep => `
    <article class="department-item">
      <h3>${escapeHtml(dep.name)}</h3>
      <div class="chip-list">
        ${(dep.creatives && dep.creatives.length) ? dep.creatives.map(name => `<span class="chip">${escapeHtml(name)}</span>`).join('') : '<span class="chip"><small>لا توجد كريتيفات</small></span>'}
      </div>
    </article>`).join('');
}

function loadUsers(){
  if(!mainDb) return;
  mainDb.collection(window.MZJ_USERS_COLLECTION).onSnapshot(snapshot => {
    users = snapshot.docs.map(doc => {
      const data = doc.data() || {};
      return { id: doc.id, name: getDocName(data) || doc.id, email: data.email || '' };
    });
    refreshDynamicSelects();
  }, error => console.error('Users load error', error));
}

function getField(obj, keys){
  for(const key of keys){
    if(obj && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') return obj[key];
  }
  return '';
}
function normalizeMaybeArray(value){
  if(Array.isArray(value)) return value.map(normalizeText).filter(Boolean);
  return normalizeText(value) ? [normalizeText(value)] : [];
}
function countValues(values){
  const map = new Map();
  values.forEach(value => map.set(value, (map.get(value) || 0) + 1));
  return [...map.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ar'));
}
function renderChips(containerId, entries){
  const el = document.getElementById(containerId);
  if(!el) return;
  if(!entries.length){ el.innerHTML = '<div class="empty-state">لا توجد بيانات متاحة.</div>'; return; }
  el.innerHTML = entries.map(([name,count]) => `<span class="chip">${escapeHtml(name)} <small>${count}</small></span>`).join('');
}
function loadStock(){
  if(!stockDb) return;
  const carsRef = stockDb.collection(window.MZJ_STOCK_CARS_COLLECTION);
  carsRef.onSnapshot(snapshot => {
    cars = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
    renderStock();
  }, error => {
    console.error('Stock load error', error);
    ['stockBrands','stockSpecs','stockColors'].forEach(id => renderChips(id, []));
  });
}
function renderStock(){
  const brandValues = [];
  const specValues = [];
  const colorValues = [];
  cars.forEach(car => {
    brandValues.push(...normalizeMaybeArray(getField(car, ['brand','make','maker','manufacturer','ماركة','الماركة'])));
    specValues.push(...normalizeMaybeArray(getField(car, ['specifications','specs','spec','trim','category','مواصفات','المواصفات'])));
    colorValues.push(...normalizeMaybeArray(getField(car, ['color','colour','exteriorColor','externalColor','لون','اللون'])));
  });
  const brands = countValues(brandValues);
  const specs = countValues(specValues);
  const colors = countValues(colorValues);
  const setText = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  setText('stockTotalCars', cars.length || '—');
  setText('dashboardCarsCount', cars.length || '—');
  setText('stockBrandsCount', brands.length || '—');
  setText('stockSpecsCount', specs.length || '—');
  setText('stockColorsCount', colors.length || '—');
  renderChips('stockBrands', brands);
  renderChips('stockSpecs', specs);
  renderChips('stockColors', colors);
}

function clearEmptyRow(tbody){ const empty = tbody.querySelector('.empty-row'); if(empty) empty.remove(); }
function restoreEmptyRow(tbody, colSpan, text){
  if(tbody.children.length === 0){
    const row = document.createElement('tr');
    row.className = 'empty-row';
    row.innerHTML = `<td colspan="${colSpan}">${text}</td>`;
    tbody.appendChild(row);
  }
}
function makeSelect(label, className = ''){ return `<select class="${className}" aria-label="${label}"><option value="">اختر</option></select>`; }
function showToast(text){
  let toast = document.querySelector('.save-toast');
  if(!toast){ toast = document.createElement('div'); toast.className = 'save-toast'; document.body.appendChild(toast); }
  toast.textContent = text;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}
function updateProductOutput(row){
  const creative = row?.querySelector('.js-creative-select')?.value || '';
  const userSelect = row?.querySelector('.js-product-user');
  const userName = userSelect?.selectedOptions?.[0]?.textContent?.trim() || '';
  const output = row?.querySelector('.js-product-output');
  if(output) output.value = creative && userSelect?.value ? `${creative} - ${userName}` : '';
}
function updateAllProductOutputs(){ document.querySelectorAll('#creativeRows tr').forEach(updateProductOutput); }

function bindCampaignBuilder(){
  const creativeRows = document.getElementById('creativeRows');
  const publishRows = document.getElementById('publishRows');
  const budgetRows = document.getElementById('budgetRows');

  document.getElementById('addCreativeBtn')?.addEventListener('click', () => {
    clearEmptyRow(creativeRows);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${makeSelect('الكريتيف', 'js-creative-select')}</td>
      <td>${makeSelect('اسم القسم', 'js-department-select')}</td>
      <td class="task-cell">${makeSelect('نوع التاسك', 'js-task-type')}</td>
      <td>${makeSelect('مسؤول المحتوى', 'js-user-select')}</td>
      <td>${makeSelect('مسؤول التصوير', 'js-user-select')}</td>
      <td>${makeSelect('مسؤول التصميم', 'js-user-select')}</td>
      <td>${makeSelect('مسؤول المونتاج', 'js-user-select')}</td>
      <td><div class="product-cell">${makeSelect('يوزر المنتجات', 'js-user-select js-product-user')}<input class="product-output js-product-output" type="text" readonly aria-label="المنتجات" /></div></td>
      <td>${makeSelect('النشر', 'js-user-select')}</td>
      <td><button class="delete-row" type="button" aria-label="حذف الصف">×</button></td>`;
    creativeRows.appendChild(row);
    refreshDynamicSelects();
  });

  document.getElementById('addPublishRowBtn')?.addEventListener('click', () => {
    clearEmptyRow(publishRows);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${makeSelect('الكريتيف', 'js-creative-select')}</td><td>${makeSelect('القناة')}</td><td><input type="date" /></td><td><input type="time" /></td><td>${makeSelect('الحالة')}</td><td><button class="delete-row" type="button">×</button></td>`;
    publishRows.appendChild(row);
    refreshDynamicSelects();
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
    if(tbody?.id === 'creativeRows') restoreEmptyRow(tbody, 10, 'ابدأ بإضافة صف كريتيف للحملة.');
    if(tbody?.id === 'publishRows') restoreEmptyRow(tbody, 6, 'لا توجد مواعيد نشر.');
    if(tbody?.id === 'budgetRows') restoreEmptyRow(tbody, 4, 'لا توجد بنود ميزانية.');
  });

  document.addEventListener('change', event => {
    if(event.target.matches('.js-department-select')){
      const row = event.target.closest('tr');
      const creativeSelect = row?.querySelector('.js-creative-select');
      if(creativeSelect) creativeSelect.innerHTML = creativeOptions(event.target.value, '');
      updateProductOutput(row);
    }
    if(event.target.matches('.js-creative-select,.js-product-user')) updateProductOutput(event.target.closest('tr'));
  });

  document.getElementById('resetCampaignBuilder')?.addEventListener('click', () => {
    document.getElementById('campaignRequestForm')?.reset();
    creativeRows.innerHTML = '<tr class="empty-row"><td colspan="10">ابدأ بإضافة صف كريتيف للحملة.</td></tr>';
    publishRows.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد مواعيد نشر.</td></tr>';
    budgetRows.innerHTML = '<tr class="empty-row"><td colspan="4">لا توجد بنود ميزانية.</td></tr>';
  });

  document.getElementById('saveCampaignDraft')?.addEventListener('click', () => showToast('تم حفظ شكل الحملة محلياً للمعاينة'));
}

function bindDepartments(){
  document.getElementById('departmentForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const name = normalizeText(document.getElementById('departmentName')?.value);
    if(!name) return;
    if(!mainDb){ showMessage('departmentMessage', 'اتصال Firebase غير متاح.'); return; }
    try{
      await mainDb.collection(window.MZJ_DEPARTMENTS_COLLECTION).add({ name, creatives: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      event.target.reset();
      showMessage('departmentMessage', 'تم إضافة القسم.');
    }catch(error){ console.error(error); showMessage('departmentMessage', 'تعذر إضافة القسم.'); }
  });

  document.getElementById('creativeForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const depId = document.getElementById('creativeDepartment')?.value;
    const name = normalizeText(document.getElementById('creativeName')?.value);
    if(!depId || !name) return;
    if(!mainDb){ showMessage('creativeMessage', 'اتصال Firebase غير متاح.'); return; }
    try{
      await mainDb.collection(window.MZJ_DEPARTMENTS_COLLECTION).doc(depId).update({ creatives: firebase.firestore.FieldValue.arrayUnion(name), updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      event.target.reset();
      refreshDynamicSelects();
      showMessage('creativeMessage', 'تم إضافة الكريتيف.');
    }catch(error){ console.error(error); showMessage('creativeMessage', 'تعذر إضافة الكريتيف.'); }
  });
  document.getElementById('refreshDepartmentsBtn')?.addEventListener('click', renderDepartments);
  document.getElementById('refreshStockBtn')?.addEventListener('click', renderStock);
}

function bootstrapData(){
  if(bootstrapData.started) return;
  bootstrapData.started = true;
  initFirebase();
  loadDepartments();
  loadUsers();
  loadStock();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-menu]')?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); });
  overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });

  document.getElementById('loginForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    showMessage('loginMessage', 'جاري التحقق...');
    initFirebase();
    const email = normalizeText(document.getElementById('loginEmail')?.value).toLowerCase();
    const password = document.getElementById('loginPassword')?.value || '';
    if(mainDb){
      try{
        const snapshot = await mainDb.collection(window.MZJ_USERS_COLLECTION).where('email','==',email).limit(1).get();
        const doc = snapshot.docs[0];
        const data = doc?.data() || null;
        if(!data || (data.password !== password && data.pass !== password)){
          showMessage('loginMessage', 'بيانات الدخول غير صحيحة.');
          return;
        }
      }catch(error){ console.error(error); showMessage('loginMessage', 'تعذر التحقق من بيانات الدخول.'); return; }
    }
    localStorage.setItem('mzj_logged_in','1');
    showMessage('loginMessage', '');
    openApp();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => { localStorage.removeItem('mzj_logged_in'); openLogin(); });
  window.addEventListener('hashchange', () => { if(isLoggedIn()) renderRoute(); });
  bindCampaignBuilder();
  bindDepartments();
  isLoggedIn() ? openApp() : openLogin();
});
