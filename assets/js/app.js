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
window.MZJ_CREATIVES_COLLECTION = "creatives";
window.MZJ_TASK_TYPES_COLLECTION = "taskTypes";
window.MZJ_CONTENT_SECTIONS_COLLECTION = "contentSections";
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
let creatives = [];
let taskTypes = [];
let contentSections = [];
let cars = [];

function isLoggedIn(){ return localStorage.getItem('mzj_logged_in') === '1'; }
function getRoute(){ return (location.hash || '#dashboard').replace('#',''); }
function openApp(){ loginView.classList.add('is-hidden'); appShell.classList.remove('is-hidden'); renderRoute(); bootstrapData(); }
function openLogin(){ appShell.classList.add('is-hidden'); loginView.classList.remove('is-hidden'); }
function renderRoute(){
  const route = routes.includes(getRoute()) ? getRoute() : 'dashboard';
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === route));
  document.querySelectorAll('.nav a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  sidebar?.classList.remove('open'); overlay?.classList.remove('show');
}
function showMessage(id, text){ const el = document.getElementById(id); if(el) el.textContent = text || ''; }
function escapeHtml(value){ return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function normalizeText(value){ return String(value ?? '').trim(); }
function getDocName(data){ return normalizeText(data.name || data.fullName || data.displayName || data.username || data.email || data.title); }
function uniqueList(list){ return [...new Set(list.map(normalizeText).filter(Boolean))]; }
function getSelectedValues(select){ return [...(select?.selectedOptions || [])].map(option => option.value).filter(Boolean); }
function namesFromIds(ids){ return (ids || []).map(id => users.find(user => user.id === id)?.name || users.find(user => user.id === id)?.email || id).filter(Boolean); }
function serverTime(){ return firebase.firestore.FieldValue.serverTimestamp(); }

function initFirebase(){
  if(!window.firebase || !firebase.apps) return;
  try{ const mainApp = firebase.apps.find(app => app.name === '[DEFAULT]') || firebase.initializeApp(window.MZJ_FIREBASE_CONFIG); mainDb = firebase.firestore(mainApp); }catch(error){ console.error('Main Firebase init error', error); }
  try{ const stockApp = firebase.apps.find(app => app.name === 'stockApp') || firebase.initializeApp(window.MZJ_STOCK_FIREBASE_CONFIG, 'stockApp'); stockDb = firebase.firestore(stockApp); }catch(error){ console.error('Stock Firebase init error', error); }
}

function userOptions(selectedValue = ''){
  return '<option value="">اختر اليوزر</option>' + users.map(user => `<option value="${escapeHtml(user.id)}"${selectedValue === user.id ? ' selected' : ''}>${escapeHtml(user.name || user.email || user.id)}</option>`).join('');
}
function multiUserOptions(selectedIds = []){
  return users.map(user => `<option value="${escapeHtml(user.id)}"${selectedIds.includes(user.id) ? ' selected' : ''}>${escapeHtml(user.name || user.email || user.id)}</option>`).join('');
}
function departmentOptions(selectedValue = ''){
  return '<option value="">اختر القسم</option>' + departments.map(dep => `<option value="${escapeHtml(dep.id)}"${selectedValue === dep.id ? ' selected' : ''}>${escapeHtml(dep.name)}</option>`).join('');
}
function creativeOptions(selectedValue = ''){
  return '<option value="">اختر الكريتيف</option>' + creatives.map(item => `<option value="${escapeHtml(item.name)}"${selectedValue === item.name ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}
function taskTypeOptions(selectedValue = ''){
  return '<option value="">اختر نوع التاسك</option>' + taskTypes.map(item => `<option value="${escapeHtml(item.name)}"${selectedValue === item.name ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}
function refreshDynamicSelects(){
  document.querySelectorAll('.js-department-select').forEach(select => { const value = select.value; select.innerHTML = departmentOptions(value); });
  document.querySelectorAll('.js-creative-select').forEach(select => { const value = select.value; select.innerHTML = creativeOptions(value); });
  document.querySelectorAll('.js-task-type').forEach(select => { const value = select.value; select.innerHTML = taskTypeOptions(value); });
  document.querySelectorAll('.js-user-select').forEach(select => { const value = select.value; select.innerHTML = userOptions(value); });
  const departmentUsers = document.getElementById('departmentUsers');
  if(departmentUsers){ const selected = getSelectedValues(departmentUsers); departmentUsers.innerHTML = multiUserOptions(selected); }
  updateAllProductOutputs();
}

function safeCollection(name){ return mainDb.collection(name); }
function loadDepartments(){
  const list = document.getElementById('departmentsList');
  if(!mainDb){ if(list) list.innerHTML = '<div class="empty-state">لم يتم تفعيل اتصال Firebase.</div>'; return; }
  safeCollection(window.MZJ_DEPARTMENTS_COLLECTION).orderBy('name').onSnapshot(snapshot => {
    departments = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id, userIds: Array.isArray(data.userIds) ? data.userIds : [] }; });
    renderDepartments(); refreshDynamicSelects();
    const count = document.getElementById('dashboardDepartmentsCount'); if(count) count.textContent = departments.length || '—';
  }, error => { console.error(error); if(list) list.innerHTML = '<div class="empty-state">تعذر تحميل الأقسام.</div>'; });
}
function renderDepartments(){
  const list = document.getElementById('departmentsList'); if(!list) return;
  if(!departments.length){ list.innerHTML = '<div class="empty-state">لا توجد أقسام حتى الآن.</div>'; return; }
  list.innerHTML = departments.map(dep => `
    <article class="department-item">
      <div class="item-head"><h3>${escapeHtml(dep.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-department="${escapeHtml(dep.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-department="${escapeHtml(dep.id)}">حذف</button></div></div>
      <div class="chip-list">${namesFromIds(dep.userIds).length ? namesFromIds(dep.userIds).map(name => `<span class="chip">${escapeHtml(name)}</span>`).join('') : '<span class="chip"><small>لا توجد يوزرات داخل القسم</small></span>'}</div>
    </article>`).join('');
}
function loadUsers(){
  if(!mainDb) return;
  safeCollection(window.MZJ_USERS_COLLECTION).onSnapshot(snapshot => {
    users = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id, email: data.email || '' }; });
    refreshDynamicSelects(); renderDepartments();
  }, error => console.error('Users load error', error));
}
function loadCreatives(){
  const list = document.getElementById('creativesList');
  if(!mainDb){ if(list) list.innerHTML = '<div class="empty-state">لم يتم تفعيل اتصال Firebase.</div>'; return; }
  safeCollection(window.MZJ_CREATIVES_COLLECTION).orderBy('name').onSnapshot(snapshot => {
    creatives = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id }; });
    renderCreatives(); refreshDynamicSelects();
  }, error => { console.error(error); if(list) list.innerHTML = '<div class="empty-state">تعذر تحميل الكريتيفات.</div>'; });
}
function renderCreatives(){
  const list = document.getElementById('creativesList'); if(!list) return;
  if(!creatives.length){ list.innerHTML = '<div class="empty-state">لا توجد كريتيفات حتى الآن.</div>'; return; }
  list.innerHTML = creatives.map(item => `<article class="department-item"><div class="item-head"><h3>${escapeHtml(item.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-creative="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-creative="${escapeHtml(item.id)}">حذف</button></div></div></article>`).join('');
}
function loadTaskTypes(){
  const list = document.getElementById('taskTypesList');
  if(!mainDb){ if(list) list.innerHTML = '<div class="empty-state">لم يتم تفعيل اتصال Firebase.</div>'; return; }
  safeCollection(window.MZJ_TASK_TYPES_COLLECTION).orderBy('name').onSnapshot(snapshot => {
    taskTypes = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id }; });
    renderTaskTypes(); refreshDynamicSelects();
  }, error => { console.error(error); if(list) list.innerHTML = '<div class="empty-state">تعذر تحميل أنواع التاسك.</div>'; });
}
function renderTaskTypes(){
  const list = document.getElementById('taskTypesList'); if(!list) return;
  if(!taskTypes.length){ list.innerHTML = '<div class="empty-state">لا توجد أنواع تاسك حتى الآن.</div>'; return; }
  list.innerHTML = taskTypes.map(item => `<article class="department-item"><div class="item-head"><h3>${escapeHtml(item.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-task-type="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-task-type="${escapeHtml(item.id)}">حذف</button></div></div></article>`).join('');
}
function loadContentSections(){
  const list = document.getElementById('contentSectionsList');
  if(!mainDb){ if(list) list.innerHTML = '<div class="empty-state">لم يتم تفعيل اتصال Firebase.</div>'; return; }
  safeCollection(window.MZJ_CONTENT_SECTIONS_COLLECTION).orderBy('name').onSnapshot(snapshot => {
    contentSections = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id, types: Array.isArray(data.types) ? data.types.map(normalizeText).filter(Boolean) : [] }; });
    renderContentSections();
  }, error => { console.error(error); if(list) list.innerHTML = '<div class="empty-state">تعذر تحميل أقسام المحتوى.</div>'; });
}
function renderContentSections(){
  const list = document.getElementById('contentSectionsList'); if(!list) return;
  if(!contentSections.length){ list.innerHTML = '<div class="empty-state">لا توجد أقسام محتوى حتى الآن.</div>'; return; }
  list.innerHTML = contentSections.map(item => `
    <article class="department-item">
      <div class="item-head"><h3>${escapeHtml(item.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-content-section="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-content-section="${escapeHtml(item.id)}">حذف</button></div></div>
      <div class="chip-list">${item.types.length ? item.types.map(type => `<span class="chip">${escapeHtml(type)}</span>`).join('') : '<span class="chip"><small>لا توجد أنواع محتوى</small></span>'}</div>
    </article>`).join('');
}

