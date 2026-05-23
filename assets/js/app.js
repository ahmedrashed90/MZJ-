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
window.MZJ_FUNNELS_COLLECTION = "marketing_funnels";
window.MZJ_PLATFORMS_COLLECTION = "marketing_platforms";
window.MZJ_STOCK_CARS_COLLECTION = "cars";
window.MZJ_CAMPAIGNS_COLLECTION = "marketing_campaigns";
window.MZJ_CAMPAIGN_TASKS_COLLECTION = "campaign_tasks";
window.MZJ_SYSTEM_SETTINGS_COLLECTION = "system_settings";
window.MZJ_SYSTEM_SETTINGS_DOC = "main";

const routes = ['dashboard','campaigns','create-campaign','departments','calendar','tasks','stock','reports','settings'];
const loginView = document.getElementById('loginView');
const appShell = document.getElementById('appShell');
const sidebar = document.getElementById('sidebar');
const overlay = document.querySelector('[data-close-menu]');

let mainDb = null;
let mainAuth = null;
let stockDb = null;
let departments = [];
let users = [];
let creatives = [];
let taskTypes = [];
let contentSections = [];
let campaignCodes = [];
let campaignTypes = [];
let funnels = [];
let platforms = [];
let campaigns = [];
let campaignTasks = [];
let cars = [];
let systemSettings = {};
let activeTaskModalMeta = null;

function isLoggedIn(){ return sessionStorage.getItem('mzj_logged_in') === '1'; }
function getRoute(){ return (location.hash || '#dashboard').replace('#',''); }
function openApp(){ loginView.classList.add('is-hidden'); appShell.classList.remove('is-hidden'); renderRoute(); bootstrapData(); }
function openLogin(){ appShell.classList.add('is-hidden'); loginView.classList.remove('is-hidden'); }
function renderRoute(){
  applyEffectiveTheme();
  applyUserPermissions();
  let route = routes.includes(getRoute()) ? getRoute() : 'dashboard';
  if(!pageAllowed(route)){
    route = 'dashboard';
    if(location.hash !== '#dashboard') location.hash = '#dashboard';
  }
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === route));
  document.querySelectorAll('.nav a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  sidebar?.classList.remove('open'); overlay?.classList.remove('show');
  if(route === 'dashboard') renderAdminDashboard();
  if(route === 'calendar') renderCalendarPage();
  if(route === 'tasks') renderTasksPage();
  if(route === 'stock') renderStock();
}
function showMessage(id, text){ const el = document.getElementById(id); if(el) el.textContent = text || ''; }
function escapeHtml(value){ return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function normalizeText(value){ return String(value ?? '').trim(); }
function getDocName(data){ return normalizeText(data.name || data.fullName || data.displayName || data.username || data.email || data.title || data.label); }
function uniqueList(list){ return [...new Set(list.map(normalizeText).filter(Boolean))]; }
function getSelectedValues(select){ return [...(select?.selectedOptions || [])].map(option => option.value).filter(Boolean); }
function serverTime(){ return firebase.firestore.FieldValue.serverTimestamp(); }
function safeCollection(name){ return mainDb.collection(name); }
function getCurrentUser(){ try{ return JSON.parse(sessionStorage.getItem('mzj_user') || '{}') || {}; }catch(_){ return {}; } }

function setCurrentUser(user){ sessionStorage.setItem('mzj_user', JSON.stringify(user || {})); }
function syncCurrentSessionUserFromUsers(){
  const current = getCurrentUser();
  if(!current || !Object.keys(current).length || !users.length) return;
  const currentKeys = uniqueIdentityKeys([current]);
  const record = users.find(user => uniqueIdentityKeys([user]).some(key => currentKeys.includes(key)));
  if(record){ setCurrentUser({ ...current, ...record, id: record.id || current.id, uid: record.uid || current.uid || record.id }); }
}
function isCurrentUserAdmin(){ const user = getCurrentUser(); return user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes('admin')); }
function pageAllowed(route){
  if(isCurrentUserAdmin()) return true;
  return allowedPagesForCurrentUser().includes(route);
}

function allowedPagesForCurrentUser(){
  if(isCurrentUserAdmin()) return routes;
  const user = getCurrentUser();
  const raw = Array.isArray(user.pages) && user.pages.length ? user.pages : (Array.isArray(user.pagesAccess) ? user.pagesAccess : []);
  return uniqueList(['dashboard', ...raw]);
}
function applyUserPermissions(){
  const allowed = allowedPagesForCurrentUser();
  document.querySelectorAll('.nav a[data-route]').forEach(link => {
    const route = link.dataset.route;
    link.classList.toggle('is-hidden', !isCurrentUserAdmin() && !allowed.includes(route));
  });
}


function initFirebase(){
  if(!window.firebase || !firebase.apps) return;
  try{
    const mainApp = firebase.apps.find(app => app.name === '[DEFAULT]') || firebase.initializeApp(window.MZJ_FIREBASE_CONFIG);
    mainDb = firebase.firestore(mainApp);
    if(firebase.auth) mainAuth = firebase.auth(mainApp);
  }catch(error){ console.error('Main Firebase init error', error); }
  try{
    const stockApp = firebase.apps.find(app => app.name === 'stockApp') || firebase.initializeApp(window.MZJ_STOCK_FIREBASE_CONFIG, 'stockApp');
    stockDb = firebase.firestore(stockApp);
  }catch(error){ console.error('Stock Firebase init error', error); }
}

function userName(user){ return user?.name || user?.displayName || user?.username || user?.email || user?.id || ''; }
function findUserByAnyIdentity(values){
  const keys = uniqueIdentityKeys(Array.isArray(values) ? values : [values]);
  if(!keys.length) return null;
  return users.find(user => uniqueIdentityKeys([user, user.id, user.uid, user.email, user.emailLower, user.name, user.displayName, user.username]).some(key => keys.includes(key))) || null;
}
function namesFromIds(ids){ return (ids || []).map(id => userName(findUserByAnyIdentity(id)) || id).filter(Boolean); }
function userOptions(selectedValue = ''){
  return '<option value="">اختر اليوزر</option>' + users.map(user => `<option value="${escapeHtml(user.id)}"${selectedValue === user.id ? ' selected' : ''}>${escapeHtml(userName(user))}</option>`).join('');
}
function multiUserOptions(selectedIds = []){
  return users.map(user => `<option value="${escapeHtml(user.id)}"${selectedIds.includes(user.id) ? ' selected' : ''}>${escapeHtml(userName(user))}</option>`).join('');
}

