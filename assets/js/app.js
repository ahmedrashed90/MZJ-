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
window.MZJ_CREATIVES_COLLECTION = "marketing_creatives";
window.MZJ_TASK_TYPES_COLLECTION = "marketing_task_types";
window.MZJ_CONTENT_SECTIONS_COLLECTION = "content_categories";
window.MZJ_CAMPAIGN_CODES_COLLECTION = "marketing_campaign_codes";
window.MZJ_CAMPAIGN_TYPES_COLLECTION = "marketing_campaign_types";
window.MZJ_STOCK_CARS_COLLECTION = "cars";
window.MZJ_CAMPAIGNS_COLLECTION = "marketing_campaigns";

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
let campaignCodes = [];
let campaignTypes = [];
let cars = [];

function isLoggedIn(){ return sessionStorage.getItem('mzj_logged_in') === '1'; }
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
function getDocName(data){ return normalizeText(data.name || data.fullName || data.displayName || data.username || data.email || data.title || data.label); }
function uniqueList(list){ return [...new Set(list.map(normalizeText).filter(Boolean))]; }
function getSelectedValues(select){ return [...(select?.selectedOptions || [])].map(option => option.value).filter(Boolean); }
function serverTime(){ return firebase.firestore.FieldValue.serverTimestamp(); }
function safeCollection(name){ return mainDb.collection(name); }

function initFirebase(){
  if(!window.firebase || !firebase.apps) return;
  try{
    const mainApp = firebase.apps.find(app => app.name === '[DEFAULT]') || firebase.initializeApp(window.MZJ_FIREBASE_CONFIG);
    mainDb = firebase.firestore(mainApp);
  }catch(error){ console.error('Main Firebase init error', error); }
  try{
    const stockApp = firebase.apps.find(app => app.name === 'stockApp') || firebase.initializeApp(window.MZJ_STOCK_FIREBASE_CONFIG, 'stockApp');
    stockDb = firebase.firestore(stockApp);
  }catch(error){ console.error('Stock Firebase init error', error); }
}