function getField(obj, keys){ for(const key of keys){ if(obj && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') return obj[key]; } return ''; }
function normalizeMaybeArray(value){ if(Array.isArray(value)) return value.map(normalizeText).filter(Boolean); return normalizeText(value) ? [normalizeText(value)] : []; }
function countValues(values){ const map = new Map(); values.forEach(value => map.set(value, (map.get(value) || 0) + 1)); return [...map.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ar')); }
function renderChips(containerId, entries){ const el = document.getElementById(containerId); if(!el) return; el.innerHTML = entries.length ? entries.map(([name,count]) => `<span class="chip">${escapeHtml(name)} <small>${count}</small></span>`).join('') : '<div class="empty-state">لا توجد بيانات متاحة.</div>'; }
function loadStock(){ if(!stockDb) return; stockDb.collection(window.MZJ_STOCK_CARS_COLLECTION).onSnapshot(snapshot => { cars = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) })); renderStock(); }, error => { console.error('Stock load error', error); ['stockBrands','stockSpecs','stockColors'].forEach(id => renderChips(id, [])); }); }
function renderStock(){
  const brandValues = [], specValues = [], colorValues = [];
  cars.forEach(car => { brandValues.push(...normalizeMaybeArray(getField(car, ['brand','make','maker','manufacturer','ماركة','الماركة']))); specValues.push(...normalizeMaybeArray(getField(car, ['specifications','specs','spec','trim','category','مواصفات','المواصفات']))); colorValues.push(...normalizeMaybeArray(getField(car, ['color','colour','exteriorColor','externalColor','لون','اللون']))); });
  const brands = countValues(brandValues), specs = countValues(specValues), colors = countValues(colorValues);
  const setText = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  setText('stockTotalCars', cars.length || '—'); setText('dashboardCarsCount', cars.length || '—'); setText('stockBrandsCount', brands.length || '—'); setText('stockSpecsCount', specs.length || '—'); setText('stockColorsCount', colors.length || '—');
  renderChips('stockBrands', brands); renderChips('stockSpecs', specs); renderChips('stockColors', colors);
}

function clearEmptyRow(tbody){ const empty = tbody.querySelector('.empty-row'); if(empty) empty.remove(); }
function restoreEmptyRow(tbody, colSpan, text){ if(tbody.children.length === 0){ const row = document.createElement('tr'); row.className = 'empty-row'; row.innerHTML = `<td colspan="${colSpan}">${text}</td>`; tbody.appendChild(row); } }
function makeSelect(label, className = ''){ return `<select class="${className}" aria-label="${label}"><option value="">اختر</option></select>`; }
function showToast(text){ let toast = document.querySelector('.save-toast'); if(!toast){ toast = document.createElement('div'); toast.className = 'save-toast'; document.body.appendChild(toast); } toast.textContent = text; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 1800); }
function updateProductOutput(row){
  const creative = row?.querySelector('.js-creative-select')?.value || '';
  const userNames = ['.js-content-user','.js-shoot-user','.js-design-user','.js-edit-user'].map(sel => row?.querySelector(sel)?.selectedOptions?.[0]?.textContent?.trim()).filter(Boolean);
  const output = row?.querySelector('.js-product-output');
  output.value = creative && userNames.length ? `${creative} - ${userNames.join(' - ')}` : '';
}
function updateAllProductOutputs(){ document.querySelectorAll('#creativeRows tr').forEach(updateProductOutput); }