function departmentAliases(role){
  return {
    content: ['المحتوى','محتوى','content','content writer','كتابة المحتوى','قسم المحتوى'],
    shooting: ['التصوير','تصوير','shoot','shooting','photo','photography','قسم التصوير'],
    design: ['التصميم','تصميم','design','graphic','قسم التصميم'],
    montage: ['المونتاج','مونتاج','montage','editing','video editing','قسم المونتاج'],
    publish: ['النشر','نشر','publish','publishing','social','قسم النشر']
  }[role] || [];
}
function findDepartmentByRole(role){
  const aliases = departmentAliases(role).map(x => normalizeText(x).toLowerCase());
  return departments.find(dep => {
    const name = normalizeText(dep.name).toLowerCase();
    const slug = normalizeText(dep.slug).toLowerCase();
    return aliases.some(alias => name === alias || name.includes(alias) || slug === alias || slug.includes(alias));
  });
}
function usersForRole(role){
  const dep = findDepartmentByRole(role);
  if(!dep || !Array.isArray(dep.userIds) || !dep.userIds.length) return [];
  return dep.userIds.map(id => users.find(user => user.id === id)).filter(Boolean);
}
function multiUserOptionsForRole(role, selectedIds = []){
  const list = usersForRole(role);
  const options = list.map(user => `<option value="${escapeHtml(user.id)}"${selectedIds.includes(user.id) ? ' selected' : ''}>${escapeHtml(userName(user))}</option>`).join('');
  return options || '<option value="" disabled>لا توجد يوزرات في هذا القسم</option>';
}
function rolePickerHtml(role, extraClass, label){
  return `<div class="multi-dropdown js-role-picker ${extraClass}" data-role="${escapeHtml(role)}" aria-label="${escapeHtml(label)}"><button class="multi-toggle" type="button">اختيار ${escapeHtml(label)}</button><div class="multi-menu"></div></div>`;
}
function refreshRolePicker(picker){
  const selected = selectedOptionValues(picker);
  const role = picker.dataset.role;
  const list = usersForRole(role);
  const menu = picker.querySelector('.multi-menu');
  const button = picker.querySelector('.multi-toggle');
  if(menu){
    menu.innerHTML = list.length ? list.map(user => `<label><input type="checkbox" value="${escapeHtml(user.id)}" data-name="${escapeHtml(userName(user))}"${selected.includes(user.id) ? ' checked' : ''}> <span>${escapeHtml(userName(user))}</span></label>`).join('') : '<div class="multi-empty">لا توجد يوزرات في هذا القسم</div>';
  }
  updateRolePickerLabel(picker);
}
function updateRolePickerLabel(picker){
  const button = picker?.querySelector('.multi-toggle');
  const names = selectedOptionTexts(picker);
  if(button) button.textContent = names.length ? names.join('، ') : `اختيار ${picker.getAttribute('aria-label') || ''}`;
}
function contentSectionOptions(selectedValue = ''){
  return '<option value="">اختار المحتوى</option>' + contentSections.map(item => `<option value="${escapeHtml(item.id)}"${selectedValue === item.id ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}
function taskTypeOptionsForSection(sectionId, selectedValue = ''){
  const section = contentSections.find(item => item.id === sectionId);
  const types = Array.isArray(section?.types) ? section.types : [];
  return '<option value="">اختر نوع التاسك</option>' + types.map(type => `<option value="${escapeHtml(type)}"${selectedValue === type ? ' selected' : ''}>${escapeHtml(type)}</option>`).join('');
}

function usersForContentSection(sectionId){
  const section = contentSections.find(item => item.id === sectionId);
  const ids = Array.isArray(section?.userIds) ? section.userIds : Array.isArray(section?.memberUids) ? section.memberUids : Array.isArray(section?.users) ? section.users : [];
  if(ids.length) return ids.map(id => users.find(user => user.id === id)).filter(Boolean);
  const departmentId = section?.departmentId || section?.department || section?.contentDepartmentId || '';
  if(departmentId){
    const dep = departments.find(item => item.id === departmentId || item.name === departmentId);
    if(dep?.userIds?.length) return dep.userIds.map(id => users.find(user => user.id === id)).filter(Boolean);
  }
  return users;
}
function multiTaskUserOptions(sectionId, selectedIds = []){
  const list = usersForContentSection(sectionId);
  return list.length ? list.map(user => `<option value="${escapeHtml(user.id)}"${selectedIds.includes(user.id) ? ' selected' : ''}>${escapeHtml(userName(user))}</option>`).join('') : '<option value="" disabled>لا توجد يوزرات لهذا القسم</option>';
}
function selectedOptionTexts(control){
  if(control?.classList?.contains('js-role-picker')){
    return [...control.querySelectorAll('input[type="checkbox"]:checked')]
      .map(input => input.dataset.name || input.closest('label')?.textContent?.trim() || '')
      .filter(Boolean);
  }
  return [...(control?.selectedOptions || [])]
    .map(option => option.textContent.trim())
    .filter(text => text && !text.startsWith('اختر') && !text.startsWith('لا توجد'));
}
function selectedOptionValues(control){
  if(control?.classList?.contains('js-role-picker')){
    return [...control.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value).filter(Boolean);
  }
  return [...(control?.selectedOptions || [])]
    .map(option => option.value)
    .filter(Boolean);
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
function platformOptions(selectedValue = ''){
  return '<option value="">اختر المنصة</option>' + platforms.map(item => `<option value="${escapeHtml(item.name)}"${selectedValue === item.name ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}
function platformCheckboxList(selected = []){
  const chosen = Array.isArray(selected) ? selected.map(String) : String(selected || '').split('،').map(x => x.trim()).filter(Boolean);
  return platforms.length ? platforms.map(item => `<label class="platform-check-card"><input type="checkbox" class="js-platform-checkbox" value="${escapeHtml(item.name)}"${chosen.includes(item.name) ? ' checked' : ''}> <span>${escapeHtml(item.name)}</span></label>`).join('') : '<div class="multi-empty">لا توجد منصات</div>';
}
function selectedPlatformValues(card){
  return [...(card?.querySelectorAll('.js-platform-checkbox:checked') || [])].map(input => input.value).filter(Boolean);
}
function funnelOptions(selectedValue = ''){
  return '<option value="">اختر Funnel</option>' + funnels.map(item => `<option value="${escapeHtml(item.name)}"${selectedValue === item.name ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}
function productOptions(selectedValue = ''){
  const products = getCampaignProducts();
  return '<option value="">اختر المنتج</option>' + products.map(item => `<option value="${escapeHtml(item)}"${selectedValue === item ? ' selected' : ''}>${escapeHtml(item)}</option>`).join('');
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
  document.querySelectorAll('.js-content-section-select,.js-task-section-select').forEach(select => { const value = select.value; select.innerHTML = contentSectionOptions(value); });
  document.querySelectorAll('.js-creative-select').forEach(select => { const value = select.value; select.innerHTML = creativeOptions(value); });
  document.querySelectorAll('.js-task-type').forEach(select => {
    const value = select.value;
    const block = select.closest('.creative-task-block');
    const row = select.closest('.creative-row-card');
    const sectionId = block?.querySelector('.js-task-section-select')?.value || row?.querySelector('.js-content-section-select')?.value || '';
    select.innerHTML = taskTypeOptionsForSection(sectionId, value);
  });
  document.querySelectorAll('.js-task-user').forEach(select => {
    const selected = selectedOptionValues(select);
    const block = select.closest('.creative-task-block');
    const sectionId = block?.querySelector('.js-task-section-select')?.value || '';
    select.innerHTML = multiTaskUserOptions(sectionId, selected);
  });
  document.querySelectorAll('.js-user-select').forEach(select => { const value = select.value; select.innerHTML = userOptions(value); });
  document.querySelectorAll('.js-role-user-select').forEach(select => {
    const selected = selectedOptionValues(select);
    select.innerHTML = multiUserOptionsForRole(select.dataset.role, selected);
  });
  document.querySelectorAll('.js-campaign-code-select').forEach(select => { const value = select.value; select.innerHTML = campaignCodeOptions(value); });
  document.querySelectorAll('.js-campaign-type-select').forEach(select => { const value = select.value; select.innerHTML = campaignTypeOptions(value); });
  document.querySelectorAll('.publish-platform-checks').forEach(box => {
    const card = box.closest('.publish-day-card');
    const selected = selectedPlatformValues(card);
    box.innerHTML = platformCheckboxList(selected);
  });
  document.querySelectorAll('.js-funnel-select').forEach(select => { const value = select.value; select.innerHTML = funnelOptions(value); });
  document.querySelectorAll('.js-product-select').forEach(select => { const value = select.value; select.innerHTML = productOptions(value); });
  document.querySelectorAll('.js-role-picker').forEach(refreshRolePicker);
  const departmentUsers = document.getElementById('departmentUsers');
  if(departmentUsers){ const selected = getSelectedValues(departmentUsers); departmentUsers.innerHTML = multiUserOptions(selected); }
  generateCampaignCode();
  updateAllProductOutputs();
}

function loadUsers(){
  if(!mainDb) return;
  safeCollection(window.MZJ_USERS_COLLECTION).onSnapshot(snapshot => {
    users = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, uid: data.uid || doc.id, name: getDocName(data) || doc.id, displayName: data.displayName || '', username: data.username || '', email: data.email || '', emailLower: data.emailLower || String(data.email || '').toLowerCase(), department: data.department || '', departmentId: data.departmentId || '', departmentIds: Array.isArray(data.departmentIds) ? data.departmentIds : [], role: data.role || '', pages: Array.isArray(data.pages) ? data.pages : [], pagesAccess: Array.isArray(data.pagesAccess) ? data.pagesAccess : [], themeSettings: data.themeSettings || null }; });
    syncCurrentSessionUserFromUsers();
    refreshDynamicSelects(); renderDepartments(); renderUsersPermissions(); renderAdminDashboard(); renderTasksPage();
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
    departments = snapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        slug: data.slug || '',
        name: getDocName(data) || doc.id,
        userIds: Array.isArray(data.userIds) ? data.userIds : [],
        users: Array.isArray(data.users) ? data.users : [],
        members: Array.isArray(data.members) ? data.members : [],
        memberUids: Array.isArray(data.memberUids) ? data.memberUids : [],
        memberEmails: Array.isArray(data.memberEmails) ? data.memberEmails : [],
        memberNames: Array.isArray(data.memberNames) ? data.memberNames : []
      };
    });
    renderDepartments(); refreshDynamicSelects(); renderAdminDashboard(); renderTasksPage();
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
function renderPlatforms(){ renderNameList('platformsList', platforms, 'data-edit-platform', 'data-delete-platform', 'لا توجد منصات حتى الآن.'); }
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
  return text.includes('تم التسليم') || text.includes('تحت التسليم') || text.includes('مؤرشف') || text.includes('ارشيف') || text.includes('أرشيف') || text.includes('archive');
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
  if(tbody) tbody.innerHTML = '<tr class="empty-row"><td colspan="5">تعذر تحميل بيانات الاستوك.</td></tr>';
}
function renderStock(){
  const tbody = document.getElementById('stockSummaryRows');
  const setText = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  const visibleCars = cars.filter(car => !isExcludedStockStatus(stockStatusOf(car)));
  setText('stockTotalCars', cars.length || '—');
  setText('dashboardCarsCount', visibleCars.length || '—');
  setText('stockAvailableAfterExclude', visibleCars.length || '—');
  setText('stockAvailableForSale', visibleCars.length || '—');
  setText('stockReserved', '—');
  setText('stockUnderDelivery', '—');
  if(!tbody) return;
  if(!visibleCars.length){ tbody.innerHTML = '<tr class="empty-row"><td colspan="7">لا توجد بيانات استوك متاحة.</td></tr>'; return; }

  const groups = new Map();
  visibleCars.forEach(car => {
    const carName = normalizeText(car.carName || '—') || '—';
    const statement = normalizeText(car.statement || '—') || '—';
    const exteriorColor = normalizeText(car.exteriorColor || '—') || '—';
    const interiorColor = normalizeText(car.interiorColor || '—') || '—';
    const key = [carName, statement, exteriorColor, interiorColor].join(' | ');
    if(!groups.has(key)) groups.set(key, { key, carName, statement, exteriorColor, interiorColor, count: 0 });
    groups.get(key).count += 1;
  });

  const rows = [...groups.values()].sort((a,b) => b.count - a.count || a.key.localeCompare(b.key, 'ar'));
  tbody.innerHTML = rows.map((group, index) => `<tr>
      <td>${index + 1}</td>
      <td class="stock-key">${escapeHtml(group.carName)}${group.statement ? `<small>${escapeHtml(group.statement)}</small>` : ''}</td>
      <td>${escapeHtml(group.carName)}</td>
      <td>${escapeHtml(group.statement)}</td>
      <td>${escapeHtml(group.exteriorColor)}</td>
      <td>${escapeHtml(group.interiorColor)}</td>
      <td><span class="stock-count">${group.count}</span></td>
    </tr>`).join('');
}
function clearEmptyRow(container){ container?.querySelector('.empty-row, .empty-state')?.remove(); }
function restoreEmptyRow(container, colSpan, text){
  if(!container || container.children.length !== 0) return;
  if(container.tagName === 'TBODY'){ const row = document.createElement('tr'); row.className = 'empty-row'; row.innerHTML = `<td colspan="${colSpan}">${text}</td>`; container.appendChild(row); }
  else { const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = text; container.appendChild(empty); }
}
function makeSelect(label, className = ''){ return `<select class="${className}" aria-label="${label}"><option value="">اختر</option></select>`; }
function showToast(text){ let toast = document.querySelector('.save-toast'); if(!toast){ toast = document.createElement('div'); toast.className = 'save-toast'; document.body.appendChild(toast); } toast.textContent = text; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 1800); }
function taskBlockHtml(index){
  return `<div class="creative-task-block" data-task-index="${index}">
    <label><span>اختار المحتوى</span><select class="js-task-section-select">${contentSectionOptions()}</select></label>
    <label><span>نوع التاسك</span><select class="js-task-type"><option value="">اختر نوع التاسك</option></select></label>
    <label class="task-qty-field"><span>العدد</span><input class="js-task-quantity" type="number" min="1" value="1" aria-label="عدد التاسكات" /></label>
    <label><span>اليوزر</span><select class="js-task-user" multiple>${multiTaskUserOptions('', [])}</select></label>
  </div>`;
}

function updateProductOutput(row){
  const creative = row?.querySelector('.js-creative-select')?.value || '';
  const userNames = [...(row?.querySelectorAll('.js-task-user') || [])].flatMap(control => selectedOptionTexts(control));
  const output = row?.querySelector('.js-product-output');
  if(output) output.value = creative && userNames.length ? `${creative} - ${uniqueList(userNames).join(' - ')}` : '';
}
function updateAllProductOutputs(){ document.querySelectorAll('#creativeRows .creative-row-card').forEach(updateProductOutput); }
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


function normalizeDepartmentRole(name){
  const text = normalizeText(name).toLowerCase();
  if(['التصوير','تصوير','shooting','photography','photo'].some(x => text.includes(x))) return 'shooting';
  if(['المحتوى','محتوى','content','writer','copy'].some(x => text.includes(x))) return 'content';
  if(['التصميم','تصميم','design','graphic'].some(x => text.includes(x))) return 'design';
  if(['المونتاج','مونتاج','montage','edit','video'].some(x => text.includes(x))) return 'montage';
  if(['النشر','نشر','publish','social'].some(x => text.includes(x))) return 'publish';
  return 'other';
}
function departmentForUser(userId){
  const user = findUserByAnyIdentity(userId) || {};
  const ids = [user.departmentId, ...(Array.isArray(user.departmentIds) ? user.departmentIds : [])].filter(Boolean);
  let dep = departments.find(item => ids.includes(item.id));
  if(!dep && user.department) dep = departments.find(item => item.id === user.department || normalizeText(item.name).toLowerCase() === normalizeText(user.department).toLowerCase());
  if(!dep){
    const userKeys = uniqueIdentityKeys([userId, user]);
    dep = departments.find(item => Array.isArray(item.userIds) && item.userIds.some(id => userKeys.includes(identityClean(id))));
  }
  return dep || { id: user.departmentId || user.department || '', name: user.department || '' };
}
function taskStepTemplate(role){
  const templates = {
    shooting: [
      ['التصوير قبل الفلترة', 20, false], ['الاعتماد', 20, true], ['الاديت', 20, false], ['الاعتماد', 20, true], ['التسليم و الارفاق', 20, false]
    ],
    content: [
      ['نموذج المحتوى', 20, false], ['الاعتماد', 20, true], ['كتابة المحتوى', 20, false], ['الاعتماد', 20, true], ['التسليم و الارفاق', 20, false]
    ],
    design: [
      ['النسخة الاولى', 35, false], ['الاعتماد', 35, true], ['التسليم و الارفاق', 30, false]
    ],
    montage: [
      ['اختيار اللقطات المناسبة', 10, false], ['تجهيز مشاهد الذكاء الاصطناعي', 10, false], ['فويس اوفر', 10, false], ['الهوك', 10, false], ['الاعتماد', 15, true], ['النسخة الأولى', 20, false], ['الاعتماد', 15, true], ['التسليم و الارفاق', 10, false]
    ],
    publish: [['استلام النشر', 25, false], ['التجهيز', 25, false], ['النشر', 50, false]],
    other: [['تم الاستلام', 20, false], ['التنفيذ', 60, false], ['التسليم و الارفاق', 20, false]]
  };
  return (templates[role] || templates.other).map(([label, percent, adminOnly], index) => ({ label, percent, adminOnly, done: false, index }));
}
function taskProgress(task){
  if(Array.isArray(task.steps) && task.steps.length){
    return Math.min(100, Math.round(task.steps.reduce((sum, step) => sum + (step.done ? Number(step.percent || 0) : 0), 0)));
  }
  return Number(task.progress || 0);
}
function fallbackTasksFromCampaign(campaign){
  const fallback = [];
  (campaign.creatives || []).forEach((creativeRow, creativeIndex) => {
    (creativeRow.tasks || []).forEach((task, taskIndex) => {
      const ids = Array.isArray(task.userIds) ? task.userIds : [];
      const names = Array.isArray(task.userNames) ? task.userNames : [];
      const entries = ids.length ? ids.map((id, i) => ({ id, name: names[i] || id })) : names.map((name, i) => ({ id: `${campaign.id || 'campaign'}-${creativeIndex}-${taskIndex}-${i}`, name }));
      const finalEntries = entries.length ? entries : [{ id: `${campaign.id || 'campaign'}-${creativeIndex}-${taskIndex}`, name: 'غير محدد' }];
      finalEntries.forEach(entry => {
        const user = findUserByAnyIdentity([entry.id, entry.name]) || {};
        const dep = departmentForUser(user.id || entry.id);
        const role = normalizeDepartmentRole(dep.name || user.department || task.contentSectionName);
        fallback.push({
          id: `fallback-${campaign.id || 'campaign'}-${creativeIndex}-${taskIndex}-${entry.id}`,
          campaignId: campaign.id,
          campaignName: campaign.campaignName || campaign.name || campaign.campaign_name || '',
          campaignCode: campaign.campaignCode || campaign.campaign_code || '',
          creative: creativeRow.creative || '',
          product: creativeRow.product || '',
          selectedCars: creativeRow.selectedCars || [],
          selectedCar: (creativeRow.selectedCars || []).map(car => car.label).join('، '),
          contentSectionId: task.contentSectionId || '',
          contentSectionName: task.contentSectionName || '',
          taskType: task.taskType || '',
          assignedToUid: user.id || entry.id || '',
          assignedToName: userName(user) || entry.name || 'غير محدد',
          assignedToEmail: user.email || '',
          displayName: user.displayName || '',
          username: user.username || '',
          assignedToSearch: uniqueList([entry.id, user.id, user.uid, user.email, user.emailLower, userName(user), user.name, user.displayName, user.username, entry.name].filter(Boolean)),
          assignedDepartmentId: dep.id || '',
          assignedDepartmentName: dep.name || user.department || task.contentSectionName || '',
          departmentRole: role,
          received: false,
          progress: 0,
          steps: taskStepTemplate(role),
          status: 'pending',
          creativeIndex,
          taskIndex,
          source: 'campaign-creatives-fallback'
        });
      });
    });
  });
  return fallback;
}
function normalizeCampaignTask(task, campaign){
  const role = task.departmentRole || normalizeDepartmentRole(task.assignedDepartmentName || task.departmentName || task.contentSectionName || '');
  return { ...task, id: task.id || `${campaign.id}-${task.creativeIndex || 0}-${task.taskIndex || 0}-${task.assignedToUid || task.assigneeUid || task.userId || Math.random().toString(36).slice(2)}`, campaignId: task.campaignId || campaign.id, campaignName: task.campaignName || campaign.campaignName || campaign.name || '', campaignCode: task.campaignCode || campaign.campaignCode || campaign.campaign_code || '', departmentRole: role, steps: Array.isArray(task.steps) && task.steps.length ? task.steps : taskStepTemplate(role) };
}
function taskSignature(task){
  const userKey = identityClean(task.userId || task.userUid || task.assignedToId || task.assignedToUid || task.assigneeUid || task.userEmail || task.assignedToEmail || task.userName || task.assignedToName || '');
  const sectionKey = identityClean(task.contentSectionId || task.contentSectionName || task.assignedDepartmentId || task.assignedDepartmentName || task.departmentRole || '');
  const carKey = identityClean(task.selectedCar || (Array.isArray(task.selectedCars) ? task.selectedCars.map(car => car?.id || car?.label || '').join('|') : ''));
  return [
    task.campaignId || '',
    task.creativeIndex ?? '',
    task.taskIndex ?? '',
    task.taskCopyIndex ?? '',
    identityClean(task.creative || ''),
    sectionKey,
    identityClean(task.taskType || ''),
    userKey,
    carKey
  ].join('::');
}
function mergeCampaignTasks(list){
  const seen = new Set();
  const out = [];
  list.forEach(task => {
    if(!task) return;
    const sig = taskSignature(task);
    if(seen.has(sig)) return;
    seen.add(sig);
    out.push(task);
  });
  return out;
}
function tasksForCampaign(campaign){
  const fromDepartmentTasks = Array.isArray(campaign.departmentTasks) ? campaign.departmentTasks.map(task => normalizeCampaignTask(task, campaign)) : [];
  const saved = campaignTasks.filter(task => task.campaignId === campaign.id || task.campaignId === campaign.docId).map(task => normalizeCampaignTask(task, campaign));
  const fallback = fallbackTasksFromCampaign(campaign).map(task => normalizeCampaignTask(task, campaign));
  return mergeCampaignTasks([...fromDepartmentTasks, ...saved, ...fallback]);
}
function groupTasksForKanban(tasks){
  const order = ['content','shooting','design','montage','publish','other'];
  const labels = { content:'المحتوى', shooting:'التصوير', design:'التصميم', montage:'المونتاج', publish:'النشر', other:'أخرى' };
  return order.map(role => ({ role, label: labels[role], tasks: tasks.filter(task => (task.departmentRole || 'other') === role) })).filter(group => group.tasks.length);
}
function campaignRequiredProgress(campaign){
  const related = tasksForCampaign(campaign);
  const roles = ['content','shooting','design','montage'];
  if(!related.length) return 0;
  return Math.round(roles.reduce((total, role) => {
    const tasks = related.filter(task => task.departmentRole === role);
    if(!tasks.length) return total;
    const avg = tasks.reduce((sum, task) => sum + taskProgress(task), 0) / tasks.length;
    return total + (avg * 0.25);
  }, 0));
}
function campaignPublishProgress(campaign){
  const stages = campaign.publishStages || {};
  return (stages.prep ? 35 : 0) + (stages.approval ? 30 : 0) + (stages.publish ? 35 : 0);
}

function identityClean(value){
  return normalizeText(value)
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g,'')
    .replace(/[أإآا]/g,'ا')
    .replace(/[ىي]/g,'ي')
    .replace(/ة/g,'ه')
    .replace(/\s+/g,' ')
    .trim();
}
function identityTokens(value){
  return identityClean(value).split(/[\s_\-.@]+/).filter(part => part.length > 2);
}
function flattenIdentityValues(value){
  if(value === null || value === undefined) return [];
  if(Array.isArray(value)) return value.flatMap(flattenIdentityValues);
  if(typeof value === 'object'){
    return [
      value.id, value.uid, value.email, value.emailLower, value.name, value.displayName, value.username,
      value.userId, value.userUid, value.userEmail, value.userName,
      value.assigneeUid, value.assigneeId, value.assigneeEmail, value.assigneeName,
      value.assignedToUid, value.assignedToId, value.assignedToEmail, value.assignedToName,
      value.assignedToSearch, value.searchKeys, value.displayName, value.username,
      value.memberUids, value.memberEmails, value.memberNames, value.userIds, value.userNames
    ].flatMap(flattenIdentityValues);
  }
  return [value];
}
function uniqueIdentityKeys(values){
  return uniqueList(flattenIdentityValues(values).map(identityClean).filter(Boolean));
}
function findCurrentUserRecord(){
  const sessionUser = getCurrentUser();
  return findUserByAnyIdentity([sessionUser, sessionUser.id, sessionUser.uid, sessionUser.email, sessionUser.emailLower, sessionUser.name, sessionUser.displayName, sessionUser.username]) || sessionUser;
}
function currentUserIdentityKeys(){
  const sessionUser = getCurrentUser();
  const matchedUser = findCurrentUserRecord() || {};
  const authUser = mainAuth?.currentUser || null;
  return uniqueIdentityKeys([
    sessionUser, matchedUser,
    sessionUser.id, sessionUser.uid, sessionUser.email, sessionUser.emailLower, sessionUser.name, sessionUser.displayName, sessionUser.username,
    matchedUser.id, matchedUser.uid, matchedUser.email, matchedUser.emailLower, matchedUser.name, matchedUser.displayName, matchedUser.username,
    authUser?.uid, authUser?.email, authUser?.displayName
  ]);
}
function taskIdentityKeys(task){
  return uniqueIdentityKeys([
    task,
    task.userId, task.userUid, task.userEmail, task.userName,
    task.assigneeId, task.assigneeUid, task.assigneeEmail, task.assigneeName,
    task.assignedToId, task.assignedToUid, task.assignedToEmail, task.assignedToName,
    task.assignedToSearch, task.searchKeys,
    task.userIds, task.userNames, task.assigneeIds, task.assigneeNames, task.assignedToIds, task.assignedToNames,
    task.users, task.assignees, task.assignedUsers
  ]);
}
function identityIntersects(a, b){
  return a.some(x => b.includes(x));
}
function currentUserMatchesTaskExact(task){
  const userKeys = currentUserIdentityKeys();
  const taskKeys = taskIdentityKeys(task);
  if(identityIntersects(userKeys, taskKeys)) return true;

  const current = findCurrentUserRecord() || getCurrentUser();
  const authUser = mainAuth?.currentUser || null;
  const currentName = identityClean(current.name || current.displayName || current.username || authUser?.displayName || '');
  const currentEmail = identityClean(current.email || current.emailLower || authUser?.email || '');
  const currentId = identityClean(current.id || current.uid || authUser?.uid || '');
  const explicitValues = [
    task.assignedToName, task.assigneeName, task.userName,
    task.assignedToEmail, task.assigneeEmail, task.userEmail,
    task.assignedToId, task.assignedToUid, task.assigneeId, task.assigneeUid, task.userId, task.userUid,
    task.assignedToSearch, task.searchKeys, task.displayName, task.username,
    ...(Array.isArray(task.userIds) ? task.userIds : []),
    ...(Array.isArray(task.userNames) ? task.userNames : []),
    ...(Array.isArray(task.assignedToIds) ? task.assignedToIds : []),
    ...(Array.isArray(task.assignedToNames) ? task.assignedToNames : []),
    ...(Array.isArray(task.assigneeIds) ? task.assigneeIds : []),
    ...(Array.isArray(task.assigneeNames) ? task.assigneeNames : [])
  ].flatMap(flattenIdentityValues).map(identityClean).filter(Boolean);
  if(currentId && explicitValues.includes(currentId)) return true;
  if(currentEmail && explicitValues.includes(currentEmail)) return true;
  if(currentName && explicitValues.includes(currentName)) return true;
  const signals = [currentId, currentEmail, currentName, ...userKeys].filter(v => v && v.length > 3);
  if(signals.some(signal => explicitValues.some(value => value.includes(signal) || signal.includes(value)))) return true;
  try{
    const taskBlob = identityClean(JSON.stringify(task));
    if(signals.some(signal => taskBlob.includes(signal))) return true;
  }catch(_){ }
  return false;
}
function roleAliases(role){
  const map = {
    shooting: ['shooting','photography','photo','قسم التصوير','التصوير','تصوير','التصوير + الايديت'],
    content: ['content','copy','writer','قسم المحتوى','المحتوى','محتوى','المحتوي'],
    design: ['design','graphic','قسم التصميم','التصميم','تصميم'],
    montage: ['montage','edit','video','قسم المونتاج','المونتاج','مونتاج'],
    publish: ['publish','social','قسم النشر','النشر','نشر']
  };
  return map[role] || [role];
}
function userDepartmentIdentityKeys(){
  const current = findCurrentUserRecord() || getCurrentUser();
  const currentKeys = currentUserIdentityKeys();
  const direct = [current.department, current.departmentId, current.departmentName, ...(Array.isArray(current.departmentIds) ? current.departmentIds : [])].filter(Boolean);
  const directRoles = uniqueList(direct.map(value => normalizeDepartmentRole(value)).filter(role => role && role !== 'other'));
  const deps = departments.filter(dep => {
    const depUsers = [dep.userIds, dep.users, dep.members, dep.memberUids, dep.memberEmails, dep.memberNames].flatMap(flattenIdentityValues);
    const depKeys = uniqueIdentityKeys(depUsers);
    const depRole = normalizeDepartmentRole(dep.name || dep.slug || dep.id || '');
    return identityIntersects(currentKeys, depKeys) || direct.some(value => identityClean(value) && (identityClean(value) === identityClean(dep.id) || identityClean(value) === identityClean(dep.name) || identityClean(value) === identityClean(dep.slug))) || directRoles.includes(depRole);
  });
  const sections = contentSections.filter(section => {
    const sectionUsers = [section.userIds, section.users, section.members, section.memberUids, section.memberEmails, section.memberNames].flatMap(flattenIdentityValues);
    const sectionKeys = uniqueIdentityKeys(sectionUsers);
    const sectionDepartment = [section.departmentId, section.department, section.contentDepartmentId].flatMap(flattenIdentityValues);
    const sectionRole = normalizeDepartmentRole(section.name || section.slug || section.id || '');
    return identityIntersects(currentKeys, sectionKeys) || sectionDepartment.some(value => direct.some(d => identityClean(d) && identityClean(d) === identityClean(value))) || directRoles.includes(sectionRole);
  });
  const roles = uniqueList([
    ...directRoles,
    ...deps.map(dep => normalizeDepartmentRole(dep.name || dep.slug || dep.id || '')).filter(role => role !== 'other'),
    ...sections.map(section => normalizeDepartmentRole(section.name || section.slug || section.id || '')).filter(role => role !== 'other')
  ]);
  return uniqueIdentityKeys([
    ...direct,
    ...roles,
    ...roles.flatMap(roleAliases),
    ...deps.flatMap(dep => [dep.id, dep.name, dep.slug, normalizeDepartmentRole(dep.name || dep.slug || dep.id || '')]),
    ...sections.flatMap(section => [section.id, section.name, section.slug, normalizeDepartmentRole(section.name || section.slug || section.id || '')])
  ]);
}
function currentUserMatchesTaskDepartment(task){
  const depKeys = userDepartmentIdentityKeys();
  if(!depKeys.length) return false;
  const taskRole = normalizeDepartmentRole(task.contentSectionName || task.assignedDepartmentName || task.departmentName || task.departmentRole || '');
  const taskDepKeys = uniqueIdentityKeys([
    task.contentSectionId, task.contentSectionName, task.assignedDepartmentId, task.assignedDepartmentName,
    task.departmentId, task.departmentName, task.departmentRole, taskRole, ...roleAliases(taskRole)
  ]);
  return identityIntersects(depKeys, taskDepKeys);
}
function currentUserMatchesTask(task){
  return currentUserMatchesTaskExact(task) || currentUserMatchesTaskDepartment(task);
}
function getVisibleTasksForCurrentUser(){
  const allTasks = campaigns.flatMap(campaign => tasksForCampaign(campaign));
  if(isCurrentUserAdmin()) return allTasks;
  const exact = allTasks.filter(task => currentUserMatchesTaskExact(task));
  if(exact.length) return exact;
  const byDepartment = allTasks.filter(task => currentUserMatchesTaskDepartment(task));
  if(byDepartment.length) return byDepartment;
  return [];
}
function findTaskById(taskId, campaignId = ''){
  const campaignList = campaignId ? campaigns.filter(item => item.id === campaignId) : campaigns;
  for(const campaign of campaignList){
    const foundSaved = tasksForCampaign(campaign).find(task => task.id === taskId);
    if(foundSaved) return foundSaved;
  }
  const saved = campaignTasks.find(task => task.id === taskId);
  if(saved) return saved;
  return null;
}
function campaignForTask(task){
  return campaigns.find(item => item.id === task?.campaignId || item.docId === task?.campaignId) || {};
}
function stepButtonClass(step){ return step.done ? 'step-btn done' : 'step-btn'; }
function stepButtonTitle(step){ return step.adminOnly ? 'اعتماد الأدمن فقط' : 'تنفيذ المرحلة'; }

function taskContentType(task){
  const name = normalizeText(task.contentSectionName || task.assignedDepartmentName || task.contentType || '');
  if(name) return name.replace(/^قسم\s+/,'');
  return 'أنواع المحتوى';
}
function taskDepartmentLabel(task){
  const labels = {content:'قسم المحتوى', shooting:'قسم التصوير', design:'قسم التصميم', montage:'قسم المونتاج', publish:'قسم النشر', other:'قسم'};
  return labels[task.departmentRole || 'other'] || task.assignedDepartmentName || 'قسم';
}
function attachmentLabelForRole(role){
  if(role === 'shooting') return 'إرفاق ملف التصوير';
  if(role === 'content') return 'إرفاق ملف اسكريبت';
  if(role === 'design') return 'إرفاق ملف الصور';
  if(role === 'montage') return 'إرفاق ملف الفيديو';
  if(role === 'publish') return 'إرفاق ملف التقرير';
  return 'إرفاق ملف';
}
function getDriveUploadEndpoint(){
  return window.MZJ_ZOHO_UPLOAD_ENDPOINT || window.MZJ_DRIVE_UPLOAD_ENDPOINT || '/api/zoho-upload';
}
function buildZohoFileUrl(file){
  const id = file.fileId || file.resource_id || file.id || '';
  return file.fileUrl || file.url || file.viewUrl || file.webViewLink || file.permalink || file.downloadUrl || (id ? `https://workdrive.zoho.sa/file/${encodeURIComponent(id)}` : '');
}
function taskFiles(task){ return Array.isArray(task.attachments) ? task.attachments : []; }
function renderAttachmentTable(task){
  const files = taskFiles(task);
  return `<div class="task-files-box"><div class="modal-section-title"><h3>المرفقات الحالية</h3><span>${files.length}</span></div>
    <div class="task-files-table-wrap"><table class="task-files-table"><thead><tr><th>م</th><th>الملف</th><th>تاريخ الرفع</th><th>إجراء</th></tr></thead><tbody>${files.length ? files.map((file, i) => {
      const url = buildZohoFileUrl(file);
      const name = escapeHtml(file.name || file.fileName || file.title || `ملف ${i+1}`);
      return `<tr><td>${i+1}</td><td>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${name}</a>` : name}</td><td>${escapeHtml(String(file.uploadedAt || '').slice(0,16) || '—')}</td><td><button type="button" class="mini-btn danger" data-delete-task-file="${i}">حذف</button></td></tr>`;
    }).join('') : '<tr><td colspan="4">لا توجد مرفقات حالية.</td></tr>'}</tbody></table></div></div>`;
}
async function uploadTaskFileToDrive(file, task){
  const current = getCurrentUser();
  const form = new FormData();
  form.append('file', file);
  form.append('action', 'uploadTaskAttachment');
  form.append('campaignId', task.campaignId || '');
  form.append('campaignCode', task.campaignCode || '');
  form.append('campaignName', task.campaignName || '');
  form.append('department', taskDepartmentLabel(task));
  form.append('taskType', task.taskType || '');
  form.append('uploadedBy', current.email || current.name || current.uid || '');
  const res = await fetch(getDriveUploadEndpoint(), { method:'POST', body: form });
  const result = await res.json().catch(() => ({}));
  if(!res.ok || result.success === false) throw new Error(result.error || result.message || 'فشل رفع الملف على Zoho Drive.');
  const fileId = result.fileId || result.id || result.resource_id || result.data?.id || '';
  return {
    fileId,
    name: result.name || result.fileName || file.name,
    fileName: result.fileName || result.name || file.name,
    fileUrl: result.fileUrl || result.url || result.viewUrl || result.webViewLink || result.permalink || result.downloadUrl || (fileId ? `https://workdrive.zoho.sa/file/${encodeURIComponent(fileId)}` : ''),
    uploadedAt: new Date().toISOString(),
    uploadedBy: current.email || current.name || current.uid || '',
    departmentRole: task.departmentRole || '',
    departmentName: task.assignedDepartmentName || taskDepartmentLabel(task)
  };
}
function openTaskModal(task){
  const modal = document.getElementById('taskModal');
  const content = document.getElementById('taskModalContent');
  if(!modal || !content || !task) return;
  activeTaskModalMeta = { taskId: task.id, campaignId: task.campaignId || '' };
  content.innerHTML = buildTaskDetailHtml(task);
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}
function closeTaskModal(){
  document.getElementById('taskModal')?.classList.remove('show');
  document.getElementById('taskModal')?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}