function userName(user){ return user?.name || user?.email || user?.id || ''; }
function namesFromIds(ids){ return (ids || []).map(id => userName(users.find(user => user.id === id)) || id).filter(Boolean); }
function userOptions(selectedValue = ''){
  return '<option value="">اختر اليوزر</option>' + users.map(user => `<option value="${escapeHtml(user.id)}"${selectedValue === user.id ? ' selected' : ''}>${escapeHtml(userName(user))}</option>`).join('');
}
function multiUserOptions(selectedIds = []){
  return users.map(user => `<option value="${escapeHtml(user.id)}"${selectedIds.includes(user.id) ? ' selected' : ''}>${escapeHtml(userName(user))}</option>`).join('');
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
function campaignTypeOptions(selectedValue = ''){
  return '<option value="">اختر نوع الحملة</option>' + campaignTypes.map(item => `<option value="${escapeHtml(item.name)}"${selectedValue === item.name ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}
function campaignCodeOptions(selectedValue = ''){
  return '<option value="">اختر الكود</option>' + campaignCodes.map(item => {
    const label = formatCampaignCodeLabel(item);
    return `<option value="${escapeHtml(item.id)}"${selectedValue === item.id ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
}
function formatCampaignCodeLabel(item){
  const core = [item.prefix || 'MZJ', item.code].filter(Boolean).join('-');
  return item.name ? `${core} - ${item.name}` : core;
}
function refreshDynamicSelects(){
  document.querySelectorAll('.js-department-select').forEach(select => { const value = select.value; select.innerHTML = departmentOptions(value); });
  document.querySelectorAll('.js-creative-select').forEach(select => { const value = select.value; select.innerHTML = creativeOptions(value); });
  document.querySelectorAll('.js-task-type').forEach(select => { const value = select.value; select.innerHTML = taskTypeOptions(value); });
  document.querySelectorAll('.js-user-select').forEach(select => { const value = select.value; select.innerHTML = userOptions(value); });
  document.querySelectorAll('.js-campaign-code-select').forEach(select => { const value = select.value; select.innerHTML = campaignCodeOptions(value); });
  document.querySelectorAll('.js-campaign-type-select').forEach(select => { const value = select.value; select.innerHTML = campaignTypeOptions(value); });
  const departmentUsers = document.getElementById('departmentUsers');
  if(departmentUsers){ const selected = getSelectedValues(departmentUsers); departmentUsers.innerHTML = multiUserOptions(selected); }
  generateCampaignCode();
  updateAllProductOutputs();
}

function loadUsers(){
  if(!mainDb) return;
  safeCollection(window.MZJ_USERS_COLLECTION).onSnapshot(snapshot => {
    users = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id, email: data.email || '' }; });
    refreshDynamicSelects(); renderDepartments();
  }, error => console.error('Users load error', error));
}
function loadSimpleCollection(collectionName, target, renderer, selectRefresh = true){
  if(!mainDb) return;
  safeCollection(collectionName).orderBy('name').onSnapshot(snapshot => {
    const mapped = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id, ...data }; });
    target.splice(0, target.length, ...mapped);
    renderer();
    if(selectRefresh) refreshDynamicSelects();
  }, error => console.error(collectionName, error));
}
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
function renderCreatives(){ renderNameList('creativesList', creatives, 'data-edit-creative', 'data-delete-creative', 'لا توجد كريتيفات حتى الآن.'); }
function renderTaskTypes(){ renderNameList('taskTypesList', taskTypes, 'data-edit-task-type', 'data-delete-task-type', 'لا توجد أنواع تاسك حتى الآن.'); }
function renderCampaignTypes(){ renderNameList('campaignTypesList', campaignTypes, 'data-edit-campaign-type', 'data-delete-campaign-type', 'لا توجد أنواع حملات حتى الآن.'); }
function renderCampaignCodes(){
  const list = document.getElementById('campaignCodesList'); if(!list) return;
  if(!campaignCodes.length){ list.innerHTML = '<div class="empty-state">لا توجد أكواد حملات حتى الآن.</div>'; return; }
  list.innerHTML = campaignCodes.map(item => `
    <article class="department-item">
      <div class="item-head"><h3>${escapeHtml(formatCampaignCodeLabel(item))}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-campaign-code="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-campaign-code="${escapeHtml(item.id)}">حذف</button></div></div>
      <div class="chip-list"><span class="chip">${escapeHtml(item.prefix || 'MZJ')}-${escapeHtml(item.code || '')}</span></div>
    </article>`).join('');
}
function renderNameList(containerId, items, editAttr, deleteAttr, emptyText){
  const list = document.getElementById(containerId); if(!list) return;
  if(!items.length){ list.innerHTML = `<div class="empty-state">${emptyText}</div>`; return; }
  list.innerHTML = items.map(item => `<article class="department-item"><div class="item-head"><h3>${escapeHtml(item.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" ${editAttr}="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" ${deleteAttr}="${escapeHtml(item.id)}">حذف</button></div></div></article>`).join('');
}
function renderContentSections(){
  const list = document.getElementById('contentSectionsList'); if(!list) return;
  if(!contentSections.length){ list.innerHTML = '<div class="empty-state">لا توجد أقسام محتوى حتى الآن.</div>'; return; }
  list.innerHTML = contentSections.map(item => `
    <article class="department-item">
      <div class="item-head"><h3>${escapeHtml(item.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-content-section="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-content-section="${escapeHtml(item.id)}">حذف</button></div></div>
      <div class="chip-list">${(item.types || []).length ? item.types.map(type => `<span class="chip">${escapeHtml(type)}</span>`).join('') : '<span class="chip"><small>لا توجد أنواع محتوى</small></span>'}</div>
    </article>`).join('');
}