function bindCampaignBuilder(){
  const creativeRows = document.getElementById('creativeRows'); const publishRows = document.getElementById('publishRows'); const budgetRows = document.getElementById('budgetRows');
  document.getElementById('addCreativeBtn')?.addEventListener('click', () => {
    clearEmptyRow(creativeRows);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${makeSelect('الكريتيف', 'js-creative-select')}</td>
      <td>${makeSelect('اسم القسم', 'js-department-select')}</td>
      <td class="task-cell">${makeSelect('نوع التاسك', 'js-task-type')}</td>
      <td>${makeSelect('المحتوى', 'js-user-select js-content-user')}</td>
      <td>${makeSelect('التصوير', 'js-user-select js-shoot-user')}</td>
      <td>${makeSelect('التصميم', 'js-user-select js-design-user')}</td>
      <td>${makeSelect('المونتاج', 'js-user-select js-edit-user')}</td>
      <td><input class="product-output js-product-output" type="text" readonly aria-label="المنتجات" /></td>
      <td>${makeSelect('النشر', 'js-user-select')}</td>
      <td><button class="delete-row" type="button" aria-label="حذف الصف">×</button></td>`;
    creativeRows.appendChild(row); refreshDynamicSelects();
  });
  document.getElementById('addPublishRowBtn')?.addEventListener('click', () => { clearEmptyRow(publishRows); const row = document.createElement('tr'); row.innerHTML = `<td>${makeSelect('الكريتيف', 'js-creative-select')}</td><td>${makeSelect('القناة')}</td><td><input type="date" /></td><td><input type="time" /></td><td>${makeSelect('الحالة')}</td><td><button class="delete-row" type="button">×</button></td>`; publishRows.appendChild(row); refreshDynamicSelects(); });
  document.getElementById('addBudgetRowBtn')?.addEventListener('click', () => { clearEmptyRow(budgetRows); const row = document.createElement('tr'); row.innerHTML = `<td><input type="text" /></td><td><input type="number" min="0" step="0.01" /></td><td><input type="text" /></td><td><button class="delete-row" type="button">×</button></td>`; budgetRows.appendChild(row); });
  document.addEventListener('click', event => { const btn = event.target.closest('.delete-row'); if(!btn) return; const tbody = btn.closest('tbody'); btn.closest('tr')?.remove(); if(tbody?.id === 'creativeRows') restoreEmptyRow(tbody, 10, 'ابدأ بإضافة صف كريتيف للحملة.'); if(tbody?.id === 'publishRows') restoreEmptyRow(tbody, 6, 'لا توجد مواعيد نشر.'); if(tbody?.id === 'budgetRows') restoreEmptyRow(tbody, 4, 'لا توجد بنود ميزانية.'); });
  document.addEventListener('change', event => { if(event.target.matches('.js-creative-select,.js-content-user,.js-shoot-user,.js-design-user,.js-edit-user')) updateProductOutput(event.target.closest('tr')); });
  document.getElementById('resetCampaignBuilder')?.addEventListener('click', () => { document.getElementById('campaignRequestForm')?.reset(); creativeRows.innerHTML = '<tr class="empty-row"><td colspan="10">ابدأ بإضافة صف كريتيف للحملة.</td></tr>'; publishRows.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد مواعيد نشر.</td></tr>'; budgetRows.innerHTML = '<tr class="empty-row"><td colspan="4">لا توجد بنود ميزانية.</td></tr>'; });
  document.getElementById('saveCampaignDraft')?.addEventListener('click', () => showToast('تم حفظ شكل الحملة محلياً للمعاينة'));
}

function resetForm(ids){ ids.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; }); }
function collectionByKind(kind){ return {department: window.MZJ_DEPARTMENTS_COLLECTION, creative: window.MZJ_CREATIVES_COLLECTION, taskType: window.MZJ_TASK_TYPES_COLLECTION, contentSection: window.MZJ_CONTENT_SECTIONS_COLLECTION}[kind]; }
async function deleteDoc(kind, id){ if(!mainDb || !id) return; if(!confirm('تأكيد الحذف؟')) return; await safeCollection(collectionByKind(kind)).doc(id).delete(); }
function bindDepartments(){
  document.getElementById('departmentForm')?.addEventListener('submit', async event => {
    event.preventDefault(); const id = document.getElementById('departmentEditId')?.value; const name = normalizeText(document.getElementById('departmentName')?.value); const userIds = getSelectedValues(document.getElementById('departmentUsers'));
    if(!name) return; if(!mainDb){ showMessage('departmentMessage', 'اتصال Firebase غير متاح.'); return; }
    try{ const payload = { name, userIds, updatedAt: serverTime() }; if(id) await safeCollection(window.MZJ_DEPARTMENTS_COLLECTION).doc(id).update(payload); else await safeCollection(window.MZJ_DEPARTMENTS_COLLECTION).add({ ...payload, createdAt: serverTime() }); event.target.reset(); resetForm(['departmentEditId']); showMessage('departmentMessage', 'تم حفظ القسم.'); }
    catch(error){ console.error(error); showMessage('departmentMessage', 'تعذر حفظ القسم.'); }
  });
  document.getElementById('creativeForm')?.addEventListener('submit', async event => {
    event.preventDefault(); const id = document.getElementById('creativeEditId')?.value; const name = normalizeText(document.getElementById('creativeName')?.value); if(!name) return; if(!mainDb){ showMessage('creativeMessage', 'اتصال Firebase غير متاح.'); return; }
    try{ const payload = { name, updatedAt: serverTime() }; if(id) await safeCollection(window.MZJ_CREATIVES_COLLECTION).doc(id).update(payload); else await safeCollection(window.MZJ_CREATIVES_COLLECTION).add({ ...payload, createdAt: serverTime() }); event.target.reset(); resetForm(['creativeEditId']); showMessage('creativeMessage', 'تم حفظ الكريتيف.'); }
    catch(error){ console.error(error); showMessage('creativeMessage', 'تعذر حفظ الكريتيف.'); }
  });
  document.getElementById('taskTypeForm')?.addEventListener('submit', async event => {
    event.preventDefault(); const id = document.getElementById('taskTypeEditId')?.value; const name = normalizeText(document.getElementById('taskTypeName')?.value); if(!name) return; if(!mainDb){ showMessage('taskTypeMessage', 'اتصال Firebase غير متاح.'); return; }
    try{ const payload = { name, updatedAt: serverTime() }; if(id) await safeCollection(window.MZJ_TASK_TYPES_COLLECTION).doc(id).update(payload); else await safeCollection(window.MZJ_TASK_TYPES_COLLECTION).add({ ...payload, createdAt: serverTime() }); event.target.reset(); resetForm(['taskTypeEditId']); showMessage('taskTypeMessage', 'تم حفظ نوع التاسك.'); }
    catch(error){ console.error(error); showMessage('taskTypeMessage', 'تعذر حفظ نوع التاسك.'); }
  });
  document.getElementById('contentSectionForm')?.addEventListener('submit', async event => {
    event.preventDefault(); const id = document.getElementById('contentSectionEditId')?.value; const name = normalizeText(document.getElementById('contentSectionName')?.value); const types = uniqueList((document.getElementById('contentSectionTypes')?.value || '').split('\n')); if(!name) return; if(!mainDb){ showMessage('contentSectionMessage', 'اتصال Firebase غير متاح.'); return; }
    try{ const payload = { name, types, updatedAt: serverTime() }; if(id) await safeCollection(window.MZJ_CONTENT_SECTIONS_COLLECTION).doc(id).update(payload); else await safeCollection(window.MZJ_CONTENT_SECTIONS_COLLECTION).add({ ...payload, createdAt: serverTime() }); event.target.reset(); resetForm(['contentSectionEditId']); showMessage('contentSectionMessage', 'تم حفظ قسم المحتوى.'); }
    catch(error){ console.error(error); showMessage('contentSectionMessage', 'تعذر حفظ قسم المحتوى.'); }
  });
  document.addEventListener('click', async event => {
    const depEdit = event.target.closest('[data-edit-department]'); if(depEdit){ const item = departments.find(x => x.id === depEdit.dataset.editDepartment); if(item){ document.getElementById('departmentEditId').value = item.id; document.getElementById('departmentName').value = item.name; document.getElementById('departmentUsers').innerHTML = multiUserOptions(item.userIds); } return; }
    const depDel = event.target.closest('[data-delete-department]'); if(depDel){ await deleteDoc('department', depDel.dataset.deleteDepartment); return; }
    const crEdit = event.target.closest('[data-edit-creative]'); if(crEdit){ const item = creatives.find(x => x.id === crEdit.dataset.editCreative); if(item){ document.getElementById('creativeEditId').value = item.id; document.getElementById('creativeName').value = item.name; } return; }
    const crDel = event.target.closest('[data-delete-creative]'); if(crDel){ await deleteDoc('creative', crDel.dataset.deleteCreative); return; }
    const ttEdit = event.target.closest('[data-edit-task-type]'); if(ttEdit){ const item = taskTypes.find(x => x.id === ttEdit.dataset.editTaskType); if(item){ document.getElementById('taskTypeEditId').value = item.id; document.getElementById('taskTypeName').value = item.name; } return; }
    const ttDel = event.target.closest('[data-delete-task-type]'); if(ttDel){ await deleteDoc('taskType', ttDel.dataset.deleteTaskType); return; }
    const csEdit = event.target.closest('[data-edit-content-section]'); if(csEdit){ const item = contentSections.find(x => x.id === csEdit.dataset.editContentSection); if(item){ document.getElementById('contentSectionEditId').value = item.id; document.getElementById('contentSectionName').value = item.name; document.getElementById('contentSectionTypes').value = item.types.join('\n'); } return; }
    const csDel = event.target.closest('[data-delete-content-section]'); if(csDel){ await deleteDoc('contentSection', csDel.dataset.deleteContentSection); }
  });
  document.getElementById('cancelDepartmentEdit')?.addEventListener('click', () => { document.getElementById('departmentForm')?.reset(); resetForm(['departmentEditId']); refreshDynamicSelects(); });
  document.getElementById('cancelCreativeEdit')?.addEventListener('click', () => { document.getElementById('creativeForm')?.reset(); resetForm(['creativeEditId']); });
  document.getElementById('cancelTaskTypeEdit')?.addEventListener('click', () => { document.getElementById('taskTypeForm')?.reset(); resetForm(['taskTypeEditId']); });
  document.getElementById('cancelContentSectionEdit')?.addEventListener('click', () => { document.getElementById('contentSectionForm')?.reset(); resetForm(['contentSectionEditId']); });
  document.getElementById('refreshDepartmentsBtn')?.addEventListener('click', () => { renderDepartments(); renderCreatives(); renderTaskTypes(); renderContentSections(); });
  document.getElementById('refreshStockBtn')?.addEventListener('click', renderStock);
}

function bootstrapData(){
  if(bootstrapData.started) return; bootstrapData.started = true; initFirebase(); loadUsers(); loadDepartments(); loadCreatives(); loadTaskTypes(); loadContentSections(); loadStock();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-menu]')?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); });
  overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });
  document.getElementById('loginForm')?.addEventListener('submit', async event => {
    event.preventDefault(); showMessage('loginMessage', 'جاري التحقق...'); initFirebase();
    const email = normalizeText(document.getElementById('loginEmail')?.value).toLowerCase(); const password = document.getElementById('loginPassword')?.value || '';
    if(mainDb){ try{ const snapshot = await mainDb.collection(window.MZJ_USERS_COLLECTION).where('email','==',email).limit(1).get(); const doc = snapshot.docs[0]; const data = doc?.data() || null; if(!data || (data.password !== password && data.pass !== password)){ showMessage('loginMessage', 'بيانات الدخول غير صحيحة.'); return; } }catch(error){ console.error(error); showMessage('loginMessage', 'تعذر التحقق من بيانات الدخول.'); return; } }
    localStorage.setItem('mzj_logged_in','1'); showMessage('loginMessage', ''); openApp();
  });
  document.getElementById('logoutBtn')?.addEventListener('click', () => { localStorage.removeItem('mzj_logged_in'); openLogin(); });
  window.addEventListener('hashchange', () => { if(isLoggedIn()) renderRoute(); });
  bindCampaignBuilder(); bindDepartments(); isLoggedIn() ? openApp() : openLogin();
});