function refreshOpenTaskModal(){
  if(!activeTaskModalMeta) return;
  const task = findTaskById(activeTaskModalMeta.taskId, activeTaskModalMeta.campaignId);
  if(task) openTaskModal(task);
}
async function updateTaskOnFirebase(taskId, patch){
  if(!mainDb || !taskId){ showToast('اتصال Firebase غير متاح.'); return; }
  const campaign = campaigns.find(c => Array.isArray(c.departmentTasks) && c.departmentTasks.some(t => (t.id || '') === taskId));
  if(campaign){
    const nextTasks = (campaign.departmentTasks || []).map(task => (task.id || '') === taskId ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task);
    try{
      await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaign.id).update({ departmentTasks: nextTasks, updatedAt: serverTime() });
      showToast('تم تحديث التاسك.');
      return;
    }catch(error){
      console.error('Campaign task array update error', error, patch);
      showToast('تعذر تحديث التاسك داخل الحملة.');
      return;
    }
  }
  if(taskId.startsWith('fallback-')){ showToast('التاسك غير محفوظ على Firebase بعد. احفظ الحملة مرة أخرى.'); return; }
  try{
    await safeCollection(window.MZJ_CAMPAIGN_TASKS_COLLECTION).doc(taskId).update({ ...patch, updatedAt: serverTime() });
    showToast('تم تحديث التاسك.');
  }catch(error){
    console.error('Task update error', error, patch);
    showToast('تعذر تحديث التاسك على Firebase.');
  }
}
function buildTaskDetailHtml(task){
  const campaign = campaignForTask(task);
  const admin = isCurrentUserAdmin();
  const steps = Array.isArray(task.steps) && task.steps.length ? task.steps : taskStepTemplate(task.departmentRole || 'other');
  const progress = taskProgress(task);
  const campaignDate = campaign.campaign_date || campaign.campaignDate || campaign.createdAt || '';
  const endDate = campaign.publishSchedule?.slice?.(-1)?.[0]?.date || campaign.campaignEndDate || campaign.endDate || '';
  return `<div class="task-modal-head"><div><span>التاسك والمطلوب</span><h2>${shortTaskName(task)}</h2><p>${escapeHtml([campaign.campaignName || campaign.name, campaign.campaignCode || task.campaignCode].filter(Boolean).join(' · '))}</p></div><button type="button" class="mini-btn" data-close-task-modal>إغلاق</button></div>
    <div class="modal-section"><div class="modal-section-title"><h3>بيانات الحملة</h3></div>
      <div class="task-info-grid">
        <div><span>التاريخ</span><strong>${formatDateShort(campaignDate)}</strong></div>
        <div><span>كود الحملة</span><strong>${escapeHtml(campaign.campaignCode || task.campaignCode || '—')}</strong></div>
        <div><span>اسم الحملة</span><strong>${escapeHtml(campaign.campaignName || campaign.name || '—')}</strong></div>
        <div><span>نوع الحملة</span><strong>${escapeHtml(campaign.campaignType || campaign.campaign_type || '—')}</strong></div>
        <div><span>هدف الحملة</span><strong>${escapeHtml(campaign.campaign_goal || campaign.campaignGoal || '—')}</strong></div>
        <div><span>بداية الحملة</span><strong>${formatDateShort(campaign.campaign_date || campaign.startDate)}</strong></div>
        <div><span>نهاية الحملة</span><strong>${formatDateShort(endDate)}</strong></div>
      </div>
    </div>
    <div class="modal-section task-required-section">
      <div class="modal-section-title"><h3>نوع المحتوى</h3></div>
      <p>${escapeHtml(taskContentType(task))}</p>
    </div>
    <div class="modal-section task-required-section">
      <div class="modal-section-title"><h3>الكريتيف</h3></div>
      <p>${escapeHtml(task.creative || task.product || '—')}</p>
    </div>
    <div class="modal-section task-required-section">
      <div class="modal-section-title"><h3>السيارة المختارة</h3></div>
      <p>${escapeHtml(task.selectedCar || task.carName || '')}</p>
    </div>
    <div class="modal-section">
      <div class="modal-section-title"><h3>إجراءات التكليف</h3><span>${progress}%</span></div>
      <div class="task-mini-meta"><span>القسم: <b>${escapeHtml(taskDepartmentLabel(task))}</b></span><span>اليوزر: <b>${taskOwnerName(task)}</b></span><span>الحالة: <b>${receivedLabel(task)}</b></span></div>
      <button type="button" class="btn btn-light receive-action ${task.received || task.receivedConfirmed ? 'done' : ''}" data-toggle-received="${escapeHtml(task.id)}">${task.received || task.receivedConfirmed ? 'تم الاستلام' : 'تأكيد الاستلام'}</button>
      <div class="modal-progress"><span style="width:${Math.min(100,progress)}%"></span></div>
      <div class="modal-steps-grid">${steps.map((step, index) => `<button type="button" class="workflow-step ${step.done ? 'done' : ''}" data-task-step="${escapeHtml(task.id)}" data-step-index="${index}" ${step.adminOnly && !admin ? 'disabled' : ''}><span>${escapeHtml(step.label)}</span><strong>${Number(step.percent || 0)}%</strong>${step.adminOnly ? '<em>أدمن فقط</em>' : ''}</button>`).join('')}</div>
    </div>
    <div class="modal-section attachment-section">
      <button type="button" class="btn btn-primary" data-upload-task-attachment>${attachmentLabelForRole(task.departmentRole || 'other')}</button>
      ${renderAttachmentTable(task)}
    </div>`;
}
function renderTaskDetail(taskId, campaignId = ''){
  const task = findTaskById(taskId, campaignId);
  if(!task) return;
  openTaskModal(task);
}
async function toggleTaskStep(taskId, stepIndex){
  const task = findTaskById(taskId);
  if(!task) return;
  const steps = Array.isArray(task.steps) && task.steps.length ? task.steps.map(step => ({...step})) : taskStepTemplate(task.departmentRole || 'other');
  const step = steps[Number(stepIndex)];
  if(!step) return;
  if(step.adminOnly && !isCurrentUserAdmin()){
    showToast('الاعتماد للأدمن فقط.');
    return;
  }
  step.done = !step.done;
  const progress = Math.min(100, Math.round(steps.reduce((sum, item) => sum + (item.done ? Number(item.percent || 0) : 0), 0)));
  await updateTaskOnFirebase(task.id, { steps, progress, status: progress >= 100 ? 'done' : 'in_progress' }); refreshOpenTaskModal(); renderAdminDashboard();
}
async function toggleTaskReceived(taskId){
  const task = findTaskById(taskId);
  if(!task) return;
  await updateTaskOnFirebase(task.id, { received: !task.received, receivedConfirmed: !task.received, status: !task.received ? 'received' : 'pending' }); refreshOpenTaskModal(); renderAdminDashboard(); renderTasksPage();
}
function buildCampaignTaskDocs(campaignId, payload){
  const docs = [];
  (payload.creatives || []).forEach((creativeRow, creativeIndex) => {
    (creativeRow.tasks || []).forEach((task, taskIndex) => {
      const ids = Array.isArray(task.userIds) ? task.userIds : [];
      const names = Array.isArray(task.userNames) ? task.userNames : [];
      const maxUsers = Math.max(ids.length, names.length);
      const assignees = Array.from({ length: maxUsers }, (_, i) => ({ id: ids[i] || '', name: names[i] || '' }))
        .filter(item => normalizeText(item.id || item.name));
      assignees.forEach((assignee, assigneeIndex) => {
        const user = findUserByAnyIdentity([assignee.id, assignee.name]) || {};
        const resolvedUserId = user.id || user.uid || assignee.id || assignee.name;
        const resolvedUserName = userName(user) || assignee.name || assignee.id || 'غير محدد';
        const dep = departmentForUser(resolvedUserId || assignee.name);
        const sectionName = normalizeText(task.contentSectionName || dep.name || user.department || '');
        const role = normalizeDepartmentRole(sectionName || dep.name || user.department);
        const qty = Math.max(1, Math.min(50, Number(task.quantity || 1)));
        const rowCars = Array.isArray(creativeRow.selectedCars) ? creativeRow.selectedCars.filter(car => car && (car.id || car.label)) : [];
        const taskUnits = rowCars.length ? rowCars.map((car, i) => ({ copyIndex: i, car })) : Array.from({ length: qty }, (_, i) => ({ copyIndex: i, car: null }));
        taskUnits.forEach(unit => {
          const selectedCarLabel = unit.car ? normalizeText(unit.car.label || unit.car.name || unit.car.id) : '';
          const searchKeys = uniqueList([
            assignee.id, assignee.name, resolvedUserId, user.id, user.uid, user.email, user.emailLower,
            resolvedUserName, user.name, user.displayName, user.username
          ].filter(Boolean));
          docs.push({
            campaignId,
            campaignName: payload.campaignName || payload.name || '',
            campaignCode: payload.campaignCode || '',
            creative: creativeRow.creative || '',
            product: creativeRow.product || '',
            selectedCars: unit.car ? [unit.car] : [],
            selectedCar: selectedCarLabel,
            contentSectionId: task.contentSectionId || '',
            contentSectionName: sectionName,
            taskType: task.taskType || '',
            taskQuantity: taskUnits.length,
            taskCopyIndex: unit.copyIndex + 1,
            userId: resolvedUserId,
            userUid: user.uid || resolvedUserId,
            userName: resolvedUserName,
            userEmail: user.email || '',
            assigneeUid: user.uid || resolvedUserId,
            assigneeName: resolvedUserName,
            assigneeEmail: user.email || '',
            assignedToUid: user.uid || resolvedUserId,
            assignedToId: resolvedUserId,
            assignedToName: resolvedUserName,
            assignedToEmail: user.email || '',
            displayName: user.displayName || resolvedUserName,
            username: user.username || '',
            assignedToSearch: searchKeys,
            searchKeys,
            assignedDepartmentId: task.contentSectionId || dep.id || '',
            assignedDepartmentName: sectionName || dep.name || user.department || '',
            departmentRole: role,
            received: false,
            progress: 0,
            steps: taskStepTemplate(role),
            status: 'pending',
            creativeIndex,
            assigneeIndex,
            taskIndex: `${taskIndex}-${assigneeIndex + 1}-${unit.copyIndex + 1}`,
            createdAt: serverTime(),
            updatedAt: serverTime(),
            source: 'mzj-marketing-spa'
          });
        });
      });
    });
  });
  return docs;
}
async function createCampaignTasks(campaignId, payload){
  const docs = buildCampaignTaskDocs(campaignId, payload);
  if(!docs.length) return 0;
  const batch = mainDb.batch();
  docs.slice(0, 450).forEach(item => {
    const ref = safeCollection(window.MZJ_CAMPAIGN_TASKS_COLLECTION).doc();
    batch.set(ref, item);
  });
  await batch.commit();
  return docs.length;
}