function getField(obj, keys){ for(const key of keys){ if(obj && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') return obj[key]; } return ''; }
function normalizeMaybeArray(value){ if(Array.isArray(value)) return value.map(normalizeText).filter(Boolean); return normalizeText(value) ? [normalizeText(value)] : []; }
function countValues(values){ const map = new Map(); values.forEach(value => map.set(value, (map.get(value) || 0) + 1)); return [...map.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ar')); }
function renderChips(containerId, entries){ const el = document.getElementById(containerId); if(!el) return; el.innerHTML = entries.length ? entries.map(([name,count]) => `<span class="chip">${escapeHtml(name)} <small>${count}</small></span>`).join('') : '<div class="empty-state">لا توجد بيانات متاحة.</div>'; }
function loadStock(){
  if(!stockDb) return;
  stockDb.collection(window.MZJ_STOCK_CARS_COLLECTION).onSnapshot(snapshot => {
    cars = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
    renderStock();
  }, error => { console.error('Stock load error', error); renderStockError(); });
}
function pickFirstValue(obj, keys){
  for(const key of keys){
    if(obj && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') return obj[key];
  }
  return '';
}
function valueListFromFields(obj, keys){
  const values = [];
  keys.forEach(key => values.push(...normalizeMaybeArray(obj?.[key])));
  return uniqueList(values);
}
function normalizeStatus(value){ return normalizeText(value || 'غير محدد'); }
function stockStatusOf(car){
  return normalizeStatus(pickFirstValue(car, ['status','carStatus','stockStatus','availability','الحالة','حالة السيارة']));
}
function isExcludedStockStatus(status){
  const text = normalizeStatus(status);
  return text.includes('تم التسليم') || text.includes('ارشيف') || text.includes('أرشيف') || text.includes('archive');
}
function statusCount(statusName){
  return cars.filter(car => stockStatusOf(car).includes(statusName)).length;
}
function stockChipHtml(name, count = null, extraClass = ''){
  const suffix = count !== null && count !== undefined ? ` <small>${escapeHtml(count)}</small>` : '';
  return `<span class="stock-chip ${extraClass}">${escapeHtml(name)}${suffix}</span>`;
}
function renderStockError(){
  ['stockTotalCars','dashboardCarsCount','stockAvailableAfterExclude','stockAvailableForSale','stockReserved','stockUnderDelivery'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = '—'; });
  const tbody = document.getElementById('stockSummaryRows');
  if(tbody) tbody.innerHTML = '<tr class="empty-row"><td colspan="8">تعذر تحميل بيانات الاستوك.</td></tr>';
}
function renderStock(){
  const tbody = document.getElementById('stockSummaryRows');
  const setText = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  setText('stockTotalCars', cars.length || '—');
  setText('dashboardCarsCount', cars.length || '—');
  setText('stockAvailableAfterExclude', cars.filter(car => !isExcludedStockStatus(stockStatusOf(car))).length || '—');
  setText('stockAvailableForSale', statusCount('متاح للبيع') || '—');
  setText('stockReserved', statusCount('حجز') || '—');
  setText('stockUnderDelivery', statusCount('مباع تحت التسليم') || '—');
  if(!tbody) return;
  if(!cars.length){ tbody.innerHTML = '<tr class="empty-row"><td colspan="8">لا توجد بيانات استوك متاحة.</td></tr>'; return; }

  const groups = new Map();
  cars.forEach(car => {
    const key = normalizeText(pickFirstValue(car, [
      'uniqueSpecKey','Unique Spec Key','unique_spec_key','specKey','spec_key','uniqueKey','unique_key','sku','code','title','name','اسم السيارة','اسم'
    ])) || car.id;
    const name = normalizeText(pickFirstValue(car, ['carName','name','title','modelName','vehicleName','اسم السيارة','السيارة','brand','make','ماركة','الماركة'])) || '—';
    const model = normalizeText(pickFirstValue(car, ['model','year','modelYear','موديل','الموديل','سنة','السنة'])) || '—';
    if(!groups.has(key)){
      groups.set(key, { key, name, model, count: 0, exterior: new Map(), interior: new Map(), statuses: new Map(), sub: normalizeText(pickFirstValue(car, ['description','trim','spec','specName','grade','الفئة','المواصفة'])) });
    }
    const group = groups.get(key);
    group.count += 1;
    if(group.name === '—' && name !== '—') group.name = name;
    if(group.model === '—' && model !== '—') group.model = model;
    valueListFromFields(car, ['exteriorColor','externalColor','outsideColor','outerColor','color','colour','colors','availableColors','لون خارجي','اللون الخارجي','الألوان الخارجية']).forEach(color => group.exterior.set(color, (group.exterior.get(color) || 0) + 1));
    valueListFromFields(car, ['interiorColor','insideColor','internalColor','innerColor','interiorColors','لون داخلي','اللون الداخلي','الألوان الداخلية']).forEach(color => group.interior.set(color, (group.interior.get(color) || 0) + 1));
    const status = stockStatusOf(car);
    group.statuses.set(status, (group.statuses.get(status) || 0) + 1);
  });

  const rows = [...groups.values()].sort((a,b) => b.count - a.count || a.key.localeCompare(b.key, 'ar'));
  tbody.innerHTML = rows.map((group, index) => {
    const ext = [...group.exterior.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0], 'ar'));
    const intr = [...group.interior.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0], 'ar'));
    const statuses = [...group.statuses.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0], 'ar'));
    return `<tr>
      <td>${index + 1}</td>
      <td class="stock-key">${escapeHtml(group.key)}${group.sub ? `<small>${escapeHtml(group.sub)}</small>` : ''}</td>
      <td>${escapeHtml(group.name)}</td>
      <td>${escapeHtml(group.model)}</td>
      <td><span class="stock-count">${group.count}</span></td>
      <td><div class="stock-chip-list">${ext.length ? ext.map(([n,c]) => stockChipHtml(n,c)).join('') : '<span class="stock-chip">—</span>'}</div></td>
      <td><div class="stock-chip-list">${intr.length ? intr.map(([n,c]) => stockChipHtml(n,c)).join('') : '<span class="stock-chip">—</span>'}</div></td>
      <td><div class="stock-chip-list">${statuses.length ? statuses.map(([n,c]) => stockChipHtml(n,c,'stock-status')).join('') : '<span class="stock-chip">—</span>'}</div></td>
    </tr>`;
  }).join('');
}

