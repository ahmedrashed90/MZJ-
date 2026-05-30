
function scrubSensitiveLoginUrl(){
  try{
    const params = new URLSearchParams(window.location.search || '');
    if(params.has('password') || params.has('email')){
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }catch(error){
    console.warn('Unable to scrub sensitive login URL', error);
  }
}
scrubSensitiveLoginUrl();

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
window.MZJ_CAMPAIGN_TASKS_COLLECTION = "campaign_tasks"; // غير مستخدم في داشبورد اليوزرات
window.MZJ_SYSTEM_SETTINGS_COLLECTION = "system_settings";
window.MZJ_PUBLISH_PREP_COLLECTION = "publish_prep_tasks";
window.MZJ_PUBLISH_LOGS_COLLECTION = "publish_logs";
window.MZJ_SYSTEM_SETTINGS_DOC = "main";
window.MZJ_STOCK_META_COLLECTION = "marketing_stock_cars"; // مسار حفظ حالة تم التصوير

const routes = ['dashboard','reports','create-campaign','campaigns','social-publisher','publish-prep','tasks','calendar','stock','departments','settings'];
const pageAliases = {
  database: 'reports',
  report: 'reports',
  reports: 'reports',
  admin: 'settings',
  users: 'settings',
  permissions: 'settings',
  dashboard: 'dashboard',
  campaigns: 'campaigns',
  publisher: 'social-publisher',
  publish: 'social-publisher',
  social: 'social-publisher',
  'social-publisher': 'social-publisher',
  'publish-prep': 'publish-prep',
  publish_prep: 'publish-prep',
  publishing_prep: 'publish-prep',
  prep: 'publish-prep',
  'تجهيز-النشر': 'publish-prep',
  'create-campaign': 'create-campaign',
  create_campaign: 'create-campaign',
  departments: 'departments',
  content: 'departments',
  calendar: 'calendar',
  tasks: 'tasks',
  stock: 'stock',
  settings: 'settings'
};
function normalizePageKey(page){
  const key = String(page || '').trim();
  return pageAliases[key] || key;
}
function normalizePagesList(list){
  return uniqueList((Array.isArray(list) ? list : []).map(normalizePageKey)).filter(page => routes.includes(page));
}
const loginView = document.getElementById('loginView');
const appShell = document.getElementById('appShell');
const sidebar = document.getElementById('sidebar');
const overlay = document.querySelector('[data-close-menu]');

let mainDb = null;
let mainAuth = null;
let mainStorage = null;
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
let activeStructureUploadMeta = null;
let campaignTasks = [];
let cars = [];
let stockCarMeta = {};
let stockFilterMode = "all";
let systemSettings = {};
let activeTaskModalMeta = null;
let publishPrepSubmissionsCache = null;
let publishPrepFirestoreReady = false;
let publishPrepUnsubscribe = null;
let publishLogsCache = [];
let publishLogsUnsubscribe = null;

function isLoggedIn(){ return localStorage.getItem('mzj_logged_in') === '1'; }
function getRoute(){ return (location.hash || '#dashboard').replace('#',''); }
function openApp(){ loginView.classList.add('is-hidden'); appShell.classList.remove('is-hidden'); renderRoute(); bootstrapData(); }
function openLogin(){ appShell.classList.add('is-hidden'); loginView.classList.remove('is-hidden'); }

function updateTopbarUser(){
  const target = document.getElementById('topbarUserName');
  if(!target) return;
  const user = getCurrentUserIdentity();
  const displayName = user.name || user.email || 'مستخدم';
  const dep = departmentForUser(user.id || user.uid || user.email || displayName);
  const depName = dep?.name || getCurrentUser()?.departmentName || getCurrentUser()?.department || '';
  target.innerHTML = `<span class="topbar-user-name">${escapeHtml(displayName)}</span>${depName ? `<small class="topbar-user-department">${escapeHtml(depName)}</small>` : ''}`;
}

function renderRoute(){
  applyEffectiveTheme();
  updateTopbarUser();
  applyAppearanceMode();
  renderTopbarNotifications();
  applyUserPermissions();
  let route = routes.includes(getRoute()) ? getRoute() : 'dashboard';
  if(!pageAllowed(route)){
    route = 'dashboard';
    if(location.hash !== '#dashboard') location.hash = '#dashboard';
  }
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === route));
  document.querySelectorAll('.nav a').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  sidebar?.classList.remove('open'); overlay?.classList.remove('show');
  if(route === 'create-campaign') ensureDefaultCampaignDate();
  if(route === 'dashboard') renderAdminDashboard();
  if(route === 'calendar') renderCalendarPage();
  if(route === 'tasks') renderTasksPage();
  if(route === 'stock') renderStock();
  if(route === 'reports') renderDatabasePage();
  if(route === 'social-publisher') renderSocialPublisherPage();
  if(route === 'publish-prep') renderPublishPrepPage();
}
function showMessage(id, text){ const el = document.getElementById(id); if(el) el.textContent = text || ''; }
function escapeHtml(value){ return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function normalizeText(value){ return String(value ?? '').trim(); }
function getDocName(data){ return normalizeText(data.name || data.fullName || data.displayName || data.username || data.email || data.title || data.label); }
function uniqueList(list){ return [...new Set(list.map(normalizeText).filter(Boolean))]; }
function getSelectedValues(select){ return [...(select?.selectedOptions || [])].map(option => option.value).filter(Boolean); }
function serverTime(){ return firebase.firestore.FieldValue.serverTimestamp(); }
function safeCollection(name){ return mainDb.collection(name); }
function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem('mzj_user') || '{}') || {}; }catch(_){ return {}; } }
function getCurrentUserIdentity(){
  const user = getCurrentUser() || {};
  const authUser = mainAuth?.currentUser || null;
  return {
    id: user.id || user.uid || authUser?.uid || '',
    uid: user.uid || user.id || authUser?.uid || '',
    name: user.name || user.displayName || user.username || authUser?.displayName || '',
    email: user.email || authUser?.email || localStorage.getItem('mzj_login_email') || '',
    role: user.role || 'user'
  };
}

function setCurrentUser(user){ localStorage.setItem('mzj_user', JSON.stringify(user || {})); }
function syncCurrentSessionUserFromUsers(){
  const current = getCurrentUser();
  if(!current || !Object.keys(current).length || !users.length) return;
  const currentKeys = uniqueIdentityKeys([current]);
  const record = users.find(user => uniqueIdentityKeys([user]).some(key => currentKeys.includes(key)));
  if(record){
    const pages = normalizePagesList([...(Array.isArray(record.pages) ? record.pages : []), ...(Array.isArray(record.pagesAccess) ? record.pagesAccess : [])]);
    setCurrentUser({ ...current, ...record, id: record.id || current.id, uid: record.uid || current.uid || record.id, pages, pagesAccess: pages });
  }
}
function isCurrentUserAdmin(){ const user = getCurrentUser(); return user.role === 'admin' || user.role === 'super_admin' || isAdminEmailUser(user); }
function isAdminEmailUser(user){ return ['hossamzayan10@gmail.com','mr.ahmed_rashed@outlook.sa'].includes(String(user?.email || '').toLowerCase()); }
function pageAllowed(route){
  if(isCurrentUserAdmin()) return true;
  return allowedPagesForCurrentUser().includes(route);
}

function allowedPagesForCurrentUser(){
  if(isCurrentUserAdmin()) return routes;
  const user = getCurrentUser();
  const raw = [...(Array.isArray(user.pages) ? user.pages : []), ...(Array.isArray(user.pagesAccess) ? user.pagesAccess : [])];
  return uniqueList(['dashboard', ...normalizePagesList(raw)]);
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
    if(firebase.storage){
      try{ mainStorage = firebase.storage(mainApp); }catch(storageError){ console.error('Main Firebase storage init error', storageError); }
    }
    if(firebase.auth){
      mainAuth = firebase.auth(mainApp);
      try{ mainAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }catch(_){}
    }
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
  const chosen = Array.isArray(selectedIds) ? selectedIds.map(String) : [];
  const list = usersForContentSection(sectionId);
  return list.length
    ? list.map(user => `<label class="task-user-check-card"><input type="checkbox" class="js-task-user-checkbox" value="${escapeHtml(user.id)}" data-name="${escapeHtml(userName(user))}"${chosen.includes(String(user.id)) ? ' checked' : ''}> <span>${escapeHtml(userName(user))}</span></label>`).join('')
    : '<div class="multi-empty task-user-empty">لا توجد يوزرات لهذا القسم</div>';
}
function selectedOptionTexts(control){
  if(control?.classList?.contains('js-role-picker') || (control?.classList?.contains('js-task-user') && control?.tagName !== 'SELECT')){
    return [...control.querySelectorAll('input[type="checkbox"]:checked')]
      .map(input => input.dataset.name || input.closest('label')?.textContent?.trim() || '')
      .filter(Boolean);
  }
  return [...(control?.selectedOptions || [])]
    .map(option => option.textContent.trim())
    .filter(text => text && !text.startsWith('اختر') && !text.startsWith('لا توجد'));
}
function selectedOptionValues(control){
  if(control?.classList?.contains('js-role-picker') || (control?.classList?.contains('js-task-user') && control?.tagName !== 'SELECT')){
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

function creativeCheckboxList(selected = []){
  const chosen = Array.isArray(selected) ? selected.map(String) : String(selected || '').split('|').map(x => x.trim()).filter(Boolean);
  if(!creatives.length) return '<div class="multi-empty">لا توجد كريتيفات</div>';
  return creatives.map(item => `<label class="creative-check-card"><input type="checkbox" class="js-creative-check" value="${escapeHtml(item.name)}"${chosen.includes(item.name) ? ' checked' : ''}> <span>${escapeHtml(item.name)}</span></label>`).join('');
}
function selectedCreativeNames(row){
  const fromChecks = [...(row?.querySelectorAll('.js-creative-check:checked') || [])].map(input => normalizeText(input.value)).filter(Boolean);
  if(fromChecks.length) return uniqueList(fromChecks);
  const legacy = normalizeText(row?.querySelector('.js-creative-select')?.value || '');
  return legacy ? [legacy] : [];
}
function creativeProductLabel(creative, row){
  const userNames = [...(row?.querySelectorAll('.js-task-user') || [])].flatMap(control => selectedOptionTexts(control));
  return creative && userNames.length ? `${creative} - ${uniqueList(userNames).join(' - ')}` : creative || '';
}
function taskTypeOptions(selectedValue = ''){
  return '<option value="">اختر نوع التاسك</option>' + taskTypes.map(item => `<option value="${escapeHtml(item.name)}"${selectedValue === item.name ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}
function campaignTypeOptions(selectedValue = ''){
  return '<option value="">اختر نوع الحملة</option>' + campaignTypes.map(item => {
    const codeLabel = [item.prefix || 'MZJ', item.code].filter(Boolean).join('-');
    const label = codeLabel ? `${item.name} - ${codeLabel}` : item.name;
    const selected = selectedValue === item.id || selectedValue === item.name;
    return `<option value="${escapeHtml(item.id)}"${selected ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
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
  const current = normalizeText(selectedValue || '');
  const products = uniqueList([...getCampaignProducts(), current].filter(Boolean));
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
  document.querySelectorAll('.creative-checkbox-grid').forEach(box => { const row = box.closest('.creative-row-card'); const selected = selectedCreativeNames(row); box.innerHTML = creativeCheckboxList(selected); });
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
    users = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, uid: data.uid || doc.id, name: getDocName(data) || doc.id, displayName: data.displayName || '', username: data.username || '', email: data.email || '', emailLower: data.emailLower || String(data.email || '').toLowerCase(), department: data.department || '', departmentId: data.departmentId || '', departmentIds: Array.isArray(data.departmentIds) ? data.departmentIds : [], role: data.role || '', pages: normalizePagesList([...(Array.isArray(data.pages) ? data.pages : []), ...(Array.isArray(data.pagesAccess) ? data.pagesAccess : [])]), pagesAccess: normalizePagesList([...(Array.isArray(data.pages) ? data.pages : []), ...(Array.isArray(data.pagesAccess) ? data.pagesAccess : [])]), themeSettings: data.themeSettings || null }; });
    const before = JSON.stringify(getCurrentUser() || {});
    syncCurrentSessionUserFromUsers();
    refreshDynamicSelects(); renderDepartments(); renderUsersPermissions(); renderAdminDashboard(); renderTasksPage();
    updateTopbarUser();
    applyUserPermissions();
    const after = JSON.stringify(getCurrentUser() || {});
    if(before !== after || !pageAllowed(getRoute())) renderRoute();
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
    updateTopbarUser();
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
function renderCampaignTypes(){
  const list = document.getElementById('campaignTypesList'); if(!list) return;
  if(!campaignTypes.length){ list.innerHTML = '<div class="empty-state">لا توجد أنواع حملات حتى الآن.</div>'; return; }
  list.innerHTML = campaignTypes.map(item => {
    const codeLabel = [item.prefix || 'MZJ', item.code].filter(Boolean).join('-') || 'بدون كود';
    const nextNumber = Number(item.nextNumber) || 1;
    return `<article class="department-item">
      <div class="item-head"><h3>${escapeHtml(item.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-campaign-type="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-campaign-type="${escapeHtml(item.id)}">حذف</button></div></div>
      <div class="chip-list"><span class="chip">${escapeHtml(codeLabel)}</span><span class="chip"><small>المسلسل القادم: ${escapeHtml(String(nextNumber).padStart(3, '0'))}</small></span></div>
    </article>`;
  }).join('');
}
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

function stockGroupDocId(groupKey){
  const source = normalizeText(groupKey || 'stock-item');
  let hash = 0;
  for(let i=0;i<source.length;i++){ hash = ((hash << 5) - hash) + source.charCodeAt(i); hash |= 0; }
  return 'stock_' + Math.abs(hash).toString(36) + '_' + source.replace(/[^\u0600-\u06FF\w-]+/g,'_').slice(0,60);
}
function stockMetaTime(meta){
  const raw = meta?.updatedAtIso || meta?.savedAtIso || meta?.updatedAt || meta?.savedAt || '';
  if(raw && typeof raw.toDate === 'function') return raw.toDate().getTime() || 0;
  const parsed = raw ? Date.parse(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}
function mergeStockMetaRecord(oldMeta, nextMeta){
  if(!oldMeta) return nextMeta || {};
  if(!nextMeta) return oldMeta || {};
  const oldTime = stockMetaTime(oldMeta);
  const nextTime = stockMetaTime(nextMeta);
  if(nextTime >= oldTime) return { ...oldMeta, ...nextMeta };
  return { ...nextMeta, ...oldMeta };
}
function mergeStockMetaMaps(...maps){
  const merged = {};
  maps.forEach(map => {
    Object.entries(map || {}).forEach(([key, value]) => {
      merged[key] = mergeStockMetaRecord(merged[key], value || {});
    });
  });
  return merged;
}
function stockMetaForKey(groupKey){ return stockCarMeta[stockGroupDocId(groupKey)] || {}; }
function readLocalStockMeta(){
  try{ return JSON.parse(localStorage.getItem('mzj_stock_meta_cache') || '{}') || {}; }catch(_){ return {}; }
}
function writeLocalStockMeta(docId, data){
  try{
    const current = readLocalStockMeta();
    current[docId] = mergeStockMetaRecord(current[docId] || {}, data || {});
    localStorage.setItem('mzj_stock_meta_cache', JSON.stringify(current));
  }catch(_){}
}
function loadStockMeta(){
  // مسارات الحفظ المقروءة:
  // 1) Firebase الرئيسي: marketing_stock_cars/{docId}
  // 2) Firebase الاستوك لو الصلاحيات تسمح: marketing_stock_cars/{docId}
  // 3) system_settings/main.stockCarStatusMap كمسار احتياطي قديم
  // 4) localStorage كاحتياطي لحظي فقط
  let mainCollectionMeta = {};
  let stockCollectionMeta = {};
  let settingsMeta = {};
  const applyMeta = () => {
    stockCarMeta = mergeStockMetaMaps(mainCollectionMeta, stockCollectionMeta, settingsMeta, readLocalStockMeta());
    renderStock();
  };

  if(mainDb){
    mainDb.collection(window.MZJ_STOCK_META_COLLECTION).onSnapshot(snapshot => {
      mainCollectionMeta = {};
      snapshot.docs.forEach(doc => { mainCollectionMeta[doc.id] = { id: doc.id, ...(doc.data() || {}) }; });
      applyMeta();
    }, error => { console.error('Main stock meta collection load error', error); applyMeta(); });

    safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).onSnapshot(doc => {
      const data = doc.exists ? (doc.data() || {}) : {};
      settingsMeta = data.stockCarStatusMap || data.stockCarMeta || {};
      applyMeta();
    }, error => { console.error('Stock meta settings load error', error); applyMeta(); });
  }

  if(stockDb){
    stockDb.collection(window.MZJ_STOCK_META_COLLECTION).onSnapshot(snapshot => {
      stockCollectionMeta = {};
      snapshot.docs.forEach(doc => { stockCollectionMeta[doc.id] = { id: doc.id, ...(doc.data() || {}) }; });
      applyMeta();
    }, error => { console.warn('Stock-project meta collection load skipped/error', error); applyMeta(); });
  }

  applyMeta();
}
function campaignTaskCars(){
  const used = [];
  campaigns.forEach(campaign => {
    (campaign.departmentTasks || []).forEach(task => {
      if(task.selectedCar) used.push({ label: normalizeText(task.selectedCar), campaign, task });
      (task.selectedCars || []).forEach(car => used.push({ id: normalizeText(car.id), label: normalizeText(car.label || car.name || car.carName), campaign, task }));
    });
    (campaign.creatives || []).forEach(creative => {
      (creative.selectedCars || []).forEach(car => used.push({ id: normalizeText(car.id), label: normalizeText(car.label || car.name || car.carName), campaign, task: null }));
    });
  });
  return used;
}
function stockGroupUsage(group){
  const used = campaignTaskCars();
  const ids = new Set((group.carIds || []).map(normalizeText).filter(Boolean));
  const keyParts = [group.carName, group.statement, group.exteriorColor, group.interiorColor].map(normalizeText).filter(Boolean);
  const hits = used.filter(item => {
    const idHit = item.id && ids.has(item.id);
    const label = normalizeText(item.label);
    const labelHit = label && keyParts.every(part => label.includes(part) || part === '—');
    return idHit || labelHit;
  });
  return hits;
}

function carFieldValue(car, keys){
  for(const key of keys){
    if(car && car[key] !== undefined && car[key] !== null && normalizeText(car[key]) !== '') return normalizeText(car[key]);
  }
  return '';
}
function stockRowModelYears(group){
  return uniqueList((group.cars || []).map(car => carFieldValue(car, ['modelYear','model_year','year','model','carModel','سنة الموديل','الموديل','السنة'])).filter(Boolean));
}
function stockTaskRole(item){
  const task = item?.task || {};
  return normalizeDepartmentRole(task.departmentRole || task.assignedDepartmentName || task.contentSectionName || task.contentSection || task.departmentName || '');
}
function stockTaskTypeText(item){
  const task = item?.task || {};
  return normalizeText(task.taskType || task.contentType || task.content_type || task.structureTaskLabel || task.creative || task.product || item?.label || '');
}
function stockRowMontageDetails(group){
  return uniqueList((group.usage || []).filter(item => stockTaskRole(item) === 'montage').map(stockTaskTypeText).filter(Boolean));
}
function stockRowHasMontage(group){ return stockRowMontageDetails(group).length > 0; }
function stockRowInsideAgenda(group){
  return (group.usage || []).some(item => Array.isArray(item?.campaign?.publishSchedule) && item.campaign.publishSchedule.some(row => row && row.date));
}
function stockRowAgendaMonths(group){
  const months = [];
  (group.usage || []).forEach(item => {
    const list = Array.isArray(item?.campaign?.publishSchedule) ? item.campaign.publishSchedule : [];
    list.forEach(row => {
      const d = row?.date || row?.publishDate || row?.dayDate || '';
      const date = d ? new Date(`${d}T00:00:00`) : null;
      if(date && !Number.isNaN(date.getTime())) months.push(String(date.getMonth() + 1));
    });
  });
  return uniqueList(months);
}
function stockSearchText(group){
  const years = stockRowModelYears(group).join(' ');
  const usageText = (group.usage || []).map(item => [item?.campaign?.campaignName, item?.campaign?.campaignCode, stockTaskTypeText(item), item?.label].filter(Boolean).join(' ')).join(' ');
  return identityClean([group.key, group.carName, group.statement, group.exteriorColor, group.interiorColor, years, usageText].join(' '));
}
function stockSystemMontageDetailOptions(){
  const fromSections = contentSections.filter(section => normalizeDepartmentRole(section.name || section.slug || section.departmentId || '') === 'montage')
    .flatMap(section => Array.isArray(section.types) ? section.types : []);
  const fromTasks = taskTypes.map(item => item.name).filter(Boolean);
  const fromUsage = stockRowsWithMeta().flatMap(row => stockRowMontageDetails(row));
  return uniqueList([...fromSections, ...fromUsage, ...fromTasks].map(normalizeText).filter(Boolean)).sort((a,b) => a.localeCompare(b, 'ar'));
}
function updateStockDynamicFilterOptions(rows){
  const fill = (id, placeholder, values) => {
    const select = document.getElementById(id);
    if(!select) return;
    const old = select.value || '';
    select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>` + uniqueList(values.map(normalizeText).filter(Boolean)).sort((a,b) => a.localeCompare(b, 'ar')).map(value => `<option value="${escapeHtml(value)}"${old === value ? ' selected' : ''}>${escapeHtml(value)}</option>`).join('');
    if(old && ![...select.options].some(option => option.value === old)) select.value = '';
  };
  fill('stockCarFilter', 'السيارة (الكل)', rows.map(row => row.carName));
  fill('stockStatementFilter', 'البيان (الكل)', rows.map(row => row.statement));
  fill('stockMontageDetailFilter', 'تفاصيل المونتاج (الكل)', stockSystemMontageDetailOptions());
}
function stockAdvancedFilterValues(){
  const val = id => normalizeText(document.getElementById(id)?.value || '');
  return {
    search: val('stockSearchInput'),
    car: val('stockCarFilter'),
    statement: val('stockStatementFilter'),
    shot: val('stockShotFilter'),
    montage: val('stockMontageFilter'),
    montageDetail: val('stockMontageDetailFilter'),
    exterior: val('stockExteriorFilter'),
    interior: val('stockInteriorFilter'),
    insideAgenda: val('stockAgendaInsideFilter'),
    agendaMonth: val('stockAgendaMonthFilter')
  };
}
function filterStockRowsAdvanced(rows){
  const f = stockAdvancedFilterValues();
  return rows.filter(group => {
    if(f.search && !stockSearchText(group).includes(identityClean(f.search))) return false;
    if(f.car && normalizeText(group.carName) !== f.car) return false;
    if(f.statement && normalizeText(group.statement) !== f.statement) return false;
    if(f.shot === 'yes' && !group.isPhotographed) return false;
    if(f.shot === 'no' && group.isPhotographed) return false;
    const hasMontage = stockRowHasMontage(group);
    if(f.montage === 'yes' && !hasMontage) return false;
    if(f.montage === 'no' && hasMontage) return false;
    if(f.montageDetail && !stockRowMontageDetails(group).includes(f.montageDetail)) return false;
    if(f.exterior && !identityClean(group.exteriorColor).includes(identityClean(f.exterior))) return false;
    if(f.interior && !identityClean(group.interiorColor).includes(identityClean(f.interior))) return false;
    const inside = stockRowInsideAgenda(group);
    if(f.insideAgenda === 'yes' && !inside) return false;
    if(f.insideAgenda === 'no' && inside) return false;
    if(f.agendaMonth && !stockRowAgendaMonths(group).includes(String(Number(f.agendaMonth)))) return false;
    return true;
  });
}
function currentFilteredStockRows(){
  const mode = document.getElementById('stockFilterMode')?.value || stockFilterMode || 'all';
  return filterStockRowsAdvanced(filterStockRows(stockRowsWithMeta(), mode));
}
function clearStockFilters(){
  ['stockSearchInput','stockCarFilter','stockStatementFilter','stockShotFilter','stockMontageFilter','stockMontageDetailFilter','stockExteriorFilter','stockInteriorFilter','stockAgendaInsideFilter','stockAgendaMonthFilter'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  stockFilterMode = 'all';
  const mode = document.getElementById('stockFilterMode');
  if(mode) mode.value = 'all';
  renderStock();
}
function exportStockRowsToExcel(){
  const rows = currentFilteredStockRows();
  if(!rows.length) return showToast('لا توجد بيانات لتصديرها.');
  const headers = ['م','Unique Spec Key','السيارة','البيان','اللون الخارجي','اللون الداخلي','الموديل','العدد','تم التصوير','الاستخدام','تفاصيل المونتاج','داخل الأجندة','شهور الأجندة'];
  const body = rows.map((group, index) => [
    index + 1,
    [group.carName, group.statement].filter(Boolean).join(' - '),
    group.carName || '',
    group.statement || '',
    group.exteriorColor || '',
    group.interiorColor || '',
    stockRowModelYears(group).join('، '),
    group.count || 0,
    group.isPhotographed ? 'نعم' : 'لا',
    group.isUsed ? `مستخدمة في ${group.usage.length} تاسك` : 'غير مستخدمة',
    stockRowMontageDetails(group).join('، '),
    stockRowInsideAgenda(group) ? 'نعم' : 'لا',
    stockRowAgendaMonths(group).join('، ')
  ]);
  const esc = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const table = `<html><head><meta charset="utf-8"></head><body dir="rtl"><table border="1"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
  const blob = new Blob(['\ufeff', table], { type:'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stock-export-${todayInputDate()}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function stockGroupByKey(groupKey){
  // التصحيح المهم: مصدر جروبات الاستوك هو buildStockGroups، مش stockGroups غير موجودة.
  // وجود stockGroups كان بيكسر onchange قبل ما يوصل للحفظ في Firebase.
  return buildStockGroups().find(group => group.key === groupKey) || null;
}
async function saveStockShotStatus(groupKey, value){
  const group = stockGroupByKey(groupKey);
  const docId = stockGroupDocId(groupKey);
  const previous = stockCarMeta[docId] || {};
  const current = getCurrentUserIdentity();
  const nowIso = new Date().toISOString();
  const simplePayload = {
    groupKey: normalizeText(groupKey),
    docKey: docId,
    carName: normalizeText(group?.carName || previous.carName || ''),
    statement: normalizeText(group?.statement || previous.statement || ''),
    exteriorColor: normalizeText(group?.exteriorColor || previous.exteriorColor || ''),
    interiorColor: normalizeText(group?.interiorColor || previous.interiorColor || ''),
    carIds: Array.isArray(group?.carIds) ? group.carIds.map(normalizeText).filter(Boolean) : (previous.carIds || []),
    count: Number(group?.count || previous.count || 0),
    photographed: value === 'yes',
    photographedValue: value === 'yes' ? 'yes' : 'no',
    updatedAtIso: nowIso,
    savedAtIso: nowIso,
    updatedBy: current.email || current.name || current.uid || ''
  };
  const payload = { ...simplePayload, updatedAt: serverTime() };
  const optimistic = { ...previous, ...simplePayload, updatedAt: nowIso };

  stockCarMeta[docId] = optimistic;
  writeLocalStockMeta(docId, optimistic);
  renderStock();

  const writes = [];
  if(mainDb){
    writes.push(mainDb.collection(window.MZJ_STOCK_META_COLLECTION).doc(docId).set(payload, { merge: true }));
  }
  if(stockDb){
    writes.push(stockDb.collection(window.MZJ_STOCK_META_COLLECTION).doc(docId).set(payload, { merge: true }));
  }

  const results = writes.length ? await Promise.allSettled(writes) : [];
  const savedDirectly = results.some(result => result.status === 'fulfilled');
  if(savedDirectly){
    stockCarMeta[docId] = mergeStockMetaRecord(stockCarMeta[docId], simplePayload);
    writeLocalStockMeta(docId, stockCarMeta[docId]);
    renderStock();
    showToast('تم حفظ حالة التصوير.');
    return;
  }

  const firstError = results.find(result => result.status === 'rejected')?.reason;
  console.error('Stock shot direct save failed', firstError);

  if(mainDb){
    try{
      await mainDb.collection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({
        stockCarStatusMap: { [docId]: { ...simplePayload, savedIn: 'system_settings_fallback' } },
        updatedAt: serverTime(),
        updatedBy: current.email || current.name || current.uid || ''
      }, { merge: true });
      stockCarMeta[docId] = mergeStockMetaRecord(stockCarMeta[docId], { ...simplePayload, savedIn: 'system_settings_fallback' });
      writeLocalStockMeta(docId, stockCarMeta[docId]);
      renderStock();
      showToast('تم حفظ حالة التصوير.');
      return;
    }catch(fallbackError){
      console.error('Stock shot fallback save failed', fallbackError);
      const msg = String(fallbackError?.message || firstError?.message || fallbackError || firstError || '');
      if(msg.toLowerCase().includes('permission')) showToast('تم حفظها مؤقتاً على الجهاز، لكن Firebase رفض الحفظ. راجع Rules لمسار marketing_stock_cars.');
      else showToast('تم حفظها مؤقتاً على الجهاز، وتعذر حفظها في Firebase: ' + msg.slice(0, 90));
      return;
    }
  }

  showToast('تم حفظها مؤقتاً على الجهاز، لكن Firebase غير متاح.');
}

const stockShotSavingKeys = new Set();
async function handleStockShotSelectChange(select){
  if(!select) return;
  if(select._mzjStockShotBusy) return;
  select._mzjStockShotBusy = true;
  const groupKey = select.dataset.stockShot || select.getAttribute('data-stock-shot') || '';
  if(!groupKey){ select._mzjStockShotBusy = false; return; }
  const value = select.value === 'yes' ? 'yes' : 'no';
  const docId = stockGroupDocId(groupKey);
  const previous = stockCarMeta[docId] || {};
  const group = stockGroupByKey(groupKey);
  const current = getCurrentUserIdentity();
  const nowIso = new Date().toISOString();
  const optimistic = {
    ...previous,
    groupKey: normalizeText(groupKey),
    docKey: docId,
    carName: normalizeText(group?.carName || previous.carName || ''),
    statement: normalizeText(group?.statement || previous.statement || ''),
    exteriorColor: normalizeText(group?.exteriorColor || previous.exteriorColor || ''),
    interiorColor: normalizeText(group?.interiorColor || previous.interiorColor || ''),
    carIds: Array.isArray(group?.carIds) ? group.carIds.map(normalizeText).filter(Boolean) : (previous.carIds || []),
    count: Number(group?.count || previous.count || 0),
    photographed: value === 'yes',
    photographedValue: value,
    updatedAt: nowIso,
    updatedAtIso: nowIso,
    savedAtIso: nowIso,
    updatedBy: current.email || current.name || current.uid || ''
  };

  // تحديث فوري في الواجهة والكاش قبل انتظار Firebase.
  stockCarMeta[docId] = optimistic;
  writeLocalStockMeta(docId, optimistic);
  stockShotSavingKeys.add(docId);
  renderStock();

  const activeSelect = document.querySelector(`[data-stock-shot="${cssEscape(groupKey)}"]`);
  if(activeSelect){
    activeSelect.value = value;
    activeSelect.classList.add('is-saving');
    activeSelect.disabled = true;
  }
  try{
    await saveStockShotStatus(groupKey, value);
  }finally{
    select._mzjStockShotBusy = false;
    stockShotSavingKeys.delete(docId);
    const nextSelect = document.querySelector(`[data-stock-shot="${cssEscape(groupKey)}"]`);
    if(nextSelect){
      nextSelect.disabled = false;
      nextSelect.classList.remove('is-saving');
      nextSelect.value = value;
    }
  }
}

function cssEscape(value){
  if(window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
  return String(value).replace(/[\\"]/g, '\\$&');
}
window.mzjHandleStockShotChange = handleStockShotSelectChange;

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
  if(tbody) tbody.innerHTML = '<tr class="empty-row"><td colspan="8">تعذر تحميل بيانات الاستوك.</td></tr>';
}
function stockGroupKeyFromCar(car){
  const carName = normalizeText(car.carName || '—') || '—';
  const statement = normalizeText(car.statement || '—') || '—';
  const exteriorColor = normalizeText(car.exteriorColor || '—') || '—';
  const interiorColor = normalizeText(car.interiorColor || '—') || '—';
  return [carName, statement, exteriorColor, interiorColor].join(' | ');
}
function buildStockGroups(){
  const visibleCars = cars.filter(car => !isExcludedStockStatus(stockStatusOf(car)));
  const groups = new Map();
  visibleCars.forEach(car => {
    const carName = normalizeText(car.carName || '—') || '—';
    const statement = normalizeText(car.statement || '—') || '—';
    const exteriorColor = normalizeText(car.exteriorColor || '—') || '—';
    const interiorColor = normalizeText(car.interiorColor || '—') || '—';
    const key = stockGroupKeyFromCar(car);
    if(!groups.has(key)) groups.set(key, { key, carName, statement, exteriorColor, interiorColor, count: 0, carIds: [], cars: [] });
    const group = groups.get(key);
    group.count += 1;
    group.cars.push(car);
    group.carIds.push(normalizeText(car.id || car.vin || car.plate || ''));
  });
  return [...groups.values()].sort((a,b) => b.count - a.count || a.key.localeCompare(b.key, 'ar'));
}
function stockRowsWithMeta(){
  return buildStockGroups().map(group => {
    const meta = stockMetaForKey(group.key);
    const usage = stockGroupUsage(group);
    return { ...group, meta, usage, isUsed: usage.length > 0, isPhotographed: meta.photographed === true || meta.photographedValue === 'yes' };
  });
}
function filterStockRows(rows, mode = stockFilterMode){
  if(mode === 'not-photographed') return rows.filter(group => !group.isPhotographed);
  if(mode === 'unused') return rows.filter(group => !group.isUsed);
  if(mode === 'not-photographed-unused') return rows.filter(group => !group.isPhotographed && !group.isUsed);
  return rows;
}
function stockRowsCount(rows){ return rows.reduce((sum, group) => sum + (Number(group.count) || 0), 0); }
function updateStockFilterLabels(select, rows){
  const counts = {
    all: stockRowsCount(filterStockRows(rows, 'all')),
    'not-photographed': stockRowsCount(filterStockRows(rows, 'not-photographed')),
    unused: stockRowsCount(filterStockRows(rows, 'unused')),
    'not-photographed-unused': stockRowsCount(filterStockRows(rows, 'not-photographed-unused'))
  };
  const labels = {
    all: 'الكل',
    'not-photographed': 'لم يتم التصوير',
    unused: 'غير مستخدمة في أي نوع محتوى',
    'not-photographed-unused': 'مش متصورة وغير مستخدمة'
  };
  if(select){
    [...select.options].forEach(option => { option.textContent = `${labels[option.value] || option.textContent.split('(')[0].trim()} (${counts[option.value] || 0})`; });
  }
  renderStockFilterCards(counts, labels);
}
function renderStockFilterCards(counts, labels){
  const wrap = document.getElementById('stockFilterCards');
  if(!wrap) return;
  const order = ['not-photographed','unused','not-photographed-unused'];
  wrap.innerHTML = order.map(key => `
    <button class="stock-filter-card ${stockFilterMode === key ? 'active' : ''}" type="button" data-stock-filter-card="${escapeHtml(key)}">
      <span>${escapeHtml(labels[key])}</span>
      <b>${escapeHtml(counts[key] ?? 0)}</b>
    </button>`).join('');
}
function renderStock(){
  const tbody = document.getElementById('stockSummaryRows');
  const setText = (id, value) => { const el = document.getElementById(id); if(el) el.textContent = value; };
  const visibleCars = cars.filter(car => !isExcludedStockStatus(stockStatusOf(car)));
  const filterSelect = document.getElementById('stockFilterMode');
  stockFilterMode = filterSelect?.value || stockFilterMode || 'all';
  const allRows = stockRowsWithMeta();
  updateStockDynamicFilterOptions(allRows);
  const rows = filterStockRowsAdvanced(filterStockRows(allRows, stockFilterMode));
  updateStockFilterLabels(filterSelect, allRows);
  const stockAllCount = stockRowsCount(allRows);
  const stockNotShotCount = stockRowsCount(filterStockRows(allRows, 'not-photographed'));
  const stockUnusedCount = stockRowsCount(filterStockRows(allRows, 'unused'));
  setText('dashboardCarsCount', visibleCars.length || '—');
  setText('stockAvailableAfterExclude', stockAllCount || '—');
  setText('stockNotPhotographedCount', stockNotShotCount || 0);
  setText('stockUnusedContentCount', stockUnusedCount || 0);
  setText('stockAvailableForSale', stockRowsCount(rows) || '—');
  document.querySelectorAll('.stock-summary-filter-card[data-stock-filter-card]').forEach(card => {
    card.classList.toggle('active', (card.dataset.stockFilterCard || 'all') === stockFilterMode);
  });
  setText('stockReserved', '—');
  setText('stockUnderDelivery', '—');
  if(!tbody) return;
  if(!visibleCars.length){ tbody.innerHTML = '<tr class="empty-row"><td colspan="8">لا توجد بيانات استوك متاحة.</td></tr>'; return; }
  if(!rows.length){ tbody.innerHTML = '<tr class="empty-row"><td colspan="8">لا توجد سيارات مطابقة للفلتر الحالي.</td></tr>'; return; }
  tbody.innerHTML = rows.map((group, index) => {
    const photographedValue = group.isPhotographed ? 'yes' : (group.meta.photographedValue || 'no');
    const usageText = group.isUsed ? `مستخدمة في ${group.usage.length} تاسك` : 'غير مستخدمة';
    return `<tr data-stock-group="${escapeHtml(group.key)}">
      <td>${index + 1}</td>
      <td class="stock-key"><strong>${escapeHtml([group.carName, group.statement].filter(Boolean).join(' - '))}</strong></td>
      <td>${escapeHtml(group.exteriorColor || '—')}</td>
      <td>${escapeHtml(group.interiorColor || '—')}</td>
      <td><span class="stock-count">${group.count}</span></td>
      <td><select class="stock-shot-select ${stockShotSavingKeys.has(stockGroupDocId(group.key)) ? 'is-saving' : ''}" data-stock-shot="${escapeHtml(group.key)}" onchange="window.mzjHandleStockShotChange && window.mzjHandleStockShotChange(this)"><option value="no"${photographedValue !== 'yes' ? ' selected' : ''}>لا</option><option value="yes"${photographedValue === 'yes' ? ' selected' : ''}>نعم</option></select></td>
      <td><span class="stock-use-badge ${group.isUsed ? 'is-used' : 'is-unused'}">${escapeHtml(usageText)}</span></td>
      <td><button class="mini-btn" type="button" data-stock-usage="${escapeHtml(group.key)}">استخدام السيارة</button></td>
    </tr>`;
  }).join('');
}
function showStockUsageModal(groupKey){
  const group = stockRowsWithMeta().find(item => item.key === groupKey);
  if(!group) return showToast('لم يتم العثور على السيارة.');
  const hits = group.usage || [];
  let modal = document.getElementById('stockUsageModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'stockUsageModal';
    modal.className = 'task-modal stock-usage-modal';
    document.body.appendChild(modal);
  }
  const title = [group.carName, group.statement, group.exteriorColor, group.interiorColor].filter(Boolean).join(' - ');
  const rows = hits.length ? hits.map((hit, index) => {
    const campaign = hit.campaign || {};
    const task = hit.task || {};
    return `<tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(campaign.campaignName || campaign.name || '—')}</td>
      <td>${escapeHtml(campaign.campaignCode || campaign.campaign_code || '—')}</td>
      <td>${escapeHtml(task.contentSectionName || '—')}</td>
      <td>${escapeHtml(task.taskType || '—')}</td>
      <td>${escapeHtml(task.userName || task.assignedToName || task.assigneeName || '—')}</td>
      <td>${escapeHtml(task.selectedCar || hit.label || '—')}</td>
    </tr>`;
  }).join('') : `<tr><td colspan="7">السيارة غير مستخدمة في أي تاسك.</td></tr>`;
  modal.innerHTML = `<div class="task-modal-backdrop" data-close-stock-usage></div><div class="task-modal-dialog stock-usage-dialog"><button class="task-modal-close" type="button" data-close-stock-usage>×</button><div class="task-modal-head"><div><span>استخدام السيارة</span><h2>${escapeHtml(title)}</h2><p>${hits.length ? `مستخدمة في ${hits.length} تاسك` : 'غير مستخدمة'}</p></div></div><div class="stock-usage-table-wrap"><table class="stock-usage-table"><thead><tr><th>م</th><th>الحملة</th><th>كود الحملة</th><th>نوع المحتوى</th><th>نوع التاسك</th><th>اليوزر</th><th>السيارة</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  modal.classList.add('show');
}
function clearEmptyRow(container){ container?.querySelector('.empty-row, .empty-state')?.remove(); }
function restoreEmptyRow(container, colSpan, text){
  if(!container || container.children.length !== 0) return;
  if(container.tagName === 'TBODY'){ const row = document.createElement('tr'); row.className = 'empty-row'; row.innerHTML = `<td colspan="${colSpan}">${text}</td>`; container.appendChild(row); }
  else { const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = text; container.appendChild(empty); }
}
function makeSelect(label, className = ''){ return `<select class="${className}" aria-label="${label}"><option value="">اختر</option></select>`; }
function showToast(text){ let toast = document.querySelector('.save-toast'); if(!toast){ toast = document.createElement('div'); toast.className = 'save-toast'; document.body.appendChild(toast); } toast.textContent = text; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 1800); }
function formatUploadBytes(bytes){
  const n = Number(bytes) || 0;
  if(n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if(n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if(n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${Math.round(n)} B`;
}
function formatUploadTime(seconds){
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if(!s || !Number.isFinite(s)) return 'غير محدد';
  if(s < 60) return `${s} ثانية`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} دقيقة و ${r} ثانية` : `${m} دقيقة`;
}
let activeUploadProgressState = null;
window.__mzjUploadDetailsOpen = false;
function showUploadProgressToast(percent, label = 'جاري رفع الملف', details = null){
  let toast = document.querySelector('.save-toast');
  if(!toast){ toast = document.createElement('div'); toast.className = 'save-toast'; document.body.appendChild(toast); }
  const value = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  const meta = details || activeUploadProgressState || {};
  const uploaded = Number(meta.bytesTransferred || 0);
  const total = Number(meta.totalBytes || 0);
  const speed = Number(meta.speedBps || 0);
  const remaining = speed > 0 && total > uploaded ? (total - uploaded) / speed : 0;
  const expanded = !!window.__mzjUploadDetailsOpen;
  const stats = total ? `${formatUploadBytes(uploaded)} / ${formatUploadBytes(total)}` : '';
  toast.innerHTML = `<div class="upload-toast-box" style="min-width:230px;pointer-events:auto">
    <div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
      <strong>${escapeHtml(label)}... ${value}%</strong>
      ${meta.cancelable ? '<button type="button" data-cancel-active-upload style="border:0;border-radius:9px;background:#fff;color:#6b3b32;padding:5px 8px;font-weight:800;cursor:pointer">إلغاء</button>' : ''}
    </div>
    <div style="height:7px;background:rgba(255,255,255,.25);border-radius:999px;margin-top:8px;overflow:hidden"><span style="display:block;height:100%;width:${value}%;background:#fff;border-radius:999px"></span></div>
    ${stats ? `<button type="button" data-toggle-upload-details style="margin-top:7px;border:0;background:transparent;color:#fff;text-decoration:underline;cursor:pointer;font-weight:800">${expanded ? 'إخفاء التفاصيل' : 'عرض سرعة الرفع'}</button>` : ''}
    ${expanded && stats ? `<div style="margin-top:6px;font-size:12px;line-height:1.8;text-align:right;color:#fff">
      <div>الملف: ${escapeHtml(meta.fileName || '')}</div>
      <div>المرفوع: ${escapeHtml(stats)}</div>
      <div>السرعة: ${speed ? `${formatUploadBytes(speed)}/ث` : 'جاري الحساب'}</div>
      <div>المتبقي: ${escapeHtml(formatUploadTime(remaining))}</div>
    </div>` : ''}
  </div>`;
  toast.classList.add('show');
}
function hideUploadProgressToast(delay = 900){
  activeUploadProgressState = null;
  window.setTimeout(() => { const toast = document.querySelector('.save-toast'); if(toast) toast.classList.remove('show'); }, delay);
}
document.addEventListener('click', event => {
  const cancelBtn = event.target.closest('[data-cancel-active-upload]');
  if(cancelBtn){
    event.preventDefault();
    event.stopPropagation();
    try{ activeUploadProgressState?.taskUpload?.cancel?.(); showUploadProgressToast(activeUploadProgressState?.percent || 0, 'جاري إلغاء الرفع', activeUploadProgressState); }catch(_){ /* ignore */ }
    return;
  }
  const toggleBtn = event.target.closest('[data-toggle-upload-details]');
  if(toggleBtn){
    event.preventDefault();
    event.stopPropagation();
    window.__mzjUploadDetailsOpen = !window.__mzjUploadDetailsOpen;
    if(activeUploadProgressState) showUploadProgressToast(activeUploadProgressState.percent || 0, activeUploadProgressState.label || 'جاري رفع الملف', activeUploadProgressState);
  }
});

function applyAppearanceMode(){
  localStorage.removeItem('mzj_appearance_mode');
  document.body.classList.remove('dark-mode');
}
function toggleAppearanceMode(){
  applyAppearanceMode();
}
function taskDueText(task){
  const campaign = campaignForTask(task);
  return formatDateShort(taskRequiredDate(task, campaign));
}
const NOTIFICATION_DISMISS_KEY = 'mzj_dismissed_notifications';
let notificationSnapshotReady = false;
let lastNotificationKeys = [];
let notificationAudioUnlocked = false;
let notificationAudioCtx = null;
let liveNotificationTimer = null;
function unlockNotificationAudio(){
  notificationAudioUnlocked = true;
  try{
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if(AudioContextClass && !notificationAudioCtx) notificationAudioCtx = new AudioContextClass();
    notificationAudioCtx?.resume?.();
  }catch(_){ /* browser may block until next user action */ }
}
function playNotificationSound(){
  if(!notificationAudioUnlocked) return;
  try{
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if(!AudioContextClass) return;
    const ctx = notificationAudioCtx || new AudioContextClass();
    notificationAudioCtx = ctx;
    ctx.resume?.();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.75, ctx.currentTime + 0.018);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.62);
    master.connect(ctx.destination);
    const tones = [980, 1240, 1560];
    tones.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = index === 0 ? 'square' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + (index * 0.11));
      osc.connect(master);
      osc.start(ctx.currentTime + (index * 0.11));
      osc.stop(ctx.currentTime + 0.24 + (index * 0.11));
    });
  }catch(error){ console.warn('Notification sound blocked', error); }
}
function showLiveNotification(item){
  if(!item) return;
  let box = document.getElementById('liveNotificationPopup');
  if(!box){
    box = document.createElement('div');
    box.id = 'liveNotificationPopup';
    box.className = 'live-notification-popup';
    document.body.appendChild(box);
  }
  const openAttrs = item.taskId ? ` data-open-task="${escapeHtml(item.taskId)}" data-task-campaign="${escapeHtml(item.campaignId || '')}"` : '';
  box.innerHTML = `<button type="button" class="live-notification-card ${escapeHtml(item.tone || '')}"${openAttrs}><span class="live-notification-icon">${escapeHtml(item.icon || '🔔')}</span><div><b>${escapeHtml(item.title || 'إشعار جديد')}</b><small>${escapeHtml(item.text || '')}</small></div></button>`;
  box.classList.add('show');
  window.clearTimeout(liveNotificationTimer);
  liveNotificationTimer = window.setTimeout(() => box.classList.remove('show'), 7000);
}
function getDismissedNotificationKeys(){
  try{ return JSON.parse(localStorage.getItem(NOTIFICATION_DISMISS_KEY) || '[]').map(String); }
  catch(_){ return []; }
}
function setDismissedNotificationKeys(keys){
  localStorage.setItem(NOTIFICATION_DISMISS_KEY, JSON.stringify(uniqueList((keys || []).map(String).filter(Boolean))));
}
function dismissNotificationKey(key){
  if(!key) return;
  setDismissedNotificationKeys([...getDismissedNotificationKeys(), key]);
}
function notificationTaskPayload(task, tone){
  return {
    key: `task:${task.id || ''}:${tone}`,
    taskId: task.id || '',
    campaignId: task.campaignId || ''
  };
}
function taskNotificationItems(){
  const isAdmin = isCurrentUserAdmin();
  const tasks = isAdmin ? campaigns.flatMap(campaign => tasksForCampaign(campaign)) : getVisibleTasksForCurrentUser();
  const dismissed = new Set(getDismissedNotificationKeys());
  const items = [];
  tasks.forEach(task => {
    const late = taskDelayDays(task);
    const progress = taskProgress(task);
    const title = shortTaskName(task).replace(/<[^>]+>/g,'');
    if(late > 0){ items.push({...notificationTaskPayload(task, 'late'), tone:'late', icon:'⏰', title:`تأخير ${late} يوم`, text:`${title} · ${taskOwnerName(task).replace(/<[^>]+>/g,'')}`}); }
    else if(!(task.received || task.receivedConfirmed)){ items.push({...notificationTaskPayload(task, 'new'), tone:'new', icon:'📌', title:'تاسك لم يتم استلامه', text:`${title} · ${taskDueText(task)}`}); }
    else if(progress > 0 && progress < 100){ items.push({...notificationTaskPayload(task, 'active'), tone:'active', icon:'⚡', title:`قيد التنفيذ ${progress}%`, text:`${title} · ${taskOwnerName(task).replace(/<[^>]+>/g,'')}`}); }
  });
  if(isAdmin){
    campaigns.slice(-4).reverse().forEach(campaign => {
      const campaignId = campaign.id || campaign.docId || campaign.campaignCode || campaign.campaign_code || campaignNameText(campaign) || 'campaign';
      items.push({key:`campaign:${campaignId}:updated`, campaignId: campaign.id || campaign.docId || '', tone:'campaign', icon:'📣', title:'حملة محدثة', text: campaignNameText(campaign) || campaignCodeText(campaign) || 'حملة'});
    });
  }
  return items.filter(item => !dismissed.has(item.key)).slice(0, 12);
}
function notificationItemHtml(item){
  const openAttrs = item.taskId ? ` role="button" tabindex="0" data-open-task="${escapeHtml(item.taskId)}" data-task-campaign="${escapeHtml(item.campaignId || '')}" title="فتح التاسك"` : '';
  return `<article class="notification-item ${item.tone}" data-notification-key="${escapeHtml(item.key || '')}"${openAttrs}><span>${item.icon}</span><div><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.text)}</small></div><button class="notification-dismiss" type="button" data-dismiss-notification="${escapeHtml(item.key || '')}" title="مسح الإشعار">×</button></article>`;
}
function renderTopbarNotifications(playSoundForNew = false){
  const btn = document.getElementById('notificationToggle');
  const panel = document.getElementById('notificationPanel');
  const count = document.getElementById('notificationCount');
  if(!btn || !panel || !count) return;
  const items = taskNotificationItems();
  const keys = items.map(item => item.key).filter(Boolean);
  const previous = new Set(lastNotificationKeys);
  const hasNew = keys.some(key => !previous.has(key));
  count.textContent = String(items.length);
  count.classList.toggle('is-hidden', !items.length);
  panel.innerHTML = `<div class="notification-head"><strong>الإشعارات</strong><div class="notification-head-actions"><small>${items.length} تنبيه</small>${items.length ? '<button type="button" class="notification-clear" data-clear-notifications>مسح الكل</button>' : ''}</div></div>` + (items.length ? items.map(notificationItemHtml).join('') : '<div class="empty-state mini-empty">لا توجد إشعارات حالياً.</div>');
  if(notificationSnapshotReady && playSoundForNew && hasNew){
    const freshItem = items.find(item => item.key && !previous.has(item.key));
    playNotificationSound();
    showLiveNotification(freshItem || items[0]);
    btn.classList.add('is-ringing');
    window.setTimeout(() => btn.classList.remove('is-ringing'), 1400);
  }
  lastNotificationKeys = keys;
  notificationSnapshotReady = true;
}
function proDepartmentName(task){
  const label = taskDepartmentLabel(task);
  return label && label !== 'قسم' && label !== 'غير محدد' ? label : 'بدون قسم';
}
function proMetricCard(icon, label, value, hint, tone=''){
  return `<article class="pro-metric ${tone}"><span class="pro-metric-icon">${icon}</span><div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong>${hint ? `<em>${escapeHtml(hint)}</em>` : ''}</div></article>`;
}
function renderProDashboardHero(allTasks){
  const late = allTasks.filter(task => taskDelayDays(task) > 0).length;
  const waiting = allTasks.filter(task => taskWorkflowStatus(task) === 'waiting').length;
  const active = allTasks.filter(task => taskWorkflowStatus(task) === 'active').length;
  return `<section class="pro-dashboard-strip dashboard-pro-hero">${proMetricCard('📣','الحملات',campaigns.length,`${campaigns.filter(c => normalizeStatus(c.status || '').includes('archived') === false).length} نشطة`)}${proMetricCard('✅','التاسكات',allTasks.length,`${averageProgress(allTasks)}% إنجاز`)}${proMetricCard('⏰','المتأخر',late,'حسب موعد التسليم','danger')}${proMetricCard('⚡','قيد التنفيذ',active,`${waiting} في الانتظار`,'active')}</section>`;
}

function taskBlockHtml(index){
  return `<div class="creative-task-block" data-task-index="${index}">
    <label><span>اختار المحتوى</span><select class="js-task-section-select">${contentSectionOptions()}</select></label>
    <label><span>نوع التاسك</span><select class="js-task-type"><option value="">اختر نوع التاسك</option></select></label>
    <label class="pro-date-field"><span>التاريخ المطلوب</span><input class="js-task-required-date pro-date-input" type="date" aria-label="التاريخ المطلوب" /></label>
    <label class="task-users-field"><span>اليوزر</span><div class="js-task-user task-user-checkbox-grid">${multiTaskUserOptions('', [])}</div></label>
  </div>`;
}

function updateProductOutput(row){
  const creativesList = selectedCreativeNames(row);
  const userNames = [...(row?.querySelectorAll('.js-task-user') || [])].flatMap(control => selectedOptionTexts(control));
  const output = row?.querySelector('.js-product-output');
  if(output){
    const usersText = uniqueList(userNames).join(' - ');
    output.value = creativesList.length ? creativesList.map(cr => usersText ? `${cr} - ${usersText}` : cr).join(' | ') : '';
  }
}
function updateAllProductOutputs(){ document.querySelectorAll('#creativeRows .creative-row-card').forEach(updateProductOutput); }
function generateCampaignCode(){
  const output = document.getElementById('campaignCodeInput');
  if(!output) return;
  const typeSelect = document.getElementById('campaignTypeSelect') || document.querySelector('.js-campaign-type-select');
  const legacyCodeSelect = document.getElementById('campaignCodeSelect');
  const item = campaignTypes.find(type => type.id === typeSelect?.value || type.name === typeSelect?.value) || campaignCodes.find(code => code.id === legacyCodeSelect?.value);
  if(!item || !item.code){ output.value = ''; return; }
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
function isCampaignContentWritingTask(task){
  const sectionText = identityClean([
    task.contentSectionName, task.assignedDepartmentName, task.departmentName, task.departmentRole, task.contentType
  ].filter(Boolean).join(' '));
  const typeText = identityClean([task.taskType, task.structureTaskLabel, task.creative, task.product].filter(Boolean).join(' '));
  const isContentSection = normalizeDepartmentRole(sectionText) === 'content' || sectionText.includes('محتوي') || sectionText.includes('content');
  const isCampaignWriting = typeText.includes('كتابه محتوي حمله') || (typeText.includes('كتابه') && typeText.includes('محتوي') && typeText.includes('حمله')) || (typeText.includes('campaign') && typeText.includes('content'));
  return isContentSection && isCampaignWriting;
}
function adminDashboardTasksForCampaign(campaign){
  // تاسك كتابة محتوى الحملة يظهر للأدمن عادي لحد الاعتماد والتوزيع.
  // بعد توزيع تاسكات الهيكل، نخفي تاسك الهيكل الرئيسي ونظهر التوزيعات الجديدة فقط.
  return tasksForCampaign(campaign).filter(task => !(isCampaignContentWritingTask(task) && taskStructure(task).status === 'distributed'));
}
function campaignRequiredProgressFromTasks(related){
  const roles = ['content','shooting','design','montage'];
  if(!related.length) return 0;
  return Math.round(roles.reduce((total, role) => {
    const tasks = related.filter(task => task.departmentRole === role);
    if(!tasks.length) return total;
    const avg = tasks.reduce((sum, task) => sum + taskProgress(task), 0) / tasks.length;
    return total + (avg * 0.25);
  }, 0));
}
function fallbackTasksFromCampaign(campaign){
  const fallback = [];
  (campaign.creatives || []).forEach((creativeRow, creativeIndex) => {
    const rowCars = Array.isArray(creativeRow.selectedCars) ? creativeRow.selectedCars.filter(car => car && (car.id || car.label || car.name)) : [];
    (creativeRow.tasks || []).forEach((task, taskIndex) => {
      const ids = Array.isArray(task.userIds) ? task.userIds : [];
      const names = Array.isArray(task.userNames) ? task.userNames : [];
      const emails = Array.isArray(task.userEmails) ? task.userEmails : [];
      const maxUsers = Math.max(ids.length, names.length, emails.length);
      const entries = Array.from({length: maxUsers}, (_, i) => ({ id: ids[i] || '', name: names[i] || '', email: emails[i] || '' }))
        .filter(item => normalizeText(item.id || item.name || item.email));
      const finalEntries = entries.length ? entries : [{ id: `${campaign.id || 'campaign'}-${creativeIndex}-${taskIndex}`, name: 'غير محدد', email: '' }];
      finalEntries.forEach((entry, assigneeIndex) => {
        const user = findUserByAnyIdentity([entry.id, entry.name, entry.email]) || {};
        const dep = departmentForUser(user.id || user.uid || entry.id || entry.name);
        const sectionName = canonicalContentLabel(task.contentSectionName || dep.name || user.department || '');
        const role = normalizeDepartmentRole(sectionName);
        const qty = Math.max(1, Math.min(50, Number(task.quantity || 1)));
        const units = rowCars.length ? rowCars.map((car, i) => ({ copyIndex: i + 1, car })) : Array.from({length: qty}, (_, i) => ({ copyIndex: i + 1, car: null }));
        units.forEach(unit => {
          const selectedCarLabel = unit.car ? normalizeText(unit.car.label || unit.car.name || unit.car.id) : '';
          const resolvedUserId = user.id || user.uid || entry.id || entry.name || '';
          const resolvedUserName = userName(user) || entry.name || entry.id || 'غير محدد';
          const searchKeys = uniqueList([entry.id, entry.name, entry.email, resolvedUserId, user.id, user.uid, user.email, user.emailLower, resolvedUserName, user.name, user.displayName, user.username].filter(Boolean));
          fallback.push({
            id: `fallback-${campaign.id || 'campaign'}-${creativeIndex}-${taskIndex}-${assigneeIndex}-${unit.copyIndex}`,
            campaignId: campaign.id,
            campaignName: campaign.campaignName || campaign.name || campaign.campaign_name || '',
            campaignCode: campaign.campaignCode || campaign.campaign_code || '',
            creative: creativeRow.creative || '',
            product: creativeRow.product || creativeRow.creative || '',
            selectedCars: unit.car ? [unit.car] : [],
            selectedCar: selectedCarLabel,
            contentSectionId: task.contentSectionId || '',
            contentSectionName: sectionName || task.contentSectionName || '',
            taskType: task.taskType || '',
            taskQuantity: units.length,
            taskCopyIndex: unit.copyIndex,
            userId: resolvedUserId,
            userUid: user.uid || resolvedUserId,
            userName: resolvedUserName,
            userEmail: user.email || entry.email || '',
            assigneeUid: user.uid || resolvedUserId,
            assigneeName: resolvedUserName,
            assigneeEmail: user.email || entry.email || '',
            assignedToId: resolvedUserId,
            assignedToUid: user.uid || resolvedUserId,
            assignedToName: resolvedUserName,
            assignedToEmail: user.email || entry.email || '',
            displayName: user.displayName || resolvedUserName,
            username: user.username || '',
            assignedToSearch: searchKeys,
            searchKeys,
            assignedDepartmentId: task.contentSectionId || dep.id || '',
            assignedDepartmentName: sectionName || dep.name || user.department || task.contentSectionName || '',
            departmentRole: role,
            received: false,
            progress: 0,
            steps: taskStepTemplate(role),
            status: 'pending',
            creativeIndex,
            assigneeIndex,
            taskIndex: `${taskIndex}-${assigneeIndex + 1}-${unit.copyIndex}`,
            source: 'campaign-creatives-fallback'
          });
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
  // المصدر المعتمد للتاسكات هو marketing_campaigns > departmentTasks فقط.
  // لا نقرأ من campaign_tasks ولا workspace_tasks في الداشبورد.
  const fromDepartmentTasks = Array.isArray(campaign.departmentTasks)
    ? campaign.departmentTasks.map(task => normalizeCampaignTask(task, campaign))
    : [];
  return mergeCampaignTasks(fromDepartmentTasks);
}
function groupTasksForKanban(tasks){
  const order = ['content','shooting','design','montage','publish','other'];
  const labels = { content:'المحتوى', shooting:'التصوير', design:'التصميم', montage:'المونتاج', publish:'النشر', other:'أخرى' };
  return order.map(role => ({ role, label: labels[role], tasks: tasks.filter(task => (task.departmentRole || 'other') === role) })).filter(group => group.tasks.length);
}
function campaignRequiredProgress(campaign){
  return campaignRequiredProgressFromTasks(tasksForCampaign(campaign));
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
function baseCurrentUserIdentityValues(){
  const sessionUser = getCurrentUser() || {};
  const authUser = mainAuth?.currentUser || null;
  return [
    sessionUser.id, sessionUser.uid, sessionUser.email, sessionUser.emailLower,
    sessionUser.name, sessionUser.displayName, sessionUser.username,
    authUser?.uid, authUser?.email, authUser?.displayName,
    localStorage.getItem('mzj_login_email') || ''
  ];
}
function currentUserRelatedRecords(){
  const baseKeys = uniqueIdentityKeys(baseCurrentUserIdentityValues());
  if(!baseKeys.length || !Array.isArray(users) || !users.length) return [];
  return users.filter(user => {
    const userKeys = uniqueIdentityKeys([user.id, user.uid, user.email, user.emailLower, user.name, user.displayName, user.username]);
    return identityIntersects(baseKeys, userKeys);
  });
}
function findCurrentUserRecord(){
  const sessionUser = getCurrentUser();
  const related = currentUserRelatedRecords();
  return related[0] || findUserByAnyIdentity(baseCurrentUserIdentityValues()) || sessionUser;
}
function currentUserIdentityKeys(){
  const sessionUser = getCurrentUser();
  const authUser = mainAuth?.currentUser || null;
  const related = currentUserRelatedRecords();
  return uniqueIdentityKeys([
    sessionUser.id, sessionUser.uid, sessionUser.email, sessionUser.emailLower,
    sessionUser.name, sessionUser.displayName, sessionUser.username,
    authUser?.uid, authUser?.email, authUser?.displayName,
    localStorage.getItem('mzj_login_email') || '',
    ...related.flatMap(user => [user.id, user.uid, user.email, user.emailLower, user.name, user.displayName, user.username])
  ]).filter(key => key && key.length > 1);
}
function taskIdentityKeys(task){
  return uniqueIdentityKeys([
    task.userId, task.userUid, task.userEmail, task.userName,
    task.assigneeId, task.assigneeUid, task.assigneeEmail, task.assigneeName,
    task.assignedToId, task.assignedToUid, task.assignedToEmail, task.assignedToName,
    task.assignedToSearch, task.searchKeys,
    task.userIds, task.userNames, task.userEmails,
    task.assigneeIds, task.assigneeNames, task.assigneeEmails,
    task.assignedToIds, task.assignedToNames, task.assignedToEmails,
    task.users, task.assignees, task.assignedUsers
  ]).filter(key => key && key.length > 1);
}
function identityIntersects(a, b){
  return a.some(x => b.includes(x));
}
function currentUserMatchesTaskExact(task){
  // أمان الداش بورد: التاسك يظهر لليوزر فقط لو بيانات الإسناد فيها تطابق صريح.
  // ممنوع التطابق الجزئي بالاسم، وممنوع البحث داخل JSON كامل عشان ما يظهرش تاسك يوزر تاني.
  const userKeys = currentUserIdentityKeys();
  const taskKeys = taskIdentityKeys(task);
  return !!userKeys.length && !!taskKeys.length && identityIntersects(userKeys, taskKeys);
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
  // الداش بورد الخاص باليوزر يعرض التاسكات المسندة له صراحة فقط.
  // ممنوع عرض تاسكات لمجرد إن اليوزر في نفس القسم أو هو منشئ الحملة.
  return currentUserMatchesTaskExact(task);
}

function canonicalContentLabel(value){
  const raw = normalizeText(value || '').replace(/^قسم\s+/, '').trim();
  const key = identityClean(raw);
  if(!raw) return 'أنواع المحتوى';
  if(key.includes('التصوير') && key.includes('ايديت')) return 'التصوير + الايديت';
  if(key === 'تصوير' || key === 'التصوير' || key.includes('قسم التصوير')) return 'التصوير';
  if(key.includes('تصميم')) return 'التصميم';
  if(key.includes('مونتاج')) return 'المونتاج';
  if(key.includes('نشر')) return 'النشر';
  if(key.includes('محتو')) return 'المحتوي';
  if(key.includes('اعلان')) return 'اداره الاعلانات';
  if(key.includes('مدير') && key.includes('تسويق')) return 'مدير التسويق';
  return raw;
}
function currentUserMatchesSelectedAssignee(id, name, email=''){
  const currentKeys = currentUserIdentityKeys();
  const values = uniqueIdentityKeys([id, name, email]).filter(key => key && key.length > 1);
  return !!currentKeys.length && !!values.length && identityIntersects(currentKeys, values);
}
function tasksFromCreativeRowsForCurrentUser(){
  if(isCurrentUserAdmin()) return [];
  const generated = [];
  campaigns.forEach(campaign => {
    (campaign.creatives || []).forEach((creativeRow, creativeIndex) => {
      const rowCars = Array.isArray(creativeRow.selectedCars) ? creativeRow.selectedCars.filter(car => car && (car.id || car.label || car.name)) : [];
      (creativeRow.tasks || []).forEach((task, taskIndex) => {
        const ids = Array.isArray(task.userIds) ? task.userIds : [];
        const names = Array.isArray(task.userNames) ? task.userNames : [];
        const emails = Array.isArray(task.userEmails) ? task.userEmails : [];
        const maxUsers = Math.max(ids.length, names.length, emails.length);
        const assignees = Array.from({length: maxUsers}, (_, i) => ({ id: ids[i] || '', name: names[i] || '', email: emails[i] || '' }))
          .filter(item => normalizeText(item.id || item.name || item.email));
        assignees.forEach((assignee, assigneeIndex) => {
          const user = findUserByAnyIdentity([assignee.id, assignee.name, assignee.email]) || {};
          const selectedMatchesCurrent = currentUserMatchesSelectedAssignee(assignee.id, assignee.name, assignee.email) || currentUserMatchesSelectedAssignee(user.id || user.uid || assignee.id, userName(user) || assignee.name, user.email || assignee.email);
          if(!selectedMatchesCurrent) return;
          const resolvedUserId = user.id || user.uid || assignee.id || assignee.name;
          const resolvedUserName = userName(user) || assignee.name || assignee.id || 'غير محدد';
          const sectionName = canonicalContentLabel(task.contentSectionName || task.contentSection || task.contentType || '');
          const role = normalizeDepartmentRole(sectionName);
          const qty = Math.max(1, Math.min(50, Number(task.quantity || 1)));
          const units = rowCars.length ? rowCars.map((car, i) => ({ copyIndex: i + 1, car })) : Array.from({length: qty}, (_, i) => ({ copyIndex: i + 1, car: null }));
          units.forEach(unit => {
            const selectedCarLabel = unit.car ? normalizeText(unit.car.label || unit.car.name || unit.car.id) : '';
            generated.push(normalizeCampaignTask({
              id: `direct-${campaign.id || campaign.docId || 'campaign'}-${creativeIndex}-${taskIndex}-${assigneeIndex}-${unit.copyIndex}`,
              campaignId: campaign.id || campaign.docId,
              campaignName: campaign.campaignName || campaign.name || campaign.campaign_name || '',
              campaignCode: campaign.campaignCode || campaign.campaign_code || '',
              creative: creativeRow.creative || '',
              product: creativeRow.product || creativeRow.creative || '',
              selectedCars: unit.car ? [unit.car] : [],
              selectedCar: selectedCarLabel,
              contentSectionId: task.contentSectionId || '',
              contentSectionName: sectionName,
              taskType: task.taskType || '',
              taskQuantity: units.length,
              taskCopyIndex: unit.copyIndex,
              userId: resolvedUserId,
              userUid: user.uid || resolvedUserId,
              userName: resolvedUserName,
              userEmail: user.email || assignee.email || '',
              assigneeUid: user.uid || resolvedUserId,
              assigneeName: resolvedUserName,
              assigneeEmail: user.email || assignee.email || '',
              assignedToUid: user.uid || resolvedUserId,
              assignedToId: resolvedUserId,
              assignedToName: resolvedUserName,
              assignedToEmail: user.email || assignee.email || '',
              assignedToSearch: uniqueList([resolvedUserId, user.id, user.uid, user.email, assignee.email, resolvedUserName, assignee.name].filter(Boolean)),
              searchKeys: uniqueList([resolvedUserId, user.id, user.uid, user.email, assignee.email, resolvedUserName, assignee.name].filter(Boolean)),
              assignedDepartmentId: task.contentSectionId || '',
              assignedDepartmentName: sectionName,
              departmentRole: role,
              received: false,
              progress: 0,
              steps: taskStepTemplate(role),
              status: 'pending',
              creativeIndex,
              assigneeIndex,
              taskIndex: `${taskIndex}-${assigneeIndex + 1}-${unit.copyIndex}`,
              source: 'direct-creatives-user'
            }, campaign));
          });
        });
      });
    });
  });
  return generated;
}
function getVisibleTasksForCurrentUser(){
  // المصدر الوحيد لداشبورد اليوزر: marketing_campaigns > departmentTasks.
  // اليوزر العادي يشوف التاسكات المسندة له صراحة فقط، بدون fallback بالقسم أو منشئ الحملة.
  const allTasks = campaigns.flatMap(campaign => {
    const campaignTasks = Array.isArray(campaign.departmentTasks) ? campaign.departmentTasks : [];
    return campaignTasks.map(task => normalizeCampaignTask(task, campaign));
  });
  if(isCurrentUserAdmin()) return allTasks;
  return mergeCampaignTasks(allTasks.filter(currentUserMatchesTaskExact));
}
function findTaskById(taskId, campaignId = ''){
  const campaignList = campaignId ? campaigns.filter(item => item.id === campaignId) : campaigns;
  for(const campaign of campaignList){
    const foundSaved = tasksForCampaign(campaign).find(task => task.id === taskId);
    if(foundSaved) return foundSaved;
  }
  return null;
}
function campaignForTask(task){
  return campaigns.find(item => item.id === task?.campaignId || item.docId === task?.campaignId) || {};
}
function stepButtonClass(step){ return step.done ? 'step-btn done' : 'step-btn'; }
function stepButtonTitle(step){ return step.adminOnly ? 'اعتماد الأدمن فقط' : 'تنفيذ المرحلة'; }

function taskContentType(task){
  return canonicalContentLabel(task.contentSectionName || task.assignedDepartmentName || task.contentType || '');
}
function taskDepartmentLabel(task){
  const role = task.departmentRole || normalizeDepartmentRole(task.assignedDepartmentName || task.departmentName || task.contentSectionName || '');
  const labels = {content:'قسم المحتوى', shooting:'قسم التصوير', design:'قسم التصميم', montage:'قسم المونتاج', publish:'قسم النشر'};
  if(task.structureGenerated || task.source === 'campaign-structure-distribution') return 'قسم المحتوى';
  if(labels[role]) return labels[role];
  const owner = findUserByAnyIdentity([task.assignedToUid, task.assignedToId, task.userUid, task.userId, task.assignedToEmail, task.userEmail, task.assignedToName, task.userName].filter(Boolean)) || {};
  return normalizeText(task.departmentName || task.assignedDepartmentName || owner.departmentName || owner.department || task.contentSectionName || 'غير محدد');
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
  return file.fileUrl || file.url || file.downloadURL || file.downloadUrl || file.storageUrl || file.viewUrl || file.webViewLink || file.permalink || (id ? `https://workdrive.zoho.sa/file/${encodeURIComponent(id)}` : '');
}
function taskFiles(task){ return Array.isArray(task.attachments) ? task.attachments : []; }
function renderAttachmentTable(task, kind = 'all'){
  const allFiles = taskFiles(task);
  const isFinalFile = file => file?.isFinal || file?.uploadKind === 'final' || file?.kind === 'final' || file?.purpose === 'final';
  const mapped = allFiles.map((file, originalIndex) => ({ file, originalIndex })).filter(item => {
    if(kind === 'final') return isFinalFile(item.file);
    if(kind === 'review') return !isFinalFile(item.file);
    return true;
  });
  const title = kind === 'final' ? 'الملف النهائي' : (kind === 'review' ? 'ملفات المراجعة' : 'المرفقات الحالية');
  return `<div class="task-files-box"><div class="modal-section-title"><h3>${title}</h3><span>${mapped.length}</span></div>
    <div class="task-files-table-wrap"><table class="task-files-table"><thead><tr><th>م</th><th>الملف</th><th>تاريخ الرفع</th><th>إجراء</th></tr></thead><tbody>${mapped.length ? mapped.map((item, i) => {
      const file = item.file;
      const url = buildZohoFileUrl(file);
      const name = escapeHtml(file.name || file.fileName || file.title || `ملف ${i+1}`);
      return `<tr><td>${i+1}</td><td>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${name}</a>` : name}</td><td>${escapeHtml(String(file.uploadedAt || '').slice(0,16) || '—')}</td><td><button type="button" class="mini-btn danger" data-delete-task-file="${item.originalIndex}">حذف</button></td></tr>`;
    }).join('') : '<tr><td colspan="4">لا توجد مرفقات حالية.</td></tr>'}</tbody></table></div></div>`;
}
function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('تعذر قراءة الملف.'));
    reader.readAsDataURL(file);
  });
}
function dataUrlBase64(dataUrl){ return String(dataUrl || '').split(',')[1] || ''; }
function safeStorageSegment(value){
  return String(value || 'item').trim().replace(/[\\/#?%*:|"<>\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'item';
}
function uniqueStorageFileName(file){
  const name = String(file?.name || 'file').replace(/[\/#?%*:|"<>]+/g, '-');
  return name || 'file';
}
async function uploadTaskFileToFirebaseStorage(file, task, uploadKind = 'final'){
  if(!mainStorage) throw new Error('Firebase Storage غير متاح. تأكد من تحميل storage SDK وإعداد bucket.');
  // v32: final media upload is allowed by Storage Rules during the current integration stage.
  // Do not block upload just because Firebase Auth is not active yet.
  const current = getCurrentUserIdentity();
  const userId = safeStorageSegment(current.uid || current.id || current.email || 'user');
  const kind = uploadKind === 'final' ? 'final' : 'review';
  const fileName = uniqueStorageFileName(file);
  const path = kind === 'final' ? `final-media/${fileName}` : `review-media/${fileName}`;
  const ref = mainStorage.ref().child(path);
  const metadata = {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      uploadKind: kind,
      taskId: String(task.id || task.taskId || ''),
      campaignId: String(task.campaignId || ''),
      originalFileName: file.name || fileName,
      uploadedBy: current.email || current.name || userId
    }
  };
  const label = kind === 'final' ? 'جاري رفع الملف النهائي' : 'جاري رفع الملف';
  const snapshot = await new Promise((resolve, reject) => {
    const taskUpload = ref.put(file, metadata);
    const startedAt = Date.now();
    let lastBytes = 0;
    let lastTime = startedAt;
    activeUploadProgressState = {
      taskUpload,
      fileName: file.name || fileName,
      totalBytes: file.size || 0,
      bytesTransferred: 0,
      speedBps: 0,
      percent: 5,
      label,
      cancelable: true
    };
    showUploadProgressToast(5, label, activeUploadProgressState);
    taskUpload.on('state_changed', snap => {
      const now = Date.now();
      const deltaBytes = Math.max(0, snap.bytesTransferred - lastBytes);
      const deltaTime = Math.max(1, now - lastTime) / 1000;
      const instantSpeed = deltaBytes / deltaTime;
      const prevSpeed = Number(activeUploadProgressState?.speedBps || 0);
      const speedBps = prevSpeed ? (prevSpeed * 0.65 + instantSpeed * 0.35) : instantSpeed;
      lastBytes = snap.bytesTransferred;
      lastTime = now;
      const realPercent = snap.totalBytes ? (snap.bytesTransferred / snap.totalBytes) * 100 : 0;
      const percent = Math.max(5, realPercent);
      activeUploadProgressState = {
        ...activeUploadProgressState,
        taskUpload,
        bytesTransferred: snap.bytesTransferred,
        totalBytes: snap.totalBytes || file.size || 0,
        speedBps,
        percent,
        label,
        cancelable: true
      };
      showUploadProgressToast(percent, label, activeUploadProgressState);
    }, error => {
      activeUploadProgressState = null;
      if(error && (error.code === 'storage/canceled' || String(error.message || '').toLowerCase().includes('cancel'))){
        reject(new Error('تم إلغاء رفع الملف.'));
      } else {
        reject(error);
      }
    }, () => resolve(taskUpload.snapshot));
  });
  showUploadProgressToast(100, kind === 'final' ? 'تم رفع الملف النهائي' : 'تم رفع الملف');
  hideUploadProgressToast();
  const downloadURL = await snapshot.ref.getDownloadURL();
  return {
    storageProvider: 'firebase',
    storagePath: path,
    name: file.name,
    fileName: file.name,
    size: file.size || 0,
    mimeType: file.type || 'application/octet-stream',
    type: file.type || 'application/octet-stream',
    downloadURL,
    downloadUrl: downloadURL,
    fileUrl: downloadURL,
    uploadedAt: new Date().toISOString(),
    uploadedBy: current.email || current.name || userId,
    departmentRole: task.departmentRole || '',
    departmentName: task.assignedDepartmentName || taskDepartmentLabel(task),
    uploadKind: kind,
    kind,
    purpose: kind,
    isFinal: kind === 'final'
  };
}
async function uploadTaskFileToZohoReview(file, task){
  const current = getCurrentUser();
  const dataUrl = await fileToDataUrl(file);
  const payload = {
    action: 'uploadTaskReviewFile',
    fileName: file.name,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileType: file.type || 'application/octet-stream',
    size: file.size || 0,
    fileData: dataUrl,
    base64: dataUrlBase64(dataUrl),
    campaignId: task.campaignId || '',
    campaignCode: task.campaignCode || '',
    campaignName: task.campaignName || '',
    department: taskDepartmentLabel(task),
    departmentName: task.assignedDepartmentName || taskDepartmentLabel(task),
    taskType: task.taskType || '',
    taskId: task.id || '',
    uploadedBy: current.email || current.name || current.uid || '',
    uploadKind: 'review',
    kind: 'review',
    purpose: 'review',
    isFinal: false,
    keepOriginalFileName: true,
    flatUpload: true,
    createFolder: false
  };
  const res = await fetch(getDriveUploadEndpoint(), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  const text = await res.text();
  let result = {};
  try{ result = text ? JSON.parse(text) : {}; }
  catch(_){ throw new Error('تعذر رفع الملف: رد السيرفر ليس JSON. تأكد من إعداد Zoho API.'); }
  if(!res.ok || result.success === false || result.ok === false){
    const rawErr = result.error || result.message || result.title || result.raw || '';
    throw new Error(rawErr || 'فشل رفع ملف المراجعة على Zoho WorkDrive.');
  }
  const fileId = result.fileId || result.id || result.resource_id || result.data?.id || result.data?.fileId || '';
  return {
    storageProvider: 'zoho',
    fileId,
    name: result.name || result.fileName || file.name,
    fileName: result.fileName || result.name || file.name,
    fileUrl: result.fileUrl || result.url || result.viewUrl || result.webViewLink || result.permalink || result.downloadUrl || (fileId ? `https://workdrive.zoho.sa/file/${encodeURIComponent(fileId)}` : ''),
    uploadedAt: new Date().toISOString(),
    uploadedBy: current.email || current.name || current.uid || '',
    departmentRole: task.departmentRole || '',
    departmentName: task.assignedDepartmentName || taskDepartmentLabel(task),
    uploadKind: 'review',
    kind: 'review',
    purpose: 'review',
    isFinal: false
  };
}
async function uploadTaskFileToDrive(file, task, uploadKind = 'review'){
  if(uploadKind === 'final') return uploadTaskFileToFirebaseStorage(file, task, 'final');
  return uploadTaskFileToZohoReview(file, task);
}
function openTaskModal(task){
  const modal = document.getElementById('taskModal');
  const content = document.getElementById('taskModalContent');
  if(!modal || !content || !task) return;
  const structure = taskStructure(task);
  activeTaskModalMeta = { taskId: task.id, campaignId: task.campaignId || '' };
  content.innerHTML = buildTaskDetailHtml(task);
  modal.classList.remove('structure-fullscreen-modal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  setTimeout(() => ensureStructureSheetLoaded(task.id), 50);
}
function closeTaskModal(){
  closeStructureCellNoteEditors();
  const modal = document.getElementById('taskModal');
  modal?.classList.remove('show');
  modal?.classList.remove('structure-fullscreen-modal');
  modal?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  activeTaskModalMeta = null;
}
function refreshOpenTaskModal(){
  const modal = document.getElementById('taskModal');
  if(!activeTaskModalMeta || !modal?.classList.contains('show')) return;
  const task = findTaskById(activeTaskModalMeta.taskId, activeTaskModalMeta.campaignId);
  if(task) openTaskModal(task);
}
async function updateTaskOnFirebase(taskId, patch, options = {}){
  if(!mainDb || !taskId){ showToast('اتصال Firebase غير متاح.'); return null; }
  const campaignIndex = campaigns.findIndex(c => Array.isArray(c.departmentTasks) && c.departmentTasks.some(t => (t.id || '') === taskId));
  if(campaignIndex >= 0){
    const campaign = campaigns[campaignIndex];
    let updatedTask = null;
    const nextTasksRaw = (campaign.departmentTasks || []).map(task => {
      if((task.id || '') !== taskId) return task;
      updatedTask = { ...task, ...patch, updatedAt: new Date().toISOString() };
      return updatedTask;
    });
    const nextTasks = nextTasksRaw.map(sanitizeTaskForFirestore);
    if(updatedTask) updatedTask = sanitizeTaskForFirestore(updatedTask);
    try{
      await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaign.id).update({ departmentTasks: nextTasks, updatedAt: serverTime() });
      // تحديث النسخة المحلية فوراً عشان الـ Popup يعرض التغيير بدون انتظار onSnapshot.
      campaigns[campaignIndex] = { ...campaign, departmentTasks: nextTasks, updatedAt: new Date().toISOString() };
      if(!options.silent) showToast('تم تحديث التاسك.');
      if(activeTaskModalMeta && activeTaskModalMeta.taskId === taskId){
        setTimeout(refreshOpenTaskModal, 30);
      }
      return updatedTask;
    }catch(error){
      console.error('Campaign task array update error', error, patch);
      showToast('تعذر تحديث التاسك داخل الحملة.');
      throw error;
    }
  }
  if(taskId.startsWith('fallback-')){ showToast('التاسك غير محفوظ على Firebase بعد. احفظ الحملة مرة أخرى.'); return null; }
  showToast('تعذر تحديث التاسك: لم يتم العثور عليه داخل marketing_campaigns.');
  return null;
}

function daysUntilRequiredText(requiredDate){
  const date = parseDateForDelay(requiredDate);
  if(!date) return 'غير محدد';
  const today = new Date();
  today.setHours(0,0,0,0);
  date.setHours(0,0,0,0);
  const diff = Math.ceil((date - today) / (24 * 60 * 60 * 1000));
  if(diff > 0) return `متبقي ${diff} يوم`;
  if(diff === 0) return 'اليوم هو التاريخ المطلوب';
  return `متأخر ${Math.abs(diff)} يوم`;
}


function isCampaignStructureTask(task){
  const section = identityClean(task.contentSectionName || task.assignedDepartmentName || '');
  const type = identityClean(task.taskType || '');
  const isContentSection = section.includes('المحتوي') || section.includes('المحتوى') || section.includes('content');
  const isCampaignWriting = type.includes(identityClean('كتابة محتوى حملة')) || type.includes(identityClean('كتابة محتوى')) || type.includes('content writing');
  return isContentSection && isCampaignWriting;
}
function taskStructure(task){
  return (task && typeof task.structure === 'object' && task.structure) ? task.structure : {};
}
function safeJsonParse(value, fallback){
  if(!value || typeof value !== 'string') return fallback;
  try{ return JSON.parse(value); }catch(error){ return fallback; }
}
function structureSheetTables(structure){
  if(Array.isArray(structure?.sheetTables)) return structure.sheetTables;
  return safeJsonParse(structure?.sheetTablesJson, []);
}
function encodeStructureWorkbookForFirestore(structure){
  const next = { ...(structure || {}) };
  if(Array.isArray(next.sheetTables)){
    next.sheetTablesJson = JSON.stringify(next.sheetTables);
    delete next.sheetTables;
  }
  return next;
}
function sanitizeTaskForFirestore(task){
  if(!task || typeof task !== 'object') return task;
  const next = { ...task };
  if(next.structure && typeof next.structure === 'object'){
    next.structure = encodeStructureWorkbookForFirestore(next.structure);
  }
  return next;
}
function structureStatusLabel(status){
  const map = {
    pending_review: 'بانتظار مراجعة الأدمن',
    needs_changes: 'محتاج تعديل',
    revised: 'تم رفع نسخة معدلة',
    approved: 'معتمد',
    distributed: 'تم توزيع تاسكات الهيكل'
  };
  return map[status] || 'لم يتم رفع الهيكل';
}
function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('تعذر قراءة الملف.'));
    reader.readAsDataURL(file);
  });
}
async function parseStructureFile(file){
  const result = await parseStructureWorkbook(file);
  return result.parsedRows || [];
}

async function dataUrlToArrayBuffer(dataUrl){
  const res = await fetch(dataUrl);
  return await res.arrayBuffer();
}
async function parseStructureDataUrl(dataUrl){
  if(!window.XLSX || !dataUrl) return { parsedRows: [], sheetTables: [] };
  const buffer = await dataUrlToArrayBuffer(dataUrl);
  return parseStructureWorkbookBuffer(buffer);
}
async function parseStructureWorkbook(file){
  if(!window.XLSX) return { parsedRows: [], sheetTables: [] };
  const buffer = await file.arrayBuffer();
  return parseStructureWorkbookBuffer(buffer);
}
function isCampaignContentSheetName(sheetName){
  const name = normalizeText(sheetName).replace(/[ةه]/g, 'ه').replace(/[ىي]/g, 'ي');
  return (name.includes('محتوي') || name.includes('محتوى')) && (name.includes('الحمله') || name.includes('الحملة'));
}

function normalizeStructureSheetRows(rawRows){
  const rows = (rawRows || [])
    .map(row => (row || []).map(cell => normalizeText(cell)))
    .filter(row => row.some(cell => normalizeText(cell)));
  if(!rows.length) return { rows: [], maxCols: 0 };
  const maxLen = Math.max(0, ...rows.map(row => row.length));
  const usedCols = [];
  for(let col = 0; col < maxLen; col += 1){
    if(rows.some(row => normalizeText(row[col] || ''))) usedCols.push(col);
  }
  const compactRows = rows.map(row => usedCols.map(col => normalizeText(row[col] || '')));
  return { rows: compactRows, maxCols: usedCols.length };
}
function cellRef(rowIndex, colIndex){
  return XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
}
function sheetCellText(sheet, rowIndex, colIndex){
  const cell = sheet[cellRef(rowIndex, colIndex)];
  if(!cell) return '';
  if(cell.w != null) return normalizeText(cell.w);
  if(cell.v != null) return normalizeText(cell.v);
  return '';
}
function getSheetRange(sheet){
  try{ return XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1'); }
  catch(error){ return { s:{r:0,c:0}, e:{r:0,c:0} }; }
}
function mergeForAnchor(merges, r, c){
  return (merges || []).find(m => m.s && m.e && m.s.r === r && m.s.c === c) || null;
}
function insideMergeButNotAnchor(merges, r, c){
  return (merges || []).some(m => m.s && m.e && r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c && !(m.s.r === r && m.s.c === c));
}
function mergeAnchorForCell(merges, r, c){
  return (merges || []).find(m => m.s && m.e && r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c) || null;
}
function mergedCellValue(sheet, merges, r, c){
  const direct = sheetCellText(sheet, r, c);
  if(direct) return direct;
  const merge = mergeAnchorForCell(merges, r, c);
  if(merge) return sheetCellText(sheet, merge.s.r, merge.s.c);
  return '';
}
function structureCellClass(value, rowSpan, colSpan){
  const clean = normalizeText(value).toLowerCase();
  const cls = [];
  if(rowSpan > 1 || colSpan > 1) cls.push('excel-merged-cell');
  if(clean.includes('campaign logic')) cls.push('excel-section-title logic-title protected-structure-title');
  if(clean.includes('content execution direction') || clean.includes('آلية تنفيذ المحتوى')) cls.push('excel-section-title execution-title protected-structure-title');
  if(clean.includes('writing rules') || clean.includes('قواعد كتابة المحتوى')) cls.push('excel-section-title writing-title protected-structure-title');
  if(clean.includes('awareness')) cls.push('excel-section-side awareness-side');
  if(rowSpan > 3 && (clean.includes('awareness') || clean.includes('قواعد') || clean.includes('محتوى حملات'))) cls.push('excel-vertical-side');
  return cls.join(' ');
}
function buildMergedStructureSheet(sheet, sheetName){
  const range = getSheetRange(sheet);
  const merges = sheet['!merges'] || [];
  const originalRows = [];
  const originalCols = [];
  for(let r = range.s.r; r <= range.e.r; r += 1){
    let rowHasData = false;
    for(let c = range.s.c; c <= range.e.c; c += 1){
      if(mergedCellValue(sheet, merges, r, c)){ rowHasData = true; break; }
    }
    if(rowHasData) originalRows.push(r);
  }
  for(let c = range.s.c; c <= range.e.c; c += 1){
    let colHasData = false;
    for(let r = range.s.r; r <= range.e.r; r += 1){
      if(mergedCellValue(sheet, merges, r, c)){ colHasData = true; break; }
    }
    if(colHasData) originalCols.push(c);
  }
  const rowMap = new Map(originalRows.map((r,i)=>[r,i]));
  const colMap = new Map(originalCols.map((c,i)=>[c,i]));
  const rows = originalRows.map((r) => {
    const cells = [];
    originalCols.forEach((c) => {
      if(insideMergeButNotAnchor(merges, r, c)){
        const parent = mergeAnchorForCell(merges, r, c);
        if(parent && rowMap.has(parent.s.r) && colMap.has(parent.s.c)){
          cells.push({ skip:true, sourceRow:r, sourceCol:c });
        }else{
          cells.push({ value:'', sourceRow:r, sourceCol:c });
        }
        return;
      }
      const merge = mergeForAnchor(merges, r, c);
      let rowSpan = 1;
      let colSpan = 1;
      if(merge){
        const visibleRows = originalRows.filter(rr => rr >= merge.s.r && rr <= merge.e.r);
        const visibleCols = originalCols.filter(cc => cc >= merge.s.c && cc <= merge.e.c);
        rowSpan = Math.max(1, visibleRows.length);
        colSpan = Math.max(1, visibleCols.length);
      }
      const value = sheetCellText(sheet, r, c);
      cells.push({
        value,
        rowSpan,
        colSpan,
        sourceRow:r,
        sourceCol:c,
        mergeStartRow: merge ? merge.s.r : r,
        mergeEndRow: merge ? merge.e.r : r,
        mergeStartCol: merge ? merge.s.c : c,
        mergeEndCol: merge ? merge.e.c : c,
        className: structureCellClass(value, rowSpan, colSpan)
      });
    });
    return cells;
  });
  return { sheetName:'محتوى الحملة', sourceSheetName:sheetName, mode:'merged', rows, maxCols:originalCols.length };
}
function tableRowsFromMergedSheet(sheetTable){
  if(sheetTable?.mode !== 'merged') return Array.isArray(sheetTable?.rows) ? sheetTable.rows : [];
  // مهم: لا نحذف خلايا الـ merge الفارغة/skip أثناء القراءة.
  // حذفها كان بيزحزح الأعمدة في الصفوف التالية، فـ نوع المحتوى كان بيتقرأ غلط.
  return (sheetTable.rows || []).map(row => (row || []).map(c => c?.skip ? '' : normalizeText(c?.value || '')));
}
function headerIndex(headers, patterns){
  const list = Array.isArray(patterns) ? patterns : [patterns];
  return (headers || []).findIndex(header => list.some(pattern => normalizeText(header).includes(pattern)));
}
function cellByHeader(row, index){
  return index >= 0 ? normalizeText((row || [])[index] || '') : '';
}
function parseExecutionRowsFromSheetTables(structure){
  const sheetTables = structureSheetTables(structure);
  const parsed = [];
  sheetTables.forEach(sheet => {
    const rows = tableRowsFromMergedSheet(sheet);
    let headerIndexNo = -1;
    for(let i = 0; i < rows.length; i += 1){
      const normalizedRow = (rows[i] || []).map(v => normalizeText(v));
      const hasTaskNo = normalizedRow.some(cell => cell.includes('رقم التاسك') || cell.toLowerCase().includes('task no'));
      const hasContentType = normalizedRow.some(cell => cell.includes('نوع المحتوى') || cell.toLowerCase().includes('content type'));
      if(hasTaskNo && hasContentType){ headerIndexNo = i; break; }
    }
    if(headerIndexNo < 0) return;
    const headers = (rows[headerIndexNo] || []).map(h => normalizeText(h));
    const idx = {
      campaignType: headerIndex(headers, ['نوع الحمله','نوع الحملة','campaign type']),
      contentType: headerIndex(headers, ['نوع المحتوى','content type']),
      taskNo: headerIndex(headers, ['رقم التاسك','task no','task']),
      goal: headerIndex(headers, ['الهدف','goal']),
      tangibleGoal: headerIndex(headers, ['الهدف الملموس']),
      idea: headerIndex(headers, ['الفكرة','idea']),
      contentName: headerIndex(headers, ['اسم المحتوي','اسم المحتوى','content name']),
      description: headerIndex(headers, ['وصف المحتوي','وصف المحتوى','description']),
      message: headerIndex(headers, ['الرسالة','message']),
      writerRequest: headerIndex(headers, ['المطلوب من الكاتب','required from writer']),
      cta: headerIndex(headers, ['cta','الدعوة لاتخاذ إجراء'])
    };
    for(let r = headerIndexNo + 1; r < rows.length; r += 1){
      const row = rows[r] || [];
      if(!row.some(v => normalizeText(v))) continue;
      const contentType = cellByHeader(row, idx.contentType);
      const taskNo = cellByHeader(row, idx.taskNo);
      // التوزيع يكون من صفوف عمود نوع المحتوى فقط.
      // أي صف لا يحتوي على نوع محتوى حقيقي لا يتحول لتاسك.
      if(!contentType) continue;
      const item = { sheetName: sheet.sheetName, rowNumber: r + 1, raw: {} };
      headers.forEach((h, i) => { if(h) item.raw[h] = normalizeText(row[i]); });
      item.campaignType = cellByHeader(row, idx.campaignType);
      item.contentType = contentType;
      item.taskNo = taskNo;
      item.goal = cellByHeader(row, idx.goal);
      item.tangibleGoal = cellByHeader(row, idx.tangibleGoal);
      item.idea = cellByHeader(row, idx.idea);
      item.contentName = cellByHeader(row, idx.contentName);
      item.description = cellByHeader(row, idx.description);
      item.message = cellByHeader(row, idx.message);
      item.writerRequest = cellByHeader(row, idx.writerRequest);
      item.cta = cellByHeader(row, idx.cta);
      parsed.push(item);
    }
  });
  return parsed;
}
function structureDistributionRows(structure){
  const fromTables = parseExecutionRowsFromSheetTables(structure);
  const source = fromTables.length ? fromTables : (Array.isArray(structure?.parsedRows) ? structure.parsedRows : []);
  return source
    .filter(row => normalizeText(row?.contentType || ''))
    .map((row, index) => ({ ...row, taskNo: normalizeText(row?.taskNo || '') || `T${String(index + 1).padStart(2, '0')}` }));
}
function structureTaskNumber(task){
  return normalizeText(task?.structureTaskNo || task?.taskNo || task?.structureRow?.taskNo || '');
}
function structureContentTaskLabel(row, fallback = 'نوع محتوى'){
  const no = normalizeText(row?.taskNo || '');
  const type = normalizeText(row?.contentType || '');
  if(no && type) return `${no} - ${type}`;
  return type || no || fallback;
}
async function parseStructureWorkbookBuffer(buffer){
  if(!window.XLSX) return { parsedRows: [], sheetTables: [] };
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false, cellStyles: true });
  const contentSheetNames = workbook.SheetNames.filter(isCampaignContentSheetName);
  const selectedSheetNames = contentSheetNames.length ? contentSheetNames : workbook.SheetNames.slice(0, 1);
  const sheetTables = selectedSheetNames.map(sheetName => buildMergedStructureSheet(workbook.Sheets[sheetName], sheetName)).filter(sheet => (sheet.rows || []).length);
  const parsedRows = parseExecutionRowsFromSheetTables({ sheetTables });
  return { parsedRows, sheetTables };
}

function structureCellKey(sheetName, rowIndex, colIndex){
  return `${sheetName || 'Sheet'}::${Number(rowIndex) || 0}::${Number(colIndex) || 0}`;
}

function isProtectedStructureTitleText(value){
  const clean = normalizeText(value).toLowerCase();
  return clean.includes('campaign logic')
    || clean.includes('writing rules')
    || clean.includes('قواعد كتابة المحتوى')
    || clean.includes('content execution direction')
    || clean.includes('آلية تنفيذ المحتوى');
}


function structureRowValues(row){
  return (row || []).filter(cell => cell && !cell.skip).map(cell => normalizeText(cell.value || '')).filter(Boolean);
}
function isStructureSectionTitleText(value){
  return isProtectedStructureTitleText(value);
}
function structureSectionTypeFromRows(rows){
  const text = (rows || []).map(row => structureRowValues(row).join(' ')).join(' ').toLowerCase();
  if(text.includes('writing rules') || text.includes('قواعد كتابة المحتوى')) return 'writing';
  if(text.includes('content execution direction') || text.includes('آلية تنفيذ المحتوى')) return 'execution';
  if(text.includes('campaign logic')) return 'logic';
  return 'logic';
}
function structureSectionTitleByType(type){
  if(type === 'writing') return 'Writing Rules - قواعد كتابة المحتوى';
  if(type === 'execution') return 'Content Execution Direction - آلية تنفيذ المحتوى';
  return 'Campaign Logic';
}
function splitStructureRowsIntoSections(rows){
  const source = Array.isArray(rows) ? rows : [];
  if(!source.length) return [];
  const titleIndexes = [];
  source.forEach((row, index) => {
    const hasTitle = (row || []).some(cell => cell && !cell.skip && isStructureSectionTitleText(cell.value || ''));
    if(hasTitle) titleIndexes.push(index);
  });
  if(!titleIndexes.length){
    const type = structureSectionTypeFromRows(source);
    return [{ start:0, end:source.length - 1, rows:source, title:structureSectionTitleByType(type), type }]
      .filter(section => section.rows.some(row => structureRowValues(row).length));
  }

  const sections = titleIndexes.map((titleIndex, i) => {
    const prefixStart = i === 0 ? 0 : titleIndex;
    const nextTitleIndex = titleIndexes[i + 1] ?? source.length;
    const sectionRows = source.slice(prefixStart, nextTitleIndex);
    const type = structureSectionTypeFromRows(sectionRows);
    const title = structureSectionTitleByType(type);
    // The big Excel title row is represented by the colored header above the table.
    // Keep campaign-code rows and side label rows exactly as sheet data, but remove only the title strip row.
    const rowsWithoutTitleStrip = sectionRows.filter((row, rowIndexWithinSection) => {
      const actualIndex = prefixStart + rowIndexWithinSection;
      const values = structureRowValues(row);
      const onlySectionTitle = values.length && values.every(value => isStructureSectionTitleText(value));
      if(onlySectionTitle) return false;
      if(actualIndex !== titleIndex) return true;
      return !(row || []).some(cell => cell && !cell.skip && isStructureSectionTitleText(cell.value || ''));
    }).map(row => (row || []).filter(cell => {
      if(!cell || cell.skip) return true;
      const value = normalizeText(cell.value || '');
      return !isStructureSectionTitleText(value);
    })).filter(row => row.some(cell => cell && !cell.skip && normalizeText(cell.value || '')));
    return { start:prefixStart, end:nextTitleIndex - 1, rows:rowsWithoutTitleStrip.length ? rowsWithoutTitleStrip : sectionRows, title, type };
  }).filter(section => section.rows.some(row => structureRowValues(row).length));

  return sections.reduce((merged, section) => {
    const last = merged[merged.length - 1];
    if(last && last.type === section.type){
      last.rows = last.rows.concat(section.rows);
      last.end = section.end;
    }else{
      merged.push(section);
    }
    return merged;
  }, []);
}
function compactStructureSectionRows(sectionRows){
  const rows = Array.isArray(sectionRows) ? sectionRows : [];
  const included = new Set();
  rows.forEach((row) => {
    (row || []).forEach(cell => {
      if(!cell || cell.skip) return;
      const val = normalizeText(cell.value || '');
      if(!val) return;
      included.add(Number(cell.sourceCol));
      const isWideTitle = isStructureSectionTitleText(val) || /حمله|حملة/i.test(val);
      if(!isWideTitle && Number(cell.mergeEndCol) > Number(cell.mergeStartCol)){
        for(let c = Number(cell.mergeStartCol); c <= Number(cell.mergeEndCol); c += 1) included.add(c);
      }
    });
  });
  if(!included.size){
    rows.forEach(row => (row || []).forEach(cell => { if(cell && !cell.skip) included.add(Number(cell.sourceCol)); }));
  }
  const includedCols = [...included].filter(n => Number.isFinite(n)).sort((a,b)=>a-b);
  const colSet = new Set(includedCols);
  const visibleSourceRows = rows.map(row => (row || [])[0]?.sourceRow).filter(n => Number.isFinite(Number(n))).map(Number);
  const rowSet = new Set(visibleSourceRows);
  return rows.map(row => (row || []).filter(cell => cell && !cell.skip && colSet.has(Number(cell.sourceCol))).map(cell => {
    const startCol = Number(cell.mergeStartCol ?? cell.sourceCol);
    const endCol = Number(cell.mergeEndCol ?? cell.sourceCol);
    const startRow = Number(cell.mergeStartRow ?? cell.sourceRow);
    const endRow = Number(cell.mergeEndRow ?? cell.sourceRow);
    const colSpan = Math.max(1, includedCols.filter(c => c >= startCol && c <= endCol).length || 1);
    const rowSpan = Math.max(1, visibleSourceRows.filter(r => r >= startRow && r <= endRow).length || 1);
    const value = normalizeText(cell.value || '');
    return { ...cell, value, colSpan, rowSpan, className: structureCellClass(value, rowSpan, colSpan) };
  })).filter(row => row.some(cell => normalizeText(cell.value || '')) || row.length > 1);
}
function renderStructureWorkbookTable(task, structure, admin){
  const sheets = structureSheetTables(structure);
  if(!sheets.length){
    if(structure.fileData){
      return `<div class="structure-workbook-view missing-sheet-preview"><h4>محتوى الحملة</h4><div class="empty-state mini-empty">الملف مرفوع، لكن عرض الشيت لم يكتمل بعد.</div><button class="btn btn-light" type="button" data-reload-structure-sheet="${escapeHtml(task.id)}">عرض الشيت من الملف المرفوع</button></div>`;
    }
    return '';
  }
  const notes = Array.isArray(structure.notes) ? structure.notes : [];
  const marks = Array.isArray(structure.marks) ? structure.marks : [];
  return `<div class="structure-workbook-view"><div class="structure-help-bar"><strong>محتوى الحملة</strong><span>ضغطة واحدة للتعليم، دبل كليك يفتح مربع كتابة ملاحظة</span></div>${sheets.map(sheet => {
    if(sheet.mode === 'merged'){
      const sections = splitStructureRowsIntoSections(Array.isArray(sheet.rows) ? sheet.rows : []);
      return sections.map(section => {
        const sectionRows = compactStructureSectionRows(section.rows);
        const body = sectionRows.map((row) => `<tr>${row.map(cell => {
          const val = normalizeText(cell.value || '');
          const sourceRow = Number(cell.sourceRow);
          const sourceCol = Number(cell.sourceCol);
          const key = structureCellKey(sheet.sheetName, sourceRow, sourceCol);
          const hasMark = marks.some(m => (typeof m === 'string' ? m : m?.key) === key);
          const cellNotes = notes.filter(n => (n.key || n.cellKey) === key);
          const attrs = `${cell.rowSpan > 1 ? ` rowspan="${cell.rowSpan}"` : ''}${cell.colSpan > 1 ? ` colspan="${cell.colSpan}"` : ''}`;
          const protectedTitle = isProtectedStructureTitleText(val);
          const cls = [cell.className || '', protectedTitle ? 'protected-structure-title' : '', hasMark ? 'marked-cell' : '', cellNotes.length ? 'has-cell-note' : ''].filter(Boolean).join(' ');
          const cellActions = admin && !protectedTitle ? `data-structure-cell="${escapeHtml(task.id)}" data-sheet-name="${escapeHtml(sheet.sheetName)}" data-row-index="${sourceRow}" data-col-index="${sourceCol}" title="اضغط مرة للتعليم، واضغط مرتين لإضافة ملاحظة"` : 'title="عنوان ثابت غير قابل للتعديل"';
          return `<td class="${escapeHtml(cls)}"${attrs} ${cellActions}>${escapeHtml(val)}${cellNotes.map(n => `<div class="cell-note-badge">${escapeHtml(n.note || '')}</div>`).join('')}</td>`;
        }).join('')}</tr>`).join('');
        return `<div class="structure-sheet-block compact-structure-section structure-section-${escapeHtml(section.type || 'logic')}"><div class="structure-section-display-title ${escapeHtml(section.type || 'logic')}-title">${escapeHtml(section.title || 'Campaign Logic')}</div><div class="structure-table-wrap full-sheet"><table class="structure-table full-structure-table excel-like-structure compact-excel-section"><tbody>${body}</tbody></table></div></div>`;
      }).join('');
    }
    const rows = Array.isArray(sheet.rows) ? sheet.rows : [];
    const maxCols = Math.max(Number(sheet.maxCols) || 0, ...rows.map(row => row.length));
    const body = rows.map((row, rowIndex) => `<tr>${Array.from({length:maxCols}).map((_, colIndex) => {
      const val = normalizeText(row[colIndex] || '');
      const key = structureCellKey(sheet.sheetName, rowIndex, colIndex);
      const hasMark = marks.some(m => (typeof m === 'string' ? m : m?.key) === key);
      const cellNotes = notes.filter(n => (n.key || n.cellKey) === key);
      const protectedTitle = isProtectedStructureTitleText(val);
      const cls = [protectedTitle ? 'protected-structure-title excel-section-title' : '', hasMark ? 'marked-cell' : ''].filter(Boolean).join(' ');
      const cellActions = admin && !protectedTitle ? `data-structure-cell="${escapeHtml(task.id)}" data-sheet-name="${escapeHtml(sheet.sheetName)}" data-row-index="${rowIndex}" data-col-index="${colIndex}" title="اضغط مرة للتعليم، واضغط مرتين لإضافة ملاحظة"` : (protectedTitle ? 'title="عنوان ثابت غير قابل للتعديل"' : '');
      return `<td class="${escapeHtml(cls)}" ${cellActions}>${escapeHtml(val)}${cellNotes.map(n => `<div class="cell-note-badge">${escapeHtml(n.note || '')}</div>`).join('')}</td>`;
    }).join('')}</tr>`).join('');
    return `<div class="structure-sheet-block"><div class="structure-sheet-title">${escapeHtml(sheet.sheetName || 'محتوى الحملة')}</div><div class="structure-table-wrap full-sheet"><table class="structure-table full-structure-table excel-like-structure"><tbody>${body}</tbody></table></div></div>`;
  }).join('')}</div>`;
}

function structureRowsTable(rows, notes = []){
  if(!Array.isArray(rows) || !rows.length) return '<div class="empty-state mini-empty">لم يتم قراءة صفوف آلية تنفيذ المحتوى من الملف.</div>';
  return `<div class="structure-table-wrap"><table class="structure-table"><thead><tr><th>رقم التاسك</th><th>نوع المحتوى</th><th>الفكرة</th><th>وصف المحتوى</th><th>المطلوب من الكاتب</th><th>ملاحظات</th></tr></thead><tbody>${rows.map((row, index) => {
    const rowNotes = notes.filter(n => Number(n.rowIndex) === index);
    return `<tr class="${rowNotes.length ? 'has-note' : ''}"><td>${escapeHtml(row.taskNo || index + 1)}</td><td>${escapeHtml(row.contentType || '—')}</td><td>${escapeHtml(row.idea || row.contentName || '—')}</td><td>${escapeHtml(row.description || '—')}</td><td>${escapeHtml(row.writerRequest || '—')}</td><td>${rowNotes.map(n => `<div class="structure-note-chip">${escapeHtml(n.note || '')}</div>`).join('') || '—'}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function structureAssigneeTable(task){
  const structure = taskStructure(task);
  const rows = structureDistributionRows(structure);
  if(!rows.length) return '<div class="empty-state mini-empty">لا توجد صفوف لتوزيعها.</div>';
  return `<div class="structure-distribution"><h4>توزيع تاسكات الهيكل</h4><div class="structure-assign-list">${rows.map((row, index) => `<div class="structure-assign-row" data-structure-row="${index}"><div><strong>${escapeHtml(structureContentTaskLabel(row, 'نوع محتوى'))}</strong><p>${escapeHtml(row.idea || row.contentName || row.description || row.goal || '')}</p></div><select class="js-structure-assignee"><option value="">اختر اليوزر</option>${users.map(u => `<option value="${escapeHtml(u.id || u.uid || u.email || u.name)}">${escapeHtml(userName(u))}</option>`).join('')}</select></div>`).join('')}</div><button class="btn btn-primary" type="button" data-save-structure-assignees="${escapeHtml(task.id)}">حفظ توزيع تاسكات الهيكل</button></div>`;
}
function renderStructureSection(task){
  if(!isCampaignStructureTask(task)) return '';
  const admin = isCurrentUserAdmin();
  const structure = taskStructure(task);
  const status = structure.status || '';
  const notes = Array.isArray(structure.notes) ? structure.notes : [];
  const rows = Array.isArray(structure.parsedRows) ? structure.parsedRows : [];
  const canUpload = !admin && (!status || status === 'needs_changes' || status === 'revised');
  const notesHtml = notes.length ? `<div class="structure-notes-list"><h4>ملاحظات الأدمن</h4>${notes.map(note => `<div class="structure-note"><b>${escapeHtml(note.field || 'ملاحظة')}</b><p>${escapeHtml(note.note || '')}</p></div>`).join('')}</div>` : '';
  return `<div class="modal-section structure-section"><div class="modal-section-title"><h3>هيكل الحملة</h3><span>${escapeHtml(structureStatusLabel(status))}</span></div>
    <div class="structure-actions">
      <a class="btn btn-light" href="assets/templates/%D9%87%D9%8A%D9%83%D9%84%20%D8%A7%D9%84%D8%AD%D9%85%D9%84%D9%87.xlsx" download="هيكل الحمله.xlsx">تحميل قالب الهيكل</a>
      ${canUpload ? `<button class="btn btn-primary" type="button" data-upload-structure="${escapeHtml(task.id)}">إرفاق هيكل الحملة Excel</button>` : ''}
      ${structure.fileName ? `<span class="structure-file-name">${escapeHtml(structure.fileName)}</span>` : '<span class="structure-file-name muted">لم يتم رفع الهيكل</span>'}
      ${structure.fileData ? `<a class="btn btn-light" href="${escapeHtml(structure.fileData)}" download="${escapeHtml(structure.fileName || 'campaign-structure.xlsx')}">تحميل الملف المرفوع</a>` : ''}
    </div>
    ${notesHtml}
    ${admin && rows.length && status !== 'approved' && status !== 'distributed' ? `<div class="structure-admin-tools"><button class="btn btn-primary" type="button" data-structure-approve="${escapeHtml(task.id)}">اعتماد الهيكل</button></div>` : ''}
    ${status === 'approved' || status === 'distributed' ? '' : renderStructureWorkbookTable(task, structure, admin)}
    ${admin && (status === 'approved' || status === 'distributed') ? `<div class="structure-approved-distribution"><div class="structure-approved-message">تم اعتماد الهيكل. ابدأ توزيع تاسكات الهيكل على اليوزرات.</div>${structureAssigneeTable(task)}</div>` : ''}
  </div>`;
}

function buildTaskDetailHtml(task){
  const campaign = campaignForTask(task);
  const admin = isCurrentUserAdmin();
  const steps = Array.isArray(task.steps) && task.steps.length ? task.steps : taskStepTemplate(task.departmentRole || 'other');
  const progress = taskProgress(task);
  const campaignDate = campaign.campaign_date || campaign.campaignDate || campaign.createdAt || '';
  const endDate = campaign.publishSchedule?.slice?.(-1)?.[0]?.date || campaign.campaignEndDate || campaign.endDate || '';
  const requiredDate = taskRequiredDate(task, campaign);
  const requiredLeft = daysUntilRequiredText(requiredDate);
  return `<div class="task-modal-head"><div><span>التاسك والمطلوب</span><h2>${shortTaskName(task)}</h2><p>${escapeHtml([campaign.campaignName || campaign.name, campaign.campaignCode || task.campaignCode].filter(Boolean).join(' · '))}</p></div><button type="button" class="mini-btn" data-close-task-modal>إغلاق</button></div>
    <div class="modal-section campaign-data-line"><div class="modal-section-title"><h3>بيانات الحملة</h3></div>
      <div class="task-info-grid compact-one-line">
        <div><span>التاريخ</span><strong>${formatDateShort(campaignDate)}</strong></div>
        <div><span>كود الحملة</span><strong>${escapeHtml(campaign.campaignCode || task.campaignCode || '—')}</strong></div>
        <div><span>اسم الحملة</span><strong>${escapeHtml(campaign.campaignName || campaign.name || '—')}</strong></div>
        <div><span>نوع الحملة</span><strong>${escapeHtml(campaign.campaignType || campaign.campaign_type || '—')}</strong></div>
        <div><span>هدف الحملة</span><strong>${escapeHtml(campaign.campaign_goal || campaign.campaignGoal || '—')}</strong></div>
        <div><span>بداية الحملة</span><strong>${formatDateShort(campaign.campaign_date || campaign.startDate)}</strong></div>
        <div><span>نهاية الحملة</span><strong>${formatDateShort(endDate)}</strong></div>
      </div>
    </div>
    <div class="modal-section task-brief-row task-brief-row-four">
      <div class="brief-box"><span>رقم التاسك</span><strong>${escapeHtml(structureTaskNumber(task) || '—')}</strong></div>
      <div class="brief-box"><span>نوع المحتوى</span><strong>${escapeHtml(taskContentType(task) || '—')}</strong></div>
      <div class="brief-box"><span>نوع التاسك</span><strong>${escapeHtml(task.taskType || '—')}</strong></div>
      <div class="brief-box"><span>الكريتيف</span><strong>${escapeHtml(task.creative || task.product || '—')}</strong></div>
      <div class="brief-box"><span>السيارة المختارة</span><strong>${escapeHtml(task.selectedCar || task.carName || '')}</strong></div>
    </div>
    ${task.structureRow ? `<div class="modal-section structure-task-data"><div class="modal-section-title"><h3>بيانات تاسك الهيكل</h3></div><div class="structure-task-grid"><div><span>الهدف</span><strong>${escapeHtml(task.structureRow.goal || '—')}</strong></div><div><span>الهدف الملموس</span><strong>${escapeHtml(task.structureRow.tangibleGoal || '—')}</strong></div><div><span>الفكرة</span><strong>${escapeHtml(task.structureRow.idea || '—')}</strong></div><div><span>وصف المحتوى</span><strong>${escapeHtml(task.structureRow.description || '—')}</strong></div><div><span>الرسالة</span><strong>${escapeHtml(task.structureRow.message || '—')}</strong></div><div><span>المطلوب من الكاتب</span><strong>${escapeHtml(task.structureRow.writerRequest || '—')}</strong></div><div><span>CTA</span><strong>${escapeHtml(task.structureRow.cta || '—')}</strong></div></div></div>` : ''}
    <div class="modal-section task-actions-section">
      <div class="modal-section-title"><h3>إجراءات التكليف</h3><span>${progress}%</span></div>
      <div class="task-deadline-row"><span>التاريخ المطلوب: <b>${formatDateShort(requiredDate)}</b></span><strong>${escapeHtml(requiredLeft)}</strong></div>
      <div class="task-mini-meta"><span>القسم: <b>${escapeHtml(taskDepartmentLabel(task))}</b></span><span>اليوزر: <b>${taskOwnerName(task)}</b></span><span>الحالة: <b>${receivedLabel(task)}</b></span></div>
      <div class="receive-action-row"><button type="button" class="btn btn-light receive-action ${task.received || task.receivedConfirmed ? 'done' : ''}" data-toggle-received="${escapeHtml(task.id)}">${task.received || task.receivedConfirmed ? 'تم الاستلام' : 'تأكيد الاستلام'}</button></div>
      <div class="modal-progress"><span style="width:${Math.min(100,progress)}%"></span></div>
      <div class="modal-steps-grid">${steps.map((step, index) => `<button type="button" class="workflow-step ${step.done ? 'done' : ''}" data-task-step="${escapeHtml(task.id)}" data-step-index="${index}" ${step.adminOnly && !admin ? 'disabled' : ''}><span>${escapeHtml(step.label)}</span><strong>${Number(step.percent || 0)}%</strong>${step.adminOnly ? '<em>أدمن فقط</em>' : ''}</button>`).join('')}</div>
    </div>
    ${renderStructureSection(task)}
    <div class="modal-section attachment-section review-upload-section">
      <div class="modal-section-title"><h3>ملفات المراجعة</h3><span>متاح دائمًا</span></div>
      <button type="button" class="btn btn-light" data-upload-task-attachment="review">رفع ملف للمراجعة</button>
      ${renderAttachmentTable(task, 'review')}
    </div>
    <div class="modal-section attachment-section final-upload-section">
      <div class="modal-section-title"><h3>الملف النهائي</h3><span>${progress >= 100 ? 'متاح' : 'ينتظر 100%'}</span></div>
      ${progress >= 100 ? `<button type="button" class="btn btn-primary" data-upload-task-attachment="final">رفع الملف النهائي</button>${renderAttachmentTable(task, 'final')}` : `<div class="prep-file-missing">زر رفع الملف النهائي يظهر هنا فقط عند وصول التاسك إلى 100%.</div>`}
    </div>`;
}
function renderTaskDetail(taskId, campaignId = ''){
  const task = findTaskById(taskId, campaignId);
  if(!task) return;
  if(!isCurrentUserAdmin() && !currentUserMatchesTaskExact(task)) return;
  openTaskModal(task);
}
async function toggleTaskStep(taskId, stepIndex){
  const task = findTaskById(taskId);
  if(!task) return;
  if(!isCurrentUserAdmin() && !currentUserMatchesTaskExact(task)) return;
  const steps = Array.isArray(task.steps) && task.steps.length ? task.steps.map(step => ({...step})) : taskStepTemplate(task.departmentRole || 'other');
  const step = steps[Number(stepIndex)];
  if(!step) return;
  if(step.adminOnly && !isCurrentUserAdmin()){
    showToast('الاعتماد للأدمن فقط.');
    return;
  }
  step.done = !step.done;
  const progress = Math.min(100, Math.round(steps.reduce((sum, item) => sum + (item.done ? Number(item.percent || 0) : 0), 0)));
  await updateTaskOnFirebase(task.id, {
    steps,
    progress,
    status: progress >= 100 ? 'done' : 'in_progress',
    deliveredAt: progress >= 100 ? (task.deliveredAt || new Date().toISOString()) : '',
    completedAt: progress >= 100 ? (task.completedAt || new Date().toISOString()) : ''
  }); refreshOpenTaskModal(); renderAdminDashboard();
}
async function toggleTaskReceived(taskId){
  const task = findTaskById(taskId);
  if(!task) return;
  if(!isCurrentUserAdmin() && !currentUserMatchesTaskExact(task)) return;
  const nextReceived = !(task.received || task.receivedConfirmed);
  await updateTaskOnFirebase(task.id, {
    received: nextReceived,
    receivedConfirmed: nextReceived,
    receivedAt: nextReceived ? new Date().toISOString() : '',
    receivedBy: nextReceived ? (getCurrentUser().email || getCurrentUser().name || getCurrentUser().uid || '') : '',
    status: nextReceived ? 'received' : 'pending'
  }); refreshOpenTaskModal(); renderAdminDashboard(); renderTasksPage();
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
        const sectionName = canonicalContentLabel(task.contentSectionName || dep.name || user.department || '');
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
            requiredDate: task.requiredDate || '',
            dueDate: task.requiredDate || '',
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
  // تم إلغاء استخدام مسار campaign_tasks. المصدر الوحيد للتاسكات هو marketing_campaigns.departmentTasks.
  return 0;
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

function buildStructureTaskFromRow(campaign, parentTask, row, assigneeId, rowIndex){
  const user = findUserByAnyIdentity([assigneeId]) || {};
  const resolvedUserId = user.id || user.uid || assigneeId || '';
  const resolvedUserName = userName(user) || assigneeId || 'غير محدد';
  const sectionName = row.contentType || parentTask.contentSectionName || 'المحتوى';
  const role = normalizeDepartmentRole(sectionName);
  const taskType = row.contentType || row.contentName || row.idea || 'تاسك من الهيكل';
  const taskNo = normalizeText(row.taskNo || '');
  const taskLabel = structureContentTaskLabel(row, taskType);
  const searchKeys = uniqueList([resolvedUserId, user.id, user.uid, user.email, user.emailLower, resolvedUserName, user.name, user.displayName, user.username].filter(Boolean));
  return normalizeCampaignTask({
    id: `${campaign.id}-structure-${Date.now()}-${rowIndex + 1}`,
    campaignId: campaign.id,
    campaignName: campaign.campaignName || campaign.name || '',
    campaignCode: campaign.campaignCode || campaign.campaign_code || '',
    creative: taskLabel,
    product: row.idea || row.contentName || row.description || row.contentType || parentTask.product || '',
    taskNo,
    structureTaskNo: taskNo,
    structureTaskLabel: taskLabel,
    contentSectionId: parentTask.contentSectionId || parentTask.assignedDepartmentId || '',
    contentSectionName: sectionName,
    taskType,
    structureGenerated: true,
    parentStructureTaskId: parentTask.id,
    structureRow: row,
    selectedCar: '',
    selectedCars: [],
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
    assignedDepartmentId: parentTask.contentSectionId || parentTask.assignedDepartmentId || '',
    assignedDepartmentName: sectionName,
    departmentRole: role,
    requiredDate: parentTask.requiredDate || parentTask.dueDate || '',
    dueDate: parentTask.requiredDate || parentTask.dueDate || '',
    received: false,
    receivedConfirmed: false,
    progress: 0,
    steps: taskStepTemplate(role),
    status: 'pending',
    attachments: [],
    source: 'campaign-structure-distribution'
  }, campaign);
}
async function saveStructureDistribution(taskId){
  const task = findTaskById(taskId);
  const campaign = campaignForTask(task);
  if(!task || !campaign?.id) return showToast('تعذر العثور على التاسك.');
  const rows = [...document.querySelectorAll(`#taskModal .structure-assign-row`)];
  const additions = [];
  rows.forEach((rowEl) => {
    const index = Number(rowEl.dataset.structureRow || 0);
    const assignee = rowEl.querySelector('.js-structure-assignee')?.value || '';
    const sourceRow = structureDistributionRows(taskStructure(task))[index];
    if(assignee && sourceRow) additions.push(buildStructureTaskFromRow(campaign, task, sourceRow, assignee, index));
  });
  if(!additions.length) return showToast('اختار يوزر واحد على الأقل.');
  const nextTasks = (campaign.departmentTasks || []).map(item => item.id === task.id ? { ...item, structure: { ...taskStructure(item), status: 'distributed', distributedAt: new Date().toISOString() } } : item).concat(additions);
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaign.id).update({ departmentTasks: nextTasks, taskCount: nextTasks.length, updatedAt: serverTime() });
  showToast('تم توزيع تاسكات الهيكل.');
}
async function uploadStructureFileForTask(file, taskId){
  const task = findTaskById(taskId);
  if(!task) return showToast('تعذر العثور على التاسك.');
  showToast('جاري قراءة الهيكل...');
  const fileData = await fileToDataUrl(file);
  let parsed = await parseStructureWorkbook(file);
  if(!(parsed.sheetTables || []).length && fileData){
    parsed = await parseStructureDataUrl(fileData);
  }
  const parsedRows = parsed.parsedRows || [];
  const sheetTables = parsed.sheetTables || [];
  const prev = taskStructure(task);
  const status = prev.status === 'needs_changes' ? 'revised' : 'pending_review';
  await updateTaskOnFirebase(task.id, { structure: encodeStructureWorkbookForFirestore({ ...prev, status, fileName: file.name, fileSize: file.size, fileData, parsedRows, sheetTables, uploadedAt: new Date().toISOString(), uploadedBy: getCurrentUser().email || getCurrentUser().name || '' }) });
  showToast(sheetTables.length ? 'تم رفع الهيكل وعرض الشيت كامل.' : 'تم رفع الهيكل، اضغط عرض الشيت كامل من الملف المرفوع.');
}
async function reloadStructureSheetFromStoredFile(taskId, silent = false){
  const task = findTaskById(taskId);
  if(!task) return;
  const structure = taskStructure(task);
  if(!structure.fileData) return;
  try{
    if(!silent) showToast('جاري عرض الشيت من الملف المرفوع...');
    const parsed = await parseStructureDataUrl(structure.fileData);
    const sheetTables = parsed.sheetTables || [];
    const parsedRows = parsed.parsedRows || [];
    if(!sheetTables.length){ if(!silent) showToast('تعذر قراءة الشيت من الملف المرفوع.'); return; }
    await updateTaskOnFirebase(task.id, { structure: encodeStructureWorkbookForFirestore({ ...structure, sheetTables, parsedRows, reparsedAt: new Date().toISOString() }) });
    if(!silent) showToast('تم عرض الشيت كامل.');
  }catch(error){
    console.error('Structure reparse error', error);
    if(!silent) showToast('تعذر عرض الشيت من الملف المرفوع.');
  }
}
function ensureStructureSheetLoaded(taskId){
  const task = findTaskById(taskId);
  const structure = taskStructure(task);
  if(structure.fileData && !structureSheetTables(structure).length){
    reloadStructureSheetFromStoredFile(taskId, true);
  }
}
async function toggleStructureCellMark(taskId, sheetName, rowIndex, colIndex){
  const task = findTaskById(taskId);
  if(!task) return;
  const structure = taskStructure(task);
  const cellKey = structureCellKey(sheetName, rowIndex, colIndex);
  const currentMarks = Array.isArray(structure.marks) ? structure.marks : [];
  const marks = currentMarks.includes(cellKey) ? currentMarks.filter(item => item !== cellKey) : [...currentMarks, cellKey];
  await updateTaskOnFirebase(task.id, { structure: { ...structure, status: marks.length ? 'needs_changes' : (structure.status || 'pending_review'), marks, reviewedAt: new Date().toISOString() } });
}

function structureCellValueFromStoredTable(structure, sheetName, rowIndex, colIndex){
  const sheets = structureSheetTables(structure);
  const sheet = sheets.find(item => item.sheetName === sheetName);
  const rowNo = Number(rowIndex);
  const colNo = Number(colIndex);
  if(!sheet) return '';
  if(sheet.mode === 'merged'){
    for(const row of (sheet.rows || [])){
      for(const cell of (row || [])){
        if(cell && !cell.skip && Number(cell.sourceRow) === rowNo && Number(cell.sourceCol) === colNo){
          return normalizeText(cell.value || '');
        }
      }
    }
    return '';
  }
  return normalizeText(sheet?.rows?.[rowNo]?.[colNo] || '');
}

function closeStructureCellNoteEditors(){
  document.querySelectorAll('.inline-structure-note-editor,.structure-note-backdrop').forEach(editor => editor.remove());
}

function openStructureCellNoteEditor(cellEl){
  if(!cellEl) return;
  closeStructureCellNoteEditors();
  const taskId = cellEl.dataset.structureCell || '';
  const sheetName = cellEl.dataset.sheetName || '';
  const rowIndex = cellEl.dataset.rowIndex || 0;
  const colIndex = cellEl.dataset.colIndex || 0;
  const task = findTaskById(taskId);
  const cellValue = task ? structureCellValueFromStoredTable(taskStructure(task), sheetName, rowIndex, colIndex) : '';
  const backdrop = document.createElement('div');
  backdrop.className = 'structure-note-backdrop';
  backdrop.dataset.closeStructureNote = '1';
  const editor = document.createElement('div');
  editor.className = 'inline-structure-note-editor structure-note-box';
  editor.dataset.structureCell = taskId;
  editor.dataset.sheetName = sheetName;
  editor.dataset.rowIndex = rowIndex;
  editor.dataset.colIndex = colIndex;
  editor.innerHTML = `<div class="inline-note-title"><b>اكتب ملاحظة على الخلية</b>${cellValue ? `<small>${escapeHtml(cellValue)}</small>` : ''}</div><textarea class="inline-note-input" rows="5" placeholder="اكتب الملاحظة هنا"></textarea><div class="inline-note-actions"><button type="button" class="mini-btn structure-note-save">حفظ الملاحظة</button><button type="button" class="mini-btn structure-note-cancel">إلغاء</button></div>`;
  document.body.appendChild(backdrop);
  document.body.appendChild(editor);
  const input = editor.querySelector('textarea');
  setTimeout(() => input?.focus(), 20);
}

async function saveStructureCellNote(taskId, sheetName, rowIndex, colIndex, note){
  const task = findTaskById(taskId);
  if(!task) return;
  const cleanNote = normalizeText(note || '');
  if(!cleanNote) return;
  const structure = taskStructure(task);
  const cellValue = structureCellValueFromStoredTable(structure, sheetName, rowIndex, colIndex);
  const cellKey = structureCellKey(sheetName, rowIndex, colIndex);
  const notes = [...(Array.isArray(structure.notes) ? structure.notes : []), { id: `note-${Date.now()}`, key: cellKey, cellKey, sheetName, rowIndex:Number(rowIndex), colIndex:Number(colIndex), field: cellValue || `صف ${Number(rowIndex)+1} / عمود ${Number(colIndex)+1}`, note: cleanNote, createdAt: new Date().toISOString(), createdBy: getCurrentUser().email || getCurrentUser().name || '' }];
  const currentMarks = Array.isArray(structure.marks) ? structure.marks : [];
  const marks = currentMarks.some(m => (typeof m === 'string' ? m : m?.key) === cellKey) ? currentMarks : [...currentMarks, cellKey];
  await updateTaskOnFirebase(task.id, { structure: { ...structure, status: 'needs_changes', notes, marks, reviewedAt: new Date().toISOString() } });
  showToast('تم إضافة الملاحظة وتعليم الخلية.');
}

async function addStructureCellNote(taskId, sheetName, rowIndex, colIndex, noteText = ''){
  if(noteText) return saveStructureCellNote(taskId, sheetName, rowIndex, colIndex, noteText);
  const cellEl = document.querySelector(`[data-structure-cell="${CSS.escape(String(taskId))}"][data-sheet-name="${CSS.escape(String(sheetName))}"][data-row-index="${CSS.escape(String(rowIndex))}"][data-col-index="${CSS.escape(String(colIndex))}"]`);
  openStructureCellNoteEditor(cellEl);
}

async function addStructureNote(taskId){
  const task = findTaskById(taskId);
  if(!task) return;
  const structure = taskStructure(task);
  const rows = Array.isArray(structure.parsedRows) ? structure.parsedRows : [];
  const rowText = prompt('اكتب رقم الصف/التاسك الذي تريد التعليق عليه:');
  if(rowText === null) return;
  const rowIndex = Math.max(0, Number(rowText || 1) - 1);
  const field = prompt('اسم البند أو الخلية:', 'ملاحظة') || 'ملاحظة';
  const note = prompt('اكتب ملاحظة الأدمن:');
  if(!note) return;
  const notes = [...(Array.isArray(structure.notes) ? structure.notes : []), { id: `note-${Date.now()}`, rowIndex: rows[rowIndex] ? rowIndex : 0, field, note, createdAt: new Date().toISOString(), createdBy: getCurrentUser().email || getCurrentUser().name || '' }];
  await updateTaskOnFirebase(task.id, { structure: { ...structure, status: 'needs_changes', notes, reviewedAt: new Date().toISOString() } });
}
async function setStructureStatus(taskId, status){
  const task = findTaskById(taskId);
  if(!task) return;
  const structure = taskStructure(task);
  await updateTaskOnFirebase(task.id, { structure: encodeStructureWorkbookForFirestore({ ...structure, status, reviewedAt: new Date().toISOString(), reviewedBy: getCurrentUser().email || getCurrentUser().name || '' }) });
  if(status === 'approved') showToast('تم اعتماد الهيكل. ابدأ توزيع تاسكات الهيكل.');
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
  return [...document.querySelectorAll('#creativeRows .creative-row-card')].flatMap(row => {
    const tasks = [...row.querySelectorAll('.creative-task-block')].map(block => {
      const section = block.querySelector('.js-task-section-select');
      const task = block.querySelector('.js-task-type');
      const userControl = block.querySelector('.js-task-user');
      return {
        contentSectionId: section?.value || '',
        contentSectionName: readSelectText(section),
        taskType: task?.value || '',
        quantity: 1,
        requiredDate: block.querySelector('.js-task-required-date')?.value || '',
        userIds: selectedOptionValues(userControl),
        userNames: selectedOptionTexts(userControl)
      };
    }).filter(item => item.contentSectionId || item.taskType || item.userIds.length);
    const selectedCreatives = selectedCreativeNames(row);
    const cars = selectedCarsFromRow(row);
    if(!selectedCreatives.length && !tasks.length && !cars.length) return [];
    const creativesToSave = selectedCreatives.length ? selectedCreatives : [''];
    return creativesToSave.map(creative => ({
      creative,
      tasks,
      product: creativeProductLabel(creative, row),
      selectedCars: cars
    })).filter(item => item.creative || item.tasks.length || item.product || item.selectedCars.length);
  });
}
function getCampaignProducts(){
  const designAndMontageOutputs = typeof getCampaignPublishOutputs === 'function' ? getCampaignPublishOutputs() : [];
  const manualProductOutputs = [...document.querySelectorAll('.js-product-output')].map(input => normalizeText(input.value)).filter(Boolean);
  return uniqueList([...designAndMontageOutputs, ...manualProductOutputs]);
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
  const groups = buildStockGroups().slice(0, 160);
  return groups.length ? groups.map(group => {
    const first = group.cars[0] || {};
    const value = first.id || first.vin || first.plate || group.key;
    const selected = selectedIds.includes(value) || group.cars.some(car => selectedIds.includes(car.id));
    const label = [group.carName, group.statement, group.exteriorColor, group.interiorColor].filter(Boolean).join(' - ');
    return `<label class="car-check-card"><input type="checkbox" class="js-car-checkbox" value="${escapeHtml(value)}" data-car-group="${escapeHtml(group.key)}"${selected ? ' checked' : ''}><span>${escapeHtml(label)}</span><small>${group.count} سيارة</small></label>`;
  }).join('') : '<div class="empty-state mini-empty">لا توجد سيارات متاحة من الاستوك.</div>';
}
function selectedCarsFromRow(row){
  if(!row?.querySelector('.js-enable-cars')?.checked) return [];
  return [...(row?.querySelectorAll('.js-car-checkbox:checked') || [])].map(input => {
    const groupKey = input.dataset.carGroup || '';
    const group = buildStockGroups().find(item => item.key === groupKey);
    if(group){
      return { id: input.value, groupKey, label: [group.carName, group.statement, group.exteriorColor, group.interiorColor].filter(Boolean).join(' - '), count: group.count };
    }
    const car = cars.find(item => item.id === input.value) || { id: input.value };
    return { id: input.value, label: carDisplayName(car) || input.value };
  });
}
function getCampaignPublishOutputs(){
  const outputs = [];
  document.querySelectorAll('#creativeRows .creative-row-card').forEach(row => {
    const creativeList = selectedCreativeNames(row);
    row.querySelectorAll('.creative-task-block').forEach(block => {
      const sectionName = normalizeText(readSelectText(block.querySelector('.js-task-section-select')));
      const taskName = normalizeText(block.querySelector('.js-task-type')?.value || '');
      const role = normalizeDepartmentRole(sectionName);
      if(!['design','montage'].includes(role)) return;
      (creativeList.length ? creativeList : ['']).forEach(creative => {
        const output = [creative, sectionName, taskName].filter(Boolean).join(' - ');
        if(output && !output.includes('اختار المحتوى')) outputs.push(output);
      });
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
function formatInputDate(date){
  if(!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  // نستخدم التاريخ المحلي بدل UTC عشان جدول النشر ماينقصش يوم بسبب فرق التوقيت.
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function todayInputDate(){
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0,10);
}
function ensureDefaultCampaignDate(){
  const input = document.querySelector('#campaignRequestForm input[name="campaign_date"]');
  if(input && !input.value) input.value = todayInputDate();
}
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
      caption: normalizeText(card.querySelector('.js-publish-caption')?.value),
      hashtagsText: normalizeText(card.querySelector('.js-publish-hashtags')?.value),
      note: ''
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
      <input type="hidden" class="js-publish-caption" value="${escapeHtml(prev.caption || '')}" />
      <input type="hidden" class="js-publish-hashtags" value="${escapeHtml(prev.hashtagsText || prev.hashtags || '')}" />
      <div class="publish-copy-buttons">
        <button type="button" class="mini-btn publish-copy-btn ${prev.caption ? 'filled' : ''}" data-publish-caption-btn>الكابشن${prev.caption ? ' ✓' : ''}</button>
        <button type="button" class="mini-btn publish-copy-btn ${prev.hashtagsText || prev.hashtags ? 'filled' : ''}" data-publish-hashtags-btn>الهاشتاج${prev.hashtagsText || prev.hashtags ? ' ✓' : ''}</button>
      </div>
      <div class="publish-inline-editor hidden" data-publish-inline-editor>
        <label><span data-publish-inline-title>الكابشن</span><textarea rows="4" data-publish-inline-text placeholder="اكتب هنا واحفظ"></textarea></label>
        <div class="publish-inline-actions">
          <button type="button" class="mini-btn" data-publish-inline-save>حفظ</button>
          <button type="button" class="mini-btn" data-publish-inline-cancel>إلغاء</button>
        </div>
      </div>
    </article>`);
  });
  wrap.innerHTML = `<div class="publish-calendar-head"><span>الأحد</span><span>الإثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span><span>السبت</span></div><div class="publish-calendar-grid">${cells.join('')}</div>`;
  updatePublishOutputAvailability();
}
function openPublishDayInlineEditor(card, kind){
  if(!card) return;
  const isCaption = kind === 'caption';
  const editor = card.querySelector('[data-publish-inline-editor]');
  const textarea = editor?.querySelector('[data-publish-inline-text]');
  const title = editor?.querySelector('[data-publish-inline-title]');
  const input = card.querySelector(isCaption ? '.js-publish-caption' : '.js-publish-hashtags');
  if(!editor || !textarea || !input) return;
  editor.dataset.kind = kind;
  if(title) title.textContent = isCaption ? 'الكابشن' : 'الهاشتاج';
  textarea.value = input.value || '';
  editor.classList.remove('hidden');
  setTimeout(() => textarea.focus(), 0);
}
function savePublishDayInlineEditor(editor){
  if(!editor) return;
  const card = editor.closest('.publish-day-card');
  const kind = editor.dataset.kind || 'caption';
  const isCaption = kind === 'caption';
  const textarea = editor.querySelector('[data-publish-inline-text]');
  const input = card?.querySelector(isCaption ? '.js-publish-caption' : '.js-publish-hashtags');
  const btn = card?.querySelector(isCaption ? '[data-publish-caption-btn]' : '[data-publish-hashtags-btn]');
  const clean = normalizeText(textarea?.value || '');
  if(input) input.value = clean;
  if(btn){
    btn.classList.toggle('filled', !!clean);
    btn.textContent = `${isCaption ? 'الكابشن' : 'الهاشتاج'}${clean ? ' ✓' : ''}`;
  }
  editor.classList.add('hidden');
  showToast(clean ? `تم حفظ ${isCaption ? 'الكابشن' : 'الهاشتاج'} لهذا اليوم.` : `تم مسح ${isCaption ? 'الكابشن' : 'الهاشتاج'} لهذا اليوم.`);
}
function cancelPublishDayInlineEditor(editor){
  if(editor) editor.classList.add('hidden');
}
function collectPublishRows(){
  return [...document.querySelectorAll('.publish-day-card')].map(card => ({
    date: card.dataset.date || '',
    day: card.querySelector('.publish-day-head strong')?.textContent || '',
    output: card.querySelector('.js-publish-output-select')?.value || '',
    platforms: selectedPlatformValues(card),
    platform: selectedPlatformValues(card).join('، '),
    time: '',
    caption: normalizeText(card.querySelector('.js-publish-caption')?.value),
    hashtagsText: normalizeText(card.querySelector('.js-publish-hashtags')?.value),
    hashtags: extractHashtags(`${card.querySelector('.js-publish-hashtags')?.value || ''} ${card.querySelector('.js-publish-caption')?.value || ''}`),
    note: ''
  })).filter(item => item.date || item.output || item.platform || item.caption || item.hashtagsText);
}
function budgetRowTotalFromCard(card){
  if(!card) return 0;
  const adsRaw = card.querySelector('.js-budget-ads-count')?.value;
  const adsCount = adsRaw === '' || adsRaw == null ? 1 : Number(adsRaw || 0);
  const value = Number(card.querySelector('.js-budget-value')?.value || 0);
  return Math.max(0, adsCount) * Math.max(0, value);
}
function updateBudgetGrandTotal(){
  const total = [...document.querySelectorAll('.budget-item-card')].reduce((sum, card) => sum + budgetRowTotalFromCard(card), 0);
  const holder = document.getElementById('budgetGrandTotalValue');
  if(holder) holder.textContent = total ? total.toLocaleString('en-US') : '0';
}
function collectBudgetRows(){
  return [...document.querySelectorAll('.budget-item-card')].map((card, index) => {
    const adsRaw = card.querySelector('.js-budget-ads-count')?.value;
    const adsCount = adsRaw === '' || adsRaw == null ? '' : Number(adsRaw || 0);
    const effectiveAdsCount = adsRaw === '' || adsRaw == null ? 1 : Number(adsRaw || 0);
    const value = Number(card.querySelector('.js-budget-value')?.value || 0);
    return {
      index: index + 1,
      funnel: card.querySelector('.js-funnel-select')?.value || '',
      newFunnel: normalizeText(card.querySelector('.js-new-funnel')?.value),
      product: card.querySelector('.js-product-select')?.value || '',
      platform: card.querySelector('.js-platform-select')?.value || '',
      publishDate: card.querySelector('.js-budget-publish-date')?.value || '',
      duration: normalizeText(card.querySelector('.js-budget-duration')?.value),
      adsCount,
      contentGoal: normalizeText(card.querySelector('.js-budget-content-goal')?.value),
      expectedGoal: normalizeText(card.querySelector('.js-budget-expected-goal')?.value),
      value,
      total: Math.max(0, effectiveAdsCount) * Math.max(0, value)
    };
  }).filter(item => item.funnel || item.newFunnel || item.product || item.platform || item.value || item.total);
}
async function saveCampaignToFirebase(){
  if(!mainDb){ showToast('اتصال Firebase غير متاح.'); return; }
  const request = getFormData(document.getElementById('campaignRequestForm'));
  // تاريخ بداية/نهاية النشر موجودين داخل publishSchedule، ومش بنحفظهم كحقول مستقلة عشان مايكسرش قواعد Firestore القديمة.
  delete request.publish_start_date;
  delete request.publish_end_date;
  const typeItem = campaignTypes.find(type => type.id === document.getElementById('campaignTypeSelect')?.value || type.name === document.getElementById('campaignTypeSelect')?.value);
  const campaignCode = document.getElementById('campaignCodeInput')?.value || '';
  const nextCampaignSerial = Number(typeItem?.nextNumber) || 1;
  const payload = {
    ...request,
    campaignCode,
    campaignCodeId: typeItem?.id || '',
    campaignTypeId: typeItem?.id || request.campaign_type_id || '',
    campaignCodePrefix: typeItem?.prefix || '',
    campaignCodeShortCode: typeItem?.code || '',
    campaignSerial: nextCampaignSerial,
    campaignType: typeItem?.name || request.campaign_type || '',
    campaign_type: typeItem?.name || request.campaign_type || '',
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
    if(typeItem?.id){
      await safeCollection(window.MZJ_CAMPAIGN_TYPES_COLLECTION).doc(typeItem.id).update({ nextNumber: nextCampaignSerial + 1, updatedAt: serverTime() });
    }
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
      <label class="field"><span>القيمة</span><input class="js-budget-value" type="number" min="0" step="0.01" /></label>
    </div>`;
  wrap.appendChild(card);
  refreshDynamicSelects();
  updateBudgetGrandTotal();
}
function bindCampaignBuilder(){
  const creativeRows = document.getElementById('creativeRows'); const budgetRows = document.getElementById('budgetRows');
  document.getElementById('addCreativeBtn')?.addEventListener('click', () => {
    clearEmptyRow(creativeRows);
    const card = document.createElement('article');
    card.className = 'creative-row-card compact-creative-row';
    card.innerHTML = `
      <div class="creative-row-head creative-two-line-head">
        <div class="creative-main-select creative-checkbox-picker"><span>الكريتيف</span><div class="creative-checkbox-grid">${creativeCheckboxList()}</div></div>
        <button class="delete-row" type="button" aria-label="حذف الصف">×</button>
      </div>
      <label class="creative-product-field product-under-creatives"><span>المنتجات</span><input class="product-output js-product-output" type="text" readonly aria-label="المنتجات" /></label>
      <label class="car-picker-enable"><input type="checkbox" class="js-enable-cars"> <span>اختيار سيارات من الاستوك</span></label><div class="car-picker-block is-hidden"><div class="car-picker-title">اختيار السيارات</div><div class="car-checkbox-grid">${carCheckboxList()}</div></div>
      <div class="creative-task-grid">
        ${taskBlockHtml(1)}${taskBlockHtml(2)}${taskBlockHtml(3)}${taskBlockHtml(4)}
      </div>`;
    creativeRows?.appendChild(card); refreshDynamicSelects(); renderPublishAgenda();
  });
  document.getElementById('campaignCodeSelect')?.addEventListener('change', generateCampaignCode);
  document.getElementById('campaignTypeSelect')?.addEventListener('change', generateCampaignCode);
  document.getElementById('refreshPublishAgendaBtn')?.addEventListener('click', renderPublishAgenda);
  document.getElementById('publishStartDate')?.addEventListener('change', renderPublishAgenda);
  document.getElementById('publishEndDate')?.addEventListener('change', renderPublishAgenda);
  document.getElementById('addBudgetRowBtn')?.addEventListener('click', addBudgetItem);
  document.addEventListener('click', event => {
    const toggle = event.target.closest('.multi-toggle');
    document.querySelectorAll('.multi-dropdown.open').forEach(el => { if(el !== toggle?.closest('.multi-dropdown')) el.classList.remove('open'); });
    if(toggle){ toggle.closest('.multi-dropdown')?.classList.toggle('open'); return; }
    if(!event.target.closest('.multi-dropdown')) document.querySelectorAll('.multi-dropdown.open').forEach(el => el.classList.remove('open'));
    const dateInput = event.target.closest('.pro-date-input, .js-task-required-date');
    if(dateInput && typeof dateInput.showPicker === 'function'){
      try{ dateInput.showPicker(); }catch(_){ }
    }
    const captionBtn = event.target.closest('[data-publish-caption-btn]');
    if(captionBtn){ openPublishDayInlineEditor(captionBtn.closest('.publish-day-card'), 'caption'); return; }
    const hashtagBtn = event.target.closest('[data-publish-hashtags-btn]');
    if(hashtagBtn){ openPublishDayInlineEditor(hashtagBtn.closest('.publish-day-card'), 'hashtags'); return; }
    const inlineSave = event.target.closest('[data-publish-inline-save]');
    if(inlineSave){ savePublishDayInlineEditor(inlineSave.closest('[data-publish-inline-editor]')); return; }
    const inlineCancel = event.target.closest('[data-publish-inline-cancel]');
    if(inlineCancel){ cancelPublishDayInlineEditor(inlineCancel.closest('[data-publish-inline-editor]')); return; }
    const btn = event.target.closest('.delete-row');
    if(btn){ const container = document.getElementById('creativeRows'); btn.closest('.creative-row-card')?.remove(); restoreEmptyRow(container, 1, 'ابدأ بإضافة صف كريتيف للحملة.'); renderPublishAgenda(); refreshDynamicSelects(); return; }
    const budgetDel = event.target.closest('.delete-budget-row');
    if(budgetDel){ budgetDel.closest('.budget-item-card')?.remove(); if(budgetRows && !budgetRows.querySelector('.budget-item-card')) budgetRows.innerHTML = '<div class="empty-state">لا توجد بنود ميزانية.</div>'; updateBudgetGrandTotal(); }
  });
  document.addEventListener('dblclick', async event => {
    const structureCell = event.target.closest('[data-structure-cell]');
    if(structureCell){
      if(structureCell.classList.contains('protected-structure-title')) return;
      event.preventDefault();
      event.stopPropagation();
      openStructureCellNoteEditor(structureCell);
    }
  });

  document.addEventListener('input', event => {
    if(event.target.matches('.js-budget-ads-count,.js-budget-value')) updateBudgetGrandTotal();
    if(event.target.closest('#stockAdvancedFilters')) renderStock();
  });
  document.addEventListener('focusin', event => {
    if(event.target.matches('.pro-date-input, .js-task-required-date') && typeof event.target.showPicker === 'function'){
      try{ event.target.showPicker(); }catch(_){ }
    }
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
    if(event.target.matches('.js-task-user-checkbox,.js-task-user,.js-car-checkbox,.js-creative-check')){ updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); refreshDynamicSelects(); return; }
    if(event.target.matches('.js-budget-ads-count,.js-budget-value')){ updateBudgetGrandTotal(); return; }
    if(event.target.matches('.js-publish-output-select')){ updatePublishOutputAvailability(); return; }
    if(event.target.closest('#stockAdvancedFilters')){ renderStock(); return; }
    if(event.target.matches('.js-platform-checkbox')){ return; }
    if(event.target.matches('.js-creative-select,.js-creative-check,.js-task-type,.js-task-required-date')){ updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); refreshDynamicSelects(); }
  });
  document.getElementById('resetCampaignBuilder')?.addEventListener('click', () => { document.getElementById('campaignRequestForm')?.reset(); if(creativeRows) creativeRows.innerHTML = '<div class="empty-state">ابدأ بإضافة صف كريتيف للحملة.</div>'; const agenda = document.getElementById('publishAgenda'); if(agenda) agenda.innerHTML = '<div class="empty-state">حدد بداية ونهاية النشر ثم اختر كريتيفات ومخرجات التصميم والمونتاج.</div>'; if(budgetRows) budgetRows.innerHTML = '<div class="empty-state">لا توجد بنود ميزانية.</div>'; updateBudgetGrandTotal(); generateCampaignCode(); });
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
  document.getElementById('campaignTypeForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const id = document.getElementById('campaignTypeEditId')?.value;
    const name = normalizeText(document.getElementById('campaignTypeName')?.value);
    const code = normalizeText(document.getElementById('campaignTypeCode')?.value).toUpperCase();
    const prefix = normalizeText(document.getElementById('campaignTypePrefix')?.value).toUpperCase() || 'MZJ';
    if(!name || !code) return;
    if(!mainDb){ showMessage('campaignTypeMessage', 'اتصال Firebase غير متاح.'); return; }
    try{
      const oldItem = campaignTypes.find(item => item.id === id);
      const payload = { name, code, prefix, nextNumber: Number(oldItem?.nextNumber) || 1, updatedAt: serverTime() };
      if(id) await safeCollection(window.MZJ_CAMPAIGN_TYPES_COLLECTION).doc(id).update(payload);
      else await safeCollection(window.MZJ_CAMPAIGN_TYPES_COLLECTION).add({ ...payload, createdAt: serverTime() });
      event.target.reset(); document.getElementById('campaignTypePrefix').value = 'MZJ'; resetForm(['campaignTypeEditId']); showMessage('campaignTypeMessage', 'تم حفظ نوع الحملة والكود.');
    }catch(error){ console.error(error); showMessage('campaignTypeMessage', 'تعذر حفظ نوع الحملة والكود.'); }
  });
  bindNamedForm('platformForm', 'platformEditId', 'platformName', 'platformMessage', window.MZJ_PLATFORMS_COLLECTION, 'تم حفظ المنصة.');
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
    const ctEdit = event.target.closest('[data-edit-campaign-type]'); if(ctEdit){ const item = campaignTypes.find(x => x.id === ctEdit.dataset.editCampaignType); if(item){ document.getElementById('campaignTypeEditId').value = item.id; document.getElementById('campaignTypeName').value = item.name || ''; document.getElementById('campaignTypeCode').value = item.code || ''; document.getElementById('campaignTypePrefix').value = item.prefix || 'MZJ'; } return; }
    const ctDel = event.target.closest('[data-delete-campaign-type]'); if(ctDel){ await deleteDoc('campaignType', ctDel.dataset.deleteCampaignType); return; }
    const pEdit = event.target.closest('[data-edit-platform]'); if(pEdit){ const item = platforms.find(x => x.id === pEdit.dataset.editPlatform); if(item){ document.getElementById('platformEditId').value = item.id; document.getElementById('platformName').value = item.name; } return; }
    const pDel = event.target.closest('[data-delete-platform]'); if(pDel){ await deleteDoc('platform', pDel.dataset.deletePlatform); return; }
    const csEdit = event.target.closest('[data-edit-content-section]'); if(csEdit){ const item = contentSections.find(x => x.id === csEdit.dataset.editContentSection); if(item){ document.getElementById('contentSectionEditId').value = item.id; document.getElementById('contentSectionName').value = item.name; document.getElementById('contentSectionTypes').value = (item.types || []).join('\n'); } return; }
    const csDel = event.target.closest('[data-delete-content-section]'); if(csDel){ await deleteDoc('contentSection', csDel.dataset.deleteContentSection); }
  });
  document.getElementById('cancelDepartmentEdit')?.addEventListener('click', () => { document.getElementById('departmentForm')?.reset(); resetForm(['departmentEditId']); refreshDynamicSelects(); });
  document.getElementById('cancelCreativeEdit')?.addEventListener('click', () => { document.getElementById('creativeForm')?.reset(); resetForm(['creativeEditId']); });
  document.getElementById('cancelTaskTypeEdit')?.addEventListener('click', () => { document.getElementById('taskTypeForm')?.reset(); resetForm(['taskTypeEditId']); });
  document.getElementById('cancelCampaignTypeEdit')?.addEventListener('click', () => { document.getElementById('campaignTypeForm')?.reset(); document.getElementById('campaignTypePrefix').value = 'MZJ'; resetForm(['campaignTypeEditId']); });
  document.getElementById('cancelPlatformEdit')?.addEventListener('click', () => { document.getElementById('platformForm')?.reset(); resetForm(['platformEditId']); });
  document.getElementById('cancelContentSectionEdit')?.addEventListener('click', () => { document.getElementById('contentSectionForm')?.reset(); resetForm(['contentSectionEditId']); });
  document.getElementById('refreshDepartmentsBtn')?.addEventListener('click', () => { renderDepartments(); renderCreatives(); renderTaskTypes(); renderCampaignTypes(); renderContentSections(); });
  document.getElementById('refreshStockBtn')?.addEventListener('click', renderStock);
  document.getElementById('exportStockExcelBtn')?.addEventListener('click', exportStockRowsToExcel);
  document.getElementById('clearStockFiltersBtn')?.addEventListener('click', clearStockFilters);
  document.getElementById('stockFilterMode')?.addEventListener('change', event => { stockFilterMode = event.target.value || 'all'; renderStock(); });
  document.addEventListener('click', event => {
    const card = event.target.closest('[data-stock-filter-card]');
    if(!card) return;
    stockFilterMode = card.dataset.stockFilterCard || 'all';
    const select = document.getElementById('stockFilterMode');
    if(select) select.value = stockFilterMode;
    renderStock();
  });
  document.addEventListener('change', async event => {
    const select = event.target.closest('[data-stock-shot]');
    if(!select) return;
    if(select.dataset.handlingStockShot === '1') return;
    select.dataset.handlingStockShot = '1';
    try{ await handleStockShotSelectChange(select); }
    finally{ setTimeout(() => { delete select.dataset.handlingStockShot; }, 0); }
  }, true);
  document.addEventListener('input', async event => {
    const select = event.target.closest('[data-stock-shot]');
    if(!select) return;
    await handleStockShotSelectChange(select);
  }, true);
  document.addEventListener('click', event => {
    const btn = event.target.closest('[data-stock-usage]');
    if(!btn) return;
    showStockUsageModal(btn.dataset.stockUsage || '');
  });
  document.addEventListener('click', event => {
    if(event.target.closest('[data-close-stock-usage]')) document.getElementById('stockUsageModal')?.classList.remove('show');
  });
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
  const campaignEntries = publishEntriesFromCampaigns().map(entry => ({...entry, calendarTitle: entry.output || 'حملة', calendarMeta: [entry.platform, entry.time, entry.campaignName].filter(Boolean).join(' · ')}));
  const centerEntries = publishCenterSocialItems().filter(item => item.scheduleDate).map(item => ({
    ...item,
    date: item.scheduleDate,
    time: item.scheduleTime,
    calendarTitle: `${postTypeLabel(item.type || 'post')} · ${item.sourceLabel || 'نشر'}`,
    calendarMeta: [(item.platforms || []).map(p => socialPlatformLabels[p] || p).join(' + '), item.scheduleTime || 'بدون وقت', item.status].filter(Boolean).join(' · ')
  }));
  const entries = [...campaignEntries, ...centerEntries];
  const byDate = entries.reduce((acc, entry) => { (acc[entry.date] ||= []).push(entry); return acc; }, {});
  const cells = [];
  for(let i = 0; i < first.getDay(); i += 1) cells.push('<article class="calendar-day empty"></article>');
  for(let d = 1; d <= last.getDate(); d += 1){
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const date = new Date(year, month, d);
    const dayEntries = byDate[iso] || [];
    cells.push(`<article class="calendar-day"><div class="calendar-day-top"><span>${date.toLocaleDateString('ar-SA',{weekday:'long'})}</span><strong>${d}</strong></div><small>${iso}</small><div class="calendar-day-items">${dayEntries.length ? dayEntries.map(item => `<div class="calendar-publish-item"><b>${escapeHtml(item.calendarTitle || item.output || 'نشر')}</b><span>${escapeHtml(item.calendarMeta || [item.platform, item.time, item.campaignName].filter(Boolean).join(' · '))}</span></div>`).join('') : ''}</div></article>`);
  }
  board.innerHTML = `<div class="calendar-week-head"><span>الأحد</span><span>الإثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span><span>السبت</span></div><div class="calendar-month-grid">${cells.join('')}</div>`;
}
function taskDelayDays(task){
  const campaign = campaignForTask(task);
  const required = parseDateForDelay(taskRequiredDate(task, campaign));
  if(!required || taskProgress(task) >= 100) return 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  required.setHours(0,0,0,0);
  const diff = Math.ceil((today - required) / (24 * 60 * 60 * 1000));
  return diff > 0 ? diff : 0;
}
function taskWorkflowStatus(task){
  const progress = taskProgress(task);
  const raw = normalizeStatus(task.status || task.taskStatus || task.state || '');
  const structure = taskStructure(task);
  if(raw.includes('rejected') || raw.includes('مرفوض')) return 'rejected';
  if(raw.includes('needs') || raw.includes('changes') || raw.includes('تعديل') || structure.status === 'needs_changes') return 'needs_changes';
  if(progress >= 100 || raw.includes('done') || raw.includes('complete') || raw.includes('approved') || raw.includes('معتمد')) return 'approved';
  const steps = Array.isArray(task.steps) ? task.steps : [];
  const waitingAdmin = steps.some((step, index) => step.adminOnly && !step.done && steps.slice(0, index).every(prev => prev.done));
  if(waitingAdmin || raw.includes('review') || raw.includes('مراجعة')) return 'review';
  if(task.received || task.receivedConfirmed || progress > 0 || raw.includes('progress') || raw.includes('received')) return 'active';
  return 'waiting';
}
function statusLabelFromKey(key){
  return { waiting:'قائمة الانتظار', active:'نشطة', review:'بانتظار المراجعة', needs_changes:'مطلوبة تعديل', approved:'معتمدة', rejected:'مرفوضة' }[key] || key;
}
function averageProgress(list){
  if(!list.length) return 0;
  return Math.round(list.reduce((sum, item) => sum + taskProgress(item), 0) / list.length);
}
function renderTasksPage(){
  const board = document.getElementById('tasksBoard'); if(!board) return;
  const isAdmin = isCurrentUserAdmin();
  const tasks = isAdmin ? campaigns.flatMap(campaign => tasksForCampaign(campaign)) : getVisibleTasksForCurrentUser();
  const activeCampaigns = campaigns.filter(campaign => normalizeStatus(campaign.status || '').includes('archived') === false);
  const counts = tasks.reduce((acc, task) => { const key = taskWorkflowStatus(task); acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  const delayedTasks = tasks.filter(task => taskDelayDays(task) > 0);
  const employeeMap = {};
  tasks.forEach(task => { const owner = taskOwnerName(task); (employeeMap[owner] ||= []).push(task); });
  const deptMap = {};
  tasks.forEach(task => {
    const dept = taskDepartmentLabel(task);
    if(dept && dept !== 'قسم' && dept !== 'غير محدد') (deptMap[dept] ||= []).push(task);
  });
  const campaignRows = campaigns.map(campaign => { const list = tasksForCampaign(campaign); return { campaign, tasks:list, progress:averageProgress(list) }; }).filter(item => item.tasks.length);
  const metric = (label, value, hint = '', tone = '') => `<article class="monitor-metric ${tone}"><span>${label}</span><strong>${value}</strong>${hint ? `<small>${escapeHtml(hint)}</small>` : ''}</article>`;
  const bar = (label, value, total) => { const pct = total ? Math.round((value / total) * 100) : 0; return `<div class="monitor-bar-row"><div><b>${escapeHtml(label)}</b><span>${value} تاسك</span></div><div class="monitor-bar"><i style="width:${Math.min(100,pct)}%"></i></div></div>`; };
  const progressRow = (label, pct, meta = '') => `<div class="monitor-progress-row"><div><b>${escapeHtml(label)}</b><span>${escapeHtml(meta)}</span></div><strong>${pct}%</strong><div class="task-card-progress"><span style="width:${Math.min(100,pct)}%"></span></div></div>`;
  const employeeDelayRows = Object.entries(employeeMap).map(([name, list]) => ({ name, late:list.filter(task => taskDelayDays(task) > 0).length, days:list.reduce((sum, task) => sum + taskDelayDays(task), 0), total:list.length, progress:averageProgress(list) })).sort((a,b) => b.days - a.days || b.late - a.late);
  const delayedRows = delayedTasks.sort((a,b) => taskDelayDays(b) - taskDelayDays(a)).slice(0, 20);
  const statusKeys = ['waiting','active'];
  const totalDone = (counts.approved || 0) + (counts.rejected || 0);
  if(totalDone) statusKeys.push('approved');
  const dashboardSubtitle = `${activeCampaigns.length} حملة نشطة · ${tasks.length} تاسك · ${delayedTasks.length} متأخر`;
  board.innerHTML = `<section class="monitor-page professional-monitor">
    <div class="monitor-action-strip"><span>📊 متابعة مباشرة</span><span>آخر تحديث: ${escapeHtml(formatDateShort(new Date()))}</span><span>${isAdmin ? 'رؤية أدمن كاملة' : 'رؤية حسب صلاحياتك'}</span></div>
    <div class="monitor-hero-card">
      <div><p>نظرة عامة</p><h2>متابعة الحملات والتاسكات</h2><span>${escapeHtml(dashboardSubtitle)}</span></div>
      <strong>${averageProgress(tasks)}%</strong>
    </div>
    <div class="monitor-metrics compact-metrics">
      ${metric('إجمالي الحملات', campaigns.length, `${activeCampaigns.length} نشطة`, 'tone-campaigns')}
      ${metric('إجمالي التاسكات', tasks.length, 'كل التاسكات المسندة', 'tone-tasks')}
      ${metric('التاسكات المتأخرة', delayedTasks.length, 'حسب موعد التسليم', 'tone-late')}
      ${metric('التاسكات في قائمة الانتظار', counts.waiting || 0, 'لم تبدأ بعد', 'tone-waiting')}
      ${metric('التاسكات النشطة', counts.active || 0, 'قيد التنفيذ', 'tone-active')}
    </div>
    <div class="monitor-grid professional-grid">
      <section class="monitor-panel"><h2>عدد التاسكات في كل حالة</h2>${statusKeys.map(key => bar(statusLabelFromKey(key), key === 'approved' ? totalDone : (counts[key] || 0), tasks.length)).join('') || '<div class="empty-state mini-empty">لا توجد بيانات.</div>'}</section>
      <section class="monitor-panel"><h2>التاسكات المتأخرة</h2>${delayedRows.length ? delayedRows.map(task => `<article class="monitor-task-row"><div><b>${shortTaskName(task)}</b><span>${escapeHtml(task.campaignName || '')} · ${taskOwnerName(task)}</span></div><strong>${taskDelayDays(task)} يوم</strong></article>`).join('') : '<div class="empty-state mini-empty">لا توجد تاسكات متأخرة.</div>'}</section>
      <section class="monitor-panel"><h2>التأخير عند كل موظف</h2>${employeeDelayRows.length ? employeeDelayRows.map(row => `<article class="monitor-task-row"><div><b>${escapeHtml(row.name)}</b><span>${row.late} متأخر من ${row.total} تاسك</span></div><strong>${row.days} يوم</strong></article>`).join('') : '<div class="empty-state mini-empty">لا توجد بيانات موظفين.</div>'}</section>
      <section class="monitor-panel"><h2>نسبة اكتمال كل حملة</h2>${campaignRows.length ? campaignRows.map(item => progressRow(item.campaign.campaignName || item.campaign.name || item.campaign.campaignCode || 'حملة', item.progress, `${item.tasks.length} تاسك`)).join('') : '<div class="empty-state mini-empty">لا توجد حملات.</div>'}</section>
      <section class="monitor-panel"><h2>أداء كل قسم</h2>${Object.entries(deptMap).length ? Object.entries(deptMap).map(([name, list]) => progressRow(name, averageProgress(list), `${list.length} تاسك`)).join('') : '<div class="empty-state mini-empty">لا توجد بيانات أقسام.</div>'}</section>
      <section class="monitor-panel"><h2>أداء كل موظف</h2>${employeeDelayRows.length ? employeeDelayRows.map(row => progressRow(row.name, row.progress, `${row.total} تاسك / تأخير ${row.days} يوم`)).join('') : '<div class="empty-state mini-empty">لا توجد بيانات موظفين.</div>'}</section>
    </div>
  </section>`;
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
  const no = structureTaskNumber(task);
  const isCampaignWriting = typeof isCampaignContentWritingTask === 'function' && isCampaignContentWritingTask(task);
  const name = isCampaignWriting ? 'كتابة محتوى حملة' : normalizeText(task.structureTaskLabel || task.creative || task.taskType || task.product || 'تاسك');
  return escapeHtml(no && !name.includes(no) && !isCampaignWriting ? `${no} - ${name}` : name);
}
function receivedLabel(task){ return task.received || task.receivedConfirmed ? 'تم الاستلام' : 'لم يستلم'; }
function receivedClass(task){ return task.received || task.receivedConfirmed ? 'is-done' : 'is-waiting'; }
function taskOwnerName(task){ return escapeHtml(task.assignedToName || task.assigneeName || task.userName || 'بدون مسؤول'); }
function campaignTasksSnapshot(campaign){
  const related = adminDashboardTasksForCampaign(campaign);
  const received = related.filter(task => task.received || task.receivedConfirmed).length;
  const progress = campaignRequiredProgressFromTasks(related);
  const publish = campaignPublishProgress(campaign);
  return { related, received, progress, publish, total: related.length };
}

function renderUserDashboard(){
  const board = document.getElementById('adminDashboardBoard');
  if(!board) return;
  setDashboardMode('user');
  applyEffectiveTheme();
  const myTasks = getVisibleTasksForCurrentUser();
  const activeTasks = myTasks.filter(task => taskProgress(task) < 100);
  const completedTasks = myTasks.filter(task => taskProgress(task) >= 100);
  const received = activeTasks.filter(task => task.received || task.receivedConfirmed).length;
  const done = completedTasks.length;
  const buildGroups = tasks => {
    const groupMap = {};
    tasks.forEach(task => {
      const key = taskContentType(task);
      if(!groupMap[key]) groupMap[key] = [];
      groupMap[key].push(task);
    });
    return Object.entries(groupMap).map(([label, tasks]) => ({ label, tasks }));
  };
  const groups = buildGroups(activeTasks);
  const completedGroups = buildGroups(completedTasks);
  const taskCard = (task, completed = false) => `<article class="content-task-card ${completed ? 'completed' : ''}">
    <h3>${escapeHtml(task.campaignName || 'حملة')}</h3>
    <p>${shortTaskName(task)}</p>
    <div class="content-task-actions"><button type="button" class="btn btn-light" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(task.campaignId || '')}">تفاصيل</button>${completed ? `<span class="btn btn-light done static-chip">مكتمل 100%</span>` : `<button type="button" class="btn btn-light ${task.received || task.receivedConfirmed ? 'done' : ''}" data-toggle-received="${escapeHtml(task.id)}">تم الاستلام</button>`}</div>
    <div class="task-metric-row"><span>نسبة الإنجاز</span><b>${taskProgress(task)}%</b></div>
    <div class="task-metric-row"><span>حالة التاسك</span><b>${completed ? 'مكتمل' : (task.received || task.receivedConfirmed ? 'مستلم' : 'قيد التنفيذ')}</b></div>
    <div class="task-card-progress"><span style="width:${Math.min(100,taskProgress(task))}%"></span></div>
  </article>`;
  const renderGroups = (items, completed = false) => items.length ? `<div class="content-type-board">${items.map(group => `<section class="content-type-col"><div class="content-type-title"><h3>${escapeHtml(group.label)}</h3><span>${group.tasks.length} تاسك</span></div><div class="content-type-list">${group.tasks.map(task => taskCard(task, completed)).join('')}</div></section>`).join('')}</div>` : '';
  board.innerHTML = `<section class="user-content-dashboard user-content-dashboard-clean">
    <div class="user-dashboard-toolbar user-dashboard-toolbar-clean">
      <div class="user-theme-panel user-theme-panel-floating">
        <label class="user-theme-upload"><input type="file" accept="image/*" id="userThemeImageInput"><span>صورة مرجع الثيم</span></label>
        <button class="mini-btn" type="button" id="clearUserThemeBtn">استرجاع الثيم الافتراضي</button>
        <button type="button" class="mini-btn" id="toggleCompletedTasksBtn" data-open="0" data-count="${done}">عرض التاسكات المنتهية (${done})</button>
      </div>
    </div>
    <div class="user-pro-hero user-pro-hero-clean"><div><span class="pro-kicker">MZJ Workspace</span><h2>أهلاً ${escapeHtml(getCurrentUserIdentity().name || 'بيك')}</h2><p>تاسكاتك الحالية حسب نوع المحتوى والحملات المسندة لك فقط.</p></div><div class="exec-stats"><span>📌 ${activeTasks.length} تاسك</span><span>✅ ${received} مستلم</span><span>🏁 ${done} مكتمل</span></div></div>
    ${renderGroups(groups, false)}
    <section class="completed-tasks-panel" id="completedTasksPanel" hidden>
      <div class="completed-tasks-head"><h3>التاسكات المنتهية</h3><span>${done} تاسك مكتمل</span></div>
      ${renderGroups(completedGroups, true) || '<div class="dashboard-empty-note dashboard-empty-note-inline">لا توجد تاسكات منتهية حالياً.</div>'}
    </section>
  </section>`;
  applyEffectiveTheme();
}

function renderAdminDashboard(){
  const allTasks = campaigns.flatMap(campaign => adminDashboardTasksForCampaign(campaign));
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
    <div class="receive-list">${item.related.map(task => `<div><span><b>${shortTaskName(task)}</b><em>${taskOwnerName(task)}</em></span><b class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</b></div>`).join('')}</div>
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
    ${renderProDashboardHero(allTasks)}
    <section class="admin-dash-col receive-col"><div class="col-title"><h2>TASK - المطلوب</h2><p>متابعة ضغط اليوزرات على تم الاستلام فقط.</p></div>${requiredItems.length ? requiredItems.map(requiredCard).join('') : '<div class="empty-state soft-empty">كل المطلوب تم استلامه حالياً.</div>'}</section>
    <section class="admin-dash-col ready-col"><div class="col-title"><h2>جاهزية المطلوب</h2><p>اضغط على حملة لفتح التاسكات بنظام كانبان.</p></div>${readinessItems.length ? readinessItems.map(readinessCard).join('') : '<div class="empty-state soft-empty">لا توجد حملات قيد التجهيز.</div>'}</section>
    <section class="admin-dash-col publish-col"><div class="col-title"><h2>قسم النشر</h2><p>تظهر هنا بعد اكتمال جاهزية المطلوب.</p></div>${publishItems.length ? publishItems.map(publishCard).join('') : '<div class="empty-state soft-empty">لا توجد حملات جاهزة للنشر.</div>'}</section>
    <section class="admin-dash-col archive-col"><div class="col-title"><h2>قسم الأرشيف</h2><p>بعد اكتمال النشر، تصبح جاهزة للأرشفة.</p></div>${archiveItems.length ? archiveItems.map(archiveCard).join('') : '<div class="empty-state soft-empty">لا توجد حملات مؤرشفة حالياً.</div>'}</section>`;
}


function renderCampaignInlineTasks(campaign){
  const related = adminDashboardTasksForCampaign(campaign);
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
  const related = adminDashboardTasksForCampaign(campaign);
  const snap = campaignTasksSnapshot(campaign);
  const taskItem = task => `<article class="campaign-task-list-item">
    <div class="task-list-main"><strong>${shortTaskName(task)}</strong><p>${escapeHtml([task.contentSectionName, task.taskType, taskOwnerName(task)].filter(Boolean).join(' / ') || 'بدون بيانات')}</p></div>
    <div class="task-list-state"><span>${taskProgress(task)}%</span><b class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</b></div>
    <button type="button" class="mini-btn" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(campaign.id || task.campaignId || '')}">تفاصيل</button>
  </article>`;
  const grouped = groupTasksForKanban(related);
  detail.classList.add('show');
  detail.innerHTML = `<div class="detail-head clean-detail-head"><div><h2>${shortCampaignTitle(campaign)}</h2><p>${escapeHtml(campaignCodeText(campaign))}</p></div><button type="button" class="mini-btn" id="closeDashboardDetail">إغلاق</button></div>
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

function campaignEndDate(campaign){
  return campaign.publishSchedule?.slice?.(-1)?.[0]?.date || campaign.campaignEndDate || campaign.endDate || '';
}
function campaignTasksByContent(campaign){
  return tasksForCampaign(campaign).reduce((acc, task) => {
    const key = taskContentType(task) || task.contentSectionName || 'أخرى';
    acc[key] = acc[key] || [];
    acc[key].push(task);
    return acc;
  }, {});
}
function taskRawDateValue(value){
  if(!value) return '';
  if(value.toDate) return value.toDate();
  return value;
}
function taskDateFromKeys(source, keys){
  for(const key of keys){
    const value = source && source[key];
    if(value) return value;
  }
  return '';
}
function parseDateForDelay(value){
  if(!value) return null;
  try{
    const raw = taskRawDateValue(value);
    const date = raw instanceof Date ? raw : new Date(raw);
    if(Number.isNaN(date.getTime())) return null;
    return date;
  }catch(_){ return null; }
}
function diffDays(deliveryDate, requiredDate){
  const delivered = parseDateForDelay(deliveryDate);
  const required = parseDateForDelay(requiredDate);
  if(!delivered || !required) return '';
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.ceil((delivered.setHours(0,0,0,0) - required.setHours(0,0,0,0)) / oneDay);
}
function taskRequiredDate(task, campaign){
  return taskDateFromKeys(task, ['requiredDate','dueDate','deadline','deliveryDeadline','targetDate','publishDate']) ||
    taskDateFromKeys(campaign, ['structure_deadline','campaignEndDate','endDate','publishEndDate','requiredDate']) ||
    campaignEndDate(campaign) || '';
}
function taskReceivedDate(task){
  return taskDateFromKeys(task, ['receivedAt','receivedDate','receivedOn']);
}
function taskDeliveredDate(task){
  return taskDateFromKeys(task, ['deliveredAt','deliveryAt','completedAt','finishedAt','submittedAt']) || (taskProgress(task) >= 100 ? taskDateFromKeys(task, ['updatedAt']) : '');
}
function taskMatchesDatabaseDepartment(task, role, words){
  const text = identityClean([task.contentSectionName, task.assignedDepartmentName, task.departmentRole, taskContentType(task)].filter(Boolean).join(' '));
  if(role && (task.departmentRole === role || normalizeDepartmentRole(text) === role)) return true;
  return (words || []).some(word => text.includes(identityClean(word)));
}
function rawTaskOwnerName(task){
  return normalizeText(task.assignedToName || task.assigneeName || task.userName || 'بدون مسؤول');
}
function taskOwnerKey(task){
  return normalizeText(task.assignedToUid || task.assignedToId || task.userUid || task.userId || task.assignedToEmail || task.userEmail || rawTaskOwnerName(task));
}
function latestTaskDate(tasks, picker){
  const dates = tasks.map(picker).map(taskRawDateValue).map(value => value ? new Date(value) : null).filter(date => date && !Number.isNaN(date.getTime()));
  if(!dates.length) return '';
  return new Date(Math.max(...dates.map(date => date.getTime())));
}
function earliestTaskDate(tasks, picker){
  const dates = tasks.map(picker).map(taskRawDateValue).map(value => value ? new Date(value) : null).filter(date => date && !Number.isNaN(date.getTime()));
  if(!dates.length) return '';
  return new Date(Math.min(...dates.map(date => date.getTime())));
}
function isTaskDelayed(task, campaign){
  const required = parseDateForDelay(taskRequiredDate(task, campaign));
  if(!required || taskProgress(task) >= 100) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  required.setHours(0,0,0,0);
  return required < today;
}
function delayDaysUntilToday(task, campaign){
  if(!isTaskDelayed(task, campaign)) return 0;
  const required = parseDateForDelay(taskRequiredDate(task, campaign));
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  today.setHours(0,0,0,0);
  required.setHours(0,0,0,0);
  return Math.max(0, Math.ceil((today - required) / oneDay));
}
function databaseDepartmentCell(campaign, role, words){
  const campaignTasks = tasksForCampaign(campaign);
  const departmentList = campaignTasks.filter(task => taskMatchesDatabaseDepartment(task, role, words));
  if(!departmentList.length) return '<span class="muted-db-cell">—</span>';

  // الكارت الصغير يحدد المسؤول من القسم الحالي، لكن الأرقام لازم تتحسب من نفس القائمة
  // التي تظهر عند الضغط على "عرض التاسكات"؛ أي كل تاسكات هذا المسؤول داخل الحملة.
  const ownerKeys = uniqueList(departmentList.map(task => taskOwnerKey(task)).filter(Boolean));
  const grouped = ownerKeys.reduce((acc, key) => {
    const ownerTasks = campaignTasks.filter(task => taskOwnerKey(task) === key);
    if(ownerTasks.length) acc[key] = { owner: rawTaskOwnerName(ownerTasks[0]), tasks: ownerTasks };
    return acc;
  }, {});

  return `<div class="db-department-stack">${Object.values(grouped).map(group => {
    const total = group.tasks.length;
    const notStarted = group.tasks.filter(task => !(task.received || task.receivedConfirmed)).length;
    const active = group.tasks.filter(task => (task.received || task.receivedConfirmed) && taskProgress(task) < 100).length;
    const delayed = group.tasks.filter(task => isTaskDelayed(task, campaign)).length;
    const maxDelay = Math.max(0, ...group.tasks.map(task => delayDaysUntilToday(task, campaign)));
    const latestReceived = latestTaskDate(group.tasks, task => taskReceivedDate(task));
    const nearestRequired = earliestTaskDate(group.tasks.filter(task => taskProgress(task) < 100), task => taskRequiredDate(task, campaign));
    return `<div class="db-department-mini db-owner-summary">
      <span>اسم المسئول / <b>${escapeHtml(group.owner)}</b></span>
      <span>عدد التاسكات / <b>${total}</b></span>
      <span>لم تبدأ / <b>${notStarted}</b></span>
      <span>نشطة / <b>${active}</b></span>
      <span>متأخرة / <b>${delayed}</b></span>
      <span>أقرب تاريخ مطلوب / <b>${formatDateShort(nearestRequired)}</b></span>
      <span>آخر تاريخ استلام / <b>${formatDateShort(latestReceived)}</b></span>
      <span>أطول تأخير / <b>${maxDelay ? `${maxDelay} يوم` : '—'}</b></span>
      <button type="button" class="mini-btn owner-tasks-btn" data-view-owner-tasks="${escapeHtml(campaign.id || '')}" data-owner-key="${escapeHtml(taskOwnerKey(group.tasks[0]) || '')}">عرض التاسكات</button>
    </div>`;
  }).join('')}</div>`;
}
function roleCountForCampaign(campaign, role){
  return tasksForCampaign(campaign).filter(task => normalizeDepartmentRole(taskContentType(task) || task.assignedDepartmentName || '') === role || task.departmentRole === role).length;
}
function renderDatabasePage(){
  const body = document.getElementById('databaseCampaignRows');
  if(!body) return;
  if(!campaigns.length){ body.innerHTML = '<tr><td colspan="15">لا توجد حملات محفوظة.</td></tr>'; return; }
  body.innerHTML = campaigns.map((campaign, index) => {
    const cDate = campaign.campaign_date || campaign.createdAt || '';
    return `<tr>
      <td>${index + 1}</td>
      <td>${formatDateShort(cDate)}</td>
      <td>${escapeHtml(campaignCodeText(campaign))}</td>
      <td>${escapeHtml(campaign.campaignName || campaign.name || campaign.campaign_name || '')}</td>
      <td>${escapeHtml(campaign.campaignType || campaign.campaign_type || '')}</td>
      <td>${escapeHtml(campaign.campaign_goal || campaign.campaignGoal || '')}</td>
      <td>${formatDateShort(campaign.campaign_date || campaign.startDate || '')}</td>
      <td>${formatDateShort(campaignEndDate(campaign))}</td>
      <td class="db-department-cell">${databaseDepartmentCell(campaign,'shooting',['التصوير','تصوير','الايديت'])}</td>
      <td class="db-department-cell">${databaseDepartmentCell(campaign,'content',['المحتوى','المحتوي','كتابة'])}</td>
      <td class="db-department-cell">${databaseDepartmentCell(campaign,'design',['التصميم','تصميم'])}</td>
      <td class="db-department-cell">${databaseDepartmentCell(campaign,'montage',['المونتاج','مونتاج'])}</td>
      <td class="db-department-cell">${databaseDepartmentCell(campaign,'publish',['النشر','نشر'])}</td>
      <td><button type="button" class="mini-btn" data-view-campaign-data="${escapeHtml(campaign.id)}">عرض البيانات</button></td>
      <td class="db-actions"><button type="button" class="mini-btn danger" data-delete-campaign="${escapeHtml(campaign.id)}">مسح</button><button type="button" class="mini-btn" data-archive-campaign="${escapeHtml(campaign.id)}">أرشيف</button></td>
    </tr>`;
  }).join('');
}
function shortDbText(value, limit = 90){
  const text = normalizeText(value || '');
  if(!text) return '—';
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
}
function taskOneLineRow(task, campaign){
  const row = task.structureRow || {};
  const label = structureContentTaskLabel(row, taskContentType(task) || task.taskType || shortTaskName(task));
  const brief = row.writerRequest || row.idea || row.description || row.message || task.brief || task.description || '';
  return `<tr>
    <td>${escapeHtml(structureTaskNumber(task) || '—')}</td>
    <td><b>${escapeHtml(label)}</b></td>
    <td>${escapeHtml(rawTaskOwnerName(task))}</td>
    <td>${escapeHtml(taskDepartmentLabel(task))}</td>
    <td>${escapeHtml(receivedLabel(task))}</td>
    <td>${taskProgress(task)}%</td>
    <td>${formatDateShort(taskRequiredDate(task, campaign))}</td>
    <td>${escapeHtml(shortDbText(brief, 120))}</td>
  </tr>`;
}
function buildTaskSummaryList(campaign){
  const list = tasksForCampaign(campaign);
  if(!list.length) return '<div class="empty-state soft-empty">لا توجد تاسكات.</div>';
  return `<div class="compact-table db-task-lines-wrap"><table class="db-task-lines-table"><thead><tr><th>رقم التاسك</th><th>التاسك</th><th>اليوزر</th><th>القسم</th><th>الحالة</th><th>التقدم</th><th>التاريخ المطلوب</th><th>مختصر المطلوب</th></tr></thead><tbody>${list.map(task => taskOneLineRow(task, campaign)).join('')}</tbody></table></div>`;
}
function openOwnerTasksModal(campaignId, ownerKey){
  const campaign = campaigns.find(item => item.id === campaignId);
  const modal = document.getElementById('campaignModal');
  const content = document.getElementById('campaignModalContent');
  if(!campaign || !modal || !content) return;
  const list = tasksForCampaign(campaign).filter(task => taskOwnerKey(task) === ownerKey);
  const owner = list[0] ? rawTaskOwnerName(list[0]) : 'المسؤول';
  content.innerHTML = `<div class="task-modal-head"><div><span>تاسكات المسؤول</span><h2>${escapeHtml(owner)}</h2><p>${escapeHtml(campaign.campaignName || campaign.name || campaign.campaignCode || '')}</p></div><button type="button" class="mini-btn" data-close-campaign-modal>إغلاق</button></div>
    <div class="modal-section"><div class="modal-section-title"><h3>كل تاسكات المسؤول</h3></div>${list.length ? `<div class="compact-table db-task-lines-wrap"><table class="db-task-lines-table"><thead><tr><th>رقم التاسك</th><th>التاسك</th><th>القسم</th><th>الحالة</th><th>التقدم</th><th>التاريخ المطلوب</th><th>مختصر المطلوب</th></tr></thead><tbody>${list.map(task => { const row = task.structureRow || {}; const label = structureContentTaskLabel(row, taskContentType(task) || task.taskType || shortTaskName(task)); const brief = row.writerRequest || row.idea || row.description || row.message || task.brief || task.description || ''; return `<tr><td>${escapeHtml(structureTaskNumber(task) || '—')}</td><td><b>${escapeHtml(label)}</b></td><td>${escapeHtml(taskDepartmentLabel(task))}</td><td>${escapeHtml(receivedLabel(task))}</td><td>${taskProgress(task)}%</td><td>${formatDateShort(taskRequiredDate(task, campaign))}</td><td>${escapeHtml(shortDbText(brief, 120))}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty-state mini-empty">لا توجد تاسكات لهذا المسؤول.</div>'}</div>`;
  modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}
function campaignResultFileHtml(campaign){
  const file = campaign.resultsFile || campaign.resultFile || null;
  if(!file) return '<div class="empty-state mini-empty">لا يوجد ملف نتائج مرفوع.</div>';
  const name = escapeHtml(file.name || file.fileName || 'ملف النتائج');
  const url = file.fileUrl || file.url || '';
  return `<div class="result-file-line">${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${name}</a>` : name}<button type="button" class="mini-btn danger" data-remove-results-file="${escapeHtml(campaign.id)}">حذف</button></div>`;
}
function campaignLinksHtml(campaign){
  const links = Array.isArray(campaign.campaignLinks) ? campaign.campaignLinks : [];
  return `<div class="campaign-links-list">${links.length ? links.map((link, i) => `<div class="db-link-row"><b>${escapeHtml(link.platform || 'منصة')}</b><a href="${escapeHtml(link.url || '#')}" target="_blank" rel="noopener">${escapeHtml(link.url || '')}</a><button type="button" class="mini-btn danger" data-remove-campaign-link="${escapeHtml(campaign.id)}" data-link-index="${i}">حذف</button></div>`).join('') : '<div class="empty-state mini-empty">لا توجد روابط حملة.</div>'}</div>`;
}

function campaignStartPublishDate(campaign){
  const list = Array.isArray(campaign.publishSchedule) ? campaign.publishSchedule.filter(item => item && item.date) : [];
  return campaign.publishStartDate || campaign.publish_start_date || (list.length ? list[0].date : '') || campaign.startDate || '';
}
function campaignCodeText(campaign){ return campaign.campaignCode || campaign.campaign_code || campaign.code || ''; }
function campaignNameText(campaign){ return campaign.campaignName || campaign.name || campaign.campaign_name || ''; }
function campaignTypeText(campaign){ return campaign.campaignType || campaign.campaign_type || campaign.campaignTypeName || ''; }
function campaignStatusText(campaign){
  const status = campaign.request_status || campaign.status || '';
  const map = { draft:'مسودة', pending:'قيد الانتظار', active:'نشطة', archived:'مؤرشفة', done:'منتهية', completed:'مكتملة' };
  return map[status] || status || '—';
}
function campaignInfoCell(label, value, isDate = false){
  const text = isDate ? formatDateShort(value) : (normalizeText(value || '') || '—');
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(text)}</strong></div>`;
}
function campaignFullDataGrid(campaign){
  const tasks = tasksForCampaign(campaign);
  const received = tasks.filter(task => task.received || task.receivedConfirmed).length;
  const completed = tasks.filter(task => taskProgress(task) >= 100).length;
  const fields = [
    ['تاريخ الحملة', campaign.campaign_date || campaign.campaignDate || campaign.createdAt, true],
    ['بداية النشر', campaignStartPublishDate(campaign), true],
    ['نهاية النشر', campaignEndDate(campaign), true],
    ['نوع الحملة', campaignTypeText(campaign)],
    ['كود الحملة', campaignCodeText(campaign)],
    ['اسم الحملة', campaignNameText(campaign)],
    ['هدف الحملة', campaign.campaign_goal || campaign.campaignGoal],
    ['هدف الإدارة', campaign.management_goal || campaign.managementGoal],
    ['المطلوب من كاتب المحتوى', campaign.content_writer_brief || campaign.contentWriterBrief],
    ['موعد تسليم الهيكل', campaign.structure_deadline || campaign.structureDeadline, true],
    ['حالة الطلب', campaignStatusText(campaign)],
    ['رقم مسلسل الحملة', campaign.campaignSerial || campaign.serial || campaign.sequence],
    ['عدد التاسكات', tasks.length],
    ['التاسكات المستلمة', received],
    ['التاسكات المكتملة', completed],
    ['تاريخ الإنشاء', campaign.createdAt, true],
    ['آخر تحديث', campaign.updatedAt, true]
  ];
  return `<div class="task-info-grid campaign-full-info-grid">${fields.map(item => campaignInfoCell(item[0], item[1], item[2])).join('')}</div>`;
}
function openCampaignDataModal(campaignId){
  const campaign = campaigns.find(item => item.id === campaignId);
  const modal = document.getElementById('campaignModal');
  const content = document.getElementById('campaignModalContent');
  if(!campaign || !modal || !content) return;
  content.innerHTML = `<div class="task-modal-head"><div><span>عرض بيانات الحملة</span><h2>${escapeHtml(campaignNameText(campaign) || 'حملة')}</h2><p>${escapeHtml(campaignCodeText(campaign))}</p></div><div class="modal-head-actions"><button type="button" class="mini-btn" data-export-campaign-schedule="${escapeHtml(campaign.id)}">تصدير جدول النشر</button><button type="button" class="mini-btn pdf-export-btn" data-export-campaign-pdf="${escapeHtml(campaign.id)}">تصدير PDF</button><button type="button" class="mini-btn" data-close-campaign-modal>إغلاق</button></div></div>
    <div class="modal-section"><div class="modal-section-title"><h3>بيانات الحملة كاملة</h3></div>${campaignFullDataGrid(campaign)}</div>
    <div class="modal-section"><div class="modal-section-title"><h3>كل المطلوب من التاسكات واليوزرات</h3></div>${buildTaskSummaryList(campaign)}</div>
    <div class="modal-section"><div class="modal-section-title"><h3>عرض جدول النشر</h3></div>${renderScheduleSummary(campaign)}</div>
    <div class="modal-section"><div class="modal-section-title"><h3>عرض الميزانية</h3></div>${renderBudgetSummary(campaign)}</div>
    <div class="modal-section"><div class="modal-section-title"><h3>عرض نتائج الحملة</h3></div>${campaignResultFileHtml(campaign)}<button type="button" class="btn btn-primary" data-upload-results-file="${escapeHtml(campaign.id)}">رفع ملف النتائج</button></div>
    <div class="modal-section"><div class="modal-section-title"><h3>روابط الحملة</h3></div>${campaignLinksHtml(campaign)}<div class="link-add-row"><select class="select" id="campaignLinkPlatform">${platformOptions()}</select><input class="control" id="campaignLinkUrl" type="url" placeholder="رابط المنصة" /><button type="button" class="btn btn-light" data-add-campaign-link="${escapeHtml(campaign.id)}">+ إضافة منصة ورابط</button></div></div>`;
  modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}
function printableCompactTable(html){
  return html.replace(/class="compact-table/g, 'class="compact-table print-table-wrap').replace(/class="db-task-lines-table"/g, 'class="db-task-lines-table print-table"');
}
function exportCampaignDataPdf(campaignId){
  const campaign = campaigns.find(item => item.id === campaignId);
  if(!campaign) return;
  const tasksHtml = buildTaskSummaryList(campaign);
  const title = `${campaignCodeText(campaign)} - ${campaignNameText(campaign) || 'بيانات الحملة'}`.trim();
  const safeTitle = escapeHtml(title || 'بيانات الحملة');
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${safeTitle}</title><style>
    @page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{font-family:Tahoma,Arial,sans-serif;direction:rtl;color:#2d1713;margin:0;background:#fff;font-size:11px}h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;margin:18px 0 8px;border-bottom:2px solid #6f3f34;padding-bottom:6px}.report-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;border:2px solid #6f3f34;border-radius:14px;padding:12px;margin-bottom:12px}.meta{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin:8px 0 14px}.meta div{border:1px solid #ead0c4;border-radius:10px;padding:8px;background:#fffaf6}.meta span{display:block;color:#8e7166;font-weight:700;font-size:10px}.meta strong{display:block;margin-top:4px;font-size:11px}.print-table-wrap{overflow:visible!important;border:1px solid #ead0c4;border-radius:10px}.print-table,.compact-table table{width:100%;border-collapse:collapse!important;min-width:0!important}.print-table th,.print-table td,.compact-table th,.compact-table td{border:1px solid #ead0c4!important;padding:7px!important;text-align:right!important;vertical-align:top!important;white-space:normal!important;line-height:1.65!important}.print-table th,.compact-table th{background:#f2e5dc!important;color:#2d1713!important;font-weight:900!important}.empty-state{border:1px dashed #ead0c4;border-radius:10px;padding:14px;text-align:center;color:#8e7166}.footer{margin-top:14px;color:#8e7166;font-size:10px;text-align:left}@media print{button{display:none!important}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><section class="report-head"><div><h1>تقرير بيانات الحملة</h1><strong>${safeTitle}</strong></div><div>تاريخ التصدير: ${escapeHtml(formatDateShort(new Date()))}</div></section><section class="meta"><div><span>تاريخ الحملة</span><strong>${escapeHtml(formatDateShort(campaign.campaign_date || campaign.campaignDate || campaign.createdAt))}</strong></div><div><span>بداية النشر</span><strong>${escapeHtml(formatDateShort(campaignStartPublishDate(campaign)))}</strong></div><div><span>نهاية النشر</span><strong>${escapeHtml(formatDateShort(campaignEndDate(campaign)))}</strong></div><div><span>نوع الحملة</span><strong>${escapeHtml(campaignTypeText(campaign))}</strong></div><div><span>كود الحملة</span><strong>${escapeHtml(campaignCodeText(campaign))}</strong></div><div><span>اسم الحملة</span><strong>${escapeHtml(campaignNameText(campaign))}</strong></div><div><span>هدف الحملة</span><strong>${escapeHtml(campaign.campaign_goal || campaign.campaignGoal || '')}</strong></div><div><span>هدف الإدارة</span><strong>${escapeHtml(campaign.management_goal || campaign.managementGoal || '')}</strong></div><div><span>المطلوب من كاتب المحتوى</span><strong>${escapeHtml(campaign.content_writer_brief || campaign.contentWriterBrief || '')}</strong></div><div><span>موعد تسليم الهيكل</span><strong>${escapeHtml(formatDateShort(campaign.structure_deadline || campaign.structureDeadline))}</strong></div><div><span>حالة الطلب</span><strong>${escapeHtml(campaignStatusText(campaign))}</strong></div><div><span>رقم مسلسل الحملة</span><strong>${escapeHtml(campaign.campaignSerial || campaign.serial || campaign.sequence || '')}</strong></div></section><h2>كل المطلوب من التاسكات واليوزرات</h2>${printableCompactTable(tasksHtml)}<h2>جدول النشر</h2>${printableCompactTable(renderScheduleSummary(campaign))}<h2>الميزانية</h2>${printableCompactTable(renderBudgetSummary(campaign))}<h2>روابط الحملة</h2>${printableCompactTable(campaignLinksHtml(campaign))}<div class="footer">MZJ Workspace</div><script>window.onload=function(){setTimeout(function(){window.focus();window.print();},250)}<\/script></body></html>`;
  const printWindow = window.open('', '_blank');
  if(!printWindow){ alert('المتصفح منع فتح نافذة التصدير. اسمح بالـ popups وجرب تاني.'); return; }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function publishContentTypeFromText(value){
  const text = normalizeText(value || '').toLowerCase();
  if(!text) return '';
  if(/reel|ريل|video|فيديو|موشن|motion/.test(text)) return 'reel';
  if(/story|ستوري|قصة/.test(text)) return 'story';
  if(/carousel|album|ألبوم|البوم|صور متعددة|كاروسيل/.test(text)) return 'carousel';
  if(/image|photo|صورة|بوست/.test(text)) return 'image';
  return text;
}
function publishScheduleExportRows(campaign){
  const list = Array.isArray(campaign.publishSchedule) ? campaign.publishSchedule : [];
  return list.map((item, index) => {
    const platforms = Array.isArray(item.platforms) ? item.platforms.join(', ') : (item.platform || '');
    const output = item.output || item.type || item.contentType || '';
    const campaignName = campaignNameText(campaign) || '';
    return {
      'sourceType': 'campaign',
      'campaignCode': campaignCodeText(campaign) || '',
      'campaignName': campaignName,
      'rowNumber': index + 1,
      'publishDate': item.date || '',
      'publishTime': item.time || '',
      'contentType': publishContentTypeFromText(output) || output || '',
      'output': output || '',
      'platforms': platforms,
      'title': [campaignName, output].filter(Boolean).join(' - '),
      'caption': item.caption || '',
      'hashtags': Array.isArray(item.hashtags) ? item.hashtags.join(' ') : (item.hashtagsText || ''),
      'mediaUrls': '',
      'link': '',
      'location': '',
      'notes': item.note || '',
      'status': 'needs_completion'
    };
  });
}
function exportCampaignPublishScheduleFile(campaignId){
  const campaign = campaigns.find(item => item.id === campaignId);
  if(!campaign) return;
  const rows = publishScheduleExportRows(campaign);
  if(!rows.length){ showToast('لا يوجد جدول نشر للتصدير في هذه الحملة.'); return; }
  if(!window.XLSX){ showToast('مكتبة Excel لم يتم تحميلها.'); return; }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'publish_schedule');
  const fileName = `${(campaignCodeText(campaign) || 'campaign').replace(/[\\/:*?"<>|\s]+/g,'_')}_publish_schedule.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast('تم تصدير جدول النشر. سيتم استخدامه لاحقًا لتوليد تاسكات تجهيز النشر.');
}
function normalizeImportHeader(value){
  return String(value || '').trim().replace(/^\uFEFF/, '').toLowerCase();
}
function firstImportValue(row, keys){
  const map = Object.keys(row || {}).reduce((acc, key) => { acc[normalizeImportHeader(key)] = row[key]; return acc; }, {});
  for(const key of keys){
    const v = map[normalizeImportHeader(key)];
    if(v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return '';
}
function excelDateToIso(value){
  if(!value) return '';
  if(value instanceof Date && !Number.isNaN(value.getTime())) return formatInputDate(value);
  if(typeof value === 'number' && window.XLSX){
    const parsed = XLSX.SSF.parse_date_code(value);
    if(parsed && parsed.y) return `${parsed.y}-${String(parsed.m).padStart(2,'0')}-${String(parsed.d).padStart(2,'0')}`;
  }
  const text = String(value).trim();
  if(/^\d{4}-\d{1,2}-\d{1,2}/.test(text)){
    const [y,m,d] = text.split(/[T\s]/)[0].split('-');
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  const date = new Date(text);
  if(!Number.isNaN(date.getTime())) return formatInputDate(date);
  return text;
}
function normalizeImportPlatforms(value){
  const raw = Array.isArray(value) ? value.join(',') : String(value || '');
  const parts = raw.split(/[,،+\/|]/).map(v => normalizeText(v).toLowerCase()).filter(Boolean);
  const result = [];
  parts.forEach(part => {
    if(/facebook|فيس|فيسبوك|fb/.test(part)) result.push('facebook');
    else if(/instagram|انستا|إنستا|ig/.test(part)) result.push('instagram');
    else if(/tiktok|تيك|tik/.test(part)) result.push('tiktok');
  });
  return uniqueList(result);
}
function statusFromImportRow(row, missing){
  const raw = normalizeText(firstImportValue(row, ['status','الحالة']));
  if(missing.length) return 'يحتاج استكمال';
  if(/scheduled|مجدول/.test(raw)) return 'مجدول';
  if(/review|مراجعة/.test(raw)) return 'بانتظار مراجعة';
  if(/published|منشور/.test(raw)) return 'منشور';
  return 'مسودة مستوردة';
}
function publishItemFromScheduleRow(row, index){
  const sourceType = normalizeText(firstImportValue(row, ['sourceType','source','مصدر','نوع المصدر'])) || 'campaign';
  const title = normalizeText(firstImportValue(row, ['title','اسم المنشور','اسم الحملة','campaignName','campaign_name'])) || `منشور مستورد ${index + 1}`;
  const caption = normalizeText(firstImportValue(row, ['caption','الكابشن','نص المنشور','postText']));
  const hashtagsText = normalizeText(firstImportValue(row, ['hashtags','هاشتاجات','الهاشتاجات']));
  const date = excelDateToIso(firstImportValue(row, ['publishDate','date','تاريخ النشر','التاريخ']));
  const time = normalizeText(firstImportValue(row, ['publishTime','time','وقت النشر','الوقت']));
  const contentTypeRaw = normalizeText(firstImportValue(row, ['contentType','type','نوع المحتوى','output','المخرج'])) || 'reel';
  const type = publishContentTypeFromText(contentTypeRaw) || 'reel';
  const platforms = normalizeImportPlatforms(firstImportValue(row, ['platforms','platform','المنصات','المنصة']));
  const mediaText = String(firstImportValue(row, ['mediaUrls','mediaUrl','media','روابط الميديا','رابط الميديا']) || '');
  const mediaItems = mediaText.split(/\n|\r|;/).map(normalizeText).filter(Boolean).map(url => ({ url, type: /\.(mp4|mov|webm)(\?|$)/i.test(url) ? 'video' : 'image' }));
  const missing = [];
  if(!date) missing.push('تاريخ النشر');
  if(!type) missing.push('نوع المحتوى');
  if(!platforms.length) missing.push('المنصات');
  if(!caption) missing.push('الكابشن');
  if(!mediaItems.length) missing.push('الميديا');
  const status = statusFromImportRow(row, missing);
  return {
    id: `import_${Date.now()}_${index}`,
    sourceType: sourceType === 'agenda' ? 'agenda' : (sourceType === 'manual' ? 'manual' : 'campaign'),
    sourceLabel: sourceType === 'agenda' ? 'أجندة' : (sourceType === 'manual' ? 'نشر يدوي' : 'حملة'),
    title,
    caption,
    hashtags: extractHashtags(`${hashtagsText} ${caption}`),
    platforms,
    type,
    contentType: type,
    mode: 'schedule',
    status,
    importStatus: missing.length ? 'needs_completion' : 'ready',
    missingFields: missing,
    scheduleDate: date,
    scheduleTime: time,
    mediaUrl: mediaItems[0]?.url || '',
    mediaItems,
    link: normalizeText(firstImportValue(row, ['link','url','رابط الموقع','Landing Page'])),
    location: normalizeText(firstImportValue(row, ['location','الموقع','Location'])),
    notes: normalizeText(firstImportValue(row, ['notes','note','ملاحظات','ملاحظة'])) || (missing.length ? `ناقص: ${missing.join('، ')}` : ''),
    campaignCode: normalizeText(firstImportValue(row, ['campaignCode','كود الحملة'])),
    campaignName: normalizeText(firstImportValue(row, ['campaignName','اسم الحملة'])),
    createdAt: new Date().toISOString(),
    createdBy: getCurrentUser()?.name || getCurrentUser()?.email || 'استيراد جدول نشر'
  };
}
async function importPublishScheduleFile(file){
  if(!file) return;
  if(!window.XLSX){ showToast('مكتبة Excel لم يتم تحميلها.'); return; }
  try{
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type:'array', cellDates:true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval:'' });
    if(!rows.length){ showToast('ملف جدول النشر فارغ.'); return; }
    const imported = rows.map((row, index) => publishItemFromScheduleRow(row, index));
    setSocialPublishLog([...imported, ...getSocialPublishLog()]);
    renderSocialPublishLog();
    renderCalendarPage();
    renderPublishCenterPage();
    const ready = imported.filter(item => item.importStatus === 'ready').length;
    const missing = imported.length - ready;
    showToast(`تم استيراد ${imported.length} منشور. جاهز: ${ready} · يحتاج استكمال: ${missing}`);
  }catch(error){
    console.error(error);
    showToast('تعذر قراءة ملف جدول النشر. تأكد من أن الملف Excel أو CSV صحيح.');
  }
}
function renderScheduleSummary(campaign){
  const list = Array.isArray(campaign.publishSchedule) ? campaign.publishSchedule : [];
  if(!list.length) return '<div class="empty-state mini-empty">لا يوجد جدول نشر.</div>';
  return `<div class="compact-table"><table><thead><tr><th>التاريخ</th><th>المخرج</th><th>المنصات</th><th>ملاحظة</th></tr></thead><tbody>${list.map(item => `<tr><td>${escapeHtml(item.date || '')}</td><td>${escapeHtml(item.output || '')}</td><td>${escapeHtml(Array.isArray(item.platforms) ? item.platforms.join('، ') : item.platform || '')}</td><td>${escapeHtml(item.note || '')}</td></tr>`).join('')}</tbody></table></div>`;
}
function budgetItemTotal(item){
  const rawAds = item?.adsCount ?? item?.ads_count ?? '';
  const adsCount = rawAds === '' || rawAds == null ? 1 : Number(rawAds || 0);
  const value = Number(item?.value || 0);
  const computed = Math.max(0, adsCount) * Math.max(0, value);
  return computed || Number(item?.total || 0);
}
function renderBudgetSummary(campaign){
  const list = Array.isArray(campaign.budgetItems) ? campaign.budgetItems : [];
  if(!list.length) return '<div class="empty-state mini-empty">لا توجد ميزانية.</div>';
  const grandTotal = list.reduce((sum, item) => sum + budgetItemTotal(item), 0);
  return `<div class="compact-table"><table><thead><tr><th>Funnel</th><th>المنتج</th><th>المنصة</th><th>عدد الإعلانات</th><th>القيمة</th><th>إجمالي البند</th></tr></thead><tbody>${list.map(item => `<tr><td>${escapeHtml(item.funnel || item.newFunnel || '')}</td><td>${escapeHtml(item.product || '')}</td><td>${escapeHtml(item.platform || '')}</td><td>${escapeHtml(item.adsCount || '')}</td><td>${escapeHtml(item.value || '')}</td><td>${escapeHtml(budgetItemTotal(item) || '')}</td></tr>`).join('')}<tr class="budget-total-row"><td colspan="5">إجمالي الميزانية</td><td>${escapeHtml(grandTotal || 0)}</td></tr></tbody></table></div>`;
}
function closeCampaignModal(){
  document.getElementById('campaignModal')?.classList.remove('show');
  document.getElementById('campaignModal')?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}
function openCampaignEditModal(campaignId){
  const campaign = campaigns.find(item => item.id === campaignId);
  const modal = document.getElementById('campaignModal');
  const content = document.getElementById('campaignModalContent');
  if(!campaign || !modal || !content) return;
  const taskRows = tasksForCampaign(campaign).map(task => `<div class="db-task-row"><b>${escapeHtml(task.taskType || shortTaskName(task))}</b><span>${escapeHtml(taskContentType(task))}</span><span>${escapeHtml(taskOwnerName(task))}</span><em>${taskProgress(task)}%</em></div>`).join('') || '<div class="empty-state mini-empty">لا توجد تاسكات.</div>';
  content.innerHTML = `<div class="task-modal-head"><div><span>تعديل الحملة</span><h2>${escapeHtml(campaignNameText(campaign) || 'حملة')}</h2><p>${escapeHtml(campaignCodeText(campaign))}</p></div><button type="button" class="mini-btn" data-close-campaign-modal>إغلاق</button></div>
    <div class="modal-section"><div class="modal-section-title"><h3>بيانات الحملة</h3></div><div class="campaign-edit-grid"><label class="field"><span>اسم الحملة</span><input id="editCampaignName" value="${escapeHtml(campaign.campaignName || campaign.name || '')}"></label><label class="field"><span>نوع الحملة</span><input id="editCampaignType" value="${escapeHtml(campaign.campaignType || campaign.campaign_type || '')}"></label><label class="field"><span>هدف الحملة</span><input id="editCampaignGoal" value="${escapeHtml(campaign.campaign_goal || '')}"></label><label class="field"><span>تاريخ الحملة</span><input type="date" id="editCampaignDate" value="${escapeHtml(campaign.campaign_date || '')}"></label></div><button type="button" class="btn btn-primary" data-save-campaign-edit="${escapeHtml(campaign.id)}">حفظ تعديلات الحملة</button></div>
    <div class="modal-section"><div class="modal-section-title"><h3>التاسكات الحالية</h3></div>${taskRows}</div>
    <div class="modal-section"><div class="modal-section-title"><h3>إضافة تاسك</h3></div><div class="campaign-edit-grid"><label class="field"><span>اختار المحتوى</span><select id="editAddSection">${contentSectionOptions()}</select></label><label class="field"><span>نوع التاسك</span><select id="editAddTaskType"><option value="">اختر نوع التاسك</option></select></label><label class="field"><span>التاريخ المطلوب</span><input type="date" id="editAddRequiredDate"></label><label class="field"><span>اليوزر</span><select id="editAddUsers" multiple size="4">${multiUserOptions()}</select></label></div><button type="button" class="btn btn-light" data-add-task-to-campaign="${escapeHtml(campaign.id)}">+ إضافة تاسك للحملة</button></div>`;
  modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}
async function saveCampaignEdit(campaignId){
  if(!mainDb) return;
  const patch = { campaignName: normalizeText(document.getElementById('editCampaignName')?.value), name: normalizeText(document.getElementById('editCampaignName')?.value), campaignType: normalizeText(document.getElementById('editCampaignType')?.value), campaign_type: normalizeText(document.getElementById('editCampaignType')?.value), campaign_goal: normalizeText(document.getElementById('editCampaignGoal')?.value), campaign_date: document.getElementById('editCampaignDate')?.value || '', updatedAt: serverTime() };
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId).update(patch);
  showToast('تم حفظ تعديلات الحملة.');
}
function buildManualTask(campaign, sectionId, taskType, userId, copyIndex, qty, requiredDate = ''){
  const section = contentSections.find(item => item.id === sectionId) || {};
  const user = findUserByAnyIdentity(userId) || users.find(item => item.id === userId) || {};
  const sectionName = canonicalContentLabel(section.name || '');
  const role = normalizeDepartmentRole(sectionName);
  const ownerName = userName(user) || userId || 'غير محدد';
  const keys = uniqueList([user.id, user.uid, user.email, user.emailLower, ownerName, user.name, user.displayName, user.username].filter(Boolean));
  return { id:`${campaign.id}-task-${Date.now()}-${copyIndex}-${Math.random().toString(36).slice(2,7)}`, campaignId: campaign.id, campaignName: campaign.campaignName || campaign.name || '', campaignCode: campaign.campaignCode || campaign.campaign_code || '', creative:'', product:'', selectedCars:[], selectedCar:'', contentSectionId: sectionId, contentSectionName: sectionName, taskType, requiredDate, dueDate: requiredDate, taskQuantity: qty, taskCopyIndex: copyIndex, userId:user.id || user.uid || userId, userUid:user.uid || user.id || userId, userName:ownerName, userEmail:user.email || '', assigneeUid:user.uid || user.id || userId, assigneeName:ownerName, assigneeEmail:user.email || '', assignedToUid:user.uid || user.id || userId, assignedToId:user.id || user.uid || userId, assignedToName:ownerName, assignedToEmail:user.email || '', assignedToSearch:keys, searchKeys:keys, assignedDepartmentId:sectionId, assignedDepartmentName:sectionName, departmentRole:role, received:false, receivedConfirmed:false, progress:0, status:'pending', steps:taskStepTemplate(role), attachments:[], source:'manual-campaign-edit' };
}
async function addTaskToCampaign(campaignId){
  const campaign = campaigns.find(item => item.id === campaignId); if(!campaign || !mainDb) return;
  const sectionId = document.getElementById('editAddSection')?.value || '';
  const taskType = document.getElementById('editAddTaskType')?.value || '';
  const qty = 1;
  const requiredDate = document.getElementById('editAddRequiredDate')?.value || '';
  const userIds = getSelectedValues(document.getElementById('editAddUsers'));
  if(!sectionId || !taskType || !userIds.length){ showToast('اختار المحتوى ونوع التاسك واليوزر.'); return; }
  const additions = [];
  userIds.forEach(uid => { for(let i=1;i<=qty;i++) additions.push(buildManualTask(campaign, sectionId, taskType, uid, i, qty)); });
  const departmentTasks = [...(campaign.departmentTasks || []), ...additions];
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId).update({ departmentTasks, taskCount: departmentTasks.length, updatedAt: serverTime() });
  showToast('تم إضافة التاسك.');
  openCampaignEditModal(campaignId);
}
async function archiveCampaign(campaignId){
  const campaign = campaigns.find(item => item.id === campaignId); if(!campaign || !mainDb) return;
  const hasFile = !!(campaign.resultsFile || campaign.resultFile);
  const hasLinks = Array.isArray(campaign.campaignLinks) && campaign.campaignLinks.some(link => normalizeText(link.url));
  const missing = [];
  if(!hasFile) missing.push('ملف نتائج الحملة');
  if(!hasLinks) missing.push('روابط الحملة');
  if(missing.length){ showToast(`لا يمكن أرشفة الحملة. الناقص: ${missing.join(' + ')}`); return; }
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId).update({ status:'archived', archivedAt: serverTime(), archivedBy: getCurrentUser().email || getCurrentUser().name || '', updatedAt: serverTime() });
  showToast('تم أرشفة الحملة.');
}
async function addCampaignLink(campaignId){
  const campaign = campaigns.find(item => item.id === campaignId); if(!campaign || !mainDb) return;
  const platform = document.getElementById('campaignLinkPlatform')?.value || '';
  const url = normalizeText(document.getElementById('campaignLinkUrl')?.value);
  if(!platform || !url){ showToast('اختار المنصة واكتب الرابط.'); return; }
  const campaignLinks = [...(campaign.campaignLinks || []), { platform, url, createdAt: new Date().toISOString() }];
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId).update({ campaignLinks, updatedAt: serverTime() });
  showToast('تم إضافة الرابط.');
  openCampaignDataModal(campaignId);
}
async function removeCampaignLink(campaignId, index){
  const campaign = campaigns.find(item => item.id === campaignId); if(!campaign || !mainDb) return;
  const campaignLinks = (campaign.campaignLinks || []).filter((_, i) => i !== Number(index));
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId).update({ campaignLinks, updatedAt: serverTime() });
  openCampaignDataModal(campaignId);
}
async function saveCampaignResultFile(campaignId, file){
  const campaign = campaigns.find(item => item.id === campaignId); if(!campaign || !mainDb || !file) return;
  const result = { name:file.name, fileName:file.name, size:file.size, type:file.type, uploadedAt:new Date().toISOString(), uploadedBy:getCurrentUser().email || getCurrentUser().name || '' };
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId).update({ resultsFile: result, updatedAt: serverTime() });
  showToast('تم حفظ بيانات ملف النتائج.');
  openCampaignDataModal(campaignId);
}
async function removeCampaignResultFile(campaignId){
  if(!mainDb) return;
  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaignId).update({ resultsFile: firebase.firestore.FieldValue.delete(), updatedAt: serverTime() });
  openCampaignDataModal(campaignId);
}

function renderCampaignCards(containerId, limit = 6){
  const el = document.getElementById(containerId); if(!el) return;
  if(!campaigns.length){ el.innerHTML = '<div class="empty-state">لا توجد حملات محفوظة حتى الآن.</div>'; return; }
  el.innerHTML = campaigns.slice(0, limit).map(campaign => `
    <article class="campaign-card-item" data-edit-campaign="${escapeHtml(campaign.id)}">
      <div>
        <h3>${escapeHtml(campaign.campaignName || campaign.name || campaign.campaignCode || 'حملة بدون اسم')}</h3>
        <p>${escapeHtml(campaign.campaignCode || 'بدون كود')} · ${escapeHtml(campaign.campaignType || 'بدون نوع')}</p>
      </div>
      <div class="campaign-card-meta">
        ${campaign.status && campaign.status !== 'draft' ? `<span class="chip">${escapeHtml(campaign.status)}</span>` : ''}
        <small>${formatDateShort(campaign.createdAt || campaign.campaign_date)}</small>
        <button class="mini-btn" type="button" data-edit-campaign="${escapeHtml(campaign.id)}">فتح وتعديل</button>
        <button class="mini-btn danger" type="button" data-delete-campaign="${escapeHtml(campaign.id)}">حذف</button>
      </div>
    </article>`).join('');
}
function renderCampaigns(){
  renderAdminDashboard();
  renderCampaignCards('campaignsList', 50);
  renderDatabasePage();
}


const SOCIAL_PUBLISH_LOG_KEY = 'mzj_social_publish_log_v1';
let socialMetaPages = [];
let socialMetaConnected = false;
let socialTikTokConnected = false;
let socialTikTokUser = null;
let socialYouTubeConnected = false;
let socialYouTubeChannel = null;
const socialPlatformLabels = { facebook:'Facebook', instagram:'Instagram', tiktok:'TikTok', youtube:'YouTube' };
function getLocalSocialPublishLog(){
  try{ return JSON.parse(localStorage.getItem(SOCIAL_PUBLISH_LOG_KEY) || '[]'); }catch(_){ return []; }
}
function mergePublishLogs(localItems, remoteItems){
  const map = new Map();
  [...(remoteItems || []), ...(localItems || [])].forEach(item => {
    const id = String(item?.id || item?.logId || `${item?.taskId || 'log'}-${item?.platform || 'all'}-${item?.createdAt || item?.publishedAt || Date.now()}`);
    if(!map.has(id)) map.set(id, { ...item, id });
  });
  return [...map.values()].sort((a,b) => String(b.publishedAt || b.createdAt || b.updatedAtIso || '').localeCompare(String(a.publishedAt || a.createdAt || a.updatedAtIso || ''))).slice(0, 100);
}
function getSocialPublishLog(){
  return mergePublishLogs(getLocalSocialPublishLog(), publishLogsCache);
}
function setSocialPublishLog(items){
  localStorage.setItem(SOCIAL_PUBLISH_LOG_KEY, JSON.stringify(Array.isArray(items) ? items.slice(0, 60) : []));
}
function cleanPublishLogForFirestore(item){
  const jsonSafe = JSON.parse(JSON.stringify(item || {}));
  return {
    ...jsonSafe,
    id: String(jsonSafe.id || `log_${Date.now()}`),
    ownerEmail: jsonSafe.ownerEmail || getCurrentUserIdentity()?.email || '',
    ownerUid: jsonSafe.ownerUid || getCurrentUserIdentity()?.uid || getCurrentUserIdentity()?.id || '',
    updatedAtIso: new Date().toISOString(),
    updatedAt: serverTime()
  };
}
async function savePublishLogToFirestore(item){
  if(!mainDb || !item) return false;
  try{
    const data = cleanPublishLogForFirestore(item);
    await safeCollection(window.MZJ_PUBLISH_LOGS_COLLECTION).doc(safeFirestoreDocId(data.id)).set(data, { merge: true });
    return true;
  }catch(error){
    console.warn('Publish log Firestore save error', error);
    return false;
  }
}
function loadPublishLogs(){
  if(!mainDb || publishLogsUnsubscribe) return;
  try{
    publishLogsUnsubscribe = safeCollection(window.MZJ_PUBLISH_LOGS_COLLECTION).orderBy('createdAt','desc').limit(80).onSnapshot(snapshot => {
      publishLogsCache = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: data.id || doc.id, ...data }; });
      if(getRoute() === 'social-publisher') renderSocialPublishLog();
    }, error => console.warn('Publish logs load error', error));
  }catch(error){
    console.warn('Publish logs init error', error);
  }
}
function selectedSocialPlatforms(){
  return [...document.querySelectorAll('input[name="platforms"]:checked')].map(input => input.value).filter(Boolean);
}
function appendSocialLog(item){
  const stamped = { createdAt: item?.createdAt || new Date().toISOString(), ...item };
  setSocialPublishLog([stamped, ...getLocalSocialPublishLog()]);
  savePublishLogToFirestore(stamped);
  renderSocialPublishLog();
  if(getRoute() === 'publish-prep') renderPublishPrepPage();
}
function getSelectedSocialPage(){
  const pageId = document.getElementById('socialMetaPageSelect')?.value || '';
  return socialMetaPages.find(page => String(page.id) === String(pageId)) || socialMetaPages[0] || null;
}
function setTikTokStatus(text, ok = false){
  const el = document.getElementById('tiktokChannelStatus');
  if(el){ el.textContent = text; el.classList.toggle('ready', !!ok); el.classList.toggle('is-error', !ok); }
}

async function loadTikTokConnection(){
  setTikTokStatus('جاري الفحص...', false);
  try{
    const response = await fetch('/api/tiktok/status', { credentials:'include' });
    const data = await response.json().catch(() => ({}));
    socialTikTokConnected = !!(response.ok && data.ok && data.connected);
    socialTikTokUser = data.user || null;
    if(socialTikTokConnected){
      const name = socialTikTokUser?.display_name || socialTikTokUser?.username || 'TikTok';
      setTikTokStatus(`متصل Sandbox: ${name} · Draft Upload جاهز`, true);
    } else {
      setTikTokStatus(data.hasTikTokClientKey ? 'جاهز للربط - Sandbox' : 'إعدادات ناقصة', false);
    }
  }catch(error){
    socialTikTokConnected = false;
    socialTikTokUser = null;
    setTikTokStatus('تعذر فحص TikTok', false);
  }
}

function setYouTubeStatus(text, ok = false){
  const el = document.getElementById('youtubeChannelStatus');
  if(el){ el.textContent = text; el.classList.toggle('ready', !!ok); el.classList.toggle('is-error', !ok); }
}

async function loadYouTubeConnection(){
  setYouTubeStatus('جاري الفحص...', false);
  try{
    const response = await fetch('/api/youtube/status', { credentials:'include' });
    const data = await response.json().catch(() => ({}));
    socialYouTubeConnected = !!(response.ok && data.ok && data.connected);
    socialYouTubeChannel = data.channel || null;
    if(socialYouTubeConnected){
      const name = socialYouTubeChannel?.title || socialYouTubeChannel?.id || 'YouTube';
      setYouTubeStatus(`متصل: ${name}`, true);
    } else {
      setYouTubeStatus(data.hasClientId ? 'جاهز للربط' : 'إعدادات ناقصة', false);
    }
  }catch(error){
    socialYouTubeConnected = false;
    socialYouTubeChannel = null;
    setYouTubeStatus('تعذر فحص YouTube', false);
  }
}

function setSocialStatus(text, ok = false){
  const el = document.getElementById('socialMetaConnectionStatus');
  if(el){ el.textContent = text; el.classList.toggle('is-connected', !!ok); el.classList.toggle('is-error', !ok); }
  const facebookStatus = document.getElementById('facebookChannelStatus');
  if(facebookStatus){ facebookStatus.textContent = ok ? 'متصل' : 'غير متصل'; facebookStatus.classList.toggle('ready', !!ok); }
  const instagramStatus = document.getElementById('instagramChannelStatus');
  const igInput = document.getElementById('socialInstagramStatus');
  const selectedPage = getSelectedSocialPage();
  const hasInstagram = !!(selectedPage && selectedPage.instagram && selectedPage.instagram.id);
  if(instagramStatus){ instagramStatus.textContent = hasInstagram ? 'متصل' : (ok ? 'اربط Instagram بالصفحة' : 'غير متصل'); }
  if(igInput){ igInput.value = hasInstagram ? `متصل: ${selectedPage.instagram.username || selectedPage.instagram.name || selectedPage.instagram.id}` : (ok ? 'لا يوجد Instagram Business مربوط بالصفحة المختارة' : 'غير متصل'); }
}
function renderSocialPagesSelect(note = ''){
  const select = document.getElementById('socialMetaPageSelect');
  if(!select) return;
  if(!socialMetaPages.length){
    select.innerHTML = '<option value="">لا توجد صفحات متاحة حالياً</option>';
    if(socialMetaConnected){
      setSocialStatus(note || 'Meta Login متصل · صلاحيات الصفحات لم تتفعل بعد', true);
    }
    return;
  }
  select.innerHTML = socialMetaPages.map(page => `<option value="${escapeHtml(page.id)}">${escapeHtml(page.name || page.id)}${page.instagram ? ' · Instagram متصل' : ''}</option>`).join('');
  setSocialStatus(`Meta متصل · ${socialMetaPages.length} صفحة متاحة`, true);
}
async function loadMetaConnection(){
  const statusEl = document.getElementById('socialMetaConnectionStatus');
  if(statusEl) statusEl.textContent = 'جاري فحص ربط Meta...';
  try{
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const response = await fetch('/api/meta/pages', { credentials:'include', signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.json().catch(() => ({}));
    if(!response.ok || !data.ok){
      socialMetaConnected = false;
      socialMetaPages = [];
      renderSocialPagesSelect();
      setSocialStatus(data.error || 'Meta غير متصل. اضغط ربط / إعادة ربط Meta.', false);
      return;
    }
    socialMetaConnected = !!data.connected;
    socialMetaPages = Array.isArray(data.pages) ? data.pages : [];
    renderSocialPagesSelect(data.note || data.warning || '');
  }catch(error){
    socialMetaConnected = false;
    socialMetaPages = [];
    renderSocialPagesSelect();
    setSocialStatus(error.name === 'AbortError' ? 'فحص Meta استغرق وقت طويل. جرب إعادة تحميل الصفحة.' : 'تعذر فحص الربط: ' + (error.message || error), false);
  }
}
function renderSocialPublisherPage(){
  renderSocialPublishLog();
  loadMetaConnection();
  loadTikTokConnection();
  loadYouTubeConnection();
}
function renderSocialPreview(){
  const preview = document.getElementById('socialPostPreview');
  if(!preview) return;
  const title = normalizeText(document.getElementById('socialPostTitle')?.value) || 'عنوان المنشور';
  const caption = normalizeText(document.getElementById('socialPostCaption')?.value) || 'اكتب نص المنشور ليظهر هنا...';
  const mediaUrl = normalizeText(document.getElementById('socialPostMediaUrl')?.value);
  const link = normalizeText(document.getElementById('socialPostLink')?.value);
  const postType = normalizeText(document.getElementById('socialPostType')?.value) || 'post';
  const platforms = selectedSocialPlatforms();
  const platformHtml = platforms.length ? platforms.map(platform => `<span>${escapeHtml(socialPlatformLabels[platform] || platform)}</span>`).join('') : '<span>لم يتم اختيار قناة</span>';
  preview.innerHTML = `<div class="preview-platforms">${platformHtml}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(caption).replace(/\n/g,'<br>')}</p><div class="preview-media-placeholder">${mediaUrl ? `ميديا مرفقة: ${escapeHtml(mediaUrl)}` : 'صورة / فيديو'}</div><small>${link ? `الرابط: ${escapeHtml(link)}` : 'لم يتم تحديد رابط بعد'} · ${escapeHtml(postTypeLabel(postType))}</small>`;
}
function postTypeLabel(type){ return {post:'منشور عادي',reel:'Reel / Short Video',story:'Story',draft:'مسودة فقط'}[type] || type; }
function publishModeLabel(mode){ return {now:'نشر الآن',schedule:'جدولة',draft:'مسودة'}[mode] || mode; }
function socialStatusLabel(item){
  if(item.status) return item.status;
  if(item.mode === 'schedule') return 'مجدول';
  if(item.mode === 'draft' || item.type === 'draft') return 'مسودة';
  return 'جاهز للنشر';
}
function renderSocialPublishLog(){
  const wrap = document.getElementById('socialPublishLog');
  if(!wrap) return;
  const items = getSocialPublishLog();
  if(!items.length){ wrap.innerHTML = '<div class="empty-state">لا توجد منشورات محفوظة حتى الآن.</div>'; return; }
  wrap.innerHTML = items.map(item => {
    const platforms = (item.platforms || (item.platform ? [item.platform] : [])).map(platform => `<span>${escapeHtml(socialPlatformLabels[platform] || platform)}</span>`).join('');
    const schedule = item.mode === 'schedule' ? `${escapeHtml(item.scheduleDate || '')} ${escapeHtml(item.scheduleTime || '')}`.trim() : publishModeLabel(item.mode);
    const error = item.error ? `<p class="social-log-error">${escapeHtml(item.error)}</p>` : '';
    const url = item.publishedUrl || item.permalinkUrl || item.postUrl || item.resultUrl || '';
    const resultId = item.resultId || item.postId || item.platformPostId || '';
    const meta = [postTypeLabel(item.type), schedule || item.publishedAt || item.createdAt || 'غير محدد', resultId ? `ID: ${resultId}` : ''].filter(Boolean).join(' · ');
    return `<article class="social-log-item"><div class="social-log-main"><div class="preview-platforms">${platforms || '<span>بدون قناة</span>'}</div><h3>${escapeHtml(item.title || 'منشور بدون عنوان')}</h3><p>${escapeHtml(item.caption || '').slice(0, 180)}${String(item.caption || '').length > 180 ? '...' : ''}</p>${error}${url ? `<a class="social-log-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">فتح المنشور</a>` : ''}<small>${escapeHtml(meta)}</small></div><div class="social-log-side"><span class="social-log-status">${escapeHtml(socialStatusLabel(item))}</span><button class="btn btn-light" type="button" data-delete-social-log="${escapeHtml(item.id)}">حذف محلي</button></div></article>`;
  }).join('');
}


const publishContentTypeLabels = { reel:'Reel / فيديو', story:'Story', carousel:'صور متعددة / Carousel', image:'صورة واحدة', post:'منشور عادي', draft:'مسودة فقط' };
const publishSourceLabels = { campaign:'حملة', agenda:'نشر يومي', manual:'نشر يدوي' };
const publishStatusLabels = { draft:'مسودة', review:'بانتظار مراجعة', scheduled:'مجدول', published:'منشور', failed:'فشل' };
let publishComposerEditingId = null;
const publishContentRules = {
  reel: { text:'Reel / فيديو: يحتاج فيديو رأسي. مناسب لـ Facebook + Instagram + TikTok Draft.', allowed:['facebook','instagram','tiktok'] },
  story: { text:'Story: يحتاج صورة أو فيديو رأسي. مناسب حاليًا لـ Instagram، ويمكن تفعيل Facebook لاحقًا.', allowed:['instagram'] },
  carousel: { text:'Carousel / صور متعددة: يحتاج أكثر من صورة. مناسب لـ Facebook + Instagram. TikTok Photo لاحقًا بعد اعتماد الإنتاج.', allowed:['facebook','instagram'] },
  image: { text:'صورة واحدة: مناسب لـ Facebook + Instagram. TikTok Photo لاحقًا.', allowed:['facebook','instagram'] }
};
function todayIsoDate(){ const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function publishItemMissingFields(item){
  const missing = [];
  if(!normalizeText(item?.scheduleDate)) missing.push('تاريخ النشر');
  if(!normalizeText(item?.type || item?.contentType)) missing.push('نوع المحتوى');
  if(!Array.isArray(item?.platforms) || !item.platforms.length) missing.push('المنصات');
  if(!normalizeText(item?.caption)) missing.push('الكابشن');
  const mediaCount = Array.isArray(item?.mediaItems) ? item.mediaItems.filter(m => normalizeText(m?.url)).length : (normalizeText(item?.mediaUrl) ? 1 : 0);
  if(!mediaCount) missing.push('الميديا');
  return missing;
}
function publishStatusKeyFromLabel(status){
  const text = normalizeText(status);
  if(text.includes('مجدول')) return 'scheduled';
  if(text.includes('مراجعة')) return 'review';
  if(text.includes('منشور')) return 'published';
  if(text.includes('فشل')) return 'failed';
  return 'draft';
}
function openPublishComposer(defaults = {}){
  const modal = document.getElementById('publishComposerModal');
  const form = document.getElementById('publishCenterComposerForm');
  if(!modal || !form) return;
  const itemId = typeof defaults === 'string' ? defaults : (defaults && defaults.id && getSocialPublishLog().some(item => String(item.id) === String(defaults.id)) ? defaults.id : null);
  const item = itemId ? getSocialPublishLog().find(entry => String(entry.id) === String(itemId)) : (typeof defaults === 'object' ? defaults : {});
  if(itemId && !item){ showToast('تعذر العثور على عنصر النشر المطلوب.'); return; }
  publishComposerEditingId = itemId || null;
  form.reset();
  const modalTitle = document.getElementById('publishComposerTitle');
  const headText = document.querySelector('.publish-composer-head p');
  if(modalTitle) modalTitle.textContent = publishComposerEditingId ? 'استكمال بيانات المنشور' : 'إنشاء منشور جديد';
  if(headText) headText.textContent = publishComposerEditingId ? 'كمّل البيانات الناقصة مثل الكابشن والميديا والمنصات، ثم احفظ العنصر ليظهر جاهزًا داخل مركز النشر والتقويم.' : 'حدد نوع المنشور والمحتوى والمنصات، واحفظه مؤقتًا داخل مركز النشر والتقويم. الربط مع Firebase سيتم في المرحلة القادمة.';
  document.getElementById('pcSourceType').value = item?.sourceType || 'agenda';
  document.getElementById('pcContentType').value = item?.type || item?.contentType || 'reel';
  document.getElementById('pcStatus').value = item?.status ? publishStatusKeyFromLabel(item.status) : (item?.status || 'draft');
  document.getElementById('pcDate').value = item?.scheduleDate || todayIsoDate();
  document.getElementById('pcTime').value = item?.scheduleTime || ''; // الوقت اختياري
  document.getElementById('pcTitle').value = item?.title || '';
  document.getElementById('pcCaption').value = item?.caption || '';
  document.getElementById('pcHashtags').value = Array.isArray(item?.hashtags) ? item.hashtags.join(' ') : '';
  document.getElementById('pcLink').value = item?.link || '';
  document.getElementById('pcLocation').value = item?.location || '';
  document.getElementById('pcNotes').value = item?.notes || '';
  const mediaLines = Array.isArray(item?.mediaItems) ? item.mediaItems.map(m => m?.url).filter(Boolean) : (item?.mediaUrl ? [item.mediaUrl] : []);
  document.getElementById('pcMediaUrls').value = mediaLines.join('\n');
  updatePublishComposerType();
  const platforms = Array.isArray(item?.platforms) ? item.platforms : [];
  platforms.forEach(platform => {
    const input = document.querySelector(`input[name="pcPlatforms"][value="${platform}"]`);
    if(input && !input.disabled) input.checked = true;
  });
  renderPublishComposerPreview();
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  setTimeout(() => document.getElementById(publishComposerEditingId ? 'pcCaption' : 'pcTitle')?.focus(), 80);
}
function closePublishComposer(){
  const modal = document.getElementById('publishComposerModal');
  if(!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  publishComposerEditingId = null;
}
function selectedPublishCenterPlatforms(){
  return [...document.querySelectorAll('input[name="pcPlatforms"]:checked')].map(input => input.value).filter(Boolean);
}
function updatePublishComposerType(){
  const type = document.getElementById('pcContentType')?.value || 'reel';
  const rule = publishContentRules[type] || publishContentRules.reel;
  const helper = document.getElementById('publishTypeHelper');
  if(helper) helper.textContent = rule.text;
  document.querySelectorAll('input[name="pcPlatforms"]').forEach(input => {
    const label = input.closest('label');
    const allowed = rule.allowed.includes(input.value);
    input.disabled = !allowed;
    label?.classList.toggle('disabled', !allowed);
    if(!allowed) input.checked = false;
  });
  if(!selectedPublishCenterPlatforms().length){
    const first = rule.allowed[0];
    const target = document.querySelector(`input[name="pcPlatforms"][value="${first}"]`);
    if(target) target.checked = true;
  }
}
function renderPublishComposerPreview(){
  const preview = document.getElementById('publishComposerPreview');
  if(!preview) return;
  const title = normalizeText(document.getElementById('pcTitle')?.value) || 'منشور جديد';
  const caption = normalizeText(document.getElementById('pcCaption')?.value);
  const tags = normalizeText(document.getElementById('pcHashtags')?.value);
  const type = document.getElementById('pcContentType')?.value || 'reel';
  const sourceType = document.getElementById('pcSourceType')?.value || 'agenda';
  const platforms = selectedPublishCenterPlatforms();
  const previewDate = document.getElementById('pcDate')?.value || '';
  const previewTime = document.getElementById('pcTime')?.value || '';
  const when = previewDate ? `${previewDate}${previewTime ? ' · ' + previewTime : ' · بدون وقت'}` : 'تاريخ النشر مطلوب';
  const mediaLines = String(document.getElementById('pcMediaUrls')?.value || '').split(/\n+/).map(normalizeText).filter(Boolean);
  preview.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${caption ? escapeHtml(caption).slice(0, 180) + (caption.length > 180 ? '...' : '') : 'لا يوجد كابشن بعد.'}</p><div class="publish-preview-meta"><span>${escapeHtml(publishSourceLabels[sourceType] || sourceType)}</span><span>${escapeHtml(publishContentTypeLabels[type] || type)}</span><span>${escapeHtml(platforms.map(p => socialPlatformLabels[p] || p).join(' + ') || 'بدون منصة')}</span><span>${escapeHtml(when)}</span><span>${mediaLines.length} ميديا</span></div>${tags ? `<div class="publish-center-tags">${extractHashtags(tags).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>` : ''}`;
}
function mediaLinesFromComposer(){
  return String(document.getElementById('pcMediaUrls')?.value || '').split(/\n+/).map(normalizeText).filter(Boolean).map(url => ({ url, type: /\.(mp4|mov|webm)(\?|$)/i.test(url) ? 'video' : 'image' }));
}
function handlePublishCenterComposerSubmit(event){
  event.preventDefault();
  const platforms = selectedPublishCenterPlatforms();
  if(!platforms.length){ showToast('اختار منصة واحدة على الأقل.'); return; }
  const type = normalizeText(document.getElementById('pcContentType')?.value) || 'reel';
  const sourceType = normalizeText(document.getElementById('pcSourceType')?.value) || 'agenda';
  const title = normalizeText(document.getElementById('pcTitle')?.value);
  const caption = normalizeText(document.getElementById('pcCaption')?.value);
  if(!title){ showToast('اكتب اسم المنشور أو الحملة.'); document.getElementById('pcTitle')?.focus(); return; }
  if(!caption){ showToast('اكتب الكابشن قبل حفظ العنصر.'); document.getElementById('pcCaption')?.focus(); return; }
  if(!normalizeText(document.getElementById('pcDate')?.value)){ showToast('حدد تاريخ النشر. الوقت اختياري.'); document.getElementById('pcDate')?.focus(); return; }
  const mediaItems = mediaLinesFromComposer();
  if(['reel','story','carousel','image'].includes(type) && !mediaItems.length){ showToast('أضف رابط ميديا واحد على الأقل مؤقتًا.'); document.getElementById('pcMediaUrls')?.focus(); return; }
  if(type === 'carousel' && mediaItems.length < 2){ showToast('Carousel يحتاج صورتين على الأقل.'); document.getElementById('pcMediaUrls')?.focus(); return; }
  const statusKey = normalizeText(document.getElementById('pcStatus')?.value) || 'draft';
  const existingItems = getSocialPublishLog();
  const previous = publishComposerEditingId ? existingItems.find(item => String(item.id) === String(publishComposerEditingId)) : null;
  const item = {
    ...(previous || {}),
    id: previous?.id || `pc_${Date.now()}`,
    sourceType,
    sourceLabel: publishSourceLabels[sourceType] || 'نشر',
    title,
    caption,
    hashtags: extractHashtags(`${document.getElementById('pcHashtags')?.value || ''} ${caption}`),
    platforms,
    type,
    contentType: type,
    mode: statusKey === 'scheduled' ? 'schedule' : 'draft',
    status: publishStatusLabels[statusKey] || statusKey,
    scheduleDate: normalizeText(document.getElementById('pcDate')?.value),
    scheduleTime: normalizeText(document.getElementById('pcTime')?.value),
    mediaUrl: mediaItems[0]?.url || '',
    mediaItems,
    link: normalizeText(document.getElementById('pcLink')?.value),
    location: normalizeText(document.getElementById('pcLocation')?.value),
    notes: normalizeText(document.getElementById('pcNotes')?.value),
    importStatus: 'ready',
    missingFields: [],
    createdAt: previous?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: previous?.createdBy || getCurrentUser()?.name || getCurrentUser()?.email || ''
  };
  const missingAfterSave = publishItemMissingFields(item);
  if(missingAfterSave.length){
    item.importStatus = 'needs_completion';
    item.missingFields = missingAfterSave;
    item.status = 'يحتاج استكمال';
    item.notes = item.notes || `ناقص: ${missingAfterSave.join('، ')}`;
  }
  if(previous){
    setSocialPublishLog(existingItems.map(entry => String(entry.id) === String(previous.id) ? item : entry));
    renderSocialPublishLog();
  } else {
    appendSocialLog(item);
  }
  renderCalendarPage();
  renderPublishCenterPage();
  closePublishComposer();
  showToast(previous ? 'تم استكمال بيانات المنشور وتحديثه.' : 'تم حفظ المنشور في مركز النشر والتقويم مؤقتًا.');
}
function bindPublishCenter(){
  document.getElementById('openPublishCenterComposerBtn')?.addEventListener('click', () => openPublishComposer());
  document.getElementById('importPublishScheduleBtn')?.addEventListener('click', () => { const input = document.getElementById('publishScheduleImportInput'); if(input){ input.value = ''; input.click(); } });
  document.getElementById('publishScheduleImportInput')?.addEventListener('change', event => importPublishScheduleFile(event.target.files?.[0] || null));
  document.getElementById('publishCenterList')?.addEventListener('click', event => {
    const editBtn = event.target.closest('[data-complete-publish-item], [data-edit-publish-item]');
    if(editBtn){ openPublishComposer(editBtn.dataset.completePublishItem || editBtn.dataset.editPublishItem); return; }
    const btn = event.target.closest('[data-open-publish-composer]');
    if(btn) openPublishComposer();
  });
  document.querySelectorAll('[data-close-publish-composer]').forEach(el => el.addEventListener('click', closePublishComposer));
  const form = document.getElementById('publishCenterComposerForm');
  if(form){
    form.addEventListener('submit', handlePublishCenterComposerSubmit);
    form.addEventListener('reset', () => setTimeout(() => { updatePublishComposerType(); renderPublishComposerPreview(); }, 0));
    form.addEventListener('input', renderPublishComposerPreview);
    form.addEventListener('change', event => { if(event.target.id === 'pcContentType') updatePublishComposerType(); renderPublishComposerPreview(); });
  }
}

function publishCenterCampaignItems(){
  return publishEntriesFromCampaigns().map((entry, index) => ({
    id: `campaign_${entry.campaignId || index}_${entry.date || index}`,
    sourceType: 'campaign',
    sourceLabel: 'حملة',
    title: entry.output || entry.campaignName || 'منشور حملة',
    caption: entry.caption || entry.notes || '',
    hashtags: extractHashtags(entry.caption || entry.notes || ''),
    type: entry.type || entry.output || 'post',
    platforms: entry.platform ? String(entry.platform).split(/[,+/،]/).map(v => normalizeText(v)).filter(Boolean) : [],
    scheduleDate: entry.date || '',
    scheduleTime: entry.time || '',
    status: 'مجدول من حملة',
    campaignName: entry.campaignName || '',
    createdBy: '',
    updatedAt: entry.date || ''
  }));
}
function extractHashtags(text){
  const tags = String(text || '').match(/#[\p{L}\p{N}_]+/gu) || [];
  return uniqueList(tags).slice(0, 12);
}
function publishCenterSocialItems(){
  return getSocialPublishLog().map(item => ({
    ...item,
    sourceType: item.sourceType || (item.mode === 'schedule' ? 'agenda' : 'manual'),
    sourceLabel: item.sourceType === 'campaign' ? 'حملة' : (item.mode === 'schedule' ? 'نشر يومي' : 'نشر يدوي'),
    hashtags: item.hashtags || extractHashtags(item.caption || ''),
    status: socialStatusLabel(item),
    scheduleDate: item.scheduleDate || (item.createdAt ? String(item.createdAt).slice(0,10) : ''),
    scheduleTime: item.scheduleTime || '',
    updatedAt: item.createdAt || ''
  }));
}
function getPublishCenterItems(){
  return [...publishCenterSocialItems(), ...publishCenterCampaignItems()].sort((a,b) => {
    const da = `${a.scheduleDate || ''} ${a.scheduleTime || '99:99'}`.trim() || a.updatedAt || '';
    const db = `${b.scheduleDate || ''} ${b.scheduleTime || '99:99'}`.trim() || b.updatedAt || '';
    return String(db).localeCompare(String(da));
  });
}
function publishCenterStatusClass(status){
  const text = normalizeText(status);
  if(text.includes('فشل')) return 'failed';
  if(text.includes('تم النشر') || text.includes('منشور')) return 'published';
  if(text.includes('مجدول')) return 'scheduled';
  if(text.includes('مسودة')) return 'draft';
  if(text.includes('مراجعة')) return 'review';
  if(text.includes('استكمال') || text.includes('ناقص')) return 'needs';
  return 'ready';
}

const publishPrepSubmissionKey = 'mzj_publish_prep_submissions_v1';
function safeFirestoreDocId(value){
  return String(value || 'item').trim().replace(/[\/#?%*:|"<>\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 140) || 'item';
}
function readLocalPublishPrepSubmissions(){
  try{ return JSON.parse(localStorage.getItem(publishPrepSubmissionKey) || '{}') || {}; }catch(_){ return {}; }
}
function getPublishPrepSubmissions(){
  if(publishPrepSubmissionsCache) return publishPrepSubmissionsCache;
  publishPrepSubmissionsCache = readLocalPublishPrepSubmissions();
  return publishPrepSubmissionsCache;
}
function cleanPublishPrepSubmissionForFirestore(taskId, submission){
  const jsonSafe = JSON.parse(JSON.stringify(submission || {}));
  delete jsonSafe.__localOnly;
  return {
    ...jsonSafe,
    taskId: String(taskId || ''),
    ownerEmail: jsonSafe.ownerEmail || getCurrentUserIdentity()?.email || '',
    ownerUid: jsonSafe.ownerUid || getCurrentUserIdentity()?.uid || getCurrentUserIdentity()?.id || '',
    updatedAtIso: new Date().toISOString(),
    updatedAt: serverTime()
  };
}
async function savePublishPrepSubmissionToFirestore(taskId, submission){
  if(!mainDb || !taskId) return false;
  try{
    await safeCollection(window.MZJ_PUBLISH_PREP_COLLECTION).doc(safeFirestoreDocId(taskId)).set(cleanPublishPrepSubmissionForFirestore(taskId, submission), { merge: true });
    publishPrepFirestoreReady = true;
    return true;
  }catch(error){
    publishPrepFirestoreReady = false;
    console.warn('Publish prep Firestore sync skipped/error', error);
    if(error?.code === 'permission-denied'){
      showToast('تعذر الحفظ في Firestore: راجع قواعد publish_prep_tasks. تم الحفظ محليًا فقط.');
    } else {
      showToast('تعذر الحفظ في Firestore مؤقتًا. تم الحفظ محليًا فقط.');
    }
    return false;
  }
}
function setPublishPrepSubmissions(data){
  const next = data || {};
  publishPrepSubmissionsCache = next;
  localStorage.setItem(publishPrepSubmissionKey, JSON.stringify(next));
  if(mainDb){
    Object.entries(next).forEach(([taskId, submission]) => {
      savePublishPrepSubmissionToFirestore(taskId, submission);
    });
  }
}
function loadPublishPrepSubmissions(){
  if(!mainDb || publishPrepUnsubscribe) return;
  const local = readLocalPublishPrepSubmissions();
  publishPrepSubmissionsCache = { ...local };
  publishPrepUnsubscribe = safeCollection(window.MZJ_PUBLISH_PREP_COLLECTION).onSnapshot(snapshot => {
    const remote = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data() || {};
      const taskId = data.taskId || doc.id;
      const clean = { ...data };
      delete clean.updatedAt;
      remote[taskId] = clean;
    });
    publishPrepFirestoreReady = true;
    publishPrepSubmissionsCache = { ...readLocalPublishPrepSubmissions(), ...remote };
    localStorage.setItem(publishPrepSubmissionKey, JSON.stringify(publishPrepSubmissionsCache));
    if(getRoute() === 'publish-prep') renderPublishPrepPage();
    if(getRoute() === 'calendar') renderCalendarPage();
  }, error => {
    publishPrepFirestoreReady = false;
    console.warn('Publish prep Firestore load error', error);
  });
}
async function updatePublishPrepSubmission(taskId, patch){
  const submissions = getPublishPrepSubmissions();
  const nextRecord = { ...(submissions[taskId] || {}), ...(patch || {}) };
  submissions[taskId] = nextRecord;
  publishPrepSubmissionsCache = submissions;
  localStorage.setItem(publishPrepSubmissionKey, JSON.stringify(submissions));
  const savedRemote = await savePublishPrepSubmissionToFirestore(taskId, nextRecord);
  nextRecord.__firestoreSaved = !!savedRemote;
  return nextRecord;
}
function currentUserMatchTokens(){
  const user = getCurrentUserIdentity();
  return uniqueList([user.id, user.uid, user.email, user.name, getCurrentUser()?.username, getCurrentUser()?.displayName].map(v => String(v || '').toLowerCase()));
}
function valueMatchesCurrentUser(value){
  const v = String(value || '').toLowerCase().trim();
  if(!v) return false;
  return currentUserMatchTokens().some(token => token && (v === token || v.includes(token) || token.includes(v)));
}
function taskAssignedToCurrentUser(task){
  if(isCurrentUserAdmin()) return true;
  const candidates = [
    task.assignedTo, task.assignedToName, task.assignedToEmail, task.owner, task.ownerName, task.user, task.userName,
    task.employee, task.employeeName, task.responsible, task.responsibleName, task.createdBy
  ];
  if(Array.isArray(task.assignees)) candidates.push(...task.assignees.map(a => typeof a === 'object' ? (a.email || a.name || a.id || a.uid) : a));
  if(Array.isArray(task.users)) candidates.push(...task.users.map(a => typeof a === 'object' ? (a.email || a.name || a.id || a.uid) : a));
  return candidates.some(valueMatchesCurrentUser);
}
function prepTaskTypeLabel(task){
  const raw = normalizeText(task.contentType || task.postType || task.type || task.taskType || task.department || '');
  const low = raw.toLowerCase();
  if(low.includes('reel') || raw.includes('ريل') || raw.includes('فيديو')) return 'Reel / فيديو';
  if(low.includes('story') || raw.includes('ستوري')) return 'Story';
  if(low.includes('carousel') || raw.includes('كاروسيل') || raw.includes('صور متعددة')) return 'Carousel / صور متعددة';
  if(raw.includes('صورة')) return 'صورة واحدة';
  if(raw.includes('تصميم')) return 'تصميم';
  if(raw.includes('مونتاج')) return 'مونتاج';
  if(raw.includes('تصوير')) return 'تصوير';
  return raw || 'محتوى نشر';
}
function prepTaskRequiredFileLabel(task){
  const type = prepTaskTypeLabel(task);
  if(type.includes('Reel') || type.includes('فيديو') || type.includes('مونتاج')) return 'فيديو نهائي';
  if(type.includes('Carousel')) return 'مجموعة صور نهائية';
  if(type.includes('Story')) return 'صورة/فيديو ستوري نهائي';
  if(type.includes('تصميم')) return 'ملف التصميم النهائي';
  return 'الملف النهائي';
}
function prepTaskDate(task, campaign){
  // تاريخ النشر في تجهيز النشر لازم ييجي من جدول النشر أو حقول النشر فقط.
  // لا نستخدم التاريخ المطلوب/ميعاد التسليم أو نهاية الحملة كبديل حتى لا يظهر تاريخ نشر غلط.
  return task.publishDate || task.scheduleDate || task.scheduledDate || task.dayDate || task.postDate || task.raw?.publishDate || task.raw?.scheduleDate || '';
}
function normalizePrepPlatformList(value){
  const list = Array.isArray(value) ? value : String(value || '').split(/[,،+]/);
  return uniqueList(list.map(v => normalizeText(v))).map(v => {
    const low = v.toLowerCase();
    if(low.includes('facebook') || v.includes('فيس')) return 'Facebook';
    if(low.includes('instagram') || v.includes('انست')) return 'Instagram';
    if(low.includes('tiktok') || v.includes('تيك')) return 'TikTok';
    if(low.includes('youtube') || low.includes('you tube') || v.includes('يوتيوب') || v.includes('يوتيوب')) return 'YouTube';
    return v;
  }).filter(Boolean);
}
function campaignForPrepTask(task){
  return campaigns.find(c => String(c.id || c.campaignId || c.campaignCode || '') === String(task.campaignId || task.parentId || task.campaignCode || '')) || campaignForTask?.(task) || null;
}

function prepMatchText(value){
  return normalizeText(value).toLowerCase().replace(/[\s_\-–—|\/\\]+/g, ' ').trim();
}
function prepScheduleCaptionValue(row){
  return normalizeText(row?.caption || row?.postCaption || row?.postText || row?.copy || row?.text || row?.['الكابشن'] || row?.['نص المنشور'] || '');
}
function prepScheduleHashtagValue(row){
  const raw = row?.hashtagsText || row?.hashtags || row?.hashTags || row?.tags || row?.['الهاشتاج'] || row?.['الهاشتاجات'] || row?.['هاشتاجات'] || '';
  return Array.isArray(raw) ? raw.join(' ') : normalizeText(raw);
}
function prepScheduleRowsForCampaign(campaign){
  return Array.isArray(campaign?.publishSchedule) ? campaign.publishSchedule : [];
}
function prepTaskScheduleCandidates(task, campaign){
  const values = [
    task.title, task.raw?.title, task.raw?.name, task.raw?.taskName, task.raw?.output,
    task.raw?.creative, task.raw?.product, task.raw?.selectedCar, task.raw?.taskType,
    task.type, task.requiredFile
  ];
  return uniqueList(values.map(prepMatchText).filter(Boolean));
}
function prepScheduleMatchScore(row, task, campaign){
  const rowTexts = [row.output, row.title, row.contentType, row.type, row.platform, row.platforms, row.note, row.notes].map(prepMatchText).filter(Boolean);
  const rowBlob = rowTexts.join(' ');
  const candidates = prepTaskScheduleCandidates(task, campaign);
  let score = 0;
  candidates.forEach(c => {
    if(!c) return;
    if(rowBlob === c) score += 10;
    else if(rowBlob.includes(c) || c.includes(rowBlob)) score += 6;
    else {
      const parts = c.split(' ').filter(x => x.length > 2);
      const hits = parts.filter(part => rowBlob.includes(part)).length;
      if(hits >= 2) score += hits;
    }
  });
  if(row.date && task.publishDate && row.date === task.publishDate) score += 2;
  return score;
}
function enrichPrepTaskFromSchedule(base, campaign, rawTask){
  const rows = prepScheduleRowsForCampaign(campaign);
  if(!rows.length) return base;
  let best = rows.map((row, index) => ({ row, index, score: prepScheduleMatchScore(row, { ...base, raw: rawTask }, campaign) }))
    .filter(item => item.score > 0)
    .sort((a,b) => b.score - a.score)[0];
  if(!best){
    const baseType = prepMatchText(base.type || base.raw?.taskType || base.raw?.contentType || '');
    const byType = rows.map((row, index) => ({ row, index }))
      .find(item => {
        const out = prepMatchText(`${item.row.output || ''} ${item.row.contentType || ''} ${item.row.type || ''}`);
        return baseType && (out.includes(baseType) || baseType.includes(out));
      });
    if(byType) best = { ...byType, score: 1 };
  }
  if(!best && rows.length === 1) best = { row: rows[0], index: 0, score: 1 };
  if(!best) return base;
  const row = best.row;
  const scheduleCaption = prepScheduleCaptionValue(row);
  const scheduleHashtags = prepScheduleHashtagValue(row);
  const schedulePlatforms = normalizePrepPlatformList(row.platforms || row.platform);
  return {
    ...base,
    scheduleRowIndex: best.index,
    scheduleOutput: row.output || row.title || base.title,
    title: base.title || row.output || row.title || base.title,
    caption: base.caption || scheduleCaption,
    hashtags: base.hashtags || scheduleHashtags,
    publishDate: row.date || row.publishDate || base.publishDate || '',
    publishTime: row.time || row.publishTime || base.publishTime || '',
    platforms: base.platforms?.length ? base.platforms : schedulePlatforms,
    notes: base.notes || row.note || row.notes || ''
  };
}
function publishPrepTasksFromExistingTasks(){
  const visible = typeof getVisibleTasksForCurrentUser === 'function' ? getVisibleTasksForCurrentUser() : campaignTasks;
  return (visible || []).filter(task => taskAssignedToCurrentUser(task)).map(task => {
    const campaign = campaignForPrepTask(task) || {};
    const base = {
      id: `task_${task.id || task.taskId || task.code || Math.random().toString(36).slice(2)}`,
      sourceType: task.sourceType || 'campaign',
      sourceLabel: task.sourceLabel || (campaign.campaignName || campaign.name ? 'حملة' : 'تاسك'),
      title: shortTaskName?.(task) || task.title || task.name || task.taskName || 'تاسك تجهيز نشر',
      campaignName: campaign.campaignName || campaign.name || task.campaignName || '',
      type: prepTaskTypeLabel(task),
      requiredFile: prepTaskRequiredFileLabel(task),
      platforms: normalizePrepPlatformList(task.platforms || task.platform || campaign.platforms || campaign.platform),
      caption: task.caption || task.copy || task.description || campaign.caption || campaign.description || '',
      hashtags: task.hashtags || campaign.hashtags || '',
      publishDate: prepTaskDate(task, campaign),
      publishTime: task.publishTime || task.scheduleTime || '',
      deadline: task.deadline || task.dueDate || task.requiredDate || '',
      notes: task.notes || task.note || task.instructions || task.description || '',
      raw: task
    };
    return enrichPrepTaskFromSchedule(base, campaign, task);
  });
}
function publishPrepTasksFromCampaignSchedules(){
  const tokens = currentUserMatchTokens();
  return campaigns.flatMap(campaign => (campaign.publishSchedule || []).map((row, index) => {
    const assigned = row.assignedTo || row.owner || row.user || row.employee || row.responsible || '';
    if(!isCurrentUserAdmin() && assigned && !valueMatchesCurrentUser(assigned)) return null;
    if(!isCurrentUserAdmin() && !assigned) return null;
    return {
      id: `schedule_${campaign.id || campaign.campaignCode || 'campaign'}_${index}`,
      sourceType: 'campaign',
      sourceLabel: 'حملة',
      title: row.output || row.title || `منشور ${campaign.campaignName || campaign.name || 'حملة'}`,
      campaignName: campaign.campaignName || campaign.name || campaign.campaignCode || '',
      type: prepTaskTypeLabel(row),
      requiredFile: prepTaskRequiredFileLabel(row),
      platforms: normalizePrepPlatformList(row.platforms || row.platform),
      caption: row.caption || '',
      hashtags: row.hashtags || '',
      publishDate: row.date || row.publishDate || '',
      publishTime: row.time || row.publishTime || '',
      deadline: row.deadline || row.deliveryDate || row.date || '',
      notes: row.note || row.notes || '',
      raw: row
    };
  }).filter(Boolean));
}
function getPublishingPrepTasks(){
  // تجهيز النشر يعرض التاسكات المسندة للموظف فقط حتى يتطابق مع الداشبورد.
  // جدول النشر يستخدم لتوليد/تصدير الخطة، لكنه لا يضيف تاسك منفصل هنا إلا بعد تحويله لتاسك فعلي.
  const map = new Map();
  publishPrepTasksFromExistingTasks().forEach(task => {
    if(!map.has(task.id)) map.set(task.id, task);
  });
  return [...map.values()];
}
function publishPrepStatus(task, submission){
  if(submission?.status === 'تم النشر') return 'تم النشر';
  if(submission?.readyForPublish) return 'جاهز للنشر';
  if(submission?.status) return submission.status;
  const raw = normalizeStatus(task.raw?.status || task.raw?.state || '');
  if(raw.includes('جاهز') || raw.includes('ready')) return 'جاهز للنشر';
  if(raw.includes('تعديل') || raw.includes('needs')) return 'يحتاج تعديل';
  if(submission?.fileName || publishPrepHasFinalFile(task, submission)) return 'تم رفع الملف النهائي';
  return 'بانتظار الاستكمال';
}
function publishPrepTaskProgress(task){
  return Math.min(100, Math.max(0, Number(task.raw?.progress || task.progress || 0)));
}
function publishPrepEffectiveCaption(task, submission){
  return normalizeText(submission?.caption ?? task.caption ?? '');
}
function publishPrepEffectiveHashtags(task, submission){
  return normalizeText(submission?.hashtags ?? task.hashtags ?? '');
}
function publishPrepHasFinalFile(task, submission){
  if(submission?.fileName || submission?.finalFileName) return true;
  const files = taskFiles(task.raw || task);
  return Array.isArray(files) && files.some(file => file?.isFinal || file?.uploadKind === 'final' || file?.kind === 'final' || file?.purpose === 'final');
}

function publishPrepFinalFileRecord(task, submission){
  if(submission?.finalFileUrl || submission?.fileUrl || submission?.downloadURL || submission?.downloadUrl){
    return {
      fileUrl: submission.finalFileUrl || submission.fileUrl || submission.downloadURL || submission.downloadUrl,
      fileName: submission.finalFileName || submission.fileName || 'final-file',
      mimeType: submission.mimeType || submission.fileType || ''
    };
  }
  const files = taskFiles(task.raw || task);
  const found = Array.isArray(files) ? files.find(file => file?.isFinal || file?.uploadKind === 'final' || file?.kind === 'final' || file?.purpose === 'final') : null;
  if(!found) return null;
  return {
    ...found,
    fileUrl: found.fileUrl || found.downloadURL || found.downloadUrl || found.url || found.storageUrl || '',
    fileName: found.fileName || found.name || found.title || 'final-file',
    mimeType: found.mimeType || found.type || found.fileType || ''
  };
}
function normalizePublishPlatformForApi(platform){
  const text = normalizeText(platform).toLowerCase();
  if(text.includes('facebook') || text.includes('فيس')) return 'facebook';
  if(text.includes('instagram') || text.includes('انست')) return 'instagram';
  if(text.includes('tiktok') || text.includes('تيك')) return 'tiktok';
  if(text.includes('youtube') || text.includes('you tube') || text.includes('يوتيوب')) return 'youtube';
  return text;
}
function publishPrepTaskSnapshot(task){
  return {
    title: task.title || '',
    campaignName: task.campaignName || '',
    sourceType: task.sourceType || '',
    sourceLabel: task.sourceLabel || '',
    contentType: task.type || task.requiredFile || '',
    type: task.type || '',
    requiredFile: task.requiredFile || '',
    platforms: Array.isArray(task.platforms) ? task.platforms : [],
    publishDate: task.publishDate || '',
    publishTime: task.publishTime || ''
  };
}

async function publishPrepReadyTaskNow(task, submission){
  const finalFile = publishPrepFinalFileRecord(task, submission);
  if(!finalFile?.fileUrl) throw new Error('لا يوجد رابط للملف النهائي. ارفع الملف النهائي مرة أخرى.');
  const platforms = (task.platforms || []).map(normalizePublishPlatformForApi).filter(Boolean);
  if(!platforms.length) throw new Error('لا توجد منصات محددة للنشر.');
  const payload = {
    taskId: task.id,
    title: task.title,
    contentType: task.type || task.requiredFile || '',
    platforms,
    caption: publishPrepEffectiveCaption(task, submission),
    hashtags: publishPrepEffectiveHashtags(task, submission),
    mediaUrl: finalFile.fileUrl,
    finalFileUrl: finalFile.fileUrl,
    fileName: finalFile.fileName,
    mimeType: finalFile.mimeType || finalFile.type || '',
    youtubePrivacyStatus: ['public','unlisted','private'].includes(String(systemSettings.youtubePrivacyStatus || '').toLowerCase()) ? String(systemSettings.youtubePrivacyStatus).toLowerCase() : 'unlisted',
    taskSnapshot: publishPrepTaskSnapshot(task)
  };
  const res = await fetch('/api/meta/publish/ready', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if(!res.ok || data.ok === false){
    const message = data.error || (Array.isArray(data.results) ? data.results.map(x => `${x.platform || ''}: ${x.error || (x.ok ? 'OK' : 'Failed')}`).join(' | ') : '') || 'فشل النشر.';
    throw new Error(message);
  }
  return data;
}
function publishPrepMissingFields(task, submission){
  const missing = [];
  if(!publishPrepEffectiveCaption(task, submission)) missing.push('الكابشن');
  if(!publishPrepEffectiveHashtags(task, submission)) missing.push('الهاشتاج');
  if(!normalizeText(task.publishDate)) missing.push('تاريخ النشر');
  if(publishPrepTaskProgress(task) < 100) missing.push('اكتمال التاسك 100%');
  if(!publishPrepHasFinalFile(task, submission)) missing.push('الملف النهائي');
  return missing;
}
function publishPrepCompleteness(task, submission){
  const missing = publishPrepMissingFields(task, submission);
  return { missing, complete: !missing.length, percent: Math.max(0, Math.round(((5 - missing.length) / 5) * 100)) };
}
function renderPublishPrepCard(task, submission){
  const status = publishPrepStatus(task, submission);
  const platforms = task.platforms?.length ? task.platforms.join(' + ') : 'غير محدد';
  const completeness = publishPrepCompleteness(task, submission);
  const captionValue = publishPrepEffectiveCaption(task, submission);
  const hashtagsValue = publishPrepEffectiveHashtags(task, submission);
  const finalFileReady = publishPrepHasFinalFile(task, submission);
  const badgeClass = completeness.complete ? 'published' : 'failed';
  const missingHtml = completeness.missing.length
    ? `<div class="prep-missing-list"><b>ناقص:</b> ${completeness.missing.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>`
    : `<div class="prep-complete-line">✅ كل البيانات مكتملة ويمكن تجهيز التاسك للنشر.</div>`;
  const finalFileHtml = finalFileReady
    ? `<div class="prep-file-ready">✅ الملف النهائي موجود${submission.fileName ? `: <b>${escapeHtml(submission.fileName)}</b>` : ''}</div>`
    : `<div class="prep-file-missing">الملف النهائي يترفع من Popup تفاصيل التاسك في داشبورد اليوزرات بعد وصول التاسك 100%.</div>`;
  return `<article class="publish-prep-task" data-prep-task="${escapeHtml(task.id)}">
      <div class="prep-task-top">
        <div>
          <span class="source-badge ${escapeHtml(task.sourceType || 'campaign')}">${escapeHtml(task.sourceLabel || 'تاسك')}</span>
          <h3>${escapeHtml(task.title || 'تاسك تجهيز')}</h3>
          <p>${escapeHtml(task.campaignName || 'بدون حملة مرتبطة')}</p>
        </div>
        <div class="prep-status-stack">
          <span class="publish-center-status ${badgeClass}">${completeness.complete ? 'مكتمل' : 'ناقص'}</span>
          <small>${escapeHtml(status)}</small>
        </div>
      </div>
      <div class="prep-progress-line"><strong>${completeness.percent}%</strong><span><i style="width:${completeness.percent}%"></i></span></div>
      ${missingHtml}
      <div class="prep-task-grid">
        <div><b>نوع المحتوى</b><span>${escapeHtml(task.type)}</span></div>
        <div><b>المنصات</b><span>${escapeHtml(platforms)}</span></div>
        <div><b>تاريخ النشر</b><span>${escapeHtml(task.publishDate || 'غير محدد')}</span></div>
        <div><b>وقت النشر</b><span>${escapeHtml(task.publishTime || 'بدون وقت')}</span></div>
        <div><b>ميعاد التسليم</b><span>${escapeHtml(task.deadline || 'غير محدد')}</span></div>
        <div><b>المطلوب</b><span>${escapeHtml(task.requiredFile || 'ملف نهائي')}</span></div>
      </div>
      <div class="prep-inline-content">
        <label><span>الكابشن</span><textarea data-prep-caption="${escapeHtml(task.id)}" rows="3" placeholder="اكتب الكابشن الخاص بالتاسك">${escapeHtml(captionValue)}</textarea></label>
        <label><span>الهاشتاج</span><textarea data-prep-hashtags="${escapeHtml(task.id)}" rows="2" placeholder="اكتب الهاشتاجات">${escapeHtml(hashtagsValue)}</textarea></label>
        <button class="btn btn-light" type="button" data-save-prep-content="${escapeHtml(task.id)}">حفظ</button>
      </div>
      <details class="prep-task-details">
        <summary>عرض كل التفاصيل</summary>
        <div class="prep-detail-block"><b>ملاحظات المسؤول</b><p>${escapeHtml(task.notes || 'لا توجد ملاحظات.')}</p></div>
        <div class="prep-detail-block"><b>حالة الملف النهائي</b>${finalFileHtml}</div>
      </details>
      <div class="prep-ready-actions">
        ${completeness.complete && !submission.readyForPublish ? `<button class="btn btn-primary" type="button" data-mark-ready-publish="${escapeHtml(task.id)}">جاهز للنشر</button>` : ''}
        ${submission.readyForPublish ? `<span class="prep-ready-badge">✅ جاهز للنشر في التاريخ المحدد</span><button class="btn btn-primary" type="button" data-publish-ready-task="${escapeHtml(task.id)}">نشر الآن</button>` : ''}
      </div>
    </article>`;
}
function publishPrepKanbanColumn(task, submission){
  if(submission?.readyForPublish) return 'ready';
  if(publishPrepHasFinalFile(task, submission)) return 'final';
  if(publishPrepTaskProgress(task) > 0) return 'progress';
  return 'missing';
}
function renderPublishPrepPage(){
  const list = document.getElementById('publishPrepList');
  if(!list) return;
  const tasks = getPublishingPrepTasks();
  const submissions = getPublishPrepSubmissions();
  const enriched = tasks.map(task => ({ task, submission: submissions[task.id] || {} }));
  const stats = document.getElementById('publishPrepStats');
  if(stats){
    const ready = enriched.filter(x => x.submission?.readyForPublish).length;
    const finalFiles = enriched.filter(x => !x.submission?.readyForPublish && publishPrepHasFinalFile(x.task, x.submission)).length;
    const changes = enriched.filter(x => publishPrepStatus(x.task, x.submission).includes('تعديل')).length;
    stats.innerHTML = `
      <article class="publish-center-stat"><span>تاسكاتي</span><strong>${enriched.length}</strong><small>${publishPrepFirestoreReady ? 'Firestore متصل' : 'حفظ محلي احتياطي'}</small></article>
      <article class="publish-center-stat"><span>ملف نهائي</span><strong>${finalFiles}</strong></article>
      <article class="publish-center-stat"><span>جاهز للنشر</span><strong>${ready}</strong></article>
      <article class="publish-center-stat"><span>يحتاج تعديل</span><strong>${changes}</strong></article>`;
  }
  if(!enriched.length){
    list.innerHTML = `<div class="empty-state">لا توجد تاسكات تجهيز نشر مسندة لك حاليًا. عندما يتم توليد تاسكات من الحملة أو الأجندة ستظهر هنا تلقائيًا.</div>`;
    return;
  }
  const columns = [
    ['missing', 'ناقص', 'تاسكات ناقصها بيانات أو لم تبدأ'],
    ['progress', 'قيد التجهيز', 'تاسكات بدأ عليها شغل ولم يتم رفع النهائي'],
    ['final', 'الملف النهائي', 'تم رفع الملف النهائي وينتظر الاعتماد'],
    ['ready', 'جاهز للنشر', 'تم تحديده للنشر في التاريخ المحدد']
  ];
  const grouped = columns.reduce((acc, [key]) => (acc[key] = [], acc), {});
  enriched.forEach(item => grouped[publishPrepKanbanColumn(item.task, item.submission)].push(item));
  list.innerHTML = `<div class="publish-prep-kanban">${columns.map(([key, title, hint]) => `
    <section class="prep-kanban-column" data-prep-column="${key}">
      <div class="prep-kanban-head"><h3>${title}</h3><span>${grouped[key].length}</span><p>${hint}</p></div>
      <div class="prep-kanban-cards">${grouped[key].length ? grouped[key].map(({task, submission}) => renderPublishPrepCard(task, submission)).join('') : '<div class="empty-state mini-empty">لا توجد تاسكات هنا.</div>'}</div>
    </section>`).join('')}</div>`;
}

function bindPublishPrepPage(){
  document.getElementById('refreshPublishPrepBtn')?.addEventListener('click', () => { renderPublishPrepPage(); showToast('تم تحديث تاسكات تجهيز النشر.'); });
  document.getElementById('publishPrepList')?.addEventListener('click', async event => {
    const saveContentBtn = event.target.closest('[data-save-prep-content]');
    const readyBtn = event.target.closest('[data-mark-ready-publish]');
    const publishBtn = event.target.closest('[data-publish-ready-task]');
    const id = saveContentBtn?.dataset.savePrepContent || readyBtn?.dataset.markReadyPublish || publishBtn?.dataset.publishReadyTask || '';
    if(!id) return;
    const submissions = getPublishPrepSubmissions();
    const current = submissions[id] || {};
    if(saveContentBtn){
      const captionInput = document.querySelector(`[data-prep-caption="${CSS.escape(id)}"]`);
      const hashtagsInput = document.querySelector(`[data-prep-hashtags="${CSS.escape(id)}"]`);
      await updatePublishPrepSubmission(id, {
        caption: normalizeText(captionInput?.value),
        hashtags: normalizeText(hashtagsInput?.value),
        contentSavedAt: new Date().toISOString(),
        contentSavedBy: getCurrentUserIdentity()?.email || getCurrentUserIdentity()?.name || 'user'
      });
      renderPublishPrepPage();
      showToast(publishPrepFirestoreReady ? 'تم حفظ الكابشن والهاشتاج على Firestore.' : 'تم حفظ الكابشن والهاشتاج محليًا فقط. راجع قواعد Firestore.');
      return;
    }
    if(publishBtn){
      const task = getPublishingPrepTasks().find(item => item.id === id);
      if(!task){ showToast('تعذر العثور على التاسك.'); return; }
      try{
        publishBtn.disabled = true;
        publishBtn.textContent = 'جاري النشر...';
        const result = await publishPrepReadyTaskNow(task, current);
        const publishedAt = result.publishedAt || new Date().toISOString();
        (Array.isArray(result.results) ? result.results : []).forEach(platformResult => {
          appendSocialLog({
            id: `prep_${safeFirestoreDocId(id)}_${safeFirestoreDocId(platformResult.platform || 'platform')}_${Date.now()}`,
            taskId: id,
            sourceType: 'publish-prep',
            title: task.title || task.campaignName || 'تاسك تجهيز نشر',
            caption: publishPrepEffectiveCaption(task, current),
            hashtags: publishPrepEffectiveHashtags(task, current),
            platforms: [platformResult.platform || ''],
            platform: platformResult.platform || '',
            type: task.type || task.requiredFile || 'post',
            mode: 'now',
            status: platformResult.ok ? 'تم النشر' : (platformResult.skipped ? 'تم التخطي' : 'فشل النشر'),
            error: platformResult.error || '',
            resultId: platformResult.id || platformResult.postId || platformResult?.result?.id || platformResult?.publish?.id || '',
            publishedUrl: platformResult.url || platformResult.permalink_url || platformResult.permalinkUrl || '',
            createdAt: publishedAt,
            publishedAt
          });
        });
        await updatePublishPrepSubmission(id, {
          publishedAt,
          publishResult: result,
          status: result.ok ? 'تم النشر' : 'فشل النشر'
        });
        renderPublishPrepPage();
        showToast(result.ok ? 'تم إرسال المنشور للمنصات المتاحة وتم تسجيل النتيجة.' : 'فشل النشر وتم تسجيل النتيجة.');
      }catch(error){
        console.error(error);
        showToast(error.message || 'تعذر النشر.');
      }
      return;
    }
    if(readyBtn){
      const task = getPublishingPrepTasks().find(item => item.id === id);
      if(!task){ showToast('تعذر العثور على التاسك.'); return; }
      const check = publishPrepCompleteness(task, current);
      if(!check.complete){ showToast(`لا يمكن جعله جاهز للنشر. ناقص: ${check.missing.join('، ')}`); return; }
      await updatePublishPrepSubmission(id, {
        readyForPublish: true,
        status: 'جاهز للنشر',
        readyAt: new Date().toISOString(),
        readyBy: getCurrentUserIdentity()?.email || getCurrentUserIdentity()?.name || 'user',
        ...publishPrepTaskSnapshot(task)
      });
      renderPublishPrepPage();
      showToast('تم تحديد التاسك كجاهز للنشر في التاريخ المحدد.');
    }
  });
}

function renderPublishCenterPage(){
  const list = document.getElementById('publishCenterList');
  const stats = document.getElementById('publishCenterStats');
  if(!list) return;
  const items = getPublishCenterItems();
  const counts = {
    total: items.length,
    campaigns: items.filter(i => i.sourceType === 'campaign').length,
    agenda: items.filter(i => i.sourceType === 'agenda').length,
    published: items.filter(i => String(i.status || '').includes('تم النشر') || String(i.status || '').includes('منشور')).length,
    failed: items.filter(i => String(i.status || '').includes('فشل')).length
  };
  if(stats){
    stats.innerHTML = [
      ['كل المنشورات', counts.total],
      ['من الحملات', counts.campaigns],
      ['النشر اليومي', counts.agenda],
      ['منشور', counts.published],
      ['فشل', counts.failed]
    ].map(([label,value]) => `<article class="publish-center-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join('');
  }
  if(!items.length){
    list.innerHTML = `<div class="publish-center-empty"><h3>مركز النشر جاهز</h3><p>لسه مفيش منشورات أو أجندات محفوظة. بعد بناء مرحلة Firebase هتظهر هنا كل منشورات الحملات والنشر اليومي بتفاصيلها.</p><div class="publish-center-empty-actions"><button class="btn btn-primary" type="button" data-open-publish-composer>إنشاء منشور</button><a class="btn btn-light" href="#calendar">فتح التقويم</a></div></div>`;
    return;
  }
  list.innerHTML = items.map(item => {
    const platforms = (item.platforms || []).map(platform => `<span>${escapeHtml(socialPlatformLabels[platform] || platform)}</span>`).join('') || '<span>غير محدد</span>';
    const hashtags = (item.hashtags || []).length ? `<div class="publish-center-tags">${item.hashtags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>` : '<div class="publish-center-tags muted">لا توجد هاشتاجات مسجلة</div>';
    const caption = normalizeText(item.caption || item.notes || '');
    const when = item.scheduleDate ? `${item.scheduleDate}${item.scheduleTime ? ' · ' + item.scheduleTime : ' · بدون وقت'}` : 'تاريخ غير محدد';
    const mediaCount = Array.isArray(item.mediaItems) ? item.mediaItems.length : (item.mediaUrl ? 1 : 0);
    const missingHtml = Array.isArray(item.missingFields) && item.missingFields.length ? `<div class="publish-missing-fields">ناقص: ${item.missingFields.map(field => `<span>${escapeHtml(field)}</span>`).join('')}</div>` : '';
    const isEditable = !String(item.id || '').startsWith('campaign_');
    const needsCompletion = Array.isArray(item.missingFields) && item.missingFields.length;
    const actionsHtml = isEditable ? `<div class="publish-center-actions"><button class="btn btn-primary btn-sm" type="button" data-complete-publish-item="${escapeHtml(item.id)}">${needsCompletion ? 'استكمال البيانات' : 'تعديل البيانات'}</button></div>` : '<div class="publish-center-actions"><span class="muted">عنصر حملة من قاعدة البيانات</span></div>';
    return `<article class="publish-center-row"><div class="publish-center-row-main"><div class="publish-center-row-head"><span class="source-badge ${escapeHtml(item.sourceType || 'manual')}">${escapeHtml(item.sourceLabel || 'نشر')}</span><strong>${escapeHtml(item.title || 'منشور بدون عنوان')}</strong></div><p>${caption ? escapeHtml(caption).slice(0, 260) + (caption.length > 260 ? '...' : '') : 'لا يوجد كابشن محفوظ لهذا العنصر.'}</p>${hashtags}${missingHtml}${actionsHtml}</div><div class="publish-center-row-meta"><div class="preview-platforms">${platforms}</div><small>${escapeHtml(postTypeLabel(item.type || 'post'))}</small><small>${escapeHtml(when)}</small><small>${mediaCount} ميديا${item.location ? ` · ${escapeHtml(item.location)}` : ''}</small><span class="publish-center-status ${publishCenterStatusClass(item.status)}">${escapeHtml(item.status || 'جاهز')}</span></div></article>`;
  }).join('');
}
async function publishToMetaPlatform(platform, item){
  const page = getSelectedSocialPage();
  if(!page) throw new Error('اختار صفحة Facebook بعد الربط.');
  const endpoint = platform === 'instagram' ? '/api/publish/instagram' : '/api/publish/facebook';
  const response = await fetch(endpoint, {
    method:'POST', credentials:'include', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ pageId: page.id, title: item.title, caption: item.caption, mediaUrl: item.mediaUrl, link: item.link, type: item.type })
  });
  const data = await response.json().catch(() => ({}));
  if(!response.ok || !data.ok) throw new Error(data.error || `فشل النشر على ${socialPlatformLabels[platform] || platform}`);
  return data;
}
async function handleSocialPublishSubmit(event){
  event.preventDefault();
  const platforms = selectedSocialPlatforms();
  if(!platforms.length){ showToast('اختار قناة واحدة على الأقل للنشر.'); return; }
  const item = {
    id: `social_${Date.now()}`,
    title: normalizeText(document.getElementById('socialPostTitle')?.value),
    caption: normalizeText(document.getElementById('socialPostCaption')?.value),
    mediaUrl: normalizeText(document.getElementById('socialPostMediaUrl')?.value),
    link: normalizeText(document.getElementById('socialPostLink')?.value),
    type: normalizeText(document.getElementById('socialPostType')?.value) || 'post',
    mode: normalizeText(document.getElementById('socialPublishMode')?.value) || 'now',
    scheduleDate: normalizeText(document.getElementById('socialScheduleDate')?.value),
    scheduleTime: normalizeText(document.getElementById('socialScheduleTime')?.value),
    platforms,
    createdAt: new Date().toISOString(),
    createdBy: getCurrentUserIdentity()?.email || getCurrentUserIdentity()?.name || 'user'
  };
  if(item.mode !== 'now' || item.type === 'draft'){
    appendSocialLog({ ...item, status: item.mode === 'schedule' ? 'مجدول محلياً' : 'مسودة محلية' });
    showToast('تم حفظ المنشور محلياً. الجدولة التلقائية تحتاج Scheduler في مرحلة لاحقة.');
    return;
  }
  if(platforms.includes('tiktok')){
    if(!socialTikTokConnected){
      appendSocialLog({ ...item, status:'TikTok غير متصل', error:'اربط TikTok أولاً من زر ربط TikTok.' });
      showToast('اربط TikTok أولاً. سيتم تنفيذ Meta فقط إن كانت مختارة.');
    } else {
      appendSocialLog({ ...item, status:'TikTok Sandbox متصل - Draft Upload لاحقاً', error:'TikTok مربوط في وضع Sandbox. رفع الفيديو كمسودة سيتم بعد تحديد مصدر الميديا في مرحلة النشر.' });
      showToast('TikTok مربوط Sandbox. رفع Draft سيتم بعد تحديد مصدر الميديا.');
    }
  }
  const metaPlatforms = platforms.filter(platform => platform === 'facebook' || platform === 'instagram');
  if(metaPlatforms.length && !socialMetaConnected){
    showToast('اربط Meta الأول من زر ربط / إعادة ربط Meta.');
    return;
  }
  for(const platform of metaPlatforms){
    try{
      const result = await publishToMetaPlatform(platform, item);
      appendSocialLog({ ...item, id:`${item.id}_${platform}`, platforms:[platform], status:'تم النشر', resultId: result.result?.id || '' });
      showToast(`تم النشر على ${socialPlatformLabels[platform]}.`);
    }catch(error){
      appendSocialLog({ ...item, id:`${item.id}_${platform}_error`, platforms:[platform], status:'فشل النشر', error: error.message || String(error) });
      showToast(`فشل النشر على ${socialPlatformLabels[platform]}: ${error.message || error}`);
    }
  }
}
function bindSocialPublisher(){
  const form = document.getElementById('socialPublisherForm');
  if(form){
    ['input','change'].forEach(eventName => form.addEventListener(eventName, renderSocialPreview));
    form.addEventListener('reset', () => setTimeout(renderSocialPreview, 0));
    form.addEventListener('submit', handleSocialPublishSubmit);
  }
  document.getElementById('socialMetaPageSelect')?.addEventListener('change', () => setSocialStatus(socialMetaConnected ? `Meta متصل · ${socialMetaPages.length} صفحة متاحة` : 'Meta غير متصل', socialMetaConnected));
  document.getElementById('socialReconnectBtn')?.addEventListener('click', () => { window.location.href = '/api/meta/login'; });
  document.getElementById('socialTikTokConnectBtn')?.addEventListener('click', () => { window.location.href = '/api/tiktok/login'; });
  document.getElementById('socialTikTokDisconnectBtn')?.addEventListener('click', async () => { try{ await fetch('/api/tiktok/logout', { credentials:'include' }); }catch(_){} socialTikTokConnected=false; socialTikTokUser=null; setTikTokStatus('تم الفصل - Sandbox', false); showToast('تم فصل TikTok.'); });
  document.getElementById('socialYouTubeConnectBtn')?.addEventListener('click', () => { window.location.href = '/api/youtube/login'; });
  document.getElementById('socialYouTubeDisconnectBtn')?.addEventListener('click', async () => { try{ await fetch('/api/youtube/logout', { credentials:'include' }); }catch(_){} socialYouTubeConnected=false; socialYouTubeChannel=null; setYouTubeStatus('تم فصل YouTube', false); showToast('تم فصل YouTube.'); });
  document.getElementById('socialDisconnectBtn')?.addEventListener('click', async () => { try{ await fetch('/api/meta/logout', { credentials:'include' }); }catch(_){} socialMetaConnected=false; socialMetaPages=[]; renderSocialPagesSelect(); setSocialStatus('تم فصل ربط Meta من هذا المتصفح.', false); showToast('تم فصل الربط.'); });
  document.getElementById('clearSocialLogBtn')?.addEventListener('click', () => { setSocialPublishLog([]); renderSocialPublishLog(); showToast('تم مسح سجل النشر المحلي.'); });
  document.getElementById('socialPublishLog')?.addEventListener('click', event => {
    const btn = event.target.closest('[data-delete-social-log]');
    if(!btn) return;
    setSocialPublishLog(getSocialPublishLog().filter(item => item.id !== btn.dataset.deleteSocialLog));
    renderSocialPublishLog();
    if(getRoute() === 'publish-prep') renderPublishPrepPage();
  });
}

function loadCampaigns(){
  if(!mainDb) return;
  safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).orderBy('createdAt','desc').onSnapshot(snapshot => {
    campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
    renderCampaigns();
    renderTasksPage();
    if(getRoute() === 'calendar') renderCalendarPage();
    if(getRoute() === 'publish-prep') renderPublishPrepPage();
    if(getRoute() === 'reports') renderDatabasePage();
    refreshOpenTaskModal();
    renderTopbarNotifications(true);
  }, error => { console.error('Campaigns load error', error); renderCampaigns(); renderTopbarNotifications(); });
}
function loadCampaignTasks(){
  campaignTasks = [];
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

function readThemeImageFile(file){
  return new Promise((resolve, reject) => {
    if(!file) return reject(new Error('لا توجد صورة.'));
    if(!String(file.type || '').startsWith('image/')) return reject(new Error('الملف المختار ليس صورة.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة.'));
    reader.onload = () => {
      const original = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        try{
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let maxSide = 1500;
          let quality = 0.82;
          let dataUrl = '';
          for(let attempt = 0; attempt < 9; attempt += 1){
            const scale = Math.min(1, maxSide / Math.max(img.width || maxSide, img.height || maxSide));
            canvas.width = Math.max(1, Math.round((img.width || maxSide) * scale));
            canvas.height = Math.max(1, Math.round((img.height || maxSide) * scale));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            if(dataUrl.length <= 520000) break;
            maxSide = Math.max(520, Math.round(maxSide * 0.78));
            quality = Math.max(0.46, quality - 0.07);
          }
          resolve(dataUrl || original);
        }catch(err){ resolve(original); }
      };
      img.onerror = () => resolve(original);
      img.src = original;
    };
    reader.readAsDataURL(file);
  });
}

function getCurrentUserDoc(){
  const current = getCurrentUser();
  return users.find(user => user.id === current.id || user.uid === current.uid || (user.email && identityClean(user.email) === identityClean(current.email))) || current;
}
function themeBackgroundImage(settings){
  if(!settings) return '';
  return settings.backgroundImageData || settings.backgroundImageUrl || settings.themeImageData || '';
}
function applyEffectiveTheme(){
  const user = getCurrentUserDoc();
  const sessionUser = getCurrentUser() || {};
  const userTheme = (user && user.themeSettings) || sessionUser.themeSettings || null;
  const effectiveTheme = userTheme || systemSettings || {};
  applyThemeSettings(effectiveTheme);

  const image = themeBackgroundImage(effectiveTheme);
  if(image){
    document.documentElement.style.setProperty('--user-dashboard-bg-image', `url("${String(image).replace(/"/g, '\"')}")`);
    document.body.classList.add('has-user-dashboard-theme');
  }else{
    document.body.classList.remove('has-user-dashboard-theme');
    document.documentElement.style.removeProperty('--user-dashboard-bg-image');
  }
  const dashboard = document.getElementById('dashboard');
  if(dashboard){
    dashboard.classList.toggle('has-custom-bg', !!image);
  }
}
async function saveUserThemeFromFile(file){
  if(!mainDb || !file) return;
  const currentSession = getCurrentUser() || {};
  const current = getCurrentUserDoc() || currentSession;
  const userId = current.id || current.uid || currentSession.id || currentSession.uid;
  if(!userId){ showToast('تعذر تحديد اليوزر لحفظ الثيم.'); return; }
  try{
    const imageData = await readThemeImageFile(file);
    const colors = await extractThemeColorsFromImage(imageData);
    const themeSettings = { themeImageName:file.name || 'theme-image', themeImageData:imageData, backgroundImageData:imageData, backgroundImageUrl:'', colors, updatedAt:new Date().toISOString() };
    await safeCollection(window.MZJ_USERS_COLLECTION).doc(userId).set({ themeSettings, updatedAt: serverTime() }, { merge:true });
    const nextSession = { ...currentSession, id: currentSession.id || userId, uid: currentSession.uid || userId, themeSettings };
    setCurrentUser(nextSession);
    const found = users.find(u => u.id === userId || u.uid === userId || identityClean(u.email) === identityClean(nextSession.email));
    if(found) found.themeSettings = themeSettings;
    applyEffectiveTheme();
    renderAdminDashboard();
    showToast('تم تطبيق ثيمك الخاص.');
  }catch(error){
    console.error('User theme save error', error);
    showToast(error.message || 'تعذر حفظ صورة الثيم. راجع قواعد Firebase.');
  }finally{
    const input = document.getElementById('userThemeImageInput');
    if(input) input.value = '';
  }
}
async function clearCurrentUserTheme(){
  const currentSession = getCurrentUser() || {};
  const current = getCurrentUserDoc() || currentSession;
  const userId = current.id || current.uid || currentSession.id || currentSession.uid;
  if(!mainDb || !userId) return;
  try{
    await safeCollection(window.MZJ_USERS_COLLECTION).doc(userId).set({ themeSettings: firebase.firestore.FieldValue.delete(), updatedAt: serverTime() }, { merge:true });
    const nextSession = { ...currentSession };
    delete nextSession.themeSettings;
    setCurrentUser(nextSession);
    const found = users.find(u => u.id === userId || u.uid === userId || identityClean(u.email) === identityClean(nextSession.email));
    if(found) found.themeSettings = null;
    applyEffectiveTheme();
    renderAdminDashboard();
    showToast('تم مسح الخلفية واسترجاع الثيم الافتراضي.');
  }catch(error){
    console.error('Clear user theme error', error);
    showToast(error.message || 'تعذر مسح الثيم. راجع قواعد Firebase.');
  }
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
  if(document.getElementById('autoPublishEnabled')) autoPublishEnabled.value = settings.autoPublishEnabled === false ? 'false' : 'true';
  const platformHours = settings.autoPublishPlatformHours || {};
  const legacyHour = Number.isFinite(Number(settings.autoPublishHour)) ? Number(settings.autoPublishHour) : 12;
  if(document.getElementById('autoPublishFacebookHour')) autoPublishFacebookHour.value = String(Number.isFinite(Number(platformHours.facebook)) ? Number(platformHours.facebook) : 15);
  if(document.getElementById('autoPublishInstagramHour')) autoPublishInstagramHour.value = String(Number.isFinite(Number(platformHours.instagram)) ? Number(platformHours.instagram) : 18);
  if(document.getElementById('autoPublishTiktokHour')) autoPublishTiktokHour.value = String(Number.isFinite(Number(platformHours.tiktok)) ? Number(platformHours.tiktok) : 21);
  if(document.getElementById('autoPublishDefaultHour')) autoPublishDefaultHour.value = String(Number.isFinite(Number(platformHours.default)) ? Number(platformHours.default) : legacyHour);
  if(document.getElementById('youtubePrivacyStatus')) youtubePrivacyStatus.value = ['public','unlisted','private'].includes(String(settings.youtubePrivacyStatus || '').toLowerCase()) ? String(settings.youtubePrivacyStatus).toLowerCase() : 'unlisted';
  if(document.getElementById('autoPublishTimezone')) autoPublishTimezone.value = settings.autoPublishTimezone || 'Asia/Riyadh';
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
    const pages = normalizePagesList([...(Array.isArray(user.pages) ? user.pages : []), ...(Array.isArray(user.pagesAccess) ? user.pagesAccess : [])]);
    const role = normalizeText(user.role || 'user') || 'user';
    return `<article class="permission-user-card" data-user-id="${escapeHtml(user.id)}"><div class="permission-user-main"><strong>${escapeHtml(userName(user) || 'User')}</strong><small>${escapeHtml(user.email || '')}</small><label class="mini-field"><span>نوع الحساب</span><select data-user-role><option value="user" ${role !== 'admin' ? 'selected' : ''}>يوزر عادي</option><option value="admin" ${role === 'admin' ? 'selected' : ''}>أدمن</option></select></label></div><div class="permission-pages"><label><input type="checkbox" data-page-key="dashboard" checked disabled> الداش بورد</label>${pageOptions.map(page => `<label><input type="checkbox" data-page-key="${page}" ${pages.includes(page) ? 'checked' : ''}> ${pageLabel(page)}</label>`).join('')}</div><button type="button" class="btn btn-primary" data-save-user-pages="${escapeHtml(user.id)}">حفظ الصلاحيات</button></article>`;
  }).join('') : '<div class="empty-state">لا توجد يوزرات.</div>';
}
function pageLabel(page){
  return {reports:'قاعدة البيانات','create-campaign':'إنشاء حملة',campaigns:'إدارة الحملات','social-publisher':'ربط المنصات','publish-prep':'تجهيز النشر',tasks:'المتابعة',calendar:'التقويم',stock:'الاستوك',departments:'الأقسام',settings:'الإعدادات'}[page] || page;
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
  document.getElementById('autoPublishSettingsForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    if(!mainDb) return;
    const allowedPublishHours = [15,18,21,12];
    const cleanHour = value => { const n = Number(value); return allowedPublishHours.includes(n) ? n : 12; };
    const platformHours = {
      facebook: cleanHour(document.getElementById('autoPublishFacebookHour')?.value || 15),
      instagram: cleanHour(document.getElementById('autoPublishInstagramHour')?.value || 18),
      tiktok: cleanHour(document.getElementById('autoPublishTiktokHour')?.value || 21),
      default: cleanHour(document.getElementById('autoPublishDefaultHour')?.value || 12)
    };
    const enabled = document.getElementById('autoPublishEnabled')?.value !== 'false';
    const privacyRaw = String(document.getElementById('youtubePrivacyStatus')?.value || 'unlisted').toLowerCase();
    const youtubePrivacyStatus = ['public','unlisted','private'].includes(privacyRaw) ? privacyRaw : 'unlisted';
    await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({
      autoPublishEnabled: enabled,
      autoPublishPlatformHours: platformHours,
      autoPublishHour: platformHours.default,
      autoPublishTimezone: 'Asia/Riyadh',
      youtubePrivacyStatus,
      updatedAt: serverTime()
    }, { merge:true });
    showMessage('autoPublishSettingsMessage','تم حفظ مواعيد النشر وخصوصية YouTube.');
  });
  document.getElementById('saveThemeColorsBtn')?.addEventListener('click', async () => {
    if(!mainDb) return;
    const colors = getThemeColorPayload();
    await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({ colors, updatedAt: serverTime() }, { merge:true });
    applyThemeSettings({ colors }); showMessage('themeSettingsMessage','تم حفظ الألوان.');
  });
  document.getElementById('resetDefaultSettingsBtn')?.addEventListener('click', async () => {
    if(!mainDb) return;
    await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({
      ...defaultThemeSettings,
      themeImageName: firebase.firestore.FieldValue.delete(),
      themeImageData: firebase.firestore.FieldValue.delete(),
      backgroundImageData: firebase.firestore.FieldValue.delete(),
      backgroundImageUrl: firebase.firestore.FieldValue.delete(),
      updatedAt: serverTime()
    }, { merge:true });
    systemSettings = { ...defaultThemeSettings };
    applyEffectiveTheme();
    fillSettingsForm();
    renderAdminDashboard();
    showMessage('systemSettingsMessage','تم استرجاع الإعدادات الافتراضية ومسح صورة الخلفية.');
  });
  document.getElementById('resetDefaultThemeBtn')?.addEventListener('click', async () => {
    if(!mainDb) return;
    await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({
      colors: defaultThemeSettings.colors,
      themeImageName: firebase.firestore.FieldValue.delete(),
      themeImageData: firebase.firestore.FieldValue.delete(),
      backgroundImageData: firebase.firestore.FieldValue.delete(),
      backgroundImageUrl: firebase.firestore.FieldValue.delete(),
      updatedAt: serverTime()
    }, { merge:true });
    systemSettings = { ...systemSettings, colors: defaultThemeSettings.colors };
    delete systemSettings.themeImageName;
    delete systemSettings.themeImageData;
    delete systemSettings.backgroundImageData;
    delete systemSettings.backgroundImageUrl;
    applyEffectiveTheme();
    fillSettingsForm();
    renderThemeImagePreview({});
    showMessage('themeSettingsMessage','تم استرجاع الثيم الافتراضي ومسح الخلفية.');
  });
  document.getElementById('themeImageInput')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if(!file || !mainDb) return;
    try{
      const imageData = await readThemeImageFile(file);
      const colors = await extractThemeColorsFromImage(imageData);
      const payload = { themeImageName:file.name || 'theme-image', themeImageData:imageData, backgroundImageData:imageData, backgroundImageUrl:'', colors, updatedAt: serverTime() };
      await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set(payload, { merge:true });
      systemSettings = { ...systemSettings, ...payload };
      applyEffectiveTheme();
      fillSettingsForm();
      renderAdminDashboard();
      showMessage('themeSettingsMessage','تم حفظ صورة الثيم وتطبيقها كخلفية للداش بورد.');
      renderThemeImagePreview(payload);
    }catch(error){
      console.error('System theme image error', error);
      showMessage('themeSettingsMessage', error.message || 'تعذر حفظ صورة الثيم. راجع قواعد Firebase.');
    }finally{
      const input = document.getElementById('themeImageInput');
      if(input) input.value = '';
    }
  });
  document.getElementById('refreshUsersPermissionsBtn')?.addEventListener('click', renderUsersPermissions);
  document.addEventListener('click', async event => {
    const save = event.target.closest('[data-save-user-pages]');
    if(!save || !mainDb) return;
    const card = save.closest('.permission-user-card');
    const pages = normalizePagesList(['dashboard', ...[...card.querySelectorAll('input[data-page-key]:checked')].map(input => input.dataset.pageKey).filter(Boolean)]);
    const role = card.querySelector('[data-user-role]')?.value || 'user';
    await safeCollection(window.MZJ_USERS_COLLECTION).doc(save.dataset.saveUserPages).update({ pages, pagesAccess: pages, role, updatedAt: serverTime() });
    const idx = users.findIndex(u => u.id === save.dataset.saveUserPages);
    if(idx >= 0){ users[idx] = { ...users[idx], pages, pagesAccess: pages, role }; }
    const currentKeys = uniqueIdentityKeys([getCurrentUser()]);
    const editedKeys = idx >= 0 ? uniqueIdentityKeys([users[idx]]) : [identityClean(save.dataset.saveUserPages)];
    if(identityIntersects(currentKeys, editedKeys)){ syncCurrentSessionUserFromUsers(); applyUserPermissions(); renderRoute(); }
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
      if(getRoute() === 'stock') renderStock();
      if(getRoute() === 'dashboard') renderAdminDashboard();
    }, error => console.error(error));
  }
  loadPublishPrepSubmissions();
  loadPublishLogs();
  loadCampaigns();
  // loadCampaignTasks(); // تم إلغاء الاعتماد على campaign_tasks
  loadStock();
  loadStockMeta();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('[data-menu]')?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); });
  overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });
  document.getElementById('loginForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopPropagation();
    scrubSensitiveLoginUrl();
    showMessage('loginMessage', 'جاري التحقق...');
    initFirebase();

    const rawEmail = normalizeText(document.getElementById('loginEmail')?.value);
    const email = rawEmail.toLowerCase();
    localStorage.setItem('mzj_login_email', email);
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

      localStorage.setItem('mzj_logged_in','1');
      localStorage.setItem('mzj_user', JSON.stringify({
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
        pages: normalizePagesList([...(Array.isArray(userDoc.pages) ? userDoc.pages : []), ...(Array.isArray(userDoc.pagesAccess) ? userDoc.pagesAccess : [])]),
        pagesAccess: normalizePagesList([...(Array.isArray(userDoc.pages) ? userDoc.pages : []), ...(Array.isArray(userDoc.pagesAccess) ? userDoc.pagesAccess : [])]),
        themeSettings: userDoc.themeSettings || null
      }));
      showMessage('loginMessage', '');
      scrubSensitiveLoginUrl();
      openApp();
    }catch(error){
      console.error('Login error', error);
      showMessage('loginMessage', 'تعذر تسجيل الدخول. راجع إعدادات Firebase أو صلاحيات users.');
    }
  });
  document.getElementById('logoutBtn')?.addEventListener('click', async () => { localStorage.removeItem('mzj_logged_in'); localStorage.removeItem('mzj_login_email'); localStorage.removeItem('mzj_user'); try{ await mainAuth?.signOut?.(); }catch(_){} openLogin(); });
  ['click','keydown','touchstart'].forEach(eventName => document.addEventListener(eventName, unlockNotificationAudio, { once:true, passive:true }));
  document.getElementById('notificationToggle')?.addEventListener('click', event => { event.stopPropagation(); unlockNotificationAudio(); renderTopbarNotifications(); document.getElementById('notificationPanel')?.classList.toggle('is-hidden'); });
  document.addEventListener('click', event => { if(!event.target.closest('.notification-wrap')) document.getElementById('notificationPanel')?.classList.add('is-hidden'); });
  window.addEventListener('hashchange', () => { if(isLoggedIn()) renderRoute(); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape'){ closeTaskModal(); closeCampaignModal(); closePublishComposer(); } });
  document.getElementById('calendarPrevMonth')?.addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth()-1); renderCalendarPage(); });
  document.getElementById('calendarNextMonth')?.addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth()+1); renderCalendarPage(); });
  document.getElementById('calendarToday')?.addEventListener('click', () => { calendarCursor = new Date(); renderCalendarPage(); });
  bindCampaignBuilder(); bindDepartments(); bindSettings(); bindSocialPublisher(); bindPublishPrepPage(); bindPublishCenter();
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
    const toggleCompletedBtn = event.target.closest('#toggleCompletedTasksBtn');
    if(toggleCompletedBtn){
      const panel = document.getElementById('completedTasksPanel');
      if(panel){
        const isOpen = toggleCompletedBtn.dataset.open === '1';
        panel.hidden = isOpen;
        toggleCompletedBtn.dataset.open = isOpen ? '0' : '1';
        toggleCompletedBtn.textContent = isOpen ? `عرض التاسكات المنتهية (${toggleCompletedBtn.dataset.count || '0'})` : 'إخفاء التاسكات المنتهية';
      }
      return;
    }
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

    const dismissNotification = event.target.closest('[data-dismiss-notification]');
    if(dismissNotification){ event.preventDefault(); event.stopPropagation(); dismissNotificationKey(dismissNotification.dataset.dismissNotification || ''); renderTopbarNotifications(); return; }
    const clearNotifications = event.target.closest('[data-clear-notifications]');
    if(clearNotifications){ event.preventDefault(); event.stopPropagation(); const keys = taskNotificationItems().map(item => item.key).filter(Boolean); setDismissedNotificationKeys([...getDismissedNotificationKeys(), ...keys]); renderTopbarNotifications(); return; }

    if(event.target.closest('[data-close-campaign-modal]')){ closeCampaignModal(); return; }
    const openTaskFromAnywhere = event.target.closest('[data-open-task]');
    if(openTaskFromAnywhere){ document.getElementById('notificationPanel')?.classList.add('is-hidden'); closeCampaignModal(); renderTaskDetail(openTaskFromAnywhere.dataset.openTask, openTaskFromAnywhere.dataset.taskCampaign || ''); return; }
    const viewOwnerTasks = event.target.closest('[data-view-owner-tasks]');
    if(viewOwnerTasks){ openOwnerTasksModal(viewOwnerTasks.dataset.viewOwnerTasks, viewOwnerTasks.dataset.ownerKey || ''); return; }
    const exportPdf = event.target.closest('[data-export-campaign-pdf]');
    if(exportPdf){ exportCampaignDataPdf(exportPdf.dataset.exportCampaignPdf); return; }
    const exportSchedule = event.target.closest('[data-export-campaign-schedule]');
    if(exportSchedule){ exportCampaignPublishScheduleFile(exportSchedule.dataset.exportCampaignSchedule); return; }
    const viewData = event.target.closest('[data-view-campaign-data]');
    if(viewData){ openCampaignDataModal(viewData.dataset.viewCampaignData); return; }
    const editCampaign = event.target.closest('[data-edit-campaign]');
    if(editCampaign && !event.target.closest('[data-delete-campaign]')){ openCampaignEditModal(editCampaign.dataset.editCampaign); return; }
    const saveEdit = event.target.closest('[data-save-campaign-edit]');
    if(saveEdit){ await saveCampaignEdit(saveEdit.dataset.saveCampaignEdit); return; }
    const addTask = event.target.closest('[data-add-task-to-campaign]');
    if(addTask){ await addTaskToCampaign(addTask.dataset.addTaskToCampaign); return; }
    const archiveBtn = event.target.closest('[data-archive-campaign]');
    if(archiveBtn){ await archiveCampaign(archiveBtn.dataset.archiveCampaign); return; }
    const uploadResults = event.target.closest('[data-upload-results-file]');
    if(uploadResults){ const input = document.getElementById('campaignResultFileInput'); if(input){ input.dataset.campaignId = uploadResults.dataset.uploadResultsFile; input.click(); } return; }
    const addLink = event.target.closest('[data-add-campaign-link]');
    if(addLink){ await addCampaignLink(addLink.dataset.addCampaignLink); return; }
    const removeLink = event.target.closest('[data-remove-campaign-link]');
    if(removeLink){ await removeCampaignLink(removeLink.dataset.removeCampaignLink, removeLink.dataset.linkIndex); return; }
    const removeFile = event.target.closest('[data-remove-results-file]');
    if(removeFile){ await removeCampaignResultFile(removeFile.dataset.removeResultsFile); return; }
    const uploadStructureBtn = event.target.closest('[data-upload-structure]');
    if(uploadStructureBtn){ const input = document.getElementById('structureFileInput'); if(input){ input.dataset.taskId = uploadStructureBtn.dataset.uploadStructure; input.value = ''; input.click(); } return; }
    const reloadStructureBtn = event.target.closest('[data-reload-structure-sheet]');
    if(reloadStructureBtn){ await reloadStructureSheetFromStoredFile(reloadStructureBtn.dataset.reloadStructureSheet || ''); return; }
    const noteSave = event.target.closest('.structure-note-save');
    if(noteSave){
      event.preventDefault();
      event.stopPropagation();
      const editor = noteSave.closest('.inline-structure-note-editor');
      const cell = noteSave.closest('[data-structure-cell]');
      const source = editor || cell;
      const note = source?.querySelector('.inline-note-input')?.value || '';
      if(source) await saveStructureCellNote(source.dataset.structureCell, source.dataset.sheetName || '', source.dataset.rowIndex || 0, source.dataset.colIndex || 0, note);
      closeStructureCellNoteEditors();
      return;
    }
    const noteCancel = event.target.closest('.structure-note-cancel,[data-close-structure-note]');
    if(noteCancel){ event.preventDefault(); event.stopPropagation(); closeStructureCellNoteEditors(); return; }
    if(event.target.closest('.inline-structure-note-editor')){ event.stopPropagation(); return; }
    const structureCell = event.target.closest('[data-structure-cell]');
    if(structureCell){
      if(structureCell.classList.contains('protected-structure-title')) return;
      await toggleStructureCellMark(structureCell.dataset.structureCell, structureCell.dataset.sheetName || '', structureCell.dataset.rowIndex || 0, structureCell.dataset.colIndex || 0);
      return;
    }
    const structureApprove = event.target.closest('[data-structure-approve]');
    if(structureApprove){ await setStructureStatus(structureApprove.dataset.structureApprove, 'approved'); return; }
    const structureSave = event.target.closest('[data-save-structure-assignees]');
    if(structureSave){ await saveStructureDistribution(structureSave.dataset.saveStructureAssignees); return; }
    if(event.target.closest('[data-close-task-modal]')){ closeTaskModal(); return; }
    const modalReceivedBtn = event.target.closest('#taskModal [data-toggle-received]');
    if(modalReceivedBtn){ await toggleTaskReceived(modalReceivedBtn.dataset.toggleReceived); return; }
    const modalStepBtn = event.target.closest('#taskModal [data-task-step]');
    if(modalStepBtn){ await toggleTaskStep(modalStepBtn.dataset.taskStep, modalStepBtn.dataset.stepIndex); return; }
    const uploadBtn = event.target.closest('[data-upload-task-attachment]');
    if(uploadBtn){
      const input = document.getElementById('taskAttachmentInput');
      if(input){ input.dataset.uploadKind = uploadBtn.dataset.uploadTaskAttachment || 'review'; input.click(); }
      return;
    }
    const delFile = event.target.closest('[data-delete-task-file]');
    if(delFile && activeTaskModalMeta){
      const task = findTaskById(activeTaskModalMeta.taskId, activeTaskModalMeta.campaignId);
      if(!task) return;
      const files = taskFiles(task).filter((_, i) => i !== Number(delFile.dataset.deleteTaskFile));
      await updateTaskOnFirebase(task.id, { attachments: files });
      refreshOpenTaskModal();
    }
  });

  document.addEventListener('dblclick', async event => {
    const structureCell = event.target.closest('[data-structure-cell]');
    if(structureCell){
      if(structureCell.classList.contains('protected-structure-title')) return;
      event.preventDefault();
      event.stopPropagation();
      openStructureCellNoteEditor(structureCell);
    }
  });

  document.addEventListener('change', event => {
    if(event.target && event.target.id === 'editAddSection'){
      const select = document.getElementById('editAddTaskType');
      if(select) select.innerHTML = taskTypeOptionsForSection(event.target.value, '');
    }
  });
  document.getElementById('campaignResultFileInput')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    const campaignId = event.target.dataset.campaignId || '';
    event.target.value = '';
    if(file && campaignId) await saveCampaignResultFile(campaignId, file);
  });
  document.getElementById('structureFileInput')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    const taskId = event.target.dataset.taskId || '';
    event.target.value = '';
    if(file && taskId){ try{ await uploadStructureFileForTask(file, taskId); }catch(error){ console.error(error); showToast(error.message || 'تعذر رفع الهيكل.'); } }
  });
  document.getElementById('taskAttachmentInput')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if(!file || !activeTaskModalMeta) return;
    const task = findTaskById(activeTaskModalMeta.taskId, activeTaskModalMeta.campaignId);
    if(!task) return;
    try{
      showUploadProgressToast(0, 'جاري رفع الملف');
      const uploadKind = event.target.dataset.uploadKind || 'review';
      const record = await uploadTaskFileToDrive(file, task, uploadKind);
      record.uploadKind = uploadKind;
      record.kind = uploadKind;
      record.purpose = uploadKind;
      record.isFinal = uploadKind === 'final';
      await updateTaskOnFirebase(task.id, { attachments: [...taskFiles(task), record] });
      const prepId = `task_${task.id || task.taskId || task.code || ''}`;
      const submissions = getPublishPrepSubmissions();
      const currentPrep = submissions[prepId] || {};
      if(uploadKind === 'final'){
        await updatePublishPrepSubmission(prepId, {
          fileName: record.fileName || record.name,
          finalFileName: record.fileName || record.name,
          fileUrl: record.fileUrl || record.downloadURL || record.downloadUrl,
          finalFileUrl: record.fileUrl || record.downloadURL || record.downloadUrl,
          mimeType: record.mimeType || record.type || '',
          finalFileRecord: record,
          finalUploadedAt: new Date().toISOString(),
          status: currentPrep.readyForPublish ? 'جاهز للنشر' : (currentPrep.status || 'تم رفع الملف النهائي')
        });
      }else{
        const reviewFiles = Array.isArray(currentPrep.reviewFiles) ? currentPrep.reviewFiles : [];
        await updatePublishPrepSubmission(prepId, {
          reviewFiles: [...reviewFiles, record],
          lastReviewFileName: record.fileName || record.name,
          lastReviewFileUrl: record.fileUrl || record.downloadURL || record.downloadUrl,
          reviewUploadedAt: new Date().toISOString()
        });
      }
      showToast(uploadKind === 'final' ? 'تم رفع الملف النهائي وحفظ الرابط في Firestore.' : 'تم رفع ملف المراجعة وحفظه في Firestore.');
      refreshOpenTaskModal();
    }catch(error){ console.error(error); showToast(error.message || 'تعذر رفع الملف.'); }
  });

  isLoggedIn() ? openApp() : openLogin();
});