function buildDepartmentTasks(campaignId, payload){
  return buildCampaignTaskDocs(campaignId, payload).map((task, index) => {
    const clean = { ...task };
    delete clean.createdAt;
    delete clean.updatedAt;
    clean.id = `${campaignId}-task-${String(index + 1).padStart(3,'0')}`;
    clean.campaignId = campaignId;
    clean.received = false;
    clean.receivedConfirmed = false;
    clean.progress = 0;
    clean.status = 'pending';
    clean.attachments = [];
    return clean;
  });
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
  return [...document.querySelectorAll('#creativeRows .creative-row-card')].map(row => {
    const tasks = [...row.querySelectorAll('.creative-task-block')].map(block => {
      const section = block.querySelector('.js-task-section-select');
      const task = block.querySelector('.js-task-type');
      const userControl = block.querySelector('.js-task-user');
      const qty = Math.max(1, Math.min(50, Number(block.querySelector('.js-task-quantity')?.value || 1)));
      return {
        contentSectionId: section?.value || '',
        contentSectionName: readSelectText(section),
        taskType: task?.value || '',
        quantity: qty,
        userIds: selectedOptionValues(userControl),
        userNames: selectedOptionTexts(userControl)
      };
    }).filter(item => item.contentSectionId || item.taskType || item.userIds.length);
    return {
      creative: row.querySelector('.js-creative-select')?.value || '',
      tasks,
      product: row.querySelector('.js-product-output')?.value || '',
      selectedCars: selectedCarsFromRow(row)
    };
  }).filter(item => item.creative || item.tasks.length || item.product);
}
function getCampaignProducts(){
  return uniqueList([...document.querySelectorAll('.js-product-output')].map(input => normalizeText(input.value)).filter(Boolean));
}