function clearEmptyRow(tbody){ const empty = tbody?.querySelector('.empty-row'); if(empty) empty.remove(); }
function restoreEmptyRow(tbody, colSpan, text){ if(tbody && tbody.children.length === 0){ const row = document.createElement('tr'); row.className = 'empty-row'; row.innerHTML = `<td colspan="${colSpan}">${text}</td>`; tbody.appendChild(row); } }
function makeSelect(label, className = ''){ return `<select class="${className}" aria-label="${label}"><option value="">اختر</option></select>`; }
function showToast(text){ let toast = document.querySelector('.save-toast'); if(!toast){ toast = document.createElement('div'); toast.className = 'save-toast'; document.body.appendChild(toast); } toast.textContent = text; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 1800); }
function updateProductOutput(row){
  const creative = row?.querySelector('.js-creative-select')?.value || '';
  const userNames = ['.js-content-user','.js-shoot-user','.js-design-user','.js-edit-user'].map(sel => row?.querySelector(sel)?.selectedOptions?.[0]?.textContent?.trim()).filter(Boolean).filter(text => text !== 'اختر اليوزر');
  const output = row?.querySelector('.js-product-output');
  if(output) output.value = creative && userNames.length ? `${creative} - ${userNames.join(' - ')}` : '';
}
function updateAllProductOutputs(){ document.querySelectorAll('#creativeRows tr').forEach(updateProductOutput); }
function generateCampaignCode(){
  const select = document.getElementById('campaignCodeSelect');
  const output = document.getElementById('campaignCodeInput');
  if(!select || !output) return;
  const item = campaignCodes.find(code => code.id === select.value);
  if(!item){ output.value = ''; return; }
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const serial = String((Number(item.nextNumber) || 1)).padStart(3, '0');
  output.value = `${item.prefix || 'MZJ'}-${item.code}-${yy}${mm}-${serial}`;
}