function carDisplayName(car){
  const carName = normalizeText(car.carName || '') || normalizeText(pickFirstValue(car, ['name','title','modelName','vehicleName'])) || 'سيارة';
  const statement = normalizeText(car.statement || '');
  const model = normalizeText(car.model || '');
  const exteriorColor = normalizeText(car.exteriorColor || '');
  const interiorColor = normalizeText(car.interiorColor || '');
  return [carName, statement, model, exteriorColor, interiorColor].filter(Boolean).join(' - ');
}
function carCheckboxList(selectedIds = []){
  const list = cars.filter(car => !isExcludedStockStatus(stockStatusOf(car))).slice(0, 120);
  return list.length ? list.map(car => `<label class="car-check-card"><input type="checkbox" class="js-car-checkbox" value="${escapeHtml(car.id)}"${selectedIds.includes(car.id) ? ' checked' : ''}><span>${escapeHtml(carDisplayName(car))}</span></label>`).join('') : '<div class="empty-state mini-empty">لا توجد سيارات متاحة من الاستوك.</div>';
}
function selectedCarsFromRow(row){
  if(!row?.querySelector('.js-enable-cars')?.checked) return [];
  return [...(row?.querySelectorAll('.js-car-checkbox:checked') || [])].map(input => {
    const car = cars.find(item => item.id === input.value) || { id: input.value };
    return { id: input.value, label: carDisplayName(car) || input.value };
  });
}
function getCampaignPublishOutputs(){
  const outputs = [];
  document.querySelectorAll('#creativeRows .creative-row-card').forEach(row => {
    const creative = normalizeText(row.querySelector('.js-creative-select')?.value || '');
    row.querySelectorAll('.creative-task-block').forEach(block => {
      const sectionName = normalizeText(readSelectText(block.querySelector('.js-task-section-select')));
      const taskName = normalizeText(block.querySelector('.js-task-type')?.value || '');
      const role = normalizeDepartmentRole(sectionName);
      if(!['design','montage'].includes(role)) return;
      const output = [creative, sectionName, taskName].filter(Boolean).join(' - ');
      if(output && !output.includes('اختار المحتوى')) outputs.push(output);
    });
  });
  return uniqueList(outputs);
}
function dateRange(start, end){
  if(!start || !end) return [];
  const a = new Date(`${start}T00:00:00`), b = new Date(`${end}T00:00:00`);
  if(Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return [];
  const days = [];
  for(let d = new Date(a); d <= b && days.length < 62; d.setDate(d.getDate() + 1)) days.push(new Date(d));
  return days;
}
function formatInputDate(date){ return date.toISOString().slice(0,10); }
function dayName(date){ return date.toLocaleDateString('ar-SA', { weekday: 'long' }); }
function getPublishSelections(){
  const selections = {};
  document.querySelectorAll('.publish-day-card[data-date]').forEach(card => {
    const date = card.dataset.date || '';
    if(!date) return;
    selections[date] = {
      output: card.querySelector('.js-publish-output-select')?.value || '',
      platforms: selectedPlatformValues(card),
      platform: selectedPlatformValues(card).join('، '),
      time: '',
      note: normalizeText(card.querySelector('.js-publish-note')?.value)
    };
  });
  return selections;
}
function makePublishOutputOptions(outputs, currentValue = ''){
  return '<option value="">اختر النشر</option>' + outputs.map(out => `<option value="${escapeHtml(out)}"${currentValue === out ? ' selected' : ''}>${escapeHtml(out)}</option>`).join('');
}
function updatePublishOutputAvailability(){
  const used = new Set([...document.querySelectorAll('.js-publish-output-select')].map(sel => sel.value).filter(Boolean));
  document.querySelectorAll('.js-publish-output-select').forEach(select => {
    [...select.options].forEach(option => {
      if(!option.value) return;
      option.disabled = used.has(option.value) && option.value !== select.value;
    });
  });
}
function renderPublishAgenda(){
  const wrap = document.getElementById('publishAgenda'); if(!wrap) return;
  const previous = getPublishSelections();
  const days = dateRange(document.getElementById('publishStartDate')?.value, document.getElementById('publishEndDate')?.value);
  const outputs = getCampaignPublishOutputs();
  if(!days.length){ wrap.innerHTML = '<div class="empty-state">حدد بداية ونهاية النشر لعرض الأجندة.</div>'; return; }
  if(!outputs.length){ wrap.innerHTML = '<div class="empty-state">اختر مخرجات التصميم أو المونتاج أولاً عشان تظهر في جدول النشر.</div>'; return; }
  const firstDay = days[0];
  const leading = firstDay.getDay();
  const cells = [];
  for(let i = 0; i < leading; i += 1){ cells.push('<article class="publish-day-card publish-day-empty"></article>'); }
  days.forEach(date => {
    const iso = formatInputDate(date);
    const prev = previous[iso] || {};
    const currentOutput = outputs.includes(prev.output) ? prev.output : '';
    cells.push(`<article class="publish-day-card" data-date="${iso}">
      <div class="publish-day-head"><strong>${dayName(date)}</strong></div>
      <div class="publish-day-number">${date.getDate()}</div>
      <div class="publish-day-date">${iso}</div>
      <select class="js-publish-output-select compact-select" aria-label="اختيار النشر">${makePublishOutputOptions(outputs, currentOutput)}</select>
      <div class="publish-platform-checks" aria-label="المنصات">${platformCheckboxList(prev.platforms || prev.platform || [])}</div>
      <input type="text" class="js-publish-note compact-input" value="${escapeHtml(prev.note || '')}" placeholder="ملاحظة" aria-label="ملاحظات" />
    </article>`);
  });
  wrap.innerHTML = `<div class="publish-calendar-head"><span>الأحد</span><span>الإثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span><span>السبت</span></div><div class="publish-calendar-grid">${cells.join('')}</div>`;
  updatePublishOutputAvailability();
}
function collectPublishRows(){
  return [...document.querySelectorAll('.publish-day-card')].map(card => ({
    date: card.dataset.date || '',
    day: card.querySelector('.publish-day-head strong')?.textContent || '',
    output: card.querySelector('.js-publish-output-select')?.value || '',
    platforms: selectedPlatformValues(card),
    platform: selectedPlatformValues(card).join('، '),
    time: '',
    note: normalizeText(card.querySelector('.js-publish-note')?.value)
  })).filter(item => item.date || item.output || item.platform || item.note);
}
function collectBudgetRows(){
  return [...document.querySelectorAll('.budget-item-card')].map((card, index) => ({
    index: index + 1,
    funnel: card.querySelector('.js-funnel-select')?.value || '',
    newFunnel: normalizeText(card.querySelector('.js-new-funnel')?.value),
    product: card.querySelector('.js-product-select')?.value || '',
    platform: card.querySelector('.js-platform-select')?.value || '',
    publishDate: card.querySelector('.js-budget-publish-date')?.value || '',
    duration: normalizeText(card.querySelector('.js-budget-duration')?.value),
    adsCount: Number(card.querySelector('.js-budget-ads-count')?.value || 0),
    contentGoal: normalizeText(card.querySelector('.js-budget-content-goal')?.value),
    expectedGoal: normalizeText(card.querySelector('.js-budget-expected-goal')?.value),
    quantity: Number(card.querySelector('.js-budget-quantity')?.value || 0),
    value: Number(card.querySelector('.js-budget-value')?.value || 0),
    total: Number(card.querySelector('.js-budget-total')?.value || 0)
  })).filter(item => item.funnel || item.newFunnel || item.product || item.platform || item.value || item.total);
}
async function saveCampaignToFirebase(){
  if(!mainDb){ showToast('اتصال Firebase غير متاح.'); return; }
  const request = getFormData(document.getElementById('campaignRequestForm'));
  // تاريخ بداية/نهاية النشر موجودين داخل publishSchedule، ومش بنحفظهم كحقول مستقلة عشان مايكسرش قواعد Firestore القديمة.
  delete request.publish_start_date;
  delete request.publish_end_date;
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
    name: request.campaign_name || campaignCode || 'حملة جديدة',
    campaignName: request.campaign_name || '',
    status: request.request_status || 'draft',
    source: 'mzj-marketing-spa',
    updatedAt: serverTime(),
    createdAt: serverTime()
  };
  try{
    const docRef = await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).add(payload);
    const departmentTasks = buildDepartmentTasks(docRef.id, payload);
    await docRef.update({ id: docRef.id, departmentTasks, taskCount: departmentTasks.length, updatedAt: serverTime() });
    try{ await createCampaignTasks(docRef.id, payload); }catch(taskError){ console.warn('campaign_tasks optional write skipped', taskError); }
    showToast('تم حفظ الحملة على Firebase.');
    renderAdminDashboard(); renderTasksPage();
    window.location.hash = '#campaigns';
  }catch(error){
    console.error('Campaign save error', error, payload);
    const msg = error?.code === 'permission-denied' ? 'تعذر حفظ الحملة: راجع قواعد Firestore.' : 'تعذر حفظ الحملة على Firebase.';
    showToast(msg);
  }
}


function addBudgetItem(){
  const wrap = document.getElementById('budgetRows'); if(!wrap) return;
  const empty = wrap.querySelector('.empty-state'); if(empty) empty.remove();
  const card = document.createElement('article');
  card.className = 'budget-item-card';
  card.innerHTML = `<div class="budget-item-title"><strong>ميزانية</strong><button class="delete-budget-row" type="button">×</button></div>
    <div class="budget-grid">
      <label class="field"><span>Funnel</span><select class="js-funnel-select">${funnelOptions()}</select></label>
      <label class="field"><span>Funnel جديد</span><input class="js-new-funnel" type="text" placeholder="اكتب Funnel" /></label>
      <label class="field"><span>المنتج</span><select class="js-product-select">${productOptions()}</select></label>
      <label class="field"><span>المنصة</span><select class="js-platform-select">${platformOptions()}</select></label>
      <label class="field"><span>تاريخ النشر</span><input class="js-budget-publish-date" type="date" /></label>
      <label class="field"><span>مدة الإعلان</span><input class="js-budget-duration" type="text" placeholder="مثال: 7 أيام" /></label>
      <label class="field"><span>عدد الإعلانات</span><input class="js-budget-ads-count" type="number" min="0" /></label>
      <label class="field"><span>هدف المحتوى</span><input class="js-budget-content-goal" type="text" /></label>
      <label class="field"><span>الهدف المتوقع</span><input class="js-budget-expected-goal" type="text" /></label>
      <label class="field"><span>الكمية</span><input class="js-budget-quantity" type="number" min="0" /></label>
      <label class="field"><span>القيمة</span><input class="js-budget-value" type="number" min="0" step="0.01" /></label>
      <label class="field"><span>الإجمالي</span><input class="js-budget-total" type="number" min="0" step="0.01" /></label>
    </div>`;
  wrap.appendChild(card);
  refreshDynamicSelects();
}
function bindCampaignBuilder(){
  const creativeRows = document.getElementById('creativeRows'); const budgetRows = document.getElementById('budgetRows');
  document.getElementById('addCreativeBtn')?.addEventListener('click', () => {
    clearEmptyRow(creativeRows);
    const card = document.createElement('article');
    card.className = 'creative-row-card';
    card.innerHTML = `
      <div class="creative-row-head">
        <label class="creative-main-select"><span>الكريتيف</span><select class="js-creative-select">${creativeOptions()}</select></label>
        <label class="creative-product-field"><span>المنتجات</span><input class="product-output js-product-output" type="text" readonly aria-label="المنتجات" /></label>
        <button class="delete-row" type="button" aria-label="حذف الصف">×</button>
      </div>
      <label class="car-picker-enable"><input type="checkbox" class="js-enable-cars"> <span>اختيار سيارات من الاستوك</span></label><div class="car-picker-block is-hidden"><div class="car-picker-title">اختيار السيارات</div><div class="car-checkbox-grid">${carCheckboxList()}</div></div>
      <div class="creative-task-grid">
        ${taskBlockHtml(1)}${taskBlockHtml(2)}${taskBlockHtml(3)}${taskBlockHtml(4)}
      </div>`;
    creativeRows?.appendChild(card); refreshDynamicSelects(); renderPublishAgenda();
  });
  document.getElementById('campaignCodeSelect')?.addEventListener('change', generateCampaignCode);
  document.getElementById('refreshPublishAgendaBtn')?.addEventListener('click', renderPublishAgenda);
  document.getElementById('publishStartDate')?.addEventListener('change', renderPublishAgenda);
  document.getElementById('publishEndDate')?.addEventListener('change', renderPublishAgenda);
  document.getElementById('addBudgetRowBtn')?.addEventListener('click', addBudgetItem);
  document.addEventListener('click', event => {
    const toggle = event.target.closest('.multi-toggle');
    document.querySelectorAll('.multi-dropdown.open').forEach(el => { if(el !== toggle?.closest('.multi-dropdown')) el.classList.remove('open'); });
    if(toggle){ toggle.closest('.multi-dropdown')?.classList.toggle('open'); return; }
    if(!event.target.closest('.multi-dropdown')) document.querySelectorAll('.multi-dropdown.open').forEach(el => el.classList.remove('open'));
    const btn = event.target.closest('.delete-row');
    if(btn){ const container = document.getElementById('creativeRows'); btn.closest('.creative-row-card')?.remove(); restoreEmptyRow(container, 1, 'ابدأ بإضافة صف كريتيف للحملة.'); renderPublishAgenda(); refreshDynamicSelects(); return; }
    const budgetDel = event.target.closest('.delete-budget-row');
    if(budgetDel){ budgetDel.closest('.budget-item-card')?.remove(); if(budgetRows && !budgetRows.querySelector('.budget-item-card')) budgetRows.innerHTML = '<div class="empty-state">لا توجد بنود ميزانية.</div>'; }
  });
  document.addEventListener('change', event => {
    if(event.target.matches('.js-enable-cars')){ const row = event.target.closest('.creative-row-card'); row?.querySelector('.car-picker-block')?.classList.toggle('is-hidden', !event.target.checked); if(!event.target.checked){ row?.querySelectorAll('.js-car-checkbox:checked').forEach(cb => cb.checked = false); updateProductOutput(row); } return; }
    if(event.target.matches('.js-task-section-select')){
      const block = event.target.closest('.creative-task-block');
      const taskSelect = block?.querySelector('.js-task-type');
      const userSelect = block?.querySelector('.js-task-user');
      if(taskSelect) taskSelect.innerHTML = taskTypeOptionsForSection(event.target.value, '');
      if(userSelect) userSelect.innerHTML = multiTaskUserOptions(event.target.value, []);
      updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); refreshDynamicSelects(); return;
    }
    if(event.target.matches('.js-task-user,.js-car-checkbox')){ updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); refreshDynamicSelects(); return; }
    if(event.target.matches('.js-publish-output-select')){ updatePublishOutputAvailability(); return; }
    if(event.target.matches('.js-platform-checkbox')){ return; }
    if(event.target.matches('.js-creative-select,.js-task-type,.js-task-quantity')){ updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); refreshDynamicSelects(); }
  });
  document.getElementById('resetCampaignBuilder')?.addEventListener('click', () => { document.getElementById('campaignRequestForm')?.reset(); if(creativeRows) creativeRows.innerHTML = '<div class="empty-state">ابدأ بإضافة صف كريتيف للحملة.</div>'; const agenda = document.getElementById('publishAgenda'); if(agenda) agenda.innerHTML = '<div class="empty-state">حدد بداية ونهاية النشر ثم اختر كريتيفات ومخرجات التصميم والمونتاج.</div>'; if(budgetRows) budgetRows.innerHTML = '<div class="empty-state">لا توجد بنود ميزانية.</div>'; generateCampaignCode(); });
  document.getElementById('saveCampaignDraft')?.addEventListener('click', saveCampaignToFirebase);
}

function resetForm(ids){ ids.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; }); }
function collectionByKind(kind){ return {department: window.MZJ_DEPARTMENTS_COLLECTION, creative: window.MZJ_CREATIVES_COLLECTION, taskType: window.MZJ_TASK_TYPES_COLLECTION, contentSection: window.MZJ_CONTENT_SECTIONS_COLLECTION, campaignCode: window.MZJ_CAMPAIGN_CODES_COLLECTION, campaignType: window.MZJ_CAMPAIGN_TYPES_COLLECTION, platform: window.MZJ_PLATFORMS_COLLECTION}[kind]; }
async function deleteDoc(kind, id){ if(!mainDb || !id) return; if(!confirm('تأكيد الحذف؟')) return; await safeCollection(collectionByKind(kind)).doc(id).delete(); }
async function deleteCampaignWithTasks(campaignId){
  if(!mainDb || !campaignId) return;
  if(!confirm('تأكيد حذف الحملة وكل التاسكات التابعة لها؟')) return;
  try{
    const tasksSnap = await safeCollection(window.MZJ_CAMPAIGN_TASKS_COLLECTION).where('campaignId','==',campaignId).get();
    const batch = mainDb.batch();
    tasksSnap.docs.slice(0, 450).forEach(doc => batch.delete(doc.ref));
    batch.delete(safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId));
    await batch.commit();
    showToast('تم حذف الحملة والتاسكات التابعة لها.');
  }catch(error){
    console.error('Delete campaign error', error);
    showToast('تعذر حذف الحملة. راجع قواعد Firestore.');
  }
}
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
  bindNamedForm('platformForm', 'platformEditId', 'platformName', 'platformMessage', window.MZJ_PLATFORMS_COLLECTION, 'تم حفظ المنصة.');
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
    const campaignDel = event.target.closest('[data-delete-campaign]'); if(campaignDel){ await deleteCampaignWithTasks(campaignDel.dataset.deleteCampaign); return; }
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
    const pEdit = event.target.closest('[data-edit-platform]'); if(pEdit){ const item = platforms.find(x => x.id === pEdit.dataset.editPlatform); if(item){ document.getElementById('platformEditId').value = item.id; document.getElementById('platformName').value = item.name; } return; }
    const pDel = event.target.closest('[data-delete-platform]'); if(pDel){ await deleteDoc('platform', pDel.dataset.deletePlatform); return; }
    const csEdit = event.target.closest('[data-edit-content-section]'); if(csEdit){ const item = contentSections.find(x => x.id === csEdit.dataset.editContentSection); if(item){ document.getElementById('contentSectionEditId').value = item.id; document.getElementById('contentSectionName').value = item.name; document.getElementById('contentSectionTypes').value = (item.types || []).join('\n'); } return; }
    const csDel = event.target.closest('[data-delete-content-section]'); if(csDel){ await deleteDoc('contentSection', csDel.dataset.deleteContentSection); }
  });
  document.getElementById('cancelDepartmentEdit')?.addEventListener('click', () => { document.getElementById('departmentForm')?.reset(); resetForm(['departmentEditId']); refreshDynamicSelects(); });
  document.getElementById('cancelCreativeEdit')?.addEventListener('click', () => { document.getElementById('creativeForm')?.reset(); resetForm(['creativeEditId']); });
  document.getElementById('cancelTaskTypeEdit')?.addEventListener('click', () => { document.getElementById('taskTypeForm')?.reset(); resetForm(['taskTypeEditId']); });
  document.getElementById('cancelCampaignCodeEdit')?.addEventListener('click', () => { document.getElementById('campaignCodeForm')?.reset(); document.getElementById('campaignCodePrefix').value = 'MZJ'; resetForm(['campaignCodeEditId']); });
  document.getElementById('cancelCampaignTypeEdit')?.addEventListener('click', () => { document.getElementById('campaignTypeForm')?.reset(); resetForm(['campaignTypeEditId']); });
  document.getElementById('cancelPlatformEdit')?.addEventListener('click', () => { document.getElementById('platformForm')?.reset(); resetForm(['platformEditId']); });
  document.getElementById('cancelContentSectionEdit')?.addEventListener('click', () => { document.getElementById('contentSectionForm')?.reset(); resetForm(['contentSectionEditId']); });
  document.getElementById('refreshDepartmentsBtn')?.addEventListener('click', () => { renderDepartments(); renderCreatives(); renderTaskTypes(); renderCampaignCodes(); renderCampaignTypes(); renderContentSections(); });
  document.getElementById('refreshStockBtn')?.addEventListener('click', renderStock);
}



let calendarCursor = new Date();
function publishEntriesFromCampaigns(){
  return campaigns.flatMap(campaign => (campaign.publishSchedule || []).filter(item => item && item.date).map(item => ({
    ...item,
    campaignId: campaign.id,
    campaignName: campaign.campaignName || campaign.name || 'حملة',
    campaignCode: campaign.campaignCode || campaign.campaign_code || ''
  })));
}
function renderCalendarPage(){
  const board = document.getElementById('calendarBoard');
  const title = document.getElementById('calendarMonthTitle');
  if(!board) return;
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  if(title) title.textContent = first.toLocaleDateString('ar-SA', { month:'long', year:'numeric' });
  const entries = publishEntriesFromCampaigns();
  const byDate = entries.reduce((acc, entry) => { (acc[entry.date] ||= []).push(entry); return acc; }, {});
  const cells = [];
  for(let i = 0; i < first.getDay(); i += 1) cells.push('<article class="calendar-day empty"></article>');
  for(let d = 1; d <= last.getDate(); d += 1){
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const date = new Date(year, month, d);
    const dayEntries = byDate[iso] || [];
    cells.push(`<article class="calendar-day"><div class="calendar-day-top"><span>${date.toLocaleDateString('ar-SA',{weekday:'long'})}</span><strong>${d}</strong></div><small>${iso}</small><div class="calendar-day-items">${dayEntries.length ? dayEntries.map(item => `<div class="calendar-publish-item"><b>${escapeHtml(item.output || 'نشر')}</b><span>${escapeHtml([item.platform, item.time, item.campaignName].filter(Boolean).join(' · '))}</span></div>`).join('') : ''}</div></article>`);
  }
  board.innerHTML = `<div class="calendar-week-head"><span>الأحد</span><span>الإثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span><span>السبت</span></div><div class="calendar-month-grid">${cells.join('')}</div>`;
}
function renderTasksPage(){
  const board = document.getElementById('tasksBoard'); if(!board) return;
  const tasks = getVisibleTasksForCurrentUser();
  if(!tasks.length){ board.innerHTML = '<div class="empty-state">لا توجد مهام حالياً.</div>'; return; }
  const grouped = groupTasksForKanban(tasks);
  board.innerHTML = `<div class="tasks-list-page">${grouped.map(group => `<section class="tasks-list-section"><div class="tasks-page-col-head"><h2>${group.label}</h2><span>${group.tasks.length}</span></div><div class="tasks-list-stack">${group.tasks.map(task => `<article class="tasks-page-card"><div><strong>${shortTaskName(task)}</strong><p>${escapeHtml([task.campaignName, task.taskType, taskOwnerName(task)].filter(Boolean).join(' / '))}</p></div><div class="task-card-progress"><span style="width:${Math.min(100,taskProgress(task))}%"></span></div><button type="button" class="mini-btn" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(task.campaignId || '')}">تفاصيل</button></article>`).join('')}</div></section>`).join('')}</div>`;
}

function setDashboardMode(mode){
  const dashboard = document.getElementById('dashboard');
  if(!dashboard) return;
  const isAdminMode = mode === 'admin';
  dashboard.classList.toggle('admin-mode', isAdminMode);
  dashboard.classList.toggle('user-mode', !isAdminMode);
  const title = dashboard.querySelector('.page-title h1');
  const desc = dashboard.querySelector('.page-title p');
  const createBtn = dashboard.querySelector('.page-head > .btn, .page-head a.btn');
  if(isAdminMode){
    if(title) title.textContent = 'لوحة التحكم';
    if(desc) desc.textContent = 'متابعة الحملات والتاسكات للأدمن.';
    if(createBtn) createBtn.classList.remove('is-hidden');
  }else{
    if(title) title.textContent = 'الداش بورد';
    if(desc) desc.textContent = 'أنواع المحتوى والتاسكات المسندة لك.';
    if(createBtn) createBtn.classList.add('is-hidden');
  }
}

function formatDateShort(value){
  if(!value) return '—';
  try{
    const date = value.toDate ? value.toDate() : new Date(value);
    if(Number.isNaN(date.getTime())) return escapeHtml(value);
    return date.toLocaleDateString('ar-SA');
  }catch(_){ return escapeHtml(value); }
}

function shortCampaignTitle(campaign){
  return escapeHtml(campaign.campaignName || campaign.name || campaign.campaign_code || campaign.campaignCode || 'حملة');
}
function shortTaskName(task){
  return escapeHtml(task.creative || task.product || task.taskType || 'تاسك');
}
function receivedLabel(task){ return task.received || task.receivedConfirmed ? 'تم الاستلام' : 'لم يستلم'; }
function receivedClass(task){ return task.received || task.receivedConfirmed ? 'is-done' : 'is-waiting'; }
function taskOwnerName(task){ return escapeHtml(task.assignedToName || task.assigneeName || task.userName || 'بدون مسؤول'); }
function campaignTasksSnapshot(campaign){
  const related = tasksForCampaign(campaign);
  const received = related.filter(task => task.received || task.receivedConfirmed).length;
  const progress = campaignRequiredProgress(campaign);
  const publish = campaignPublishProgress(campaign);
  return { related, received, progress, publish, total: related.length };
}

function renderUserDashboard(){
  const board = document.getElementById('adminDashboardBoard');
  if(!board) return;
  setDashboardMode('user');
  applyEffectiveTheme();
  const myTasks = getVisibleTasksForCurrentUser();
  const received = myTasks.filter(task => task.received || task.receivedConfirmed).length;
  const done = myTasks.filter(task => taskProgress(task) >= 100).length;
  const groupMap = {};
  myTasks.forEach(task => {
    const key = taskContentType(task);
    if(!groupMap[key]) groupMap[key] = [];
    groupMap[key].push(task);
  });
  const groups = Object.entries(groupMap).map(([label, tasks]) => ({ label, tasks }));
  const taskCard = task => `<article class="content-task-card">
    <h3>${escapeHtml(task.campaignName || 'حملة')}</h3>
    <p>${escapeHtml(task.product || task.selectedCar || task.creative || task.taskType || '—')}</p>
    <div class="content-task-actions"><button type="button" class="btn btn-light" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(task.campaignId || '')}">تفاصيل</button><button type="button" class="btn btn-light ${task.received || task.receivedConfirmed ? 'done' : ''}" data-toggle-received="${escapeHtml(task.id)}">${task.received || task.receivedConfirmed ? 'تم الاستلام' : 'تم الاستلام'}</button></div>
    <div class="task-metric-row"><span>متوسط اكتمال التاسكات</span><b>${taskProgress(task)}%</b></div>
    <div class="task-metric-row"><span>متوسط مساهمة الحملات</span><b>${taskProgress(task)}%</b></div>
    <div class="task-card-progress"><span style="width:${Math.min(100,taskProgress(task))}%"></span></div>
  </article>`;
  board.innerHTML = `<section class="user-content-dashboard">
    <div class="user-content-head"><div><h2>أنواع المحتوى</h2><p>التاسكات المطلوبة منك حسب نوع المحتوى.</p></div><div class="exec-stats"><span>${myTasks.length} تاسك</span><span>${received} مستلم</span><span>${done} مكتمل</span></div></div>
    <div class="user-theme-panel"><label class="user-theme-upload"><input type="file" accept="image/*" id="userThemeImageInput"><span>صورة مرجع الثيم</span></label><button class="mini-btn" type="button" id="clearUserThemeBtn">استرجاع الثيم الافتراضي</button></div>
    ${groups.length ? `<div class="content-type-board">${groups.map(group => `<section class="content-type-col"><div class="content-type-title"><h3>${escapeHtml(group.label)}</h3><span>${group.tasks.length} تاسك</span></div><div class="content-type-list">${group.tasks.map(taskCard).join('')}</div></section>`).join('')}</div>` : '<div class="empty-state soft-empty">لا توجد تكليفات مسندة لك حالياً.</div>'}
  </section>`;
  applyEffectiveTheme();
}
function renderAdminDashboard(){
  const allTasks = campaigns.flatMap(campaign => tasksForCampaign(campaign));
  const count = document.getElementById('dashboardCampaignsCount'); if(count) count.textContent = campaigns.length || '—';
  const tasksCount = document.getElementById('dashboardTasksCount'); if(tasksCount) tasksCount.textContent = allTasks.length || '—';
  const adminBoard = document.getElementById('adminDashboardBoard');
  if(!adminBoard) return;
  if(!isCurrentUserAdmin()) { renderUserDashboard(); return; }
  setDashboardMode('admin');
  const items = campaigns.map(campaign => ({ campaign, ...campaignTasksSnapshot(campaign) }));
  const requiredItems = items.filter(item => item.total && item.received < item.total);
  const readinessItems = items.filter(item => item.total && item.progress < 100);
  const publishItems = items.filter(item => item.progress >= 100 && item.publish < 100);
  const archiveItems = items.filter(item => item.progress >= 100 && item.publish >= 100);

  const requiredCard = item => `<article class="dash-task-receive-card">
    <div class="dash-card-top"><strong>${shortCampaignTitle(item.campaign)}</strong><span>${escapeHtml(item.campaign.campaignCode || item.campaign.campaign_code || 'بدون كود')}</span></div>
    <div class="receive-meter"><strong>${item.received}/${item.total}</strong><span>تم الاستلام</span></div>
    <div class="receive-list">${item.related.slice(0,5).map(task => `<div><span>${shortTaskName(task)}</span><b class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</b></div>`).join('')}${item.related.length>5 ? `<small>+ ${item.related.length-5} تاسكات أخرى</small>` : ''}</div>
  </article>`;

  const readinessCard = item => `<article class="dash-campaign-card dash-ready-card" data-open-campaign="${escapeHtml(item.campaign.id)}">
    <div class="dash-card-top"><strong>${shortCampaignTitle(item.campaign)}</strong><span>${item.progress}%</span></div>
    <p>${escapeHtml(item.campaign.campaignCode || item.campaign.campaign_code || 'بدون كود')} · ${item.total} تاسك</p>
    <div class="dash-progress"><span style="width:${Math.min(100,item.progress)}%"></span></div>
    <button type="button" class="open-details-hint">عرض التاسكات</button>
  </article>`;

  const publishCard = item => `<article class="dash-campaign-card publish-card" data-open-campaign="${escapeHtml(item.campaign.id)}">
    <div class="dash-card-top"><strong>${shortCampaignTitle(item.campaign)}</strong><span>${item.publish}%</span></div>
    <p>${escapeHtml(item.campaign.campaignCode || item.campaign.campaign_code || '')}</p>
    <div class="publish-actions">
      <button type="button" data-stage="prep" data-campaign-id="${escapeHtml(item.campaign.id)}" class="mini-btn ${item.campaign.publishStages?.prep ? 'done' : ''}">التجهيز 35%</button>
      <button type="button" data-stage="approval" data-campaign-id="${escapeHtml(item.campaign.id)}" class="mini-btn ${item.campaign.publishStages?.approval ? 'done' : ''}">الاعتماد 30%</button>
      <button type="button" data-stage="publish" data-campaign-id="${escapeHtml(item.campaign.id)}" class="mini-btn ${item.campaign.publishStages?.publish ? 'done' : ''}">النشر 35%</button>
    </div>
  </article>`;

  const archiveCard = item => `<article class="dash-campaign-card archive-card" data-open-campaign="${escapeHtml(item.campaign.id)}">
    <div class="dash-card-top"><strong>${shortCampaignTitle(item.campaign)}</strong><span>جاهزة</span></div>
    <p>${escapeHtml(item.campaign.campaignCode || item.campaign.campaign_code || '')}</p>
  </article>`;

  adminBoard.innerHTML = `
    <section class="admin-dash-col receive-col"><div class="col-title"><h2>TASK - المطلوب</h2><p>متابعة ضغط اليوزرات على تم الاستلام فقط.</p></div>${requiredItems.length ? requiredItems.map(requiredCard).join('') : '<div class="empty-state soft-empty">كل المطلوب تم استلامه حالياً.</div>'}</section>
    <section class="admin-dash-col ready-col"><div class="col-title"><h2>جاهزية المطلوب</h2><p>اضغط على حملة لفتح التاسكات بنظام كانبان.</p></div>${readinessItems.length ? readinessItems.map(readinessCard).join('') : '<div class="empty-state soft-empty">لا توجد حملات قيد التجهيز.</div>'}</section>
    <section class="admin-dash-col publish-col"><div class="col-title"><h2>قسم النشر</h2><p>تظهر هنا بعد اكتمال جاهزية المطلوب.</p></div>${publishItems.length ? publishItems.map(publishCard).join('') : '<div class="empty-state soft-empty">لا توجد حملات جاهزة للنشر.</div>'}</section>
    <section class="admin-dash-col archive-col"><div class="col-title"><h2>قسم الأرشيف</h2><p>بعد اكتمال النشر، تصبح جاهزة للأرشفة.</p></div>${archiveItems.length ? archiveItems.map(archiveCard).join('') : '<div class="empty-state soft-empty">لا توجد حملات مؤرشفة حالياً.</div>'}</section>`;
}