function getFormData(form){
  const data = {};
  if(!form) return data;
  new FormData(form).forEach((value, key) => { data[key] = normalizeText(value); });
  return data;
}
function readSelectText(select){
  const text = select?.selectedOptions?.[0]?.textContent?.trim() || '';
  return text.startsWith('اختر') ? '' : text;
}
function collectCampaignRows(){
  return [...document.querySelectorAll('#creativeRows tr:not(.empty-row)')].map(row => ({
    creative: row.querySelector('.js-creative-select')?.value || '',
    departmentId: row.querySelector('.js-department-select')?.value || '',
    departmentName: readSelectText(row.querySelector('.js-department-select')),
    taskType: row.querySelector('.js-task-type')?.value || '',
    contentUserId: row.querySelector('.js-content-user')?.value || '',
    contentUserName: readSelectText(row.querySelector('.js-content-user')),
    shootingUserId: row.querySelector('.js-shoot-user')?.value || '',
    shootingUserName: readSelectText(row.querySelector('.js-shoot-user')),
    designUserId: row.querySelector('.js-design-user')?.value || '',
    designUserName: readSelectText(row.querySelector('.js-design-user')),
    montageUserId: row.querySelector('.js-edit-user')?.value || '',
    montageUserName: readSelectText(row.querySelector('.js-edit-user')),
    product: row.querySelector('.js-product-output')?.value || '',
    publishUserId: row.querySelector('td:nth-child(9) select')?.value || '',
    publishUserName: readSelectText(row.querySelector('td:nth-child(9) select'))
  })).filter(item => item.creative || item.departmentId || item.taskType || item.product);
}
function collectPublishRows(){
  return [...document.querySelectorAll('#publishRows tr:not(.empty-row)')].map(row => ({
    creative: row.querySelector('.js-creative-select')?.value || '',
    channel: readSelectText(row.querySelector('td:nth-child(2) select')),
    date: row.querySelector('td:nth-child(3) input')?.value || '',
    time: row.querySelector('td:nth-child(4) input')?.value || '',
    status: readSelectText(row.querySelector('td:nth-child(5) select'))
  })).filter(item => item.creative || item.date || item.time);
}
function collectBudgetRows(){
  return [...document.querySelectorAll('#budgetRows tr:not(.empty-row)')].map(row => ({
    item: normalizeText(row.querySelector('td:nth-child(1) input')?.value),
    amount: Number(row.querySelector('td:nth-child(2) input')?.value || 0),
    notes: normalizeText(row.querySelector('td:nth-child(3) input')?.value)
  })).filter(item => item.item || item.amount || item.notes);
}
async function saveCampaignToFirebase(){
  if(!mainDb){ showToast('اتصال Firebase غير متاح.'); return; }
  const request = getFormData(document.getElementById('campaignRequestForm'));
  const codeItem = campaignCodes.find(code => code.id === document.getElementById('campaignCodeSelect')?.value);
  const campaignCode = document.getElementById('campaignCodeInput')?.value || '';
  const payload = {
    ...request,
    campaignCode,
    campaignCodeId: codeItem?.id || '',
    campaignCodePrefix: codeItem?.prefix || '',
    campaignCodeShortCode: codeItem?.code || '',
    campaignType: request.campaign_type || '',
    creatives: collectCampaignRows(),
    publishSchedule: collectPublishRows(),
    budgetItems: collectBudgetRows(),
    status: request.request_status || 'draft',
    source: 'mzj-marketing-spa',
    updatedAt: serverTime(),
    createdAt: serverTime()
  };
  try{
    await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).add(payload);
    showToast('تم حفظ الحملة على Firebase.');
  }catch(error){
    console.error(error);
    showToast('تعذر حفظ الحملة على Firebase.');
  }
}

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
    creativeRows?.appendChild(row); refreshDynamicSelects();
  });
  document.getElementById('campaignCodeSelect')?.addEventListener('change', generateCampaignCode);
  document.getElementById('addPublishRowBtn')?.addEventListener('click', () => { clearEmptyRow(publishRows); const row = document.createElement('tr'); row.innerHTML = `<td>${makeSelect('الكريتيف', 'js-creative-select')}</td><td>${makeSelect('القناة')}</td><td><input type="date" /></td><td><input type="time" /></td><td>${makeSelect('الحالة')}</td><td><button class="delete-row" type="button">×</button></td>`; publishRows?.appendChild(row); refreshDynamicSelects(); });
  document.getElementById('addBudgetRowBtn')?.addEventListener('click', () => { clearEmptyRow(budgetRows); const row = document.createElement('tr'); row.innerHTML = `<td><input type="text" /></td><td><input type="number" min="0" step="0.01" /></td><td><input type="text" /></td><td><button class="delete-row" type="button">×</button></td>`; budgetRows?.appendChild(row); });
  document.addEventListener('click', event => { const btn = event.target.closest('.delete-row'); if(!btn) return; const tbody = btn.closest('tbody'); btn.closest('tr')?.remove(); if(tbody?.id === 'creativeRows') restoreEmptyRow(tbody, 10, 'ابدأ بإضافة صف كريتيف للحملة.'); if(tbody?.id === 'publishRows') restoreEmptyRow(tbody, 6, 'لا توجد مواعيد نشر.'); if(tbody?.id === 'budgetRows') restoreEmptyRow(tbody, 4, 'لا توجد بنود ميزانية.'); });
  document.addEventListener('change', event => { if(event.target.matches('.js-creative-select,.js-content-user,.js-shoot-user,.js-design-user,.js-edit-user')) updateProductOutput(event.target.closest('tr')); });
  document.getElementById('resetCampaignBuilder')?.addEventListener('click', () => { document.getElementById('campaignRequestForm')?.reset(); if(creativeRows) creativeRows.innerHTML = '<tr class="empty-row"><td colspan="10">ابدأ بإضافة صف كريتيف للحملة.</td></tr>'; if(publishRows) publishRows.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد مواعيد نشر.</td></tr>'; if(budgetRows) budgetRows.innerHTML = '<tr class="empty-row"><td colspan="4">لا توجد بنود ميزانية.</td></tr>'; generateCampaignCode(); });
  document.getElementById('saveCampaignDraft')?.addEventListener('click', saveCampaignToFirebase);
}

function resetForm(ids){ ids.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; }); }
function collectionByKind(kind){ return {department: window.MZJ_DEPARTMENTS_COLLECTION, creative: window.MZJ_CREATIVES_COLLECTION, taskType: window.MZJ_TASK_TYPES_COLLECTION, contentSection: window.MZJ_CONTENT_SECTIONS_COLLECTION, campaignCode: window.MZJ_CAMPAIGN_CODES_COLLECTION, campaignType: window.MZJ_CAMPAIGN_TYPES_COLLECTION}[kind]; }
async function deleteDoc(kind, id){ if(!mainDb || !id) return; if(!confirm('تأكيد الحذف؟')) return; await safeCollection(collectionByKind(kind)).doc(id).delete(); }
function bindNamedForm(formId, editId, inputId, messageId, collectionName, successText, extraPayloadFn = null){
  document.getElementById(formId)?.addEventListener('submit', async event => {
    event.preventDefault();
    const id = document.getElementById(editId)?.value;
    const name = normalizeText(document.getElementById(inputId)?.value);
    if(!name) return;
    if(!mainDb){ showMessage(messageId, 'اتصال Firebase غير متاح.'); return; }
    try{
      const payload = { name, ...(extraPayloadFn ? extraPayloadFn() : {}), updatedAt: serverTime() };
      if(id) await safeCollection(collectionName).doc(id).update(payload); else await safeCollection(collectionName).add({ ...payload, createdAt: serverTime() });
      event.target.reset(); resetForm([editId]); showMessage(messageId, successText);
    }catch(error){ console.error(error); showMessage(messageId, 'تعذر الحفظ.'); }
  });
}
function bindDepartments(){
  document.getElementById('departmentForm')?.addEventListener('submit', async event => {
    event.preventDefault(); const id = document.getElementById('departmentEditId')?.value; const name = normalizeText(document.getElementById('departmentName')?.value); const userIds = getSelectedValues(document.getElementById('departmentUsers'));
    if(!name) return; if(!mainDb){ showMessage('departmentMessage', 'اتصال Firebase غير متاح.'); return; }
    try{ const payload = { name, userIds, updatedAt: serverTime() }; if(id) await safeCollection(window.MZJ_DEPARTMENTS_COLLECTION).doc(id).update(payload); else await safeCollection(window.MZJ_DEPARTMENTS_COLLECTION).add({ ...payload, createdAt: serverTime() }); event.target.reset(); resetForm(['departmentEditId']); showMessage('departmentMessage', 'تم حفظ القسم.'); }
    catch(error){ console.error(error); showMessage('departmentMessage', 'تعذر حفظ القسم.'); }
  });
  bindNamedForm('creativeForm', 'creativeEditId', 'creativeName', 'creativeMessage', window.MZJ_CREATIVES_COLLECTION, 'تم حفظ الكريتيف.');
  bindNamedForm('taskTypeForm', 'taskTypeEditId', 'taskTypeName', 'taskTypeMessage', window.MZJ_TASK_TYPES_COLLECTION, 'تم حفظ نوع التاسك.');
  bindNamedForm('campaignTypeForm', 'campaignTypeEditId', 'campaignTypeName', 'campaignTypeMessage', window.MZJ_CAMPAIGN_TYPES_COLLECTION, 'تم حفظ نوع الحملة.');
  document.getElementById('campaignCodeForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const id = document.getElementById('campaignCodeEditId')?.value;
    const code = normalizeText(document.getElementById('campaignCodeValue')?.value).toUpperCase();
    const prefix = normalizeText(document.getElementById('campaignCodePrefix')?.value).toUpperCase() || 'MZJ';
    const name = normalizeText(document.getElementById('campaignCodeName')?.value);
    if(!code) return; if(!mainDb){ showMessage('campaignCodeMessage', 'اتصال Firebase غير متاح.'); return; }
    try{ const payload = { name: name || code, code, prefix, nextNumber: 1, updatedAt: serverTime() }; if(id) await safeCollection(window.MZJ_CAMPAIGN_CODES_COLLECTION).doc(id).update(payload); else await safeCollection(window.MZJ_CAMPAIGN_CODES_COLLECTION).add({ ...payload, createdAt: serverTime() }); event.target.reset(); document.getElementById('campaignCodePrefix').value = 'MZJ'; resetForm(['campaignCodeEditId']); showMessage('campaignCodeMessage', 'تم حفظ كود الحملة.'); }
    catch(error){ console.error(error); showMessage('campaignCodeMessage', 'تعذر حفظ كود الحملة.'); }
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
    const ccEdit = event.target.closest('[data-edit-campaign-code]'); if(ccEdit){ const item = campaignCodes.find(x => x.id === ccEdit.dataset.editCampaignCode); if(item){ document.getElementById('campaignCodeEditId').value = item.id; document.getElementById('campaignCodeValue').value = item.code || ''; document.getElementById('campaignCodePrefix').value = item.prefix || 'MZJ'; document.getElementById('campaignCodeName').value = item.name || ''; } return; }
    const ccDel = event.target.closest('[data-delete-campaign-code]'); if(ccDel){ await deleteDoc('campaignCode', ccDel.dataset.deleteCampaignCode); return; }
    const ctEdit = event.target.closest('[data-edit-campaign-type]'); if(ctEdit){ const item = campaignTypes.find(x => x.id === ctEdit.dataset.editCampaignType); if(item){ document.getElementById('campaignTypeEditId').value = item.id; document.getElementById('campaignTypeName').value = item.name; } return; }
    const ctDel = event.target.closest('[data-delete-campaign-type]'); if(ctDel){ await deleteDoc('campaignType', ctDel.dataset.deleteCampaignType); return; }
    const csEdit = event.target.closest('[data-edit-content-section]'); if(csEdit){ const item = contentSections.find(x => x.id === csEdit.dataset.editContentSection); if(item){ document.getElementById('contentSectionEditId').value = item.id; document.getElementById('contentSectionName').value = item.name; document.getElementById('contentSectionTypes').value = (item.types || []).join('\n'); } return; }
    const csDel = event.target.closest('[data-delete-content-section]'); if(csDel){ await deleteDoc('contentSection', csDel.dataset.deleteContentSection); }
  });
  document.getElementById('cancelDepartmentEdit')?.addEventListener('click', () => { document.getElementById('departmentForm')?.reset(); resetForm(['departmentEditId']); refreshDynamicSelects(); });
  document.getElementById('cancelCreativeEdit')?.addEventListener('click', () => { document.getElementById('creativeForm')?.reset(); resetForm(['creativeEditId']); });
  document.getElementById('cancelTaskTypeEdit')?.addEventListener('click', () => { document.getElementById('taskTypeForm')?.reset(); resetForm(['taskTypeEditId']); });
  document.getElementById('cancelCampaignCodeEdit')?.addEventListener('click', () => { document.getElementById('campaignCodeForm')?.reset(); document.getElementById('campaignCodePrefix').value = 'MZJ'; resetForm(['campaignCodeEditId']); });
  document.getElementById('cancelCampaignTypeEdit')?.addEventListener('click', () => { document.getElementById('campaignTypeForm')?.reset(); resetForm(['campaignTypeEditId']); });
  document.getElementById('cancelContentSectionEdit')?.addEventListener('click', () => { document.getElementById('contentSectionForm')?.reset(); resetForm(['contentSectionEditId']); });
  document.getElementById('refreshDepartmentsBtn')?.addEventListener('click', () => { renderDepartments(); renderCreatives(); renderTaskTypes(); renderCampaignCodes(); renderCampaignTypes(); renderContentSections(); });
  document.getElementById('refreshStockBtn')?.addEventListener('click', renderStock);
}