function renderCampaignInlineTasks(campaign){
  const related = tasksForCampaign(campaign);
  const grouped = groupTasksForKanban(related);
  const taskItem = task => `<article class="inline-task-row">
    <div><strong>${shortTaskName(task)}</strong><p>${escapeHtml([taskDepartmentLabel(task), task.taskType, taskOwnerName(task)].filter(Boolean).join(' / '))}</p></div>
    <span class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</span>
    <b>${taskProgress(task)}%</b>
    <button type="button" class="mini-btn" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(task.campaignId || '')}">تفاصيل</button>
  </article>`;
  return `<div class="campaign-inline-tasks">${grouped.length ? grouped.map(group => `<section class="inline-task-group"><div class="inline-task-group-title"><h3>${group.label}</h3><span>${group.tasks.length}</span></div>${group.tasks.map(taskItem).join('')}</section>`).join('') : '<div class="empty-state soft-empty">لا توجد تاسكات للحملة.</div>'}</div>`;
}
function toggleCampaignInlineTasks(card, campaignId){
  const campaign = campaigns.find(item => item.id === campaignId);
  if(!card || !campaign) return;
  const existing = card.nextElementSibling;
  if(existing && existing.classList.contains('campaign-inline-tasks-wrap')){ existing.remove(); return; }
  document.querySelectorAll('.campaign-inline-tasks-wrap').forEach(el => el.remove());
  const wrap = document.createElement('div');
  wrap.className = 'campaign-inline-tasks-wrap';
  wrap.innerHTML = renderCampaignInlineTasks(campaign);
  card.insertAdjacentElement('afterend', wrap);
}
function renderCampaignDetail(campaignId){
  const campaign = campaigns.find(item => item.id === campaignId);
  const detail = document.getElementById('dashboardCampaignDetail');
  if(!detail || !campaign) return;
  const related = tasksForCampaign(campaign);
  const snap = campaignTasksSnapshot(campaign);
  const taskItem = task => `<article class="campaign-task-list-item">
    <div class="task-list-main"><strong>${shortTaskName(task)}</strong><p>${escapeHtml([task.contentSectionName, task.taskType, taskOwnerName(task)].filter(Boolean).join(' / ') || 'بدون بيانات')}</p></div>
    <div class="task-list-state"><span>${taskProgress(task)}%</span><b class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</b></div>
    <button type="button" class="mini-btn" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(campaign.id || task.campaignId || '')}">تفاصيل</button>
  </article>`;
  const grouped = groupTasksForKanban(related);
  detail.classList.add('show');
  detail.innerHTML = `<div class="detail-head clean-detail-head"><div><h2>${shortCampaignTitle(campaign)}</h2><p>${escapeHtml(campaign.campaignCode || campaign.campaign_code || '')}</p></div><button type="button" class="mini-btn" id="closeDashboardDetail">إغلاق</button></div>
    <div class="detail-summary-strip compact-summary"><span><b>${snap.total}</b> تاسك</span><span><b>${snap.received}</b> مستلم</span><span><b>${snap.progress}%</b> جاهزية</span></div>
    ${grouped.length ? grouped.map(group => `<section class="campaign-task-group"><div class="campaign-task-group-head"><h3>${group.label}</h3><span>${group.tasks.length}</span></div><div class="campaign-task-list">${group.tasks.map(taskItem).join('')}</div></section>`).join('') : '<div class="empty-state soft-empty">لا توجد تاسكات للحملة.</div>'}`;
}
async function togglePublishStage(campaignId, stage){
  const campaign = campaigns.find(item => item.id === campaignId);
  if(!campaign || !mainDb) return;
  const stages = { ...(campaign.publishStages || {}) };
  stages[stage] = !stages[stage];
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId).update({ publishStages: stages, updatedAt: serverTime() });
}
function renderCampaignCards(containerId, limit = 6){
  const el = document.getElementById(containerId); if(!el) return;
  if(!campaigns.length){ el.innerHTML = '<div class="empty-state">لا توجد حملات محفوظة حتى الآن.</div>'; return; }
  el.innerHTML = campaigns.slice(0, limit).map(campaign => `
    <article class="campaign-card-item">
      <div>
        <h3>${escapeHtml(campaign.campaignName || campaign.name || campaign.campaignCode || 'حملة بدون اسم')}</h3>
        <p>${escapeHtml(campaign.campaignCode || 'بدون كود')} · ${escapeHtml(campaign.campaignType || 'بدون نوع')}</p>
      </div>
      <div class="campaign-card-meta">
        ${campaign.status && campaign.status !== 'draft' ? `<span class="chip">${escapeHtml(campaign.status)}</span>` : ''}
        <small>${formatDateShort(campaign.createdAt || campaign.campaign_date)}</small>
        <button class="mini-btn danger" type="button" data-delete-campaign="${escapeHtml(campaign.id)}">حذف</button>
      </div>
    </article>`).join('');
}
function renderCampaigns(){
  renderAdminDashboard();
  renderCampaignCards('campaignsList', 50);
}
function loadCampaigns(){
  if(!mainDb) return;
  safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).orderBy('createdAt','desc').onSnapshot(snapshot => {
    campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
    renderCampaigns();
    renderTasksPage();
    if(getRoute() === 'calendar') renderCalendarPage();
    refreshOpenTaskModal();
  }, error => { console.error('Campaigns load error', error); renderCampaigns(); });
}
function loadCampaignTasks(){
  if(!mainDb) return;
  safeCollection(window.MZJ_CAMPAIGN_TASKS_COLLECTION).onSnapshot(snapshot => {
    campaignTasks = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
    renderCampaigns();
    renderTasksPage();
    refreshOpenTaskModal();
  }, error => { console.error('Campaign tasks load error', error); renderCampaigns(); });
}



const defaultThemeSettings = {
  systemName: 'نظام التسويق',
  fontFamily: 'Tajawal',
  direction: 'rtl',
  colors: { primary:'#5A3A32', secondary:'#B85E4E', accent:'#C89F84', surface:'#FAF6F1', bg:'#F3E5D6', line:'#E5CBBE', text:'#2D1713', muted:'#8E7166' }
};
function getThemeColorPayload(){
  return { primary:colorPrimary.value, secondary:colorSecondary.value, accent:colorAccent.value, surface:colorSurface.value, bg:colorBg.value, line:colorLine.value, text:colorText.value, muted:colorMuted.value };
}
function rgbToHex(r,g,b){ return '#' + [r,g,b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join(''); }
function luminance(hex){ const n = parseInt(hex.slice(1),16); const r=(n>>16)&255,g=(n>>8)&255,b=n&255; return (0.2126*r+0.7152*g+0.0722*b)/255; }
function extractThemeColorsFromImage(dataUrl){
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 96;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0,0,size,size).data;
      const buckets = new Map();
      for(let i=0;i<data.length;i+=16){
        const r=data[i], g=data[i+1], b=data[i+2], a=data[i+3];
        if(a < 200) continue;
        const max=Math.max(r,g,b), min=Math.min(r,g,b);
        if(max-min < 12 && max > 235) continue;
        const key=[Math.round(r/24)*24,Math.round(g/24)*24,Math.round(b/24)*24].join(',');
        buckets.set(key,(buckets.get(key)||0)+1);
      }
      const colors=[...buckets.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k])=>rgbToHex(...k.split(',').map(Number)));
      const dark = colors.filter(c => luminance(c) < .42);
      const mid = colors.filter(c => luminance(c) >= .42 && luminance(c) < .78);
      const light = colors.filter(c => luminance(c) >= .78);
      resolve({
        primary: dark[0] || '#5A3A32',
        secondary: mid[0] || colors[1] || '#B85E4E',
        accent: mid[1] || colors[2] || '#C89F84',
        surface: light[0] || '#FAF6F1',
        bg: light[1] || '#F3E5D6',
        line: light[2] || '#E5CBBE',
        text: dark[1] || dark[0] || '#2D1713',
        muted: mid[2] || '#8E7166'
      });
    };
    img.onerror = () => resolve(defaultThemeSettings.colors);
    img.src = dataUrl;
  });
}

function getCurrentUserDoc(){
  const current = getCurrentUser();
  return users.find(user => user.id === current.id || user.uid === current.uid || (user.email && identityClean(user.email) === identityClean(current.email))) || current;
}
function applyEffectiveTheme(){
  const user = getCurrentUserDoc();
  const sessionUser = getCurrentUser();
  const userTheme = (user && user.themeSettings) || sessionUser.themeSettings || null;
  const dashboard = document.getElementById('dashboard');
  if(userTheme){
    applyThemeSettings(userTheme);
    const image = userTheme.backgroundImageData || userTheme.backgroundImageUrl || userTheme.themeImageData || '';
    if(image){
      document.documentElement.style.setProperty('--user-dashboard-bg-image', `url("${image}")`);
      document.body.classList.add('has-user-dashboard-theme');
      dashboard?.classList.add('has-custom-bg');
    }else{
      document.body.classList.remove('has-user-dashboard-theme');
      dashboard?.classList.remove('has-custom-bg');
      document.documentElement.style.removeProperty('--user-dashboard-bg-image');
    }
  }else{
    applyThemeSettings(systemSettings || {});
    document.body.classList.remove('has-user-dashboard-theme');
    dashboard?.classList.remove('has-custom-bg');
    document.documentElement.style.removeProperty('--user-dashboard-bg-image');
  }
}
async function saveUserThemeFromFile(file){
  if(!mainDb || !file) return;
  const current = getCurrentUserDoc();
  const userId = current.id || getCurrentUser().id;
  if(!userId){ showToast('تعذر تحديد اليوزر لحفظ الثيم.'); return; }
  const reader = new FileReader();
  reader.onload = async () => {
    const imageData = reader.result;
    const colors = await extractThemeColorsFromImage(imageData);
    const themeSettings = { themeImageName:file.name, themeImageData:imageData, backgroundImageData:imageData, backgroundImageUrl:'', colors, updatedAt:new Date().toISOString() };
    await safeCollection(window.MZJ_USERS_COLLECTION).doc(userId).update({ themeSettings, updatedAt: serverTime() });
    const sessionUser = { ...getCurrentUser(), themeSettings };
    setCurrentUser(sessionUser);
    applyEffectiveTheme();
    renderAdminDashboard();
    showToast('تم تطبيق ثيمك الخاص.');
  };
  reader.readAsDataURL(file);
}
async function clearCurrentUserTheme(){
  const current = getCurrentUserDoc();
  const userId = current.id || getCurrentUser().id;
  if(!mainDb || !userId) return;
  await safeCollection(window.MZJ_USERS_COLLECTION).doc(userId).update({ themeSettings: firebase.firestore.FieldValue.delete(), updatedAt: serverTime() });
  const sessionUser = { ...getCurrentUser() };
  delete sessionUser.themeSettings;
  setCurrentUser(sessionUser);
  applyEffectiveTheme();
  renderAdminDashboard();
}
function renderThemeImagePreview(settings = systemSettings){
  const preview = document.getElementById('themeImagePreview'); if(!preview) return;
  if(settings.themeImageData){ preview.innerHTML = `<img src="${escapeHtml(settings.themeImageData)}" alt="صورة الثيم"><span>${escapeHtml(settings.themeImageName || 'صورة الثيم')}</span>`; }
  else preview.textContent = 'لا توجد صورة ثيم محفوظة.';
}

function applyThemeSettings(settings = {}){
  const colors = settings.colors || {};
  const map = {
    primary:'--primary', secondary:'--secondary', accent:'--accent', surface:'--surface', bg:'--bg', line:'--line', border:'--border', text:'--text', muted:'--muted'
  };
  Object.entries(map).forEach(([key, cssVar]) => { if(colors[key]) document.documentElement.style.setProperty(cssVar, colors[key]); }); if(colors.line) document.documentElement.style.setProperty('--border', colors.line);
  if(settings.fontFamily) document.documentElement.style.setProperty('--font-family', settings.fontFamily === 'system-ui' ? 'system-ui, -apple-system, Segoe UI, sans-serif' : `'${settings.fontFamily}', sans-serif`);
  if(settings.direction){ document.documentElement.dir = settings.direction; document.body.dir = settings.direction; }
}
function fillSettingsForm(){
  const settings = { ...defaultThemeSettings, ...(systemSettings || {}), colors: { ...defaultThemeSettings.colors, ...((systemSettings || {}).colors || {}) } };
  if(document.getElementById('settingSystemName')) settingSystemName.value = settings.systemName || '';
  if(document.getElementById('settingFontFamily')) settingFontFamily.value = settings.fontFamily || 'Tajawal';
  if(document.getElementById('settingDirection')) settingDirection.value = settings.direction || 'rtl';
  if(settings.colors){
    if(document.getElementById('colorPrimary')) colorPrimary.value = settings.colors.primary || defaultThemeSettings.colors.primary;
    if(document.getElementById('colorSecondary')) colorSecondary.value = settings.colors.secondary || defaultThemeSettings.colors.secondary;
    if(document.getElementById('colorAccent')) colorAccent.value = settings.colors.accent || defaultThemeSettings.colors.accent;
    if(document.getElementById('colorSurface')) colorSurface.value = settings.colors.surface || defaultThemeSettings.colors.surface;
    if(document.getElementById('colorBg')) colorBg.value = settings.colors.bg || defaultThemeSettings.colors.bg;
    if(document.getElementById('colorLine')) colorLine.value = settings.colors.line || defaultThemeSettings.colors.line;
    if(document.getElementById('colorText')) colorText.value = settings.colors.text || defaultThemeSettings.colors.text;
    if(document.getElementById('colorMuted')) colorMuted.value = settings.colors.muted || defaultThemeSettings.colors.muted;
  }
  renderThemeImagePreview(settings);
}
function renderUsersPermissions(){
  const wrap = document.getElementById('usersPermissionsList');
  if(!wrap) return;
  const pageOptions = routes.filter(r => !['dashboard'].includes(r));
  wrap.innerHTML = users.length ? users.map(user => {
    const pages = Array.isArray(user.pages) ? user.pages : (Array.isArray(user.pagesAccess) ? user.pagesAccess : []);
    return `<article class="permission-user-card" data-user-id="${escapeHtml(user.id)}"><div class="permission-user-main"><strong>${escapeHtml(userName(user) || 'User')}</strong><small>${escapeHtml(user.email || '')}</small><span>${escapeHtml(user.role || 'user')}</span></div><div class="permission-pages"><label><input type="checkbox" data-page-key="dashboard" checked disabled> الداش بورد</label>${pageOptions.map(page => `<label><input type="checkbox" data-page-key="${page}" ${pages.includes(page) ? 'checked' : ''}> ${pageLabel(page)}</label>`).join('')}</div><button type="button" class="btn btn-primary" data-save-user-pages="${escapeHtml(user.id)}">حفظ الصلاحيات</button></article>`;
  }).join('') : '<div class="empty-state">لا توجد يوزرات.</div>';
}
function pageLabel(page){
  return {campaigns:'الحملات','create-campaign':'إنشاء حملة',departments:'الأقسام',calendar:'التقويم',tasks:'المهام',stock:'الاستوك',reports:'التقارير',settings:'الإعدادات'}[page] || page;
}
function loadSystemSettings(){
  if(!mainDb) return;
  safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).onSnapshot(doc => {
    systemSettings = doc.exists ? (doc.data() || {}) : {};
    applyEffectiveTheme();
    fillSettingsForm();
  }, error => console.error('Settings load error', error));
}
function bindSettings(){
  document.getElementById('systemSettingsForm')?.addEventListener('submit', async event => {
    event.preventDefault(); if(!mainDb) return;
    const payload = { systemName: normalizeText(document.getElementById('settingSystemName')?.value), fontFamily: normalizeText(document.getElementById('settingFontFamily')?.value) || 'Tajawal', direction: document.getElementById('settingDirection')?.value || 'rtl', updatedAt: serverTime() };
    await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set(payload, { merge:true });
    showMessage('systemSettingsMessage','تم حفظ الإعدادات.');
  });
  document.getElementById('saveThemeColorsBtn')?.addEventListener('click', async () => {
    if(!mainDb) return;
    const colors = getThemeColorPayload();
    await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({ colors, updatedAt: serverTime() }, { merge:true });
    applyThemeSettings({ colors }); showMessage('themeSettingsMessage','تم حفظ الألوان.');
  });
  document.getElementById('resetDefaultSettingsBtn')?.addEventListener('click', async () => {
    if(!mainDb) return;
    await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({...defaultThemeSettings, updatedAt: serverTime()}, { merge:true });
    showMessage('systemSettingsMessage','تم استرجاع الإعدادات الافتراضية.');
  });
  document.getElementById('resetDefaultThemeBtn')?.addEventListener('click', () => {
    applyThemeSettings({ colors: defaultThemeSettings.colors });
    systemSettings = { ...systemSettings, colors: defaultThemeSettings.colors };
    fillSettingsForm();
  });
  document.getElementById('themeImageInput')?.addEventListener('change', async event => {
    const file = event.target.files?.[0]; if(!file || !mainDb) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = String(reader.result || '');
      const colors = await extractThemeColorsFromImage(imageData);
      await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({ themeImageName:file.name, themeImageData:imageData, colors, updatedAt: serverTime() }, { merge:true });
      systemSettings = { ...systemSettings, themeImageName:file.name, themeImageData:imageData, colors };
      applyThemeSettings({ colors });
      fillSettingsForm();
      showMessage('themeSettingsMessage','تم استخراج ألوان الثيم من الصورة وحفظها.');
      renderThemeImagePreview({ themeImageName:file.name, themeImageData:imageData });
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('refreshUsersPermissionsBtn')?.addEventListener('click', renderUsersPermissions);
  document.addEventListener('click', async event => {
    const save = event.target.closest('[data-save-user-pages]');
    if(!save || !mainDb) return;
    const card = save.closest('.permission-user-card');
    const pages = [...card.querySelectorAll('input[data-page-key]:checked')].map(input => input.dataset.pageKey).filter(Boolean);
    await safeCollection(window.MZJ_USERS_COLLECTION).doc(save.dataset.saveUserPages).update({ pages, pagesAccess: pages, updatedAt: serverTime() });
    showToast('تم حفظ صلاحيات اليوزر.');
  });
}

function bootstrapData(){
  if(bootstrapData.started) return;
  bootstrapData.started = true;
  initFirebase();
  loadSystemSettings();
  loadUsers();
  loadDepartments();
  loadSimpleCollection(window.MZJ_CREATIVES_COLLECTION, creatives, renderCreatives);
  loadSimpleCollection(window.MZJ_TASK_TYPES_COLLECTION, taskTypes, renderTaskTypes);
  loadSimpleCollection(window.MZJ_CAMPAIGN_CODES_COLLECTION, campaignCodes, renderCampaignCodes);
  loadSimpleCollection(window.MZJ_CAMPAIGN_TYPES_COLLECTION, campaignTypes, renderCampaignTypes);
  loadSimpleCollection(window.MZJ_FUNNELS_COLLECTION, funnels, function(){}, true);
  loadSimpleCollection(window.MZJ_PLATFORMS_COLLECTION, platforms, renderPlatforms);
  if(mainDb){
    safeCollection(window.MZJ_CONTENT_SECTIONS_COLLECTION).orderBy('name').onSnapshot(snapshot => {
      contentSections = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || doc.id, slug: data.slug || '', types: Array.isArray(data.types) ? data.types.map(normalizeText).filter(Boolean) : [], userIds: Array.isArray(data.userIds) ? data.userIds : [], users: Array.isArray(data.users) ? data.users : [], members: Array.isArray(data.members) ? data.members : [], memberUids: Array.isArray(data.memberUids) ? data.memberUids : [], memberEmails: Array.isArray(data.memberEmails) ? data.memberEmails : [], memberNames: Array.isArray(data.memberNames) ? data.memberNames : [], departmentId: data.departmentId || data.department || data.contentDepartmentId || '' }; });
      renderContentSections();
    }, error => console.error(error));
  }
  loadCampaigns();
  loadCampaignTasks();
  loadStock();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-menu]')?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); });
  overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });
  document.getElementById('loginForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    showMessage('loginMessage', 'جاري التحقق...');
    initFirebase();

    const rawEmail = normalizeText(document.getElementById('loginEmail')?.value);
    const email = rawEmail.toLowerCase();
    const password = document.getElementById('loginPassword')?.value || '';

    if(!rawEmail || !password){
      showMessage('loginMessage', 'اكتب البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try{
      let userDoc = null;
      let authUser = null;

      // الطريقة الأساسية: Firebase Authentication عشان request.auth يشتغل في القواعد.
      if(mainAuth){
        try{
          const credential = await mainAuth.signInWithEmailAndPassword(rawEmail, password);
          authUser = credential.user;
        }catch(authError){
          console.warn('Firebase Auth login failed, trying Firestore users fallback', authError);
        }
      }

      // قراءة بيانات اليوزر من users بالـ uid لو تسجيل Firebase Auth نجح.
      if(authUser && mainDb){
        const byUid = await mainDb.collection(window.MZJ_USERS_COLLECTION).doc(authUser.uid).get();
        if(byUid.exists) userDoc = { id: byUid.id, ...byUid.data() };
      }

      // fallback: بحث مباشر في users لو الحسابات القديمة محفوظة في Firestore فقط.
      if(!userDoc && mainDb){
        const checks = [
          mainDb.collection(window.MZJ_USERS_COLLECTION).where('email','==',rawEmail).limit(1).get(),
          mainDb.collection(window.MZJ_USERS_COLLECTION).where('email','==',email).limit(1).get(),
          mainDb.collection(window.MZJ_USERS_COLLECTION).where('emailLower','==',email).limit(1).get()
        ];
        for(const req of checks){
          const snapshot = await req;
          if(!snapshot.empty){
            const doc = snapshot.docs[0];
            userDoc = { id: doc.id, ...doc.data() };
            break;
          }
        }
      }

      if(!userDoc){
        showMessage('loginMessage', 'الحساب غير موجود في users أو Firebase Authentication.');
        return;
      }

      // لو مفيش Firebase Auth للحساب القديم، نراجع password داخل users.
      if(!authUser){
        const storedPassword = userDoc.password || userDoc.pass || '';
        if(storedPassword !== password){
          showMessage('loginMessage', 'كلمة المرور غير صحيحة.');
          return;
        }
      }

      sessionStorage.setItem('mzj_logged_in','1');
      sessionStorage.setItem('mzj_user', JSON.stringify({
        id: userDoc.id,
        uid: authUser?.uid || userDoc.uid || userDoc.id,
        email: userDoc.email || rawEmail,
        name: userDoc.name || userDoc.displayName || userDoc.username || '',
        displayName: userDoc.displayName || '',
        username: userDoc.username || '',
        emailLower: userDoc.emailLower || String(userDoc.email || rawEmail).toLowerCase(),
        role: userDoc.role || '',
        department: userDoc.department || '',
        departmentId: userDoc.departmentId || '',
        departmentIds: Array.isArray(userDoc.departmentIds) ? userDoc.departmentIds : [],
        pages: Array.isArray(userDoc.pages) ? userDoc.pages : [],
        pagesAccess: Array.isArray(userDoc.pagesAccess) ? userDoc.pagesAccess : [],
        themeSettings: userDoc.themeSettings || null
      }));
      showMessage('loginMessage', '');
      openApp();
    }catch(error){
      console.error('Login error', error);
      showMessage('loginMessage', 'تعذر تسجيل الدخول. راجع إعدادات Firebase أو صلاحيات users.');
    }
  });
  document.getElementById('logoutBtn')?.addEventListener('click', () => { sessionStorage.removeItem('mzj_logged_in'); openLogin(); });
  window.addEventListener('hashchange', () => { if(isLoggedIn()) renderRoute(); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape') closeTaskModal(); });
  document.getElementById('calendarPrevMonth')?.addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth()-1); renderCalendarPage(); });
  document.getElementById('calendarNextMonth')?.addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth()+1); renderCalendarPage(); });
  document.getElementById('calendarToday')?.addEventListener('click', () => { calendarCursor = new Date(); renderCalendarPage(); });
  bindCampaignBuilder(); bindDepartments(); bindSettings();
  document.getElementById('dashboard')?.addEventListener('click', async event => {
    const stageBtn = event.target.closest('[data-stage][data-campaign-id]');
    if(stageBtn){ event.stopPropagation(); await togglePublishStage(stageBtn.dataset.campaignId, stageBtn.dataset.stage); return; }
    const receivedBtn = event.target.closest('[data-toggle-received]');
    if(receivedBtn){ await toggleTaskReceived(receivedBtn.dataset.toggleReceived); return; }
    const stepBtn = event.target.closest('[data-task-step]');
    if(stepBtn){ await toggleTaskStep(stepBtn.dataset.taskStep, stepBtn.dataset.stepIndex); return; }
    const taskCard = event.target.closest('[data-open-task]');
    if(taskCard){ renderTaskDetail(taskCard.dataset.openTask, taskCard.dataset.taskCampaign || ''); return; }
    const uploadTheme = event.target.closest('#userThemeImageInput');
    const clearTheme = event.target.closest('#clearUserThemeBtn');
    if(clearTheme){ await clearCurrentUserTheme(); return; }
    const campaignCard = event.target.closest('[data-open-campaign]');
    if(campaignCard){ toggleCampaignInlineTasks(campaignCard, campaignCard.dataset.openCampaign); return; }
    if(event.target.id === 'closeDashboardDetail'){ document.getElementById('dashboardCampaignDetail')?.classList.remove('show'); }
  });

  document.addEventListener('change', async event => {
    if(event.target && event.target.id === 'userThemeImageInput'){
      const file = event.target.files?.[0];
      event.target.value = '';
      if(file) await saveUserThemeFromFile(file);
    }
  });

  document.getElementById('tasksBoard')?.addEventListener('click', event => {
    const taskCard = event.target.closest('[data-open-task]');
    if(taskCard) renderTaskDetail(taskCard.dataset.openTask, taskCard.dataset.taskCampaign || '');
  });

  document.addEventListener('click', async event => {
    if(event.target.closest('[data-close-task-modal]')){ closeTaskModal(); return; }
    const modalReceivedBtn = event.target.closest('#taskModal [data-toggle-received]');
    if(modalReceivedBtn){ await toggleTaskReceived(modalReceivedBtn.dataset.toggleReceived); return; }
    const modalStepBtn = event.target.closest('#taskModal [data-task-step]');
    if(modalStepBtn){ await toggleTaskStep(modalStepBtn.dataset.taskStep, modalStepBtn.dataset.stepIndex); return; }
    const uploadBtn = event.target.closest('[data-upload-task-attachment]');
    if(uploadBtn){ document.getElementById('taskAttachmentInput')?.click(); return; }
    const delFile = event.target.closest('[data-delete-task-file]');
    if(delFile && activeTaskModalMeta){
      const task = findTaskById(activeTaskModalMeta.taskId, activeTaskModalMeta.campaignId);
      if(!task) return;
      const files = taskFiles(task).filter((_, i) => i !== Number(delFile.dataset.deleteTaskFile));
      await updateTaskOnFirebase(task.id, { attachments: files });
      refreshOpenTaskModal();
    }
  });
  document.getElementById('taskAttachmentInput')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if(!file || !activeTaskModalMeta) return;
    const task = findTaskById(activeTaskModalMeta.taskId, activeTaskModalMeta.campaignId);
    if(!task) return;
    try{
      showToast('جاري رفع الملف...');
      const record = await uploadTaskFileToDrive(file, task);
      await updateTaskOnFirebase(task.id, { attachments: [...taskFiles(task), record] });
      showToast('تم رفع الملف.');
      refreshOpenTaskModal();
    }catch(error){ console.error(error); showToast(error.message || 'تعذر رفع الملف.'); }
  });

  isLoggedIn() ? openApp() : openLogin();
});