function bootstrapData(){
  if(bootstrapData.started) return;
  bootstrapData.started = true;
  initFirebase();
  loadUsers();
  loadDepartments();
  loadSimpleCollection(window.MZJ_CREATIVES_COLLECTION, creatives, renderCreatives);
  loadSimpleCollection(window.MZJ_TASK_TYPES_COLLECTION, taskTypes, renderTaskTypes);
  loadSimpleCollection(window.MZJ_CAMPAIGN_CODES_COLLECTION, campaignCodes, renderCampaignCodes);
  loadSimpleCollection(window.MZJ_CAMPAIGN_TYPES_COLLECTION, campaignTypes, renderCampaignTypes);
  if(mainDb){
    safeCollection(window.MZJ_CONTENT_SECTIONS_COLLECTION).orderBy('name').onSnapshot(snapshot => {
      contentSections = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id, types: Array.isArray(data.types) ? data.types.map(normalizeText).filter(Boolean) : [] }; });
      renderContentSections();
    }, error => console.error(error));
  }
  loadStock();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-menu]')?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); });
  overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });
  document.getElementById('loginForm')?.addEventListener('submit', async event => {
    event.preventDefault(); showMessage('loginMessage', 'جاري التحقق...'); initFirebase();
    const email = normalizeText(document.getElementById('loginEmail')?.value).toLowerCase(); const password = document.getElementById('loginPassword')?.value || '';
    if(mainDb){
      try{
        const snapshot = await mainDb.collection(window.MZJ_USERS_COLLECTION).where('email','==',email).limit(1).get();
        const doc = snapshot.docs[0]; const data = doc?.data() || null;
        if(!data || (data.password !== password && data.pass !== password)){ showMessage('loginMessage', 'بيانات الدخول غير صحيحة.'); return; }
      }catch(error){ console.error(error); showMessage('loginMessage', 'تعذر التحقق من بيانات الدخول.'); return; }
    }
    sessionStorage.setItem('mzj_logged_in','1'); showMessage('loginMessage', ''); openApp();
  });
  document.getElementById('logoutBtn')?.addEventListener('click', () => { sessionStorage.removeItem('mzj_logged_in'); openLogin(); });
  window.addEventListener('hashchange', () => { if(isLoggedIn()) renderRoute(); });
  bindCampaignBuilder(); bindDepartments(); isLoggedIn() ? openApp() : openLogin();
});
