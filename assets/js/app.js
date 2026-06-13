
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
window.MZJ_ORDER_STATUSES_COLLECTION = "marketing_order_statuses";
window.MZJ_FUNNELS_COLLECTION = "marketing_funnels";
window.MZJ_PLATFORMS_COLLECTION = "marketing_platforms";
window.MZJ_STOCK_CARS_COLLECTION = "cars";
window.MZJ_CAMPAIGNS_COLLECTION = "marketing_campaigns";
window.MZJ_CAMPAIGN_TASKS_COLLECTION = "campaign_tasks"; // غير مستخدم في داشبورد اليوزرات
window.MZJ_SYSTEM_SETTINGS_COLLECTION = "system_settings";
window.MZJ_PUBLISH_PREP_COLLECTION = "publish_prep_tasks";
window.MZJ_PUBLISH_LOGS_COLLECTION = "publish_logs";
window.MZJ_WHATSAPP_CONTACTS_COLLECTION = "whatsapp_contacts";
window.MZJ_SYSTEM_SETTINGS_DOC = "main";
window.MZJ_STOCK_META_COLLECTION = "marketing_stock_cars"; // مسار حفظ حالة تم التصوير

const routes = ['dashboard','reports','create-campaign','campaigns','social-publisher','platform-settings','publish-prep','tasks','calendar','stock','departments','settings'];
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
  'platform-settings': 'platform-settings',
  platform_settings: 'platform-settings',
  platforms_settings: 'platform-settings',
  'إعدادات-المنصات': 'platform-settings',
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
const MZJ_DEFAULT_CREATIVE_NAMES = [
  'REEL - مواصفات كامله - STUDIO','REEL - اهم المواصفات - STUDIO','REEL - SHORT/TREND - SHOWROOM','REEL - UGC - SHOWROOM','REEL - حملات - SHOWROOM','REEL - معارضنا - SHOWROOM','REEL - تجربه عميل - SHOWROOM','VIDEO - مواصفات - STUDIO','VIDEO - فيلم سياره - STUDIO','VIDEO - فيلم - STUDIO','VIDEO - مواصفات - SHOWROOM','VIDEO - فيلم - SHOWROOM','VIDEO - معارضنا - SHOWROOM','STORY - جاهزة الان - STUDIO','STORY - سعرها اليوم - STUDIO','STORY - قسطها الان - STUDIO','STORY - معرضنا - SHOWROOM','STORY - جاهزة الان - SHOWROOM','STORY - سعرها اليوم - SHOWROOM','STORY - قسطها الان - SHOWROOM',
  'POST','CAROUSEL','PANNER','MOTION','GIF','PRINT','MZJ-INTERIAL',
  'تصوير صور السياره','تصوير ريل - مواصفات - STUDIO','تصوير ريل - SHORT/TREND - SHOWROOM','تصوير ريل - UGC - SHOWROOM','تصوير ريل - معارضنا - SHOWROOM','تصوير ريل - تجربه عميل - SHOWROOM','تصوير فيديو - مواصفات - STUDIO','تصوير فيديو - مواصفات - SHOWROOM','تصوير فيديو - معارضنا - SHOWROOM','تصوير ستوري - سياره - STUDIO','تصوير ستوري - معرضنا - SHOWROOM'
];
let taskTypes = [];
let contentSections = [];
let campaignCodes = [];
let campaignTypes = [];
let orderStatuses = [];
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
let publishPrepSearchQuery = '';

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
  if(route === 'platform-settings') renderPlatformSettingsPage();
  if(route === 'publish-prep') renderPublishPrepPage();
}
function showMessage(id, text){ const el = document.getElementById(id); if(el) el.textContent = text || ''; }
function escapeHtml(value){ return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function normalizeText(value){ return String(value ?? '').trim(); }
function escapeRegExp(value){ return String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
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

function encodePanelJson(value){
  try{ return encodeURIComponent(JSON.stringify(value || [])); }catch(_){ return ''; }
}
function decodePanelJson(value){
  try{ return JSON.parse(decodeURIComponent(value || '[]')) || []; }catch(_){ return []; }
}
function contentDependencyPickerHtml(role){
  if(role !== 'design') return '';
  return `<div class="content-dependency-picker js-content-dependency" data-dependency-for="${escapeHtml(role)}">
    <div class="content-dependency-title"><strong>المصمم يشتغل على محتوى مين؟</strong><small>اختار كاتب المحتوى المرتبط بنفس الكريتيف</small></div>
    <div class="content-dependency-options"><div class="multi-empty">اختار كاتب محتوى الأول</div></div>
  </div>`;
}
function contentMontageLinkerHtml(role){
  if(role !== 'content') return '';
  return `<div class="content-montage-linker js-content-montage-linker">
    <div class="content-dependency-title"><strong>ربط كاتب المحتوى بالمونتاج</strong><small>بعد اختيار كاتب المحتوى اختار مونتير أو أكثر يشتغلوا على نفس المحتوى</small></div>
    <div class="content-montage-link-options"><div class="multi-empty">اختار كاتب محتوى الأول</div></div>
  </div>`;
}
function getContentMontageLinks(panel){
  return decodePanelJson(panel?.dataset?.contentMontageLinks || '');
}
function syncContentMontageLinks(panel){
  if(!panel) return [];
  const links = [...panel.querySelectorAll('.js-content-montage-row')].map(row => {
    const checks = [...row.querySelectorAll('.js-content-montage-link-check:checked')];
    return {
      contentUserId: normalizeText(row.dataset.contentId || ''),
      contentUserName: normalizeText(row.dataset.contentName || ''),
      montageUserIds: checks.map(input => normalizeText(input.value)).filter(Boolean),
      montageUserNames: checks.map(input => normalizeText(input.dataset.name || '')).filter(Boolean)
    };
  }).filter(link => link.contentUserId || link.contentUserName);
  panel.dataset.contentMontageLinks = encodePanelJson(links);
  return links;
}
function applyContentMontageLinksToMontagePicker(panel){
  if(!panel) return;
  const links = getContentMontageLinks(panel);
  const ids = uniqueList(links.flatMap(link => link.montageUserIds || []));
  const names = uniqueList(links.flatMap(link => link.montageUserNames || []));
  // مهم: ما نمسحش اختيار المونتاج اليدوي لو مفيش ربط محتوى/مونتاج مستخدم.
  // كان ده سبب إن يوزرات المونتاج تختفي من creatives.departmentAssignments وبالتالي كود اليوزر ينزل فاضي.
  if(!ids.length && !names.length) return;
  const picker = panel.querySelector('.js-role-picker[data-role="montage"]');
  if(!picker) return;
  picker.dataset.selectedIds = ids.join('|');
  picker.dataset.selectedNames = names.join('|');
  picker.querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = ids.includes(input.value) || names.includes(input.dataset.name || ''); });
  syncRolePickerState(picker);
}
function refreshContentMontageLinks(panel){
  if(!panel) return;
  const linker = panel.querySelector('.js-content-montage-linker');
  const options = linker?.querySelector('.content-montage-link-options');
  if(!linker || !options) return;
  const previous = getContentMontageLinks(panel);
  const contentPicker = panel.querySelector('.js-role-picker[data-role="content"]');
  const contentIds = selectedOptionValues(contentPicker);
  const contentNames = selectedOptionTexts(contentPicker);
  const montageUsers = usersForRole('montage');
  if(!contentIds.length && !contentNames.length){
    panel.dataset.contentMontageLinks = '';
    options.innerHTML = '<div class="multi-empty">اختار كاتب محتوى الأول</div>';
    applyContentMontageLinksToMontagePicker(panel);
    return;
  }
  if(!montageUsers.length){
    options.innerHTML = '<div class="multi-empty">لا توجد يوزرات في قسم المونتاج</div>';
    return;
  }
  const rows = Math.max(contentIds.length, contentNames.length);
  options.innerHTML = Array.from({length: rows}, (_, i) => {
    const contentId = contentIds[i] || contentNames[i] || '';
    const contentName = contentNames[i] || contentIds[i] || '';
    const old = previous.find(link => link.contentUserId === contentId || link.contentUserName === contentName) || {};
    const selectedIds = Array.isArray(old.montageUserIds) ? old.montageUserIds : [];
    const selectedNames = Array.isArray(old.montageUserNames) ? old.montageUserNames : [];
    const montageOptions = montageUsers.map(user => {
      const id = user.id || user.uid || user.email || userName(user);
      const name = userName(user) || id;
      const checked = selectedIds.includes(id) || selectedNames.includes(name);
      return `<label><input type="checkbox" class="js-content-montage-link-check" value="${escapeHtml(id)}" data-name="${escapeHtml(name)}"${checked ? ' checked' : ''}> <span>${escapeHtml(name)}</span></label>`;
    }).join('');
    return `<div class="content-montage-row js-content-montage-row" data-content-id="${escapeHtml(contentId)}" data-content-name="${escapeHtml(contentName)}"><div class="content-montage-row-title">${escapeHtml(contentName)}</div><div class="content-montage-row-users">${montageOptions}</div></div>`;
  }).join('');
  syncContentMontageLinks(panel);
  applyContentMontageLinksToMontagePicker(panel);
}
function refreshContentDependencyPickers(panel){
  if(!panel) return;
  refreshContentMontageLinks(panel);
  const contentPicker = panel.querySelector('.js-role-picker[data-role="content"]');
  const contentIds = selectedOptionValues(contentPicker);
  const contentNames = selectedOptionTexts(contentPicker);
  panel.querySelectorAll('.js-content-dependency').forEach(box => {
    const selectedIds = storedMultiValues(box, 'selectedIds');
    const selectedNames = storedMultiValues(box, 'selectedNames');
    const options = box.querySelector('.content-dependency-options');
    if(!options) return;
    if(!contentIds.length && !contentNames.length){
      box.dataset.selectedIds = '';
      box.dataset.selectedNames = '';
      options.innerHTML = '<div class="multi-empty">اختار كاتب محتوى الأول</div>';
      return;
    }
    const rows = Math.max(contentIds.length, contentNames.length);
    const hasPrevious = selectedIds.length || selectedNames.length;
    options.innerHTML = Array.from({length: rows}, (_, i) => {
      const id = contentIds[i] || contentNames[i] || '';
      const name = contentNames[i] || contentIds[i] || '';
      const checked = hasPrevious ? (selectedIds.includes(id) || selectedNames.includes(name)) : false;
      return `<label><input type="checkbox" class="js-content-dependency-check" value="${escapeHtml(id)}" data-name="${escapeHtml(name)}"${checked ? ' checked' : ''}> <span>${escapeHtml(name)}</span></label>`;
    }).join('');
    syncContentDependencyState(box);
  });
}
function syncContentDependencyState(box){
  if(!box) return;
  const checked = [...box.querySelectorAll('.js-content-dependency-check:checked')];
  const ids = checked.map(input => input.value).filter(Boolean);
  const names = checked.map(input => input.dataset.name || input.closest('label')?.textContent?.trim() || '').filter(Boolean);
  box.dataset.selectedIds = ids.join('|');
  box.dataset.selectedNames = names.join('|');
  box.querySelectorAll('.js-content-dependency-check').forEach(input => {
    if(input.checked) input.setAttribute('checked','checked'); else input.removeAttribute('checked');
  });
}
function selectedContentDependency(panel, role){
  if(role === 'montage'){
    const links = syncContentMontageLinks(panel);
    const ids = uniqueList(links.filter(link => (link.montageUserIds || []).length).map(link => link.contentUserId).filter(Boolean));
    const names = uniqueList(links.filter(link => (link.montageUserIds || []).length).map(link => link.contentUserName).filter(Boolean));
    if(ids.length || names.length) return { ids, names, links };
  }
  const box = panel?.querySelector(`.js-content-dependency[data-dependency-for="${role}"]`);
  syncContentDependencyState(box);
  const ids = storedMultiValues(box, 'selectedIds');
  const names = storedMultiValues(box, 'selectedNames');
  if(ids.length || names.length) return { ids, names, links: [] };
  const contentPicker = panel?.querySelector('.js-role-picker[data-role="content"]');
  return { ids: selectedOptionValues(contentPicker), names: selectedOptionTexts(contentPicker), links: [] };
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
  if(selected.length){
    picker.dataset.selectedIds = selected.join('|');
    picker.dataset.selectedNames = [...picker.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.dataset.name || '').filter(Boolean).join('|') || picker.dataset.selectedNames || '';
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

function orderStatusOptions(selectedValue = ''){
  const current = normalizeText(selectedValue || '');
  let options = '<option value="">اختر الحالة</option>' + orderStatuses.map(item => {
    const value = item.name || item.id || '';
    return `<option value="${escapeHtml(value)}"${current === value || selectedValue === item.id ? ' selected' : ''}>${escapeHtml(item.name || value)}</option>`;
  }).join('');
  if(current && !orderStatuses.some(item => item.name === current || item.id === current)){
    options += `<option value="${escapeHtml(current)}" selected>${escapeHtml(current)}</option>`;
  }
  return options;
}
function refreshOrderStatusSelects(){
  document.querySelectorAll('.js-order-status-select').forEach(select => { const value = select.value; select.innerHTML = orderStatusOptions(value); });
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
function storedMultiValues(control, key){
  const raw = control?.dataset?.[key] || '';
  return raw.split('|').map(x => normalizeText(x)).filter(Boolean);
}
function syncRolePickerState(picker){
  if(!picker) return;
  const checked = [...picker.querySelectorAll('input[type="checkbox"]:checked')];
  const ids = checked.map(input => input.value).filter(Boolean);
  const names = checked.map(input => input.dataset.name || input.closest('label')?.textContent?.trim() || '').filter(Boolean);
  picker.dataset.selectedIds = ids.join('|');
  picker.dataset.selectedNames = names.join('|');
  picker.querySelectorAll('input[type="checkbox"]').forEach(input => {
    if(input.checked) input.setAttribute('checked', 'checked');
    else input.removeAttribute('checked');
  });
  updateRolePickerLabel(picker);
}
function ensurePanelHasAllRoleAssignments(panel){
  if(!panel) return panel;
  const grid = panel.querySelector('.creative-assignment-inner-grid');
  if(!grid) return panel;
  const creativeName = normalizeText(panel.dataset.creativeName || '');
  const existingRoles = new Set([...grid.querySelectorAll('[data-assignment-role]')].map(block => block.dataset.assignmentRole).filter(Boolean));
  const mainRole = creativeDepartmentRole(creativeName);
  const orderedRoles = ['content', mainRole, ...['shooting','design','montage'].filter(role => role !== mainRole)];
  orderedRoles.forEach(role => {
    if(existingRoles.has(role)) return;
    const holder = document.createElement('div');
    const hint = role === 'content' ? 'كاتب المحتوى الذي سيظهر له تاسك كتابة المحتوى باسم الكريتيف' : (role === mainRole ? 'القسم التنفيذي المرتبط تلقائيًا بنوع الكريتيف' : 'قسم إضافي متاح للحملة عند الحاجة');
    holder.innerHTML = roleAssignmentBlock(role, defaultRoleSectionName(role), hint);
    const block = holder.firstElementChild;
    if(block) grid.appendChild(block);
  });
  return panel;
}
function syncPanelDynamicState(panel){
  if(!panel) return panel;
  ensurePanelHasAllRoleAssignments(panel);
  panel.querySelectorAll('.js-role-picker').forEach(syncRolePickerState);
  syncContentMontageLinks(panel);
  applyContentMontageLinksToMontagePicker(panel);
  panel.querySelectorAll('.js-content-dependency').forEach(syncContentDependencyState);
  panel.querySelectorAll('input, textarea, select').forEach(el => {
    if(el.type === 'checkbox' || el.type === 'radio'){
      if(el.checked) el.setAttribute('checked', 'checked'); else el.removeAttribute('checked');
    }else if(el.tagName === 'SELECT'){
      [...el.options].forEach(option => { if(option.selected) option.setAttribute('selected','selected'); else option.removeAttribute('selected'); });
    }else{
      el.setAttribute('value', el.value || '');
    }
  });
  return panel;
}
function selectedOptionTexts(control){
  if(control?.classList?.contains('js-role-picker') || (control?.classList?.contains('js-task-user') && control?.tagName !== 'SELECT')){
    const current = [...control.querySelectorAll('input[type="checkbox"]:checked')]
      .map(input => input.dataset.name || input.closest('label')?.textContent?.trim() || '')
      .filter(Boolean);
    return current.length ? current : storedMultiValues(control, 'selectedNames');
  }
  return [...(control?.selectedOptions || [])]
    .map(option => option.textContent.trim())
    .filter(text => text && !text.startsWith('اختر') && !text.startsWith('لا توجد'));
}
function selectedOptionValues(control){
  if(control?.classList?.contains('js-role-picker') || (control?.classList?.contains('js-task-user') && control?.tagName !== 'SELECT')){
    const current = [...control.querySelectorAll('input[type="checkbox"]:checked')].map(input => input.value).filter(Boolean);
    return current.length ? current : storedMultiValues(control, 'selectedIds');
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
  const sourceCreatives = creatives.length ? creatives : MZJ_DEFAULT_CREATIVE_NAMES.map(name => ({ name }));
  return sourceCreatives.map(item => `<label class="creative-check-card"><input type="checkbox" class="js-creative-check" value="${escapeHtml(item.name)}"${chosen.includes(item.name) ? ' checked' : ''}> <span>${escapeHtml(item.name)}</span></label>`).join('');
}
function selectedCreativeNames(row){
  const fromChecks = [...(row?.querySelectorAll('.js-creative-check:checked') || [])].map(input => normalizeText(input.value)).filter(Boolean);
  if(fromChecks.length) return uniqueList(fromChecks);
  const legacy = normalizeText(row?.querySelector('.js-creative-select')?.value || '');
  return legacy ? [legacy] : [];
}
function creativeProductLabel(creative, row){
  const userNames = [...(row?.querySelectorAll('.js-task-user,.js-creative-role-picker') || [])].flatMap(control => selectedOptionTexts(control));
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
  const jsonInput = card?.querySelector('.js-publish-platform-publishing-json');
  const saved = safeJsonParse(jsonInput?.value || '', []);
  if(Array.isArray(saved) && saved.length){
    return uniqueList(saved.map(item => item?.platform || '').filter(Boolean));
  }
  return [...(card?.querySelectorAll('.js-platform-checkbox:checked') || [])].map(input => input.value).filter(Boolean);
}

const publishPostTypeConfig = {
  facebook: [
    { value:'photo_post', label:'بوست صور', width:1080, height:1080 },
    { value:'reel', label:'ريل', width:1080, height:1920 },
    { value:'story', label:'ستوري', width:1080, height:1920 }
  ],
  instagram: [
    { value:'photo_post', label:'بوست صور', width:1080, height:1080 },
    { value:'reel', label:'ريل', width:1080, height:1920 },
    { value:'story', label:'ستوري', width:1080, height:1920 }
  ],
  tiktok: [
    { value:'reel', label:'ريل/فيديو', width:1080, height:1920 },
    { value:'story', label:'ستوري', width:1080, height:1920 }
  ],
  youtube: [
    { value:'reel', label:'ريل/Short', width:1080, height:1920 },
    { value:'hd_video', label:'فيديو HD', width:1920, height:1080 }
  ],
  snapchat: [
    { value:'story', label:'Story', width:1080, height:1920 },
    { value:'spotlight', label:'Spotlight', width:1080, height:1920 }
  ],
  whatsapp: [
    { value:'whatsapp_text', label:'رسالة نصية', width:'', height:'' },
    { value:'whatsapp_image', label:'صورة واتساب', width:1080, height:1080 },
    { value:'whatsapp_video_pending', label:'فيديو واتساب - قيد التحقق', width:1080, height:1920 }
  ]
};
function slugifyPostTypeLabel(label){
  const text = normalizeText(label).toLowerCase();
  if(text.includes('واتساب') && text.includes('صورة')) return 'whatsapp_image';
  if(text.includes('واتساب') && text.includes('رسالة')) return 'whatsapp_text';
  if(text.includes('واتساب') && text.includes('فيديو')) return 'whatsapp_video_pending';
  if(text.includes('hd') || text.includes('فيديو')) return 'hd_video';
  if(text.includes('spotlight') || text.includes('سبوت') || text.includes('اضواء') || text.includes('أضواء')) return 'spotlight';
  if(text.includes('short') || text.includes('ريل') || text.includes('reel')) return 'reel';
  if(text.includes('story') || text.includes('ستوري')) return 'story';
  if(text.includes('photo') || text.includes('صور') || text.includes('بوست')) return 'photo_post';
  return text.replace(/\s+/g, '_').replace(/[^\w؀-ۿ-]/g, '') || 'post_type';
}
function normalizePostTypeItem(item){
  if(!item || typeof item !== 'object') return null;
  const label = normalizeText(item.label || item.name || item.type || item.title || item.postTypeLabel || '');
  const width = Number(item.width || item.w || item.requiredWidth || item?.dimensions?.width || 0) || null;
  const height = Number(item.height || item.h || item.requiredHeight || item?.dimensions?.height || 0) || null;
  if(!label) return null;
  return { value: normalizeText(item.value || item.key || slugifyPostTypeLabel(label)), label, width, height };
}
function normalizePlatformPostTypes(list){
  if(!Array.isArray(list)) return [];
  const out = [];
  list.forEach(item => {
    const normalized = normalizePostTypeItem(item);
    if(normalized && !out.some(x => x.value === normalized.value && x.width === normalized.width && x.height === normalized.height)) out.push(normalized);
  });
  return out;
}
function parsePlatformPostTypesText(text){
  return String(text || '').split('\n').map(line => normalizeText(line)).filter(Boolean).map(line => {
    const parts = line.split(/[|،,]/).map(normalizeText).filter(Boolean);
    const label = parts[0] || '';
    const numbers = line.match(/\d+/g) || [];
    const width = Number(parts[1] || numbers[0] || 0) || null;
    const height = Number(parts[2] || numbers[1] || 0) || null;
    return normalizePostTypeItem({ label, width, height });
  }).filter(Boolean);
}
function platformPostTypesText(list){
  return normalizePlatformPostTypes(list).map(item => [item.label, item.width || '', item.height || ''].join(' | ')).join('\n');
}
function platformPostTypeRowHtml(item = {}){
  const normalized = normalizePostTypeItem(item) || { label:'', width:'', height:'' };
  return `<div class="platform-type-row">
    <input class="control platform-type-label" type="text" placeholder="مثال: ريل" value="${escapeHtml(normalized.label || '')}" />
    <input class="control platform-type-width" type="number" min="1" inputmode="numeric" placeholder="1080" value="${escapeHtml(normalized.width || '')}" />
    <input class="control platform-type-height" type="number" min="1" inputmode="numeric" placeholder="1920" value="${escapeHtml(normalized.height || '')}" />
    <button class="mini-btn danger" type="button" data-remove-platform-post-type>حذف</button>
  </div>`;
}
function syncPlatformPostTypesTextarea(){
  const textarea = document.getElementById('platformPostTypes');
  if(textarea) textarea.value = platformPostTypesText(getPlatformPostTypesFromRows());
}
function getPlatformPostTypesFromRows(){
  const rows = [...document.querySelectorAll('#platformPostTypesRows .platform-type-row')];
  return normalizePlatformPostTypes(rows.map(row => ({
    label: row.querySelector('.platform-type-label')?.value || '',
    width: row.querySelector('.platform-type-width')?.value || '',
    height: row.querySelector('.platform-type-height')?.value || ''
  })));
}
function setPlatformPostTypesRows(list = []){
  const box = document.getElementById('platformPostTypesRows');
  if(!box) return;
  const items = normalizePlatformPostTypes(list);
  box.innerHTML = (items.length ? items : [{}]).map(platformPostTypeRowHtml).join('');
  syncPlatformPostTypesTextarea();
}
function addPlatformPostTypeRow(item = {}){
  const box = document.getElementById('platformPostTypesRows');
  if(!box) return;
  box.insertAdjacentHTML('beforeend', platformPostTypeRowHtml(item));
  syncPlatformPostTypesTextarea();
}
function ensurePlatformPostTypesUi(){
  const box = document.getElementById('platformPostTypesRows');
  if(box && !box.children.length) setPlatformPostTypesRows([]);
}
window.MZJAddPlatformPostTypeRow = addPlatformPostTypeRow;
window.MZJSetPlatformPostTypesRows = setPlatformPostTypesRows;
window.MZJSyncPlatformPostTypesTextarea = syncPlatformPostTypesTextarea;
function normalizePublishPlatformName(value){
  const text = normalizeText(value).toLowerCase();
  if(text.includes('facebook') || text.includes('فيس')) return 'facebook';
  if(text.includes('instagram') || text.includes('insta') || text.includes('انست')) return 'instagram';
  if(text.includes('tiktok') || text.includes('tik tok') || text.includes('تيك') || text.includes('تيك توك')) return 'tiktok';
  if(text.includes('youtube') || text.includes('you tube') || text.includes('يوتيوب')) return 'youtube';
  if(text.includes('snapchat') || text.includes('snap chat') || text.includes('snap') || text.includes('سناب')) return 'snapchat';
  if(text.includes('whatsapp') || text.includes('واتساب') || text.includes('مرسال')) return 'whatsapp';
  return text;
}
function platformRecordByName(value){
  const target = normalizeText(value);
  const key = normalizePublishPlatformName(target);
  return platforms.find(item => normalizeText(item.name) === target || normalizePublishPlatformName(item.name) === key) || null;
}
function defaultPostTypesForPlatform(value){
  return publishPostTypeConfig[normalizePublishPlatformName(value)] || [];
}
function postTypesForPlatform(value){
  const platform = platformRecordByName(value);
  const custom = normalizePlatformPostTypes(platform?.postTypes || platform?.publishTypes || platform?.types || []);
  return custom.length ? custom : defaultPostTypesForPlatform(value);
}
function publishPostTypesForPlatforms(selected = []){
  const raw = Array.isArray(selected) ? selected : String(selected || '').split(/[،,+]/);
  const list = [];
  raw.map(normalizeText).filter(Boolean).forEach(name => postTypesForPlatform(name).forEach(item => {
    if(!list.some(x => x.value === item.value && x.width === item.width && x.height === item.height)) list.push(item);
  }));
  return list;
}
function publishPostTypeByValue(value, selected = []){
  const options = publishPostTypesForPlatforms(selected);
  return options.find(item => item.value === value) || null;
}
function publishPostTypeSelectHtml(selectedPlatforms = [], currentValue = ''){
  const options = publishPostTypesForPlatforms(selectedPlatforms);
  const current = options.some(item => item.value === currentValue) ? currentValue : '';
  if(!options.length) return '<select class="js-publish-post-type-select compact-select" aria-label="نوع المنشور"><option value="">نوع المنشور</option></select>';
  return '<select class="js-publish-post-type-select compact-select" aria-label="نوع المنشور"><option value="">نوع المنشور</option>' + options.map(item => `<option value="${escapeHtml(item.value)}" data-width="${item.width}" data-height="${item.height}"${current === item.value ? ' selected' : ''}>${escapeHtml(item.label)}</option>`).join('') + '</select>';
}
function publishPlatformTypeOptions(platformName, currentValue = '', checked = false){
  const options = postTypesForPlatform(platformName);
  const fallbackValue = checked && options.length ? options[0].value : '';
  const current = options.some(item => item.value === currentValue) ? currentValue : fallbackValue;
  const emptyLabel = options.length ? 'اختر نوع النشر والأبعاد' : 'لا توجد أنواع نشر لهذه المنصة';
  const opts = options.map(item => {
    const label = item.label || item.name || item.value;
    const dims = item.width && item.height ? ` - ${item.width}×${item.height}` : '';
    return `<option value="${escapeHtml(item.value)}" data-width="${item.width || ''}" data-height="${item.height || ''}"${current === item.value ? ' selected' : ''}>${escapeHtml(label)}${escapeHtml(dims)}</option>`;
  }).join('');
  return `<div class="publish-platform-type-control${checked ? ' is-visible' : ''}" data-platform-type-control="${escapeHtml(platformName)}"><span class="publish-platform-type-title">نوع النشر والأبعاد</span><select class="js-publish-platform-type-select publish-platform-type-select" data-publish-platform-type-for="${escapeHtml(platformName)}" aria-label="نوع نشر ${escapeHtml(platformName)}"><option value="">${emptyLabel}</option>${opts}</select></div>`;
}
function publishPlatformRowsHtml(meta = {}){
  const selectedList = Array.isArray(meta.platforms) ? meta.platforms : normalizeMaybeArray(meta.platform || '');
  const selected = new Set(selectedList.map(String));
  const typeMap = { ...(meta.platformTypes || {}) };
  const publishing = Array.isArray(meta.platformPublishing) ? meta.platformPublishing : [];
  publishing.forEach(item => { if(item?.platform && item?.postType && !typeMap[item.platform]) typeMap[item.platform] = item.postType; });
  return platforms.length ? platforms.map(item => {
    const name = item.name || '';
    const isChecked = selected.has(name);
    const checked = isChecked ? ' checked' : '';
    return `<div class="publish-platform-type-row${isChecked ? ' is-selected' : ''}" data-publish-platform-type-row="${escapeHtml(name)}"><label class="platform-check-card publish-platform-check-card"><input type="checkbox" class="js-platform-checkbox" value="${escapeHtml(name)}"${checked}> <span>${escapeHtml(name)}</span></label>${publishPlatformTypeOptions(name, typeMap[name] || '', isChecked)}</div>`;
  }).join('') : '<div class="multi-empty">لا توجد منصات</div>';
}
function ensurePublishPlatformTypeControl(row){
  if(!row) return null;
  const checkbox = row.querySelector('.js-platform-checkbox');
  const platformName = checkbox?.value || row.dataset.publishPlatformTypeRow || '';
  if(!platformName) return row.querySelector('.publish-platform-type-control');
  let control = row.querySelector('.publish-platform-type-control');
  if(!control){
    row.insertAdjacentHTML('beforeend', publishPlatformTypeOptions(platformName, '', !!checkbox?.checked));
    control = row.querySelector('.publish-platform-type-control');
  }
  let select = control?.querySelector('.js-publish-platform-type-select');
  const options = postTypesForPlatform(platformName);
  const missingOptions = select && options.length && ![...select.options].some(option => option.value);
  if(!select || missingOptions){
    const oldValue = select?.value || '';
    control.outerHTML = publishPlatformTypeOptions(platformName, oldValue, !!checkbox?.checked);
    control = row.querySelector('.publish-platform-type-control');
  }
  return control;
}
function refreshPublishPlatformTypeRow(row){
  if(!row) return;
  const checkbox = row.querySelector('.js-platform-checkbox');
  const checked = !!checkbox?.checked;
  const control = ensurePublishPlatformTypeControl(row);
  const select = row.querySelector('.js-publish-platform-type-select');
  row.classList.toggle('is-selected', checked);
  if(control) control.classList.toggle('is-visible', checked);
  if(select){
    select.disabled = !checked;
    if(!checked){
      select.value = '';
    }else if(!select.value){
      const firstOption = [...select.options].find(option => option.value);
      if(firstOption) select.value = firstOption.value;
    }
  }
}
function collectPublishPlatformPublishing(card){
  const jsonInput = card?.querySelector('.js-publish-platform-publishing-json');
  const saved = safeJsonParse(jsonInput?.value || '', []);
  if(Array.isArray(saved) && saved.length){
    return saved.map(item => ({
      platform: item.platform || '',
      postType: item.postType || '',
      postTypeLabel: item.postTypeLabel || item.label || '',
      requiredDimensions: item.requiredDimensions || (item.width || item.height ? { width: Number(item.width || 0) || null, height: Number(item.height || 0) || null } : null)
    })).filter(item => item.platform);
  }
  return [...(card?.querySelectorAll('.publish-platform-type-row') || [])].map(row => {
    const checked = row.querySelector('.js-platform-checkbox')?.checked;
    if(!checked) return null;
    const platform = row.querySelector('.js-platform-checkbox')?.value || '';
    const select = row.querySelector('.js-publish-platform-type-select');
    const value = select?.value || '';
    const opt = select?.selectedOptions?.[0];
    return {
      platform,
      postType: value,
      postTypeLabel: opt && value ? opt.textContent.trim() : '',
      requiredDimensions: value ? { width: Number(opt?.dataset.width || 0) || null, height: Number(opt?.dataset.height || 0) || null } : null
    };
  }).filter(Boolean);
}
function selectedPublishPostType(card){
  const publishing = collectPublishPlatformPublishing(card);
  const first = publishing.find(item => item.postType) || {};
  if(publishing.length > 1) return { value:first.postType || '', label:'أنواع متعددة', width:first.requiredDimensions?.width || null, height:first.requiredDimensions?.height || null };
  if(publishing.length === 1) return { value:first.postType || '', label:first.postTypeLabel || '', width:first.requiredDimensions?.width || null, height:first.requiredDimensions?.height || null };
  const value = card?.querySelector('.js-publish-post-type-select')?.value || '';
  const data = publishPostTypeByValue(value, selectedPlatformValues(card));
  return data ? { value:data.value, label:data.label, width:data.width, height:data.height } : { value:'', label:'', width:null, height:null };
}
function updatePublishPostTypeOptions(card){
  if(!card) return;
  card.querySelectorAll('.publish-platform-type-row').forEach(refreshPublishPlatformTypeRow);
}

function publishPlatformSummaryHtml(metaOrCard = {}){
  const list = metaOrCard?.nodeType ? collectPublishPlatformPublishing(metaOrCard) : (Array.isArray(metaOrCard.platformPublishing) ? metaOrCard.platformPublishing : []);
  if(!list.length) return '<span class="publish-platform-summary-empty">لم يتم اختيار منصات وأنواع نشر</span>';
  const grouped = new Map();
  list.forEach(item => {
    if(!item?.platform) return;
    if(!grouped.has(item.platform)) grouped.set(item.platform, []);
    grouped.get(item.platform).push(item);
  });
  return [...grouped.entries()].map(([platform, items]) => {
    const types = items.map(item => {
      const label = item.postTypeLabel || postTypeLabel(item.postType || '') || 'نوع غير محدد';
      const dims = item.requiredDimensions?.width && item.requiredDimensions?.height ? ` ${item.requiredDimensions.width}×${item.requiredDimensions.height}` : '';
      return `${label}${dims}`;
    }).join('، ');
    return `<span class="publish-platform-summary-chip"><strong>${escapeHtml(platform)}</strong><small>${escapeHtml(types)}</small></span>`;
  }).join('');
}
function updatePublishPlatformSummary(card){
  if(!card) return;
  const target = card.querySelector('.js-publish-platform-summary');
  if(target) target.innerHTML = publishPlatformSummaryHtml(card);
}
function syncHiddenPublishRowsFromPublishing(card, publishing = []){
  if(!card) return;
  const platformTypes = {};
  publishing.forEach(item => { if(item.platform && !platformTypes[item.platform]) platformTypes[item.platform] = item.postType || ''; });
  const hiddenBox = card.querySelector('.publish-platform-checks');
  if(hiddenBox){
    hiddenBox.innerHTML = publishPlatformRowsHtml({ platforms: uniqueList(publishing.map(item => item.platform).filter(Boolean)), platformPublishing: publishing, platformTypes });
    hiddenBox.querySelectorAll('.publish-platform-type-row').forEach(refreshPublishPlatformTypeRow);
  }
  const input = card.querySelector('.js-publish-platform-publishing-json');
  if(input) input.value = JSON.stringify(publishing || []);
  updatePublishPlatformSummary(card);
}
function publishPlatformPopupRows(card){
  const current = collectPublishPlatformPublishing(card);
  const selectedByPlatform = new Map();
  current.forEach(item => {
    if(!item.platform) return;
    if(!selectedByPlatform.has(item.platform)) selectedByPlatform.set(item.platform, new Set());
    if(item.postType) selectedByPlatform.get(item.platform).add(item.postType);
  });
  return platforms.length ? platforms.map(platform => {
    const name = platform.name || '';
    const selectedTypes = selectedByPlatform.get(name) || new Set();
    const isChecked = selectedTypes.size > 0;
    const types = postTypesForPlatform(name);
    const typeHtml = types.length ? types.map(type => {
      const dims = type.width && type.height ? `${type.width}×${type.height}` : 'بدون أبعاد';
      const checked = selectedTypes.has(type.value) ? ' checked' : '';
      return `<label class="publish-modal-type-card"><input type="checkbox" class="js-publish-modal-type" data-platform="${escapeHtml(name)}" value="${escapeHtml(type.value)}" data-label="${escapeHtml(type.label || type.value)}" data-width="${type.width || ''}" data-height="${type.height || ''}"${checked}> <span>${escapeHtml(type.label || type.value)}</span><small>${escapeHtml(dims)}</small></label>`;
    }).join('') : '<div class="multi-empty">لا توجد أنواع نشر لهذه المنصة</div>';
    return `<div class="publish-modal-platform-row${isChecked ? ' is-selected' : ''}" data-publish-modal-platform-row="${escapeHtml(name)}"><label class="publish-modal-platform-head"><input type="checkbox" class="js-publish-modal-platform" value="${escapeHtml(name)}"${isChecked ? ' checked' : ''}> <strong>${escapeHtml(name)}</strong></label><div class="publish-modal-types">${typeHtml}</div></div>`;
  }).join('') : '<div class="multi-empty">لا توجد منصات في صفحة الأقسام</div>';
}
function openPublishPlatformPopup(card){
  if(!card) return;
  closePublishPlatformPopup();
  const output = card.querySelector('.js-publish-output-select')?.selectedOptions?.[0]?.textContent || card.querySelector('.js-publish-output-select')?.value || 'منشور';
  const popup = document.createElement('div');
  popup.className = 'publish-platform-popup';
  popup.innerHTML = `<div class="publish-popup-backdrop" data-close-publish-platform-popup></div><section class="publish-popup-dialog" role="dialog" aria-modal="true"><div class="publish-popup-head"><div><h3>اختيار المنصات وأنواع النشر والأبعاد</h3><p>${escapeHtml(output)}</p></div><button type="button" class="task-modal-close" data-close-publish-platform-popup>×</button></div><div class="publish-popup-body"><div class="publish-modal-platform-list">${publishPlatformPopupRows(card)}</div></div><div class="publish-popup-actions"><button type="button" class="btn btn-light" data-close-publish-platform-popup>إلغاء</button><button type="button" class="btn btn-primary" data-save-publish-platform-popup>حفظ</button></div></section>`;
  popup._publishCard = card;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add('open'), 0);
}
function closePublishPlatformPopup(){
  document.querySelectorAll('.publish-platform-popup').forEach(el => el.remove());
}
function savePublishPlatformPopup(){
  const popup = document.querySelector('.publish-platform-popup');
  if(!popup) return;
  const publishing = [];
  popup.querySelectorAll('.publish-modal-platform-row').forEach(row => {
    const platformName = row.querySelector('.js-publish-modal-platform')?.value || '';
    if(!platformName) return;
    row.querySelectorAll('.js-publish-modal-type:checked').forEach(input => {
      publishing.push({
        platform: platformName,
        postType: input.value || '',
        postTypeLabel: input.dataset.label || input.value || '',
        requiredDimensions: { width: Number(input.dataset.width || 0) || null, height: Number(input.dataset.height || 0) || null }
      });
    });
  });
  if(!publishing.length) return showToast('اختار منصة واحدة ونوع نشر واحد على الأقل.');
  syncHiddenPublishRowsFromPublishing(popup._publishCard, publishing);
  closePublishPlatformPopup();
}


// v84 hard fix: refreshDynamicSelects no longer removes platform post-type controls
// v83 hard fix: جدول النشر - إظهار نوع النشر والأبعاد فور اختيار المنصة بدون الحاجة لتحديث الجدول
function forceRefreshPublishAgendaPlatformTypes(root = document){
  try{
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.publish-platform-type-row').forEach(row => {
      const checkbox = row.querySelector('.js-platform-checkbox');
      const checked = !!checkbox?.checked;
      let control = row.querySelector('.publish-platform-type-control');
      if(typeof ensurePublishPlatformTypeControl === 'function'){
        control = ensurePublishPlatformTypeControl(row) || control;
      }
      if(typeof refreshPublishPlatformTypeRow === 'function'){
        refreshPublishPlatformTypeRow(row);
      }
      control = row.querySelector('.publish-platform-type-control');
      const select = row.querySelector('.js-publish-platform-type-select');
      row.classList.toggle('is-selected', checked);
      if(control){
        control.classList.toggle('is-visible', checked);
        control.style.display = checked ? 'block' : 'none';
      }
      if(select){
        select.disabled = !checked;
        select.style.display = checked ? 'block' : 'none';
        if(checked && !select.value){
          const first = Array.from(select.options || []).find(option => option.value);
          if(first) select.value = first.value;
        }
      }
    });
  }catch(error){
    console.warn('forceRefreshPublishAgendaPlatformTypes failed', error);
  }
}
window.MZJForceRefreshPublishAgendaPlatformTypes = forceRefreshPublishAgendaPlatformTypes;

document.addEventListener('change', event => {
  if(event.target && event.target.matches && event.target.matches('.js-publish-modal-platform')){
    const row = event.target.closest('.publish-modal-platform-row');
    row?.classList.toggle('is-selected', event.target.checked);
    const boxes = row?.querySelectorAll('.js-publish-modal-type') || [];
    if(event.target.checked && boxes.length && ![...boxes].some(input => input.checked)) boxes[0].checked = true;
    if(!event.target.checked) boxes.forEach(input => { input.checked = false; });
    return;
  }
  if(event.target && event.target.matches && event.target.matches('.js-publish-modal-type')){
    const row = event.target.closest('.publish-modal-platform-row');
    const platformCheck = row?.querySelector('.js-publish-modal-platform');
    const any = !!row?.querySelector('.js-publish-modal-type:checked');
    if(platformCheck) platformCheck.checked = any;
    row?.classList.toggle('is-selected', any);
    return;
  }
  if(event.target && event.target.matches && event.target.matches('.publish-agenda .js-platform-checkbox, #publishAgenda .js-platform-checkbox')){
    const card = event.target.closest('.publish-day-card');
    forceRefreshPublishAgendaPlatformTypes(card || document);
    setTimeout(() => forceRefreshPublishAgendaPlatformTypes(card || document), 0);
    setTimeout(() => forceRefreshPublishAgendaPlatformTypes(card || document), 120);
  }
}, true);

document.addEventListener('click', event => {
  const openPublishPlatformBtn = event.target.closest?.('[data-open-publish-platform-popup]');
  if(openPublishPlatformBtn){ openPublishPlatformPopup(openPublishPlatformBtn.closest('.publish-day-card')); return; }
  if(event.target.closest?.('[data-close-publish-platform-popup]')){ closePublishPlatformPopup(); return; }
  if(event.target.closest?.('[data-save-publish-platform-popup]')){ savePublishPlatformPopup(); return; }
  const row = event.target && event.target.closest ? event.target.closest('.publish-platform-type-row') : null;
  if(row){
    const card = row.closest('.publish-day-card');
    setTimeout(() => forceRefreshPublishAgendaPlatformTypes(card || document), 0);
    setTimeout(() => forceRefreshPublishAgendaPlatformTypes(card || document), 120);
  }
}, true);

window.addEventListener('load', () => {
  forceRefreshPublishAgendaPlatformTypes(document);
  setTimeout(() => forceRefreshPublishAgendaPlatformTypes(document), 300);
  setTimeout(() => forceRefreshPublishAgendaPlatformTypes(document), 1000);
});

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
  refreshOrderStatusSelects();
  document.querySelectorAll('.js-campaign-type-select').forEach(select => { const value = select.value; select.innerHTML = campaignTypeOptions(value); });
  document.querySelectorAll('.publish-platform-checks').forEach(box => {
    const card = box.closest('.publish-day-card');
    const publishing = (typeof collectPublishPlatformPublishing === 'function') ? collectPublishPlatformPublishing(card) : [];
    const selected = uniqueList(publishing.map(item => item.platform).filter(Boolean));
    const platformTypes = {};
    publishing.forEach(item => { if(item && item.platform && !platformTypes[item.platform]) platformTypes[item.platform] = item.postType || ''; });
    box.innerHTML = (typeof publishPlatformRowsHtml === 'function')
      ? publishPlatformRowsHtml({ platforms: selected, platformPublishing: publishing, platformTypes })
      : platformCheckboxList(selected);
    if(typeof forceRefreshPublishAgendaPlatformTypes === 'function') forceRefreshPublishAgendaPlatformTypes(card || box);
    if(typeof updatePublishPlatformSummary === 'function') updatePublishPlatformSummary(card);
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
    users = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, uid: data.uid || doc.id, name: getDocName(data) || doc.id, displayName: data.displayName || '', username: data.username || '', email: data.email || '', emailLower: data.emailLower || String(data.email || '').toLowerCase(), department: data.department || '', departmentId: data.departmentId || '', departmentIds: Array.isArray(data.departmentIds) ? data.departmentIds : [], role: data.role || '', password: data.password || data.pass || '', pass: data.pass || data.password || '', pages: normalizePagesList([...(Array.isArray(data.pages) ? data.pages : []), ...(Array.isArray(data.pagesAccess) ? data.pagesAccess : [])]), pagesAccess: normalizePagesList([...(Array.isArray(data.pages) ? data.pages : []), ...(Array.isArray(data.pagesAccess) ? data.pagesAccess : [])]), themeSettings: data.themeSettings || null }; });
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
    const codeLabel = campaignTypeBaseCode(item) || [item.prefix || 'MZJ', item.code].filter(Boolean).join('-') || 'بدون كود';
    return `<article class="department-item">
      <div class="item-head"><h3>${escapeHtml(item.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-campaign-type="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-campaign-type="${escapeHtml(item.id)}">حذف</button></div></div>
      <div class="chip-list"><span class="chip">${escapeHtml(codeLabel)}</span><span class="chip"><small>الكود يتولد بالسنة والشهر تلقائيًا</small></span></div>
    </article>`;
  }).join('');
}

async function ensureSnapchatPlatformSeed(){
  if(!mainDb) return;
  const exists = platforms.some(item => normalizePublishPlatformName(item.name) === 'snapchat');
  if(exists) return;
  try{
    await safeCollection(window.MZJ_PLATFORMS_COLLECTION).add({
      name:'Snapchat',
      postTypes: defaultPostTypesForPlatform('Snapchat'),
      integrationStatus:'pending_approval',
      oauthClientId:'02fc6e20-d592-44fe-bc09-51abc1bcd237',
      redirectUri:'https://mzj.vercel.app/snapchat/callback',
      updatedAt: serverTime(),
      createdAt: serverTime()
    });
  }catch(error){
    console.warn('Snapchat platform seed error', error);
  }
}
async function ensureWhatsAppPlatformSeed(){
  if(!mainDb) return;
  const exists = platforms.some(item => normalizePublishPlatformName(item.name) === 'whatsapp');
  if(exists) return;
  try{
    await safeCollection(window.MZJ_PLATFORMS_COLLECTION).add({
      name:'حملات واتساب',
      postTypes: defaultPostTypesForPlatform('حملات واتساب'),
      integrationStatus:'mersal_ready',
      provider:'mersal',
      updatedAt: serverTime(),
      createdAt: serverTime()
    });
  }catch(error){
    console.warn('WhatsApp platform seed error', error);
  }
}

function renderPlatforms(){
  const list = document.getElementById('platformsList'); if(!list) return;
  if(!platforms.length){ list.innerHTML = '<div class="empty-state">لا توجد منصات حتى الآن.</div>'; return; }
  list.innerHTML = platforms.map(item => {
    const types = postTypesForPlatform(item.name);
    const chips = types.length ? types.map(type => `<span class="chip">${escapeHtml(type.label)}${type.width && type.height ? ` <small>${escapeHtml(type.width)}×${escapeHtml(type.height)}</small>` : ''}</span>`).join('') : '<span class="chip"><small>لا توجد أنواع نشر</small></span>';
    return `<article class="department-item"><div class="item-head"><h3>${escapeHtml(item.name)}</h3><div class="item-actions"><button type="button" class="mini-btn" data-edit-platform="${escapeHtml(item.id)}">تعديل</button><button type="button" class="mini-btn danger" data-delete-platform="${escapeHtml(item.id)}">حذف</button></div></div><div class="chip-list">${chips}</div></article>`;
  }).join('');
}
function renderOrderStatuses(){ renderNameList('orderStatusesList', orderStatuses, 'data-edit-order-status', 'data-delete-order-status', 'لا توجد حالات طلب حتى الآن.'); }
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
      if(task.selectedCar) used.push({ label: normalizeText(task.selectedCar), campaign, task, sourceType:'departmentTask' });
      (task.selectedCars || []).forEach(car => used.push({ id: normalizeText(car.id || car.groupKey), groupKey: normalizeText(car.groupKey || ''), label: normalizeText(car.label || car.name || car.carName), campaign, task, sourceType:'departmentTask' }));
    });
    (campaign.creatives || []).forEach(creative => {
      (creative.selectedCars || []).forEach(car => used.push({ id: normalizeText(car.id || car.groupKey), groupKey: normalizeText(car.groupKey || ''), label: normalizeText(car.label || car.name || car.carName), campaign, task: null, creative, sourceType:'creative' }));
      (creative.tasks || []).forEach(task => {
        (task.selectedCars || []).forEach(car => used.push({ id: normalizeText(car.id || car.groupKey), groupKey: normalizeText(car.groupKey || ''), label: normalizeText(car.label || car.name || car.carName), campaign, task, creative, sourceType:'creativeTask' }));
      });
    });
  });
  return used;
}
function stockGroupUsage(group){
  const used = campaignTaskCars();
  const ids = new Set((group.carIds || []).map(normalizeText).filter(Boolean));
  const keyParts = [group.carName, group.statement, group.exteriorColor, group.interiorColor].map(normalizeText).filter(Boolean);
  const groupKey = normalizeText(group.key || '');
  const hits = used.filter(item => {
    const idHit = item.id && ids.has(item.id);
    const groupHit = item.groupKey && groupKey && item.groupKey === groupKey;
    const label = normalizeText(item.label);
    const labelHit = label && keyParts.every(part => label.includes(part) || part === '—');
    return idHit || groupHit || labelHit;
  });
  return hits;
}
function stockUsageContentTitle(item){
  const task = item?.task || {};
  const creative = item?.creative || {};
  return normalizeText(task.taskType || task.contentType || task.content_type || task.structureTaskLabel || task.product || creative.creative || creative.product || item?.label || '');
}
function stockUsageSectionTitle(item){
  const task = item?.task || {};
  return normalizeText(task.contentSectionName || task.assignedDepartmentName || task.departmentName || task.contentSection || task.departmentRole || '');
}
function stockScheduleRowText(row){
  return normalizeText([row?.output, row?.title, row?.contentType, row?.type, row?.postTypeLabel, row?.postType, row?.platform, Array.isArray(row?.platforms) ? row.platforms.join(' ') : '', row?.caption, row?.hashtagsText].filter(Boolean).join(' '));
}
function stockUsageMatchesSchedule(item, row){
  const rowText = identityClean(stockScheduleRowText(row));
  if(!rowText) return false;
  const task = item?.task || {};
  const creative = item?.creative || {};
  const candidates = uniqueList([
    stockUsageContentTitle(item),
    stockUsageSectionTitle(item),
    task.product,
    task.creative,
    creative.creative,
    creative.product,
    item?.label
  ].map(normalizeText).filter(value => value && value !== '—'));
  if(!candidates.length) return false;
  return candidates.some(value => {
    const clean = identityClean(value);
    return clean && clean.length >= 2 && (rowText.includes(clean) || clean.includes(rowText));
  });
}
function formatStockMonth(dateText){
  const raw = normalizeText(dateText || '');
  const match = raw.match(/^(\d{4})-(\d{1,2})/);
  if(match) return `${match[1]}-${String(Number(match[2])).padStart(2,'0')}`;
  const d = raw ? new Date(raw) : null;
  if(d && !Number.isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  return '';
}
function stockGroupPublishDetails(group){
  const rows = [];
  const seen = new Set();
  (group.usage || []).forEach((hit, hitIndex) => {
    const campaign = hit.campaign || {};
    const schedule = Array.isArray(campaign.publishSchedule) ? campaign.publishSchedule : [];
    schedule.forEach((row, rowIndex) => {
      if(!row || !row.date) return;
      if(!stockUsageMatchesSchedule(hit, row)) return;
      const platformList = Array.isArray(row.platforms) ? row.platforms : normalizeMaybeArray(row.platform || '');
      const key = [campaign.id || campaign.campaignCode || campaign.campaignName || hitIndex, rowIndex, row.date, row.output || row.title || '', platformList.join('|'), row.postType || row.type || ''].join('::');
      if(seen.has(key)) return;
      seen.add(key);
      rows.push({
        campaign,
        hit,
        row,
        rowIndex,
        campaignName: campaign.campaignName || campaign.name || '—',
        campaignCode: campaign.campaignCode || campaign.campaign_code || '—',
        contentType: stockUsageSectionTitle(hit) || stockUsageContentTitle(hit) || row.contentType || row.type || '—',
        output: row.output || row.title || stockUsageContentTitle(hit) || '—',
        platform: platformList.join('، ') || row.platform || '—',
        postType: row.postTypeLabel || postTypeLabel(row.postType || row.type || row.contentType || '') || '—',
        date: row.date || row.publishDate || '',
        month: formatStockMonth(row.date || row.publishDate || '')
      });
    });
  });
  return rows.sort((a,b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.output || '').localeCompare(String(b.output || ''), 'ar'));
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
  return stockGroupPublishDetails(group).length > 0;
}
function stockRowAgendaMonths(group){
  return uniqueList(stockGroupPublishDetails(group).map(item => item.month ? String(Number(item.month.slice(5,7))) : '').filter(Boolean)).sort((a,b) => Number(a) - Number(b));
}
function stockRowPublishTypes(group){
  return uniqueList(stockGroupPublishDetails(group).map(item => item.postType).filter(Boolean));
}
function stockRowPublishOutputs(group){
  return uniqueList(stockGroupPublishDetails(group).map(item => item.output).filter(Boolean));
}
function stockGroupCampaignNames(group){
  const fromPublish = stockGroupPublishDetails(group).map(item => item.campaignName).filter(Boolean);
  const fromUsage = (group.usage || []).map(item => {
    const campaign = item?.campaign || {};
    return normalizeText(campaign.campaignName || campaign.name || '');
  }).filter(Boolean);
  return uniqueList([...fromPublish, ...fromUsage].map(normalizeText).filter(value => value && value !== '—'));
}
function stockRowContentTypes(group){
  const fromPublish = stockGroupPublishDetails(group).map(item => item.contentType).filter(Boolean);
  const fromUsage = (group.usage || []).flatMap(item => [stockUsageContentTitle(item), stockUsageSectionTitle(item)]).filter(Boolean);
  return uniqueList([...fromPublish, ...fromUsage].map(normalizeText).filter(value => value && value !== '—'));
}
function stockSearchText(group){
  const years = stockRowModelYears(group).join(' ');
  const campaignsText = stockGroupCampaignNames(group).join(' ');
  const contentTypesText = stockRowContentTypes(group).join(' ');
  const usageText = (group.usage || []).map(item => [item?.campaign?.campaignName, item?.campaign?.campaignCode, stockUsageSectionTitle(item), stockUsageContentTitle(item), item?.label].filter(Boolean).join(' ')).join(' ');
  const publishText = stockGroupPublishDetails(group).map(item => [item.campaignName, item.campaignCode, item.contentType, item.output, item.platform, item.postType, item.date, item.month].filter(Boolean).join(' ')).join(' ');
  return identityClean([group.key, group.carName, group.statement, group.exteriorColor, group.interiorColor, years, campaignsText, contentTypesText, usageText, publishText].join(' '));
}
function stockSystemContentTypeOptions(){
  const fromSections = contentSections.flatMap(section => Array.isArray(section.types) ? section.types : []);
  const fromRows = stockRowsWithMeta().flatMap(row => stockRowContentTypes(row));
  return uniqueList([...fromSections, ...fromRows].map(normalizeText).filter(Boolean)).sort((a,b) => a.localeCompare(b, 'ar'));
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
  fill('stockCampaignFilter', 'الحملة (الكل)', rows.flatMap(row => stockGroupCampaignNames(row)));
  fill('stockContentTypeFilter', 'نوع المحتوى (الكل)', stockSystemContentTypeOptions());
}
function stockAdvancedFilterValues(){
  const val = id => normalizeText(document.getElementById(id)?.value || '');
  return {
    search: val('stockSearchInput'),
    car: val('stockCarFilter'),
    statement: val('stockStatementFilter'),
    campaign: val('stockCampaignFilter'),
    contentType: val('stockContentTypeFilter'),
    shot: val('stockShotFilter'),
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
    if(f.campaign && !stockGroupCampaignNames(group).includes(f.campaign)) return false;
    if(f.contentType && !stockRowContentTypes(group).includes(f.contentType)) return false;
    if(f.shot === 'yes' && !group.isPhotographed) return false;
    if(f.shot === 'no' && group.isPhotographed) return false;
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
  ['stockSearchInput','stockCarFilter','stockStatementFilter','stockCampaignFilter','stockContentTypeFilter','stockShotFilter','stockAgendaInsideFilter','stockAgendaMonthFilter'].forEach(id => {
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
  const headers = ['م','Unique Spec Key','السيارة','البيان','اللون الخارجي','اللون الداخلي','الموديل','العدد','تم التصوير','الاستخدام','الحملات المرتبطة','أنواع المحتوى','أنواع النشر','منشورات مرتبطة','داخل الأجندة','شهور الأجندة'];
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
    stockGroupCampaignNames(group).join('، '),
    stockRowContentTypes(group).join('، '),
    stockRowPublishTypes(group).join('، '),
    stockRowPublishOutputs(group).join('، '),
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
    const publishDetails = stockGroupPublishDetails(group);
    const usageText = publishDetails.length ? `مستخدمة في ${publishDetails.length} منشور` : (group.isUsed ? `مستخدمة في ${group.usage.length} تاسك` : 'غير مستخدمة');
    const publishMini = publishDetails.length ? `<small>${escapeHtml(uniqueList(publishDetails.map(item => item.month).filter(Boolean)).join('، '))}</small>` : '';
    return `<tr data-stock-group="${escapeHtml(group.key)}">
      <td>${index + 1}</td>
      <td class="stock-key"><strong>${escapeHtml([group.carName, group.statement].filter(Boolean).join(' - '))}</strong></td>
      <td>${escapeHtml(group.exteriorColor || '—')}</td>
      <td>${escapeHtml(group.interiorColor || '—')}</td>
      <td><span class="stock-count">${group.count}</span></td>
      <td><select class="stock-shot-select ${stockShotSavingKeys.has(stockGroupDocId(group.key)) ? 'is-saving' : ''}" data-stock-shot="${escapeHtml(group.key)}" onchange="window.mzjHandleStockShotChange && window.mzjHandleStockShotChange(this)"><option value="no"${photographedValue !== 'yes' ? ' selected' : ''}>لا</option><option value="yes"${photographedValue === 'yes' ? ' selected' : ''}>نعم</option></select></td>
      <td><span class="stock-use-badge ${group.isUsed ? 'is-used' : 'is-unused'}">${escapeHtml(usageText)}</span>${publishMini}</td>
      <td><button class="mini-btn" type="button" data-stock-usage="${escapeHtml(group.key)}">سجل الاستخدام</button></td>
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
  const publishDetails = stockGroupPublishDetails(group);
  const rows = publishDetails.length ? publishDetails.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.campaignName)}</td>
      <td>${escapeHtml(item.campaignCode)}</td>
      <td>${escapeHtml(item.contentType || '—')}</td>
      <td>${escapeHtml(item.output || '—')}</td>
      <td>${escapeHtml(item.platform || '—')}</td>
      <td>${escapeHtml(item.postType || '—')}</td>
      <td>${escapeHtml(item.date || '—')}</td>
      <td>${escapeHtml(item.month || '—')}</td>
    </tr>`).join('') : (hits.length ? hits.map((hit, index) => {
    const campaign = hit.campaign || {};
    const task = hit.task || {};
    return `<tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(campaign.campaignName || campaign.name || '—')}</td>
      <td>${escapeHtml(campaign.campaignCode || campaign.campaign_code || '—')}</td>
      <td>${escapeHtml(stockUsageSectionTitle(hit) || '—')}</td>
      <td>${escapeHtml(stockUsageContentTitle(hit) || '—')}</td>
      <td>${escapeHtml(task.userName || task.assignedToName || task.assigneeName || '—')}</td>
      <td>${escapeHtml(task.selectedCar || hit.label || '—')}</td>
      <td>—</td>
      <td>—</td>
    </tr>`;
  }).join('') : `<tr><td colspan="9">السيارة غير مستخدمة في أي نوع محتوى.</td></tr>`);
  modal.innerHTML = `<div class="task-modal-backdrop" data-close-stock-usage></div><div class="task-modal-dialog stock-usage-dialog"><button class="task-modal-close" type="button" data-close-stock-usage>×</button><div class="task-modal-head"><div><span>سجل استخدام السيارة</span><h2>${escapeHtml(title)}</h2><p>${publishDetails.length ? `مستخدمة في ${publishDetails.length} منشور` : (hits.length ? `مستخدمة في ${hits.length} نوع محتوى` : 'غير مستخدمة')}</p></div></div><div class="stock-usage-table-wrap"><table class="stock-usage-table"><thead><tr><th>م</th><th>الحملة</th><th>كود الحملة</th><th>نوع المحتوى</th><th>المنشور</th><th>المنصة</th><th>نوع النشر</th><th>التاريخ</th><th>الشهر</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
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
  const inline = document.getElementById('taskUploadProgressInline');
  if(inline){
    inline.innerHTML = `<div class="inline-upload-progress-box"><div class="inline-upload-progress-head"><strong>${escapeHtml(label)} ${value}%</strong>${meta.cancelable ? '<button type="button" data-cancel-active-upload>إلغاء</button>' : ''}</div><div class="inline-upload-bar"><span style="width:${value}%"></span></div>${stats ? `<div class="inline-upload-stats"><span>الملف: ${escapeHtml(meta.fileName || '')}</span><span>المرفوع: ${escapeHtml(stats)}</span><span>السرعة: ${speed ? `${formatUploadBytes(speed)}/ث` : 'جاري الحساب'}</span><span>المتبقي: ${escapeHtml(formatUploadTime(remaining))}</span></div>` : ''}</div>`;
  }
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
  const output = row?.querySelector('.js-product-output');
  if(!output) return;
  const panels = [...(row?.querySelectorAll('.creative-assignment-panel') || [])];
  if(panels.length){
    output.value = panels.map(panel => {
      const creative = normalizeText(panel.dataset.creativeName || '');
      const qty = normalizeText(panel.querySelector('.js-creative-quantity')?.value || '1');
      const userNames = [...panel.querySelectorAll('.js-role-picker')].flatMap(control => selectedOptionTexts(control));
      const usersText = uniqueList(userNames).join(' - ');
      return [creative, qty ? `عدد ${qty}` : '', usersText].filter(Boolean).join(' / ');
    }).filter(Boolean).join(' | ');
    return;
  }
  const creativesList = selectedCreativeNames(row);
  const userNames = [...(row?.querySelectorAll('.js-task-user,.js-creative-role-picker') || [])].flatMap(control => selectedOptionTexts(control));
  const usersText = uniqueList(userNames).join(' - ');
  output.value = creativesList.length ? creativesList.map(cr => usersText ? `${cr} - ${usersText}` : cr).join(' | ') : '';
}
function updateAllProductOutputs(){ document.querySelectorAll('#creativeRows .creative-row-card').forEach(updateProductOutput); }

function campaignRequestContentAssignees(){
  const picker = document.querySelector('#campaignRequestForm .js-request-content-writers');
  return { ids: selectedOptionValues(picker), names: selectedOptionTexts(picker) };
}
function requestStructureTaskForCreative(creative, quantity = 1){
  const assignees = campaignRequestContentAssignees();
  if(!assignees.ids.length && !assignees.names.length) return null;
  const dep = findDepartmentByRole('content') || {};
  const requestForm = document.getElementById('campaignRequestForm');
  const brief = normalizeText(requestForm?.querySelector('[name="content_writer_brief"]')?.value || '');
  const structureDeadline = normalizeText(requestForm?.querySelector('[name="structure_deadline"]')?.value || '');
  const creativeName = normalizeText(creative || '');
  return {
    contentSectionId: dep.id || 'content',
    contentSectionName: dep.name || defaultRoleSectionName('content'),
    taskType: creativeMainTaskType(creativeName, 'content'),
    quantity: Math.max(1, Math.min(50, Number(quantity || 1))),
    requiredDate: structureDeadline ? structureDeadline.slice(0, 10) : '',
    requiredDateTime: structureDeadline,
    structureDeadline,
    contentWriterBrief: brief,
    campaignRequestBrief: brief,
    needsStructureUpload: true,
    structureRequestTask: true,
    sourceRequestStep: 'campaign_request_data',
    userIds: assignees.ids,
    userNames: assignees.names,
    departmentRole: 'content',
    status: 'pending'
  };
}

function defaultRoleSectionName(role){
  return {content:'قسم المحتوى', shooting:'قسم التصوير', design:'قسم التصميم', montage:'قسم المونتاج', publish:'قسم النشر'}[role] || 'قسم';
}
function defaultRoleTaskType(role){
  return {content:'كتابة المحتوى', shooting:'التصوير', design:'التصميم', montage:'المونتاج', publish:'النشر'}[role] || 'تاسك';
}
function creativeDepartmentRole(creativeName){
  const raw = normalizeText(creativeName || '');
  const key = identityClean(raw);
  if(!key) return 'montage';
  if(key.startsWith('تصوير') || key.includes('قسم التصوير')) return 'shooting';
  const designKeys = ['post','carousel','panner','banner','motion','gif','print','mzjinterial','mzjinterior','تصميم'];
  if(designKeys.some(item => key.includes(item))) return 'design';
  return 'montage';
}
function creativeRoleLabelForName(creativeName){
  const role = creativeDepartmentRole(creativeName);
  return {shooting:'قسم التصوير', design:'قسم التصميم', montage:'قسم المونتاج'}[role] || 'قسم المونتاج';
}

const MZJ_CREATIVE_SHORT_CODES = [
  ['REEL - مواصفات كامله - STUDIO','M-RL-SPEC-ST'],
  ['REEL - اهم المواصفات - STUDIO','M-RL-TOP-ST'],
  ['REEL - SHORT/TREND - SHOWROOM','M-RL-TRD-SR'],
  ['REEL - UGC - SHOWROOM','M-RL-UGC-SR'],
  ['REEL - حملات - SHOWROOM','M-RL-CMP-SR'],
  ['REEL - معارضنا - SHOWROOM','M-RL-SHOW-SR'],
  ['REEL - تجربه عميل - SHOWROOM','M-RL-CUST-SR'],
  ['VIDEO - مواصفات - STUDIO','M-VD-SPEC-ST'],
  ['VIDEO - فيلم سياره - STUDIO','M-VD-CAR-ST'],
  ['VIDEO - فيلم - STUDIO','M-VD-FILM-ST'],
  ['VIDEO - مواصفات - SHOWROOM','M-VD-SPEC-SR'],
  ['VIDEO - فيلم - SHOWROOM','M-VD-FILM-SR'],
  ['VIDEO - معارضنا - SHOWROOM','M-VD-SHOW-SR'],
  ['STORY - جاهزة الان - STUDIO','M-ST-READY-ST'],
  ['STORY - سعرها اليوم - STUDIO','M-ST-PRICE-ST'],
  ['STORY - قسطها الان - STUDIO','M-ST-INST-ST'],
  ['STORY - معرضنا - SHOWROOM','M-ST-SHOW-SR'],
  ['STORY - جاهزة الان - SHOWROOM','M-ST-READY-SR'],
  ['STORY - سعرها اليوم - SHOWROOM','M-ST-PRICE-SR'],
  ['STORY - قسطها الان - SHOWROOM','M-ST-INST-SR'],
  ['POST','D-POST'],
  ['CAROUSEL','D-CAROUSEL'],
  ['PANNER','D-PANNER'],
  ['MOTION','D-MOTION'],
  ['GIF','D-GIF'],
  ['PRINT','D-PRINT'],
  ['MZJ-INTERIAL','D-INTERIAL'],
  ['تصوير صور السياره','P-CAR-PHOTO'],
  ['تصوير ريل - مواصفات - STUDIO','P-RL-SPEC-ST'],
  ['تصوير ريل - SHORT/TREND - SHOWROOM','P-RL-TRD-SR'],
  ['تصوير ريل - UGC - SHOWROOM','P-RL-UGC-SR'],
  ['تصوير ريل - معارضنا - SHOWROOM','P-RL-SHOW-SR'],
  ['تصوير ريل - تجربه عميل - SHOWROOM','P-RL-CUST-SR'],
  ['تصوير فيديو - مواصفات - STUDIO','P-VD-SPEC-ST'],
  ['تصوير فيديو - مواصفات - SHOWROOM','P-VD-SPEC-SR'],
  ['تصوير فيديو - معارضنا - SHOWROOM','P-VD-SHOW-SR'],
  ['تصوير ستوري - سياره - STUDIO','P-ST-CAR-ST'],
  ['تصوير ستوري - معرضنا - SHOWROOM','P-ST-SHOW-SR']
];
function creativeShortCodeForName(creativeName){
  const clean = identityClean(creativeName || '');
  const found = MZJ_CREATIVE_SHORT_CODES.find(([name]) => identityClean(name) === clean);
  if(found) return found[1];
  const raw = normalizeText(creativeName || '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);
  return raw || 'CR';
}
function creativeNameFromShortCode(code){
  const clean = normalizeText(code || '').toUpperCase();
  const found = MZJ_CREATIVE_SHORT_CODES.find(([, short]) => normalizeText(short).toUpperCase() === clean);
  return found ? found[0] : '';
}
function roleCode(role){
  const key = normalizeDepartmentRole(role || '');
  return { content:'CONTENT', montage:'MONTAGE', design:'DESIGN', shooting:'PHOTO', publish:'PUBLISH' }[key] || normalizeText(role || '').toUpperCase() || 'DEPT';
}
function roleFromCode(code){
  const key = normalizeText(code || '').toUpperCase();
  if(['MONTAGE','EDIT','M'].includes(key)) return 'montage';
  if(['DESIGN','D'].includes(key)) return 'design';
  if(['PHOTO','SHOOTING','P'].includes(key)) return 'shooting';
  if(['CONTENT','C'].includes(key)) return 'content';
  return normalizeDepartmentRole(code || '') || '';
}
function userCodeFromIdentity(value){
  const text = normalizeText(value || '');
  const clean = identityClean(text);
  if(!clean) return '';
  if(clean.includes('احمد') && (clean.includes('ناجي') || clean.includes('nagi'))) return 'N';
  if(clean.includes('بلال') || clean.includes('khtan') || clean.includes('ختعن')) return 'B';
  if(clean.includes('امجاد') || clean.includes('الدوسري') || clean.includes('amjad')) return 'A';
  const user = findUserByAnyIdentity([text]) || {};
  const explicit = normalizeText(user.code || user.userCode || user.shortCode || user.initials || user.username || '');
  if(explicit) return explicit.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 12);
  const latin = text.match(/[A-Za-z0-9]/g);
  if(latin && latin.length) return latin.join('').toUpperCase().slice(0, 6);
  return clean.slice(0, 8).toUpperCase();
}
function userCodesForTask(task){
  const ids = Array.isArray(task?.userIds) ? task.userIds : [];
  const names = Array.isArray(task?.userNames) ? task.userNames : [];
  const max = Math.max(ids.length, names.length);
  return uniqueList(Array.from({length:max}, (_, i) => {
    const user = findUserByAnyIdentity([ids[i], names[i]]) || {};
    return userCodeFromIdentity(user.code || user.userCode || user.shortCode || user.username || user.name || names[i] || ids[i]);
  }).filter(Boolean));
}
function usersByCodes(codes){
  const list = uniqueList(String(Array.isArray(codes) ? codes.join(',') : (codes || '')).split(/[،,|/\s]+/).map(v => v.trim()).filter(Boolean));
  const resolved = [];
  list.forEach(code => {
    const clean = normalizeText(code).toUpperCase();
    const user = users.find(u => userCodeFromIdentity(u.code || u.userCode || u.shortCode || u.username || u.name || u.displayName || u.email) === clean);
    if(user) resolved.push(user.id || user.uid || user.email || userName(user));
  });
  return uniqueList(resolved);
}
function creativeAssignmentForStructureRow(campaign, parentTask, row){
  const rowShort = normalizeText(row?.creativeShortCode || extractCreativeShortCodeFromTaskNo(row?.taskNo || '') || parentTask?.creativeShortCode || '').toUpperCase();
  const rowLink = normalizeText(row?.creativeLinkCode || extractCreativeLinkCodeFromTaskNo(row?.taskNo || '') || taskCreativeLinkCode(parentTask)).toUpperCase();
  const list = Array.isArray(campaign?.creatives) ? campaign.creatives : [];
  return list.find((item, index) => {
    const itemShort = normalizeText(item?.creativeShortCode || creativeShortCodeForName(item?.creative || item?.product || '')).toUpperCase();
    const itemLink = creativeLinkCodeForIndex(campaign?.campaignCode || campaign?.campaign_code || '', index).toUpperCase();
    return (rowShort && itemShort === rowShort) || (rowLink && itemLink === rowLink);
  }) || null;
}
function taskForRoleFromCreativeAssignment(creativeRow, role){
  const wanted = normalizeDepartmentRole(role || '');
  return (Array.isArray(creativeRow?.tasks) ? creativeRow.tasks : []).find(task => normalizeDepartmentRole(task.departmentRole || task.contentSectionName || '') === wanted) || null;
}

function assignmentForRoleFromCreativeRow(creativeRow, role){
  const wanted = normalizeDepartmentRole(role || '');
  const task = taskForRoleFromCreativeAssignment(creativeRow, wanted);
  if(task) return task;
  const assignment = creativeRow?.departmentAssignments?.[wanted] || creativeRow?.departmentAssignments?.[roleCode(wanted)] || null;
  if(!assignment) return null;
  return {
    departmentRole: wanted,
    departmentCode: assignment.departmentCode || roleCode(wanted),
    userIds: Array.isArray(assignment.userIds) ? assignment.userIds : [],
    userNames: Array.isArray(assignment.userNames) ? assignment.userNames : [],
    userCodes: Array.isArray(assignment.userCodes) ? assignment.userCodes : [],
    taskType: creativeRow?.creative || creativeRow?.product || defaultRoleTaskType(wanted),
    status: wanted === 'content' ? 'pending' : 'waiting_structure',
    waitingForApproval: wanted !== 'content',
    waitingForApprovalLabel: wanted !== 'content' ? 'في انتظار اعتماد الهيكل' : ''
  };
}
function autoAssigneesForStructureRow(campaign, parentTask, row){
  const byCode = usersByCodes(row?.userCode || row?.userCodes || '');
  if(byCode.length) return byCode;
  const role = roleFromCode(row?.departmentCode || '') || creativeDepartmentRole(creativeNameFromShortCode(row?.creativeShortCode) || parentTask?.creative || parentTask?.product || '');
  const assignment = creativeAssignmentForStructureRow(campaign, parentTask, row);
  const task = assignmentForRoleFromCreativeRow(assignment, role);
  if(!task) return [];
  const ids = Array.isArray(task.userIds) ? task.userIds : [];
  const names = Array.isArray(task.userNames) ? task.userNames : [];
  return uniqueList([...ids, ...names].filter(Boolean));
}
function creativeMainTaskType(creativeName, role){
  const creative = normalizeText(creativeName || '');
  if(role === 'content') return creative ? `طلب هيكل - ${creative}` : 'طلب هيكل';
  return creative || defaultRoleTaskType(role);
}
function roleAssignmentBlock(role, label, hint='', options = {}){
  const isContent = role === 'content';
  const dateLabel = isContent ? 'ميعاد تسليم كاتب المحتوى' : `ميعاد تسليم ${label}`;
  const dateNote = options.dateNote || (isContent ? 'ميعاد تسليم كتابة المحتوى لهذا الكريتيف.' : 'حدد ميعاد التسليم النهائي لهذا القسم.');
  const dateAttrs = '';
  return `<div class="creative-role-assignment" data-assignment-role="${escapeHtml(role)}">
    <div class="creative-role-title"><strong>${escapeHtml(label)}</strong>${hint ? `<small>${escapeHtml(hint)}</small>` : ''}</div>
    ${rolePickerHtml(role, `js-creative-role-picker js-${role}-assignee`, label)}
    ${contentMontageLinkerHtml(role)}
    ${contentDependencyPickerHtml(role)}
    <label class="creative-role-deadline-field">
      <span>${escapeHtml(dateLabel)}</span>
      <input class="js-role-deadline js-${role}-deadline" data-role-deadline="${escapeHtml(role)}" type="date"${dateAttrs} />
      <small>${escapeHtml(dateNote)}</small>
    </label>
  </div>`;
}

function creativeSafeKey(value){
  return identityClean(value || '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 70) || `creative-${Date.now()}`;
}
function selectedCreativePanelNames(row){
  return [...(row?.querySelectorAll('.creative-assignment-panel') || [])].map(panel => normalizeText(panel.dataset.creativeName || '')).filter(Boolean);
}
function creativeAssignmentRoleBlocksHtml(creativeName){
  const mainRole = creativeDepartmentRole(creativeName);
  const roles = ['shooting','design','montage'];
  const orderedRoles = [mainRole, ...roles.filter(role => role !== mainRole)];
  const mainHint = 'القسم التنفيذي المرتبط تلقائيًا بنوع الكريتيف';
  const optionalHint = 'قسم إضافي متاح للحملة عند الحاجة';
  return orderedRoles.map(role => roleAssignmentBlock(role, defaultRoleSectionName(role), role === mainRole ? mainHint : optionalHint)).join('');
}
function creativeAssignmentPanelHtml(creativeName){
  const key = creativeSafeKey(creativeName);
  const mainRole = creativeDepartmentRole(creativeName);
  return `<article class="creative-assignment-panel" data-creative-name="${escapeHtml(creativeName)}" data-creative-key="${escapeHtml(key)}" data-creative-main-role="${escapeHtml(mainRole)}">
    <header class="creative-assignment-panel-head">
      <div><span>الكريتيف</span><strong>${escapeHtml(creativeName)}</strong></div>
      <label class="creative-qty-field"><span>العدد</span><input class="js-creative-quantity" type="number" min="1" value="1" inputmode="numeric" /></label>
    </header>
    <div class="creative-assignment-inner-grid">
      ${creativeAssignmentRoleBlocksHtml(creativeName)}
    </div>
    <div class="creative-assignment-note">كاتب المحتوى يتم اختياره من خطوة بيانات طلب الهيكل. هنا اختار الأقسام التنفيذية المطلوبة للكريتيف، وسيتم ربطها تلقائيًا بأكواد الهيكل بعد الاعتماد.</div>
  </article>`;
}
function refreshCreativeAssignmentPanels(row){
  if(!row) return;
  const wrap = row.querySelector('.selected-creative-assignments');
  if(!wrap) return;
  const selected = selectedCreativeNames(row);
  const existing = new Map([...wrap.querySelectorAll('.creative-assignment-panel')].map(panel => [normalizeText(panel.dataset.creativeName || ''), syncPanelDynamicState(panel)]));
  if(!selected.length){
    wrap.innerHTML = '<div class="empty-state mini-empty">اختار كريتيف واحد أو أكثر عشان تظهر إعدادات العدد واليوزرات هنا.</div>';
    updateProductOutput(row);
    return;
  }
  const nodes = [];
  selected.forEach(name => {
    const current = existing.get(normalizeText(name));
    if(current) nodes.push(syncPanelDynamicState(current).outerHTML); else nodes.push(creativeAssignmentPanelHtml(name));
  });
  wrap.innerHTML = nodes.join('');
  wrap.querySelectorAll('.js-role-picker').forEach(refreshRolePicker);
  wrap.querySelectorAll('.creative-assignment-panel').forEach(refreshContentDependencyPickers);
  updateProductOutput(row);
}

function ensureCreativeAssignmentPopup(){
  let modal = document.getElementById('creativeAssignmentPopup');
  if(modal) return modal;
  modal = document.createElement('div');
  modal.id = 'creativeAssignmentPopup';
  modal.className = 'task-modal creative-assignment-popup';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="task-modal-backdrop" data-close-creative-assignment-popup></div>
    <section class="task-modal-dialog creative-assignment-popup-dialog" role="dialog" aria-modal="true" aria-label="ربط الكريتيفات باليوزرات">
      <button class="task-modal-close" type="button" data-close-creative-assignment-popup>×</button>
      <div class="task-modal-head">
        <div><span>الكريتيفات والمهام</span><h2>ربط الكريتيفات باليوزرات</h2><p>اختار الكريتيفات، حدد العدد، واربط كل كريتيف بيوزرات الأقسام المطلوبة.</p></div>
      </div>
      <div class="creative-popup-layout">
        <aside class="creative-popup-side">
          <h3>اختيار الكريتيفات</h3>
          <input class="creative-popup-search" type="search" placeholder="ابحث باسم الكريتيف..." aria-label="بحث في الكريتيفات" />
          <div class="creative-popup-checks"></div>
        </aside>
        <main class="creative-popup-main">
          <div class="creative-popup-panels"></div>
        </main>
      </div>
      <div class="creative-popup-actions"><button class="btn btn-light" type="button" data-close-creative-assignment-popup>إلغاء</button><button class="btn btn-primary" type="button" data-save-creative-assignment-popup>حفظ الربط</button></div>
    </section>`;
  document.body.appendChild(modal);
  return modal;
}
function creativeDisplayParts(name){
  const value = normalizeText(name);
  if(!value) return { title:'بدون اسم', subtitle:'' };
  const parts = value.split(/\s+-\s+/).map(part => part.trim()).filter(Boolean);
  const type = parts[0] || '';
  const title = value;
  const subtitle = parts.length > 1 ? parts.slice(1).join(' - ') : '';
  return { title, subtitle, type };
}
function popupCreativeCheckboxList(selected = []){
  const chosen = (selected || []).map(normalizeText);
  const sourceCreatives = creatives.length ? creatives : MZJ_DEFAULT_CREATIVE_NAMES.map(name => ({ name, id: creativeSafeKey(name), isDefault: true }));
  return sourceCreatives.map((item, index) => {
    const name = normalizeText(item.name);
    const parts = creativeDisplayParts(name);
    const checked = chosen.includes(name) ? ' checked' : '';
    return `<div class="creative-check-card popup-creative-check-card" role="button" tabindex="0" data-popup-creative-toggle="${escapeHtml(name)}" title="${escapeHtml(name)}">
      <div class="popup-creative-index">${index + 1}</div>
      <div class="popup-creative-text"><strong>${escapeHtml(parts.title)}</strong>${parts.type ? `<small>${escapeHtml(parts.type)}</small>` : ''}</div>
      <span class="popup-creative-check-ui" aria-hidden="true">✓</span>
      <input type="checkbox" class="js-popup-creative-check" value="${escapeHtml(name)}"${checked}>
    </div>`;
  }).join('');
}

async function reloadCreativesForPopup(modal, selected = []){
  if(!modal || creatives.length || !mainDb) return;
  const checks = modal.querySelector('.creative-popup-checks');
  if(checks) checks.innerHTML = '<div class="multi-empty">جاري تحميل الكريتيفات...</div>';
  try{
    const snapshot = await safeCollection(window.MZJ_CREATIVES_COLLECTION).orderBy('name').get();
    const mapped = snapshot.docs.map(doc => { const data = doc.data() || {}; return { id: doc.id, name: getDocName(data) || data.name || doc.id, ...data }; }).filter(item => normalizeText(item.name));
    if(mapped.length){
      creatives.splice(0, creatives.length, ...mapped);
      renderCreatives();
      refreshDynamicSelects();
    }
  }catch(error){
    console.error('Reload creatives for popup error', error);
  }
  if(checks) checks.innerHTML = popupCreativeCheckboxList(selected);
  setCreativePopupActive(modal, normalizeText(modal.dataset.activeCreativeKey || selected[0] || ''));
}
function getCreativePopupSelected(modal){
  return [...(modal?.querySelectorAll('.js-popup-creative-check:checked') || [])].map(input => normalizeText(input.value || '')).filter(Boolean);
}
function setCreativePopupActive(modal, creativeName){
  if(!modal) return;
  const activeName = normalizeText(creativeName || '');
  modal.dataset.activeCreativeKey = activeName;
  modal.querySelectorAll('.creative-popup-active-tab').forEach(tab => {
    const tabName = normalizeText(tab.dataset.creativePopupTab || tab.getAttribute('title') || tab.textContent || '');
    tab.classList.toggle('active', tabName === activeName);
  });
  const activeSelect = modal.querySelector('.creative-popup-active-select');
  if(activeSelect && activeName) activeSelect.value = activeName;
  modal.querySelectorAll('.creative-assignment-panel').forEach(panel => {
    const panelName = normalizeText(panel.dataset.creativeName || '');
    panel.classList.toggle('is-active', panelName === activeName);
  });
  modal.querySelectorAll('.popup-creative-check-card').forEach(card => {
    const input = card.querySelector('.js-popup-creative-check');
    const cardName = normalizeText(input?.value || card.dataset.popupCreativeToggle || '');
    card.classList.toggle('is-selected', !!input?.checked);
    card.classList.toggle('is-active-linked', cardName === activeName && !!input?.checked);
  });
}
function refreshCreativePopupPanels(modal){
  if(!modal) return;
  const wrap = modal.querySelector('.creative-popup-panels');
  if(!wrap) return;
  const selected = getCreativePopupSelected(modal);
  const existing = new Map([...wrap.querySelectorAll('.creative-assignment-panel')].map(panel => [normalizeText(panel.dataset.creativeName || ''), syncPanelDynamicState(panel)]));
  if(!selected.length){
    modal.dataset.activeCreativeKey = '';
    wrap.innerHTML = '<div class="empty-state mini-empty">اختار كريتيف واحد أو أكثر من القائمة عشان تظهر إعداداته هنا.</div>';
    setCreativePopupActive(modal, '');
    return;
  }
  let activeKey = normalizeText(modal.dataset.activeCreativeKey || '');
  if(!selected.map(normalizeText).includes(activeKey)) activeKey = normalizeText(selected[0]);
  modal.dataset.activeCreativeKey = activeKey;
  const options = selected.map(name => {
    const key = normalizeText(name);
    return `<option value="${escapeHtml(key)}"${key === activeKey ? ' selected' : ''}>${escapeHtml(name)}</option>`;
  }).join('');
  const summary = selected.map((name, index) => {
    const key = normalizeText(name);
    return `<button class="creative-popup-active-tab${key === activeKey ? ' active' : ''}" type="button" data-creative-popup-tab="${escapeHtml(name)}" title="${escapeHtml(name)}"><span>${index + 1}. ${escapeHtml(name)}</span></button>`;
  }).join('');
  const panels = selected.map(name => {
    const key = normalizeText(name);
    const current = existing.get(key);
    let html = current ? syncPanelDynamicState(current).outerHTML : creativeAssignmentPanelHtml(name);
    const holder = document.createElement('div');
    holder.innerHTML = html;
    const panel = holder.querySelector('.creative-assignment-panel');
    if(panel){
      panel.dataset.creativeName = name;
      panel.classList.remove('is-active');
      if(key === activeKey) panel.classList.add('is-active');
      html = panel.outerHTML;
    }
    return html;
  }).join('');
  wrap.innerHTML = `<div class="creative-popup-editor-switch"><div class="creative-popup-active-tabs" role="tablist" aria-label="اختيار الكريتيف الحالي">${summary}</div></div><div class="creative-popup-active-panels">${panels}</div>`;
  wrap.querySelectorAll('.js-role-picker').forEach(refreshRolePicker);
  wrap.querySelectorAll('.creative-assignment-panel').forEach(refreshContentDependencyPickers);
  setCreativePopupActive(modal, activeKey);
}
function openCreativeAssignmentPopup(row){
  if(!row) return;
  if(!row.dataset.creativeRowId) row.dataset.creativeRowId = `creative-row-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const modal = ensureCreativeAssignmentPopup();
  modal.dataset.rowId = row.dataset.creativeRowId;
  const selected = selectedCreativeNames(row);
  modal.querySelector('.creative-popup-checks').innerHTML = popupCreativeCheckboxList(selected);
  if(!creatives.length) setTimeout(() => reloadCreativesForPopup(modal, selected), 10);
  const panels = [...row.querySelectorAll('.selected-creative-assignments .creative-assignment-panel')].map(panel => panel.outerHTML).join('');
  modal.querySelector('.creative-popup-panels').innerHTML = panels || '<div class="empty-state mini-empty">اختار كريتيف واحد أو أكثر من القائمة عشان تظهر إعداداته هنا.</div>';
  if(!modal.dataset.activeCreativeKey && selected.length) modal.dataset.activeCreativeKey = normalizeText(selected[0]);
  refreshCreativePopupPanels(modal);
  modal.querySelectorAll('.js-role-picker').forEach(refreshRolePicker);
  modal.querySelectorAll('.creative-assignment-panel').forEach(refreshContentDependencyPickers);
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('creative-popup-open');
}
function closeCreativeAssignmentPopup(){
  const modal = document.getElementById('creativeAssignmentPopup');
  if(!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  delete modal.dataset.rowId;
  document.body.classList.remove('creative-popup-open');
}
function saveCreativeAssignmentPopup(){
  const modal = document.getElementById('creativeAssignmentPopup');
  if(!modal) return;
  const row = document.querySelector(`.creative-row-card[data-creative-row-id="${CSS.escape(modal.dataset.rowId || '')}"]`);
  if(!row) return closeCreativeAssignmentPopup();
  const selected = getCreativePopupSelected(modal);
  const grid = row.querySelector('.creative-checkbox-grid');
  if(grid){
    grid.innerHTML = creativeCheckboxList(selected);
    grid.querySelectorAll('.js-creative-check').forEach(input => { input.checked = selected.map(normalizeText).includes(normalizeText(input.value)); });
  }
  const wrap = row.querySelector('.selected-creative-assignments');
  if(wrap){
    const panels = [...modal.querySelectorAll('.creative-popup-panels .creative-assignment-panel')].filter(panel => selected.map(normalizeText).includes(normalizeText(panel.dataset.creativeName || '')));
    wrap.innerHTML = panels.length ? panels.map(panel => syncPanelDynamicState(panel).outerHTML).join('') : '<div class="empty-state mini-empty">اختار كريتيف واحد أو أكثر من زر الربط.</div>';
    wrap.querySelectorAll('.js-role-picker').forEach(refreshRolePicker);
    wrap.querySelectorAll('.creative-assignment-panel').forEach(panel => { refreshContentDependencyPickers(panel); applyContentMontageLinksToMontagePicker(panel); });
  }
  updateProductOutput(row);
  renderPublishAgenda();
  closeCreativeAssignmentPopup();
}
function selectedRoleTaskFromPanel(panel, role){
  const picker = panel?.querySelector(`.js-role-picker[data-role="${role}"]`);
  const userIds = selectedOptionValues(picker);
  const userNames = selectedOptionTexts(picker);
  if(!userIds.length && !userNames.length) return null;
  const dep = findDepartmentByRole(role) || {};
  const contentPicker = panel?.querySelector('.js-role-picker[data-role="content"]');
  const requestContentAssignees = campaignRequestContentAssignees();
  const contentUserNames = selectedOptionTexts(contentPicker).length ? selectedOptionTexts(contentPicker) : requestContentAssignees.names;
  const quantity = Math.max(1, Math.min(50, Number(panel?.querySelector('.js-creative-quantity')?.value || 1)));
  const requestForm = document.getElementById('campaignRequestForm');
  const brief = normalizeText(requestForm?.querySelector('[name="content_writer_brief"]')?.value || '');
  const structureDeadline = normalizeText(requestForm?.querySelector('[name="structure_deadline"]')?.value || '');
  const roleDeadline = normalizeText(panel?.querySelector(`.js-role-deadline[data-role-deadline="${role}"]`)?.value || '');
  const creativeName = normalizeText(panel?.dataset.creativeName || '');
  const isContent = role === 'content';
  const isDeferredAfterContent = role !== 'content';
  const linkedContent = isDeferredAfterContent ? selectedContentDependency(panel, role) : { ids: [], names: [] };
  const linkedContentIds = linkedContent.ids.length ? linkedContent.ids : requestContentAssignees.ids;
  const linkedContentNames = linkedContent.names.length ? linkedContent.names : contentUserNames;
  const effectiveDeadline = isContent ? (roleDeadline || structureDeadline) : roleDeadline;
  return {
    contentSectionId: dep.id || role,
    contentSectionName: dep.name || defaultRoleSectionName(role),
    taskType: creativeMainTaskType(creativeName, role),
    quantity,
    requiredDate: effectiveDeadline ? effectiveDeadline.slice(0, 10) : '',
    requiredDateTime: effectiveDeadline,
    structureDeadline: isContent ? effectiveDeadline : '',
    deferredDeadlineUntilContentApproval: isDeferredAfterContent,
    contentWriterBrief: isContent ? brief : '',
    campaignRequestBrief: isContent ? brief : '',
    needsStructureUpload: isContent,
    userIds,
    userNames,
    departmentRole: role,
    departmentCode: roleCode(role),
    creativeShortCode: creativeShortCodeForName(creativeName),
    userCodes: userCodesForTask({ userIds, userNames }),
    dependencyRole: isDeferredAfterContent ? 'content' : '',
    waitingForApproval: isDeferredAfterContent,
    waitingForApprovalLabel: isDeferredAfterContent ? 'في انتظار اعتماد الهيكل' : '',
    upstreamRole: isDeferredAfterContent ? 'content' : '',
    upstreamUserIds: isDeferredAfterContent ? linkedContentIds : [],
    upstreamUserNames: isDeferredAfterContent ? linkedContentNames : [],
    upstreamUserLabel: isDeferredAfterContent ? linkedContentNames.join('، ') : '',
    dependsOnContentUserIds: isDeferredAfterContent ? linkedContentIds : [],
    dependsOnContentUserNames: isDeferredAfterContent ? linkedContentNames : [],
    dependencyLinks: isDeferredAfterContent && Array.isArray(linkedContent.links) ? linkedContent.links : [],
    status: isDeferredAfterContent ? 'waiting_structure' : 'pending'
  };
}
function selectedRoleTaskFromRow(row, role){
  const panel = row?.closest?.('.creative-assignment-panel') || null;
  if(panel) return selectedRoleTaskFromPanel(panel, role);
  const picker = row?.querySelector(`.js-role-picker[data-role="${role}"]`);
  const userIds = selectedOptionValues(picker);
  const userNames = selectedOptionTexts(picker);
  if(!userIds.length && !userNames.length) return null;
  const dep = findDepartmentByRole(role) || {};
  const contentPicker = row?.querySelector('.js-role-picker[data-role="content"]');
  const contentUserNames = selectedOptionTexts(contentPicker);
  const requestForm = document.getElementById('campaignRequestForm');
  const brief = normalizeText(requestForm?.querySelector('[name="content_writer_brief"]')?.value || '');
  const structureDeadline = normalizeText(requestForm?.querySelector('[name="structure_deadline"]')?.value || '');
  const creativeName = selectedCreativeNames(row)[0] || '';
  const isContent = role === 'content';
  const isDeferredAfterContent = role !== 'content';
  return {
    contentSectionId: dep.id || role,
    contentSectionName: dep.name || defaultRoleSectionName(role),
    taskType: creativeMainTaskType(creativeName, role),
    quantity: 1,
    requiredDate: isContent ? (structureDeadline ? structureDeadline.slice(0, 10) : '') : '',
    structureDeadline: isContent ? structureDeadline : '',
    contentWriterBrief: isContent ? brief : '',
    campaignRequestBrief: isContent ? brief : '',
    needsStructureUpload: isContent,
    userIds,
    userNames,
    departmentRole: role,
    departmentCode: roleCode(role),
    creativeShortCode: creativeShortCodeForName(creativeName),
    userCodes: userCodesForTask({ userIds, userNames }),
    dependencyRole: isDeferredAfterContent ? 'content' : '',
    waitingForApproval: isDeferredAfterContent,
    waitingForApprovalLabel: isDeferredAfterContent ? 'في انتظار اعتماد الهيكل' : '',
    upstreamRole: isDeferredAfterContent ? 'content' : '',
    upstreamUserNames: isDeferredAfterContent ? contentUserNames : [],
    upstreamUserLabel: isDeferredAfterContent ? contentUserNames.join('، ') : '',
    status: isDeferredAfterContent ? 'waiting_structure' : 'pending'
  };
}
function campaignWizardSetStep(step){
  const target = String(step || 1);
  document.querySelectorAll('[data-campaign-wizard-step]').forEach(panel => panel.classList.toggle('active', panel.dataset.campaignWizardStep === target));
  document.querySelectorAll('[data-campaign-wizard-target]').forEach(btn => btn.classList.toggle('active', btn.dataset.campaignWizardTarget === target));
  window.MZJ_CURRENT_CAMPAIGN_WIZARD_STEP = Number(target) || 1;
  if(target === '2') createCampaignCreativeRow(true);
}
function campaignWizardMove(delta){
  const current = Number(window.MZJ_CURRENT_CAMPAIGN_WIZARD_STEP || 1);
  campaignWizardSetStep(Math.max(1, Math.min(3, current + delta)));
}
function campaignTypeBaseCode(item){
  const prefix = normalizeText(item?.prefix || 'MZJ').toUpperCase() || 'MZJ';
  let code = normalizeText(item?.code || '').toUpperCase().replace(/\s+/g, '-');
  if(!code) return '';
  const prefixStart = `${prefix}-`;
  if(code === prefix) return prefix;
  if(code.startsWith(prefixStart)) return code;
  if(code.startsWith('MZJ-') && prefix === 'MZJ') return code;
  return `${prefix}-${code}`;
}
function campaignYearMonthCode(date = new Date()){
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
function campaignMonthlyBaseCode(item, date = new Date()){
  const typeCode = campaignTypeBaseCode(item);
  return typeCode ? `${typeCode}-${campaignYearMonthCode(date)}` : '';
}
function campaignCodeSequenceFromBase(code, base){
  const cleanCode = normalizeText(code || '').toUpperCase();
  const cleanBase = normalizeText(base || '').toUpperCase();
  if(!cleanCode || !cleanBase) return 0;
  if(cleanCode === cleanBase) return 1;
  const match = cleanCode.match(new RegExp(`^${escapeRegExp(cleanBase)}-(\\d{2,})$`));
  return match ? Math.max(2, Number(match[1]) || 0) : 0;
}
function nextCampaignCodeForType(item, date = new Date()){
  const base = campaignMonthlyBaseCode(item, date);
  if(!base) return '';
  const maxSeq = (campaigns || []).reduce((max, campaign) => Math.max(max, campaignCodeSequenceFromBase(campaign.campaignCode || campaign.campaign_code || '', base)), 0);
  if(maxSeq <= 0) return base;
  return `${base}-${String(maxSeq + 1).padStart(2, '0')}`;
}
function generateCampaignCode(){
  const output = document.getElementById('campaignCodeInput');
  if(!output) return;
  const typeSelect = document.getElementById('campaignTypeSelect') || document.querySelector('.js-campaign-type-select');
  const legacyCodeSelect = document.getElementById('campaignCodeSelect');
  const item = campaignTypes.find(type => type.id === typeSelect?.value || type.name === typeSelect?.value) || campaignCodes.find(code => code.id === legacyCodeSelect?.value);
  output.value = item ? nextCampaignCodeForType(item) : '';
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
  const isCampaignWriting = typeText.includes('كتابه محتوي حمله') || (typeText.includes('كتابه') && typeText.includes('محتوي')) || (typeText.includes('campaign') && typeText.includes('content')) || !!task.needsStructureUpload;
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
            status: task.status || 'pending',
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
  // المصدر الأساسي للتاسكات هو marketing_campaigns > departmentTasks.
  // ولو الحملة اتسجلت بالكريتيفات فقط لأي سبب، نولد نفس التاسكات من creatives عشان الداشبورد مايفضلش فاضي.
  const fromDepartmentTasks = Array.isArray(campaign.departmentTasks)
    ? campaign.departmentTasks.map(task => normalizeCampaignTask(task, campaign))
    : [];
  const fromCreativeRows = fallbackTasksFromCampaign(campaign).map(task => normalizeCampaignTask(task, campaign));
  return mergeCampaignTasks(fromDepartmentTasks.length ? fromDepartmentTasks : fromCreativeRows);
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
  if(key.includes('محتو')) return 'قسم المحتوى';
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

function taskDependencyApproved(task){
  if(!task || !task.waitingForApproval) return true;
  const dependencyRole = normalizeDepartmentRole(task.dependencyRole || task.upstreamRole || 'content');
  if(dependencyRole !== 'content') return true;
  const campaign = campaignForTask(task);
  if(!campaign?.id) return false;
  const targetCreative = identityClean(task.creative || task.product || '');
  const contentTasks = tasksForCampaign(campaign).filter(item => {
    if((item.id || '') === (task.id || '')) return false;
    const role = normalizeDepartmentRole(item.departmentRole || item.contentSectionName || item.assignedDepartmentName || '');
    if(role !== 'content') return false;
    const itemCreative = identityClean(item.creative || item.product || '');
    if(targetCreative && itemCreative && targetCreative !== itemCreative) return false;
    const linkedIds = Array.isArray(task.dependsOnContentUserIds) ? task.dependsOnContentUserIds.map(identityClean).filter(Boolean) : [];
    const linkedNames = Array.isArray(task.dependsOnContentUserNames) ? task.dependsOnContentUserNames.map(identityClean).filter(Boolean) : [];
    if(linkedIds.length || linkedNames.length){
      const itemIds = [item.userId, item.userUid, item.assignedToId, item.assignedToUid, item.assigneeUid, item.assignedToEmail, item.userEmail].map(identityClean).filter(Boolean);
      const itemNames = [item.userName, item.assigneeName, item.assignedToName, item.displayName].map(identityClean).filter(Boolean);
      return linkedIds.some(id => itemIds.includes(id)) || linkedNames.some(name => itemNames.includes(name));
    }
    return true;
  });
  return contentTasks.some(item => {
    const statusText = identityClean(item.status || item.state || '');
    const structureStatus = identityClean(taskStructure(item).status || '');
    const finalUploaded = taskFiles(item).some(file => file?.isFinal || file?.uploadKind === 'final' || file?.kind === 'final' || file?.purpose === 'final');
    const adminApprovedStep = Array.isArray(item.steps) && item.steps.some(step => step.adminOnly && step.done);
    return taskProgress(item) >= 100 || finalUploaded || adminApprovedStep || ['approved','done','completed','معتمد','مكتمل'].some(key => statusText.includes(identityClean(key))) || ['approved','distributed','معتمد'].some(key => structureStatus.includes(identityClean(key)));
  });
}
function isTaskWaitingForDependency(task){
  return !!(task && task.waitingForApproval && !taskDependencyApproved(task));
}

function getVisibleTasksForCurrentUser(){
  // اليوزر العادي يشوف التاسكات المسندة له صراحة فقط.
  // بنقرأ من tasksForCampaign عشان أي تاسكات جاية من ربط الكريتيفات تظهر حتى لو departmentTasks اتأخرت أو كانت فاضية.
  const allTasks = campaigns.flatMap(campaign => tasksForCampaign(campaign));
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
  const row = task?.structureRow || {};
  const fromStructure = normalizeText(row.contentType || row.content_type || row.type || row.output || '');
  if(fromStructure) return canonicalContentLabel(fromStructure);
  return canonicalContentLabel(task.contentSectionName || task.assignedDepartmentName || task.contentType || '');
}
function taskDepartmentLabel(task){
  const role = task.departmentRole || normalizeDepartmentRole(task.assignedDepartmentName || task.departmentName || task.contentSectionName || '');
  const labels = {content:'قسم المحتوى', shooting:'قسم التصوير', design:'قسم التصميم', montage:'قسم المونتاج', publish:'قسم النشر'};
  // تاسكات الهيكل الموزعة لازم تعرض قسم اليوزر الفعلي، مش قسم المحتوى.
  // كان هنا بيرجع "قسم المحتوى" لكل structureGenerated وده سبب ظهور قسم غلط في تفاصيل تاسك المونتاج.

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
  const hasStructureDetail = !!content.querySelector('.structure-section');
  modal.classList.toggle('has-structure-sheet-modal', hasStructureDetail);
  modal.classList.add('task-fullscreen-view');
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
  modal?.classList.remove('has-structure-sheet-modal');
  modal?.classList.remove('task-fullscreen-view');
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
  if(!task) return false;
  if(isCampaignContentWritingTask(task)) return true;
  const section = identityClean([task.contentSectionName, task.assignedDepartmentName, task.departmentName, task.departmentRole, task.contentType].filter(Boolean).join(' '));
  const type = identityClean([task.taskType, task.structureTaskLabel, task.creative, task.product].filter(Boolean).join(' '));
  const isContentSection = normalizeDepartmentRole(section) === 'content' || section.includes('المحتوي') || section.includes('المحتوى') || section.includes('content');
  const isCampaignWriting = type.includes(identityClean('كتابة محتوى حملة')) || type.includes(identityClean('كتابة محتوى')) || type.includes('content writing') || (type.includes('campaign') && type.includes('content'));
  const hasStructureData = task.structure && typeof task.structure === 'object';
  return (isContentSection && isCampaignWriting) || (isContentSection && hasStructureData);
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
        const inheritedValue = parent ? sheetCellText(sheet, parent.s.r, parent.s.c) : '';
        if(parent && rowMap.has(parent.s.r) && colMap.has(parent.s.c)){
          cells.push({ skip:true, value: inheritedValue, sourceRow:r, sourceCol:c, mergeStartRow: parent.s.r, mergeEndRow: parent.e.r, mergeStartCol: parent.s.c, mergeEndCol: parent.e.c });
        }else{
          cells.push({ value: inheritedValue, sourceRow:r, sourceCol:c });
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
  // مهم: نكرر قيمة الخلايا المدمجة وقت القراءة فقط، من غير ما نغير شكل عرض الشيت.
  // ده بيخلي أعمدة زي رقم التاسك و CTA توصل صح حتى لو الخلية مدمجة في Excel.
  return (sheetTable.rows || []).map(row => (row || []).map(c => normalizeText(c?.value || '')));
}
function headerIndex(headers, patterns){
  const list = Array.isArray(patterns) ? patterns : [patterns];
  return (headers || []).findIndex(header => list.some(pattern => normalizeText(header).includes(pattern)));
}
function structureHeaderKey(value){
  return normalizeText(value)
    .replace(/[ً-ٰٟ]/g,'')
    .replace(/[أإآا]/g,'ا')
    .replace(/[ىي]/g,'ي')
    .replace(/ة/g,'ه')
    .replace(/\s+/g,' ')
    .trim()
    .toLowerCase();
}
function structureHeaderIndex(headers, patterns){
  const list = (Array.isArray(patterns) ? patterns : [patterns]).map(structureHeaderKey).filter(Boolean);
  return (headers || []).findIndex(header => {
    const clean = structureHeaderKey(header);
    if(!clean) return false;
    return list.some(pattern => clean === pattern || clean.includes(pattern));
  });
}
function structureHeaderIndexStrict(headers, patterns){
  const list = (Array.isArray(patterns) ? patterns : [patterns]).map(structureHeaderKey).filter(Boolean);
  return (headers || []).findIndex(header => {
    const clean = structureHeaderKey(header);
    if(!clean) return false;
    return list.some(pattern => clean === pattern || clean.includes(pattern));
  });
}
function inferStructureContentTypeFromContext(sheet, rows, headerIndexNo){
  const candidates = [];
  const maxRow = Math.max(0, Math.min(Number(headerIndexNo) || 0, (rows || []).length));
  for(let r = maxRow - 1; r >= 0; r -= 1){
    (rows[r] || []).forEach(cell => {
      const value = normalizeText(cell);
      if(!value) return;
      const key = structureHeaderKey(value);
      if(key.includes('brand') || key.includes('reel') || key.includes('film') || key.includes('static') || key.includes('carousel') || key.includes('story') || key.includes('post') || key.includes('نوع المحتوي') || key.includes('نوع المحتوى')){
        candidates.push(value);
      }
    });
    if(candidates.length) break;
  }
  if(candidates.length){
    const best = candidates.find(v => /brand|reel|film|static|carousel|story|post/i.test(v)) || candidates[0];
    return best.replace(/^(نوع المحتوى|نوع المحتوي)\s*[:：-]?\s*/i,'').trim();
  }
  return normalizeText(sheet?.sourceSheetName || sheet?.sheetName || '');
}
function valueLooksLikeStructureTaskNo(value){
  const clean = normalizeText(value);
  if(!clean) return false;
  return /^.+-C\d{2,}-.+$/i.test(clean) || /^.+-C\d{2,}$/i.test(clean) || /^[A-Z]{1,6}\d{1,4}[-_][A-Z]{1,6}\d{1,4}$/i.test(clean) || /^[A-Z]{1,6}[-_]?\d{1,4}[-_][A-Z]{1,6}[-_]?\d{1,4}$/i.test(clean) || /^T\d{1,4}$/i.test(clean);
}
function firstLikelyStructureTaskNo(row){
  const cells = (row || []).map(normalizeText).filter(Boolean);
  return cells.find(valueLooksLikeStructureTaskNo) || '';
}

function cellLooksLikeStructureTitle(value){
  const clean = normalizeText(value);
  if(!clean) return false;
  if(valueLooksLikeStructureTaskNo(clean)) return false;
  return clean.length > 18 && /[اأإآء-ي]/.test(clean);
}
function strongestStructureTaskNo(row, current = ''){
  const cells = (row || []).map(normalizeText).filter(Boolean);
  const explicit = cells.find(valueLooksLikeStructureTaskNo);
  if(explicit) return explicit;
  const cleanCurrent = normalizeText(current);
  return valueLooksLikeStructureTaskNo(cleanCurrent) ? cleanCurrent : '';
}
function strongestStructureCta(row, current = ''){
  const cleanCurrent = normalizeText(current);
  if(cleanCurrent && !valueLooksLikeStructureTaskNo(cleanCurrent)) return cleanCurrent;
  const cells = (row || []).map(normalizeText);
  const candidates = [cells[0], cells[cells.length - 1], ...cells].filter(Boolean);
  return candidates.find(value => !valueLooksLikeStructureTaskNo(value) && !cellLooksLikeStructureTitle(value)) || '';
}
function cellByHeader(row, index){
  return index >= 0 ? normalizeText((row || [])[index] || '') : '';
}
function normalizeStructureHeaderCell(value){
  return normalizeText(value).replace(/[ةه]/g, 'ه').replace(/[ىي]/g, 'ي').toLowerCase();
}
function rowHasAnyHeader(row, patterns){
  return (row || []).some(cell => {
    const clean = normalizeStructureHeaderCell(cell);
    return patterns.some(pattern => clean.includes(normalizeStructureHeaderCell(pattern)));
  });
}
function firstFilledCell(row, fromIndex = 0){
  for(let i = Math.max(0, fromIndex); i < (row || []).length; i += 1){
    const value = normalizeText(row[i] || '');
    if(value) return value;
  }
  return '';
}
function parseExecutionRowsFromSheetTables(structure){
  const sheetTables = structureSheetTables(structure);
  const parsed = [];
  sheetTables.forEach(sheet => {
    const rows = tableRowsFromMergedSheet(sheet);
    let headerIndexNo = -1;
    for(let i = 0; i < rows.length; i += 1){
      const row = rows[i] || [];
      const hasTaskNo = rowHasAnyHeader(row, ['رقم التاسك','task no','task code']);
      const hasGoal = rowHasAnyHeader(row, ['الهدف','goal']);
      const hasTangibleGoal = rowHasAnyHeader(row, ['الهدف الملموس']);
      const hasIdea = rowHasAnyHeader(row, ['الفكرة','idea']);
      const hasDescription = rowHasAnyHeader(row, ['وصف المحتوى','وصف المحتوي','description']);
      const hasMessage = rowHasAnyHeader(row, ['الرسالة','message']);
      const hasWriter = rowHasAnyHeader(row, ['المطلوب من الكاتب','writer']);
      const hasCta = rowHasAnyHeader(row, ['cta','الدعوة لاتخاذ إجراء']);
      const score = [hasTaskNo, hasGoal, hasTangibleGoal, hasIdea, hasDescription, hasMessage, hasWriter, hasCta].filter(Boolean).length;
      if((hasTaskNo && score >= 3) || score >= 5){ headerIndexNo = i; break; }
    }
    if(headerIndexNo < 0) return;
    const headers = (rows[headerIndexNo] || []).map(h => normalizeText(h));
    const idx = {
      campaignType: structureHeaderIndexStrict(headers, ['نوع الحمله','نوع الحملة','campaign type']),
      contentType: structureHeaderIndexStrict(headers, ['نوع المحتوى','نوع المحتوي','content type']),
      taskNo: structureHeaderIndexStrict(headers, ['كود تاسك الهيكل','رقم التاسك','task no','task code','structure task code']),
      creativeShortCode: structureHeaderIndexStrict(headers, ['كود الكرييتيف المختصر','creative short code','creative code short']),
      departmentCode: structureHeaderIndexStrict(headers, ['كود القسم','department code','dept code']),
      userCode: structureHeaderIndexStrict(headers, ['كود اليوزر','كود اليوزرات','user code','assignee code']),
      goal: structureHeaderIndexStrict(headers, ['الهدف','goal']),
      tangibleGoal: structureHeaderIndexStrict(headers, ['الهدف الملموس','tangible goal']),
      idea: structureHeaderIndexStrict(headers, ['الفكرة','idea']),
      contentName: structureHeaderIndexStrict(headers, ['اسم المحتوي','اسم المحتوى','content name']),
      description: structureHeaderIndexStrict(headers, ['وصف المحتوي','وصف المحتوى','description']),
      message: structureHeaderIndexStrict(headers, ['الرسالة','message']),
      contentAngle: structureHeaderIndexStrict(headers, ['زاوية المحتوى','زاوية المحتوي','content angle']),
      highlightTranslation: structureHeaderIndexStrict(headers, ['الترجمة التنفيذية لما يجب إبرازه','الترجمة التنفيذية لما يجب ابرازه','ما يجب إبرازه','ما يجب ابرازه','highlight translation']),
      writerRequest: structureHeaderIndexStrict(headers, ['المطلوب من الكاتب','required from writer','writer request']),
      cta: structureHeaderIndexStrict(headers, ['cta','الدعوة لاتخاذ إجراء'])
    };
    // بعض قوالب الهيكل RTL بتظهر في Excel من اليمين للشمال، لكن مكتبة XLSX تقرأها من الشمال لليمين.
    // لو مفيش عمود "نوع المحتوى" مستقل، نحافظ على ترتيب الأعمدة الظاهر في القالب: CTA ← المطلوب من الكاتب ← الرسالة ← وصف المحتوى ← الفكرة ← الهدف الملموس ← الهدف ← رقم التاسك.
    const hasKnownExecutionLayout = idx.taskNo >= 0 && idx.goal >= 0 && idx.idea >= 0 && idx.writerRequest >= 0;
    const inferredContentType = inferStructureContentTypeFromContext(sheet, rows, headerIndexNo);
    for(let r = headerIndexNo + 1; r < rows.length; r += 1){
      const row = rows[r] || [];
      if(!row.some(v => normalizeText(v))) continue;
      if(rowHasAnyHeader(row, ['writing rules','قواعد كتابة المحتوى','campaign logic','آلية تنفيذ المحتوى','content execution direction'])) continue;
      const item = { sheetName: sheet.sheetName, rowNumber: r + 1, raw: {} };
      headers.forEach((h, i) => { if(h) item.raw[h] = normalizeText(row[i]); });
      item.campaignType = cellByHeader(row, idx.campaignType);
      item.taskNo = cellByHeader(row, idx.taskNo) || firstLikelyStructureTaskNo(row);
      item.creativeShortCode = cellByHeader(row, idx.creativeShortCode) || extractCreativeShortCodeFromTaskNo(item.taskNo);
      item.departmentCode = cellByHeader(row, idx.departmentCode) || extractDepartmentCodeFromTaskNo(item.taskNo);
      item.userCode = cellByHeader(row, idx.userCode);
      item.userCodes = item.userCode;
      item.goal = cellByHeader(row, idx.goal);
      item.tangibleGoal = cellByHeader(row, idx.tangibleGoal);
      item.idea = cellByHeader(row, idx.idea);
      item.contentName = cellByHeader(row, idx.contentName);
      item.description = cellByHeader(row, idx.description);
      item.message = cellByHeader(row, idx.message);
      item.contentAngle = cellByHeader(row, idx.contentAngle);
      item.highlightTranslation = cellByHeader(row, idx.highlightTranslation);
      item.writerRequest = cellByHeader(row, idx.writerRequest);
      item.cta = cellByHeader(row, idx.cta);
      if(hasKnownExecutionLayout){
        // fallback آمن للصفوف اللي بعض خلاياها المدمجة بتسيب قيم فاضية أو بتزحزح القراءة.
        item.cta = item.cta || normalizeText(row[0] || row[11] || '');
        item.writerRequest = item.writerRequest || normalizeText(row[1] || row[10] || '');
        item.highlightTranslation = item.highlightTranslation || normalizeText(row[2] || row[9] || '');
        item.contentAngle = item.contentAngle || normalizeText(row[3] || row[8] || '');
        item.message = item.message || normalizeText(row[4] || row[7] || '');
        item.description = item.description || normalizeText(row[5] || row[6] || '');
        item.idea = item.idea || normalizeText(row[6] || row[5] || '');
        item.tangibleGoal = item.tangibleGoal || normalizeText(row[7] || row[4] || '');
        item.goal = item.goal || normalizeText(row[8] || row[3] || '');
        item.taskNo = item.taskNo || normalizeText(row[9] || row[2] || '');
      }
      item.taskNo = strongestStructureTaskNo(row, item.taskNo) || item.taskNo;
      const explicitContentType = cellByHeader(row, idx.contentType) || '';
      const executionValuesForRealCheck = [
        explicitContentType,
        item.goal,
        item.tangibleGoal,
        item.idea,
        item.contentName,
        item.description,
        item.message,
        item.contentAngle,
        item.highlightTranslation,
        item.writerRequest,
        item.cta
      ].map(value => normalizeText(value || '')).filter(value => {
        if(!value) return false;
        if(isPlaceholderStructureText(value)) return false;
        if(isStructureCodeOnlyValue(value)) return false;
        const key = structureHeaderKey(value);
        if(['n','b','a'].includes(key)) return false;
        if(key.includes('كود الحمله') || key.includes('كود الحملة') || key.includes('كود الكرييتيف') || key.includes('كود كاتب')) return false;
        return true;
      });
      if(!executionValuesForRealCheck.length) continue;
      item.cta = strongestStructureCta(row, item.cta) || item.cta;
      item.contentType = explicitContentType || item.contentName || inferredContentType || 'نوع محتوى';
      parsed.push(item);
    }
  });
  return parsed;
}
function isPlaceholderStructureText(value){
  const key = structureHeaderKey(value || '');
  if(!key) return true;
  const placeholders = [
    'نوع محتوي','نوع المحتوى','نوع المحتوي','هدف','الهدف','الفكره','الفكرة','وصف المحتوي','وصف المحتوى',
    'الرساله','الرسالة','المطلوب من الكاتب','cta','الدعوه لاتخاذ اجراء','زاويه المحتوي','زاوية المحتوى',
    'الترجمه التنفيذيه لما يجب ابرازه','رقم التاسك','كود تاسك الهيكل','كود الحمله','كود الكرييتيف','كود كاتب المحتوي'
  ].map(structureHeaderKey);
  return placeholders.includes(key);
}
function isStructureCodeOnlyValue(value){
  const clean = normalizeText(value || '').toUpperCase();
  if(!clean) return true;
  if(/^[A-Z]$/.test(clean)) return true;
  if(/^MZJ-[A-Z0-9-]+(?:-C\d{2})?(?:-[A-Z0-9-]+)*(?:-[A-Z]\d{2})?$/.test(clean)) return true;
  if(/^(M|D|P)-[A-Z0-9-]+$/.test(clean)) return true;
  if(['MONTAGE','DESIGN','PHOTO','CONTENT'].includes(clean)) return true;
  return false;
}
function isRealStructureDistributionRow(row){
  const contentType = normalizeText(row?.contentType || '');
  const details = [row?.goal, row?.tangibleGoal, row?.idea, row?.contentName, row?.description, row?.message, row?.contentAngle, row?.highlightTranslation, row?.writerRequest, row?.cta]
    .map(value => normalizeText(value || ''))
    .filter(value => value && !isPlaceholderStructureText(value) && !isStructureCodeOnlyValue(value));
  const explicitType = contentType && !isPlaceholderStructureText(contentType) && !isStructureCodeOnlyValue(contentType);
  return !!(details.length || explicitType);
}

function structureDisplayRowHasRealExecutionData(row){
  const values = (row || []).filter(cell => cell && !cell.skip).map(cell => normalizeText(cell.value || '')).filter(Boolean);
  if(!values.length) return false;
  if(values.some(value => {
    const key = structureHeaderKey(value);
    return key.includes('رقم التاسك') || key.includes('كود تاسك الهيكل') || key.includes('نوع المحتوي') || key.includes('نوع المحتوى') || key === 'cta';
  })) return true;
  const realValues = values.filter(value => {
    if(isProtectedStructureTitleText(value)) return true;
    if(isPlaceholderStructureText(value)) return false;
    if(isStructureCodeOnlyValue(value)) return false;
    const key = structureHeaderKey(value);
    if(['n','b','a'].includes(key)) return false;
    if(/^حمله\s/.test(key) || /^حملة\s/.test(key)) return false;
    return true;
  });
  return realValues.length > 0;
}
function filterStructureSectionRowsForDisplay(type, rows){
  if(type !== 'execution') return Array.isArray(rows) ? rows : [];
  let headerSeen = false;
  return (Array.isArray(rows) ? rows : []).filter(row => {
    const values = structureRowValues(row);
    if(!values.length) return false;
    const hasHeader = values.some(value => {
      const key = structureHeaderKey(value);
      return key.includes('رقم التاسك') || key.includes('كود تاسك الهيكل') || key.includes('نوع المحتوي') || key.includes('نوع المحتوى') || key === 'cta';
    });
    if(hasHeader){ headerSeen = true; return true; }
    if(!headerSeen) return true;
    return structureDisplayRowHasRealExecutionData(row);
  });
}
function normalizeStructureRowReviewStatus(value){
  const raw = normalizeText(value || '').toLowerCase();
  if(raw === 'rejected' || raw.includes('مرفوض')) return 'rejected';
  if(raw === 'needs_changes' || raw === 'changes' || raw.includes('تعديل')) return 'needs_changes';
  if(raw === 'approved' || raw === 'accepted' || raw.includes('مقبول')) return 'approved';
  return 'approved';
}
function structureRowReviewKey(row, index = 0){
  const no = normalizeText(row?.taskNo || row?.structureTaskNo || '');
  const writer = normalizeText(row?.writerCode || row?.contentWriterCode || row?.raw?.['كود كاتب المحتوى'] || row?.raw?.['كود كاتب المحتوي'] || '');
  const type = normalizeText(row?.contentType || row?.contentName || '');
  return no || `${writer}::${type}::${Number(index) + 1}`;
}
function structureRowsWithReviewStatus(structure){
  const fromTables = parseExecutionRowsFromSheetTables(structure);
  const source = fromTables.length ? fromTables : (Array.isArray(structure?.parsedRows) ? structure.parsedRows : []);
  const statuses = structure?.rowReviewStatuses || {};
  return source
    .filter(isRealStructureDistributionRow)
    .map((row, index) => {
      const normalized = { ...row, contentType: normalizeText(row?.contentType || row?.contentName || row?.idea || row?.description || 'نوع محتوى'), taskNo: normalizeText(row?.taskNo || '') || `T${String(index + 1).padStart(2, '0')}` };
      const key = structureRowReviewKey(normalized, index);
      return { ...normalized, reviewKey: key, reviewStatus: normalizeStructureRowReviewStatus(statuses[key] || normalized.reviewStatus || 'approved') };
    });
}
function structureDistributionRows(structure){
  if(Array.isArray(structure?.approvedRows) && structure.approvedRows.length){
    return structure.approvedRows
      .filter(isRealStructureDistributionRow)
      .map((row, index) => ({ ...row, contentType: normalizeText(row?.contentType || row?.contentName || row?.idea || row?.description || 'نوع محتوى'), taskNo: normalizeText(row?.taskNo || '') || `T${String(index + 1).padStart(2, '0')}`, reviewStatus: 'approved' }));
  }
  const rows = structureRowsWithReviewStatus(structure);
  return rows.filter(row => normalizeStructureRowReviewStatus(row.reviewStatus) === 'approved');
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
function structureSectionOrder(type){
  if(type === 'logic') return 1;
  if(type === 'writing') return 2;
  if(type === 'execution') return 3;
  return 99;
}

function renderMergedStructureSectionBlock(task, sheet, section, notes, marks, admin){
  const sectionRows = compactStructureSectionRows(filterStructureSectionRowsForDisplay(section.type, section.rows));
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
}


function structureAllRowsFromTables(structure){
  const sheetTables = structureSheetTables(structure);
  return sheetTables.flatMap(sheet => tableRowsFromMergedSheet(sheet));
}
function nearestStructureValueFromRow(row, index){
  const candidates = [row[index + 1], row[index - 1], row[index + 2], row[index - 2], row[index + 3], row[index - 3]];
  return normalizeText(candidates.find(v => normalizeText(v) && !isPlaceholderStructureText(v)) || '');
}
function extractStructureLogicRows(structure, task){
  const wanted = [
    'اسم الحملة','كود الحملة','كود الكرييتيف','الكرييتيف المطلوب للهيكل','كاتب المحتوى','كود كاتب المحتوى','نوع الحمله',
    'معنى العنصر داخل MZJ','دور العنصر في تعزيز الثقة','الهدف الاستراتيجي للحملة','الهدف النهائي للحملة','الترجمة الملموسة للهدف النهائي','الرسالة الرئيسية','إحساس الحملة','الترجمة التنفيذية لإحساس الحملة','نوع المحتوى','زاوية المحتوى','ما يجب إبرازه','الترجمة التنفيذية لما يجب إبرازه','ما يجب تجنبه','CTA'
  ];
  const wantedKeys = wanted.map(structureHeaderKey);
  const found = new Map();
  structureAllRowsFromTables(structure).forEach(row => {
    (row || []).forEach((value, index) => {
      const key = structureHeaderKey(value);
      const wantedIndex = wantedKeys.indexOf(key);
      if(wantedIndex < 0 || found.has(wanted[wantedIndex])) return;
      const val = nearestStructureValueFromRow(row, index);
      found.set(wanted[wantedIndex], val);
    });
  });
  const campaign = campaignRecordForTask(task) || {};
  if(!found.get('اسم الحملة')) found.set('اسم الحملة', task.campaignName || task.campaignTitle || task.campaign || campaign.campaignName || campaign.name || '');
  if(!found.get('كود الحملة')) found.set('كود الحملة', campaignCodeForTask(task));
  if(!found.get('كود الكرييتيف')) found.set('كود الكرييتيف', templateCreativeLinkCodeForTask(task));
  if(!found.get('الكرييتيف المطلوب للهيكل')) found.set('الكرييتيف المطلوب للهيكل', task.creative || task.product || '');
  if(!found.get('كاتب المحتوى')) found.set('كاتب المحتوى', task.assignedToName || task.userName || '');
  if(!found.get('كود كاتب المحتوى')) found.set('كود كاتب المحتوى', contentWriterCodeForTask(task));
  if(!found.get('نوع الحمله')) found.set('نوع الحمله', task.campaignTypeName || task.campaignType || task.typeName || task.type || campaign.campaignTypeName || campaign.campaignType || campaign.typeName || campaign.type || '');
  return wanted.map(label => ({ label, value: normalizeText(found.get(label) || '') }));
}
function extractStructureWritingRules(structure){
  const rows = structureAllRowsFromTables(structure);
  const rules = [];
  let inWriting = false;
  rows.forEach(row => {
    const values = (row || []).map(normalizeText).filter(Boolean);
    const joined = values.join(' ');
    if(!joined) return;
    const key = structureHeaderKey(joined);
    if(key.includes('writing rules') || key.includes('قواعد كتابة المحتوى')){ inWriting = true; return; }
    if(key.includes('content execution direction') || key.includes('آلية تنفيذ المحتوى')){ inWriting = false; return; }
    if(!inWriting) return;
    values.forEach(value => {
      const cleanKey = structureHeaderKey(value);
      if(!value || isPlaceholderStructureText(value)) return;
      if(cleanKey.includes('محتوي حملات') || cleanKey.includes('قواعد كتابة المحتوى') || cleanKey.includes('writing rules')) return;
      if(!rules.includes(value)) rules.push(value);
    });
  });
  return rules;
}
function renderReadableStructureWorkbookTable(task, structure, admin){
  const logicRows = extractStructureLogicRows(structure, task);
  const writingRules = extractStructureWritingRules(structure);
  const rows = structureDistributionRows(structure);
  const notes = Array.isArray(structure.notes) ? structure.notes : [];
  const marks = Array.isArray(structure.marks) ? structure.marks : [];
  const executionHeaders = [
    ['campaignType','نوع الحملة'],
    ['contentType','نوع المحتوى'],
    ['taskNo','رقم التاسك'],
    ['goal','الهدف'],
    ['tangibleGoal','الهدف الملموس'],
    ['idea','الفكرة'],
    ['description','وصف المحتوى'],
    ['message','الرسالة'],
    ['writerRequest','المطلوب من الكاتب'],
    ['cta','CTA']
  ];
  const rowReviewStatuses = structure.rowReviewStatuses || {};
  function readableCellAttrs(section, rowIndex, colIndex, value){
    if(!admin) return '';
    return `data-structure-cell="${escapeHtml(task.id)}" data-sheet-name="${escapeHtml(section)}" data-row-index="${escapeHtml(rowIndex)}" data-col-index="${escapeHtml(colIndex)}" data-cell-value="${escapeHtml(value || '')}" title="دبل كليك لإضافة ملاحظة"`;
  }
  function noteBadges(section, rowIndex, colIndex){
    const key = structureCellKey(section, rowIndex, colIndex);
    const hasMark = marks.some(m => (typeof m === 'string' ? m : m?.key) === key);
    const cellNotes = notes.filter(n => (n.key || n.cellKey) === key);
    return { className: [hasMark ? 'marked-cell' : '', cellNotes.length ? 'has-cell-note' : ''].filter(Boolean).join(' '), html: cellNotes.map(n => `<div class="cell-note-badge">${escapeHtml(n.note || '')}</div>`).join('') };
  }
  const logicHtml = `<section class="structure-readable-card structure-readable-logic"><h4>Campaign Logic</h4><div class="structure-readable-table-wrap"><table class="structure-readable-table"><tbody>${logicRows.map((item, index) => {
    const labelMeta = noteBadges('readable-logic', index, 0);
    const valueMeta = noteBadges('readable-logic', index, 1);
    return `<tr><th class="${escapeHtml(labelMeta.className)}" ${readableCellAttrs('readable-logic', index, 0, item.label)}>${escapeHtml(item.label)}${labelMeta.html}</th><td class="${escapeHtml(valueMeta.className)}" ${readableCellAttrs('readable-logic', index, 1, item.value || '')}>${escapeHtml(item.value || '—')}${valueMeta.html}</td></tr>`;
  }).join('')}</tbody></table></div></section>`;
  const rulesHtml = `<section class="structure-readable-card structure-readable-writing"><h4>Writing Rules - قواعد كتابة المحتوى</h4>${writingRules.length ? `<div class="structure-readable-table-wrap"><table class="structure-readable-table"><tbody>${writingRules.map((rule, index) => {
    const meta = noteBadges('readable-writing', index, 0);
    return `<tr><td class="${escapeHtml(meta.className)}" ${readableCellAttrs('readable-writing', index, 0, rule)}>${escapeHtml(rule)}${meta.html}</td></tr>`;
  }).join('')}</tbody></table></div>` : '<div class="empty-state mini-empty">لا توجد قواعد كتابة مضافة في الشيت.</div>'}</section>`;
  const body = rows.map((row, rowIndex) => {
    const reviewKey = row.reviewKey || structureRowReviewKey(row, rowIndex);
    const currentStatus = normalizeStructureRowReviewStatus(rowReviewStatuses[reviewKey] || row.reviewStatus || 'approved');
    const reviewCell = admin ? `<td class="structure-row-review-cell"><div class="structure-row-review" data-row-review-key="${escapeHtml(reviewKey)}"><button type="button" class="mini-btn ${currentStatus === 'approved' ? 'active success' : ''}" data-set-structure-row-status="approved" data-task-id="${escapeHtml(task.id)}" data-row-key="${escapeHtml(reviewKey)}">مقبول</button><button type="button" class="mini-btn ${currentStatus === 'needs_changes' ? 'active warn' : ''}" data-set-structure-row-status="needs_changes" data-task-id="${escapeHtml(task.id)}" data-row-key="${escapeHtml(reviewKey)}">تعديل</button><button type="button" class="mini-btn ${currentStatus === 'rejected' ? 'active danger' : ''}" data-set-structure-row-status="rejected" data-task-id="${escapeHtml(task.id)}" data-row-key="${escapeHtml(reviewKey)}">مرفوض</button></div></td>` : '';
    return `<tr data-structure-review-row="${escapeHtml(reviewKey)}">${admin ? reviewCell : ''}${executionHeaders.map(([key], colIndex) => {
      const value = row[key] || '';
      const meta = noteBadges('readable-execution', rowIndex, colIndex);
      return `<td class="${escapeHtml(meta.className)}" ${readableCellAttrs('readable-execution', rowIndex, colIndex, value)}>${escapeHtml(value)}${meta.html}</td>`;
    }).join('')}</tr>`;
  }).join('');
  const statusHead = admin ? '<th>حالة الصف</th>' : '';
  const emptyColspan = executionHeaders.length + (admin ? 1 : 0);
  const executionHtml = `<section class="structure-readable-card structure-readable-execution"><h4>Content Execution Direction - آلية تنفيذ المحتوى</h4><div class="structure-readable-table-wrap execution-scroll"><table class="structure-readable-table execution-table"><thead><tr>${statusHead}${executionHeaders.map(([,label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${emptyColspan}">لم يتم قراءة تاسكات تنفيذ محتوى من الملف.</td></tr>`}</tbody></table></div></section>`;
  return `<div class="structure-workbook-view structure-readable-view"><div class="structure-help-bar"><strong>محتوى الحملة</strong><span>تم عرض الهيكل بشكل مقروء. دبل كليك على أي خلية لإضافة ملاحظة.</span></div>${logicHtml}${rulesHtml}${executionHtml}</div>`;
}
function renderStructureWorkbookTable(task, structure, admin){
  const sheets = structureSheetTables(structure);
  if(sheets.length){
    return renderReadableStructureWorkbookTable(task, structure, admin);
  }
  if(!sheets.length){
    if(structure.fileData){
      return `<div class="structure-workbook-view missing-sheet-preview"><h4>محتوى الحملة</h4><div class="empty-state mini-empty">الملف مرفوع، لكن عرض الشيت لم يكتمل بعد.</div><button class="btn btn-light" type="button" data-reload-structure-sheet="${escapeHtml(task.id)}">عرض الشيت من الملف المرفوع</button></div>`;
    }
    return '';
  }
  const notes = Array.isArray(structure.notes) ? structure.notes : [];
  const marks = Array.isArray(structure.marks) ? structure.marks : [];
  return `<div class="structure-workbook-view structure-workbook-unified"><div class="structure-help-bar"><strong>محتوى الحملة</strong><span>ضغطة واحدة للتعليم، دبل كليك يفتح مربع كتابة ملاحظة</span></div>${sheets.map(sheet => {
    if(sheet.mode === 'merged'){
      const sections = splitStructureRowsIntoSections(Array.isArray(sheet.rows) ? sheet.rows : [])
        .sort((a, b) => structureSectionOrder(a.type) - structureSectionOrder(b.type));
      return `<div class="structure-workbook-grid structure-workbook-vertical">${sections.map(section => renderMergedStructureSectionBlock(task, sheet, section, notes, marks, admin)).join('')}</div>`;
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
function structureUserPickerHtml(selected = []){
  const selectedSet = new Set((Array.isArray(selected) ? selected : []).map(String));
  if(!Array.isArray(users) || !users.length) return '<div class="multi-empty task-user-empty">لا توجد يوزرات</div>';
  return users.map(u => {
    const value = u.id || u.uid || u.email || u.name || '';
    const name = userName(u);
    const checked = selectedSet.has(String(value)) ? ' checked' : '';
    return `<label class="task-user-check-card structure-user-check-card" data-structure-user-name="${escapeHtml(identityClean(name))}"><input type="checkbox" class="js-structure-assignee-checkbox" value="${escapeHtml(value)}" data-name="${escapeHtml(name)}"${checked}> <span>${escapeHtml(name)}</span></label>`;
  }).join('');
}
function structurePlatformTypeOptions(platformName, currentValue = '', checked = false){
  const options = publishPostTypesForPlatforms([platformName]);
  const current = options.some(item => item.value === currentValue) ? currentValue : '';
  const disabled = checked ? '' : ' disabled';
  const emptyLabel = options.length ? 'اختر نوع المنشور' : 'لا توجد أنواع لهذه المنصة';
  return `<div class="structure-platform-type-wrap"><span class="structure-platform-type-label">نوع المنشور</span><select class="js-structure-platform-type-select structure-platform-type-select" data-platform-type-for="${escapeHtml(platformName)}" aria-label="نوع منشور ${escapeHtml(platformName)}"${disabled}><option value="">${emptyLabel}</option>${options.map(item => `<option value="${escapeHtml(item.value)}" data-width="${item.width}" data-height="${item.height}"${current === item.value ? ' selected' : ''}>${escapeHtml(item.label)} - ${item.width}×${item.height}</option>`).join('')}</select></div>`;
}
function structurePlatformRowsHtml(meta = {}){
  const selected = new Set((meta.platforms || []).map(String));
  const typeMap = meta.platformTypes || {};
  return platforms.length ? platforms.map(item => {
    const name = item.name || '';
    const isChecked = selected.has(name);
    const checked = isChecked ? ' checked' : '';
    return `<div class="structure-popup-platform-row${isChecked ? ' is-selected' : ''}" data-structure-popup-platform-row="${escapeHtml(name)}"><label><input type="checkbox" class="js-structure-popup-platform" value="${escapeHtml(name)}"${checked}> <span>${escapeHtml(name)}</span></label>${structurePlatformTypeOptions(name, typeMap[name] || '', isChecked)}</div>`;
  }).join('') : '<div class="multi-empty">لا توجد منصات</div>';
}
function defaultStructurePublishMeta(){
  return { assignees:[], platforms:[], platformTypes:{}, platformPublishing:[], publishDate:'', date:'', caption:'', hashtags:'', hashtagsText:'' };
}
function readStructureRowMeta(rowEl){
  const raw = rowEl?.querySelector('.js-structure-publish-meta')?.value || '';
  const parsed = safeJsonParse(raw, null);
  return parsed && typeof parsed === 'object' ? { ...defaultStructurePublishMeta(), ...parsed } : defaultStructurePublishMeta();
}
function writeStructureRowMeta(rowEl, meta){
  const input = rowEl?.querySelector('.js-structure-publish-meta');
  if(input) input.value = JSON.stringify(meta || defaultStructurePublishMeta());
  updateStructureAssignSummary(rowEl);
}
function structureMetaSummary(meta){
  const usersCount = (meta.assignees || []).length;
  const platformCount = (meta.platforms || []).length;
  const date = meta.publishDate || meta.date || '';
  const typeText = (meta.platformPublishing || []).map(item => `${item.platform}: ${item.postTypeLabel || postTypeLabel(item.postType || '')}`).filter(Boolean).join(' / ');
  if(meta.distributionSaved || meta.assignmentSaved || meta.distributed){
    const parts = ['تم التوزيع'];
    if(usersCount) parts.push(`${usersCount} يوزر`);
    if(platformCount) parts.push(`${platformCount} منصة`);
    if(date) parts.push(date);
    return `${parts.join(' · ')}${typeText ? `<br><small>${escapeHtml(typeText)}</small>` : ''}`;
  }
  const content = [usersCount ? `${usersCount} يوزر` : 'لم يتم تجهيز التوزيع', platformCount ? `${platformCount} منصة` : 'اختيار المنصات', date || 'تاريخ النشر'].join(' · ');
  return `${content}${typeText ? `<br><small>${escapeHtml(typeText)}</small>` : ''}`;
}
function updateStructureAssignSummary(rowEl){
  const target = rowEl?.querySelector('.js-structure-assign-summary');
  if(!target) return;
  target.innerHTML = structureMetaSummary(readStructureRowMeta(rowEl));
}
function structureDistributionPlatformControls(rowIndex){
  return `<div class="structure-assign-compact"><input type="hidden" class="js-structure-publish-meta" value=""><button class="btn btn-light structure-open-popup-btn" type="button" data-open-structure-distribution-popup="${rowIndex}">اختيار المنصات وتاريخ النشر</button><div class="structure-assign-summary js-structure-assign-summary">لم يتم تجهيز التوزيع</div></div>`;
}
function refreshStructurePlatformRow(row){
  if(!row) return;
  const checkbox = row.querySelector('.js-structure-popup-platform');
  const select = row.querySelector('.js-structure-platform-type-select');
  const checked = !!checkbox?.checked;
  row.classList.toggle('is-selected', checked);
  if(select){
    select.disabled = !checked;
    if(!checked){
      select.value = '';
    }else if(!select.value){
      const firstOption = [...select.options].find(option => option.value);
      if(firstOption) select.value = firstOption.value;
    }
  }
}
function collectStructurePopupMeta(popup){
  const assignees = uniqueList([...popup.querySelectorAll('.js-structure-assignee-checkbox:checked')].map(input => input.value).filter(Boolean));
  const publishDate = normalizeText(popup.querySelector('.js-structure-publish-date')?.value || '');
  const caption = normalizeText(popup.querySelector('.js-structure-caption')?.value || '');
  const hashtags = normalizeText(popup.querySelector('.js-structure-hashtags')?.value || '');
  const platformPublishing = [...popup.querySelectorAll('.structure-popup-platform-row')].map(row => {
    const checked = row.querySelector('.js-structure-popup-platform')?.checked;
    if(!checked) return null;
    const platform = row.querySelector('.js-structure-popup-platform')?.value || '';
    const select = row.querySelector('.js-structure-platform-type-select');
    const value = select?.value || '';
    const opt = select?.selectedOptions?.[0];
    return {
      platform,
      postType: value,
      postTypeLabel: opt && value ? opt.textContent.trim() : '',
      requiredDimensions: value ? { width: Number(opt?.dataset.width || 0) || null, height: Number(opt?.dataset.height || 0) || null } : null
    };
  }).filter(Boolean);
  const platforms = platformPublishing.map(item => item.platform);
  const platformTypes = {};
  platformPublishing.forEach(item => { platformTypes[item.platform] = item.postType || ''; });
  const firstType = platformPublishing.find(item => item.postType) || {};
  return {
    assignees,
    platforms,
    platform: platforms.join('، '),
    platformTypes,
    platformPublishing,
    postType: platformPublishing.length === 1 ? (firstType.postType || '') : '',
    postTypeLabel: platformPublishing.length === 1 ? (firstType.postTypeLabel || '') : (platformPublishing.length > 1 ? 'أنواع متعددة' : ''),
    requiredDimensions: platformPublishing.length === 1 ? (firstType.requiredDimensions || null) : null,
    publishDate,
    date: publishDate,
    caption,
    hashtags,
    hashtagsText: hashtags
  };
}
function openStructureDistributionPopup(rowEl){
  if(!rowEl) return;
  closeStructureDistributionPopup();
  const rowIndex = Number(rowEl.dataset.structureRow || 0);
  const meta = readStructureRowMeta(rowEl);
  const title = rowEl.querySelector('.structure-assign-info strong')?.textContent || 'تاسك الهيكل';
  const popup = document.createElement('div');
  popup.className = 'structure-distribution-popup';
  popup.innerHTML = `<div class="structure-popup-backdrop" data-close-structure-distribution-popup></div><section class="structure-popup-dialog" role="dialog" aria-modal="true"><div class="structure-popup-head"><div><h3>${escapeHtml(title)}</h3><p>اختار اليوزرات والمنصات وتاريخ النشر والكابشن والهاشتاج.</p></div><button type="button" class="task-modal-close" data-close-structure-distribution-popup>×</button></div><div class="structure-popup-body" data-structure-popup-row="${rowIndex}"><div class="structure-popup-section"><h4>اليوزرات</h4><input type="search" class="structure-assignee-search" placeholder="بحث عن يوزر" autocomplete="off"><div class="structure-user-checkbox-grid task-user-checkbox-grid">${structureUserPickerHtml(meta.assignees || [])}</div></div><div class="structure-popup-section"><h4>المنصات ونوع المنشور</h4><div class="structure-popup-platform-list">${structurePlatformRowsHtml(meta)}</div></div><div class="structure-popup-grid"><label class="field"><span>تاريخ النشر</span><input type="date" class="js-structure-publish-date" value="${escapeHtml(meta.publishDate || meta.date || '')}"></label><label class="field"><span>الكابشن</span><textarea class="js-structure-caption" rows="3">${escapeHtml(meta.caption || '')}</textarea></label><label class="field"><span>الهاشتاج</span><textarea class="js-structure-hashtags" rows="3">${escapeHtml(meta.hashtagsText || meta.hashtags || '')}</textarea></label></div></div><div class="structure-popup-actions"><button type="button" class="btn btn-light" data-close-structure-distribution-popup>إلغاء</button><button type="button" class="btn btn-primary" data-save-structure-distribution-popup>حفظ بيانات التاسك</button></div></section>`;
  popup._structureRowEl = rowEl;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add('open'), 0);
}
function closeStructureDistributionPopup(){
  document.querySelectorAll('.structure-distribution-popup').forEach(el => el.remove());
}
function saveStructureDistributionPopup(){
  const popup = document.querySelector('.structure-distribution-popup');
  if(!popup) return;
  const meta = collectStructurePopupMeta(popup);
  if(!meta.assignees.length) return showToast('اختار يوزر واحد على الأقل.');
  if(!meta.platforms.length) return showToast('اختار منصة واحدة على الأقل.');
  const missingType = (meta.platformPublishing || []).some(item => !item.postType);
  if(missingType) return showToast('اختار نوع المنشور لكل منصة.');
  writeStructureRowMeta(popup._structureRowEl, meta);
  closeStructureDistributionPopup();
}
function selectedStructurePublishMeta(rowEl){
  return readStructureRowMeta(rowEl);
}
function structureAssigneeTable(task){
  const structure = taskStructure(task);
  const rows = structureDistributionRows(structure);
  if(!rows.length){
    const reloadBtn = structure.fileData ? `<button class="btn btn-light" type="button" data-reload-structure-sheet="${escapeHtml(task.id)}">إعادة قراءة الشيت واستخراج الصفوف</button>` : '';
    return `<div class="empty-state mini-empty">لا توجد صفوف لتوزيعها.${reloadBtn}</div>`;
  }
  return `<div class="structure-distribution"><h4>توزيع تاسكات الهيكل</h4><div class="structure-assign-list">${rows.map((row, index) => `<div class="structure-assign-row structure-assign-row-compact" data-structure-row="${index}"><div class="structure-assign-info"><strong>${escapeHtml(structureContentTaskLabel(row, 'نوع محتوى'))}</strong><p>${escapeHtml(row.idea || row.contentName || row.description || row.goal || '')}</p></div><div class="structure-assign-controls">${structureDistributionPlatformControls(index)}</div></div>`).join('')}</div><button class="btn btn-primary" type="button" data-save-structure-assignees="${escapeHtml(task.id)}">حفظ توزيع تاسكات الهيكل</button></div>`;
}
function contentWriterCodeForTask(task){
  const name = identityClean([task?.assignedToName, task?.userName, task?.assigneeName].filter(Boolean).join(' '));
  if(name.includes('احمد') && (name.includes('ناجي') || name.includes('nagi'))) return 'N';
  if(name.includes('بلال') || name.includes('khtan') || name.includes('ختعن')) return 'B';
  if(name.includes('امجاد') || name.includes('الدوسري') || name.includes('amjad')) return 'A';
  return userCodeFromIdentity(task?.assignedToName || task?.userName || task?.assigneeName || 'N') || 'N';
}
function structureTemplateRowsForTask(task, count = 50){
  const creativeCode = taskCreativeLinkCode(task);
  const writerCode = contentWriterCodeForTask(task);
  const campaign = campaignRecordForTask(task) || {};
  const creativeName = task.creative || task.product || (task.taskType || '').replace(/^طلب\s*هيكل\s*-?/i, '').trim() || '';
  const creativeShortCode = task.creativeShortCode || creativeShortCodeForName(creativeName);
  const creativeRow = creativeAssignmentForStructureRow(campaign, task, { creativeShortCode, taskNo: creativeCode });
  const mainRole = creativeDepartmentRole(creativeName || creativeRow?.creative || '');
  const roleTask = assignmentForRoleFromCreativeRow(creativeRow, mainRole) || {};
  const deptCode = roleCode(mainRole);
  const execUserCodes = uniqueList([...(Array.isArray(roleTask.userCodes) ? roleTask.userCodes : []), ...userCodesForTask(roleTask)]).filter(Boolean).join(',');
  return Array.from({length: Math.max(1, Number(count) || 50)}, (_, index) => {
    const n = String(index + 1).padStart(2, '0');
    const taskNo = creativeCode ? `${creativeCode}-${creativeShortCode}-${deptCode}-${execUserCodes || writerCode}-${writerCode}${n}` : '';
    return {
      'كود الحملة': task.campaignCode || '',
      'كود الكرييتيف': creativeCode,
      'كود الكرييتيف المختصر': creativeShortCode,
      'كود القسم': deptCode,
      'كود اليوزر': execUserCodes || writerCode,
      'كود كاتب المحتوى': writerCode,
      'كود تاسك الهيكل': taskNo,
      'رقم الهيكل الأصلي': '',
      'نوع الحملة': '',
      'نوع المحتوى': '',
      'الهدف': '',
      'الهدف الملموس': '',
      'الفكرة': '',
      'اسم المحتوى': '',
      'وصف المحتوى': '',
      'الرسالة': '',
      'زاوية المحتوى': '',
      'الترجمة التنفيذية لما يجب إبرازه': '',
      'المطلوب من الكاتب': '',
      'CTA': '',
      'ملاحظات خاصة': ''
    };
  });
}
function sheetAddress(row, col){
  return XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
}
function applySheetStyle(ws, range, style){
  if(!ws || !range || !style) return;
  const decoded = XLSX.utils.decode_range(range);
  for(let r = decoded.s.r; r <= decoded.e.r; r += 1){
    for(let c = decoded.s.c; c <= decoded.e.c; c += 1){
      const address = XLSX.utils.encode_cell({ r, c });
      if(!ws[address]) ws[address] = { t: 's', v: '' };
      ws[address].s = Object.assign({}, ws[address].s || {}, style);
    }
  }
}
function applyStructureTemplateStyles(ws, tableHeaderRow, tableLastRow){
  const titleStyle = {
    font: { bold: true, sz: 18, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '1F2937' } },
    alignment: { horizontal: 'center', vertical: 'center', readingOrder: 2 }
  };
  const sectionStyle = {
    font: { bold: true, sz: 13, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '374151' } },
    alignment: { horizontal: 'right', vertical: 'center', readingOrder: 2 }
  };
  const labelStyle = {
    font: { bold: true, color: { rgb: '111827' } },
    fill: { fgColor: { rgb: 'E5E7EB' } },
    alignment: { horizontal: 'right', vertical: 'center', readingOrder: 2 },
    border: { top: { style: 'thin', color: { rgb: 'CBD5E1' } }, bottom: { style: 'thin', color: { rgb: 'CBD5E1' } }, left: { style: 'thin', color: { rgb: 'CBD5E1' } }, right: { style: 'thin', color: { rgb: 'CBD5E1' } } }
  };
  const valueStyle = {
    alignment: { horizontal: 'right', vertical: 'top', wrapText: true, readingOrder: 2 },
    border: { top: { style: 'thin', color: { rgb: 'CBD5E1' } }, bottom: { style: 'thin', color: { rgb: 'CBD5E1' } }, left: { style: 'thin', color: { rgb: 'CBD5E1' } }, right: { style: 'thin', color: { rgb: 'CBD5E1' } } }
  };
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '0F766E' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true, readingOrder: 2 },
    border: { top: { style: 'thin', color: { rgb: '0F172A' } }, bottom: { style: 'thin', color: { rgb: '0F172A' } }, left: { style: 'thin', color: { rgb: '0F172A' } }, right: { style: 'thin', color: { rgb: '0F172A' } } }
  };
  const bodyStyle = {
    alignment: { horizontal: 'right', vertical: 'top', wrapText: true, readingOrder: 2 },
    border: { top: { style: 'thin', color: { rgb: 'E2E8F0' } }, bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } }
  };
  applySheetStyle(ws, 'A1:P1', titleStyle);
  applySheetStyle(ws, 'A3:P3', sectionStyle);
  applySheetStyle(ws, 'A4:A9', labelStyle);
  applySheetStyle(ws, 'B4:P9', valueStyle);
  applySheetStyle(ws, 'A11:P11', sectionStyle);
  applySheetStyle(ws, 'A12:P14', valueStyle);
  applySheetStyle(ws, 'A16:P16', sectionStyle);
  applySheetStyle(ws, 'A17:P19', valueStyle);
  applySheetStyle(ws, `A${tableHeaderRow}:P${tableHeaderRow}`, headerStyle);
  applySheetStyle(ws, `A${tableHeaderRow + 1}:P${tableLastRow}`, bodyStyle);
}

async function downloadStructureTemplateForTask(taskId){
  const task = findTaskById(taskId);
  if(!task) return showToast('تعذر العثور على تاسك الهيكل.');
  try{
    await downloadStructureTemplateForTaskExact(task);
  }catch(err){
    console.error('exact structure template download failed', err);
    showToast('تعذر تنزيل قالب الهيكل. تأكد من وجود ملف القالب ثم أعد تحديث الصفحة.');
  }
}
function xmlEscape(value){
  return String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function columnNameToNumber(colLetters){
  return String(colLetters || '').toUpperCase().split('').reduce((sum, ch) => sum * 26 + (ch.charCodeAt(0) - 64), 0);
}
function countSharedStrings(sharedXml){
  const matches = sharedXml.match(/<si[\s>]/g);
  return matches ? matches.length : 0;
}
function updateSstCounts(sharedXml, count){
  if(/<sst\b[^>]*\bcount="[^"]*"/.test(sharedXml)){
    sharedXml = sharedXml.replace(/(<sst\b[^>]*\bcount=")[^"]*(")/, `$1${count}$2`);
  }else{
    sharedXml = sharedXml.replace(/<sst\b/, `<sst count="${count}"`);
  }
  if(/<sst\b[^>]*\buniqueCount="[^"]*"/.test(sharedXml)){
    sharedXml = sharedXml.replace(/(<sst\b[^>]*\buniqueCount=")[^"]*(")/, `$1${count}$2`);
  }else{
    sharedXml = sharedXml.replace(/<sst\b/, `<sst uniqueCount="${count}"`);
  }
  return sharedXml;
}
function appendSharedString(sharedXml, value){
  const index = countSharedStrings(sharedXml);
  const text = xmlEscape(value == null ? '' : value);
  const si = `<si><t xml:space="preserve">${text}</t></si>`;
  const closeIndex = sharedXml.lastIndexOf('</sst>');
  if(closeIndex < 0) throw new Error('Invalid sharedStrings.xml');
  sharedXml = `${sharedXml.slice(0, closeIndex)}${si}${sharedXml.slice(closeIndex)}`;
  return { xml: updateSstCounts(sharedXml, index + 1), index };
}
function patchSheetCellXmlShared(sheetXml, cellRef, sharedIndex){
  const rowNo = Number(String(cellRef).replace(/^[A-Z]+/i,''));
  const colLetters = String(cellRef).replace(/[0-9]+$/,'').toUpperCase();
  const colNo = columnNameToNumber(colLetters);
  const cellXml = `<c r="${cellRef}" t="s"><v>${sharedIndex}</v></c>`;
  const cleanAttrs = (attrs) => String(attrs || '')
    .replace(/\s*\/$/, '')
    .replace(/\s+t=["'][^"']*["']/g, '')
    .replace(/\s+cm=["'][^"']*["']/g, '')
    .replace(/\s+vm=["'][^"']*["']/g, '');
  // Important: handle self-closing cells before normal cells. Otherwise a regex can span into the next cell and corrupt worksheet XML.
  const selfClosingCellRe = new RegExp(`<c([^>]*\\sr=["']${cellRef}["'][^>]*)\\s*\\/>`);
  if(selfClosingCellRe.test(sheetXml)){
    return sheetXml.replace(selfClosingCellRe, (match, attrs) => `<c${cleanAttrs(attrs)} t="s"><v>${sharedIndex}</v></c>`);
  }
  const normalCellRe = new RegExp(`<c([^>]*\\sr=["']${cellRef}["'][^>]*)>[\\s\\S]*?<\\/c>`);
  if(normalCellRe.test(sheetXml)){
    return sheetXml.replace(normalCellRe, (match, attrs) => `<c${cleanAttrs(attrs)} t="s"><v>${sharedIndex}</v></c>`);
  }
  const rowBlockRe = new RegExp(`<row([^>]*\\sr=["']${rowNo}["'][^>]*)>([\\s\\S]*?)<\\/row>`);
  if(rowBlockRe.test(sheetXml)){
    return sheetXml.replace(rowBlockRe, (match, rowAttrs, rowInner) => {
      const cellMatches = [...rowInner.matchAll(/<c[^>]*\sr=["']([A-Z]+)\d+["'][^>]*(?:\/>|>[\s\S]*?<\/c>)/g)];
      let insertAt = rowInner.length;
      for(const m of cellMatches){
        const currentCol = columnNameToNumber(m[1]);
        if(currentCol > colNo){ insertAt = m.index; break; }
      }
      return `<row${rowAttrs}>${rowInner.slice(0, insertAt)}${cellXml}${rowInner.slice(insertAt)}</row>`;
    });
  }
  return sheetXml.replace('</sheetData>', `<row r="${rowNo}">${cellXml}</row></sheetData>`);
}
function patchWorkbookCellsWithSharedStrings(sheetXml, sharedXml, patches){
  Object.entries(patches).forEach(([addr, val]) => {
    const appended = appendSharedString(sharedXml, val == null ? '' : val);
    sharedXml = appended.xml;
    sheetXml = patchSheetCellXmlShared(sheetXml, addr, appended.index);
  });
  return { sheetXml, sharedXml };
}

const STRUCTURE_TEMPLATE_BASE64_V145 = 'UEsDBBQAAAAIALskyVxGx01IlQAAAM0AAAAQAAAAZG9jUHJvcHMvYXBwLnhtbE3PTQvCMAwG4L9SdreZih6kDkQ9ip68zy51hbYpbYT67+0EP255ecgboi6JIia2mEXxLuRtMzLHDUDWI/o+y8qhiqHke64x3YGMsRoPpB8eA8OibdeAhTEMOMzit7Dp1C5GZ3XPlkJ3sjpRJsPiWDQ6sScfq9wcChDneiU+ixNLOZcrBf+LU8sVU57mym/8ZAW/B7oXUEsDBBQAAAAIALskyVwWUxTvGAEAAFwCAAARAAAAZG9jUHJvcHMvY29yZS54bWzFklFvgjAUhf+K4R1vAcGtQRI3XHyQZJkmW/bWlKuSUdq03dB/P+gUNdv7HnvOuV/PTW7KFeVS47OWCrWt0IwOom4M5Wrm7a1VFMDwPQpmxl2i6cyt1ILZ7ql3oBj/YDuEkJAEBFpWMsugB/pqIHpZWnLKNTIr9Qlf8gGvPnXtYCUHrFFgYw0E4wC8bIWN/JIpXMZ7lEUtzI+A5cBz6p9Q54B3Sh5MNaTath23kct1GwTwVqzWblm/aoxlDcduylTUHhXOvPPPr9FjvnnyspAEsU8Sn8Sb4I4GUxqS977rTb9LYSHLalv9c+MwcY3vN2RCoymNJ1eNzwWztDuKmhlbnISHYzZfFot89DJfLxd5Cr99p90eUvYNUEsDBBQAAAAIALskyVx1Pplp6gUAAIwaAAATAAAAeGwvdGhlbWUvdGhlbWUxLnhtbO1ZzYsbNxS/F/o/DHN35nvGXuIN9thO2uwmIbtJyVGekT2KNSMzknfXhEBJTr0UCmnppdBbD6U00EBDL/1jFhLa9I+oRuMPja3JR+OUlMYGW3r6vaef3pOepJmLl85SrJ3AnCKStXXrgqlrMItIjLJxW791PGg0dY0ykMUAkwy29Tmk+qX9jz+6CPZYAlOocf2M7oG2njA23TMMGnExoBfIFGa8bUTyFDBezcdGnINTbjfFhm2avpEClOlaBlJu9vpohCKoHRcm9f2l8T7mPxmjhSDC+VEkepQ1BDaeWMUfndMQ59oJwG2d9xOT02N4xnQNA8p4Q1s3xUc39i8aKyXManQlvYH4LPQWCvHEFnr5eLhSdF3P9Tsr+3ZpfxvXD/p+31/ZEwAQRXyk1hbW67a6PW+BlUBlUWG7F/Qcq4KX7Dtb+I5XfCt4Z413t/CDQbj2oQQqi57CJ4EduhW8t8b7W/jA7PTcoIIXoASjbLKFNj3fCZejXUFGBF9RwlueOwjsBXyNMqTZVepnrG6upeAuyQccIIILGMo0Np/CEYg4LgQYDXOkHaBxwifeFGSEcrFpmwPT4b/F1xUl4RGwB4GkXYoiuiUq+Gg0ytGUtfVPuVVdgjx7+vT8wZPzB7+eP3x4/uDnRd/beldANpb1Xvzw1V/ffa79+cv3Lx59rcZTGf/8py+e//b7y8yzCq1vHj9/8vjZt1/+8eMjBbyTg6EMP0YppNo1eKrdJCkfoKIDOMzfTOM4AaiiARKOVAD7LKkAr80BVuG6sOrC2znPFCrg5dndCtejJJ8xpABeTdIK8JAQ3CW5cjhXi77k4cyysbrzfCbjbgJwouo73AhwfzblUx6pTIYJrNC8gXm0wRhmkGlFG5lAqFC7g1DFr4coygklI6bdQVoXIKVLjtGQqZWuoJTHZa4iyENd8c3hba1LsMp8D55UkXxZAKwyCXHFjZfBjIFUyRikWEYeAJaoSB7N86jicMp4pMcQE60fQ0pVOtfzeYXuVZ5h1GE/xPO0iswZmqiQB4AQGdkjkzAB6VTJGWWJjP2ETvgUBdoNwpQkSHWFFHUeB5DVhvs2guzNlvUtnoHUE6RomeWqJQFJdT3O8QjAbLERVFJ6irJX5veNzO79O5n9neX03WfzTo6Ua2ozh9fh/oOZuwdm2Q3IF8uHxP0hcf8fE3fdWt59ul5naEM+qwszae3BfYQwPmJzDA+oyO2UDy8ecKGoCKXVPWGa8OKiuwpunANR1nLCPkMsOUrAlHdjiR7GdGF6TLUpoXx30Gtti91llh6SuJRa1vJqyhUAW8v57rKU872IlVI/WN/BVuZFbUxlAp4w+vokpM6qJBwFicB5PRKWuSsWLQWLpvUyFoYUFb7+NFA81fDckhGfbwDDuIhTqb+M7s4jXefM6rBtxfBa7s4iXSEhTbcqCWkaJiCGm+Idx7rVUofaVtIImu8i1sZ2bsBZtaad8jXneNxMBKZtfcTPhbyYTrk9WuRNgMdZW4/YwtH/JLNMc8p6gCYlTDSV408Rg7mGUcrnuhwGnK25WXZgvr/kWub75zljM8hwNIIRq5Gsq7ytNKJsfUtwUSEzTvooiU+1IZ7lNwF3lBdYhQNjRNnKmzHKpcm99uJGulosxcojs/USBXiagMWOIifzEi7KKzrSOATTzVEZKhcOx4Nd7LqvVtpImjUbSFCbxd7dJi+xctSsPGWuazXNl+8Sb78hSNSaamqOmlrd3rHDA4HUnV/jN7s2mm+5G2zOWkM6V4ra1rsJMrzLZ36PH1dnmNHy/n/G7wjh8qlymQmEdJldzpg2y1Fbv2d6HTe0vbBhNr1+w3Vcs9H0Ok6j43mO1fcss9e173OnsCS1vLLvAb/P4Pni1YuQb71+SZfH7AsRSQ0izsGGUBavXyy7/vWLhrhn7vn2oOW0un6j5XQGDbfXbTZaod9t9Pww6A16oddsDe7r2okAux0ndP1+s+FbYdhwfbOg32w1Ate2O27Qafbdzv2Fr/nIl/9L9wpe+38DUEsDBBQAAAAIALskyVwG9rQ9nQ4AALKPAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1s3d1bcxrJFcDxr0IpVXlbixmYC7KsKrvnfq/1JqnKG5bHEmUkFEDxbj59GJjBNOr505LlJJWXleBHD336NDOHI7xcflssv65u63o9+P1ufr96d3a7Xj9cnJ+vrm/ru+nqzeKhvt/Il8Xybrre3FzenK8elvX083bQ3fzcHA7t87vp7P7s6nJ7X7W8ulw8ruez+7paDlaPd3fT5R8f6vni27sz46y749fZze26ueP86vJhelN/rNd/eaiWm1vn+6N8nt3V96vZ4n6wrL+8O3tvXFSu3QzYPuKvs/rb6uD3wbI55G+LrP6yPfBgPf30sZ7X1+v68+724qExUc/nzcGcs8G/Fou7j9fTef3uzBke3CyaaOe7O5sF+rRYfG2eIt4caNjEuT1sM7Hp5sc/6+6Qm+j+0U71bB9JM/Dw927OwXZJN0v0abqqxWL+t9nn9e27M/ds8Ln+Mn2cr39dfIvqdpms5njXi/lq+9/Bt91jDftscP24Wi/u2sHNDNZ/NPFsfrub3e9+Tn9vF/pgqDl8OnQ7wGwHmMcDNhP7VK/WwWy3usrBo3bw6Giw4fYMGLcDxsfPZvYMsNoB1vEAxVJsB9jtAPt4wFgjHqcd7OhOz20HuLoDJu2AydGAUV9+jGGX0aEiQ+oh+01wvAt682J028A43gf9Q7rkG9rZN7r0G8f57x/SbQDjeAf0D+m2gLHdA+e7l9H2NehN19Ory+Vic/LYPn77Wpu8sboj7V9/m7PH7ez664fF9sbmeZsB2xf8JlWbwDd3z+6bU97H9XLDs80TrK/+/CfDco23mx/20Nr9GO9+OG8HvwzE+6Fxeb7ezKh5+Pl1e1SxO+rY2R61Oa02dL6Z5H6m5m6m3zfViXmau3laPfO8nt49TGc394P54mZ2rZjSh90BXIjT2QZouU4X7uD7vW3YyrWwHOetahF2z/h0xk/WYvTMtRipVncX5ehUlPZwtJu6u4tn9KNRjnSjHD8zynF/lOPXiLJ9jOXu7jSGBz8sxz28c2goQx/rhm71h95Fa/VHa2nu3BfFpVqX3etgYkh37lbSsbcj9vfuTwaHRx11plo0S3fR7NOLZvcvmq25RbpXvSPFp16R3cuiW8Nh+2OiDNPWDdM5HabTH6bzslfCTw7e0Q3ePR282x+8ezp4+zD4ifbJrtnRqsBc3cAmu8DcYX9gk/7AJqcDs7qIDsOcqOKTHmO5k+7kMGj3w+Glz+wGDvK/J6oFmBwsgPK63tR2p1LaPKYv9NbobOfKO1p5naagm9Nee7oaHOz+SXvatA/Pl67qJWE5k90tky6MbSS0VobGWilLqXatjOdeGZy3hwuoOvvLVVC3Nq719HSxX6Lh4WrKV4ZnVRJtOLRgUDXuF8yEBdMtAp+xYPsXnyMt0fi1FsU8uShQPu4XBUpG42TNeLxDpD3Rpr89IW2i6L2EHN9ypY3m9BcWP7T+ykUdnVxUqFb3iwoVqnGyRD2+Cskvu+OtobpuHUf6ffy+2uvZU+OT4WtUrAaUrIZGzTo6LCukuJtbP/iuxLBOhqhRXxpQYBonK8wffdnsay272/2HiR4fJXpwOPDnrq19cm01iloDqlpDo6w9Xdm9pHI1nJOxadSsBhStxsmqtS1B9sG4iky/QqTuyUgnz3zHbkBJa2jXtE5bpUnlxff3JqPu5uE5sA1/fyVQBnyydjWhdlU3paCQNU8Xsv+t88PPXmnzZOVralS+JlS+5snKVzNGV1ps+yDi3uBOVqmmRpVqtlWqqwqOq1Tx23vlvE4Wiua+UFR1h/cz29VGI6fn6f+2nK1n9zeDXx/n9Wrwy25bmYcnY+fwvemTjoP0mHZzvdZJ7UM7+fHk6bKK1qwhrNBYa4U02o//MwuiMVc4avcWWV0e7N8N9nULTO0OqWlprXxb1RmqV02/CVO76WjaWvOwYR79JkztrqDpaM3DgXn0mzC1G3RmV+2M3pi6f1IyXZhVvwlTu7tmTrRWZwLz6DdhTnTnMWoLBsN64+iuzmjYPyswMRpqz6q7uBr9azNqr2Ij1Sz6TYwM7Vl0V0HjGWuzu4Y1PY+ns2pNOavWxv2n9lF78TNsjT+NyiPbi4I7fkYg7Ylv3HcNX9yv6/v1wP+9vn7cfgrDmy3bz2P8sjvzDw/P/MfFPxd+r3PpaGNQXkvBPDAfLAALwSKwGCwBS8GyLrfWU8vBCrASrFKbvEWtF2zR9ppov+gv/4oNk436G0I5WAFWglVqkxemvZzbo2cszO4ibfR91ODwlfdKf1f68ErP+ZI+gMZTd39K7qpa5V9c5Dq2+xDFSPWcns5znmjEKw7rv8Jhn9+8VkwkeMFEjG69Dt9sK48eam2Wdn6Tk4E9Z7NEzw7sVF9b8SSx1o78D7TIkudH+3/Tw0lfsIV1PjZiddH2fx7nyWcSlNeaE9NTN0lyrZfOa390CDajKe2a/V+pFVMvXm3qpnSCVj5Z+VpP1i2Ce7DjegKsXvycP+3DLHIp0b4jt7TriPZNtvJjev0mwDwwHywAC8EisBgsAUvBMrAcrAArwSq1yXl3n5t3F/LebwLMA/PBArAQLAKLwRKwFCwDy8EKsBKsUpuc98lz8z6BvPebAPPAfLAALASLwGKwBCwFy8BysAKsBKvUJn9Medif9y7V42F/qsEEmAfmgwVgIVgEFoMlYClYBpaDFWAlWKU2OdWGRqoNSHW/CTAPzAcLwEKwCCwGS8BSsAwsByvASrBKbXKqTY1Um5DqfhNgHpgPFoCFYBFYDJaApWAZWA5WgJVgldrkVI80Uj2CVPebAPPAfLAALASLwGKwBCwFy8BysAKsBKvUJqd6rJHqMaS63wSYB+aDBWAhWAQWgyVgKVgGloMVYCVYpTY51ZZGqi1Idb8JMA/MBwvAQrAILAZLwFKwDCwHK8BKsEptcqptjVTbkOp+E2AemA8WgIVgEVgMloClYBlYDlaAlWCV2uRUOxqpdiDV/SbAPDAfLAALwSKwGCwBS8EysBysACvBKrXJqYY+2j7V0DoDE2AemA8WgIVgEVgMloClYBlYDlaAlWCV2uRUQ+tsn2roloEJMA/MBwvAQrAILAZLwFKwDCwHK8BKsEpt8r9s1+iWWdAtAxNgHpgPFoCFYBFYDJaApWAZWA5WgJVgldrkVGt0yyzoloEJMA/MBwvAQrAILAZLwFKwDCwHK8BKsEptcqo1umUWdMvABJgH5oMFYCFYBBaDJWApWAaWgxVgJVilNjnVGt0yC7plYALMA/PBArAQLAKLwRKwFCwDy8EKsBKsUpucao1umQXdMjAB5oH5YAFYCBaBxWAJWAqWgeVgBVgJVqlNTrVGt8yCbhmYAPPAfLAALASLwGKwBCwFy8BysAKsBKvUJqdao1tmQbcMTIB5YD5YABaCRWAxWAKWgmVgOVgBVoJVapNT7Wik2oFU95sA88B8sAAsBIvAYrAELAXLwHKwAqwEq9Qmp1qjW2ZBtwxMgHlgPlgAFoJFYDFYApaCZWA5WAFWglVqk1Ot0S2zoFsGJsA8MB8sAAvBIrAYLAFLwTKwHKwAK8Eqtcn/S0ONbpkN3TIwAeaB+WABWAgWgcVgCVgKloHlYAVYCVapTU61RrfMhm4ZmADzwHywACwEi8BisAQsBcvAcrACrASr1CanWqNbZkO3DEyAeWA+WAAWgkVgMVgCloJlYDlYAVaCVWqTU63RLbOhWwYmwDwwHywAC8EisBgsAUvBMrAcrAArwSq1yanW6JbZ0C0DE2AemA8WgIVgEVgMloClYBlYDlaAlWCV2uRUa3TLbOiWgQkwD8wHC8BCsAgsBkvAUrAMLAcrwEqwSm1yqjW6ZTZ0y8AEmAfmgwVgIVgEFoMlYClYBpaDFWAlWKU2OdWORqodSHW/CTAPzAcLwEKwCCwGS8BSsAwsByvASrBKbXKqNbplNnTLwASYB+aDBWAhWAQWgyVgKVgGloMVYCVYpTY51RrdMhu6ZWACzAPzwQKwECwCi8ESsBQsA8vBCrASrFKb/M0YGt0yB7plYALMA/PBArAQLAKLwRKwFCwDy8EKsBKsUpucao1umQPdMjAB5oH5YAFYCBaBxWAJWAqWgeVgBVgJVqlNTrVGt8yBbhmYAPPAfLAALASLwGKwBCwFy8BysAKsBKvUJqdao1vmQLcMTIB5YD5YABaCRWAxWAKWgmVgOVgBVoJVapNTrdEtc6BbBibAPDAfLAALwSKwGCwBS8EysBysACvBKrXJqdboljnQLQMTYB6YDxaAhWARWAyWgKVgGVgOVoCVYJXa5FRrdMsc6JaBCTAPzAcLwEKwCCwGS8BSsAwsByvASrBKbXKqHY1UO5DqfhNgHpgPFoCFYBFYDJaApWAZWA5WgJVgldrkVGt0yxzoloEJMA/MBwvAQrAILAZLwFKwDCwHK8BKsEptcqo1umUOdMvABJgH5oMFYCFYBBaDJWApWAaWgxVgJVilNvmrVDW6ZS50y8AEmAfmgwVgIVgEFoMlYClYBpaDFWAlWKU2OdUa3TIXumVgAswD88ECsBAsAovBErAULAPLwQqwEqxSm5xqjW6ZC90yMAHmgflgAVgIFoHFYAlYCpaB5WAFWAlWqU1OtUa3zIVuGZgA88B8sAAsBIvAYrAELAXLwHKwAqwEq9Qmp1qjW+ZCtwxMgHlgPlgAFoJFYDFYApaCZWA5WAFWglVqk1Ot0S1zoVsGJsA8MB8sAAvBIrAYLAFLwTKwHKwAK8Eqtcmp1uiWudAtAxNgHpgPFoCFYBFYDJaApWAZWA5WgJVgldp2qT5f3db12puup1eXd/Xyphb1fL4aXC8e7zePdc4O7h0s6y/Nl+JeCOPs/On95uii+UpKhYzGF82XTKnGjC+ab257Kh828kEp782L5stGVU9jXTRf2bSR8++RXF0+TG/qfLq8md2vBvP6yyaq4ZvNSix3O3n7+3rxsP1ts88/Ldabfd7duq2nn+tlc2tzDfyyWKy7G82TfFssv25X7+rfUEsDBBQAAAAIALskyVyzd/WVyAQAALNBAAANAAAAeGwvc3R5bGVzLnhtbN1cW4+rNhD+K4j3Hq4hUCWR2lQrVWqrI5196KsTTGLJXArONjm/vr6Qy+4y28AJYDbRCuPxzHwez3iMY3ZRsRPF3/YYM+OY0qxamnvGip8tq9rucYqqL3mBM05J8jJFjN+WO6sqSoziSjCl1HJtO7BSRDJztcgO6VPKKmObHzK2NG3TWi2SPLvWRKaq4E1Rio0XRJfmGlGyKYlsi1JCT6raFRXbnOalwTgUvDQdUVN9V2RH3QmUtZyUZHkpKi2loY2eTS1UQ53BIDrtEXS+7qc7Qj/9EfrZWudvhw1qHR3uowU6NwLlpeL8hNJLaAemqlgtCsQYLrMnfiN5ZOU7klGXn08FV7Yr0clxZ+bdDFVOSSxU7tbvQG/qOpLF+Ihjjk0a3boR9oNq7KHUGIwI4/5kf3H8KIpCf+7bc3/mBu7wCGyOIIw8J5y5ThB6flsE8sLdZpOXMS4vjuO65rlutaA4YZy/JLu9uLK8EEpyxvKUF2KCdnmGpFudOZo4DZnWeGjhmBxS8+zYb0HKtiMouZNTNf5/QHeKE027Qr+TgbdsYcgBcLcZ1yHhPNgDXkdML4P11uvZXq74RnGczhHYHs1d3W07TJ1xf4ji06D+zNPiQ0dmwB6O4nka9280H+1xiu8KZpgk21vC6WlIP8Q7zqQznYn13UJJj0zWS7i1dZSpBYKW+fcH+lgX+IPsFlP6Tcj7O7k8zTpc5jEx1E7o77F8ghbbJecifwSui0qMuhHyb6Up2TdiZ2EnuUZBXnL264H3JpP3/xxyhr+WOCFHeX9MLgA6SEdFQU+/ULLLUqw6f7fC1QKd+Yx9XpLvXJvYaNryCqy2w44JDGoOgAr7BGW84JKR7QNgRtOA6fQ6xu1x+hBOZ1icxr8lKp7xkdUbjt2M604RtKcx6Bv38CfjHqBPDzyVdXUPf4o+7U/Gp4Mxsu/jZmbNYELTmmYwwYks0NhTIdDuwMZ9TMqYawzamWKeC6E8p7NP34D2JuPTkKUnCXqagajzMggErfMy6MY9ZpOxtAtZeqbXcgPCqdmqCDSnXjAdYCbTObwgzP4EMQ8cXK0wz66YXY0jDYKpWaSBi3eNPQB8StIYM+QOA6/cu8IceAXZYkfHHzE/dIU5cEroClOzJZYuW9OdcQ48P3XGqVkUeVAm1SyMIJyaTfGgOTX7QdWGdjN6/UXe7VV60Kv0ea/S/V6lz3qVLn4IfIB4KHQ0mzBBK0QPsQK0h6DZdAw927o6PNpY9dmkmwNQr44/XWoN8c7Z0vxLvDtKryiMzYFQRrLLYF2PPnGZDG0ofi2Us8Q4QQfKni/EpXkt/ykPc7mXVl+FOepW1/If4tiYerVRHvriuupjX+v6ttxt1NtMvMC11h/B8JbyJD/NFIhH0ZopggbpgRBAPIoL0vOZ+hOC/VE0CFvYSAlBnhDkUVxNlLX8QnqaeSL+ae5pFHleEEAWXa8bEawhuwWB+GuWBmETHJAeoamdreHRhj3kYz+AxvQjD4F6Cnsi1FPY1oLSbDfBEUXNow3pERzQKEC+I/Q36xE+1czjeWJUIWxQBMOUKIIowhebfTQIAOsE4ts8PlCUeF4UNVMErRmB50EUEY0wBUIgMEAUz5N58E0+ss55yrr+m4bVf1BLAwQUAAAACAC7JMlcl4q7HMAAAAATAgAACwAAAF9yZWxzLy5yZWxznZK5bsMwDEB/xdCeMAfQIYgzZfEWBPkBVqIP2BIFikWdv6/apXGQCxl5PTwS3B5pQO04pLaLqRj9EFJpWtW4AUi2JY9pzpFCrtQsHjWH0kBE22NDsFosPkAuGWa3vWQWp3OkV4hc152lPdsvT0FvgK86THFCaUhLMw7wzdJ/MvfzDDVF5UojlVsaeNPl/nbgSdGhIlgWmkXJ06IdpX8dx/aQ0+mvYyK0elvo+XFoVAqO3GMljHFitP41gskP7H4AUEsDBBQAAAAIALskyVxov7zDcQEAAGcCAAAPAAAAeGwvd29ya2Jvb2sueG1sjZHNSsNAFIVfJcxekxZ/aGm6UfwB0WKlrqeZm+bi/ISZW2O7blF8EUHo+yRv4yQhWnHjauacG849+WZUGPs0N+YpeFFSu5hlRPkwDF2SgeLu0OSg/SQ1VnHy0i5Cl1vgwmUApGTYj6KTUHHUbDzqsiY2HI/qywyhcD9+LYNndDhHibSKWXOXwAKFGhWuQcQsYoHLTHFlLK6NJi6niTVSxqzXDmZgCZM/9rTu88DnrnFeHlELU8TsoNf3gavfsmjUIwrKYtYfREff3hXgIiMfcXpcf0h8fs8JTcxOIi9TtI6aRU1NnhA+g9/ZqiWZC5QE9pwTXFqzzFEv6jYeRrhHoyHXnS32of0PeJOmmMC5SZYKNLXkLci6oHYZ5o4FmiuIWbUtd+Vn9Va9B+VHtSl31bbaVK9BTcrvvBYtNfI9997ADtEP7LVoG3c1BaSoQdz6ZOd9Tz6Z2KA+mpxBL+oPPJqllGfeu9M3hovur7uHH38BUEsDBBQAAAAIALskyVwkHpuirQAAAPgBAAAaAAAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHO1kT0OgzAMha8S5QA1UKlDBUxdWCsuEAXzIxISxa4Kty+FAZA6dGGyni1/78lOn2gUd26gtvMkRmsGymTL7O8ApFu0ii7O4zBPahes4lmGBrzSvWoQkii6QdgzZJ7umaKcPP5DdHXdaXw4/bI48A8wvF3oqUVkKUoVGuRMwmi2NsFS4stMlqKoMhmKKpZwWiDiySBtaVZ9sE9OtOd5Fzf3Ra7N4wmu3wxweHT+AVBLAwQUAAAACAC7JMlcZZB5khkBAADPAwAAEwAAAFtDb250ZW50X1R5cGVzXS54bWytk01OwzAQha8SZVslLixYoKYbYAtdcAFjTxqr/pNnWtLbM07aSqASFYVNrHjevM+el6zejxGw6J312JQdUXwUAlUHTmIdIniutCE5SfyatiJKtZNbEPfL5YNQwRN4qih7lOvVM7Ryb6l46XkbTfBNmcBiWTyNwsxqShmjNUoS18XB6x+U6kSouXPQYGciLlhQiquEXPkdcOp7O0BKRkOxkYlepWOV6K1AOlrAetriyhlD2xoFOqi945YaYwKpsQMgZ+vRdDFNJp4wjM+72fzBZgrIyk0KETmxBH/HnSPJ3VVkI0hkpq94IbL17PtBTluDvpHN4/0MaTfkgWJY5s/4e8YX/xvO8RHC7r8/sbzWThp/5ovhP15/AVBLAQIUAxQAAAAIALskyVxGx01IlQAAAM0AAAAQAAAAAAAAAAAAAACAAQAAAABkb2NQcm9wcy9hcHAueG1sUEsBAhQDFAAAAAgAuyTJXBZTFO8YAQAAXAIAABEAAAAAAAAAAAAAAIABwwAAAGRvY1Byb3BzL2NvcmUueG1sUEsBAhQDFAAAAAgAuyTJXHU+mWnqBQAAjBoAABMAAAAAAAAAAAAAAIABCgIAAHhsL3RoZW1lL3RoZW1lMS54bWxQSwECFAMUAAAACAC7JMlcBva0PZ0OAACyjwAAGAAAAAAAAAAAAAAAgIElCAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1sUEsBAhQDFAAAAAgAuyTJXLN39ZXIBAAAs0EAAA0AAAAAAAAAAAAAAIAB+BYAAHhsL3N0eWxlcy54bWxQSwECFAMUAAAACAC7JMlcl4q7HMAAAAATAgAACwAAAAAAAAAAAAAAgAHrGwAAX3JlbHMvLnJlbHNQSwECFAMUAAAACAC7JMlcaL+8w3EBAABnAgAADwAAAAAAAAAAAAAAgAHUHAAAeGwvd29ya2Jvb2sueG1sUEsBAhQDFAAAAAgAuyTJXCQem6KtAAAA+AEAABoAAAAAAAAAAAAAAIABch4AAHhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzUEsBAhQDFAAAAAgAuyTJXGWQeZIZAQAAzwMAABMAAAAAAAAAAAAAAIABVx8AAFtDb250ZW50X1R5cGVzXS54bWxQSwUGAAAAAAkACQA+AgAAoSAAAAAA';
async function downloadStructureTemplateForTaskExact(task){
  if(!window.JSZip) throw new Error('JSZip is not loaded');
  const zip = await window.JSZip.loadAsync(STRUCTURE_TEMPLATE_BASE64_V145, { base64: true });
  const sheetPath = 'xl/worksheets/sheet1.xml';
  const sharedPath = 'xl/sharedStrings.xml';
  const sheetFile = zip.file(sheetPath);
  const sharedFile = zip.file(sharedPath);
  if(!sheetFile) throw new Error('Structure template sheet is missing');
  if(!sharedFile) throw new Error('Structure template shared strings are missing');
  let sheetXml = await sheetFile.async('string');
  let sharedXml = await sharedFile.async('string');
  const campaignCode = campaignCodeForTask(task);
  const creativeCode = templateCreativeLinkCodeForTask({ ...task, campaignCode });
  const writerCode = contentWriterCodeForTask(task);
  const writerName = task.assignedToName || task.userName || task.assigneeName || '';
  const creativeName = task.creative || task.product || (task.taskType || '').replace(/^طلب\s*هيكل\s*-?/i, '').trim() || '';
  const campaign = campaignRecordForTask(task) || {};
  const campaignName = task.campaignName || task.campaignTitle || task.campaign || campaign.campaignName || campaign.name || '';
  const campaignTypeName = task.campaignTypeName || task.campaignType || task.typeName || task.type || campaign.campaignTypeName || campaign.campaignType || campaign.typeName || campaign.type || '';
  const creativeShortCode = creativeShortCodeForName(creativeName);
  const creativeRow = creativeAssignmentForStructureRow(campaign, task, { creativeShortCode, taskNo: creativeCode });
  const mainRole = creativeDepartmentRole(creativeName || creativeRow?.creative || '');
  const roleTask = assignmentForRoleFromCreativeRow(creativeRow, mainRole) || {};
  const deptCode = roleCode(mainRole);
  const execUserCodes = uniqueList([...(Array.isArray(roleTask.userCodes) ? roleTask.userCodes : []), ...userCodesForTask(roleTask)]).filter(Boolean).join(',');
  // القالب ينزل فارغ من أي Brief سابق. نملأ فقط بيانات السيستم المطلوبة، والباقي يكتبه كاتب المحتوى.
  const patches = {
    // صفوف بيانات السيستم في أول القالب: العناوين في B والقيم في C.
    // السيستم يملأ حقول الربط فقط، وباقي حقول الـ brief تفضل فاضية للكاتب.
    A1: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
    A35: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
    B2: 'اسم الحملة', C2: campaignName || '',
    B3: 'كود الحملة', C3: campaignCode || '',
    B4: 'كود الكرييتيف', C4: creativeCode || '',
    B5: 'كود الكرييتيف المختصر', C5: creativeShortCode || '',
    B6: 'الكرييتيف المطلوب للهيكل', C6: creativeName || '',
    B7: 'كاتب المحتوى', C7: writerName || '',
    B8: 'كود كاتب المحتوى', C8: writerCode || '',
    B9: 'نوع الحمله', C9: campaignTypeName || '',
    B9: 'معنى العنصر داخل MZJ', C9: '',
    B10: 'دور العنصر في تعزيز الثقة', C10: '',
    B11: 'الهدف الاستراتيجي للحملة', C11: '',
    B12: 'الهدف النهائي للحملة', C12: '',
    B13: 'الترجمة الملموسة للهدف النهائي', C13: '',
    B14: 'الرسالة الرئيسية', C14: '',
    B15: 'إحساس الحملة', C15: '',
    B16: 'الترجمة التنفيذية لإحساس الحملة', C16: '',
    B17: 'نوع المحتوى', C17: '',
    B18: 'زاوية المحتوى', C18: '',
    B19: 'ما يجب إبرازه', C19: '',
    B20: 'الترجمة التنفيذية لما يجب إبرازه', C20: '',
    B21: 'ما يجب تجنبه', C21: '',
    B22: 'CTA', C22: ''
  };
  // تفريغ أي بيانات محتوى تجريبية من القالب. العناوين تبقى موجودة، والقيم يكتبها كاتب المحتوى.
  ['C9','C10','C11','C12','C13','C14','C15','C16','C17','C18','C19','C20','C21','C22'].forEach(addr => { patches[addr] = patches[addr] || ''; });
  let patchedWorkbook = patchWorkbookCellsWithSharedStrings(sheetXml, sharedXml, patches);
  sheetXml = patchedWorkbook.sheetXml;
  sharedXml = patchedWorkbook.sharedXml;
  const writerPrefix = writerCode || 'N';
  // أعمدة أكواد الربط داخل جدول التنفيذ.
  let headerPatch = patchWorkbookCellsWithSharedStrings(sheetXml, sharedXml, { M36: 'كود الكرييتيف المختصر', N36: 'كود القسم', O36: 'كود اليوزر', P36: 'كود كاتب المحتوى' });
  sheetXml = headerPatch.sheetXml; sharedXml = headerPatch.sharedXml;
  for(let index = 0; index < 50; index += 1){
    const rowNumber = 37 + index;
    const n = String(index + 1).padStart(2, '0');
    // نوع الحملة ورقم التاسك فقط من السيستم. باقي خلايا الجدول فاضية للكاتب.
    patchedWorkbook = patchWorkbookCellsWithSharedStrings(sheetXml, sharedXml, { [`A${rowNumber}`]: index === 0 ? (campaignTypeName || '') : '' });
    sheetXml = patchedWorkbook.sheetXml; sharedXml = patchedWorkbook.sharedXml;
    const fullTaskCode = creativeCode ? `${creativeCode}-${creativeShortCode}-${deptCode}-${execUserCodes || writerPrefix}-${writerPrefix}${n}` : '';
    patchedWorkbook = patchWorkbookCellsWithSharedStrings(sheetXml, sharedXml, { [`C${rowNumber}`]: fullTaskCode, [`M${rowNumber}`]: creativeShortCode, [`N${rowNumber}`]: deptCode, [`O${rowNumber}`]: execUserCodes || writerPrefix, [`P${rowNumber}`]: writerPrefix });
    sheetXml = patchedWorkbook.sheetXml; sharedXml = patchedWorkbook.sharedXml;
    const rowBlankPatches = {}; ['B','D','E','F','G','H','I','J','K','L'].forEach(col => { rowBlankPatches[`${col}${rowNumber}`] = ''; });
    patchedWorkbook = patchWorkbookCellsWithSharedStrings(sheetXml, sharedXml, rowBlankPatches);
    sheetXml = patchedWorkbook.sheetXml; sharedXml = patchedWorkbook.sharedXml;
  }
  zip.file(sheetPath, sheetXml);
  zip.file(sharedPath, sharedXml);
  const out = await zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileBase = safeStorageSegment([creativeCode, creativeName || 'هيكل'].filter(Boolean).join('-'));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(out);
  a.download = `${fileBase || 'campaign-structure'}-template.xlsx`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 700);
  showToast('تم تحميل قالب الهيكل بنفس تنسيق القالب وبالأكواد.');
}

function downloadStructureTemplateForTaskLegacy(taskId){
  const task = findTaskById(taskId);
  if(!task) return showToast('تعذر العثور على تاسك الهيكل.');
  if(!window.XLSX) return showToast('مكتبة Excel لم يتم تحميلها.');
  const campaignCode = campaignCodeForTask(task);
  const creativeCode = templateCreativeLinkCodeForTask(task);
  const writerCode = contentWriterCodeForTask(task);
  const creator = task.assignedToName || task.userName || '';
  const creativeName = task.creative || task.product || (task.taskType || '').replace(/^طلب\s*هيكل\s*-?/i, '').trim() || '';
  const topRows = [
    ['قالب هيكل حملة - MZJ Workspace', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['بيانات الأكواد للربط التلقائي', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['كود الحملة', campaignCode, '', 'كود الكرييتيف', creativeCode, '', 'اسم الكرييتيف', creativeName, '', 'كاتب المحتوى', creator, '', 'كود كاتب المحتوى', writerCode, '', ''],
    ['تعليمات مهمة', 'اكتب صفوف الهيكل بأي عدد. الصف الذي يحتوي على كود فقط بدون بيانات محتوى سيتم تجاهله عند الرفع.', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['صيغة كود تاسك الهيكل', creativeCode ? `${creativeCode}-${writerCode}01` : '', '', 'كود الربط التلقائي', creativeCode, '', 'ملاحظة', 'لا تغير كود الكرييتيف، ويمكن نسخ نمط الكود للصفوف الجديدة.', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Campaign Logic - منطق الحملة', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['اكتب هنا منطق الحملة، زاوية الرسالة، الجمهور المستهدف، عرض البيع أو الفكرة الأساسية.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Writing Rules - قواعد كتابة المحتوى', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['اكتب هنا قواعد كتابة المحتوى: النبرة، الكلمات الممنوعة، طريقة CTA، شكل العناوين، وأي تعليمات عامة للكاتب.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['جدول تاسكات الهيكل', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ];
  const rows = structureTemplateRowsForTask(task, 50);
  const tableHeaderRow = topRows.length + 1;
  const ws = XLSX.utils.aoa_to_sheet(topRows);
  XLSX.utils.sheet_add_json(ws, rows, { origin: `A${tableHeaderRow}`, skipHeader: false });
  const tableLastRow = tableHeaderRow + rows.length;
  ws['!cols'] = [
    {wch:24},{wch:28},{wch:16},{wch:34},{wch:18},{wch:18},{wch:20},{wch:24},{wch:24},{wch:30},{wch:24},{wch:34},{wch:34},{wch:34},{wch:20},{wch:28}
  ];
  ws['!rows'] = Array.from({ length: tableLastRow }, (_, index) => {
    if(index === 0) return { hpt: 28 };
    if([10, 15, 20].includes(index)) return { hpt: 24 };
    if(index >= 11 && index <= 18) return { hpt: 36 };
    if(index === tableHeaderRow - 1) return { hpt: 30 };
    return { hpt: 22 };
  });
  ws['!merges'] = [
    { s:{r:0,c:0}, e:{r:0,c:15} },
    { s:{r:2,c:0}, e:{r:2,c:15} },
    { s:{r:4,c:1}, e:{r:4,c:15} },
    { s:{r:10,c:0}, e:{r:10,c:15} },
    { s:{r:11,c:0}, e:{r:13,c:15} },
    { s:{r:15,c:0}, e:{r:15,c:15} },
    { s:{r:16,c:0}, e:{r:18,c:15} },
    { s:{r:20,c:0}, e:{r:20,c:15} }
  ];
  ws['!freeze'] = { xSplit: 0, ySplit: tableHeaderRow };
  ws['!autofilter'] = { ref: `A${tableHeaderRow}:P${tableLastRow}` };
  ws['!rightToLeft'] = true;
  applyStructureTemplateStyles(ws, tableHeaderRow, tableLastRow);
  const wb = XLSX.utils.book_new();
  wb.Workbook = wb.Workbook || {};
  wb.Workbook.Views = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, ws, 'محتوى الحملة');
  const fileBase = safeStorageSegment([creativeCode, task.creative || task.product || 'هيكل'].filter(Boolean).join('-'));
  XLSX.writeFile(wb, `${fileBase || 'campaign-structure'}-template.xlsx`, { bookType: 'xlsx', cellStyles: true });
  showToast('تم تحميل قالب الهيكل بالأكواد.');
}


function closeStructureReviewPopup(){
  document.querySelectorAll('.structure-review-popup').forEach(el => el.remove());
}
function openStructureReviewPopup(taskId){
  const task = findTaskById(taskId);
  if(!task) return showToast('تعذر العثور على الهيكل.');
  const structure = taskStructure(task);
  const admin = isCurrentUserAdmin();
  const popup = document.createElement('div');
  popup.className = 'structure-review-popup';
  popup.innerHTML = `<div class="structure-review-backdrop" data-close-structure-review></div><section class="structure-review-dialog" role="dialog" aria-modal="true"><div class="structure-review-head"><div><h3>مراجعة الهيكل</h3><p>${escapeHtml(task.campaignName || task.campaign || task.taskType || '')}</p></div><button type="button" class="task-modal-close" data-close-structure-review>×</button></div><div class="structure-review-body">${renderStructureWorkbookTable(task, structure, admin)}</div><div class="structure-review-actions"><button type="button" class="btn btn-light" data-close-structure-review>إغلاق</button>${admin ? `<button type="button" class="btn btn-primary" data-structure-approve="${escapeHtml(task.id)}">اعتماد الهيكل</button>` : ''}</div></section>`;
  document.body.appendChild(popup);
}
function renderStructureSection(task){
  if(!isCampaignStructureTask(task)) return '';
  const admin = isCurrentUserAdmin();
  const structure = taskStructure(task);
  const status = structure.status || '';
  const notes = Array.isArray(structure.notes) ? structure.notes : [];
  const rows = Array.isArray(structure.parsedRows) ? structure.parsedRows : [];
  const sheetTables = structureSheetTables(structure);
  const distributionRows = structureDistributionRows(structure);
  const hasStructureFile = Boolean(structure.fileData || structure.fileName || structure.fileSize || sheetTables.length || rows.length || distributionRows.length);
  const canUpload = !admin && (!status || status === 'needs_changes' || status === 'revised');
  const canApproveStructure = admin && hasStructureFile && status !== 'approved' && status !== 'distributed';
  const notesHtml = notes.length ? `<div class="structure-notes-list"><h4>ملاحظات الأدمن</h4>${notes.map(note => `<div class="structure-note"><b>${escapeHtml(note.field || 'ملاحظة')}</b><p>${escapeHtml(note.note || '')}</p></div>`).join('')}</div>` : '';
  return `<div class="modal-section structure-section"><div class="modal-section-title"><h3>هيكل الحملة</h3><span>${escapeHtml(structureStatusLabel(status))}</span></div>
    <div class="structure-actions">
      <button class="btn btn-light" type="button" data-download-structure-template="${escapeHtml(task.id)}">تحميل قالب الهيكل بالأكواد</button>
      ${canUpload ? `<button class="btn btn-primary" type="button" data-upload-structure="${escapeHtml(task.id)}">إرفاق هيكل الحملة Excel</button>` : ''}
      ${hasStructureFile ? `<span class="structure-file-name structure-attached-label">تم إرفاق الهيكل</span>${structure.fileName ? `<span class="structure-file-name">${escapeHtml(structure.fileName)}</span>` : ''}` : '<span class="structure-file-name muted">لم يتم رفع الهيكل</span>'}
      ${structure.fileData ? `<a class="btn btn-light" href="${escapeHtml(structure.fileData)}" download="${escapeHtml(structure.fileName || 'campaign-structure.xlsx')}">تحميل الملف المرفوع</a>` : ''}
      ${hasStructureFile ? `<button class="btn btn-primary" type="button" data-open-structure-review="${escapeHtml(task.id)}">${admin ? 'مراجعة الهيكل' : 'عرض الهيكل'}</button>` : ''}
    </div>
    ${notesHtml}
    ${!admin && hasStructureFile && status !== 'approved' && status !== 'distributed' ? `<div class="structure-uploaded-message">تم رفع الهيكل. في انتظار مراجعة الأدمن.</div>` : ''}
    ${admin && !hasStructureFile ? '' : ''}
    ${admin && (status === 'approved' || status === 'distributed') ? `<div class="structure-approved-distribution"><div class="structure-approved-message">تم اعتماد الهيكل. ابدأ توزيع تاسكات الهيكل على اليوزرات.</div>${structureAssigneeTable(task)}</div>` : ''}
  </div>`;
}

function buildTaskDetailHtml(task){
  const campaign = campaignForTask(task);
  const admin = isCurrentUserAdmin();
  const steps = Array.isArray(task.steps) && task.steps.length ? task.steps : taskStepTemplate(task.departmentRole || 'other');
  const progress = taskProgress(task);
  const isContentTask = isCampaignContentWritingTask(task);
  const isStructureGenerated = !!task.structureRow;
  const campaignDate = campaign.campaign_date || campaign.campaignDate || campaign.createdAt || '';
  const endDate = campaign.publishSchedule?.slice?.(-1)?.[0]?.date || campaign.campaignEndDate || campaign.publishEndDate || campaign.endDate || campaign.publish_end_date || '';
  const startDate = campaign.publishStartDate || campaign.publish_start_date || campaign.campaign_date || campaign.startDate || '';
  const requiredDate = taskRequiredDate(task, campaign);
  const requiredLeft = daysUntilRequiredText(requiredDate);
  const writerBrief = normalizeText(task.contentWriterBrief || task.campaignRequestBrief || campaign.content_writer_brief || campaign.contentWriterBrief || '');
  const campaignGoalDisplay = campaign.campaign_goal || campaign.campaignGoal || task.campaign_goal || task.campaignGoal || '—';
  const waitingDependency = isTaskWaitingForDependency(task);
  const receiveAction = waitingDependency
    ? '<span class="btn btn-light static-chip waiting-chip">في انتظار اعتماد الهيكل</span>'
    : `<button type="button" class="btn btn-light receive-action ${task.received || task.receivedConfirmed ? 'done' : ''}" data-toggle-received="${escapeHtml(task.id)}">${task.received || task.receivedConfirmed ? 'تم الاستلام' : 'تأكيد الاستلام'}</button>`;
  const taskBriefBoxes = [];
  if(!isContentTask) taskBriefBoxes.push(`<div class="brief-box"><span>رقم التاسك</span><strong>${escapeHtml(structureTaskNumber(task) || '—')}</strong></div>`);
  taskBriefBoxes.push(`<div class="brief-box"><span>نوع المحتوى</span><strong>${escapeHtml(taskContentType(task) || '—')}</strong></div>`);
  taskBriefBoxes.push(`<div class="brief-box"><span>نوع التاسك</span><strong>${escapeHtml(task.taskType || '—')}</strong></div>`);
  taskBriefBoxes.push(`<div class="brief-box"><span>الكريتيف</span><strong>${escapeHtml(task.creative || task.product || '—')}</strong></div>`);
  if(task.upstreamUserLabel) taskBriefBoxes.push(`<div class="brief-box"><span>تابع لمحتوى</span><strong>${escapeHtml(task.upstreamUserLabel)}</strong></div>`);
  taskBriefBoxes.push(`<div class="brief-box"><span>السيارة المختارة</span><strong>${escapeHtml(task.selectedCar || task.carName || '')}</strong></div>`);
  const contentRequiredBox = isContentTask ? `<div class="campaign-info-box wide"><span>المطلوب من كاتب المحتوى</span><strong>${escapeHtml(writerBrief || '—')}</strong></div>` : '';
  const structureDataHtml = task.structureRow ? `<div class="modal-section structure-task-data"><div class="modal-section-title"><h3>بيانات تاسك الهيكل</h3></div><div class="structure-task-grid"><div><span>نوع المحتوى</span><strong>${escapeHtml(taskContentType(task) || '—')}</strong></div><div><span>الهدف</span><strong>${escapeHtml(task.structureRow.goal || '—')}</strong></div><div><span>الهدف الملموس</span><strong>${escapeHtml(task.structureRow.tangibleGoal || '—')}</strong></div><div><span>الفكرة</span><strong>${escapeHtml(task.structureRow.idea || '—')}</strong></div><div><span>وصف المحتوى</span><strong>${escapeHtml(task.structureRow.description || '—')}</strong></div><div><span>الرسالة</span><strong>${escapeHtml(task.structureRow.message || '—')}</strong></div><div><span>زاوية المحتوى</span><strong>${escapeHtml(task.structureRow.contentAngle || '—')}</strong></div><div><span>الترجمة التنفيذية لما يجب إبرازه</span><strong>${escapeHtml(task.structureRow.highlightTranslation || '—')}</strong></div><div><span>المطلوب من الكاتب</span><strong>${escapeHtml(task.structureRow.writerRequest || '—')}</strong></div><div><span>CTA</span><strong>${escapeHtml(task.structureRow.cta || '—')}</strong></div></div></div>` : '';
  const finalSection = progress >= 100 ? `<div class="modal-section attachment-section final-upload-section"><div class="modal-section-title"><h3>الملف النهائي</h3><span>متاح</span></div><button type="button" class="btn btn-primary" data-upload-task-attachment="final">رفع الملف النهائي</button><div id="taskUploadProgressInline" class="task-upload-progress-inline"></div>${renderAttachmentTable(task, 'final')}</div>` : '';
  return `<div class="task-detail-fullscreen">
    <div class="task-top-layout">
      <div class="task-title-card"><div><span>التاسك والمطلوب</span><h2>${shortTaskName(task)}</h2><p>${escapeHtml([campaign.campaignName || campaign.name, campaign.campaignCode || task.campaignCode].filter(Boolean).join(' · '))}</p></div><button type="button" class="mini-btn task-close-btn" data-close-task-modal>إغلاق</button></div>
      <div class="campaign-top-card"><div class="modal-section-title"><h3>بيانات الحملة</h3></div>
        <div class="required-date-banner"><span>التاريخ المطلوب</span><strong>${formatDateShort(requiredDate)}</strong><em>${escapeHtml(requiredLeft)}</em></div>
        <div class="campaign-info-compact">
          <div class="campaign-info-box"><span>التاريخ</span><strong>${formatDateShort(campaignDate)}</strong></div>
          <div class="campaign-info-box"><span>كود الحملة</span><strong>${escapeHtml(campaign.campaignCode || task.campaignCode || '—')}</strong></div>
          <div class="campaign-info-box"><span>اسم الحملة</span><strong>${escapeHtml(campaign.campaignName || campaign.name || '—')}</strong></div>
          <div class="campaign-info-box"><span>نوع الحملة</span><strong>${escapeHtml(campaign.campaignType || campaign.campaign_type || '—')}</strong></div>
          <div class="campaign-info-box"><span>هدف الحملة</span><strong>${escapeHtml(campaignGoalDisplay)}</strong></div>
          <div class="campaign-info-box"><span>بداية الحملة</span><strong>${formatDateShort(startDate)}</strong></div>
          <div class="campaign-info-box"><span>نهاية الحملة</span><strong>${formatDateShort(endDate)}</strong></div>
          ${contentRequiredBox}
        </div>
      </div>
    </div>
    <div class="modal-section task-brief-row task-brief-row-compact">${taskBriefBoxes.join('')}</div>
    ${structureDataHtml}
    ${renderStructureSection(task)}
    <div class="modal-section task-actions-section compact-actions-section">
      <div class="modal-section-title"><h3>إجراءات التكليف</h3><span>${progress}%</span></div>
      <div class="receive-action-row">${receiveAction}</div>
      <div class="modal-progress"><span style="width:${Math.min(100,progress)}%"></span></div>
      <div class="modal-steps-grid">${steps.map((step, index) => `<button type="button" class="workflow-step ${step.done ? 'done' : ''}" data-task-step="${escapeHtml(task.id)}" data-step-index="${index}" ${step.adminOnly && !admin ? 'disabled' : ''}><span>${escapeHtml(step.label)}</span><strong>${Number(step.percent || 0)}%</strong>${step.adminOnly ? '<em>أدمن فقط</em>' : ''}</button>`).join('')}</div>
    </div>
    <div class="task-files-two-cols">
      <div class="modal-section attachment-section review-upload-section"><div class="modal-section-title"><h3>ملفات المراجعة</h3><span>متاح دائمًا</span></div><button type="button" class="btn btn-light" data-upload-task-attachment="review">رفع ملف للمراجعة</button>${renderAttachmentTable(task, 'review')}</div>
      ${finalSection}
    </div>
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
        const dependencyLinks = Array.isArray(task.dependencyLinks) ? task.dependencyLinks : [];
        const assigneeDependencyLinks = dependencyLinks.filter(link => (Array.isArray(link.montageUserIds) ? link.montageUserIds : []).includes(resolvedUserId) || (Array.isArray(link.montageUserNames) ? link.montageUserNames : []).includes(resolvedUserName));
        const assigneeUpstreamIds = assigneeDependencyLinks.length ? uniqueList(assigneeDependencyLinks.map(link => link.contentUserId).filter(Boolean)) : (Array.isArray(task.upstreamUserIds) ? task.upstreamUserIds : []);
        const assigneeUpstreamNames = assigneeDependencyLinks.length ? uniqueList(assigneeDependencyLinks.map(link => link.contentUserName).filter(Boolean)) : (Array.isArray(task.upstreamUserNames) ? task.upstreamUserNames : []);
        const assigneeUpstreamLabel = assigneeUpstreamNames.length ? assigneeUpstreamNames.join('، ') : (task.upstreamUserLabel || '');
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
            campaignGoal: payload.campaign_goal || payload.campaignGoal || '',
            campaign_goal: payload.campaign_goal || payload.campaignGoal || '',
            creativeLinkCode: creativeLinkCodeForIndex(payload.campaignCode || '', creativeIndex),
            campaignCreativeCode: creativeLinkCodeForIndex(payload.campaignCode || '', creativeIndex),
            creativeShortCode: creativeRow.creativeShortCode || creativeShortCodeForName(creativeRow.creative || ''),
            departmentCode: task.departmentCode || roleCode(task.departmentRole || role),
            userCodes: task.userCodes || userCodesForTask(task),
            creative: creativeRow.creative || '',
            product: creativeRow.product || '',
            selectedCars: unit.car ? [unit.car] : [],
            selectedCar: selectedCarLabel,
            contentSectionId: task.contentSectionId || '',
            contentSectionName: sectionName,
            taskType: task.taskType || '',
            requiredDate: task.requiredDate || '',
            dueDate: task.requiredDate || '',
            structureDeadline: task.structureDeadline || payload.structure_deadline || payload.structureDeadline || '',
            contentWriterBrief: task.contentWriterBrief || payload.content_writer_brief || payload.contentWriterBrief || '',
            campaignRequestBrief: task.campaignRequestBrief || payload.content_writer_brief || payload.contentWriterBrief || '',
            needsStructureUpload: !!task.needsStructureUpload,
            sourceRequestStep: task.departmentRole === 'content' ? 'campaign_request_data' : '',
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
            departmentRole: task.departmentRole || role,
            dependencyRole: task.dependencyRole || '',
            waitingForApproval: !!task.waitingForApproval,
            waitingForApprovalLabel: task.waitingForApprovalLabel || '',
            upstreamRole: task.upstreamRole || '',
            upstreamUserIds: assigneeUpstreamIds,
            upstreamUserNames: assigneeUpstreamNames,
            upstreamUserLabel: assigneeUpstreamLabel,
            dependsOnContentUserIds: assigneeUpstreamIds.length ? assigneeUpstreamIds : (Array.isArray(task.dependsOnContentUserIds) ? task.dependsOnContentUserIds : []),
            dependsOnContentUserNames: assigneeUpstreamNames.length ? assigneeUpstreamNames : (Array.isArray(task.dependsOnContentUserNames) ? task.dependsOnContentUserNames : []),
            dependencyLinks: assigneeDependencyLinks,
            received: false,
            progress: 0,
            steps: taskStepTemplate(role),
            status: task.status || 'pending',
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


function creativeLinkCodeForIndex(campaignCode, creativeIndex){
  const base = normalizeText(campaignCode || '');
  if(!base) return '';
  return `${base}-C${String((Number(creativeIndex) || 0) + 1).padStart(2, '0')}`;
}

function campaignRecordForTask(task){
  const campaignId = normalizeText(task?.campaignId || task?.campaign_id || task?.campaignDocId || '');
  if(campaignId){
    const byId = (campaigns || []).find(item => normalizeText(item.id || item.docId || item.campaignId || '') === campaignId);
    if(byId) return byId;
  }
  const code = normalizeText(task?.campaignCode || task?.campaign_code || '');
  if(code){
    const byCode = (campaigns || []).find(item => normalizeText(campaignCodeText(item) || item.campaignCode || item.campaign_code || '') === code);
    if(byCode) return byCode;
  }
  return null;
}
function campaignCodeForTask(task){
  const direct = normalizeText(task?.campaignCode || task?.campaign_code || '');
  if(direct) return direct.toUpperCase();
  const campaign = campaignRecordForTask(task);
  const fromCampaign = normalizeText(campaignCodeText(campaign) || campaign?.campaignCode || campaign?.campaign_code || '');
  return fromCampaign ? fromCampaign.toUpperCase() : '';
}
function creativeIndexForTask(task){
  const direct = Number(task?.creativeIndex);
  if(Number.isFinite(direct) && direct >= 0) return direct;
  const campaign = campaignRecordForTask(task);
  const creativeName = identityClean(task?.creative || task?.product || task?.taskType || '').replace(identityClean('طلب هيكل'), '').trim();
  const list = Array.isArray(campaign?.creatives) ? campaign.creatives : [];
  if(creativeName && list.length){
    const found = list.findIndex(item => identityClean(item?.creative || item?.product || item?.taskType || '').includes(creativeName) || creativeName.includes(identityClean(item?.creative || item?.product || item?.taskType || '')));
    if(found >= 0) return found;
  }
  const copyIndex = Number(task?.taskCopyIndex || task?.copyIndex || 1) - 1;
  return Number.isFinite(copyIndex) && copyIndex >= 0 ? copyIndex : 0;
}
function templateCreativeLinkCodeForTask(task){
  const direct = normalizeText(task?.creativeLinkCode || task?.campaignCreativeCode || task?.creativeTaskCode || task?.structureCreativeLinkCode || extractCreativeLinkCodeFromTaskNo(task?.structureTaskNo || task?.taskNo || task?.structureRow?.taskNo || '')).toUpperCase();
  if(direct) return direct;
  const campaignCode = campaignCodeForTask(task);
  return creativeLinkCodeForIndex(campaignCode, creativeIndexForTask(task)).toUpperCase();
}
function extractCreativeLinkCodeFromTaskNo(value){
  const clean = normalizeText(value || '').toUpperCase();
  if(!clean) return '';
  const match = clean.match(/^(.+-C\d{2,})(?:-.+)?$/i);
  return match ? match[1] : '';
}
function extractCreativeShortCodeFromTaskNo(value){
  const clean = normalizeText(value || '').toUpperCase();
  if(!clean) return '';
  const known = MZJ_CREATIVE_SHORT_CODES.map(([, code]) => normalizeText(code).toUpperCase()).sort((a,b) => b.length - a.length);
  return known.find(code => clean.includes(`-${code}-`) || clean.endsWith(`-${code}`)) || '';
}
function extractDepartmentCodeFromTaskNo(value){
  const clean = normalizeText(value || '').toUpperCase();
  const found = ['MONTAGE','DESIGN','PHOTO','CONTENT'].find(code => clean.includes(`-${code}-`) || clean.endsWith(`-${code}`));
  return found || '';
}
function taskCreativeLinkCode(task){
  const direct = normalizeText(task?.creativeLinkCode || task?.campaignCreativeCode || task?.creativeTaskCode || task?.structureCreativeLinkCode || extractCreativeLinkCodeFromTaskNo(task?.structureTaskNo || task?.taskNo || task?.structureRow?.taskNo || '')).toUpperCase();
  if(direct) return direct;
  return templateCreativeLinkCodeForTask(task);
}


function ensureCreativeExecutionTasksForPayload(payload){
  const rows = Array.isArray(payload?.creatives) ? payload.creatives : [];
  rows.forEach(row => {
    const tasks = Array.isArray(row.tasks) ? row.tasks : [];
    row.tasks = tasks;
    const assignments = row.departmentAssignments && typeof row.departmentAssignments === 'object' ? row.departmentAssignments : {};
    ['montage','shooting','design'].forEach(role => {
      const already = row.tasks.some(task => normalizeDepartmentRole(task.departmentRole || task.contentSectionName || '') === role);
      if(already) return;
      const assignment = assignments[role] || assignments[roleCode(role)] || null;
      const userIds = Array.isArray(assignment?.userIds) ? assignment.userIds.filter(Boolean) : [];
      const userNames = Array.isArray(assignment?.userNames) ? assignment.userNames.filter(Boolean) : [];
      if(!userIds.length && !userNames.length) return;
      row.tasks.push({
        contentSectionId: role,
        contentSectionName: defaultRoleSectionName(role),
        taskType: creativeMainTaskType(row.creative || row.product || '', role),
        quantity: Math.max(1, Math.min(50, Number(row.quantity || 1))),
        requiredDate: '',
        requiredDateTime: '',
        structureDeadline: '',
        needsStructureUpload: false,
        userIds,
        userNames,
        userCodes: Array.isArray(assignment?.userCodes) && assignment.userCodes.length ? assignment.userCodes : userCodesForTask({ userIds, userNames }),
        departmentRole: role,
        departmentCode: assignment?.departmentCode || roleCode(role),
        creativeShortCode: row.creativeShortCode || creativeShortCodeForName(row.creative || row.product || ''),
        waitingForApproval: true,
        waitingForApprovalLabel: 'في انتظار اعتماد الهيكل',
        structureLinkPending: true,
        status: 'waiting_structure'
      });
    });
  });
  return payload;
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
    clean.status = clean.status || 'pending';
    clean.attachments = [];
    return clean;
  });
}

function buildStructureTaskFromRow(campaign, parentTask, row, assigneeId, rowIndex, publishMeta = {}){
  const user = findUserByAnyIdentity([assigneeId]) || {};
  const resolvedUserId = user.id || user.uid || assigneeId || '';
  const resolvedUserName = userName(user) || assigneeId || 'غير محدد';
  const dep = departmentForUser(resolvedUserId || resolvedUserName) || {};
  const sectionName = canonicalContentLabel(dep.name || user.department || parentTask.assignedDepartmentName || parentTask.contentSectionName || '');
  const role = normalizeDepartmentRole(sectionName || dep.name || user.department || parentTask.departmentRole || '');
  const taskType = row.contentType || row.contentName || row.idea || 'تاسك من الهيكل';
  const taskNo = normalizeText(row.taskNo || '');
  const structureCreativeLinkCode = extractCreativeLinkCodeFromTaskNo(taskNo) || taskCreativeLinkCode(parentTask) || '';
  const creativeShortCode = normalizeText(row.creativeShortCode || extractCreativeShortCodeFromTaskNo(taskNo) || parentTask.creativeShortCode || creativeShortCodeForName(parentTask.creative || parentTask.product || '')).toUpperCase();
  const departmentCode = normalizeText(row.departmentCode || extractDepartmentCodeFromTaskNo(taskNo) || roleCode(role)).toUpperCase();
  const effectiveRole = roleFromCode(departmentCode) || role;
  const taskLabel = structureContentTaskLabel(row, taskType);
  const searchKeys = uniqueList([resolvedUserId, user.id, user.uid, user.email, user.emailLower, resolvedUserName, user.name, user.displayName, user.username].filter(Boolean));
  return normalizeCampaignTask({
    id: `${campaign.id}-structure-${Date.now()}-${rowIndex + 1}-${identityClean(resolvedUserId || assigneeId).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,24) || Math.random().toString(36).slice(2)}`,
    campaignId: campaign.id,
    campaignName: campaign.campaignName || campaign.name || '',
    campaignCode: campaign.campaignCode || campaign.campaign_code || '',
    creativeLinkCode: structureCreativeLinkCode,
    campaignCreativeCode: structureCreativeLinkCode,
    structureCreativeLinkCode,
    creativeShortCode,
    departmentCode,
    userCodes: uniqueList(String(row.userCodes || row.userCode || '').split(/[،,|/\s]+/).filter(Boolean)),
    creative: parentTask.creative || parentTask.product || creativeNameFromShortCode(creativeShortCode) || taskLabel,
    product: row.idea || row.contentName || row.description || row.contentType || parentTask.product || '',
    taskNo,
    structureTaskNo: taskNo,
    structureTaskLabel: taskLabel,
    contentSectionId: dep.id || parentTask.contentSectionId || parentTask.assignedDepartmentId || '',
    contentSectionName: sectionName,
    taskType,
    structureGenerated: true,
    parentStructureTaskId: parentTask.id,
    structureRow: row,
    platforms: publishMeta.platforms || [],
    platform: publishMeta.platform || '',
    platformTypes: publishMeta.platformTypes || {},
    platformPublishing: publishMeta.platformPublishing || [],
    postType: publishMeta.postType || '',
    postTypeLabel: publishMeta.postTypeLabel || '',
    requiredDimensions: publishMeta.requiredDimensions || null,
    publishDate: publishMeta.publishDate || '',
    date: publishMeta.date || publishMeta.publishDate || '',
    caption: publishMeta.caption || '',
    hashtags: publishMeta.hashtags || publishMeta.hashtagsText || '',
    hashtagsText: publishMeta.hashtagsText || publishMeta.hashtags || '',
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
    assignedDepartmentId: dep.id || parentTask.contentSectionId || parentTask.assignedDepartmentId || '',
    assignedDepartmentName: sectionName,
    departmentRole: effectiveRole,
    requiredDate: parentTask.requiredDate || parentTask.dueDate || '',
    dueDate: parentTask.requiredDate || parentTask.dueDate || '',
    received: false,
    receivedConfirmed: false,
    progress: 0,
    steps: taskStepTemplate(effectiveRole),
    status: 'pending',
    attachments: [],
    source: 'campaign-structure-distribution'
  }, campaign);
}

function taskIdentityKeysForUser(task){
  return uniqueIdentityKeys([
    task?.userId, task?.userUid, task?.userEmail, task?.userName,
    task?.assigneeUid, task?.assigneeName, task?.assigneeEmail,
    task?.assignedToUid, task?.assignedToId, task?.assignedToName, task?.assignedToEmail,
    task?.displayName, task?.username, task?.searchKeys, task?.assignedToSearch
  ]);
}
function taskUserIdentityOverlaps(a, b){
  const left = taskIdentityKeysForUser(a);
  const right = taskIdentityKeysForUser(b);
  return left.some(key => right.includes(key));
}
function taskDependsOnParentContent(task, parentTask){
  const parentKeys = uniqueIdentityKeys([
    parentTask?.userId, parentTask?.userUid, parentTask?.userName, parentTask?.userEmail,
    parentTask?.assigneeUid, parentTask?.assigneeName, parentTask?.assigneeEmail,
    parentTask?.assignedToUid, parentTask?.assignedToId, parentTask?.assignedToName, parentTask?.assignedToEmail,
    parentTask?.displayName, parentTask?.username, parentTask?.searchKeys, parentTask?.assignedToSearch
  ]);
  const dependencyKeys = uniqueIdentityKeys([
    task?.upstreamUserIds, task?.upstreamUserNames, task?.upstreamUserLabel,
    task?.dependsOnContentUserIds, task?.dependsOnContentUserNames,
    Array.isArray(task?.dependencyLinks) ? task.dependencyLinks.map(link => [link.contentUserId, link.contentUserName]) : []
  ]);
  return !dependencyKeys.length || parentKeys.some(key => dependencyKeys.includes(key));
}
function taskCreativeMatchesParent(task, parentTask){
  const parentCreative = identityClean(parentTask?.creative || parentTask?.product || '');
  const taskCreative = identityClean(task?.creative || task?.product || '');
  if(!parentCreative || !taskCreative) return true;
  return parentCreative === taskCreative || parentCreative.includes(taskCreative) || taskCreative.includes(parentCreative);
}
function waitingTaskMatchesStructureAddition(existing, addition, parentTask){
  if(!existing || !addition || existing.id === parentTask?.id) return false;
  if(existing.structureGenerated || existing.parentStructureTaskId) return false;
  const existingRole = normalizeDepartmentRole(existing.departmentRole || existing.assignedDepartmentName || existing.contentSectionName || '');
  const additionRole = normalizeDepartmentRole(addition.departmentRole || addition.assignedDepartmentName || addition.contentSectionName || '');
  if(existingRole !== additionRole) return false;
  if(!['montage','design','shooting','publish','other'].includes(existingRole)) return false;
  const existingCampaign = normalizeText(existing.campaignId || existing.campaignCode || '');
  const additionCampaign = normalizeText(addition.campaignId || addition.campaignCode || parentTask?.campaignId || parentTask?.campaignCode || '');
  if(existingCampaign && additionCampaign && existingCampaign !== additionCampaign) return false;
  const existingLinkCode = taskCreativeLinkCode(existing);
  const additionLinkCode = taskCreativeLinkCode(addition);
  if(existingLinkCode && additionLinkCode) return existingLinkCode === additionLinkCode;
  if(!taskCreativeMatchesParent(existing, parentTask)) return false;
  return !!(existing.waitingForApproval || existing.status === 'waiting_content_approval' || existing.status === 'waiting_structure' || isTaskWaitingForDependency(existing) || taskUserIdentityOverlaps(existing, addition));
}
function mergeStructureAdditionIntoExistingTask(existing, addition, parentTask){
  const keepId = existing.id;
  const keepSteps = Array.isArray(existing.steps) && existing.steps.length ? existing.steps : addition.steps;
  const keepAttachments = Array.isArray(existing.attachments) ? existing.attachments : [];
  return {
    ...existing,
    userId: addition.userId || existing.userId || '',
    userUid: addition.userUid || existing.userUid || '',
    userName: addition.userName || existing.userName || '',
    userEmail: addition.userEmail || existing.userEmail || '',
    assigneeUid: addition.assigneeUid || existing.assigneeUid || '',
    assigneeName: addition.assigneeName || existing.assigneeName || '',
    assigneeEmail: addition.assigneeEmail || existing.assigneeEmail || '',
    assignedToUid: addition.assignedToUid || existing.assignedToUid || '',
    assignedToId: addition.assignedToId || existing.assignedToId || '',
    assignedToName: addition.assignedToName || existing.assignedToName || '',
    assignedToEmail: addition.assignedToEmail || existing.assignedToEmail || '',
    displayName: addition.displayName || existing.displayName || '',
    username: addition.username || existing.username || '',
    assignedToSearch: addition.assignedToSearch || existing.assignedToSearch || [],
    searchKeys: addition.searchKeys || existing.searchKeys || [],
    assignedDepartmentId: addition.assignedDepartmentId || existing.assignedDepartmentId || '',
    assignedDepartmentName: addition.assignedDepartmentName || existing.assignedDepartmentName || '',
    contentSectionId: addition.contentSectionId || existing.contentSectionId || '',
    contentSectionName: addition.contentSectionName || existing.contentSectionName || '',
    departmentRole: addition.departmentRole || existing.departmentRole || '',
    creativeLinkCode: taskCreativeLinkCode(addition) || taskCreativeLinkCode(existing) || '',
    campaignCreativeCode: taskCreativeLinkCode(addition) || taskCreativeLinkCode(existing) || '',
    structureCreativeLinkCode: addition.structureCreativeLinkCode || taskCreativeLinkCode(addition) || existing.structureCreativeLinkCode || '',
    product: addition.product || existing.product || '',
    taskType: addition.taskType || existing.taskType || '',
    taskNo: addition.taskNo || existing.taskNo || '',
    structureTaskNo: addition.structureTaskNo || existing.structureTaskNo || '',
    structureTaskLabel: addition.structureTaskLabel || existing.structureTaskLabel || '',
    structureGenerated: true,
    parentStructureTaskId: parentTask?.id || addition.parentStructureTaskId || existing.parentStructureTaskId || '',
    structureRow: addition.structureRow || existing.structureRow || null,
    platforms: addition.platforms || existing.platforms || [],
    platform: addition.platform || existing.platform || '',
    platformTypes: addition.platformTypes || existing.platformTypes || {},
    platformPublishing: addition.platformPublishing || existing.platformPublishing || [],
    postType: addition.postType || existing.postType || '',
    postTypeLabel: addition.postTypeLabel || existing.postTypeLabel || '',
    requiredDimensions: addition.requiredDimensions || existing.requiredDimensions || null,
    publishDate: addition.publishDate || existing.publishDate || '',
    date: addition.date || existing.date || '',
    caption: addition.caption || existing.caption || '',
    hashtags: addition.hashtags || existing.hashtags || '',
    hashtagsText: addition.hashtagsText || existing.hashtagsText || '',
    selectedCar: addition.selectedCar || existing.selectedCar || '',
    selectedCars: Array.isArray(addition.selectedCars) && addition.selectedCars.length ? addition.selectedCars : (existing.selectedCars || []),
    waitingForApproval: false,
    waitingForApprovalLabel: '',
    dependencyRole: '',
    dependencyReleasedAt: new Date().toISOString(),
    dependencyReleasedByTaskId: parentTask?.id || '',
    received: false,
    receivedConfirmed: false,
    progress: 0,
    steps: keepSteps,
    status: 'pending',
    attachments: keepAttachments,
    id: keepId,
    campaignId: existing.campaignId || addition.campaignId || parentTask?.campaignId || '',
    source: 'campaign-structure-distribution-linked',
    updatedAt: new Date().toISOString()
  };
}

async function saveStructureDistribution(taskId){
  const task = findTaskById(taskId);
  const campaign = campaignForTask(task);
  if(!task || !campaign?.id) return showToast('تعذر العثور على التاسك.');
  const rows = [...document.querySelectorAll(`#taskModal .structure-assign-row`)];
  const additions = [];
  rows.forEach((rowEl) => {
    const index = Number(rowEl.dataset.structureRow || 0);
    const sourceRow = structureDistributionRows(taskStructure(task))[index];
    if(!sourceRow) return;
    const publishMeta = selectedStructurePublishMeta(rowEl);
    const legacyAssignee = rowEl.querySelector('select.js-structure-assignee')?.value || '';
    const autoAssignees = autoAssigneesForStructureRow(campaign, task, sourceRow);
    const assignees = uniqueList((publishMeta.assignees || []).length ? publishMeta.assignees : (autoAssignees.length ? autoAssignees : [legacyAssignee].filter(Boolean)));
    if(assignees.length){
      const savedMeta = { ...publishMeta, assignees, distributionSaved: true, assignmentSaved: true };
      writeStructureRowMeta(rowEl, savedMeta);
      assignees.forEach((assignee) => additions.push(buildStructureTaskFromRow(campaign, task, sourceRow, assignee, index, savedMeta)));
    }
  });
  if(!additions.length) return showToast('لم يتم العثور على يوزرات مربوطة بالكرييتيف. راجع اختيار اليوزرات في خطوة تحديد الكرييتيف أو أكواد اليوزرات في القالب.');

  const usedExistingIndexes = new Set();
  const nextTasks = (campaign.departmentTasks || []).map(item => item.id === task.id ? { ...item, structure: { ...taskStructure(item), status: 'distributed', distributedAt: new Date().toISOString() } } : item);
  let linkedCount = 0;
  let createdCount = 0;

  additions.forEach(addition => {
    const existingIndex = nextTasks.findIndex((existing, index) => !usedExistingIndexes.has(index) && waitingTaskMatchesStructureAddition(existing, addition, task));
    if(existingIndex >= 0){
      nextTasks[existingIndex] = mergeStructureAdditionIntoExistingTask(nextTasks[existingIndex], addition, task);
      usedExistingIndexes.add(existingIndex);
      linkedCount += 1;
    }else{
      nextTasks.push(addition);
      createdCount += 1;
    }
  });

  await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaign.id).update({ departmentTasks: nextTasks, taskCount: nextTasks.length, updatedAt: serverTime() });
  document.querySelectorAll('#taskModal .structure-assign-row').forEach(rowEl => {
    const meta = readStructureRowMeta(rowEl);
    if((meta.assignees || []).length){
      writeStructureRowMeta(rowEl, { ...meta, distributionSaved: true, assignmentSaved: true });
    }
  });
  if(linkedCount && !createdCount) showToast('تم ربط الهيكل بالتاسكات الموجودة وتم التوزيع.');
  else if(linkedCount && createdCount) showToast(`تم ربط ${linkedCount} تاسك موجود وإنشاء ${createdCount} تاسك جديد وتم التوزيع.`);
  else showToast('تم توزيع تاسكات الهيكل.');
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
  const hadReviewNotes = Array.isArray(prev.notes) && prev.notes.length;
  const hadReviewMarks = Array.isArray(prev.marks) && prev.marks.length;
  const status = (prev.status === 'needs_changes' || hadReviewNotes || hadReviewMarks) ? 'revised' : 'pending_review';
  const nextStructure = {
    ...prev,
    status,
    fileName: file.name,
    fileSize: file.size,
    fileData,
    parsedRows,
    sheetTables,
    notes: [],
    marks: [],
    reviewedAt: '',
    reviewClearedAt: new Date().toISOString(),
    uploadedAt: new Date().toISOString(),
    uploadedBy: getCurrentUser().email || getCurrentUser().name || ''
  };
  await updateTaskOnFirebase(task.id, { structure: encodeStructureWorkbookForFirestore(nextStructure) });
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
  const cellValue = cellEl.dataset.cellValue || (task ? structureCellValueFromStoredTable(taskStructure(task), sheetName, rowIndex, colIndex) : '');
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
  const domCell = document.querySelector(`[data-structure-cell="${CSS.escape(String(taskId))}"][data-sheet-name="${CSS.escape(String(sheetName))}"][data-row-index="${CSS.escape(String(rowIndex))}"][data-col-index="${CSS.escape(String(colIndex))}"]`);
  const cellValue = domCell?.dataset.cellValue || structureCellValueFromStoredTable(structure, sheetName, rowIndex, colIndex);
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
async function setStructureRowReviewStatus(taskId, rowKey, status){
  const task = findTaskById(taskId);
  if(!task || !rowKey) return;
  const structure = taskStructure(task);
  const rowReviewStatuses = { ...(structure.rowReviewStatuses || {}) };
  rowReviewStatuses[rowKey] = normalizeStructureRowReviewStatus(status);
  await updateTaskOnFirebase(task.id, { structure: encodeStructureWorkbookForFirestore({ ...structure, rowReviewStatuses, status: structure.status === 'approved' ? 'pending_review' : (structure.status || 'pending_review'), reviewedAt: new Date().toISOString(), reviewedBy: getCurrentUser().email || getCurrentUser().name || '' }) });
  const popup = document.querySelector('.structure-review-popup');
  if(popup){
    const row = popup.querySelector(`[data-structure-review-row="${CSS.escape(String(rowKey))}"]`);
    if(row){
      row.querySelectorAll('[data-set-structure-row-status]').forEach(btn => {
        const active = normalizeStructureRowReviewStatus(btn.dataset.setStructureRowStatus) === rowReviewStatuses[rowKey];
        btn.classList.toggle('active', active);
        btn.classList.toggle('success', active && rowReviewStatuses[rowKey] === 'approved');
        btn.classList.toggle('warn', active && rowReviewStatuses[rowKey] === 'needs_changes');
        btn.classList.toggle('danger', active && rowReviewStatuses[rowKey] === 'rejected');
      });
    }
  }
  showToast('تم تحديث حالة الصف.');
}
async function setStructureStatus(taskId, status){
  const task = findTaskById(taskId);
  if(!task) return;
  let structure = taskStructure(task);
  if(status === 'approved' && structure.fileData && !structureRowsWithReviewStatus(structure).length){
    try{
      showToast('جاري قراءة صفوف الهيكل...');
      const parsed = await parseStructureDataUrl(structure.fileData);
      structure = { ...structure, sheetTables: parsed.sheetTables || structureSheetTables(structure), parsedRows: parsed.parsedRows || [], reparsedAt: new Date().toISOString() };
    }catch(error){
      console.error('Structure approve parse error', error);
    }
  }
  let finalStatus = status;
  let approvedRows = Array.isArray(structure.approvedRows) ? structure.approvedRows : [];
  let rowsCount = 0;
  if(status === 'approved'){
    const reviewedRows = structureRowsWithReviewStatus(structure);
    approvedRows = reviewedRows.filter(row => normalizeStructureRowReviewStatus(row.reviewStatus) === 'approved');
    rowsCount = approvedRows.length;
    const hasNeedsChanges = reviewedRows.some(row => normalizeStructureRowReviewStatus(row.reviewStatus) === 'needs_changes');
    if(!rowsCount && hasNeedsChanges) finalStatus = 'needs_changes';
    if(!rowsCount && !hasNeedsChanges) finalStatus = 'pending_review';
    structure = { ...structure, approvedRows };
  }
  await updateTaskOnFirebase(task.id, { structure: encodeStructureWorkbookForFirestore({ ...structure, status: finalStatus, reviewedAt: new Date().toISOString(), reviewedBy: getCurrentUser().email || getCurrentUser().name || '' }) });
  if(status === 'approved'){
    if(rowsCount) showToast(`تم اعتماد ${rowsCount} صف مقبول للتوزيع.`);
    else if(finalStatus === 'needs_changes') showToast('تم حفظ الصفوف المطلوبة للتعديل. يقدر كاتب المحتوى يرفع الهيكل مرة أخرى.');
    else showToast('لا توجد صفوف مقبولة للتوزيع. اختار مقبول لصف واحد على الأقل أو راجع صفوف نوع المحتوى.');
  }
}

function getFormData(form){
  const data = {};
  if(!form) return data;
  new FormData(form).forEach((value, key) => {
    let cleaned = normalizeText(value);
    if(key === 'structure_deadline') cleaned = (cleaned.match(/\d{4}-\d{2}-\d{2}/) || [''])[0] || cleaned;
    data[key] = cleaned;
  });
  return data;
}
function readSelectText(select){
  const text = select?.selectedOptions?.[0]?.textContent?.trim() || '';
  return text.startsWith('اختر') ? '' : text;
}


function campaignHasAssignedTasks(payload){
  return (payload.creatives || []).some(row => (row.tasks || []).some(task => {
    const ids = Array.isArray(task.userIds) ? task.userIds.filter(Boolean) : [];
    const names = Array.isArray(task.userNames) ? task.userNames.filter(Boolean) : [];
    return ids.length || names.length;
  }));
}
function campaignDepartmentSummaries(payload){
  const labels = {content:'قسم المحتوى', shooting:'قسم التصوير', design:'قسم التصميم', montage:'قسم المونتاج', publish:'قسم النشر'};
  const out = { content:'', shooting:'', design:'', montage:'', publish:'' };
  (payload.creatives || []).forEach(row => (row.tasks || []).forEach(task => {
    const role = task.departmentRole || normalizeDepartmentRole(task.contentSectionName || task.assignedDepartmentName || '');
    if(!out.hasOwnProperty(role)) return;
    const users = uniqueList([...(Array.isArray(task.userNames) ? task.userNames : []), ...(Array.isArray(task.userIds) ? task.userIds : [])].filter(Boolean));
    const line = [row.creative || row.product || '', users.join('، '), task.requiredDate || task.dueDate || ''].filter(Boolean).join(' / ');
    if(line) out[role] = uniqueList([out[role], line].filter(Boolean).flatMap(x => String(x).split(' | '))).join(' | ');
  }));
  return {
    content_department: out.content,
    shooting_department: out.shooting,
    design_department: out.design,
    montage_department: out.montage,
    publish_department: out.publish,
    departmentSummary: out
  };
}
function collectCampaignRows(){
  return [...document.querySelectorAll('#creativeRows .creative-row-card')].flatMap(row => {
    const panels = [...row.querySelectorAll('.creative-assignment-panel')].map(syncPanelDynamicState);
    const cars = selectedCarsFromRow(row);
    if(panels.length){
      return panels.map(panel => {
        const creative = normalizeText(panel.dataset.creativeName || '');
        const qty = Math.max(1, Math.min(50, Number(panel.querySelector('.js-creative-quantity')?.value || 1)));
        const structureRequestTask = requestStructureTaskForCreative(creative, qty);
        const tasks = [structureRequestTask, ...['montage','design','shooting'].map(role => selectedRoleTaskFromPanel(panel, role))].filter(Boolean);
        return {
          creative,
          creativeShortCode: creativeShortCodeForName(creative),
          quantity: qty,
          tasks,
          departmentAssignments: Object.fromEntries(tasks.map(t => [normalizeDepartmentRole(t.departmentRole || t.contentSectionName || ''), { userIds: t.userIds || [], userNames: t.userNames || [], userCodes: t.userCodes || [], departmentCode: t.departmentCode || roleCode(t.departmentRole || '') }]).filter(([role]) => role)),
          product: creativeProductLabel(creative, panel),
          selectedCars: cars,
          workflowMode: 'creative_user_wizard',
          assignmentMode: 'per_creative_full_binding'
        };
      }).filter(item => item.creative || item.tasks.length || item.product || item.selectedCars.length);
    }
    const roleTasks = ['content','montage','design','shooting'].map(role => selectedRoleTaskFromRow(row, role)).filter(Boolean);
    const legacyTasks = [...row.querySelectorAll('.creative-task-block')].map(block => {
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
    const tasks = roleTasks.length ? roleTasks : legacyTasks;
    const selectedCreatives = selectedCreativeNames(row);
    if(!selectedCreatives.length && !tasks.length && !cars.length) return [];
    const creativesToSave = selectedCreatives.length ? selectedCreatives : [''];
    return creativesToSave.map(creative => ({
      creative,
      creativeShortCode: creativeShortCodeForName(creative),
      tasks,
      departmentAssignments: Object.fromEntries(tasks.map(t => [normalizeDepartmentRole(t.departmentRole || t.contentSectionName || ''), { userIds: t.userIds || [], userNames: t.userNames || [], userCodes: t.userCodes || [], departmentCode: t.departmentCode || roleCode(t.departmentRole || '') }]).filter(([role]) => role)),
      product: creativeProductLabel(creative, row),
      selectedCars: cars,
      workflowMode: 'creative_user_wizard'
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
      platformPublishing: collectPublishPlatformPublishing(card),
      platformTypes: Object.fromEntries(collectPublishPlatformPublishing(card).map(item => [item.platform, item.postType || ''])),
      postType: selectedPublishPostType(card).value,
      postTypeLabel: selectedPublishPostType(card).label,
      requiredDimensions: selectedPublishPostType(card).value ? { width: selectedPublishPostType(card).width, height: selectedPublishPostType(card).height } : null,
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
      <div class="publish-card-section publish-card-section-output"><span class="publish-section-label">1. اختيار البوست</span><select class="js-publish-output-select compact-select" aria-label="اختيار النشر">${makePublishOutputOptions(outputs, currentOutput)}</select></div>
      <div class="publish-card-section publish-card-section-platforms"><span class="publish-section-label">2. المنصات وأنواع النشر والأبعاد</span><button type="button" class="mini-btn publish-platform-popup-btn" data-open-publish-platform-popup>اختيار المنصات</button><div class="publish-platform-summary js-publish-platform-summary">${publishPlatformSummaryHtml(prev)}</div><input type="hidden" class="js-publish-platform-publishing-json" value="${escapeHtml(JSON.stringify(prev.platformPublishing || []))}"><div class="publish-platform-checks publish-platform-type-list hidden" aria-label="المنصات ونوع المنشور">${publishPlatformRowsHtml(prev)}</div></div>
      <div class="publish-card-section publish-card-section-caption"><span class="publish-section-label">3. الكابشن والهاشتاج</span><input type="hidden" class="js-publish-caption" value="${escapeHtml(prev.caption || '')}" />
      <input type="hidden" class="js-publish-hashtags" value="${escapeHtml(prev.hashtagsText || prev.hashtags || '')}" />
      <div class="publish-copy-buttons">
        <button type="button" class="mini-btn publish-copy-btn ${prev.caption ? 'filled' : ''}" data-publish-caption-btn>الكابشن${prev.caption ? ' ✓' : ''}</button>
        <button type="button" class="mini-btn publish-copy-btn ${prev.hashtagsText || prev.hashtags ? 'filled' : ''}" data-publish-hashtags-btn>الهاشتاج${prev.hashtagsText || prev.hashtags ? ' ✓' : ''}</button>
      </div></div>
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
    platformPublishing: collectPublishPlatformPublishing(card),
    platformTypes: Object.fromEntries(collectPublishPlatformPublishing(card).map(item => [item.platform, item.postType || ''])),
    postType: selectedPublishPostType(card).value,
    postTypeLabel: selectedPublishPostType(card).label,
    requiredDimensions: selectedPublishPostType(card).value ? { width: selectedPublishPostType(card).width, height: selectedPublishPostType(card).height } : null,
    time: '',
    caption: normalizeText(card.querySelector('.js-publish-caption')?.value),
    hashtagsText: normalizeText(card.querySelector('.js-publish-hashtags')?.value),
    hashtags: extractHashtags(`${card.querySelector('.js-publish-hashtags')?.value || ''} ${card.querySelector('.js-publish-caption')?.value || ''}`),
    note: ''
  })).filter(item => item.date || item.output || item.platform || item.postType || item.caption || item.hashtagsText);
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
  const publishStartDateValue = request.publish_start_date || document.getElementById('publishStartDate')?.value || '';
  const publishEndDateValue = request.publish_end_date || document.getElementById('publishEndDate')?.value || '';
  const typeItem = campaignTypes.find(type => type.id === document.getElementById('campaignTypeSelect')?.value || type.name === document.getElementById('campaignTypeSelect')?.value);
  const freshCampaignCode = typeItem ? nextCampaignCodeForType(typeItem) : '';
  if(freshCampaignCode && document.getElementById('campaignCodeInput')) document.getElementById('campaignCodeInput').value = freshCampaignCode;
  const campaignCode = freshCampaignCode || document.getElementById('campaignCodeInput')?.value || '';
  const monthlyBaseCode = campaignMonthlyBaseCode(typeItem || {}, new Date());
  const campaignMonthlySequence = campaignCodeSequenceFromBase(campaignCode, monthlyBaseCode) || 1;
  const payload = {
    ...request,
    campaignCode,
    campaignCodeId: typeItem?.id || '',
    campaignTypeId: typeItem?.id || request.campaign_type_id || '',
    campaignCodePrefix: typeItem?.prefix || '',
    campaignCodeShortCode: typeItem?.code || '',
    campaignSerial: campaignMonthlySequence,
    campaignType: typeItem?.name || request.campaign_type || '',
    campaign_type: typeItem?.name || request.campaign_type || '',
    publishStartDate: publishStartDateValue,
    publishEndDate: publishEndDateValue,
    campaignStartDate: publishStartDateValue,
    campaignEndDate: publishEndDateValue,
    startDate: publishStartDateValue,
    endDate: publishEndDateValue,
    creatives: collectCampaignRows(),
    publishSchedule: collectPublishRows(),
    budgetItems: collectBudgetRows(),
    name: request.campaign_name || campaignCode || 'حملة جديدة',
    campaignName: request.campaign_name || '',
    status: 'draft',
    source: 'mzj-marketing-spa',
    updatedAt: serverTime(),
    createdAt: serverTime()
  };
  ensureCreativeExecutionTasksForPayload(payload);
  // مهم: لا نحفظ ملخصات الأقسام كحقول Top-level هنا لأن قواعد Firestore الحالية
  // تسمح فقط بمفاتيح محددة داخل marketing_campaigns. التلخيص يظهر في قاعدة البيانات
  // من departmentTasks مباشرة، وبكده الحفظ لا يقع في permission-denied.
  if(!campaignHasAssignedTasks(payload)){
    showToast('الحملة لم تُحفظ: لازم تختار كريتيف وتحدد يوزر واحد على الأقل من يوزرات كتابة المحتوى أو الأقسام التنفيذية.');
    campaignWizardSetStep(2);
    return;
  }
  try{
    const docRef = safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc();
    const departmentTasks = buildDepartmentTasks(docRef.id, payload);
    if(!departmentTasks.length){
      showToast('الحملة لم تُحفظ: الربط لم ينتج أي تاسكات. افتح ربط الكريتيفات واختار اليوزرات مرة تانية.');
      campaignWizardSetStep(2);
      return;
    }
    const finalPayload = { ...payload, id: docRef.id, departmentTasks, taskCount: departmentTasks.length };
    await docRef.set(finalPayload);
    const localCampaign = { ...finalPayload };
    campaigns = [localCampaign, ...campaigns.filter(item => item.id !== docRef.id)];
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

function createCampaignCreativeRow(openNow = false){
  const creativeRows = document.getElementById('creativeRows');
  if(!creativeRows) return null;
  clearEmptyRow(creativeRows);
  let card = creativeRows.querySelector('.creative-row-card');
  if(!card){
    card = document.createElement('article');
    card.className = 'creative-row-card compact-creative-row';
    card.innerHTML = `
      <div class="creative-row-head creative-popup-row-head">
        <button class="btn btn-primary open-creative-assignment-popup" type="button">اختيار الكريتيفات واليوزرات</button>
        <button class="delete-row" type="button" aria-label="حذف الصف">×</button>
      </div>
      <div class="creative-main-select creative-checkbox-picker creative-hidden-storage"><span>اختيار الكريتيفات</span><div class="creative-checkbox-grid">${creativeCheckboxList()}</div></div>
      <div class="selected-creative-assignments creative-hidden-storage"><div class="empty-state mini-empty">اختار كريتيف واحد أو أكثر من Popup الربط.</div></div>
      <label class="creative-product-field product-under-creatives"><span>ملخص الربط</span><input class="product-output js-product-output" type="text" readonly aria-label="ملخص الربط" placeholder="اضغط اختيار الكريتيفات واليوزرات" /></label>
      <label class="car-picker-enable"><input type="checkbox" class="js-enable-cars"> <span>اختيار سيارات من الاستوك</span></label><div class="car-picker-block is-hidden"><div class="car-picker-title">اختيار السيارات</div><div class="car-checkbox-grid">${carCheckboxList()}</div></div>
      <div class="creative-waiting-note">نافذة الربط تفتح تلقائيًا من خطوة الكريتيفات والمهام. كل كريتيف لازم يتربط كامل باليوزرات المطلوبة.</div>`;
    creativeRows.appendChild(card);
    refreshDynamicSelects();
    renderPublishAgenda();
  }
  if(openNow) setTimeout(() => openCreativeAssignmentPopup(card), 40);
  return card;
}

function bindCampaignBuilder(){
  const creativeRows = document.getElementById('creativeRows'); const budgetRows = document.getElementById('budgetRows');
  document.getElementById('addCreativeBtn')?.addEventListener('click', () => createCampaignCreativeRow(true));
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
    const structurePopupBtn = event.target.closest('[data-open-structure-distribution-popup]');
    if(structurePopupBtn){ openStructureDistributionPopup(structurePopupBtn.closest('.structure-assign-row')); return; }
    if(event.target.closest('[data-close-structure-distribution-popup]')){ closeStructureDistributionPopup(); return; }
    if(event.target.closest('[data-save-structure-distribution-popup]')){ saveStructureDistributionPopup(); return; }
    const creativePopupBtn = event.target.closest('.open-creative-assignment-popup');
    if(creativePopupBtn){ openCreativeAssignmentPopup(creativePopupBtn.closest('.creative-row-card')); return; }
    const creativePopupTab = event.target.closest('[data-creative-popup-tab]');
    if(creativePopupTab){
      const modal = creativePopupTab.closest('#creativeAssignmentPopup');
      if(modal){
        setCreativePopupActive(modal, creativePopupTab.dataset.creativePopupTab || creativePopupTab.getAttribute('title') || creativePopupTab.textContent || '');
      }
      return;
    }
    const creativePopupCard = event.target.closest('.popup-creative-check-card');
    if(creativePopupCard){
      event.preventDefault();
      event.stopPropagation();
      const input = creativePopupCard.querySelector('.js-popup-creative-check');
      const modal = creativePopupCard.closest('#creativeAssignmentPopup');
      if(input && modal){
        input.checked = !input.checked;
        if(input.checked){
          modal.dataset.activeCreativeKey = normalizeText(input.value || '');
        }else if(normalizeText(modal.dataset.activeCreativeKey || '') === normalizeText(input.value || '')){
          const next = [...modal.querySelectorAll('.js-popup-creative-check:checked')].find(item => item !== input);
          modal.dataset.activeCreativeKey = normalizeText(next?.value || '');
        }
        refreshCreativePopupPanels(modal);
        creativePopupCard.classList.toggle('is-selected', input.checked);
      }
      return;
    }
    if(event.target.closest('[data-close-creative-assignment-popup]')){ closeCreativeAssignmentPopup(); return; }
    if(event.target.closest('[data-save-creative-assignment-popup]')){ saveCreativeAssignmentPopup(); return; }
    const btn = event.target.closest('.delete-row');
    if(btn){ const container = document.getElementById('creativeRows'); btn.closest('.creative-row-card')?.remove(); restoreEmptyRow(container, 1, 'ابدأ بإضافة كريتيف للحملة.'); renderPublishAgenda(); refreshDynamicSelects(); return; }
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
    if(event.target.matches('.creative-popup-search')){
      const query = normalizeText(event.target.value).toLowerCase();
      const modal = event.target.closest('#creativeAssignmentPopup');
      modal?.querySelectorAll('.popup-creative-check-card').forEach(card => {
        const text = normalizeText(card.dataset.popupCreativeToggle || card.textContent || '').toLowerCase();
        card.classList.toggle('is-filtered-out', !!query && !text.includes(query));
      });
      return;
    }
    if(event.target.matches('.js-budget-ads-count,.js-budget-value')) updateBudgetGrandTotal();
    if(event.target.matches('.structure-assignee-search')) filterStructureAssigneePicker(event.target);
    if(event.target === publishPrepGlobalSearchInput() && getRoute() === 'publish-prep') renderPublishPrepPage();
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
    if(event.target.matches('.js-structure-assignee-checkbox')){ updateStructureAssigneePicker(event.target.closest('.structure-assignee-picker')); return; }
    if(event.target.matches('.js-structure-popup-platform')){ refreshStructurePlatformRow(event.target.closest('.structure-popup-platform-row')); return; }
    if(event.target.matches('.creative-popup-active-select')){ const modal = event.target.closest('#creativeAssignmentPopup'); setCreativePopupActive(modal, event.target.value || ''); return; }
    if(event.target.matches('.js-popup-creative-check')){ const modal = event.target.closest('#creativeAssignmentPopup'); if(event.target.checked) modal.dataset.activeCreativeKey = normalizeText(event.target.value || ''); refreshCreativePopupPanels(modal); return; }
    if(event.target.matches('.js-creative-check')){ const row = event.target.closest('.creative-row-card'); refreshCreativeAssignmentPanels(row); renderPublishAgenda(); refreshDynamicSelects(); return; }
    if(event.target.matches('.js-task-user-checkbox,.js-task-user,.js-car-checkbox,.js-creative-quantity')){ updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); refreshDynamicSelects(); return; }
    if(event.target.matches('.js-budget-ads-count,.js-budget-value')){ updateBudgetGrandTotal(); return; }
    if(event.target.matches('.js-content-dependency-check')){ const box = event.target.closest('.js-content-dependency'); syncContentDependencyState(box); updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); return; }
    if(event.target.matches('.js-content-montage-link-check')){ const panel = event.target.closest('.creative-assignment-panel'); syncContentMontageLinks(panel); applyContentMontageLinksToMontagePicker(panel); updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); return; }
    if(event.target.closest('.js-role-picker')){ const picker = event.target.closest('.js-role-picker'); syncRolePickerState(picker); const panel = picker.closest('.creative-assignment-panel'); if(picker.dataset.role === 'content') refreshContentDependencyPickers(panel); updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); return; }
    if(event.target.matches('.js-publish-output-select')){ updatePublishOutputAvailability(); return; }
    if(event.target.closest('#stockAdvancedFilters')){ renderStock(); return; }
    if(event.target.matches('.js-platform-checkbox')){
      const card = event.target.closest('.publish-day-card');
      let row = event.target.closest('.publish-platform-type-row');
      if(card && !row){
        const box = event.target.closest('.publish-platform-checks');
        const selected = selectedPlatformValues(card);
        if(box && typeof publishPlatformRowsHtml === 'function'){
          box.innerHTML = publishPlatformRowsHtml({ platforms: selected });
          row = [...box.querySelectorAll('.publish-platform-type-row')].find(item => item.querySelector('.js-platform-checkbox')?.value === event.target.value) || null;
        }
      }
      if(row) refreshPublishPlatformTypeRow(row);
      updatePublishPostTypeOptions(card || event.target.closest('.structure-assign-row'));
      if(typeof forceRefreshPublishAgendaPlatformTypes === 'function') forceRefreshPublishAgendaPlatformTypes(card || document);
      const select = row?.querySelector('.js-publish-platform-type-select');
      if(event.target.checked && select){
        select.classList.add('platform-type-flash');
        setTimeout(() => select.classList.remove('platform-type-flash'), 650);
      }
      return;
    }
    if(event.target.matches('.js-publish-platform-type-select,.js-publish-post-type-select')){ return; }
    if(event.target.matches('.js-creative-select,.js-creative-check,.js-task-type,.js-task-required-date')){ updateProductOutput(event.target.closest('.creative-row-card')); renderPublishAgenda(); refreshDynamicSelects(); }
  });
  document.addEventListener('click', event => {
    const stepBtn = event.target.closest('[data-campaign-wizard-target]');
    if(stepBtn){ campaignWizardSetStep(stepBtn.dataset.campaignWizardTarget); return; }
    if(event.target.closest('[data-campaign-wizard-next]')){ campaignWizardMove(1); return; }
    if(event.target.closest('[data-campaign-wizard-prev]')){ campaignWizardMove(-1); return; }
    if(event.target.closest('#campaignWizardSaveShortcut')){ document.getElementById('saveCampaignDraft')?.click(); return; }
  });
  campaignWizardSetStep(1);
  document.getElementById('resetCampaignBuilder')?.addEventListener('click', () => { document.getElementById('campaignRequestForm')?.reset(); if(creativeRows) creativeRows.innerHTML = '<div class="empty-state">اضغط على خطوة الكريتيفات والمهام لفتح نافذة ربط الكريتيفات باليوزرات تلقائيًا.</div>'; const agenda = document.getElementById('publishAgenda'); if(agenda) agenda.innerHTML = '<div class="empty-state">حدد بداية ونهاية النشر ثم اختر كريتيفات ومخرجات التصميم والمونتاج.</div>'; if(budgetRows) budgetRows.innerHTML = '<div class="empty-state">لا توجد بنود ميزانية.</div>'; updateBudgetGrandTotal(); generateCampaignCode(); });
  document.getElementById('saveCampaignDraft')?.addEventListener('click', saveCampaignToFirebase);
}

function resetForm(ids){ ids.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; }); }
function collectionByKind(kind){ return {department: window.MZJ_DEPARTMENTS_COLLECTION, creative: window.MZJ_CREATIVES_COLLECTION, taskType: window.MZJ_TASK_TYPES_COLLECTION, contentSection: window.MZJ_CONTENT_SECTIONS_COLLECTION, campaignCode: window.MZJ_CAMPAIGN_CODES_COLLECTION, campaignType: window.MZJ_CAMPAIGN_TYPES_COLLECTION, orderStatus: window.MZJ_ORDER_STATUSES_COLLECTION, platform: window.MZJ_PLATFORMS_COLLECTION}[kind]; }
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
      const payload = { name, code, prefix, updatedAt: serverTime() };
      if(id) await safeCollection(window.MZJ_CAMPAIGN_TYPES_COLLECTION).doc(id).update(payload);
      else await safeCollection(window.MZJ_CAMPAIGN_TYPES_COLLECTION).add({ ...payload, createdAt: serverTime() });
      event.target.reset(); document.getElementById('campaignTypePrefix').value = 'MZJ'; resetForm(['campaignTypeEditId']); showMessage('campaignTypeMessage', 'تم حفظ نوع الحملة والكود.');
    }catch(error){ console.error(error); showMessage('campaignTypeMessage', 'تعذر حفظ نوع الحملة والكود.'); }
  });
  document.getElementById('platformForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const id = document.getElementById('platformEditId')?.value;
    const name = normalizeText(document.getElementById('platformName')?.value);
    const postTypes = getPlatformPostTypesFromRows();
    if(!name) return;
    if(!mainDb){ showMessage('platformMessage', 'اتصال Firebase غير متاح.'); return; }
    try{
      const payload = { name, postTypes, updatedAt: serverTime() };
      if(id) await safeCollection(window.MZJ_PLATFORMS_COLLECTION).doc(id).update(payload);
      else await safeCollection(window.MZJ_PLATFORMS_COLLECTION).add({ ...payload, createdAt: serverTime() });
      event.target.reset(); resetForm(['platformEditId']); setPlatformPostTypesRows([]); showMessage('platformMessage', 'تم حفظ المنصة.');
    }catch(error){ console.error(error); showMessage('platformMessage', 'تعذر حفظ المنصة.'); }
  });
  ensurePlatformPostTypesUi();
  document.getElementById('platformPostTypesRows')?.addEventListener('input', syncPlatformPostTypesTextarea);
  document.getElementById('platformPostTypesRows')?.addEventListener('click', event => {
    const remove = event.target.closest('[data-remove-platform-post-type]');
    if(!remove) return;
    event.preventDefault();
    const row = remove.closest('.platform-type-row');
    row?.remove();
    const box = document.getElementById('platformPostTypesRows');
    if(box && !box.children.length) addPlatformPostTypeRow();
    syncPlatformPostTypesTextarea();
  });
  bindNamedForm('orderStatusForm', 'orderStatusEditId', 'orderStatusName', 'orderStatusMessage', window.MZJ_ORDER_STATUSES_COLLECTION, 'تم حفظ حالة الطلب.');
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
    const pEdit = event.target.closest('[data-edit-platform]'); if(pEdit){ const item = platforms.find(x => x.id === pEdit.dataset.editPlatform); if(item){ const form = document.getElementById('platformForm'); const details = form?.closest('details'); if(details) details.open = true; document.getElementById('platformEditId').value = item.id; document.getElementById('platformName').value = item.name; setPlatformPostTypesRows(normalizePlatformPostTypes(item.postTypes || item.publishTypes || item.types || []).length ? normalizePlatformPostTypes(item.postTypes || item.publishTypes || item.types || []) : defaultPostTypesForPlatform(item.name)); form?.scrollIntoView({ behavior:'smooth', block:'start' }); } return; }
    const pDel = event.target.closest('[data-delete-platform]'); if(pDel){ await deleteDoc('platform', pDel.dataset.deletePlatform); return; }
    const osEdit = event.target.closest('[data-edit-order-status]'); if(osEdit){ const item = orderStatuses.find(x => x.id === osEdit.dataset.editOrderStatus); if(item){ document.getElementById('orderStatusEditId').value = item.id; document.getElementById('orderStatusName').value = item.name; } return; }
    const osDel = event.target.closest('[data-delete-order-status]'); if(osDel){ await deleteDoc('orderStatus', osDel.dataset.deleteOrderStatus); return; }
    const csEdit = event.target.closest('[data-edit-content-section]'); if(csEdit){ const item = contentSections.find(x => x.id === csEdit.dataset.editContentSection); if(item){ document.getElementById('contentSectionEditId').value = item.id; document.getElementById('contentSectionName').value = item.name; document.getElementById('contentSectionTypes').value = (item.types || []).join('\n'); } return; }
    const csDel = event.target.closest('[data-delete-content-section]'); if(csDel){ await deleteDoc('contentSection', csDel.dataset.deleteContentSection); }
  });
  document.getElementById('cancelDepartmentEdit')?.addEventListener('click', () => { document.getElementById('departmentForm')?.reset(); resetForm(['departmentEditId']); refreshDynamicSelects(); });
  document.getElementById('cancelCreativeEdit')?.addEventListener('click', () => { document.getElementById('creativeForm')?.reset(); resetForm(['creativeEditId']); });
  document.getElementById('cancelTaskTypeEdit')?.addEventListener('click', () => { document.getElementById('taskTypeForm')?.reset(); resetForm(['taskTypeEditId']); });
  document.getElementById('cancelCampaignTypeEdit')?.addEventListener('click', () => { document.getElementById('campaignTypeForm')?.reset(); document.getElementById('campaignTypePrefix').value = 'MZJ'; resetForm(['campaignTypeEditId']); });
  document.getElementById('cancelPlatformEdit')?.addEventListener('click', () => { document.getElementById('platformForm')?.reset(); resetForm(['platformEditId']); setPlatformPostTypesRows([]); });
  document.getElementById('cancelOrderStatusEdit')?.addEventListener('click', () => { document.getElementById('orderStatusForm')?.reset(); resetForm(['orderStatusEditId']); });
  document.getElementById('cancelContentSectionEdit')?.addEventListener('click', () => { document.getElementById('contentSectionForm')?.reset(); resetForm(['contentSectionEditId']); });
  document.getElementById('refreshDepartmentsBtn')?.addEventListener('click', () => { renderDepartments(); renderCreatives(); renderTaskTypes(); renderCampaignTypes(); renderOrderStatuses(); renderContentSections(); });
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
function calendarPlatformKeysForEntry(entry = {}){
  const raw = [];
  if(Array.isArray(entry.platforms)) raw.push(...entry.platforms);
  if(Array.isArray(entry.platformPublishing)) raw.push(...entry.platformPublishing.map(item => item?.platform).filter(Boolean));
  if(entry.platform) raw.push(...String(entry.platform).split(/[،,+\/]/));
  if(entry.platformName) raw.push(entry.platformName);
  if(entry.platformKey) raw.push(entry.platformKey);
  // مهم: لا نقرأ calendarMeta هنا لأنه يحتوي أحيانًا اسم الحملة أو الوقت أو رقم مثل 123،
  // وكان يظهرهم في التقويم كأنهم منصة ثانية.
  const allowed = new Set(['facebook','instagram','tiktok','youtube','snapchat','whatsapp']);
  const keys = raw.map(item => normalizePublishPlatformName(item)).filter(key => allowed.has(key));
  return [...new Set(keys.length ? keys : ['unknown'])];
}
function calendarPlatformLabel(key){
  if(key === 'whatsapp') return 'WhatsApp';
  if(key === 'unknown') return 'غير محدد';
  return socialPlatformLabels[key] || key;
}
function calendarPlatformIcon(key){
  const icons = { facebook:'f', instagram:'◎', tiktok:'♪', youtube:'▶', snapchat:'👻', whatsapp:'☘', unknown:'•' };
  return icons[key] || icons.unknown;
}
function calendarDayPlatformSummary(entries = []){
  const map = {};
  entries.forEach(entry => calendarPlatformKeysForEntry(entry).forEach(key => { map[key] = (map[key] || 0) + 1; }));
  return Object.entries(map).sort((a,b) => b[1] - a[1]);
}
function calendarEntryTitle(entry = {}){
  return normalizeText(entry.calendarTitle || entry.output || entry.postTitle || entry.title || entry.name || entry.campaignName || 'منشور');
}
function calendarPostTypeForPlatform(entry = {}, platformKey = ''){
  if(platformKey && Array.isArray(entry.platformPublishing)){
    const match = entry.platformPublishing.find(item => normalizePublishPlatformName(item?.platform || '') === platformKey);
    if(match) return match.postTypeLabel || postTypeLabel(match.postType || '') || '';
  }
  if(platformKey && entry.platformTypes && typeof entry.platformTypes === 'object'){
    const pair = Object.entries(entry.platformTypes).find(([platform]) => normalizePublishPlatformName(platform) === platformKey);
    if(pair) return postTypeLabel(pair[1] || '') || pair[1] || '';
  }
  return entry.typeLabel || postTypeLabel(entry.type || entry.postType || '') || '';
}
function calendarEntryMeta(entry = {}, platformFilter = ''){
  const keys = calendarPlatformKeysForEntry(entry).filter(key => key !== 'unknown');
  const platformText = platformFilter ? calendarPlatformLabel(platformFilter) : keys.map(calendarPlatformLabel).join(' + ');
  const typeText = calendarPostTypeForPlatform(entry, platformFilter);
  return normalizeText([platformText, typeText, entry.time || entry.scheduleTime || '', entry.campaignName || ''].filter(Boolean).join(' · '));
}
function calendarEntryCaption(entry = {}){
  return normalizeText([entry.caption, entry.hashtagsText || entry.hashtags, entry.note].filter(Boolean).join('\n'));
}
function calendarDayPopupHtml(dateIso, entries = [], platformFilter = ''){
  const date = new Date(`${dateIso}T00:00:00`);
  const title = Number.isNaN(date.getTime()) ? dateIso : date.toLocaleDateString('ar-SA', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const filteredEntries = platformFilter ? entries.filter(entry => calendarPlatformKeysForEntry(entry).includes(platformFilter)) : entries;
  const summary = calendarDayPlatformSummary(entries);
  const summaryHtml = summary.length ? summary.map(([key,count]) => `<span class="calendar-popup-platform platform-${escapeHtml(key)}${platformFilter === key ? ' is-selected' : ''}"><i>${calendarPlatformIcon(key)}</i>${escapeHtml(calendarPlatformLabel(key))}<b>${count}</b></span>`).join('') : '<span class="calendar-popup-empty">لا توجد منشورات في هذا اليوم.</span>';
  const itemsHtml = filteredEntries.length ? filteredEntries.map((entry, index) => {
    const keys = calendarPlatformKeysForEntry(entry);
    const shownKeys = platformFilter ? keys.filter(key => key === platformFilter) : keys;
    const platformsHtml = shownKeys.map(key => `<span class="calendar-popup-mini platform-${escapeHtml(key)}"><i>${calendarPlatformIcon(key)}</i>${escapeHtml(calendarPlatformLabel(key))}</span>`).join('');
    const caption = calendarEntryCaption(entry);
    return `<article class="calendar-popup-item" data-calendar-item-platform="${escapeHtml(platformFilter || shownKeys.join(','))}">
      <div class="calendar-popup-item-head"><strong>${index + 1}. ${escapeHtml(calendarEntryTitle(entry))}</strong><span>${escapeHtml(entry.time || entry.scheduleTime || 'بدون وقت')}</span></div>
      <p>${escapeHtml(calendarEntryMeta(entry, platformFilter) || entry.campaignName || 'نشر مجدول')}</p>
      ${caption ? `<small>${escapeHtml(caption).slice(0, 220)}${caption.length > 220 ? '...' : ''}</small>` : ''}
      <div class="calendar-popup-platforms">${platformsHtml}</div>
    </article>`;
  }).join('') : '<div class="empty-state">لا توجد منشورات لهذه المنصة في هذا اليوم.</div>';
  const shownCount = filteredEntries.length;
  return `<div class="calendar-popup-backdrop" data-close-calendar-popup></div>
    <section class="calendar-popup-dialog" role="dialog" aria-modal="true" aria-label="منشورات اليوم">
      <button class="calendar-popup-close" type="button" data-close-calendar-popup>×</button>
      <div class="calendar-popup-head"><span>${escapeHtml(dateIso)}</span><h2>${escapeHtml(title)}</h2><p>${shownCount} منشور مجدول${platformFilter ? ` · ${escapeHtml(calendarPlatformLabel(platformFilter))}` : ''}</p></div>
      <div class="calendar-popup-summary">${summaryHtml}</div>
      <div class="calendar-popup-list">${itemsHtml}</div>
    </section>`;
}
function openCalendarDayPopup(dateIso, platformFilter = ''){
  const entries = (window.__MZJ_CALENDAR_ENTRIES_BY_DATE__ || {})[dateIso] || [];
  let modal = document.getElementById('calendarDayPopup');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'calendarDayPopup';
    modal.className = 'calendar-popup';
    document.body.appendChild(modal);
  }
  modal.innerHTML = calendarDayPopupHtml(dateIso, entries, platformFilter);
  modal.classList.add('show');
  document.body.classList.add('modal-open');
}
function closeCalendarDayPopup(){
  const modal = document.getElementById('calendarDayPopup');
  if(modal){ modal.classList.remove('show'); modal.innerHTML = ''; }
  document.body.classList.remove('modal-open');
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
  window.__MZJ_CALENDAR_ENTRIES_BY_DATE__ = byDate;
  const cells = [];
  for(let i = 0; i < first.getDay(); i += 1) cells.push('<article class="calendar-day empty"></article>');
  for(let d = 1; d <= last.getDate(); d += 1){
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const date = new Date(year, month, d);
    const dayEntries = byDate[iso] || [];
    const todayIso = todayInputDate();
    const isToday = iso === todayIso;
    const summary = calendarDayPlatformSummary(dayEntries);
    const summaryHtml = summary.map(([key,count]) => `<button type="button" class="calendar-platform-badge platform-${escapeHtml(key)}" data-calendar-platform-day="${escapeHtml(iso)}" data-calendar-platform-key="${escapeHtml(key)}" title="${escapeHtml(calendarPlatformLabel(key))} - ${count} منشور"><i>${calendarPlatformIcon(key)}</i><b>${count}</b></button>`).join('');
    cells.push(`<article class="calendar-day${dayEntries.length ? ' has-items' : ''}${isToday ? ' is-today' : ''}" data-calendar-day="${escapeHtml(iso)}" tabindex="${dayEntries.length ? '0' : '-1'}"${isToday ? ' aria-current="date"' : ''}>
      <div class="calendar-day-top"><span>${date.toLocaleDateString('ar-SA',{weekday:'long'})}</span><div class="calendar-day-number-wrap"><strong>${d}</strong>${isToday ? '<em class="calendar-today-badge">اليوم</em>' : ''}</div></div>
      <small>${iso}</small>
      <div class="calendar-day-summary">${summaryHtml}</div>
    </article>`);
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
  const name = isCampaignWriting ? normalizeText(task.taskType || task.structureTaskLabel || task.creative || 'كتابة محتوى') : normalizeText(task.structureTaskLabel || task.taskType || task.creative || task.product || 'تاسك');
  return escapeHtml(no && !name.includes(no) && !isCampaignWriting ? `${no} - ${name}` : name);
}
function receivedLabel(task){ return isTaskWaitingForDependency(task) ? 'في انتظار اعتماد الهيكل' : (task.received || task.receivedConfirmed ? 'تم الاستلام' : 'لم يستلم'); }
function receivedClass(task){ return isTaskWaitingForDependency(task) ? 'is-structure-waiting' : (task.received || task.receivedConfirmed ? 'is-done' : 'is-waiting'); }
function taskStructureAttached(task){
  const structure = taskStructure(task);
  return Boolean(structure.fileData || structure.fileName || structure.uploadedAt || structure.status === 'pending_review' || structure.status === 'revised' || structure.status === 'approved' || structure.status === 'distributed');
}
function taskStructureAttachedBadge(task){
  return taskStructureAttached(task) ? '<b class="state-chip is-structure-attached">تم إرفاق الهيكل</b>' : '';
}
function campaignStructureAttachedCount(tasks){
  return (tasks || []).filter(task => isCampaignStructureTask(task) && taskStructureAttached(task)).length;
}
function taskOwnerName(task){ return escapeHtml(task.assignedToName || task.assigneeName || task.userName || 'بدون مسؤول'); }
function campaignTasksSnapshot(campaign){
  const related = adminDashboardTasksForCampaign(campaign);
  const received = related.filter(task => task.received || task.receivedConfirmed).length;
  const progress = campaignRequiredProgressFromTasks(related);
  const publish = campaignPublishProgress(campaign);
  const structureAttached = campaignStructureAttachedCount(related);
  return { related, received, progress, publish, total: related.length, structureAttached };
}

function renderUserDashboard(){
  const board = document.getElementById('adminDashboardBoard');
  if(!board) return;
  setDashboardMode('user');
  applyEffectiveTheme();
  const myTasks = getVisibleTasksForCurrentUser();
  const waitingTasks = myTasks.filter(task => isTaskWaitingForDependency(task));
  const readyTasks = myTasks.filter(task => !isTaskWaitingForDependency(task));
  const taskFinalFileUploaded = task => {
    const prepId = `task_${task.id || task.taskId || task.code || ''}`;
    const submission = getPublishPrepSubmissions()[prepId] || {};
    return publishPrepHasFinalFile(task, submission);
  };
  const activeTasks = readyTasks.filter(task => !taskFinalFileUploaded(task));
  const completedTasks = readyTasks.filter(task => taskFinalFileUploaded(task));
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
  const taskCard = (task, completed = false) => {
    const progress = taskProgress(task);
    const waitingDependency = isTaskWaitingForDependency(task);
    const waitingFinal = !completed && !waitingDependency && progress >= 100;
    const statusText = waitingDependency ? (task.waitingForApprovalLabel || 'في انتظار اعتماد الهيكل') : (completed ? 'تم رفع الملف النهائي' : (waitingFinal ? 'ينتظر رفع الملف النهائي' : (task.received || task.receivedConfirmed ? 'مستلم' : 'قيد التنفيذ')));
    const actionHtml = waitingDependency
      ? `<span class="btn btn-light static-chip waiting-chip">قائمة انتظار</span>`
      : (completed
        ? `<span class="btn btn-light done static-chip">تم رفع النهائي</span>`
        : (waitingFinal ? `<span class="btn btn-light done static-chip">ارفع الملف النهائي</span>` : `<button type="button" class="btn btn-light ${task.received || task.receivedConfirmed ? 'done' : ''}" data-toggle-received="${escapeHtml(task.id)}">تم الاستلام</button>`));
    return `<article class="content-task-card ${completed ? 'completed' : ''} ${waitingFinal ? 'waiting-final-file' : ''} ${waitingDependency ? 'waiting-dependency' : ''}">
      <h3>${escapeHtml(task.campaignName || 'حملة')}</h3>
      <p>${shortTaskName(task)}</p>
      <div class="content-task-actions"><button type="button" class="btn btn-light" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(task.campaignId || '')}">تفاصيل</button>${actionHtml}${taskStructureAttachedBadge(task)}</div>
      <div class="task-metric-row"><span>نسبة الإنجاز</span><b>${progress}%</b></div>
      ${waitingDependency ? '' : `<div class="task-metric-row"><span>حالة التاسك</span><b>${statusText}</b></div>`}
      <div class="task-card-progress"><span style="width:${Math.min(100,progress)}%"></span></div>
    </article>`;
  };
  const renderGroups = (items, completed = false) => items.length ? `<div class="content-type-board">${items.map(group => `<section class="content-type-col"><div class="content-type-title"><h3>${escapeHtml(group.label)}</h3><span>${group.tasks.length} تاسك</span></div><div class="content-type-list">${group.tasks.map(task => taskCard(task, completed)).join('')}</div></section>`).join('')}</div>` : '';
  board.innerHTML = `<section class="user-content-dashboard user-content-dashboard-clean">
    <div class="user-dashboard-toolbar user-dashboard-toolbar-clean">
      <div class="user-theme-panel user-theme-panel-floating">
        <label class="user-theme-upload"><input type="file" accept="image/*" id="userThemeImageInput"><span>صورة مرجع الثيم</span></label>
        <button class="mini-btn" type="button" id="clearUserThemeBtn">الثيم الافتراضي</button>
        <button type="button" class="mini-btn" id="toggleCompletedTasksBtn" data-open="0" data-count="${done}">عرض التاسكات المنتهية (${done})</button>
      </div>
    </div>
    <div class="user-pro-hero user-pro-hero-clean"><div><span class="pro-kicker">MZJ Workspace</span><h2>أهلاً ${escapeHtml(getCurrentUserIdentity().name || 'بيك')}</h2><p>تاسكاتك الحالية حسب نوع المحتوى والحملات المسندة لك فقط.</p></div><div class="exec-stats"><span>📌 ${activeTasks.length} تاسك</span><span>⏳ ${waitingTasks.length} قائمة انتظار</span><span>✅ ${received} مستلم</span><span>🏁 ${done} ملف نهائي</span></div></div>
    ${waitingTasks.length ? `<section class="waiting-tasks-panel"><div class="content-type-title"><h3>قائمة انتظار المونتاج/التصميم</h3><span>${waitingTasks.length} تاسك</span></div><div class="content-type-list">${waitingTasks.map(task => taskCard(task, false)).join('')}</div></section>` : ''}
    ${renderGroups(groups, false)}
    <section class="completed-tasks-panel" id="completedTasksPanel" hidden>
      <div class="completed-tasks-head"><h3>التاسكات المنتهية</h3><span>${done} تاسك تم رفع ملفه النهائي</span></div>
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
    <div class="receive-list">${item.related.map(task => `<div><span><b>${shortTaskName(task)}</b><em>${taskOwnerName(task)}</em></span><span class="receive-state-stack"><b class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</b>${taskStructureAttachedBadge(task)}</span></div>`).join('')}</div>
  </article>`;

  const readinessCard = item => `<article class="dash-campaign-card dash-ready-card" data-open-campaign="${escapeHtml(item.campaign.id)}">
    <div class="dash-card-top"><strong>${shortCampaignTitle(item.campaign)}</strong><span>${item.progress}%</span></div>
    <p>${escapeHtml(item.campaign.campaignCode || item.campaign.campaign_code || 'بدون كود')} · ${item.total} تاسك</p>
    ${item.structureAttached ? `<div class="structure-attach-alert">تم إرفاق الهيكل · ${item.structureAttached}</div>` : ''}
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
    <span class="inline-state-stack"><span class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</span>${taskStructureAttachedBadge(task)}</span>
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
    <div class="task-list-state"><span>${taskProgress(task)}%</span><b class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</b>${taskStructureAttachedBadge(task)}</div>
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
  return campaign.publishSchedule?.slice?.(-1)?.[0]?.date || campaign.campaignEndDate || campaign.publishEndDate || campaign.endDate || campaign.publish_end_date || '';
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
  const found = orderStatuses.find(item => item.name === status || item.id === status);
  const map = { draft:'مسودة', pending:'قيد الانتظار', active:'نشطة', archived:'مؤرشفة', done:'منتهية', completed:'مكتملة' };
  return found?.name || map[status] || status || '—';
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
    ['المطلوب من كاتب المحتوى', campaign.content_writer_brief || campaign.contentWriterBrief],
    ['موعد تسليم الهيكل', campaign.structure_deadline || campaign.structureDeadline, true],
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
  </style></head><body><section class="report-head"><div><h1>تقرير بيانات الحملة</h1><strong>${safeTitle}</strong></div><div>تاريخ التصدير: ${escapeHtml(formatDateShort(new Date()))}</div></section><section class="meta"><div><span>تاريخ الحملة</span><strong>${escapeHtml(formatDateShort(campaign.campaign_date || campaign.campaignDate || campaign.createdAt))}</strong></div><div><span>بداية النشر</span><strong>${escapeHtml(formatDateShort(campaignStartPublishDate(campaign)))}</strong></div><div><span>نهاية النشر</span><strong>${escapeHtml(formatDateShort(campaignEndDate(campaign)))}</strong></div><div><span>نوع الحملة</span><strong>${escapeHtml(campaignTypeText(campaign))}</strong></div><div><span>كود الحملة</span><strong>${escapeHtml(campaignCodeText(campaign))}</strong></div><div><span>اسم الحملة</span><strong>${escapeHtml(campaignNameText(campaign))}</strong></div><div><span>هدف الحملة</span><strong>${escapeHtml(campaign.campaign_goal || campaign.campaignGoal || '')}</strong></div><div><span>المطلوب من كاتب المحتوى</span><strong>${escapeHtml(campaign.content_writer_brief || campaign.contentWriterBrief || '')}</strong></div><div><span>موعد تسليم الهيكل</span><strong>${escapeHtml(formatDateShort(campaign.structure_deadline || campaign.structureDeadline))}</strong></div><div><span>رقم مسلسل الحملة</span><strong>${escapeHtml(campaign.campaignSerial || campaign.serial || campaign.sequence || '')}</strong></div></section><h2>كل المطلوب من التاسكات واليوزرات</h2>${printableCompactTable(tasksHtml)}<h2>جدول النشر</h2>${printableCompactTable(renderScheduleSummary(campaign))}<h2>الميزانية</h2>${printableCompactTable(renderBudgetSummary(campaign))}<h2>روابط الحملة</h2>${printableCompactTable(campaignLinksHtml(campaign))}<div class="footer">MZJ Workspace</div><script>window.onload=function(){setTimeout(function(){window.focus();window.print();},250)}<\/script></body></html>`;
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
const socialPlatformLabels = { facebook:'Facebook', instagram:'Instagram', tiktok:'TikTok', youtube:'YouTube', snapchat:'Snapchat' };
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
      if(getRoute() === 'platform-settings') renderPlatformSettingsPage();
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
function postTypeLabel(type){ return {post:'منشور عادي',photo_post:'بوست صور',reel:'ريل',story:'ستوري',hd_video:'فيديو HD',draft:'مسودة فقط'}[type] || type; }
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
    if(low.includes('snapchat') || low.includes('snap chat') || low.includes('snap') || v.includes('سناب')) return 'Snapchat';
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

function prepSchedulePostTypeData(row){
  const platforms = normalizePrepPlatformList(row?.platforms || row?.platform || []);
  const raw = normalizeText(row?.postType || row?.publishType || row?.contentType || row?.type || '');
  let value = raw;
  const low = raw.toLowerCase();
  if(low.includes('photo') || raw.includes('بوست صور') || raw.includes('صورة')) value = 'photo_post';
  else if(low.includes('story') || raw.includes('ستوري')) value = 'story';
  else if(low.includes('hd') || raw.includes('فيديو HD')) value = 'hd_video';
  else if(low.includes('reel') || raw.includes('ريل') || low.includes('short')) value = 'reel';
  const found = publishPostTypeByValue(value, platforms) || { value: row?.postType || '', label: row?.postTypeLabel || '', width: row?.requiredDimensions?.width || null, height: row?.requiredDimensions?.height || null };
  return found.value ? { value:found.value, label:found.label || row?.postTypeLabel || '', width:found.width || row?.requiredDimensions?.width || null, height:found.height || row?.requiredDimensions?.height || null } : { value:'', label:'', width:null, height:null };
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
  const schedulePostType = prepSchedulePostTypeData(row);
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
    postType: base.postType || schedulePostType.value || '',
    postTypeLabel: base.postTypeLabel || schedulePostType.label || '',
    requiredDimensions: base.requiredDimensions || (schedulePostType.value ? { width: schedulePostType.width, height: schedulePostType.height } : null),
    notes: base.notes || row.note || row.notes || ''
  };
}
function publishPrepGlobalSearchInput(){
  return document.querySelector('.topbar .search input[type="search"]') || document.querySelector('.search input[type="search"]');
}
function syncPublishPrepSearchQuery(){
  const input = publishPrepGlobalSearchInput();
  publishPrepSearchQuery = normalizeText(input?.value || '');
}
function publishPrepSearchText(task, submission = {}){
  const row = task.raw?.structureRow || task.structureRow || {};
  return identityClean([
    task.id, task.title, task.campaignName, task.type, task.requiredFile, task.sourceLabel,
    task.taskNo, task.structureTaskNo, task.raw?.taskNo, task.raw?.structureTaskNo,
    row.taskNo, row.structureTaskNo, row.idea, row.description, row.message, row.cta,
    Array.isArray(task.platforms) ? task.platforms.join(' ') : task.platforms,
    task.postTypeLabel, publishPrepPlatformTypeDetails(task), task.publishDate, publishPrepEffectiveCaption?.(task, submission), publishPrepEffectiveHashtags?.(task, submission)
  ].filter(Boolean).join(' '));
}
function isCampaignContentWritingPrepTask(task){
  if(task?.raw?.structureGenerated || task?.raw?.source === 'campaign-structure-distribution') return false;
  const text = identityClean([
    task.title, task.name, task.taskName, task.taskType, task.requiredFile, task.contentSectionName,
    task.assignedDepartmentName, task.departmentRole, task.source, task.raw?.taskType, task.raw?.title
  ].filter(Boolean).join(' '));
  return text.includes(identityClean('كتابة محتوى حملة')) || text.includes(identityClean('كتابة محتوى')) || text.includes('campaigncontentwriting') || text.includes('contentwritingcampaign') || (text.includes('content') && text.includes('writing'));
}
function publishPrepTaskMatchesSearch(task, submission = {}){
  const q = identityClean(publishPrepSearchQuery || '');
  if(!q) return true;
  return publishPrepSearchText(task, submission).includes(q);
}
function publishPrepTasksFromExistingTasks(){
  const visible = typeof getVisibleTasksForCurrentUser === 'function' ? getVisibleTasksForCurrentUser() : campaignTasks;
  return (visible || []).filter(task => taskAssignedToCurrentUser(task) && !isCampaignContentWritingPrepTask(task) && !isTaskWaitingForDependency(task)).map(task => {
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
      platformTypes: task.platformTypes || {},
      platformPublishing: Array.isArray(task.platformPublishing) ? task.platformPublishing : [],
      postType: task.postType || task.publishType || '',
      postTypeLabel: task.postTypeLabel || '',
      requiredDimensions: task.requiredDimensions || null,
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
      platformTypes: row.platformTypes || {},
      platformPublishing: Array.isArray(row.platformPublishing) ? row.platformPublishing : [],
      postType: row.postType || '',
      postTypeLabel: row.postTypeLabel || '',
      requiredDimensions: row.requiredDimensions || null,
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
function publishPrepPlatformTypeDetails(task){
  const list = Array.isArray(task.platformPublishing) ? task.platformPublishing : [];
  if(list.length) return list.map(item => `${item.platform || 'منصة'}: ${item.postTypeLabel || postTypeLabel(item.postType || '') || 'نوع غير محدد'}`).join(' / ');
  return task.postTypeLabel || postTypeLabel(task.postType || '') || '';
}
function publishPrepHasPlatformTypeData(task){
  const list = Array.isArray(task.platformPublishing) ? task.platformPublishing : [];
  if(list.length) return list.every(item => item.platform && item.postType);
  return !!(task.platforms?.length && (task.postType || task.postTypeLabel));
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
  if(text.includes('snapchat') || text.includes('snap chat') || text.includes('snap') || text.includes('سناب')) return 'snapchat';
  if(text.includes('whatsapp') || text.includes('واتساب') || text.includes('مرسال')) return 'whatsapp';
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
    postType: task.postType || '',
    postTypeLabel: task.postTypeLabel || postTypeLabel(task.postType || ''),
    requiredDimensions: task.requiredDimensions || null,
    platforms: Array.isArray(task.platforms) ? task.platforms : [],
    publishDate: task.publishDate || '',
    publishTime: task.publishTime || ''
  };
}

async function publishPrepReadyTaskNow(task, submission){
  const finalFile = publishPrepFinalFileRecord(task, submission);
  if(!finalFile?.fileUrl) throw new Error('لا يوجد رابط للملف النهائي. ارفع الملف النهائي مرة أخرى.');
  const liveCaptionInput = document.querySelector(`[data-prep-caption="${CSS.escape(task.id)}"]`);
  const liveHashtagsInput = document.querySelector(`[data-prep-hashtags="${CSS.escape(task.id)}"]`);
  const liveCaption = liveCaptionInput ? normalizeText(liveCaptionInput.value) : '';
  const liveHashtags = liveHashtagsInput ? normalizeText(liveHashtagsInput.value) : '';
  const effectiveCaption = liveCaption || publishPrepEffectiveCaption(task, submission);
  const effectiveHashtags = liveHashtags || publishPrepEffectiveHashtags(task, submission);
  const platforms = publishPrepEffectivePlatforms(task, submission).map(normalizePublishPlatformForApi).filter(Boolean);
  if(!platforms.length) throw new Error('لا توجد منصات محددة للنشر.');
  const payload = {
    taskId: task.id,
    title: task.title,
    contentType: task.type || task.requiredFile || '',
    postType: publishPrepEffectivePostType(task, submission),
    postTypeLabel: publishPrepEffectivePostTypeLabel(task, submission),
    requiredDimensions: submission.requiredDimensions || task.requiredDimensions || null,
    platformTypes: publishPrepEffectivePlatformTypes(task, submission),
    platformPublishing: publishPrepEffectivePlatformPublishing(task, submission),
    platforms,
    caption: effectiveCaption,
    hashtags: effectiveHashtags,
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
function publishPrepEffectivePlatforms(task, submission = {}){
  return Array.isArray(submission?.platforms) && submission.platforms.length ? submission.platforms : (Array.isArray(task.platforms) ? task.platforms : []);
}
function publishPrepEffectivePlatformPublishing(task, submission = {}){
  return Array.isArray(submission?.platformPublishing) && submission.platformPublishing.length ? submission.platformPublishing : (Array.isArray(task.platformPublishing) ? task.platformPublishing : []);
}
function publishPrepEffectivePlatformTypes(task, submission = {}){
  return (submission?.platformTypes && typeof submission.platformTypes === 'object') ? submission.platformTypes : (task.platformTypes || {});
}
function publishPrepEffectivePublishDate(task, submission = {}){
  return normalizeText(submission?.publishDate || task.publishDate || '');
}
function publishPrepEffectivePublishTime(task, submission = {}){
  return normalizeText(submission?.publishTime || task.publishTime || '');
}
function publishPrepEffectivePostType(task, submission = {}){
  return normalizeText(submission?.postType || task.postType || '');
}
function publishPrepEffectivePostTypeLabel(task, submission = {}){
  return normalizeText(submission?.postTypeLabel || task.postTypeLabel || postTypeLabel(publishPrepEffectivePostType(task, submission)) || '');
}
function publishPrepEffectivePlatformTypeDetails(task, submission = {}){
  const list = publishPrepEffectivePlatformPublishing(task, submission);
  if(list.length) return list.map(item => `${item.platform || 'منصة'}: ${item.postTypeLabel || postTypeLabel(item.postType || '') || 'نوع غير محدد'}`).join(' / ');
  return publishPrepEffectivePostTypeLabel(task, submission) || '';
}
function publishPrepHasEffectivePlatformTypeData(task, submission = {}){
  const list = publishPrepEffectivePlatformPublishing(task, submission);
  if(list.length) return list.every(item => item.platform && item.postType);
  return !!(publishPrepEffectivePlatforms(task, submission).length && (publishPrepEffectivePostType(task, submission) || publishPrepEffectivePostTypeLabel(task, submission)));
}
function publishPrepMissingFields(task, submission){
  const missing = [];
  if(!publishPrepEffectiveCaption(task, submission)) missing.push('الكابشن');
  if(!publishPrepEffectiveHashtags(task, submission)) missing.push('الهاشتاج');
  if(!publishPrepEffectivePublishDate(task, submission)) missing.push('تاريخ النشر');
  if(!publishPrepEffectivePlatforms(task, submission).length) missing.push('المنصات');
  if(!publishPrepHasEffectivePlatformTypeData(task, submission)) missing.push('نوع المنشور لكل منصة');
  if(publishPrepTaskProgress(task) < 100) missing.push('اكتمال التاسك 100%');
  if(!publishPrepHasFinalFile(task, submission)) missing.push('الملف النهائي');
  return missing;
}
function publishPrepCompleteness(task, submission){
  const missing = publishPrepMissingFields(task, submission);
  const total = 7;
  return { missing, complete: !missing.length, percent: Math.max(0, Math.round(((total - missing.length) / total) * 100)) };
}
function renderPublishPrepCard(task, submission){
  const status = publishPrepStatus(task, submission);
  const effectivePlatforms = publishPrepEffectivePlatforms(task, submission);
  const platforms = effectivePlatforms.length ? effectivePlatforms.join(' + ') : 'غير محدد';
  const platformTypeDetails = publishPrepEffectivePlatformTypeDetails(task, submission);
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
        <div><b>أنواع النشر</b><span>${escapeHtml(platformTypeDetails || 'غير محدد')}</span></div>
        <div><b>تاريخ النشر</b><span>${escapeHtml(publishPrepEffectivePublishDate(task, submission) || 'غير محدد')}</span></div>
        <div><b>وقت النشر</b><span>${escapeHtml(publishPrepEffectivePublishTime(task, submission) || 'بدون وقت')}</span></div>
        <div><b>ميعاد التسليم</b><span>${escapeHtml(task.deadline || 'غير محدد')}</span></div>
        <div><b>المطلوب</b><span>${escapeHtml(task.requiredFile || 'ملف نهائي')}</span></div>
      </div>
      <div class="prep-meta-actions"><button class="btn btn-light" type="button" data-edit-prep-publishing="${escapeHtml(task.id)}">تعديل المنصات وأنواع النشر والتاريخ</button></div>
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
  syncPublishPrepSearchQuery();
  const tasks = getPublishingPrepTasks();
  const submissions = getPublishPrepSubmissions();
  const enrichedAll = tasks.map(task => ({ task, submission: submissions[task.id] || {} }));
  const enriched = enrichedAll.filter(({ task, submission }) => publishPrepTaskMatchesSearch(task, submission));
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
    list.innerHTML = `<div class="empty-state">${publishPrepSearchQuery ? 'لا توجد نتيجة مطابقة للبحث الحالي.' : 'لا توجد تاسكات تجهيز نشر مسندة لك حاليًا. عندما يتم توليد تاسكات من الحملة أو الأجندة ستظهر هنا تلقائيًا.'}</div>`;
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

function openPublishPrepEditModal(taskId){
  const task = getPublishingPrepTasks().find(item => item.id === taskId);
  if(!task){ showToast('تعذر العثور على التاسك.'); return; }
  const submission = getPublishPrepSubmissions()[taskId] || {};
  document.querySelectorAll('.publish-prep-edit-popup').forEach(el => el.remove());
  const meta = {
    platforms: publishPrepEffectivePlatforms(task, submission),
    platformPublishing: publishPrepEffectivePlatformPublishing(task, submission),
    platformTypes: publishPrepEffectivePlatformTypes(task, submission)
  };
  const popup = document.createElement('div');
  popup.className = 'publish-prep-edit-popup publish-platform-popup';
  popup.innerHTML = `<div class="publish-popup-backdrop" data-close-prep-edit-popup></div>
    <section class="publish-popup-dialog prep-edit-dialog" role="dialog" aria-modal="true">
      <div class="publish-popup-head"><div><h3>تعديل بيانات تجهيز النشر</h3><p>${escapeHtml(task.title || 'تاسك')}</p></div><button type="button" class="task-modal-close" data-close-prep-edit-popup>×</button></div>
      <div class="publish-popup-body prep-edit-body">
        <div class="prep-edit-section"><h4>المنصات وأنواع النشر</h4><div class="publish-platform-type-list prep-edit-platforms">${publishPlatformRowsHtml(meta)}</div></div>
        <div class="prep-edit-section prep-edit-dates"><label><span>تاريخ النشر</span><input type="date" class="js-prep-edit-date" value="${escapeHtml(publishPrepEffectivePublishDate(task, submission))}"></label><label><span>وقت النشر</span><input type="time" class="js-prep-edit-time" value="${escapeHtml(publishPrepEffectivePublishTime(task, submission))}"></label></div>
      </div>
      <div class="publish-popup-actions"><button type="button" class="btn btn-light" data-close-prep-edit-popup>إلغاء</button><button type="button" class="btn btn-primary" data-save-prep-edit-popup="${escapeHtml(taskId)}">حفظ بيانات النشر</button></div>
    </section>`;
  document.body.appendChild(popup);
  popup.querySelectorAll('.publish-platform-type-row').forEach(refreshPublishPlatformTypeRow);
}
function closePublishPrepEditModal(){
  document.querySelectorAll('.publish-prep-edit-popup').forEach(el => el.remove());
}
async function savePublishPrepEditModal(taskId){
  const popup = document.querySelector('.publish-prep-edit-popup');
  if(!popup) return;
  const publishing = collectPublishPlatformPublishing(popup);
  const platforms = publishing.map(item => item.platform).filter(Boolean);
  const platformTypes = {};
  publishing.forEach(item => { if(item.platform) platformTypes[item.platform] = item.postType || ''; });
  const first = publishing.find(item => item.postType) || {};
  await updatePublishPrepSubmission(taskId, {
    platforms,
    platformPublishing: publishing,
    platformTypes,
    postType: publishing.length === 1 ? (first.postType || '') : '',
    postTypeLabel: publishing.length === 1 ? (first.postTypeLabel || '') : (publishing.length > 1 ? 'أنواع متعددة' : ''),
    requiredDimensions: publishing.length === 1 ? (first.requiredDimensions || null) : null,
    publishDate: normalizeText(popup.querySelector('.js-prep-edit-date')?.value || ''),
    publishTime: normalizeText(popup.querySelector('.js-prep-edit-time')?.value || ''),
    publishMetaSavedAt: new Date().toISOString(),
    publishMetaSavedBy: getCurrentUserIdentity()?.email || getCurrentUserIdentity()?.name || 'user'
  });
  closePublishPrepEditModal();
  renderPublishPrepPage();
  showToast('تم حفظ المنصات وأنواع النشر وتاريخ النشر للتاسك.');
}
function bindPublishPrepPage(){
  document.getElementById('refreshPublishPrepBtn')?.addEventListener('click', () => { renderPublishPrepPage(); showToast('تم تحديث تاسكات تجهيز النشر.'); });
  document.getElementById('publishPrepList')?.addEventListener('click', async event => {
    const editPrepBtn = event.target.closest('[data-edit-prep-publishing]');
    if(editPrepBtn){ openPublishPrepEditModal(editPrepBtn.dataset.editPrepPublishing || ''); return; }
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
            type: task.postType || task.type || task.requiredFile || 'post',
            postType: (task.platformPublishing || []).find(x => x.platform === platformResult.platform)?.postType || task.postType || '',
            postTypeLabel: (task.platformPublishing || []).find(x => x.platform === platformResult.platform)?.postTypeLabel || task.postTypeLabel || postTypeLabel(task.postType || ''),
            requiredDimensions: (task.platformPublishing || []).find(x => x.platform === platformResult.platform)?.requiredDimensions || task.requiredDimensions || null,
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
      const captionInput = document.querySelector(`[data-prep-caption="${CSS.escape(id)}"]`);
      const hashtagsInput = document.querySelector(`[data-prep-hashtags="${CSS.escape(id)}"]`);
      const liveCaption = normalizeText(captionInput?.value || publishPrepEffectiveCaption(task, current));
      const liveHashtags = normalizeText(hashtagsInput?.value || publishPrepEffectiveHashtags(task, current));
      await updatePublishPrepSubmission(id, {
        readyForPublish: true,
        status: 'جاهز للنشر',
        readyAt: new Date().toISOString(),
        readyBy: getCurrentUserIdentity()?.email || getCurrentUserIdentity()?.name || 'user',
        caption: liveCaption,
        hashtags: liveHashtags,
        ...publishPrepTaskSnapshot(task)
      });
      renderPublishPrepPage();
      showToast('تم تحديد التاسك كجاهز للنشر في التاريخ المحدد.');
    }
  });
}


document.addEventListener('click', async event => {
  if(event.target.closest('[data-close-prep-edit-popup]')){ closePublishPrepEditModal(); return; }
  const saveBtn = event.target.closest('[data-save-prep-edit-popup]');
  if(saveBtn){ await savePublishPrepEditModal(saveBtn.dataset.savePrepEditPopup || ''); }
});
document.addEventListener('change', event => {
  const checkbox = event.target.closest('.publish-prep-edit-popup .js-platform-checkbox');
  const select = event.target.closest('.publish-prep-edit-popup .js-publish-platform-type-select');
  if(checkbox){ const row = checkbox.closest('.publish-platform-type-row'); if(row) refreshPublishPlatformTypeRow(row); }
  if(select){ const row = select.closest('.publish-platform-type-row'); if(row) row.classList.toggle('is-selected', !!select.value || !!row.querySelector('.js-platform-checkbox')?.checked); }
});

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
  document.getElementById('clearSocialLogBtn')?.addEventListener('click', () => { localStorage.removeItem(SOCIAL_PUBLISH_LOG_KEY); setSocialPublishLog([]); renderSocialPublishLog(); const remoteCount = (publishLogsCache || []).length; showToast(remoteCount ? `تم مسح السجل المحلي. متبقي ${remoteCount} عملية محفوظة في Firebase.` : 'تم مسح سجل النشر المحلي.'); });
  document.getElementById('socialPublishLog')?.addEventListener('click', event => {
    const btn = event.target.closest('[data-delete-social-log]');
    if(!btn) return;
    const id = btn.dataset.deleteSocialLog;
    const beforeRemote = (publishLogsCache || []).some(item => String(item.id || item.logId || '') === String(id));
    setSocialPublishLog(getLocalSocialPublishLog().filter(item => String(item.id) !== String(id)));
    renderSocialPublishLog();
    showToast(beforeRemote ? 'تم حذف النسخة المحلية فقط. السجل المحفوظ في Firebase ما زال ظاهرًا.' : 'تم حذف السجل المحلي.');
    if(getRoute() === 'publish-prep') renderPublishPrepPage();
  });
}

function loadCampaigns(){
  if(!mainDb) return;
  safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).orderBy('createdAt','desc').onSnapshot(snapshot => {
    campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() || {}) }));
    renderCampaigns();
    if(getRoute() === 'dashboard') renderAdminDashboard();
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
    showToast('تم تطبيق الثيم الافتراضي.');
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

function setMersalConnectionUi(status, label){
  const el = document.getElementById('mersalConnectionStatus');
  if(!el) return;
  el.classList.remove('is-connected','is-disconnected');
  if(status === 'connected'){ el.classList.add('is-connected'); el.textContent = label || 'متصل'; }
  else { el.classList.add('is-disconnected'); el.textContent = label || 'غير متصل'; }
}
function isMaskedToken(value){
  return /^\*{4,}$/.test(String(value || '').trim());
}
function normalizeWhatsappPhoneLocal(value = ''){
  let text = String(value || '').trim();
  if(!text) return '';
  text = text.replace(/[\s\-()]/g, '').replace(/^\+/, '').replace(/[^0-9]/g, '');
  if(/^05\d{8}$/.test(text)) return `966${text.slice(1)}`;
  if(/^5\d{8}$/.test(text)) return `966${text}`;
  return text;
}
function extractPhoneValuesFromWorksheet(ws){
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const phones = [];
  const phoneHeaderWords = ['phone','mobile','whatsapp','جوال','الجوال','هاتف','الهاتف','رقم','موبايل','واتساب'];
  const header = (rows[0] || []).map(cell => String(cell || '').trim().toLowerCase());
  const phoneColumns = header.map((cell, index) => phoneHeaderWords.some(word => cell.includes(word)) ? index : -1).filter(index => index >= 0);
  rows.forEach((row, rowIndex) => {
    const cells = phoneColumns.length && rowIndex > 0 ? phoneColumns.map(index => row[index]) : row;
    cells.forEach(cell => {
      const raw = String(cell || '').trim();
      const matches = raw.match(/\+?\d[\d\s\-()]{7,}\d/g) || [];
      matches.forEach(match => {
        const phone = normalizeWhatsappPhoneLocal(match);
        if(phone && phone.length >= 9) phones.push(phone);
      });
    });
  });
  return [...new Set(phones)];
}
async function updateWhatsappContactsCount(){
  const el = document.getElementById('whatsappContactsCount');
  if(!el || !mainDb) return;
  try{
    const snap = await safeCollection(window.MZJ_WHATSAPP_CONTACTS_COLLECTION).limit(1000).get();
    el.textContent = String(snap.size || 0);
  }catch(error){
    console.warn('WhatsApp contacts count error', error);
  }
}
async function validateMersalToken(apiEndpoint, token){
  if(!apiEndpoint || !token || isMaskedToken(token)) return false;
  const response = await fetch('/api/meta/mersal/validate', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ apiEndpoint, token })
  });
  const data = await response.json().catch(() => ({}));
  if(!response.ok || !data.ok) throw new Error(data.error || 'تعذر التحقق من التوكن.');
  return true;
}


function hourLabel24(hour){
  const n = Number(hour);
  if(!Number.isInteger(n) || n < 0 || n > 23) return '';
  const period = n < 12 ? 'صباحًا' : 'مساءً';
  const display = n % 12 === 0 ? 12 : n % 12;
  return `${display} ${period}`;
}
function hourOptionsHtml(selectedValue = ''){
  const selected = String(selectedValue ?? '');
  return Array.from({ length: 24 }, (_, hour) => `<option value="${hour}"${selected === String(hour) ? ' selected' : ''}>${hourLabel24(hour)}</option>`).join('');
}
function populateAutoPublishHourSelects(){
  ['autoPublishFacebookHour','autoPublishInstagramHour','autoPublishTiktokHour','autoPublishYoutubeHour','autoPublishSnapchatHour','autoPublishWhatsappHour','autoPublishDefaultHour'].forEach(id => {
    const select = document.getElementById(id);
    if(!select) return;
    const current = select.value;
    select.innerHTML = hourOptionsHtml(current);
  });
}
function platformConnectionRows(){
  const selectedPage = getSelectedSocialPage();
  const hasInstagram = !!(selectedPage && selectedPage.instagram && selectedPage.instagram.id);
  const mersal = (systemSettings && (systemSettings.mersal || systemSettings.whatsappMersal)) || {};
  const mersalConnected = !!(mersal.status === 'connected' || mersal.connected || mersal.token || systemSettings?.mersalToken);
  return [
    {
      key:'facebook', name:'Facebook', icon:'f', className:'facebook',
      status: socialMetaConnected ? 'متصل' : 'غير متصل',
      state: socialMetaConnected ? 'ready' : 'error',
      account: selectedPage ? (selectedPage.name || selectedPage.id) : 'لم يتم اختيار صفحة',
      token: socialMetaConnected ? 'صالح من جلسة الربط الحالية' : 'يحتاج ربط / إعادة ربط',
      action:'ربط / إعادة ربط Meta', href:'/api/meta/login', note:'يستخدم نفس ربط Meta الموجود في صفحة ربط المنصات.'
    },
    {
      key:'instagram', name:'Instagram', icon:'◎', className:'instagram',
      status: hasInstagram ? 'متصل' : (socialMetaConnected ? 'ناقص ربط Instagram Business' : 'غير متصل'),
      state: hasInstagram ? 'ready' : 'warning',
      account: hasInstagram ? (selectedPage.instagram.username || selectedPage.instagram.name || selectedPage.instagram.id) : 'لا يوجد Instagram Business على الصفحة المختارة',
      token: hasInstagram ? 'يعتمد على ربط Meta' : 'راجع ربط Instagram بالصفحة',
      action:'فتح ربط Meta', href:'/api/meta/login', note:'لازم يكون Instagram Business مربوط بصفحة Facebook المختارة.'
    },
    {
      key:'tiktok', name:'TikTok', icon:'♪', className:'tiktok',
      status: socialTikTokConnected ? 'متصل Sandbox' : 'غير متصل',
      state: socialTikTokConnected ? 'ready' : 'warning',
      account: socialTikTokUser ? (socialTikTokUser.display_name || socialTikTokUser.username || 'TikTok') : 'لا يوجد حساب مرتبط',
      token: socialTikTokConnected ? 'جاهز لاختبارات Draft Upload' : 'يحتاج ربط TikTok',
      action:'ربط TikTok', href:'/api/tiktok/login', note:'الحالة الحالية مخصصة لاختبارات Sandbox / Draft Upload.'
    },
    {
      key:'youtube', name:'YouTube', icon:'▶', className:'youtube',
      status: socialYouTubeConnected ? 'متصل' : 'غير متصل',
      state: socialYouTubeConnected ? 'ready' : 'warning',
      account: socialYouTubeChannel ? (socialYouTubeChannel.title || socialYouTubeChannel.id || 'YouTube') : 'لا توجد قناة مرتبطة',
      token: socialYouTubeConnected ? 'صالح من جلسة الربط الحالية' : 'يحتاج ربط YouTube',
      action:'ربط YouTube', href:'/api/youtube/login', note:'خصوصية الرفع الافتراضية يتم ضبطها من إعدادات مواعيد النشر.'
    },
    {
      key:'snapchat', name:'Snapchat', icon:'👻', className:'snapchat',
      status:'بانتظار موافقة Snapchat', state:'pending',
      account:'Public Profile API allowlist قيد الانتظار',
      token:'لا يوجد توكن قبل موافقة Snap',
      action:'بانتظار التفعيل', href:'', note:'تم إرسال طلب allowlist، وبعد الموافقة سيتم تفعيل OAuth والـ callback.'
    },
    {
      key:'whatsapp', name:'WhatsApp / مرسال', icon:'☎', className:'whatsapp',
      status: mersalConnected ? 'متصل' : 'جاهز بعد حفظ إعدادات مرسال',
      state: mersalConnected ? 'ready' : 'warning',
      account: mersal.apiEndpoint || systemSettings?.mersalApiEndpoint || 'https://w-mersal.com',
      token: mersalConnected ? 'تم حفظ إعدادات مرسال' : 'يحتاج Token مرسال',
      action:'فتح إعدادات مرسال', href:'#settings', note:'إعدادات مرسال محفوظة داخل صفحة الإعدادات.'
    }
  ];
}
function renderPlatformSettingsPage(){
  const grid = document.getElementById('platformSettingsGrid');
  const summary = document.getElementById('platformTokensSummary');
  if(!grid && !summary) return;
  const rows = platformConnectionRows();
  if(grid){
    grid.innerHTML = rows.map(row => `<article class="card platform-settings-card is-${escapeHtml(row.state)}" data-platform-settings-card="${escapeHtml(row.key)}">
      <div class="platform-settings-card-head">
        <div class="social-channel-icon ${escapeHtml(row.className)}">${escapeHtml(row.icon)}</div>
        <div><h3>${escapeHtml(row.name)}</h3><p>${escapeHtml(row.note)}</p></div>
      </div>
      <div class="platform-settings-fields">
        <div><span>الحالة</span><strong>${escapeHtml(row.status)}</strong></div>
        <div><span>الحساب / الصفحة</span><strong>${escapeHtml(row.account)}</strong></div>
        <div><span>التوكن / الصلاحية</span><strong>${escapeHtml(row.token)}</strong></div>
      </div>
      ${row.href ? `<a class="btn btn-light full" href="${escapeHtml(row.href)}">${escapeHtml(row.action)}</a>` : `<button class="btn btn-light full" type="button" disabled>${escapeHtml(row.action)}</button>`}
    </article>`).join('');
  }
  if(summary){
    summary.innerHTML = rows.map(row => `<div class="platform-token-row is-${escapeHtml(row.state)}"><span>${escapeHtml(row.name)}</span><strong>${escapeHtml(row.token)}</strong><small>${escapeHtml(row.status)}</small></div>`).join('');
  }
}

function fillSettingsForm(){
  populateAutoPublishHourSelects();
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
  if(document.getElementById('autoPublishYoutubeHour')) autoPublishYoutubeHour.value = String(Number.isFinite(Number(platformHours.youtube)) ? Number(platformHours.youtube) : 12);
  if(document.getElementById('autoPublishSnapchatHour')) autoPublishSnapchatHour.value = String(Number.isFinite(Number(platformHours.snapchat)) ? Number(platformHours.snapchat) : 18);
  if(document.getElementById('autoPublishDefaultHour')) autoPublishDefaultHour.value = String(Number.isFinite(Number(platformHours.default)) ? Number(platformHours.default) : legacyHour);
  if(document.getElementById('youtubePrivacyStatus')) youtubePrivacyStatus.value = ['public','unlisted','private'].includes(String(settings.youtubePrivacyStatus || '').toLowerCase()) ? String(settings.youtubePrivacyStatus).toLowerCase() : 'unlisted';
  if(document.getElementById('autoPublishWhatsappHour')) autoPublishWhatsappHour.value = String(Number.isFinite(Number(platformHours.whatsapp)) ? Number(platformHours.whatsapp) : 18);
  const mersal = settings.mersal || settings.whatsappMersal || {};
  if(document.getElementById('mersalApiEndpoint')) mersalApiEndpoint.value = mersal.apiEndpoint || settings.mersalApiEndpoint || 'https://w-mersal.com';
  if(document.getElementById('mersalToken')) mersalToken.value = (mersal.token || settings.mersalToken) ? '********' : '';
  if(document.getElementById('mersalImageTemplate')) mersalImageTemplate.value = mersal.imageTemplate || settings.mersalImageTemplate || 'mzj_image_caption_v4';
  if(document.getElementById('mersalVideoTemplate')) mersalVideoTemplate.value = mersal.videoTemplate || settings.mersalVideoTemplate || 'mzj_video_campaign';
  if(document.getElementById('mersalTemplateLanguage')) mersalTemplateLanguage.value = mersal.templateLanguage || settings.mersalTemplateLanguage || 'ar';
  if(document.getElementById('whatsappChannelStatus')) whatsappChannelStatus.textContent = (mersal.status === 'connected' || mersal.connected || mersal.token || settings.mersalToken) ? 'متصل' : 'جاهز بعد حفظ إعدادات مرسال';
  setMersalConnectionUi((mersal.status === 'connected' || mersal.connected || mersal.token || settings.mersalToken) ? 'connected' : 'disconnected');
  updateWhatsappContactsCount();
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
  renderNewUserPagesAccess();
  const wrap = document.getElementById('usersPermissionsList');
  if(!wrap) return;
  const pageOptions = routes.filter(r => !['dashboard'].includes(r));
  wrap.innerHTML = users.length ? users.map(user => {
    const pages = normalizePagesList([...(Array.isArray(user.pages) ? user.pages : []), ...(Array.isArray(user.pagesAccess) ? user.pagesAccess : [])]);
    const role = normalizeText(user.role || 'user') || 'user';
    const currentPassword = user.password || user.pass || '';
    return `<article class="permission-user-card" data-user-id="${escapeHtml(user.id)}"><div class="permission-user-main"><strong>${escapeHtml(userName(user) || 'User')}</strong><small>${escapeHtml(user.email || '')}</small><label class="mini-field"><span>نوع الحساب</span><select data-user-role><option value="user" ${role !== 'admin' ? 'selected' : ''}>يوزر عادي</option><option value="admin" ${role === 'admin' ? 'selected' : ''}>أدمن</option></select></label><label class="mini-field permission-password-field"><span>كلمة المرور الحالية / الجديدة</span><div class="permission-password-control"><input type="password" data-user-password value="${escapeHtml(currentPassword)}" placeholder="اكتب كلمة مرور جديدة" autocomplete="new-password"><button type="button" class="btn btn-light btn-mini" data-toggle-user-password>عرض</button></div><small>بعد الحفظ تصبح هي كلمة المرور المعتمدة لهذا اليوزر.</small></label></div><div class="permission-pages"><label><input type="checkbox" data-page-key="dashboard" checked disabled> الداش بورد</label>${pageOptions.map(page => `<label><input type="checkbox" data-page-key="${page}" ${pages.includes(page) ? 'checked' : ''}> ${pageLabel(page)}</label>`).join('')}</div><button type="button" class="btn btn-primary" data-save-user-pages="${escapeHtml(user.id)}">حفظ الصلاحيات والباسورد</button></article>`;
  }).join('') : '<div class="empty-state">لا توجد يوزرات.</div>';
}
function pageLabel(page){
  return {reports:'قاعدة البيانات','create-campaign':'إنشاء حملة',campaigns:'إدارة الحملات','social-publisher':'ربط المنصات','platform-settings':'إعدادات المنصات','publish-prep':'تجهيز النشر',tasks:'المتابعة',calendar:'التقويم',stock:'الاستوك',departments:'الأقسام',settings:'الإعدادات'}[page] || page;
}
function renderNewUserPagesAccess(){
  const wrap = document.getElementById('newUserPagesAccess');
  if(!wrap) return;
  const pageOptions = routes.filter(r => !['dashboard'].includes(r));
  wrap.innerHTML = `<label><input type="checkbox" data-new-user-page-key="dashboard" checked disabled> الداش بورد</label>` + pageOptions.map(page => `<label><input type="checkbox" data-new-user-page-key="${page}"> ${pageLabel(page)}</label>`).join('');
}
function resetAddUserPermissionsForm(){
  const form = document.getElementById('addUserPermissionsForm');
  if(form) form.reset();
  const pass = document.getElementById('newUserPassword');
  const toggle = document.getElementById('toggleNewUserPassword');
  if(pass) pass.type = 'password';
  if(toggle) toggle.textContent = 'عرض';
  renderNewUserPagesAccess();
}
function buildNewUserDocId(email){
  const clean = String(email || '').toLowerCase().trim().replace(/[\/#?]/g, '-');
  return clean || `user-${Date.now()}`;
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
    const cleanHour = value => { const n = Number(value); return Number.isInteger(n) && n >= 0 && n <= 23 ? n : 12; };
    const platformHours = {
      facebook: cleanHour(document.getElementById('autoPublishFacebookHour')?.value || 15),
      instagram: cleanHour(document.getElementById('autoPublishInstagramHour')?.value || 18),
      tiktok: cleanHour(document.getElementById('autoPublishTiktokHour')?.value || 21),
      youtube: cleanHour(document.getElementById('autoPublishYoutubeHour')?.value || 12),
      snapchat: cleanHour(document.getElementById('autoPublishSnapchatHour')?.value || 18),
      whatsapp: cleanHour(document.getElementById('autoPublishWhatsappHour')?.value || 18),
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
  document.getElementById('mersalSettingsForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    if(!mainDb) return;
    const existing = (systemSettings && (systemSettings.mersal || systemSettings.whatsappMersal)) || {};
    const rawTokenInput = normalizeText(document.getElementById('mersalToken')?.value || '');
    const tokenInput = isMaskedToken(rawTokenInput) ? '' : rawTokenInput;
    const apiEndpoint = normalizeText(document.getElementById('mersalApiEndpoint')?.value || 'https://w-mersal.com').replace(/\/$/, '');
    const token = tokenInput || existing.token || systemSettings.mersalToken || '';
    let connected = Boolean(existing.connected || existing.status === 'connected') && Boolean(token);
    if(tokenInput){
      showMessage('mersalSettingsMessage','جاري التحقق من التوكن...');
      connected = await validateMersalToken(apiEndpoint, tokenInput);
    }
    const payload = {
      apiEndpoint,
      token,
      connected,
      status: connected ? 'connected' : 'disconnected',
      imageTemplate: normalizeText(document.getElementById('mersalImageTemplate')?.value || 'mzj_image_caption_v4'),
      videoTemplate: normalizeText(document.getElementById('mersalVideoTemplate')?.value || 'mzj_video_campaign'),
      templateLanguage: normalizeText(document.getElementById('mersalTemplateLanguage')?.value || 'ar'),
      updatedAt: new Date().toISOString()
    };
    await safeCollection(window.MZJ_SYSTEM_SETTINGS_COLLECTION).doc(window.MZJ_SYSTEM_SETTINGS_DOC).set({ mersal: payload, updatedAt: serverTime() }, { merge:true });
    if(document.getElementById('mersalToken')) mersalToken.value = token ? '********' : '';
    setMersalConnectionUi(connected ? 'connected' : 'disconnected');
    showMessage('mersalSettingsMessage', connected ? 'تم حفظ إعدادات مرسال. الحالة: متصل.' : 'تم حفظ إعدادات مرسال، لكن لم يتم تأكيد الاتصال.');
  });
  document.getElementById('importWhatsappContactsBtn')?.addEventListener('click', async () => {
    if(!mainDb) return;
    const input = document.getElementById('whatsappContactsExcelInput');
    const file = input?.files?.[0];
    if(!file){ showMessage('whatsappContactsImportMessage','اختار ملف Excel أولاً.'); return; }
    try{
      showMessage('whatsappContactsImportMessage','جاري استيراد الأرقام...');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type:'array' });
      const phones = workbook.SheetNames.flatMap(name => extractPhoneValuesFromWorksheet(workbook.Sheets[name]));
      const uniquePhones = [...new Set(phones.map(normalizeWhatsappPhoneLocal).filter(Boolean))];
      if(!uniquePhones.length){ showMessage('whatsappContactsImportMessage','لم يتم العثور على أرقام جوال في الملف.'); return; }
      const batchLimit = 450;
      let saved = 0;
      for(let i = 0; i < uniquePhones.length; i += batchLimit){
        const batch = mainDb.batch();
        uniquePhones.slice(i, i + batchLimit).forEach(phone => {
          const ref = safeCollection(window.MZJ_WHATSAPP_CONTACTS_COLLECTION).doc(phone);
          batch.set(ref, { phone, source:'excel', active:true, importedAt: serverTime(), updatedAt: serverTime() }, { merge:true });
          saved += 1;
        });
        await batch.commit();
      }
      input.value = '';
      await updateWhatsappContactsCount();
      showMessage('whatsappContactsImportMessage', `تم استيراد ${saved} رقم. الأرقام محفوظة ومش ظاهرة في الإعدادات.`);
    }catch(error){
      console.error('WhatsApp contacts import error', error);
      showMessage('whatsappContactsImportMessage', error.message || 'تعذر استيراد الأرقام.');
    }
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
    showMessage('themeSettingsMessage','تم تطبيق الثيم الافتراضي ومسح الخلفية.');
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
  renderNewUserPagesAccess();
  document.getElementById('toggleNewUserPassword')?.addEventListener('click', () => {
    const input = document.getElementById('newUserPassword');
    const btn = document.getElementById('toggleNewUserPassword');
    if(!input || !btn) return;
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.textContent = showing ? 'عرض' : 'إخفاء';
  });
  document.getElementById('addUserPermissionsForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    if(!mainDb) return;
    const name = normalizeText(document.getElementById('newUserName')?.value || '');
    const rawEmail = normalizeText(document.getElementById('newUserEmail')?.value || '');
    const email = rawEmail.toLowerCase();
    const password = String(document.getElementById('newUserPassword')?.value || '').trim();
    const role = document.getElementById('newUserRole')?.value || 'user';
    const pages = normalizePagesList(['dashboard', ...[...document.querySelectorAll('input[data-new-user-page-key]:checked')].map(input => input.dataset.newUserPageKey).filter(Boolean)]);
    if(!email || !email.includes('@')){ showMessage('addUserPermissionsMessage','اكتب بريد إلكتروني صحيح.'); return; }
    if(!password){ showMessage('addUserPermissionsMessage','اكتب كلمة مرور لليوزر الجديد.'); return; }
    try{
      const exists = await safeCollection(window.MZJ_USERS_COLLECTION).where('emailLower','==',email).limit(1).get();
      if(!exists.empty){ showMessage('addUserPermissionsMessage','البريد الإلكتروني موجود بالفعل.'); return; }
      const docId = buildNewUserDocId(email);
      const payload = {
        uid: docId,
        id: docId,
        email: rawEmail,
        emailLower: email,
        name: name || rawEmail.split('@')[0],
        displayName: name || rawEmail.split('@')[0],
        username: name || rawEmail.split('@')[0],
        role,
        pages,
        pagesAccess: pages,
        password,
        pass: password,
        status: 'active',
        active: true,
        createdAt: serverTime(),
        createdBy: getCurrentUser()?.email || getCurrentUser()?.name || '',
        updatedAt: serverTime()
      };
      await safeCollection(window.MZJ_USERS_COLLECTION).doc(docId).set(payload, { merge:false });
      users.push({ ...payload, id: docId, uid: docId });
      users.sort((a,b) => String(userName(a)).localeCompare(String(userName(b)), 'ar'));
      resetAddUserPermissionsForm();
      renderUsersPermissions();
      showMessage('addUserPermissionsMessage','تم إضافة اليوزر وحفظ الباسورد والصلاحيات.');
    }catch(error){
      console.error('Add user error', error);
      showMessage('addUserPermissionsMessage', error?.message || 'تعذر إضافة اليوزر. راجع قواعد Firebase.');
    }
  });
  document.addEventListener('click', async event => {
    const save = event.target.closest('[data-save-user-pages]');
    const togglePassword = event.target.closest('[data-toggle-user-password]');
    if(togglePassword){
      const control = togglePassword.closest('.permission-password-control');
      const input = control?.querySelector('[data-user-password]');
      if(input){
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        togglePassword.textContent = showing ? 'عرض' : 'إخفاء';
      }
      return;
    }
    if(!save || !mainDb) return;
    const card = save.closest('.permission-user-card');
    const pages = normalizePagesList(['dashboard', ...[...card.querySelectorAll('input[data-page-key]:checked')].map(input => input.dataset.pageKey).filter(Boolean)]);
    const role = card.querySelector('[data-user-role]')?.value || 'user';
    const passwordInput = card.querySelector('[data-user-password]');
    const password = passwordInput ? String(passwordInput.value || '').trim() : '';
    if(!password){ showToast('اكتب كلمة مرور لل هذا اليوزر قبل الحفظ.'); return; }
    try{
      // نحفظ الحقول المسموح بها في Firestore rules فقط.
      // كلمة المرور المعتمدة محفوظة في users/{id}.password ويتم قراءتها عند تسجيل الدخول.
      await safeCollection(window.MZJ_USERS_COLLECTION).doc(save.dataset.saveUserPages).set({
        pages,
        pagesAccess: pages,
        role,
        password,
        updatedAt: serverTime()
      }, { merge:true });
    }catch(error){
      console.error('User permissions/password save error', error);
      showToast(error?.message || 'تعذر حفظ الباسورد. راجع قواعد Firebase.');
      return;
    }
    const idx = users.findIndex(u => u.id === save.dataset.saveUserPages);
    if(idx >= 0){ users[idx] = { ...users[idx], pages, pagesAccess: pages, role, password, pass: password }; }
    const currentKeys = uniqueIdentityKeys([getCurrentUser()]);
    const editedKeys = idx >= 0 ? uniqueIdentityKeys([users[idx]]) : [identityClean(save.dataset.saveUserPages)];
    if(identityIntersects(currentKeys, editedKeys)){ syncCurrentSessionUserFromUsers(); applyUserPermissions(); renderRoute(); }
    showToast('تم حفظ صلاحيات اليوزر والباسورد.');
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
  loadSimpleCollection(window.MZJ_ORDER_STATUSES_COLLECTION, orderStatuses, renderOrderStatuses);
  loadSimpleCollection(window.MZJ_FUNNELS_COLLECTION, funnels, function(){}, true);
  loadSimpleCollection(window.MZJ_PLATFORMS_COLLECTION, platforms, () => { renderPlatforms(); ensureSnapchatPlatformSeed(); ensureWhatsAppPlatformSeed(); refreshDynamicSelects(); });
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
  populateAutoPublishHourSelects();
  document.addEventListener('click', event => {
    const addTypeBtn = event.target.closest('#addPlatformPostType, [data-add-platform-post-type]');
    if(addTypeBtn){
      event.preventDefault();
      event.stopPropagation();
      addPlatformPostTypeRow();
      return;
    }
    const removeTypeBtn = event.target.closest('[data-remove-platform-post-type]');
    if(removeTypeBtn){
      event.preventDefault();
      event.stopPropagation();
      const row = removeTypeBtn.closest('.platform-type-row');
      row?.remove();
      const box = document.getElementById('platformPostTypesRows');
      if(box && !box.children.length) addPlatformPostTypeRow();
      syncPlatformPostTypesTextarea();
    }
  }, true);
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

      // لو فيه password محفوظ داخل users، هو كلمة المرور المعتمدة حتى لو Firebase Auth قبل كلمة قديمة.
      // ده يخلي تغيير الباسورد من شاشة اليوزرات والصلاحيات يشتغل فوراً.
      const storedPassword = userDoc.password || userDoc.pass || '';
      if(storedPassword && storedPassword !== password){
        showMessage('loginMessage', 'كلمة المرور غير صحيحة.');
        return;
      }
      if(!authUser && !storedPassword){
        showMessage('loginMessage', 'كلمة المرور غير محفوظة لهذا الحساب. راجع الأدمن.');
        return;
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
  document.addEventListener('keydown', event => { if(event.key === 'Escape'){ closeTaskModal(); closeCampaignModal(); closePublishComposer(); closeCalendarDayPopup(); } });
  document.getElementById('calendarPrevMonth')?.addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth()-1); renderCalendarPage(); });
  document.getElementById('calendarNextMonth')?.addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth()+1); renderCalendarPage(); });
  document.getElementById('calendarToday')?.addEventListener('click', () => { calendarCursor = new Date(); renderCalendarPage(); });
  document.getElementById('calendarBoard')?.addEventListener('click', event => {
    const platformBtn = event.target.closest('[data-calendar-platform-day]');
    if(platformBtn){
      event.preventDefault();
      event.stopPropagation();
      openCalendarDayPopup(platformBtn.dataset.calendarPlatformDay, platformBtn.dataset.calendarPlatformKey || '');
    }
  });
  document.getElementById('calendarBoard')?.addEventListener('keydown', event => {
    if(event.key !== 'Enter' && event.key !== ' ') return;
    const dayCard = event.target.closest('.calendar-day.has-items[data-calendar-day]');
    if(dayCard){ event.preventDefault(); openCalendarDayPopup(dayCard.dataset.calendarDay); }
  });
  document.addEventListener('click', event => { if(event.target.closest('[data-close-calendar-popup]')) closeCalendarDayPopup(); });
  bindCampaignBuilder(); bindDepartments(); bindSettings(); bindSocialPublisher(); bindPublishPrepPage(); bindPublishCenter();
  document.getElementById('platformSettingsRefreshBtn')?.addEventListener('click', () => { renderPlatformSettingsPage(); loadMetaConnection(); loadTikTokConnection(); loadYouTubeConnection(); showToast('تم تحديث حالة المنصات.'); });
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
    const downloadStructureTemplateBtn = event.target.closest('[data-download-structure-template]');
    if(downloadStructureTemplateBtn){ await downloadStructureTemplateForTask(downloadStructureTemplateBtn.dataset.downloadStructureTemplate); return; }
    const openStructureReviewBtn = event.target.closest('[data-open-structure-review]');
    if(openStructureReviewBtn){ openStructureReviewPopup(openStructureReviewBtn.dataset.openStructureReview); return; }
    if(event.target.closest('[data-close-structure-review]')){ closeStructureReviewPopup(); return; }
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
    const rowStatusBtn = event.target.closest('[data-set-structure-row-status]');
    if(rowStatusBtn){
      event.preventDefault();
      event.stopPropagation();
      await setStructureRowReviewStatus(rowStatusBtn.dataset.taskId || '', rowStatusBtn.dataset.rowKey || '', rowStatusBtn.dataset.setStructureRowStatus || 'approved');
      return;
    }
    const structureApprove = event.target.closest('[data-structure-approve]');
    if(structureApprove){ await setStructureStatus(structureApprove.dataset.structureApprove, 'approved'); closeStructureReviewPopup(); return; }
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


// v148: download fix for templates that do not contain xl/sharedStrings.xml.
// Some approved structure templates are saved with inline strings only. The older downloader
// required sharedStrings.xml and stopped before triggering the browser download.
function patchSheetCellXmlInlineV148(sheetXml, cellRef, value){
  const rowNo = Number(String(cellRef).replace(/^[A-Z]+/i,''));
  const colLetters = String(cellRef).replace(/[0-9]+$/,'').toUpperCase();
  const colNo = columnNameToNumber(colLetters);
  const text = xmlEscape(value == null ? '' : value);
  const cellXml = `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
  const cleanAttrs = (attrs) => String(attrs || '')
    .replace(/\s*\/$/, '')
    .replace(/\s+t=["'][^"']*["']/g, '')
    .replace(/\s+cm=["'][^"']*["']/g, '')
    .replace(/\s+vm=["'][^"']*["']/g, '');
  const selfClosingCellRe = new RegExp(`<c([^>]*\\sr=["']${cellRef}["'][^>]*)\\s*\\/>`);
  if(selfClosingCellRe.test(sheetXml)){
    return sheetXml.replace(selfClosingCellRe, (match, attrs) => `<c${cleanAttrs(attrs)} t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`);
  }
  const normalCellRe = new RegExp(`<c([^>]*\\sr=["']${cellRef}["'][^>]*)>[\\s\\S]*?<\\/c>`);
  if(normalCellRe.test(sheetXml)){
    return sheetXml.replace(normalCellRe, (match, attrs) => `<c${cleanAttrs(attrs)} t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`);
  }
  const rowBlockRe = new RegExp(`<row([^>]*\\sr=["']${rowNo}["'][^>]*)>([\\s\\S]*?)<\\/row>`);
  if(rowBlockRe.test(sheetXml)){
    return sheetXml.replace(rowBlockRe, (match, rowAttrs, rowInner) => {
      const cellMatches = [...rowInner.matchAll(/<c[^>]*\sr=["']([A-Z]+)\d+["'][^>]*(?:\/>|>[\s\S]*?<\/c>)/g)];
      let insertAt = rowInner.length;
      for(const m of cellMatches){
        const currentCol = columnNameToNumber(m[1]);
        if(currentCol > colNo){ insertAt = m.index; break; }
      }
      return `<row${rowAttrs}>${rowInner.slice(0, insertAt)}${cellXml}${rowInner.slice(insertAt)}</row>`;
    });
  }
  return sheetXml.replace('</sheetData>', `<row r="${rowNo}">${cellXml}</row></sheetData>`);
}
function patchWorkbookCellsInlineV148(sheetXml, patches){
  Object.entries(patches || {}).forEach(([addr, val]) => {
    sheetXml = patchSheetCellXmlInlineV148(sheetXml, addr, val == null ? '' : val);
  });
  return sheetXml;
}
async function downloadStructureTemplateForTaskExact(task){
  if(!window.JSZip) throw new Error('JSZip is not loaded');
  const zip = await window.JSZip.loadAsync(STRUCTURE_TEMPLATE_BASE64_V145, { base64: true });
  const sheetPath = 'xl/worksheets/sheet1.xml';
  const sheetFile = zip.file(sheetPath);
  if(!sheetFile) throw new Error('Structure template sheet is missing');
  let sheetXml = await sheetFile.async('string');
  const campaignCode = campaignCodeForTask(task);
  const creativeCode = templateCreativeLinkCodeForTask({ ...task, campaignCode });
  const writerCode = contentWriterCodeForTask(task);
  const writerName = task.assignedToName || task.userName || task.assigneeName || '';
  const creativeName = task.creative || task.product || (task.taskType || '').replace(/^طلب\s*هيكل\s*-?/i, '').trim() || '';
  const campaign = campaignRecordForTask(task) || {};
  const campaignName = task.campaignName || task.campaignTitle || task.campaign || campaign.campaignName || campaign.name || '';
  const campaignTypeName = task.campaignTypeName || task.campaignType || task.typeName || task.type || campaign.campaignTypeName || campaign.campaignType || campaign.typeName || campaign.type || '';
  const patches = {
    A1: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
    A35: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
    B2: 'اسم الحملة', C2: campaignName || '',
    B3: 'كود الحملة', C3: campaignCode || '',
    B4: 'كود الكرييتيف', C4: creativeCode || '',
    B5: 'كود الكرييتيف المختصر', C5: creativeShortCode || '',
    B6: 'الكرييتيف المطلوب للهيكل', C6: creativeName || '',
    B7: 'كاتب المحتوى', C7: writerName || '',
    B8: 'كود كاتب المحتوى', C8: writerCode || '',
    B9: 'نوع الحمله', C9: campaignTypeName || '',
    B9: 'معنى العنصر داخل MZJ', C9: '',
    B10: 'دور العنصر في تعزيز الثقة', C10: '',
    B11: 'الهدف الاستراتيجي للحملة', C11: '',
    B12: 'الهدف النهائي للحملة', C12: '',
    B13: 'الترجمة الملموسة للهدف النهائي', C13: '',
    B14: 'الرسالة الرئيسية', C14: '',
    B15: 'إحساس الحملة', C15: '',
    B16: 'الترجمة التنفيذية لإحساس الحملة', C16: '',
    B17: 'نوع المحتوى', C17: '',
    B18: 'زاوية المحتوى', C18: '',
    B19: 'ما يجب إبرازه', C19: '',
    B20: 'الترجمة التنفيذية لما يجب إبرازه', C20: '',
    B21: 'ما يجب تجنبه', C21: '',
    B22: 'CTA', C22: ''
  };
  sheetXml = patchWorkbookCellsInlineV148(sheetXml, patches);
  const writerPrefix = writerCode || 'N';
  for(let index = 0; index < 50; index += 1){
    const rowNumber = 37 + index;
    const n = String(index + 1).padStart(2, '0');
    const rowPatches = { [`A${rowNumber}`]: index === 0 ? (campaignTypeName || '') : '', [`C${rowNumber}`]: creativeCode ? `${creativeCode}-${writerPrefix}${n}` : '' };
    ['B','D','E','F','G','H','I','J','K','L'].forEach(col => { rowPatches[`${col}${rowNumber}`] = ''; });
    sheetXml = patchWorkbookCellsInlineV148(sheetXml, rowPatches);
  }
  zip.file(sheetPath, sheetXml);
  const out = await zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileBase = safeStorageSegment([creativeCode, creativeName || 'هيكل'].filter(Boolean).join('-'));
  const blobUrl = URL.createObjectURL(out);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${fileBase || 'campaign-structure'}-template.xlsx`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(blobUrl); a.remove(); }, 1200);
  showToast('تم تحميل قالب الهيكل بالأكواد.');
}

// v156 override: exact template download with creative short code, department code and user code columns.
async function downloadStructureTemplateForTaskExact(task){
  if(!window.JSZip) throw new Error('JSZip is not loaded');
  const zip = await window.JSZip.loadAsync(STRUCTURE_TEMPLATE_BASE64_V145, { base64: true });
  const sheetPath = 'xl/worksheets/sheet1.xml';
  const sheetFile = zip.file(sheetPath);
  if(!sheetFile) throw new Error('Structure template sheet is missing');
  let sheetXml = await sheetFile.async('string');
  const campaignCode = campaignCodeForTask(task);
  const creativeCode = templateCreativeLinkCodeForTask({ ...task, campaignCode });
  const writerCode = contentWriterCodeForTask(task);
  const writerName = task.assignedToName || task.userName || task.assigneeName || '';
  const creativeName = task.creative || task.product || (task.taskType || '').replace(/^طلب\s*هيكل\s*-?/i, '').trim() || '';
  const campaign = campaignRecordForTask(task) || {};
  const campaignName = task.campaignName || task.campaignTitle || task.campaign || campaign.campaignName || campaign.name || '';
  const campaignTypeName = task.campaignTypeName || task.campaignType || task.typeName || task.type || campaign.campaignTypeName || campaign.campaignType || campaign.typeName || campaign.type || '';
  const creativeShortCode = creativeShortCodeForName(creativeName);
  const creativeRow = creativeAssignmentForStructureRow(campaign, task, { creativeShortCode, taskNo: creativeCode });
  const mainRole = creativeDepartmentRole(creativeName || creativeRow?.creative || '');
  const roleTask = assignmentForRoleFromCreativeRow(creativeRow, mainRole) || {};
  const deptCode = roleCode(mainRole);
  const execUserCodes = uniqueList([...(Array.isArray(roleTask.userCodes) ? roleTask.userCodes : []), ...userCodesForTask(roleTask)]).filter(Boolean).join(',');
  const patches = {
    A1: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
    A35: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
    B2: 'اسم الحملة', C2: campaignName || '',
    B3: 'كود الحملة', C3: campaignCode || '',
    B4: 'كود الكرييتيف', C4: creativeCode || '',
    B5: 'كود الكرييتيف المختصر', C5: creativeShortCode || '',
    B6: 'الكرييتيف المطلوب للهيكل', C6: creativeName || '',
    B7: 'كاتب المحتوى', C7: writerName || '',
    B8: 'كود كاتب المحتوى', C8: writerCode || '',
    B9: 'نوع الحمله', C9: campaignTypeName || '',
    B10: 'معنى العنصر داخل MZJ', C10: '',
    B11: 'دور العنصر في تعزيز الثقة', C11: '',
    B12: 'الهدف الاستراتيجي للحملة', C12: '',
    B13: 'الهدف النهائي للحملة', C13: '',
    B14: 'الترجمة الملموسة للهدف النهائي', C14: '',
    B15: 'الرسالة الرئيسية', C15: '',
    B16: 'إحساس الحملة', C16: '',
    B17: 'الترجمة التنفيذية لإحساس الحملة', C17: '',
    B18: 'نوع المحتوى', C18: '',
    B19: 'زاوية المحتوى', C19: '',
    B20: 'ما يجب إبرازه', C20: '',
    B21: 'الترجمة التنفيذية لما يجب إبرازه', C21: '',
    B22: 'ما يجب تجنبه', C22: '',
    B23: 'CTA', C23: '',
    M36: 'كود الكرييتيف المختصر',
    N36: 'كود القسم',
    O36: 'كود اليوزر',
    P36: 'كود كاتب المحتوى'
  };
  sheetXml = patchWorkbookCellsInlineV148(sheetXml, patches);
  const writerPrefix = writerCode || 'N';
  for(let index = 0; index < 50; index += 1){
    const rowNumber = 37 + index;
    const n = String(index + 1).padStart(2, '0');
    const fullTaskCode = creativeCode ? `${creativeCode}-${creativeShortCode}-${deptCode}-${execUserCodes || writerPrefix}-${writerPrefix}${n}` : '';
    const rowPatches = {
      [`A${rowNumber}`]: index === 0 ? (campaignTypeName || '') : '',
      [`C${rowNumber}`]: fullTaskCode,
      [`M${rowNumber}`]: creativeShortCode,
      [`N${rowNumber}`]: deptCode,
      [`O${rowNumber}`]: execUserCodes || writerPrefix,
      [`P${rowNumber}`]: writerPrefix
    };
    ['B','D','E','F','G','H','I','J','K','L'].forEach(col => { rowPatches[`${col}${rowNumber}`] = ''; });
    sheetXml = patchWorkbookCellsInlineV148(sheetXml, rowPatches);
  }
  zip.file(sheetPath, sheetXml);
  const out = await zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileBase = safeStorageSegment([creativeCode, creativeName || 'هيكل'].filter(Boolean).join('-'));
  const blobUrl = URL.createObjectURL(out);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${fileBase || 'campaign-structure'}-template.xlsx`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(blobUrl); a.remove(); }, 1200);
  showToast('تم تحميل قالب الهيكل بالأكواد.');
}


// v159 final fixes: exact 21 Campaign Logic fields, formatted link-code columns, ignore code-only rows.
(function(){
  const oldUserCodeFromIdentity = userCodeFromIdentity;
  userCodeFromIdentity = function(value){
    const text = normalizeText(value || '');
    const clean = identityClean(text);
    if(!clean) return '';
    if(clean.includes('احمد') && (clean.includes('ناجي') || clean.includes('nagi'))) return 'N';
    if(clean.includes('بلال') || clean.includes('khtan') || clean.includes('ختعن')) return 'B';
    if(clean.includes('امجاد') || clean.includes('الدوسري') || clean.includes('amjad')) return 'A';
    const user = findUserByAnyIdentity([text]) || {};
    const explicit = normalizeText(user.code || user.userCode || user.shortCode || user.initials || user.username || '');
    if(explicit) return explicit.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 12);
    const idCode = normalizeText(user.id || user.uid || user.email || '');
    if(idCode){
      const cleanId = idCode.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 10);
      if(cleanId) return `U${cleanId}`;
    }
    const latin = text.match(/[A-Za-z0-9]/g);
    if(latin && latin.length) return latin.join('').toUpperCase().slice(0, 10);
    return oldUserCodeFromIdentity ? oldUserCodeFromIdentity(value) : clean.slice(0, 8).toUpperCase();
  };

  const oldIsStructureCodeOnlyValue = isStructureCodeOnlyValue;
  isStructureCodeOnlyValue = function(value){
    const clean = normalizeText(value || '').toUpperCase();
    if(!clean) return true;
    if(oldIsStructureCodeOnlyValue && oldIsStructureCodeOnlyValue(clean)) return true;
    if(/^U[A-Z0-9]{4,}$/.test(clean)) return true;
    if(/^USER[A-Z0-9-]*$/.test(clean)) return true;
    return false;
  };

  isRealStructureDistributionRow = function(row){
    const contentType = normalizeText(row?.contentType || '');
    const details = [row?.goal, row?.tangibleGoal, row?.idea, row?.contentName, row?.description, row?.message, row?.contentAngle, row?.highlightTranslation, row?.writerRequest, row?.cta]
      .map(value => normalizeText(value || ''))
      .filter(value => value && !isPlaceholderStructureText(value) && !isStructureCodeOnlyValue(value));
    const explicitType = contentType && !isPlaceholderStructureText(contentType) && !isStructureCodeOnlyValue(contentType);
    return !!(details.length || explicitType);
  };

  structureDisplayRowHasRealExecutionData = function(row){
    const values = (row || []).filter(cell => cell && !cell.skip).map(cell => normalizeText(cell.value || '')).filter(Boolean);
    if(!values.length) return false;
    const hasHeader = values.some(value => {
      const key = structureHeaderKey(value);
      return key.includes('رقم التاسك') || key.includes('كود تاسك الهيكل') || key.includes('نوع المحتوي') || key.includes('نوع المحتوى') || key === 'cta';
    });
    if(hasHeader) return true;
    const realValues = values.filter(value => {
      if(isProtectedStructureTitleText(value)) return true;
      if(isPlaceholderStructureText(value)) return false;
      if(isStructureCodeOnlyValue(value)) return false;
      const key = structureHeaderKey(value);
      if(['n','b','a'].includes(key)) return false;
      if(/^حمله\s/.test(key) || /^حملة\s/.test(key)) return false;
      return true;
    });
    return realValues.length > 0;
  };

  downloadStructureTemplateForTaskExact = async function(task){
    if(!window.JSZip) throw new Error('JSZip is not loaded');
    const zip = await window.JSZip.loadAsync(STRUCTURE_TEMPLATE_BASE64_V145, { base64: true });
    const sheetPath = 'xl/worksheets/sheet1.xml';
    const sheetFile = zip.file(sheetPath);
    if(!sheetFile) throw new Error('Structure template sheet is missing');
    let sheetXml = await sheetFile.async('string');
    const campaignCode = campaignCodeForTask(task);
    const creativeCode = templateCreativeLinkCodeForTask({ ...task, campaignCode });
    const writerCode = contentWriterCodeForTask(task);
    const writerName = task.assignedToName || task.userName || task.assigneeName || '';
    const creativeName = task.creative || task.product || (task.taskType || '').replace(/^طلب\s*هيكل\s*-?/i, '').trim() || '';
    const campaign = campaignRecordForTask(task) || {};
    const campaignName = task.campaignName || task.campaignTitle || task.campaign || campaign.campaignName || campaign.name || '';
    const campaignTypeName = task.campaignTypeName || task.campaignType || task.typeName || task.type || campaign.campaignTypeName || campaign.campaignType || campaign.typeName || campaign.type || '';
    const creativeShortCode = creativeShortCodeForName(creativeName);
    const creativeRow = creativeAssignmentForStructureRow(campaign, task, { creativeShortCode, taskNo: creativeCode });
    const mainRole = creativeDepartmentRole(creativeName || creativeRow?.creative || '');
    const roleTask = assignmentForRoleFromCreativeRow(creativeRow, mainRole) || {};
    const deptCode = roleCode(mainRole);
    const execUserCodes = uniqueList([...(Array.isArray(roleTask.userCodes) ? roleTask.userCodes : []), ...userCodesForTask(roleTask)]).filter(Boolean).join(',');
    const userCode = execUserCodes || 'USER';
    const patches = {
      A1: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
      A35: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
      B2: 'اسم الحملة', C2: campaignName || '',
      B3: 'كود الحملة', C3: campaignCode || '',
      B4: 'كود الكرييتيف', C4: creativeCode || '',
      B5: 'الكرييتيف المطلوب للهيكل', C5: creativeName || '',
      B6: 'كاتب المحتوى', C6: writerName || '',
      B7: 'كود كاتب المحتوى', C7: writerCode || '',
      B8: 'نوع الحمله', C8: campaignTypeName || '',
      B9: 'معنى العنصر داخل MZJ', C9: '',
      B10: 'دور العنصر في تعزيز الثقة', C10: '',
      B11: 'الهدف الاستراتيجي للحملة', C11: '',
      B12: 'الهدف النهائي للحملة', C12: '',
      B13: 'الترجمة الملموسة للهدف النهائي', C13: '',
      B14: 'الرسالة الرئيسية', C14: '',
      B15: 'إحساس الحملة', C15: '',
      B16: 'الترجمة التنفيذية لإحساس الحملة', C16: '',
      B17: 'نوع المحتوى', C17: '',
      B18: 'زاوية المحتوى', C18: '',
      B19: 'ما يجب إبرازه', C19: '',
      B20: 'الترجمة التنفيذية لما يجب إبرازه', C20: '',
      B21: 'ما يجب تجنبه', C21: '',
      B22: 'CTA', C22: '',
      M36: 'كود الكرييتيف المختصر', N36: 'كود القسم', O36: 'كود اليوزر', P36: 'كود كاتب المحتوى'
    };
    sheetXml = patchWorkbookCellsInlineV148(sheetXml, patches);
    const writerPrefix = writerCode || 'N';
    for(let index = 0; index < 50; index += 1){
      const rowNumber = 37 + index;
      const n = String(index + 1).padStart(2, '0');
      const fullTaskCode = creativeCode ? `${creativeCode}-${creativeShortCode}-${deptCode}-${userCode}-N${n}` : '';
      const rowPatches = {
        [`A${rowNumber}`]: index === 0 ? (campaignTypeName || '') : '',
        [`C${rowNumber}`]: fullTaskCode,
        [`M${rowNumber}`]: creativeShortCode,
        [`N${rowNumber}`]: deptCode,
        [`O${rowNumber}`]: userCode,
        [`P${rowNumber}`]: writerPrefix
      };
      ['B','D','E','F','G','H','I','J','K','L'].forEach(col => { rowPatches[`${col}${rowNumber}`] = ''; });
      sheetXml = patchWorkbookCellsInlineV148(sheetXml, rowPatches);
    }
    zip.file(sheetPath, sheetXml);
    const out = await zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileBase = safeStorageSegment([creativeCode, creativeName || 'هيكل'].filter(Boolean).join('-'));
    const blobUrl = URL.createObjectURL(out);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${fileBase || 'campaign-structure'}-template.xlsx`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(blobUrl); a.remove(); }, 1200);
    showToast('تم تحميل قالب الهيكل بالأكواد. الصفوف التي تحتوي أكواد فقط لن تُحسب كتاسكات عند الرفع.');
  };
})();

// v160 fixes: hide user picker in structure distribution, filter generated code-only rows harder, and shorten visible task names.
(function(){
  function safeText(value){ return normalizeText(value || ''); }
  function structureTaskShortNo(taskNo){
    const text = safeText(taskNo);
    const match = text.match(/(?:^|-)N(\d{2,3})(?:$|[^0-9])/i);
    return match ? `N${match[1]}` : (text.length > 28 ? text.slice(-14) : text);
  }
  function knownUserTextSet(){
    const set = new Set();
    (Array.isArray(users) ? users : []).forEach(user => {
      [userName(user), user?.name, user?.displayName, user?.username, user?.email, user?.id, user?.uid, user?.code, user?.userCode, user?.shortCode].forEach(value => {
        const clean = structureHeaderKey(value || '');
        if(clean) set.add(clean);
      });
    });
    return set;
  }
  function isKnownUserLikeValue(value){
    const clean = structureHeaderKey(value || '');
    if(!clean) return true;
    if(['n','b','a','user','يوزر'].includes(clean)) return true;
    if(knownUserTextSet().has(clean)) return true;
    return false;
  }
  function isMeaningfulExecutionValue(value, opts = {}){
    const text = safeText(value);
    if(!text) return false;
    if(isPlaceholderStructureText(text)) return false;
    if(isStructureCodeOnlyValue(text)) return false;
    if(isKnownUserLikeValue(text)) return false;
    const key = structureHeaderKey(text);
    if(['montage','design','photo','content','قسم المونتاج','قسم التصميم','قسم التصوير','قسم المحتوى'].includes(key)) return false;
    if(!opts.allowNumber && /^\d+$/.test(text)) return false;
    if(text.length < 2) return false;
    return true;
  }
  const oldIsRealStructureDistributionRowV160 = isRealStructureDistributionRow;
  isRealStructureDistributionRow = function(row){
    if(!row) return false;
    const textFields = [row.goal, row.tangibleGoal, row.idea, row.description, row.message, row.contentAngle, row.highlightTranslation];
    const strongTextCount = textFields.filter(value => isMeaningfulExecutionValue(value)).length;
    const writerOrCtaCount = [row.writerRequest, row.cta].filter(value => isMeaningfulExecutionValue(value)).length;
    const explicitType = isMeaningfulExecutionValue(row.contentType);
    // صفوف القالب الجاهزة التي تحتوي فقط كود التاسك/القسم/اليوزر لا تعتبر تاسكات.
    return !!(strongTextCount || (explicitType && writerOrCtaCount) || (explicitType && strongTextCount));
  };
  const oldStructureDistributionRowsV160 = structureDistributionRows;
  structureDistributionRows = function(structure){
    const rows = oldStructureDistributionRowsV160 ? oldStructureDistributionRowsV160(structure) : [];
    const seen = new Set();
    return (rows || []).filter(row => {
      if(!isRealStructureDistributionRow(row)) return false;
      const taskNo = safeText(row.taskNo || '');
      const key = taskNo || [row.contentType, row.idea, row.description, row.message].map(safeText).join('|');
      if(key && seen.has(key)) return false;
      if(key) seen.add(key);
      return true;
    }).map((row, index) => ({
      ...row,
      contentType: safeText(row.contentType || row.contentName || row.idea || row.description || ''),
      taskNo: safeText(row.taskNo || '') || `N${String(index + 1).padStart(2, '0')}`
    }));
  };
  structureContentTaskLabel = function(row, fallback = 'نوع محتوى'){
    const shortNo = structureTaskShortNo(row?.taskNo || '');
    const type = safeText(row?.contentType || row?.contentName || fallback || 'تاسك');
    return [shortNo, type].filter(Boolean).join(' - ') || 'تاسك';
  };
  shortTaskName = function(task){
    const row = task?.structureRow || {};
    const taskNo = structureTaskNumber(task) || row.taskNo || '';
    const shortNo = structureTaskShortNo(taskNo);
    const isCampaignWriting = typeof isCampaignContentWritingTask === 'function' && isCampaignContentWritingTask(task);
    if(!isCampaignWriting && (task?.structureGenerated || task?.source === 'campaign-structure-distribution-linked' || taskNo)){
      const type = safeText(row.contentType || task?.taskType || task?.structureTaskLabel || task?.creative || task?.product || 'تاسك');
      return escapeHtml([shortNo, type].filter(Boolean).join(' - '));
    }
    const name = isCampaignWriting ? safeText(task.taskType || task.structureTaskLabel || task.creative || 'كتابة محتوى') : safeText(task.structureTaskLabel || task.taskType || task.creative || task.product || 'تاسك');
    return escapeHtml(name);
  };
  // Popup التوزيع يعتمد على أكواد الشيت واختيارات الكرييتيف فقط؛ لا اختيار يوزرات يدوي هنا.
  openStructureDistributionPopup = function(rowEl){
    if(!rowEl) return;
    closeStructureDistributionPopup();
    const rowIndex = Number(rowEl.dataset.structureRow || 0);
    const meta = readStructureRowMeta(rowEl);
    const title = rowEl.querySelector('.structure-assign-info strong')?.textContent || 'تاسك الهيكل';
    const popup = document.createElement('div');
    popup.className = 'structure-distribution-popup';
    popup.innerHTML = `<div class="structure-popup-backdrop" data-close-structure-distribution-popup></div><section class="structure-popup-dialog" role="dialog" aria-modal="true"><div class="structure-popup-head"><div><h3>${escapeHtml(title)}</h3><p>اختار المنصات وتاريخ النشر والكابشن والهاشتاج. اليوزر يتم ربطه تلقائيًا من أكواد الشيت واختيارات الكرييتيف.</p></div><button type="button" class="task-modal-close" data-close-structure-distribution-popup>×</button></div><div class="structure-popup-body" data-structure-popup-row="${rowIndex}"><div class="structure-popup-section"><h4>المنصات ونوع المنشور</h4><div class="structure-popup-platform-list">${structurePlatformRowsHtml(meta)}</div></div><div class="structure-popup-grid"><label class="field"><span>تاريخ النشر</span><input type="date" class="js-structure-publish-date" value="${escapeHtml(meta.publishDate || meta.date || '')}"></label><label class="field"><span>الكابشن</span><textarea class="js-structure-caption" rows="3">${escapeHtml(meta.caption || '')}</textarea></label><label class="field"><span>الهاشتاج</span><textarea class="js-structure-hashtags" rows="3">${escapeHtml(meta.hashtagsText || meta.hashtags || '')}</textarea></label></div></div><div class="structure-popup-actions"><button type="button" class="btn btn-light" data-close-structure-distribution-popup>إلغاء</button><button type="button" class="btn btn-primary" data-save-structure-distribution-popup>حفظ بيانات التاسك</button></div></section>`;
    popup._structureRowEl = rowEl;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('open'), 0);
  };
  const oldCollectStructurePopupMetaV160 = collectStructurePopupMeta;
  collectStructurePopupMeta = function(popup){
    const meta = oldCollectStructurePopupMetaV160 ? oldCollectStructurePopupMetaV160(popup) : {};
    meta.assignees = [];
    return meta;
  };
  saveStructureDistributionPopup = function(){
    const popup = document.querySelector('.structure-distribution-popup');
    if(!popup) return;
    const meta = collectStructurePopupMeta(popup);
    if(!meta.platforms.length) return showToast('اختار منصة واحدة على الأقل.');
    const missingType = (meta.platformPublishing || []).some(item => !item.postType);
    if(missingType) return showToast('اختار نوع المنشور لكل منصة.');
    writeStructureRowMeta(popup._structureRowEl, { ...meta, distributionSaved: true, assignmentSaved: true });
    closeStructureDistributionPopup();
  };
})();

// v161 fix: تجهيز النشر يقرأ تاسكات الهيكل الموزعة بعد اختيار المنصات وتاريخ النشر.
(function(){
  function prepHasPublishingMetaV161(task){
    if(!task) return false;
    const publishing = Array.isArray(task.platformPublishing) ? task.platformPublishing : [];
    const platforms = Array.isArray(task.platforms) ? task.platforms : (task.platform ? [task.platform] : []);
    return !!(
      publishing.length ||
      platforms.length ||
      normalizeText(task.publishDate || task.date || task.scheduleDate || task.scheduledDate || '') ||
      normalizeText(task.caption || task.hashtags || task.hashtagsText || '') ||
      (task.platformTypes && Object.keys(task.platformTypes || {}).length)
    );
  }
  function prepIsStructureDistributionTaskV161(task){
    const source = normalizeText(task?.source || task?.raw?.source || '');
    return !!(task?.structureGenerated || task?.parentStructureTaskId || source.includes('campaign-structure-distribution'));
  }
  function prepTaskAssignedV161(task){
    if(isCurrentUserAdmin()) return true;
    return taskAssignedToCurrentUser(task) || currentUserMatchesTaskExact(task);
  }
  function prepNormalizeExistingTaskV161(task){
    const campaign = campaignForPrepTask(task) || campaignForTask(task) || {};
    const row = task.structureRow || task.raw?.structureRow || {};
    const base = {
      id: `task_${task.id || task.taskId || task.code || task.taskNo || Math.random().toString(36).slice(2)}`,
      sourceType: task.sourceType || (prepIsStructureDistributionTaskV161(task) ? 'structure' : 'campaign'),
      sourceLabel: task.sourceLabel || (prepIsStructureDistributionTaskV161(task) ? 'هيكل' : (campaign.campaignName || campaign.name ? 'حملة' : 'تاسك')),
      title: shortTaskName?.(task) || task.title || task.name || task.taskName || task.structureTaskLabel || row.contentType || 'تاسك تجهيز نشر',
      campaignName: campaign.campaignName || campaign.name || task.campaignName || '',
      type: row.contentType || prepTaskTypeLabel(task),
      requiredFile: prepTaskRequiredFileLabel(task),
      platforms: normalizePrepPlatformList(task.platforms || task.platform || campaign.platforms || campaign.platform),
      platformTypes: task.platformTypes || {},
      platformPublishing: Array.isArray(task.platformPublishing) ? task.platformPublishing : [],
      postType: task.postType || task.publishType || '',
      postTypeLabel: task.postTypeLabel || '',
      requiredDimensions: task.requiredDimensions || null,
      caption: task.caption || task.copy || campaign.caption || '',
      hashtags: task.hashtags || task.hashtagsText || campaign.hashtags || '',
      publishDate: prepTaskDate(task, campaign),
      publishTime: task.publishTime || task.scheduleTime || '',
      deadline: task.deadline || task.dueDate || task.requiredDate || '',
      notes: task.notes || task.note || task.instructions || task.description || row.description || '',
      raw: task
    };
    return enrichPrepTaskFromSchedule(base, campaign, task);
  }
  publishPrepTasksFromExistingTasks = function(){
    const visible = typeof getVisibleTasksForCurrentUser === 'function' ? getVisibleTasksForCurrentUser() : campaignTasks;
    return (visible || [])
      .filter(task => {
        if(!prepTaskAssignedV161(task)) return false;
        if(isCampaignContentWritingPrepTask(task)) return false;
        const isStructure = prepIsStructureDistributionTaskV161(task);
        const hasPublishing = prepHasPublishingMetaV161(task);
        // تاسكات الهيكل التي تم تجهيز بيانات النشر لها تظهر حتى لو كانت بانتظار الاستلام أو اعتماد سابق.
        if(isStructure && hasPublishing) return true;
        return !isTaskWaitingForDependency(task);
      })
      .map(prepNormalizeExistingTaskV161);
  };
  if(getRoute && getRoute() === 'publish-prep') renderPublishPrepPage();
})();


// v162: one structure request per campaign row, no content section inside creative step, link execution roles to all step-1 content writers.
(function(){
  const oldEnsurePanelHasAllRoleAssignmentsV162 = ensurePanelHasAllRoleAssignments;
  ensurePanelHasAllRoleAssignments = function(panel){
    if(!panel) return panel;
    const grid = panel.querySelector('.creative-assignment-inner-grid');
    if(!grid) return panel;
    // قسم المحتوى يتحدد من الخطوة الأولى فقط، لذلك لا يظهر داخل ربط الكرييتيف.
    grid.querySelectorAll('[data-assignment-role="content"]').forEach(block => block.remove());
    const creativeName = normalizeText(panel.dataset.creativeName || '');
    const mainRole = creativeDepartmentRole(creativeName);
    const existingRoles = new Set([...grid.querySelectorAll('[data-assignment-role]')].map(block => block.dataset.assignmentRole).filter(Boolean));
    const orderedRoles = [mainRole, ...['shooting','design','montage'].filter(role => role !== mainRole)];
    orderedRoles.forEach(role => {
      if(existingRoles.has(role)) return;
      const holder = document.createElement('div');
      const hint = role === mainRole ? 'القسم التنفيذي المرتبط تلقائيًا بنوع الكرييتيف' : 'قسم إضافي متاح للحملة عند الحاجة';
      holder.innerHTML = roleAssignmentBlock(role, defaultRoleSectionName(role), hint);
      const block = holder.firstElementChild;
      if(block) grid.appendChild(block);
    });
    return panel;
  };

  function combinedStructureRequestTaskForCreatives(creatives, quantity = 1){
    const assignees = campaignRequestContentAssignees();
    if(!assignees.ids.length && !assignees.names.length) return null;
    const dep = findDepartmentByRole('content') || {};
    const requestForm = document.getElementById('campaignRequestForm');
    const brief = normalizeText(requestForm?.querySelector('[name="content_writer_brief"]')?.value || '');
    const structureDeadline = normalizeText(requestForm?.querySelector('[name="structure_deadline"]')?.value || '');
    const names = uniqueList((creatives || []).map(normalizeText).filter(Boolean));
    const label = names.length > 1 ? `هيكل حملة - ${names.length} كرييتيف` : (names[0] ? `طلب هيكل - ${names[0]}` : 'طلب هيكل');
    return {
      contentSectionId: dep.id || 'content',
      contentSectionName: dep.name || defaultRoleSectionName('content'),
      taskType: label,
      creativeBundleNames: names,
      structureBundleTask: true,
      quantity: 1,
      requiredDate: structureDeadline ? structureDeadline.slice(0, 10) : '',
      requiredDateTime: structureDeadline,
      structureDeadline,
      contentWriterBrief: brief,
      campaignRequestBrief: brief,
      needsStructureUpload: true,
      structureRequestTask: true,
      sourceRequestStep: 'campaign_request_data',
      userIds: assignees.ids,
      userNames: assignees.names,
      departmentRole: 'content',
      departmentCode: roleCode('content'),
      userCodes: userCodesForTask({ userIds: assignees.ids, userNames: assignees.names }),
      status: 'pending'
    };
  }

  const oldCollectCampaignRowsV162 = collectCampaignRows;
  collectCampaignRows = function(){
    return [...document.querySelectorAll('#creativeRows .creative-row-card')].flatMap(row => {
      const panels = [...row.querySelectorAll('.creative-assignment-panel')].map(syncPanelDynamicState);
      const cars = selectedCarsFromRow(row);
      if(panels.length){
        const panelCreatives = uniqueList(panels.map(panel => normalizeText(panel.dataset.creativeName || '')).filter(Boolean));
        let structureRequestAdded = false;
        const structureRequest = combinedStructureRequestTaskForCreatives(panelCreatives, 1);
        return panels.map(panel => {
          const creative = normalizeText(panel.dataset.creativeName || '');
          const qty = Math.max(1, Math.min(50, Number(panel.querySelector('.js-creative-quantity')?.value || 1)));
          const executionTasks = ['montage','design','shooting'].map(role => selectedRoleTaskFromPanel(panel, role)).filter(Boolean);
          const tasks = [];
          if(structureRequest && !structureRequestAdded){
            tasks.push(structureRequest);
            structureRequestAdded = true;
          }
          tasks.push(...executionTasks);
          return {
            creative,
            creativeShortCode: creativeShortCodeForName(creative),
            quantity: qty,
            tasks,
            departmentAssignments: Object.fromEntries(tasks.map(t => [normalizeDepartmentRole(t.departmentRole || t.contentSectionName || ''), { userIds: t.userIds || [], userNames: t.userNames || [], userCodes: t.userCodes || [], departmentCode: t.departmentCode || roleCode(t.departmentRole || '') }]).filter(([role]) => role)),
            product: creativeProductLabel(creative, panel),
            selectedCars: cars,
            workflowMode: 'creative_user_wizard',
            assignmentMode: 'per_creative_full_binding',
            contentWritersSource: 'campaign_request_step'
          };
        }).filter(item => item.creative || item.tasks.length || item.product || item.selectedCars.length);
      }
      return oldCollectCampaignRowsV162 ? oldCollectCampaignRowsV162.call(this).filter(Boolean) : [];
    });
  };

  const oldBuildDepartmentTasksV162 = buildDepartmentTasks;
  buildDepartmentTasks = function(campaignId, payload){
    const rawTasks = oldBuildDepartmentTasksV162 ? oldBuildDepartmentTasksV162(campaignId, payload) : [];
    const structureTasks = rawTasks.filter(task => task?.needsStructureUpload && task?.sourceRequestStep === 'campaign_request_data');
    if(structureTasks.length <= 1) return rawTasks;
    const keep = { ...structureTasks[0] };
    const names = uniqueList(structureTasks.flatMap(task => [task.assignedToName, task.assigneeName, task.userName, ...(Array.isArray(task.userNames) ? task.userNames : [])].filter(Boolean)));
    const ids = uniqueList(structureTasks.flatMap(task => [task.assignedToId, task.assignedToUid, task.assigneeUid, task.userId, task.userUid, ...(Array.isArray(task.userIds) ? task.userIds : [])].filter(Boolean)));
    const emails = uniqueList(structureTasks.flatMap(task => [task.assignedToEmail, task.assigneeEmail, task.userEmail].filter(Boolean)));
    const search = uniqueList(structureTasks.flatMap(task => [task.assignedToSearch, task.searchKeys, task.assignedToId, task.assignedToUid, task.assignedToName, task.assignedToEmail, task.userId, task.userName, task.userEmail]).flat().filter(Boolean));
    keep.userIds = ids;
    keep.userNames = names;
    keep.assignedToIds = ids;
    keep.assignedToNames = names;
    keep.assignedToEmails = emails;
    keep.assignedUsers = ids.map((id, i) => ({ id, name: names[i] || id, email: emails[i] || '' }));
    keep.assignedToName = names.join('، ') || keep.assignedToName;
    keep.assigneeName = keep.assignedToName;
    keep.userName = keep.assignedToName;
    keep.assignedToSearch = search;
    keep.searchKeys = search;
    keep.taskType = keep.taskType && keep.taskType.includes('هيكل حملة') ? keep.taskType : (keep.creativeBundleNames?.length > 1 ? `هيكل حملة - ${keep.creativeBundleNames.length} كرييتيف` : keep.taskType);
    const structureIds = new Set(structureTasks.map(t => t.id));
    const out = [keep, ...rawTasks.filter(task => !structureIds.has(task.id))];
    return out.map((task, index) => ({ ...task, id: task.id || `${campaignId}-task-${String(index + 1).padStart(3,'0')}` }));
  };
})();


/* v163 - per content writer structure tasks + execution users linked to selected content writers */
(function(){
  const MZJ_V163 = true;
  contentDependencyPickerHtml = function(role){
    if(role === 'content') return '';
    const roleLabel = defaultRoleSectionName(role);
    return `<div class="content-dependency-picker js-content-dependency" data-dependency-for="${escapeHtml(role)}">
      <div class="content-dependency-title"><strong>${escapeHtml(roleLabel)} يشتغل على شغل أي كاتب محتوى؟</strong><small>اختار كاتب المحتوى يدويًا</small></div>
      <div class="content-dependency-options"><div class="multi-empty">اختار كاتب محتوى من الخطوة الأولى</div></div>
    </div>`;
  };

  refreshContentDependencyPickers = function(panel){
    if(!panel) return;
    const requestAssignees = campaignRequestContentAssignees();
    const contentIds = requestAssignees.ids || [];
    const contentNames = requestAssignees.names || [];
    panel.querySelectorAll('.js-content-dependency').forEach(box => {
      const selectedIds = storedMultiValues(box, 'selectedIds');
      const selectedNames = storedMultiValues(box, 'selectedNames');
      const options = box.querySelector('.content-dependency-options');
      if(!options) return;
      if(!contentIds.length && !contentNames.length){
        box.dataset.selectedIds = '';
        box.dataset.selectedNames = '';
        options.innerHTML = '<div class="multi-empty">اختار كاتب محتوى من الخطوة الأولى</div>';
        return;
      }
      const rows = Math.max(contentIds.length, contentNames.length);
      const hasPrevious = selectedIds.length || selectedNames.length;
      options.innerHTML = Array.from({length: rows}, (_, i) => {
        const id = contentIds[i] || contentNames[i] || '';
        const name = contentNames[i] || contentIds[i] || '';
        const checked = hasPrevious ? (selectedIds.includes(id) || selectedNames.includes(name)) : false;
        return `<label><input type="checkbox" class="js-content-dependency-check" value="${escapeHtml(id)}" data-name="${escapeHtml(name)}"${checked ? ' checked' : ''}> <span>${escapeHtml(name)}</span></label>`;
      }).join('');
      syncContentDependencyState(box);
    });
  };

  selectedContentDependency = function(panel, role){
    const box = panel?.querySelector(`.js-content-dependency[data-dependency-for="${role}"]`);
    syncContentDependencyState(box);
    let ids = storedMultiValues(box, 'selectedIds');
    let names = storedMultiValues(box, 'selectedNames');
    const requestAssignees = campaignRequestContentAssignees();
    if(!ids.length && !names.length){
      ids = requestAssignees.ids || [];
      names = requestAssignees.names || [];
    }
    return { ids, names, links: [] };
  };

  // Re-render dependency choices when content writers change in step 1.
  document.addEventListener('change', function(event){
    if(event.target.closest('#campaignRequestForm .js-request-content-writers')){
      document.querySelectorAll('.creative-assignment-panel').forEach(refreshContentDependencyPickers);
    }
  }, true);

  const oldCreativeAssignmentRoleBlocksHtmlV163 = creativeAssignmentRoleBlocksHtml;
  creativeAssignmentRoleBlocksHtml = function(creativeName){
    const mainRole = creativeDepartmentRole(creativeName);
    const roles = ['shooting','design','montage'];
    const orderedRoles = [mainRole, ...roles.filter(role => role !== mainRole)];
    const mainHint = 'القسم التنفيذي المرتبط تلقائيًا بنوع الكريتيف';
    const optionalHint = 'قسم إضافي اختياري للحملة عند الحاجة';
    return orderedRoles.map(role => roleAssignmentBlock(role, defaultRoleSectionName(role), role === mainRole ? mainHint : optionalHint)).join('');
  };

  // Keep each content writer as a separate structure-request task. Do not merge them.
  buildDepartmentTasks = function(campaignId, payload){
    return buildCampaignTaskDocs(campaignId, payload).map((task, index) => {
      const clean = { ...task };
      delete clean.createdAt;
      delete clean.updatedAt;
      clean.id = `${campaignId}-task-${String(index + 1).padStart(3,'0')}`;
      clean.campaignId = campaignId;
      clean.received = false;
      clean.receivedConfirmed = false;
      clean.progress = 0;
      clean.status = clean.status || 'pending';
      clean.attachments = Array.isArray(clean.attachments) ? clean.attachments : [];
      return clean;
    });
  };
})();


/* v164 - no default content-writer checks + remove execution angle/highlight columns from template */
(function(){
  const APP_CACHE_VERSION = '175';
  try{ window.MZJ_APP_VERSION = APP_CACHE_VERSION; }catch(e){}

  const oldSelectedContentDependencyV164 = selectedContentDependency;
  selectedContentDependency = function(panel, role){
    const box = panel?.querySelector(`.js-content-dependency[data-dependency-for="${role}"]`);
    syncContentDependencyState(box);
    let ids = storedMultiValues(box, 'selectedIds');
    let names = storedMultiValues(box, 'selectedNames');
    // لو المستخدم ماختارش كاتب محتوى بنفسه، نسيب الربط فاضي بدل الافتراضي القديم.
    return { ids, names, links: [] };
  };

  const oldRefreshContentDependencyPickersV164 = refreshContentDependencyPickers;
  refreshContentDependencyPickers = function(panel){
    if(!panel) return;
    const requestAssignees = campaignRequestContentAssignees();
    const contentIds = requestAssignees.ids || [];
    const contentNames = requestAssignees.names || [];
    panel.querySelectorAll('.js-content-dependency').forEach(box => {
      const selectedIds = storedMultiValues(box, 'selectedIds');
      const selectedNames = storedMultiValues(box, 'selectedNames');
      const options = box.querySelector('.content-dependency-options');
      if(!options) return;
      if(!contentIds.length && !contentNames.length){
        box.dataset.selectedIds = '';
        box.dataset.selectedNames = '';
        options.innerHTML = '<div class="multi-empty">اختار كاتب محتوى من الخطوة الأولى</div>';
        return;
      }
      const rows = Math.max(contentIds.length, contentNames.length);
      const hasPrevious = selectedIds.length || selectedNames.length;
      options.innerHTML = Array.from({length: rows}, (_, i) => {
        const id = contentIds[i] || contentNames[i] || '';
        const name = contentNames[i] || contentIds[i] || '';
        const checked = hasPrevious ? (selectedIds.includes(id) || selectedNames.includes(name)) : false;
        return `<label><input type="checkbox" class="js-content-dependency-check" value="${escapeHtml(id)}" data-name="${escapeHtml(name)}"${checked ? ' checked' : ''}> <span>${escapeHtml(name)}</span></label>`;
      }).join('');
      syncContentDependencyState(box);
    });
  };

  downloadStructureTemplateForTaskExact = async function(task){
    if(!window.JSZip) throw new Error('JSZip is not loaded');
    const zip = await window.JSZip.loadAsync(STRUCTURE_TEMPLATE_BASE64_V145, { base64: true });
    const sheetPath = 'xl/worksheets/sheet1.xml';
    const sheetFile = zip.file(sheetPath);
    if(!sheetFile) throw new Error('Structure template sheet is missing');
    let sheetXml = await sheetFile.async('string');
    const campaignCode = campaignCodeForTask(task);
    const creativeCode = templateCreativeLinkCodeForTask({ ...task, campaignCode });
    const writerCode = contentWriterCodeForTask(task);
    const writerName = task.assignedToName || task.userName || task.assigneeName || '';
    const creativeName = task.creative || task.product || (task.taskType || '').replace(/^طلب\s*هيكل\s*-?/i, '').trim() || '';
    const campaign = campaignRecordForTask(task) || {};
    const campaignName = task.campaignName || task.campaignTitle || task.campaign || campaign.campaignName || campaign.name || '';
    const campaignTypeName = task.campaignTypeName || task.campaignType || task.typeName || task.type || campaign.campaignTypeName || campaign.campaignType || campaign.typeName || campaign.type || '';
    const creativeShortCode = creativeShortCodeForName(creativeName);
    const creativeRow = creativeAssignmentForStructureRow(campaign, task, { creativeShortCode, taskNo: creativeCode });
    const mainRole = creativeDepartmentRole(creativeName || creativeRow?.creative || '');
    const roleTask = assignmentForRoleFromCreativeRow(creativeRow, mainRole) || {};
    const deptCode = roleCode(mainRole);
    const execUserCodes = uniqueList([...(Array.isArray(roleTask.userCodes) ? roleTask.userCodes : []), ...userCodesForTask(roleTask)]).filter(Boolean).join(',');
    const userCode = execUserCodes || 'USER';
    const patches = {
      A1: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
      A35: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
      B2: 'اسم الحملة', C2: campaignName || '',
      B3: 'كود الحملة', C3: campaignCode || '',
      B4: 'كود الكرييتيف', C4: creativeCode || '',
      B5: 'الكرييتيف المطلوب للهيكل', C5: creativeName || '',
      B6: 'كاتب المحتوى', C6: writerName || '',
      B7: 'كود كاتب المحتوى', C7: writerCode || '',
      B8: 'نوع الحمله', C8: campaignTypeName || '',
      B9: 'معنى العنصر داخل MZJ', C9: '',
      B10: 'دور العنصر في تعزيز الثقة', C10: '',
      B11: 'الهدف الاستراتيجي للحملة', C11: '',
      B12: 'الهدف النهائي للحملة', C12: '',
      B13: 'الترجمة الملموسة للهدف النهائي', C13: '',
      B14: 'الرسالة الرئيسية', C14: '',
      B15: 'إحساس الحملة', C15: '',
      B16: 'الترجمة التنفيذية لإحساس الحملة', C16: '',
      B17: 'نوع المحتوى', C17: '',
      B18: 'زاوية المحتوى', C18: '',
      B19: 'ما يجب إبرازه', C19: '',
      B20: 'الترجمة التنفيذية لما يجب إبرازه', C20: '',
      B21: 'ما يجب تجنبه', C21: '',
      B22: 'CTA', C22: '',
      // Content Execution Direction: حذف زاوية المحتوى والترجمة التنفيذية من الجدول فقط.
      I36: 'المطلوب من الكاتب', J36: 'CTA',
      K36: 'كود الكرييتيف المختصر', L36: 'كود القسم', M36: 'كود اليوزر', N36: 'كود كاتب المحتوى',
      O36: '', P36: ''
    };
    sheetXml = patchWorkbookCellsInlineV148(sheetXml, patches);
    const writerPrefix = writerCode || 'N';
    for(let index = 0; index < 50; index += 1){
      const rowNumber = 37 + index;
      const n = String(index + 1).padStart(2, '0');
      const fullTaskCode = creativeCode ? `${creativeCode}-${creativeShortCode}-${deptCode}-${userCode}-N${n}` : '';
      const rowPatches = {
        [`A${rowNumber}`]: index === 0 ? (campaignTypeName || '') : '',
        [`C${rowNumber}`]: fullTaskCode,
        [`K${rowNumber}`]: creativeShortCode,
        [`L${rowNumber}`]: deptCode,
        [`M${rowNumber}`]: userCode,
        [`N${rowNumber}`]: writerPrefix,
        [`O${rowNumber}`]: '',
        [`P${rowNumber}`]: ''
      };
      // B,D,E,F,G,H للكاتب. I,J للمطلوب من الكاتب و CTA. O,P تفريغ بقايا الأعمدة القديمة.
      ['B','D','E','F','G','H','I','J','O','P'].forEach(col => { rowPatches[`${col}${rowNumber}`] = ''; });
      sheetXml = patchWorkbookCellsInlineV148(sheetXml, rowPatches);
    }
    zip.file(sheetPath, sheetXml);
    const out = await zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileBase = safeStorageSegment([creativeCode, creativeName || 'هيكل'].filter(Boolean).join('-'));
    const blobUrl = URL.createObjectURL(out);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${fileBase || 'campaign-structure'}-template.xlsx`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(blobUrl); a.remove(); }, 1200);
    showToast('تم تحميل قالب الهيكل بالأكواد بدون زاوية المحتوى والترجمة التنفيذية في جدول التنفيذ.');
  };
})();

/* v165 - per-user content-writer linking inside execution roles + clearer dashboard names + full task details scroll */
(function(){
  const APP_CACHE_VERSION = '175';
  try{ window.MZJ_APP_VERSION = APP_CACHE_VERSION; }catch(e){}

  function v165Encode(value){
    try{ return encodeURIComponent(JSON.stringify(value || [])); }catch(_){ return ''; }
  }
  function v165Decode(value){
    try{ return JSON.parse(decodeURIComponent(value || '[]')) || []; }catch(_){ return []; }
  }
  function v165Same(a, b){ return normalizeText(a || '') && normalizeText(a || '') === normalizeText(b || ''); }
  function v165LinkMatchesContent(link, contentId, contentName){
    const ids = Array.isArray(link?.contentUserIds) ? link.contentUserIds : [];
    const names = Array.isArray(link?.contentUserNames) ? link.contentUserNames : [];
    return ids.some(id => v165Same(id, contentId)) || names.some(name => v165Same(name, contentName));
  }
  function v165LinkMatchesExec(link, execId, execName){
    return v165Same(link?.executorUserId, execId) || v165Same(link?.executorUserName, execName) || v165Same(link?.userId, execId) || v165Same(link?.userName, execName);
  }
  function v165PanelRoleBlock(panel, role){
    return panel?.querySelector(`[data-assignment-role="${role}"]`) || null;
  }
  function v165RolePicker(block, role){
    return block?.querySelector(`.js-role-picker[data-role="${role}"]`) || null;
  }
  function v165ContentWriters(){
    const req = campaignRequestContentAssignees ? campaignRequestContentAssignees() : { ids: [], names: [] };
    const ids = Array.isArray(req.ids) ? req.ids : [];
    const names = Array.isArray(req.names) ? req.names : [];
    const rows = Math.max(ids.length, names.length);
    return Array.from({ length: rows }, (_, i) => ({
      id: normalizeText(ids[i] || names[i] || ''),
      name: normalizeText(names[i] || ids[i] || '')
    })).filter(item => item.id || item.name);
  }
  function v165ExecutorUsers(block, role){
    const picker = v165RolePicker(block, role);
    const ids = selectedOptionValues(picker);
    const names = selectedOptionTexts(picker);
    const rows = Math.max(ids.length, names.length);
    return Array.from({ length: rows }, (_, i) => ({
      id: normalizeText(ids[i] || names[i] || ''),
      name: normalizeText(names[i] || ids[i] || '')
    })).filter(item => item.id || item.name);
  }
  function v165GetStoredLinks(block){
    return v165Decode(block?.dataset?.userContentLinks || '');
  }
  function v165SetStoredLinks(block, links){
    if(block) block.dataset.userContentLinks = v165Encode(links || []);
  }
  function v165RenderUserContentLinksForBlock(block){
    if(!block) return [];
    const role = normalizeDepartmentRole(block.dataset.assignmentRole || '');
    if(!role || role === 'content') return [];
    const writers = v165ContentWriters();
    const execUsers = v165ExecutorUsers(block, role);
    let wrap = block.querySelector('.js-user-content-linker');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.className = 'user-content-linker js-user-content-linker';
      const dependency = block.querySelector('.js-content-dependency');
      if(dependency) dependency.replaceWith(wrap);
      else block.insertBefore(wrap, block.querySelector('.creative-role-deadline-field') || null);
    }
    const previous = v165GetStoredLinks(block);
    if(!execUsers.length){
      v165SetStoredLinks(block, []);
      wrap.innerHTML = '<div class="multi-empty">اختار يوزر من القسم الأول</div>';
      return [];
    }
    if(!writers.length){
      v165SetStoredLinks(block, []);
      wrap.innerHTML = '<div class="multi-empty">اختار كاتب محتوى من الخطوة الأولى</div>';
      return [];
    }
    wrap.innerHTML = `<div class="content-dependency-title"><strong>${escapeHtml(defaultRoleSectionName(role))}: ربط كل يوزر بكاتب محتوى</strong><small>اختار لكل يوزر تنفيذي هيشتغل على شغل أي كاتب محتوى</small></div><div class="user-content-link-rows">${execUsers.map(exec => {
      const old = previous.find(link => v165LinkMatchesExec(link, exec.id, exec.name)) || {};
      const selectedIds = Array.isArray(old.contentUserIds) ? old.contentUserIds : [];
      const selectedNames = Array.isArray(old.contentUserNames) ? old.contentUserNames : [];
      return `<div class="user-content-link-row js-user-content-link-row" data-exec-id="${escapeHtml(exec.id)}" data-exec-name="${escapeHtml(exec.name)}"><div class="user-content-link-name">${escapeHtml(exec.name || exec.id)}</div><div class="user-content-link-options">${writers.map(writer => {
        const checked = selectedIds.includes(writer.id) || selectedNames.includes(writer.name);
        return `<label><input type="checkbox" class="js-user-content-link-check" value="${escapeHtml(writer.id)}" data-name="${escapeHtml(writer.name)}"${checked ? ' checked' : ''}> <span>${escapeHtml(writer.name || writer.id)}</span></label>`;
      }).join('')}</div></div>`;
    }).join('')}</div>`;
    return v165SyncUserContentLinks(block);
  }
  function v165SyncUserContentLinks(block){
    if(!block) return [];
    const role = normalizeDepartmentRole(block.dataset.assignmentRole || '');
    if(!role || role === 'content') return [];
    const links = [...block.querySelectorAll('.js-user-content-link-row')].map(row => {
      const checks = [...row.querySelectorAll('.js-user-content-link-check:checked')];
      return {
        executorUserId: normalizeText(row.dataset.execId || ''),
        executorUserName: normalizeText(row.dataset.execName || ''),
        userId: normalizeText(row.dataset.execId || ''),
        userName: normalizeText(row.dataset.execName || ''),
        role,
        departmentRole: role,
        departmentCode: roleCode(role),
        contentUserIds: checks.map(input => normalizeText(input.value || '')).filter(Boolean),
        contentUserNames: checks.map(input => normalizeText(input.dataset.name || '')).filter(Boolean)
      };
    }).filter(link => link.executorUserId || link.executorUserName);
    v165SetStoredLinks(block, links);
    block.querySelectorAll('.js-user-content-link-check').forEach(input => {
      if(input.checked) input.setAttribute('checked','checked'); else input.removeAttribute('checked');
    });
    return links;
  }
  function v165RefreshUserContentLinks(panel){
    if(!panel) return;
    panel.querySelectorAll('[data-assignment-role]').forEach(block => {
      const role = normalizeDepartmentRole(block.dataset.assignmentRole || '');
      if(role && role !== 'content') v165RenderUserContentLinksForBlock(block);
    });
  }
  function v165LinksForPanelRole(panel, role){
    const block = v165PanelRoleBlock(panel, role);
    if(!block) return [];
    // Rebuild if picker changed, then sync current checks.
    v165RenderUserContentLinksForBlock(block);
    return v165SyncUserContentLinks(block);
  }

  const oldSyncPanelDynamicStateV165 = syncPanelDynamicState;
  syncPanelDynamicState = function(panel){
    const result = oldSyncPanelDynamicStateV165 ? oldSyncPanelDynamicStateV165(panel) : panel;
    v165RefreshUserContentLinks(panel);
    return result;
  };

  const oldRefreshContentDependencyPickersV165 = refreshContentDependencyPickers;
  refreshContentDependencyPickers = function(panel){
    if(oldRefreshContentDependencyPickersV165) oldRefreshContentDependencyPickersV165(panel);
    v165RefreshUserContentLinks(panel);
  };

  selectedContentDependency = function(panel, role){
    const cleanRole = normalizeDepartmentRole(role || '');
    if(cleanRole && cleanRole !== 'content'){
      const links = v165LinksForPanelRole(panel, cleanRole).filter(link => (link.contentUserIds || []).length || (link.contentUserNames || []).length);
      const ids = uniqueList(links.flatMap(link => link.contentUserIds || []).filter(Boolean));
      const names = uniqueList(links.flatMap(link => link.contentUserNames || []).filter(Boolean));
      return { ids, names, links };
    }
    return { ids: [], names: [], links: [] };
  };

  const oldSelectedRoleTaskFromPanelV165 = selectedRoleTaskFromPanel;
  selectedRoleTaskFromPanel = function(panel, role){
    const task = oldSelectedRoleTaskFromPanelV165 ? oldSelectedRoleTaskFromPanelV165(panel, role) : null;
    if(!task) return task;
    const cleanRole = normalizeDepartmentRole(role || '');
    if(cleanRole && cleanRole !== 'content'){
      const linked = selectedContentDependency(panel, cleanRole);
      task.dependencyLinks = Array.isArray(linked.links) ? linked.links : [];
      task.dependsOnContentUserIds = linked.ids || [];
      task.dependsOnContentUserNames = linked.names || [];
      task.upstreamUserIds = linked.ids || [];
      task.upstreamUserNames = linked.names || [];
      task.upstreamUserLabel = (linked.names || []).join('، ');
      task.manualContentWriterLinks = true;
    }
    return task;
  };

  function v165FilterAssignmentForWriter(roleTask, writerTask){
    if(!roleTask) return roleTask;
    const writerIds = uniqueList([...(Array.isArray(writerTask?.userIds) ? writerTask.userIds : []), writerTask?.assignedToId, writerTask?.assignedToUid, writerTask?.assigneeUid, writerTask?.userId].map(normalizeText).filter(Boolean));
    const writerNames = uniqueList([...(Array.isArray(writerTask?.userNames) ? writerTask.userNames : []), writerTask?.assignedToName, writerTask?.assigneeName, writerTask?.userName, writerTask?.displayName].map(normalizeText).filter(Boolean));
    const links = Array.isArray(roleTask.dependencyLinks) ? roleTask.dependencyLinks : [];
    if(!links.length) return roleTask;
    const matched = links.filter(link => {
      const ids = Array.isArray(link.contentUserIds) ? link.contentUserIds : [];
      const names = Array.isArray(link.contentUserNames) ? link.contentUserNames : [];
      return ids.some(id => writerIds.includes(normalizeText(id))) || names.some(name => writerNames.includes(normalizeText(name)));
    });
    if(!matched.length) return { ...roleTask, userIds: [], userNames: [], userCodes: [] };
    const userIds = uniqueList(matched.map(link => normalizeText(link.executorUserId || link.userId || '')).filter(Boolean));
    const userNames = uniqueList(matched.map(link => normalizeText(link.executorUserName || link.userName || '')).filter(Boolean));
    return { ...roleTask, userIds, userNames, userCodes: userCodesForTask({ userIds, userNames }) };
  }

  // Override template generation so each content writer template gets only the execution users linked to that writer.
  downloadStructureTemplateForTaskExact = async function(task){
    if(!window.JSZip) throw new Error('JSZip is not loaded');
    const zip = await window.JSZip.loadAsync(STRUCTURE_TEMPLATE_BASE64_V145, { base64: true });
    const sheetPath = 'xl/worksheets/sheet1.xml';
    const sheetFile = zip.file(sheetPath);
    if(!sheetFile) throw new Error('Structure template sheet is missing');
    let sheetXml = await sheetFile.async('string');
    const campaignCode = campaignCodeForTask(task);
    const creativeCode = templateCreativeLinkCodeForTask({ ...task, campaignCode });
    const writerCode = contentWriterCodeForTask(task);
    const writerName = task.assignedToName || task.userName || task.assigneeName || (Array.isArray(task.userNames) ? task.userNames[0] : '') || '';
    const creativeName = task.creative || task.product || (task.taskType || '').replace(/^طلب\s*هيكل\s*-?/i, '').trim() || '';
    const campaign = campaignRecordForTask(task) || {};
    const campaignName = task.campaignName || task.campaignTitle || task.campaign || campaign.campaignName || campaign.name || '';
    const campaignTypeName = task.campaignTypeName || task.campaignType || task.typeName || task.type || campaign.campaignTypeName || campaign.campaignType || campaign.typeName || campaign.type || '';
    const creativeShortCode = creativeShortCodeForName(creativeName);
    const creativeRow = creativeAssignmentForStructureRow(campaign, task, { creativeShortCode, taskNo: creativeCode });
    const mainRole = creativeDepartmentRole(creativeName || creativeRow?.creative || '');
    const rawRoleTask = assignmentForRoleFromCreativeRow(creativeRow, mainRole) || {};
    const roleTask = v165FilterAssignmentForWriter(rawRoleTask, task) || {};
    const deptCode = roleCode(mainRole);
    const execUserCodes = uniqueList([...(Array.isArray(roleTask.userCodes) ? roleTask.userCodes : []), ...userCodesForTask(roleTask)]).filter(Boolean).join(',');
    const userCode = execUserCodes || '';
    const patches = {
      A1: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
      A35: campaignCode ? `حمله - ${campaignCode}` : 'حمله -',
      B2: 'اسم الحملة', C2: campaignName || '',
      B3: 'كود الحملة', C3: campaignCode || '',
      B4: 'كود الكرييتيف', C4: creativeCode || '',
      B5: 'الكرييتيف المطلوب للهيكل', C5: creativeName || '',
      B6: 'كاتب المحتوى', C6: writerName || '',
      B7: 'كود كاتب المحتوى', C7: writerCode || '',
      B8: 'نوع الحمله', C8: campaignTypeName || '',
      B9: 'معنى العنصر داخل MZJ', C9: '',
      B10: 'دور العنصر في تعزيز الثقة', C10: '',
      B11: 'الهدف الاستراتيجي للحملة', C11: '',
      B12: 'الهدف النهائي للحملة', C12: '',
      B13: 'الترجمة الملموسة للهدف النهائي', C13: '',
      B14: 'الرسالة الرئيسية', C14: '',
      B15: 'إحساس الحملة', C15: '',
      B16: 'الترجمة التنفيذية لإحساس الحملة', C16: '',
      B17: 'نوع المحتوى', C17: '',
      B18: 'زاوية المحتوى', C18: '',
      B19: 'ما يجب إبرازه', C19: '',
      B20: 'الترجمة التنفيذية لما يجب إبرازه', C20: '',
      B21: 'ما يجب تجنبه', C21: '',
      B22: 'CTA', C22: '',
      I36: 'المطلوب من الكاتب', J36: 'CTA',
      K36: 'كود الكرييتيف المختصر', L36: 'كود القسم', M36: 'كود اليوزر', N36: 'كود كاتب المحتوى',
      O36: '', P36: ''
    };
    sheetXml = patchWorkbookCellsInlineV148(sheetXml, patches);
    const writerPrefix = writerCode || '';
    for(let index = 0; index < 50; index += 1){
      const rowNumber = 37 + index;
      const n = String(index + 1).padStart(2, '0');
      const fullTaskCode = creativeCode ? `${creativeCode}-${creativeShortCode}-${deptCode}-${userCode || 'USER'}-N${n}` : '';
      const rowPatches = {
        [`A${rowNumber}`]: index === 0 ? (campaignTypeName || '') : '',
        [`C${rowNumber}`]: fullTaskCode,
        [`K${rowNumber}`]: creativeShortCode,
        [`L${rowNumber}`]: deptCode,
        [`M${rowNumber}`]: userCode,
        [`N${rowNumber}`]: writerPrefix,
        [`O${rowNumber}`]: '',
        [`P${rowNumber}`]: ''
      };
      ['B','D','E','F','G','H','I','J','O','P'].forEach(col => { rowPatches[`${col}${rowNumber}`] = ''; });
      sheetXml = patchWorkbookCellsInlineV148(sheetXml, rowPatches);
    }
    zip.file(sheetPath, sheetXml);
    const out = await zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileBase = safeStorageSegment([creativeCode, writerName || writerCode || '', creativeName || 'هيكل'].filter(Boolean).join('-'));
    const blobUrl = URL.createObjectURL(out);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${fileBase || 'campaign-structure'}-template.xlsx`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(blobUrl); a.remove(); }, 1200);
    showToast('تم تحميل قالب الهيكل بالأكواد حسب ربط كاتب المحتوى باليوزر التنفيذي.');
  };

  document.addEventListener('change', function(event){
    if(event.target.matches('.js-user-content-link-check')){
      const block = event.target.closest('[data-assignment-role]');
      v165SyncUserContentLinks(block);
      updateProductOutput(event.target.closest('.creative-row-card'));
      renderPublishAgenda();
      return;
    }
    if(event.target.closest('.js-role-picker')){
      const panel = event.target.closest('.creative-assignment-panel');
      setTimeout(() => v165RefreshUserContentLinks(panel), 0);
    }
    if(event.target.closest('#campaignRequestForm .js-request-content-writers')){
      setTimeout(() => document.querySelectorAll('.creative-assignment-panel').forEach(v165RefreshUserContentLinks), 0);
    }
  }, true);

  // Initial refresh for already-rendered panels.
  setTimeout(() => document.querySelectorAll('.creative-assignment-panel').forEach(v165RefreshUserContentLinks), 100);
})();

/* v171 - content task template workflow linked to execution tasks */
(function(){
  const VERSION = 'v180';
  try{ window.MZJ_APP_VERSION = VERSION; }catch(_){ }

  function v171PairKey(parentTask, row, assigneeId, role){
    return [
      normalizeText(parentTask?.campaignId || parentTask?.campaignCode || ''),
      normalizeText(parentTask?.id || ''),
      normalizeText(parentTask?.assignedToId || parentTask?.assignedToUid || parentTask?.userId || parentTask?.assignedToName || parentTask?.userName || ''),
      normalizeText(row?.taskNo || row?.structureTaskNo || row?.contentType || row?.idea || ''),
      normalizeText(row?.creativeShortCode || ''),
      normalizeText(role || row?.departmentCode || ''),
      normalizeText(assigneeId || row?.userCode || row?.userCodes || '')
    ].filter(Boolean).map(identityClean).join('__');
  }
  function v171WriterUser(parentTask){
    const id = parentTask?.assignedToId || parentTask?.assignedToUid || parentTask?.assigneeUid || parentTask?.userId || (Array.isArray(parentTask?.userIds) ? parentTask.userIds[0] : '') || '';
    return findUserByAnyIdentity([id, parentTask?.assignedToName, parentTask?.userName, parentTask?.assigneeName]) || {};
  }
  function v171BuildContentTaskFromExecution(campaign, parentTask, row, execTask, rowIndex){
    const writer = v171WriterUser(parentTask);
    const writerId = writer.id || writer.uid || parentTask.assignedToId || parentTask.assignedToUid || parentTask.userId || (Array.isArray(parentTask.userIds) ? parentTask.userIds[0] : '') || '';
    const writerName = userName(writer) || parentTask.assignedToName || parentTask.assigneeName || parentTask.userName || (Array.isArray(parentTask.userNames) ? parentTask.userNames[0] : '') || 'كاتب المحتوى';
    const writerEmail = writer.email || parentTask.assignedToEmail || parentTask.assigneeEmail || parentTask.userEmail || '';
    const role = normalizeDepartmentRole(execTask.departmentRole || execTask.assignedDepartmentName || execTask.contentSectionName || row.departmentCode || '');
    const pairKey = execTask.contentExecutionPairKey || v171PairKey(parentTask, row, execTask.assignedToId || execTask.userId || '', role);
    const taskLabel = structureContentTaskLabel(row, row.contentType || row.contentName || row.idea || 'تاسك محتوى');
    const keys = uniqueIdentityKeys([writerId, writer.uid, writer.email, writerName, writer.name, writer.displayName]);
    return normalizeCampaignTask({
      id: `${campaign.id}-content-template-${Date.now()}-${rowIndex + 1}-${Math.random().toString(36).slice(2,8)}`,
      campaignId: campaign.id,
      campaignName: campaign.campaignName || campaign.name || '',
      campaignCode: campaign.campaignCode || campaign.campaign_code || '',
      creative: execTask.creative || parentTask.creative || parentTask.product || '',
      product: row.idea || row.contentName || row.description || row.contentType || '',
      taskNo: row.taskNo || execTask.taskNo || '',
      structureTaskNo: row.taskNo || execTask.structureTaskNo || '',
      structureTaskLabel: taskLabel,
      contentSectionId: 'content',
      contentSectionName: 'قسم المحتوى',
      assignedDepartmentId: 'content',
      assignedDepartmentName: 'قسم المحتوى',
      departmentRole: 'content',
      taskType: taskLabel,
      structureGenerated: true,
      contentTemplateTask: true,
      source: 'campaign-structure-content-template',
      parentStructureTaskId: parentTask.id,
      linkedExecutionTaskId: execTask.id || '',
      linkedExecutionPairKey: pairKey,
      linkedExecutionDepartmentRole: role,
      linkedExecutionDepartmentName: execTask.assignedDepartmentName || execTask.contentSectionName || defaultRoleSectionName(role),
      linkedExecutionAssigneeId: execTask.assignedToId || execTask.userId || '',
      linkedExecutionAssigneeName: execTask.assignedToName || execTask.userName || '',
      contentExecutionPairKey: pairKey,
      structureRow: row,
      userId: writerId,
      userUid: writer.uid || writerId,
      userName: writerName,
      userEmail: writerEmail,
      assigneeUid: writer.uid || writerId,
      assigneeName: writerName,
      assigneeEmail: writerEmail,
      assignedToUid: writer.uid || writerId,
      assignedToId: writerId,
      assignedToName: writerName,
      assignedToEmail: writerEmail,
      displayName: writer.displayName || writerName,
      assignedToSearch: keys,
      searchKeys: keys,
      requiredDate: parentTask.requiredDate || parentTask.dueDate || '',
      dueDate: parentTask.requiredDate || parentTask.dueDate || '',
      received: false,
      receivedConfirmed: false,
      progress: 0,
      status: 'pending_task_template',
      steps: taskStepTemplate('content'),
      attachments: [],
      taskTemplate: { status: 'not_uploaded', linkedExecutionPairKey: pairKey }
    }, campaign);
  }
  function v171ExistingContentTaskMatches(existing, addition){
    if(!existing || !addition) return false;
    if(!existing.contentTemplateTask && existing.source !== 'campaign-structure-content-template') return false;
    const a = normalizeText(existing.contentExecutionPairKey || existing.linkedExecutionPairKey || existing.linkedExecutionTaskId || '');
    const b = normalizeText(addition.contentExecutionPairKey || addition.linkedExecutionPairKey || addition.linkedExecutionTaskId || '');
    return a && b && a === b;
  }
  const previousBuildStructureTaskFromRow = buildStructureTaskFromRow;
  buildStructureTaskFromRow = function(campaign, parentTask, row, assigneeId, rowIndex, publishMeta = {}){
    const task = previousBuildStructureTaskFromRow(campaign, parentTask, row, assigneeId, rowIndex, publishMeta);
    const role = normalizeDepartmentRole(task.departmentRole || task.assignedDepartmentName || task.contentSectionName || row?.departmentCode || '');
    const pairKey = v171PairKey(parentTask, row, assigneeId, role);
    return { ...task, contentExecutionPairKey: pairKey, linkedContentTemplateStatus: task.linkedContentTemplateStatus || 'waiting_upload' };
  };

  saveStructureDistribution = async function(taskId){
    const task = findTaskById(taskId);
    const campaign = campaignForTask(task);
    if(!task || !campaign?.id) return showToast('تعذر العثور على التاسك.');
    const rows = [...document.querySelectorAll(`#taskModal .structure-assign-row`)];
    const executionAdditions = [];
    const contentAdditions = [];
    rows.forEach((rowEl) => {
      const index = Number(rowEl.dataset.structureRow || 0);
      const sourceRow = structureDistributionRows(taskStructure(task))[index];
      if(!sourceRow) return;
      const publishMeta = selectedStructurePublishMeta(rowEl);
      const legacyAssignee = rowEl.querySelector('select.js-structure-assignee')?.value || '';
      const autoAssignees = autoAssigneesForStructureRow(campaign, task, sourceRow);
      const assignees = uniqueList((publishMeta.assignees || []).length ? publishMeta.assignees : (autoAssignees.length ? autoAssignees : [legacyAssignee].filter(Boolean)));
      if(assignees.length){
        const savedMeta = { ...publishMeta, assignees, distributionSaved: true, assignmentSaved: true };
        writeStructureRowMeta(rowEl, savedMeta);
        assignees.forEach((assignee) => {
          const execTask = buildStructureTaskFromRow(campaign, task, sourceRow, assignee, index, savedMeta);
          executionAdditions.push(execTask);
          contentAdditions.push(v171BuildContentTaskFromExecution(campaign, task, sourceRow, execTask, index));
        });
      }
    });
    if(!executionAdditions.length) return showToast('لم يتم العثور على يوزرات مربوطة بالكرييتيف. راجع اختيار اليوزرات في خطوة تحديد الكرييتيف أو أكواد اليوزرات في القالب.');

    const usedExistingIndexes = new Set();
    const nextTasks = (campaign.departmentTasks || []).map(item => item.id === task.id ? { ...item, structure: { ...taskStructure(item), status: 'distributed', distributedAt: new Date().toISOString() } } : item);
    let linkedCount = 0;
    let createdCount = 0;
    executionAdditions.forEach(addition => {
      const existingIndex = nextTasks.findIndex((existing, index) => !usedExistingIndexes.has(index) && waitingTaskMatchesStructureAddition(existing, addition, task));
      if(existingIndex >= 0){
        const merged = mergeStructureAdditionIntoExistingTask(nextTasks[existingIndex], addition, task);
        nextTasks[existingIndex] = { ...merged, contentExecutionPairKey: addition.contentExecutionPairKey || merged.contentExecutionPairKey || '' };
        usedExistingIndexes.add(existingIndex);
        linkedCount += 1;
      }else{
        nextTasks.push(addition);
        createdCount += 1;
      }
    });
    let contentCreated = 0;
    contentAdditions.forEach(addition => {
      const exists = nextTasks.some(existing => v171ExistingContentTaskMatches(existing, addition));
      if(!exists){ nextTasks.push(addition); contentCreated += 1; }
    });

    await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaign.id).update({ departmentTasks: nextTasks, taskCount: nextTasks.length, updatedAt: serverTime() });
    document.querySelectorAll('#taskModal .structure-assign-row').forEach(rowEl => {
      const meta = readStructureRowMeta(rowEl);
      if((meta.assignees || []).length){ writeStructureRowMeta(rowEl, { ...meta, distributionSaved: true, assignmentSaved: true }); }
    });
    if(contentCreated) showToast(`تم توزيع تاسكات الهيكل وإنشاء ${contentCreated} تاسك لقسم المحتوى لرفع Task Template.`);
    else if(linkedCount && !createdCount) showToast('تم ربط الهيكل بالتاسكات الموجودة وتم التوزيع.');
    else showToast('تم توزيع تاسكات الهيكل.');
  };

  function v171IsContentTemplateTask(task){ return !!(task?.contentTemplateTask || task?.source === 'campaign-structure-content-template'); }
  function v171TemplateStatusLabel(status){
    const clean = normalizeText(status || '');
    if(clean === 'approved') return 'تم اعتماد Task Template';
    if(clean === 'pending_review') return 'في انتظار مراجعة الأدمن';
    if(clean === 'needs_changes') return 'محتاج تعديل';
    if(clean === 'rejected') return 'مرفوض';
    return 'لم يتم رفع Task Template';
  }
  function v171RenderContentTemplateSection(task){
    if(!v171IsContentTemplateTask(task)) return '';
    const admin = isCurrentUserAdmin();
    const tpl = task.taskTemplate || {};
    const hasFile = !!(tpl.fileData || tpl.fileName || tpl.fileSize || (Array.isArray(tpl.sheetTables) && tpl.sheetTables.length));
    const canUpload = !admin && (!tpl.status || tpl.status === 'not_uploaded' || tpl.status === 'needs_changes' || tpl.status === 'rejected');
    return `<div class="modal-section task-template-section"><div class="modal-section-title"><h3>Task Template - قسم المحتوى</h3><span>${escapeHtml(v171TemplateStatusLabel(tpl.status))}</span></div>
      <div class="structure-actions">
        ${canUpload ? `<button class="btn btn-light" type="button" data-download-task-template="${escapeHtml(task.id)}">تحميل قالب Task Template</button><button class="btn btn-primary" type="button" data-upload-task-template="${escapeHtml(task.id)}">رفع ملف Task Template</button>` : ''}
        ${hasFile ? `<span class="structure-file-name structure-attached-label">تم رفع Task Template</span>${tpl.fileName ? `<span class="structure-file-name">${escapeHtml(tpl.fileName)}</span>` : ''}` : '<span class="structure-file-name muted">لم يتم رفع Task Template</span>'}
        ${tpl.fileData ? `<a class="btn btn-light" href="${escapeHtml(tpl.fileData)}" download="${escapeHtml(tpl.fileName || 'task-template.xlsx')}">تحميل الملف المرفوع</a>` : ''}
        ${admin && hasFile ? `<button class="btn btn-primary" type="button" data-open-task-template-review="${escapeHtml(task.id)}">مراجعة Task Template</button>` : ''}
      </div>
      ${v172RenderTaskTemplateFields(tpl)}
      <div class="task-template-link-note">مرتبط بتاسك: ${escapeHtml(task.linkedExecutionDepartmentName || '')} / ${escapeHtml(task.linkedExecutionAssigneeName || '')}</div>
    </div>`;
  }
  function v171RenderApprovedContentTemplateForExecution(task){
    const tpl = task.contentTaskTemplate || task.approvedContentTemplate || null;
    if(!tpl || tpl.status !== 'approved') return '';
    const normalizedTpl = (typeof v177NormalizeRealTaskTemplate === 'function') ? v177NormalizeRealTaskTemplate(tpl) : tpl;
    const fields = (typeof v172TaskTemplateFieldsFromTemplate === 'function') ? v172TaskTemplateFieldsFromTemplate(normalizedTpl) : [];
    const byKey = new Map((fields || []).map(field => [field.key, field]));
    const read = (key) => normalizeText(byKey.get(key)?.value || normalizedTpl?.parsedRows?.[0]?.[key] || '');
    const metaFields = [
      ['campaignName','اسم الحملة'],['campaignCode','رقم الحملة'],['campaignType','نوع الحملة'],['taskNo','رقم التاسك'],['contentType','نوع المحتوى'],['suggestedCreativeName','الاسم المقترح للكرييتيف']
    ];
    const briefFields = [
      ['goal','الهدف'],['message','الرسالة الأساسية'],['cta','CTA']
    ];
    const longFields = [
      ['hook','الهوك'],['script','السكريبت الأساسي'],['caption','الكابشن'],['hashtags','هاشتاج']
    ];
    const fieldCard = (key, label, extraClass='') => { const scriptClass = key === 'script' ? ' approved-template-script-card' : ''; return `<div class="approved-template-card ${extraClass}${scriptClass}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(read(key) || '—')}</strong></div>`; };
    const metaHtml = metaFields.map(([key,label]) => fieldCard(key,label)).join('');
    const briefHtml = briefFields.map(([key,label]) => fieldCard(key,label)).join('');
    const longHtml = longFields.map(([key,label]) => fieldCard(key,label,'approved-template-long-card')).join('');
    return `<div class="modal-section approved-content-template-section approved-content-template-section-v183">
      <div class="modal-section-title"><h3>بيانات قسم المحتوى المعتمدة</h3><span>${escapeHtml(tpl.fileName || '')}</span></div>
      <div class="approved-template-layout-v183">
        <div class="approved-template-group"><h4>بيانات أساسية</h4><div class="approved-template-grid approved-template-meta-grid">${metaHtml}</div></div>
        <div class="approved-template-group"><h4>ملخص المحتوى</h4><div class="approved-template-grid approved-template-brief-grid">${briefHtml}</div></div>
        <div class="approved-template-group"><h4>النصوص التنفيذية</h4><div class="approved-template-grid approved-template-long-grid">${longHtml}</div></div>
      </div>
      ${tpl.fileData ? `<a class="btn btn-light approved-template-download-btn" href="${escapeHtml(tpl.fileData)}" download="${escapeHtml(tpl.fileName || 'task-template.xlsx')}">تحميل Task Template المعتمد</a>` : ''}
    </div>`;
  }
  const previousBuildTaskDetailHtml = buildTaskDetailHtml;
  buildTaskDetailHtml = function(task){
    let html = previousBuildTaskDetailHtml(task);
    const contentSection = v171RenderContentTemplateSection(task);
    const approvedSection = v171RenderApprovedContentTemplateForExecution(task);
    if(contentSection || approvedSection){
      html = html.replace('<div class="modal-section task-actions-section compact-actions-section">', `${contentSection}${approvedSection}<div class="modal-section task-actions-section compact-actions-section">`);
    }
    return html;
  };


  /* v172 - exact Task Template parser: key/value sheet uploaded by content writer */
  function v172TaskTemplateKey(value){
    return normalizeText(value || '').replace(/[\s\u200f\u200e]+/g,' ').replace(/[ةه]/g,'ه').replace(/[ىي]/g,'ي').replace(/[^\u0600-\u06FFa-zA-Z0-9 ]/g,'').trim().toLowerCase();
  }
  const V172_TASK_TEMPLATE_LABELS = [
    ['اسم الحمله', 'campaignName', 'اسم الحملة'],
    ['رقم الحمله', 'campaignCode', 'رقم الحملة'],
    ['نوع الحمله', 'campaignType', 'نوع الحملة'],
    ['رقم التاسك', 'taskNo', 'رقم التاسك'],
    ['الاسم المقترح للكريتييف', 'suggestedCreativeName', 'الاسم المقترح للكرييتيف'],
    ['نوع المحتوي', 'contentType', 'نوع المحتوى'],
    ['الهدف', 'goal', 'الهدف'],
    ['الرساله الاساسيه', 'message', 'الرسالة الأساسية'],
    ['الهوك', 'hook', 'الهوك'],
    ['السكريبت الاساسي', 'script', 'السكريبت الأساسي'],
    ['CTA', 'cta', 'CTA'],
    ['الكابشن', 'caption', 'الكابشن'],
    ['هاشتاج', 'hashtags', 'هاشتاج']
  ];
  const V172_TASK_TEMPLATE_KEY_MAP = new Map(V172_TASK_TEMPLATE_LABELS.map(item => [v172TaskTemplateKey(item[0]), item]));
  function v172ParseTaskTemplateWorkbookBuffer(buffer, fileName = ''){
    if(!window.XLSX) return { parsedRows: [], sheetTables: [], taskTemplateFields: [] };
    const workbook = XLSX.read(buffer, { type: 'array', cellDates:false, cellStyles:true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if(!sheet) return { parsedRows: [], sheetTables: [], taskTemplateFields: [] };
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header:1, defval:'', blankrows:false });
    const row = { raw:{}, fileName };
    const fieldsByKey = new Map();
    function pushField(found, value){
      if(!found) return;
      const [, key, displayLabel] = found;
      const cleanValue = normalizeText(value || '');
      const existing = fieldsByKey.get(key);
      if(existing && normalizeText(existing.value)) return;
      fieldsByKey.set(key, { key, label: displayLabel, value: cleanValue });
      row[key] = cleanValue;
      row.raw[displayLabel] = cleanValue;
    }
    rawRows.forEach((r, rowIndex) => {
      (r || []).forEach((cell, colIndex) => {
        const found = V172_TASK_TEMPLATE_KEY_MAP.get(v172TaskTemplateKey(cell));
        if(!found) return;
        const candidates = [];
        for(let c = colIndex + 1; c < Math.min((r || []).length, colIndex + 6); c += 1) candidates.push(r[c]);
        for(let c = colIndex - 1; c >= Math.max(0, colIndex - 3); c -= 1) candidates.push(r[c]);
        for(let rr = rowIndex + 1; rr < Math.min(rawRows.length, rowIndex + 4); rr += 1) candidates.push(rawRows[rr]?.[colIndex]);
        const value = candidates.map(v => normalizeText(v || '')).find(v => v && !V172_TASK_TEMPLATE_KEY_MAP.has(v172TaskTemplateKey(v))) || '';
        pushField(found, value);
      });
    });
    // Fallback for the official vertical B:C template if the matrix scan missed anything.
    rawRows.forEach((r) => {
      const label = normalizeText(r?.[1] || r?.[0] || '');
      const found = V172_TASK_TEMPLATE_KEY_MAP.get(v172TaskTemplateKey(label));
      if(!found) return;
      const value = normalizeText(r?.[2] || '');
      pushField(found, value);
    });
    const fields = V172_TASK_TEMPLATE_LABELS.map(([, key, label]) => fieldsByKey.get(key) || { key, label, value:'' });
    const hasRealData = fields.some(f => normalizeText(f.value));
    const sheetTables = [buildMergedStructureSheet(sheet, sheetName)].filter(tbl => (tbl.rows || []).length);
    if(!hasRealData) return { parsedRows: [], sheetTables, taskTemplateFields: fields };
    row.contentName = row.suggestedCreativeName || row.contentType || '';
    row.idea = row.suggestedCreativeName || row.hook || '';
    row.description = row.script || '';
    row.taskTemplateFields = fields;
    row.templateType = 'content_task_template';
    return { parsedRows:[row], sheetTables, taskTemplateFields: fields };
  }
  function v176TaskTemplateFallbackRow(task){
    const campaign = campaignForTask(task) || {};
    const row = task?.structureRow || {};
    return {
      campaignName: campaignNameText(campaign) || task?.campaignName || campaign?.name || '',
      campaignCode: campaignCodeText(campaign) || task?.campaignCode || campaign?.campaign_code || '',
      campaignType: campaignTypeText(campaign) || campaign?.campaign_type || task?.campaignType || '',
      taskNo: task?.structureTaskNo || task?.taskNo || row.taskNo || '',
      suggestedCreativeName: task?.structureTaskLabel || row.contentName || row.idea || task?.product || taskContentType(task) || '',
      contentType: taskContentType(task) || row.contentType || task?.contentType || '',
      goal: row.goal || task?.goal || '',
      message: row.message || task?.message || '',
      hook: row.contentAngle || row.idea || row.contentName || '',
      script: row.writerRequest || row.description || '',
      cta: row.cta || task?.cta || '',
      caption: task?.caption || task?.publishCaption || task?.platformCaption || '',
      hashtags: task?.hashtags || task?.hashtag || task?.publishHashtags || ''
    };
  }
  function v176MergeTaskTemplateWithFallback(parsed, task){
    const fallback = v176TaskTemplateFallbackRow(task);
    const sourceRow = Array.isArray(parsed?.parsedRows) && parsed.parsedRows[0] ? parsed.parsedRows[0] : {};
    const row = { ...fallback, ...sourceRow, raw:{ ...(sourceRow.raw || {}) } };
    const existingFields = Array.isArray(parsed?.taskTemplateFields) ? parsed.taskTemplateFields : [];
    const byKey = new Map(existingFields.map(f => [f.key, { ...f }]));
    V172_TASK_TEMPLATE_LABELS.forEach(([, key, label]) => {
      const existing = byKey.get(key) || { key, label, value:'' };
      const value = normalizeText(existing.value || row[key] || fallback[key] || '');
      byKey.set(key, { key, label, value });
      row[key] = value;
      row.raw[label] = value;
    });
    const fields = V172_TASK_TEMPLATE_LABELS.map(([, key, label]) => byKey.get(key) || { key, label, value:'' });
    row.taskTemplateFields = fields;
    row.templateType = 'content_task_template';
    return { ...(parsed || {}), parsedRows:[row], taskTemplateFields: fields };
  }
  /* v177 - Task Template must use real uploaded file data only, never fallback to structure task fields */
  function v177NormalizeRealTaskTemplate(parsed){
    const sourceRow = Array.isArray(parsed?.parsedRows) && parsed.parsedRows[0] ? parsed.parsedRows[0] : {};
    const directFields = Array.isArray(parsed?.taskTemplateFields) ? parsed.taskTemplateFields : [];
    const byKey = new Map();
    directFields.forEach(field => {
      if(!field) return;
      const key = field.key || '';
      if(!key) return;
      byKey.set(key, { ...field, value: normalizeText(field.value || '') });
    });
    V172_TASK_TEMPLATE_LABELS.forEach(([, key, label]) => {
      const existing = byKey.get(key) || { key, label, value:'' };
      const value = normalizeText(existing.value || sourceRow?.[key] || sourceRow?.raw?.[label] || '');
      byKey.set(key, { key, label, value });
    });
    const fields = V172_TASK_TEMPLATE_LABELS.map(([, key, label]) => byKey.get(key) || { key, label, value:'' });
    const realValues = fields.filter(f => normalizeText(f.value));
    const row = { ...sourceRow, raw:{ ...(sourceRow.raw || {}) }, taskTemplateFields: fields, templateType:'content_task_template_v177' };
    fields.forEach(field => {
      row[field.key] = normalizeText(field.value || '');
      row.raw[field.label] = normalizeText(field.value || '');
    });
    return { ...(parsed || {}), parsedRows: realValues.length ? [row] : [], taskTemplateFields: fields, templateKind:'content_task_template_v177' };
  }
  function v172TaskTemplateFieldsFromTemplate(tpl){
    const direct = Array.isArray(tpl?.taskTemplateFields) ? tpl.taskTemplateFields : [];
    if(direct.length) return direct;
    const row = Array.isArray(tpl?.parsedRows) ? tpl.parsedRows[0] : null;
    if(Array.isArray(row?.taskTemplateFields) && row.taskTemplateFields.length) return row.taskTemplateFields;
    const fields = [];
    V172_TASK_TEMPLATE_LABELS.forEach(([, key, label]) => {
      const value = normalizeText(row?.[key] || row?.raw?.[label] || '');
      if(value) fields.push({ key, label, value });
    });
    return fields;
  }
  function v172RenderTaskTemplateFields(tpl){
    const fields = v172TaskTemplateFieldsFromTemplate(tpl);
    if(!fields.length) return '';
    return `<div class="task-template-fields-grid">${fields.map(field => `<div class="task-template-field"><span>${escapeHtml(field.label)}</span><strong>${escapeHtml(field.value || '—')}</strong></div>`).join('')}</div>`;
  }
  async function v171UploadTaskTemplate(file, taskId){
    const task = findTaskById(taskId);
    if(!task) return showToast('تعذر العثور على التاسك.');
    showToast('جاري قراءة Task Template...');
    const fileData = await fileToDataUrl(file);
    const buffer = await file.arrayBuffer();
    let parsed = v172ParseTaskTemplateWorkbookBuffer(buffer, file.name);
    parsed = v177NormalizeRealTaskTemplate(parsed);
    // لا نستخدم بيانات هيكل الحملة كبديل هنا؛ Task Template لازم يتقرأ من ملفه الحقيقي فقط.
    const hasRealTaskTemplateData = (parsed.taskTemplateFields || []).some(field => normalizeText(field.value || ''));
    if(!hasRealTaskTemplateData){
      showToast('تعذر قراءة بيانات Task Template من الملف. ارفع قالب Task Template الحقيقي بعد تعبئته.');
      return;
    }
    const prev = task.taskTemplate || {};
    const next = { ...prev, status:'pending_review', fileName:file.name, fileSize:file.size, fileData, parsedRows: parsed.parsedRows || [], sheetTables: parsed.sheetTables || [], taskTemplateFields: parsed.taskTemplateFields || v172TaskTemplateFieldsFromTemplate(parsed), templateKind:'content_task_template_v177', uploadedAt:new Date().toISOString(), uploadedBy:getCurrentUser().email || getCurrentUser().name || '' };
    await updateTaskOnFirebase(task.id, { taskTemplate: encodeStructureWorkbookForFirestore(next), status:'pending_task_template_review' });
    showToast('تم رفع Task Template. في انتظار مراجعة الأدمن.');
    refreshOpenTaskModal();
  }
  function v175RenderTaskTemplateReviewView(tpl, task = null){
    const mergedTpl = v177NormalizeRealTaskTemplate(tpl || {});
    const fields = v172TaskTemplateFieldsFromTemplate(mergedTpl);
    const rows = Array.isArray(mergedTpl?.parsedRows) ? mergedTpl.parsedRows : [];
    const row = rows[0] || {};
    const fieldHtml = fields.length ? fields.map(field => `<div class="task-template-review-field"><span>${escapeHtml(field.label || field.key || '')}</span><strong>${escapeHtml(field.value || '—')}</strong></div>`).join('') : V172_TASK_TEMPLATE_LABELS.map(([, key, label]) => {
      const value = normalizeText(row?.[key] || row?.raw?.[label] || '');
      return `<div class="task-template-review-field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '—')}</strong></div>`;
    }).join('');
    const rawRows = rows.length ? rows.map((item, idx) => {
      const taskNo = normalizeText(item.taskNo || item.taskNumber || item.raw?.['رقم التاسك'] || '');
      const type = normalizeText(item.contentType || item.raw?.['نوع المحتوي'] || item.raw?.['نوع المحتوى'] || '');
      const msg = normalizeText(item.message || item.raw?.['الرساله الاساسيه'] || item.raw?.['الرسالة الأساسية'] || '');
      const cta = normalizeText(item.cta || item.raw?.CTA || '');
      return `<tr><td>${escapeHtml(idx + 1)}</td><td>${escapeHtml(taskNo || '—')}</td><td>${escapeHtml(type || '—')}</td><td>${escapeHtml(msg || '—')}</td><td>${escapeHtml(cta || '—')}</td></tr>`;
    }).join('') : '';
    const fileName = normalizeText(tpl?.fileName || '');
    return `<div class="task-template-review-view"><div class="task-template-review-summary"><div><h4>بيانات Task Template</h4><p>مراجعة ملف المحتوى المرفوع من كاتب المحتوى بصيغته الخاصة، بعيدًا عن شكل هيكل الحملة.</p></div>${fileName ? `<span class="task-template-review-file">${escapeHtml(fileName)}</span>` : ''}</div><div class="task-template-review-fields">${fieldHtml}</div>${rawRows ? `<div class="task-template-review-table-wrap"><table class="task-template-review-table"><thead><tr><th>#</th><th>رقم التاسك</th><th>نوع المحتوى</th><th>الرسالة الأساسية</th><th>CTA</th></tr></thead><tbody>${rawRows}</tbody></table></div>` : ''}${mergedTpl?.fileData ? `<a class="btn btn-light" href="${escapeHtml(mergedTpl.fileData)}" download="${escapeHtml(fileName || 'task-template.xlsx')}">تحميل ملف Task Template</a>` : ''}</div>`;
  }

  function v171OpenTaskTemplateReview(taskId){
    const task = findTaskById(taskId);
    if(!task) return showToast('تعذر العثور على التاسك.');
    const tpl = task.taskTemplate || {};
    const popup = document.createElement('div');
    popup.className = 'structure-review-popup task-template-review-popup';
    popup.innerHTML = `<div class="structure-review-backdrop" data-close-structure-review></div><section class="structure-review-dialog" role="dialog" aria-modal="true"><div class="structure-review-head"><div><h3>مراجعة Task Template</h3><p>${escapeHtml(shortTaskName(task))}</p></div><button type="button" class="task-modal-close" data-close-structure-review>×</button></div><div class="structure-review-body">${v175RenderTaskTemplateReviewView(tpl, task)}</div><div class="modal-section"><div class="modal-section-title"><h3>قرار الأدمن</h3><span>اعتماد / تعديل / رفض</span></div><textarea class="task-template-review-note" data-task-template-review-note placeholder="اكتب ملاحظات التعديل أو سبب الرفض لو محتاج..."></textarea></div><div class="structure-review-actions task-template-review-actions"><button type="button" class="btn btn-light" data-close-structure-review>إغلاق</button><button type="button" class="btn btn-warning-soft" data-task-template-needs-changes="${escapeHtml(task.id)}">محتاج تعديل</button><button type="button" class="btn btn-danger-soft" data-task-template-reject="${escapeHtml(task.id)}">مرفوض</button><button type="button" class="btn btn-primary" data-task-template-approve="${escapeHtml(task.id)}">اعتماد Task Template</button></div></section>`;
    document.body.appendChild(popup);
  }

  async function v174SetTaskTemplateDecision(taskId, decision){
    const task = findTaskById(taskId);
    const campaign = campaignForTask(task);
    if(!task || !campaign?.id) return showToast('تعذر العثور على التاسك.');
    const note = normalizeText(document.querySelector('[data-task-template-review-note]')?.value || '');
    const tpl = task.taskTemplate || {};
    const status = decision === 'approved' ? 'approved' : (decision === 'needs_changes' ? 'needs_changes' : 'rejected');
    const decidedTemplate = {
      ...v177NormalizeRealTaskTemplate(tpl),
      status,
      reviewNote: note,
      reviewedAt: new Date().toISOString(),
      reviewedBy: getCurrentUser().email || getCurrentUser().name || '',
      ...(status === 'approved' ? { approvedAt:new Date().toISOString(), approvedBy:getCurrentUser().email || getCurrentUser().name || '' } : {})
    };
    const pairKey = normalizeText(task.contentExecutionPairKey || task.linkedExecutionPairKey || tpl.linkedExecutionPairKey || '');
    const nextTasks = (campaign.departmentTasks || []).map(item => {
      const itemPair = normalizeText(item.contentExecutionPairKey || item.linkedExecutionPairKey || '');
      if(item.id === task.id){
        const nextStatus = status === 'approved' ? 'task_template_approved' : (status === 'needs_changes' ? 'pending_task_template_changes' : 'task_template_rejected');
        return { ...item, taskTemplate: encodeStructureWorkbookForFirestore(decidedTemplate), status: nextStatus, contentTemplateApproved: status === 'approved', progress: status === 'approved' ? Math.max(Number(item.progress || 0), 20) : Number(item.progress || 0), updatedAt:new Date().toISOString() };
      }
      if(pairKey && itemPair === pairKey && item.id !== task.id){
        if(status === 'approved'){
          return { ...item, contentTaskTemplate: encodeStructureWorkbookForFirestore(decidedTemplate), linkedContentTemplateStatus:'approved', linkedContentTemplateTaskId: task.id, updatedAt:new Date().toISOString() };
        }
        return { ...item, linkedContentTemplateStatus: status, linkedContentTemplateTaskId: task.id, linkedContentTemplateReviewNote: note, updatedAt:new Date().toISOString() };
      }
      return item;
    });
    await safeCollection(window.MZJ_CAMPAIGNS_COLLECTION).doc(campaign.id).update({ departmentTasks: nextTasks, updatedAt: serverTime() });
    if(status === 'approved') showToast('تم اعتماد Task Template وظهرت بياناته تحت بيانات تاسك الهيكل والقسم المرتبط.');
    else if(status === 'needs_changes') showToast('تم إرسال Task Template للتعديل، وكاتب المحتوى يقدر يرفعه من جديد.');
    else showToast('تم رفض Task Template.');
    closeStructureReviewPopup();
    refreshOpenTaskModal();
  }

  async function v171ApproveTaskTemplate(taskId){
    return v174SetTaskTemplateDecision(taskId, 'approved');
  }

  function v194TaskTemplateSeedValues(task){
    const campaign = campaignForTask(task) || {};
    const row = task?.structureRow || {};
    const taskNo = (typeof structureTaskNumber === 'function' ? structureTaskNumber(task) : '') || task?.structureTaskNo || task?.taskNo || row.taskNo || '';
    const contentType = taskContentType(task) || row.contentType || row.contentName || task?.contentType || task?.taskType || '';
    return {
      campaignName: campaignNameText(campaign) || task?.campaignName || campaign?.name || '',
      campaignCode: campaignCodeText(campaign) || task?.campaignCode || campaign?.campaign_code || '',
      campaignType: campaignTypeText(campaign) || task?.campaignType || campaign?.campaign_type || '',
      taskNo,
      contentType
    };
  }
  function v194CleanFilePart(value, fallback = 'task-template'){
    const clean = normalizeText(value || '').replace(/[\\/:*?"<>|\s]+/g, '_').replace(/^_+|_+$/g, '');
    return clean || fallback;
  }
  function v195XmlEscape(value){
    return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  }
  function v195SheetCell(ref, value, styleIndex = 0){
    return `<c r="${ref}" t="inlineStr" s="${styleIndex}"><is><t>${v195XmlEscape(value || '')}</t></is></c>`;
  }
  function v195SheetRow(rowNo, cells, height = 24){
    return `<row r="${rowNo}" ht="${height}" customHeight="1">${cells.join('')}</row>`;
  }
  function v195TaskTemplateWorkbookBlob(seed){
    if(!window.JSZip) return null;
    const zip = new JSZip();
    const rows = [];
    rows.push(v195SheetRow(1, [v195SheetCell('A1','Task Template - MZJ Workspace',1), v195SheetCell('B1','',1)], 30));
    rows.push(v195SheetRow(2, [v195SheetCell('A2','',0), v195SheetCell('B2','',0)], 10));
    rows.push(v195SheetRow(3, [v195SheetCell('A3','بيانات السيستم - لا تعدلها',2), v195SheetCell('B3','',2)], 26));
    const systemRows = [
      ['اسم الحملة', seed.campaignName],
      ['رقم الحملة', seed.campaignCode],
      ['نوع الحملة', seed.campaignType],
      ['رقم التاسك', seed.taskNo],
      ['نوع المحتوى', seed.contentType]
    ];
    systemRows.forEach((r, idx) => {
      const rowNo = idx + 4;
      rows.push(v195SheetRow(rowNo, [v195SheetCell(`A${rowNo}`, r[0],3), v195SheetCell(`B${rowNo}`, r[1],4)], 24));
    });
    rows.push(v195SheetRow(9, [v195SheetCell('A9','',0), v195SheetCell('B9','',0)], 10));
    rows.push(v195SheetRow(10, [v195SheetCell('A10','بيانات يكتبها قسم المحتوى',2), v195SheetCell('B10','',2)], 26));
    const editable = [
      ['الاسم المقترح للكرييتيف', ''],
      ['الهدف', ''],
      ['الرسالة الأساسية', ''],
      ['الهوك', ''],
      ['السكريبت الأساسي', ''],
      ['CTA', ''],
      ['الكابشن', ''],
      ['هاشتاج', '']
    ];
    editable.forEach((r, idx) => {
      const rowNo = idx + 11;
      const h = ['الرسالة الأساسية','الهوك','السكريبت الأساسي','الكابشن','هاشتاج'].includes(r[0]) ? 42 : 28;
      rows.push(v195SheetRow(rowNo, [v195SheetCell(`A${rowNo}`, r[0],3), v195SheetCell(`B${rowNo}`, r[1],6)], h));
    });
    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
  <dimension ref="A1:B18"/>
  <sheetViews><sheetView workbookViewId="0" rightToLeft="1"/></sheetViews>
  <sheetFormatPr defaultRowHeight="24"/>
  <cols><col min="1" max="1" width="28" customWidth="1"/><col min="2" max="2" width="62" customWidth="1"/></cols>
  <sheetData>${rows.join('')}</sheetData>
  <mergeCells count="3"><mergeCell ref="A1:B1"/><mergeCell ref="A3:B3"/><mergeCell ref="A10:B10"/></mergeCells>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
  <pageSetup orientation="portrait" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="12"/><color rgb="FF3B211C"/><name val="Calibri"/></font><font><sz val="11"/><color rgb="FF8B6B5D"/><name val="Calibri"/></font></fonts>
  <fills count="7"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF6F3F34"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF2E5DC"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFAF6"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF7FAFC"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFE2C6B8"/></left><right style="thin"><color rgb="FFE2C6B8"/></right><top style="thin"><color rgb="FFE2C6B8"/></top><bottom style="thin"><color rgb="FFE2C6B8"/></bottom><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment readingOrder="2" horizontal="right" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment readingOrder="2" horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment readingOrder="2" horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment readingOrder="2" horizontal="right" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment readingOrder="2" horizontal="right" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment readingOrder="2" horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment readingOrder="2" horizontal="right" vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment readingOrder="2" horizontal="right" vertical="center" wrapText="1"/></xf></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
    zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
    zip.folder('xl').file('workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="Task Template" sheetId="1" r:id="rId1"/></sheets></workbook>`);
    zip.folder('xl').folder('_rels').file('workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
    zip.folder('xl').folder('worksheets').file('sheet1.xml', sheetXml);
    zip.folder('xl').file('styles.xml', stylesXml);
    const now = new Date().toISOString();
    zip.folder('docProps').file('core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>MZJ Workspace</dc:creator><cp:lastModifiedBy>MZJ Workspace</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`);
    zip.folder('docProps').file('app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>MZJ Workspace</Application></Properties>`);
    return zip.generateAsync({ type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  async function v194DownloadTaskTemplate(taskId){
    const task = findTaskById(taskId);
    if(!task) return showToast('تعذر العثور على التاسك.');
    const seed = v194TaskTemplateSeedValues(task);
    const fileName = `${v194CleanFilePart(seed.campaignCode || seed.campaignName, 'campaign')}_${v194CleanFilePart(seed.taskNo, 'task')}_task_template.xlsx`;
    try{
      const blobPromise = v195TaskTemplateWorkbookBlob(seed);
      if(blobPromise){
        const blob = await blobPromise;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        showToast('تم تحميل Task Template بتنسيق منظم وببيانات السيستم، وباقي الخانات يكتبها قسم المحتوى.');
        return;
      }
    }catch(error){ console.error('styled task template download failed', error); }
    if(!window.XLSX) return showToast('مكتبة Excel لم يتم تحميلها.');
    const rows = [
      ['Task Template - MZJ Workspace', ''], ['', ''], ['بيانات السيستم - لا تعدلها', ''],
      ['اسم الحملة', seed.campaignName], ['رقم الحملة', seed.campaignCode], ['نوع الحملة', seed.campaignType], ['رقم التاسك', seed.taskNo], ['نوع المحتوى', seed.contentType],
      ['', ''], ['بيانات يكتبها قسم المحتوى', ''], ['الاسم المقترح للكرييتيف', ''], ['الهدف', ''], ['الرسالة الأساسية', ''], ['الهوك', ''], ['السكريبت الأساسي', ''], ['CTA', ''], ['الكابشن', ''], ['هاشتاج', '']
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 28 }, { wch: 70 }];
    const wb = XLSX.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };
    XLSX.utils.book_append_sheet(wb, ws, 'Task Template');
    XLSX.writeFile(wb, fileName, { bookType:'xlsx' });
    showToast('تم تحميل Task Template.');
  }
  function v171EnsureTemplateInput(){
    let input = document.getElementById('taskTemplateFileInput');
    if(!input){
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'taskTemplateFileInput';
      input.accept = '.xlsx,.xls';
      input.hidden = true;
      document.body.appendChild(input);
      input.addEventListener('change', async event => {
        const file = event.target.files?.[0];
        const taskId = event.target.dataset.taskId || '';
        event.target.value = '';
        if(file && taskId){ try{ await v171UploadTaskTemplate(file, taskId); }catch(error){ console.error(error); showToast(error.message || 'تعذر رفع Task Template.'); } }
      });
    }
    return input;
  }
  document.addEventListener('click', async function(event){
    const downloadTemplate = event.target.closest('[data-download-task-template]');
    if(downloadTemplate){ event.preventDefault(); event.stopPropagation(); v194DownloadTaskTemplate(downloadTemplate.dataset.downloadTaskTemplate || ''); return; }
    const uploadTemplate = event.target.closest('[data-upload-task-template]');
    if(uploadTemplate){ event.preventDefault(); event.stopPropagation(); const input = v171EnsureTemplateInput(); input.dataset.taskId = uploadTemplate.dataset.uploadTaskTemplate || ''; input.value = ''; input.click(); return; }
    const reviewTemplate = event.target.closest('[data-open-task-template-review]');
    if(reviewTemplate){ event.preventDefault(); event.stopPropagation(); v171OpenTaskTemplateReview(reviewTemplate.dataset.openTaskTemplateReview || ''); return; }
    const needsChangesTemplate = event.target.closest('[data-task-template-needs-changes]');
    if(needsChangesTemplate){ event.preventDefault(); event.stopPropagation(); await v174SetTaskTemplateDecision(needsChangesTemplate.dataset.taskTemplateNeedsChanges || '', 'needs_changes'); return; }
    const rejectTemplate = event.target.closest('[data-task-template-reject]');
    if(rejectTemplate){ event.preventDefault(); event.stopPropagation(); await v174SetTaskTemplateDecision(rejectTemplate.dataset.taskTemplateReject || '', 'rejected'); return; }
    const approveTemplate = event.target.closest('[data-task-template-approve]');
    if(approveTemplate){ event.preventDefault(); event.stopPropagation(); await v171ApproveTaskTemplate(approveTemplate.dataset.taskTemplateApprove || ''); return; }
  }, true);
})();


/* v172 - task template exact file support */
(function(){
  try{ window.MZJ_APP_VERSION = 'v184'; }catch(_){ }
})();

/* v182 - keep normal task details as a vertical scrollable detail view, not the structure sheet layout */
(function(){
  const prevOpenTaskModalV182 = openTaskModal;
  openTaskModal = function(task){
    prevOpenTaskModalV182(task);
    const modal = document.getElementById('taskModal');
    if(!modal || !task) return;
    if(!isCampaignStructureTask(task)){
      modal.classList.remove('has-structure-sheet-modal');
      modal.classList.add('task-fullscreen-view');
    }
  };
})();

/* v184 - Publish Prep shows approved execution tasks from structure only, with approved Task Template caption/hashtags */
(function(){
  const VERSION = 'v184';
  try{ window.MZJ_APP_VERSION = VERSION; }catch(_){ }

  function v184Clean(value){
    try{ return normalizeText(value || ''); }catch(_){ return String(value || '').trim(); }
  }
  function v184Identity(value){
    try{ return identityClean(value || ''); }catch(_){ return v184Clean(value).toLowerCase(); }
  }
  function v184IsContentTemplateTask(task){
    const source = v184Identity(task?.source || task?.raw?.source || '');
    return !!(task?.contentTemplateTask || source.includes('campaignstructurecontenttemplate'));
  }
  function v184IsStructureRequestTask(task){
    const text = v184Identity([
      task?.taskType, task?.title, task?.name, task?.taskName, task?.sourceRequestStep,
      task?.raw?.taskType, task?.raw?.title
    ].filter(Boolean).join(' '));
    return !!(task?.structureRequestTask || task?.needsStructureUpload || text.includes(v184Identity('طلب هيكل')) || text.includes('structurerequest'));
  }
  function v184IsApprovedStructureExecutionTask(task){
    if(!task || v184IsContentTemplateTask(task) || v184IsStructureRequestTask(task)) return false;
    const source = v184Identity(task.source || task.raw?.source || '');
    const structureLike = !!(task.structureGenerated || task.parentStructureTaskId || source.includes('campaignstructuredistribution'));
    if(!structureLike) return false;
    const role = normalizeDepartmentRole?.(task.departmentRole || task.assignedDepartmentName || task.contentSectionName || '') || '';
    if(role === 'content') return false;
    // These tasks are created only after approved structure rows are distributed.
    return true;
  }
  function v184TplFields(tpl){
    if(!tpl) return [];
    const direct = Array.isArray(tpl.taskTemplateFields) ? tpl.taskTemplateFields : [];
    if(direct.length) return direct;
    const row = Array.isArray(tpl.parsedRows) ? (tpl.parsedRows[0] || {}) : {};
    if(Array.isArray(row.taskTemplateFields) && row.taskTemplateFields.length) return row.taskTemplateFields;
    const raw = row.raw || {};
    const pairs = [
      ['caption','الكابشن'], ['hashtags','هاشتاج'], ['message','الرسالة الأساسية'], ['cta','CTA'],
      ['hook','الهوك'], ['script','السكريبت الأساسي'], ['goal','الهدف'], ['contentType','نوع المحتوى']
    ];
    return pairs.map(([key,label]) => ({ key, label, value: v184Clean(row[key] || raw[label] || raw[key] || '') })).filter(x => x.value);
  }
  function v184TplValue(tpl, wantedKey, arabicLabels = []){
    const fields = v184TplFields(tpl);
    const wanted = v184Identity(wantedKey);
    const labels = arabicLabels.map(v184Identity);
    const found = fields.find(f => v184Identity(f.key) === wanted || labels.includes(v184Identity(f.label)));
    if(found && v184Clean(found.value)) return v184Clean(found.value);
    const row = Array.isArray(tpl?.parsedRows) ? (tpl.parsedRows[0] || {}) : {};
    const raw = row.raw || {};
    return v184Clean(row[wantedKey] || tpl?.[wantedKey] || arabicLabels.map(label => raw[label]).find(Boolean) || '');
  }
  function v184ApprovedTemplate(task){
    const tpl = task?.contentTaskTemplate || task?.approvedContentTemplate || task?.taskTemplate || null;
    if(!tpl) return null;
    const status = v184Identity(tpl.status || task?.linkedContentTemplateStatus || '');
    if(status && status !== 'approved' && !task?.contentTaskTemplate && !task?.approvedContentTemplate) return null;
    if(tpl.status && v184Identity(tpl.status) !== 'approved') return null;
    return tpl;
  }
  function v184ContentCaption(task){
    const tpl = v184ApprovedTemplate(task);
    return v184TplValue(tpl, 'caption', ['الكابشن']) || v184Clean(task?.caption || task?.publishCaption || '');
  }
  function v184ContentHashtags(task){
    const tpl = v184ApprovedTemplate(task);
    return v184TplValue(tpl, 'hashtags', ['هاشتاج', 'الهاشتاج']) || v184Clean(task?.hashtags || task?.hashtagsText || task?.publishHashtags || '');
  }
  function v184HasPublishMeta(task){
    const publishing = Array.isArray(task?.platformPublishing) ? task.platformPublishing : [];
    const platforms = Array.isArray(task?.platforms) ? task.platforms : (task?.platform ? [task.platform] : []);
    return !!(
      publishing.length || platforms.length || v184Clean(task?.publishDate || task?.date || task?.scheduleDate || task?.scheduledDate || '') ||
      v184ContentCaption(task) || v184ContentHashtags(task) || (task?.platformTypes && Object.keys(task.platformTypes || {}).length)
    );
  }
  function v184TaskTitle(task){
    const row = task.structureRow || task.raw?.structureRow || {};
    const section = task.assignedDepartmentName || task.contentSectionName || '';
    const content = row.contentType || task.taskType || task.structureTaskLabel || task.product || task.creative || '';
    const taskNo = row.taskNo || task.taskNo || task.structureTaskNo || '';
    const shortNo = String(taskNo || '').split('-').slice(-1)[0] || '';
    const label = [shortNo, content].filter(Boolean).join(' - ');
    return [section, label || shortTaskName?.(task) || 'تاسك من الهيكل'].filter(Boolean).join(' / ');
  }
  function v184NormalizePublishPrepTask(task){
    const campaign = campaignForPrepTask?.(task) || campaignForTask?.(task) || {};
    const row = task.structureRow || task.raw?.structureRow || {};
    const caption = v184ContentCaption(task);
    const hashtags = v184ContentHashtags(task);
    const base = {
      id: `task_${task.id || task.taskId || task.code || task.taskNo || Math.random().toString(36).slice(2)}`,
      sourceType: 'structure_execution',
      sourceLabel: task.assignedDepartmentName || task.contentSectionName || 'تاسك منفذ من الهيكل',
      title: v184TaskTitle(task),
      campaignName: campaign.campaignName || campaign.name || task.campaignName || '',
      type: row.contentType || prepTaskTypeLabel?.(task) || task.taskType || '',
      requiredFile: prepTaskRequiredFileLabel?.(task) || task.requiredFile || 'ملف نهائي',
      platforms: normalizePrepPlatformList?.(task.platforms || task.platform || campaign.platforms || campaign.platform) || [],
      platformTypes: task.platformTypes || {},
      platformPublishing: Array.isArray(task.platformPublishing) ? task.platformPublishing : [],
      postType: task.postType || task.publishType || '',
      postTypeLabel: task.postTypeLabel || '',
      requiredDimensions: task.requiredDimensions || null,
      caption,
      hashtags,
      publishDate: prepTaskDate?.(task, campaign) || task.publishDate || task.date || '',
      publishTime: task.publishTime || task.scheduleTime || '',
      deadline: task.deadline || task.dueDate || task.requiredDate || '',
      notes: task.notes || task.note || task.instructions || row.description || '',
      raw: task
    };
    return typeof enrichPrepTaskFromSchedule === 'function' ? enrichPrepTaskFromSchedule(base, campaign, task) : base;
  }

  publishPrepTasksFromExistingTasks = function(){
    const visible = typeof getVisibleTasksForCurrentUser === 'function' ? getVisibleTasksForCurrentUser() : campaignTasks;
    return (visible || [])
      .filter(task => {
        if(!v184IsApprovedStructureExecutionTask(task)) return false;
        if(!isCurrentUserAdmin?.() && !(taskAssignedToCurrentUser?.(task) || currentUserMatchesTaskExact?.(task))) return false;
        return v184HasPublishMeta(task);
      })
      .map(v184NormalizePublishPrepTask);
  };

  getPublishingPrepTasks = function(){
    const map = new Map();
    publishPrepTasksFromExistingTasks().forEach(task => {
      if(!map.has(task.id)) map.set(task.id, task);
    });
    return [...map.values()];
  };

  const oldPublishPrepSearchTextV184 = publishPrepSearchText;
  publishPrepSearchText = function(task, submission = {}){
    const raw = task.raw || {};
    const tpl = v184ApprovedTemplate(raw);
    const tplText = v184TplFields(tpl).map(f => `${f.label || ''} ${f.value || ''}`).join(' ');
    return oldPublishPrepSearchTextV184(task, submission) + ' ' + v184Identity(tplText);
  };

  if(typeof renderPublishPrepPage === 'function' && typeof getRoute === 'function' && getRoute() === 'publish-prep') renderPublishPrepPage();
})();

/* v187 fix: make Publish Prep meta edit button open/save reliably */
(function(){
  const VERSION = 'v187-publish-prep-edit-force';
  function v187Platforms(){
    const list = Array.isArray(window.platforms) ? window.platforms : (typeof platforms !== 'undefined' && Array.isArray(platforms) ? platforms : []);
    return list.length ? list : [
      {name:'Instagram'}, {name:'Facebook'}, {name:'TikTok'}, {name:'Snapchat'}, {name:'YouTube'}, {name:'Google'}, {name:'LinkedIn'}, {name:'X'}
    ];
  }
  function v187PostTypes(platformName){
    try{
      if(typeof postTypesForPlatform === 'function'){
        const out = postTypesForPlatform(platformName);
        if(Array.isArray(out) && out.length) return out;
      }
    }catch(e){}
    return [
      {value:'post', label:'Post / منشور'},
      {value:'reel', label:'Reel / ريل'},
      {value:'story', label:'Story / ستوري'},
      {value:'carousel', label:'Carousel / كاروسيل'},
      {value:'video', label:'Video / فيديو'},
      {value:'photo', label:'Photo / صورة'}
    ];
  }
  function v187SelectedSubmission(taskId){
    try{ return (typeof getPublishPrepSubmissions === 'function' ? (getPublishPrepSubmissions()[taskId] || {}) : {}) || {}; }catch(e){ return {}; }
  }
  function v187Task(taskId){
    try{ return (typeof getPublishingPrepTasks === 'function' ? getPublishingPrepTasks() : []).find(item => String(item.id) === String(taskId)); }catch(e){ return null; }
  }
  function v187EffectivePublishing(task, sub){
    try{
      if(typeof publishPrepEffectivePlatformPublishing === 'function'){
        const list = publishPrepEffectivePlatformPublishing(task || {}, sub || {});
        if(Array.isArray(list) && list.length) return list;
      }
    }catch(e){}
    const platforms = (sub?.platforms && sub.platforms.length ? sub.platforms : (task?.platforms || [])) || [];
    const types = sub?.platformTypes || task?.platformTypes || {};
    return platforms.map(p => ({platform:p, postType:types[p] || sub?.postType || task?.postType || '', postTypeLabel:types[p] || sub?.postTypeLabel || task?.postTypeLabel || ''}));
  }
  function v187Open(taskId){
    const task = v187Task(taskId);
    if(!task){ if(typeof showToast === 'function') showToast('تعذر العثور على التاسك.'); return; }
    const sub = v187SelectedSubmission(taskId);
    const currentPublishing = v187EffectivePublishing(task, sub);
    const currentMap = {};
    currentPublishing.forEach(x => { if(x?.platform) currentMap[x.platform] = x.postType || ''; });
    const currentPlatforms = new Set(currentPublishing.map(x => x.platform).filter(Boolean));
    document.querySelectorAll('.publish-prep-edit-popup,.v187-prep-popup').forEach(el => el.remove());
    const rows = v187Platforms().map(p => {
      const name = p.name || p.platform || p.label || String(p || '');
      if(!name) return '';
      const checked = currentPlatforms.has(name);
      const options = v187PostTypes(name).map(t => {
        const value = t.value || t.label || String(t || '');
        const label = t.label || t.value || String(t || '');
        const selected = String(currentMap[name] || '') === String(value) ? ' selected' : '';
        return `<option value="${escapeHtml(value)}" data-label="${escapeHtml(label)}" data-width="${escapeHtml(t.width || '')}" data-height="${escapeHtml(t.height || '')}"${selected}>${escapeHtml(label)}</option>`;
      }).join('');
      return `<div class="v187-prep-platform-row${checked ? ' is-selected' : ''}" data-platform-row="${escapeHtml(name)}">
        <label class="v187-prep-check"><input type="checkbox" class="v187-prep-platform" value="${escapeHtml(name)}"${checked ? ' checked' : ''}> <strong>${escapeHtml(name)}</strong></label>
        <label class="v187-prep-type"><span>نوع النشر</span><select class="v187-prep-post-type" ${checked ? '' : 'disabled'}><option value="">اختر نوع النشر</option>${options}</select></label>
      </div>`;
    }).join('');
    let dateValue = '';
    let timeValue = '';
    try{ dateValue = publishPrepEffectivePublishDate(task, sub) || ''; }catch(e){ dateValue = sub.publishDate || task.publishDate || ''; }
    try{ timeValue = publishPrepEffectivePublishTime(task, sub) || ''; }catch(e){ timeValue = sub.publishTime || task.publishTime || ''; }
    const popup = document.createElement('div');
    popup.className = 'v187-prep-popup publish-prep-edit-popup';
    popup.innerHTML = `<div class="v187-prep-backdrop" data-v187-close></div>
      <section class="v187-prep-dialog" role="dialog" aria-modal="true">
        <div class="v187-prep-head"><div><h3>تعديل المنصات وأنواع النشر والتاريخ</h3><p>${escapeHtml(task.title || 'تاسك تجهيز النشر')}</p></div><button type="button" class="task-modal-close" data-v187-close>×</button></div>
        <div class="v187-prep-body">
          <h4>اختيار المنصات ونوع النشر لكل منصة</h4>
          <div class="v187-prep-platforms">${rows}</div>
          <div class="v187-prep-date-row">
            <label><span>تاريخ النشر</span><input type="date" class="v187-prep-date" value="${escapeHtml(dateValue)}"></label>
            <label><span>وقت النشر</span><input type="time" class="v187-prep-time" value="${escapeHtml(timeValue)}"></label>
          </div>
        </div>
        <div class="v187-prep-actions"><button type="button" class="btn btn-light" data-v187-close>إلغاء</button><button type="button" class="btn btn-primary" data-v187-save="${escapeHtml(taskId)}">حفظ بيانات النشر</button></div>
      </section>`;
    document.body.appendChild(popup);
  }
  async function v187Save(taskId){
    const popup = document.querySelector('.v187-prep-popup');
    if(!popup) return;
    const publishing = [];
    popup.querySelectorAll('.v187-prep-platform-row').forEach(row => {
      const checked = row.querySelector('.v187-prep-platform')?.checked;
      if(!checked) return;
      const platform = row.querySelector('.v187-prep-platform')?.value || '';
      const select = row.querySelector('.v187-prep-post-type');
      const postType = select?.value || '';
      const opt = select?.selectedOptions?.[0];
      if(!platform) return;
      publishing.push({
        platform,
        postType,
        postTypeLabel: opt?.dataset.label || opt?.textContent?.trim() || postType,
        requiredDimensions: postType ? { width: Number(opt?.dataset.width || 0) || null, height: Number(opt?.dataset.height || 0) || null } : null
      });
    });
    const missingType = publishing.find(x => !x.postType);
    if(!publishing.length){ if(typeof showToast === 'function') showToast('اختار منصة واحدة على الأقل.'); return; }
    if(missingType){ if(typeof showToast === 'function') showToast(`اختار نوع النشر لمنصة ${missingType.platform}.`); return; }
    const platformTypes = {};
    publishing.forEach(item => { platformTypes[item.platform] = item.postType; });
    const first = publishing[0] || {};
    const patch = {
      platforms: publishing.map(x => x.platform),
      platformPublishing: publishing,
      platformTypes,
      postType: publishing.length === 1 ? first.postType : '',
      postTypeLabel: publishing.length === 1 ? first.postTypeLabel : 'أنواع متعددة',
      requiredDimensions: publishing.length === 1 ? first.requiredDimensions : null,
      publishDate: normalizeText(popup.querySelector('.v187-prep-date')?.value || ''),
      publishTime: normalizeText(popup.querySelector('.v187-prep-time')?.value || ''),
      publishMetaSavedAt: new Date().toISOString(),
      publishMetaSavedBy: (typeof getCurrentUserIdentity === 'function' ? (getCurrentUserIdentity()?.email || getCurrentUserIdentity()?.name) : '') || 'user'
    };
    try{
      if(typeof updatePublishPrepSubmission === 'function') await updatePublishPrepSubmission(taskId, patch);
      // Keep a live copy on the raw task when possible so the current render/effective fields update immediately too.
      const task = v187Task(taskId);
      if(task){ Object.assign(task, patch); if(task.raw && typeof task.raw === 'object') Object.assign(task.raw, patch); }
      popup.remove();
      if(typeof renderPublishPrepPage === 'function') renderPublishPrepPage();
      if(typeof showToast === 'function') showToast('تم حفظ المنصات وأنواع النشر وتاريخ النشر.');
    }catch(err){ console.error(err); if(typeof showToast === 'function') showToast('تعذر حفظ بيانات النشر.'); }
  }
  window.openPublishPrepEditModal = v187Open;
  window.savePublishPrepEditModal = v187Save;
  try{ openPublishPrepEditModal = v187Open; savePublishPrepEditModal = v187Save; }catch(e){}
  document.addEventListener('click', function(e){
    const edit = e.target.closest?.('[data-edit-prep-publishing]');
    if(edit){ e.preventDefault(); e.stopPropagation(); v187Open(edit.dataset.editPrepPublishing || ''); return; }
    if(e.target.closest?.('[data-v187-close]')){ e.preventDefault(); document.querySelectorAll('.v187-prep-popup,.publish-prep-edit-popup').forEach(el => el.remove()); return; }
    const save = e.target.closest?.('[data-v187-save]');
    if(save){ e.preventDefault(); e.stopPropagation(); v187Save(save.dataset.v187Save || ''); return; }
    const platform = e.target.closest?.('.v187-prep-platform');
    if(platform){
      const row = platform.closest('.v187-prep-platform-row');
      const select = row?.querySelector('.v187-prep-post-type');
      if(select) select.disabled = !platform.checked;
      row?.classList.toggle('is-selected', platform.checked);
    }
  }, true);
  window.MZJ_LAST_PATCH = VERSION;
})();

/* v188 fix: Publish Prep must list every eligible publishing task, not only the latest approved structure subset. */
(function(){
  const VERSION = 'v188-publish-prep-show-all-tasks';
  try{ window.MZJ_APP_VERSION = VERSION; window.MZJ_LAST_PATCH = VERSION; }catch(_){ }

  function v188Text(value){
    try{ return normalizeText(value || ''); }catch(_){ return String(value || '').trim(); }
  }
  function v188Identity(value){
    try{ return identityClean(value || ''); }catch(_){ return v188Text(value).toLowerCase().replace(/\s+/g, ''); }
  }
  function v188List(value){
    try{ return normalizePrepPlatformList(value) || []; }catch(_){ return Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []); }
  }
  function v188AllowedForCurrentUser(item){
    try{ if(typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin()) return true; }catch(_){ }
    try{ if(typeof taskAssignedToCurrentUser === 'function' && taskAssignedToCurrentUser(item)) return true; }catch(_){ }
    try{ if(typeof currentUserMatchesTaskExact === 'function' && currentUserMatchesTaskExact(item)) return true; }catch(_){ }
    const assigned = item?.assignedTo || item?.owner || item?.user || item?.employee || item?.responsible || item?.assignedToName || item?.assignedToEmail || '';
    if(!assigned) return false;
    try{ return typeof valueMatchesCurrentUser === 'function' ? valueMatchesCurrentUser(assigned) : false; }catch(_){ return false; }
  }
  function v188IsContentOrStructureRequest(task){
    const role = v188Identity(task?.departmentRole || task?.assignedDepartmentName || task?.contentSectionName || '');
    const source = v188Identity(task?.source || task?.raw?.source || '');
    const title = v188Identity([task?.taskType, task?.title, task?.name, task?.taskName, task?.sourceRequestStep].filter(Boolean).join(' '));
    if(role === 'content' || role.includes('content')) return true;
    if(task?.contentTemplateTask || source.includes('campaignstructurecontenttemplate')) return true;
    if(task?.structureRequestTask || task?.needsStructureUpload || title.includes(v188Identity('طلب هيكل')) || title.includes('structurerequest')) return true;
    try{ if(typeof isCampaignContentWritingPrepTask === 'function' && isCampaignContentWritingPrepTask(task)) return true; }catch(_){ }
    return false;
  }
  function v188HasFinalFile(task){
    try{ if(typeof taskFiles === 'function') return (taskFiles(task) || []).some(file => file?.isFinal || file?.uploadKind === 'final' || file?.kind === 'final' || file?.purpose === 'final'); }catch(_){ }
    return false;
  }
  function v188HasPublishSignal(task, campaign){
    const row = task?.structureRow || task?.raw?.structureRow || {};
    const publishing = Array.isArray(task?.platformPublishing) ? task.platformPublishing : [];
    const platforms = v188List(task?.platforms || task?.platform || campaign?.platforms || campaign?.platform);
    const platformTypes = task?.platformTypes && Object.keys(task.platformTypes || {}).length;
    const date = v188Text(task?.publishDate || task?.date || task?.scheduleDate || task?.scheduledDate || task?.deliveryDate || task?.deadline || task?.dueDate || '');
    const caption = v188Text(task?.caption || task?.publishCaption || task?.copy || campaign?.caption || '');
    const hashtags = v188Text(task?.hashtags || task?.hashtagsText || task?.publishHashtags || campaign?.hashtags || '');
    const postType = v188Text(task?.postType || task?.publishType || task?.postTypeLabel || row?.contentType || task?.taskType || '');
    const progress = Number(task?.progress || 0) > 0;
    return !!(publishing.length || platforms.length || platformTypes || date || caption || hashtags || postType || progress || v188HasFinalFile(task));
  }
  function v188Title(task){
    const row = task?.structureRow || task?.raw?.structureRow || {};
    const section = task?.assignedDepartmentName || task?.contentSectionName || '';
    const content = row.contentType || task?.taskType || task?.structureTaskLabel || task?.product || task?.creative || '';
    const taskNo = row.taskNo || task?.taskNo || task?.structureTaskNo || '';
    const shortNo = String(taskNo || '').split('-').slice(-1)[0] || '';
    const label = [shortNo, content].filter(Boolean).join(' - ');
    try{ return [section, label || shortTaskName?.(task)].filter(Boolean).join(' / ') || task?.title || task?.name || task?.taskName || 'تاسك تجهيز نشر'; }catch(_){ return task?.title || task?.name || task?.taskName || label || 'تاسك تجهيز نشر'; }
  }
  function v188NormalizeTask(task){
    const campaign = (typeof campaignForPrepTask === 'function' ? campaignForPrepTask(task) : null) || (typeof campaignForTask === 'function' ? campaignForTask(task) : null) || {};
    const row = task?.structureRow || task?.raw?.structureRow || {};
    const base = {
      id: `task_${task?.id || task?.taskId || task?.code || task?.taskNo || task?.structureTaskNo || v188Identity(v188Title(task))}`,
      sourceType: task?.sourceType || (task?.structureGenerated || task?.parentStructureTaskId ? 'structure_execution' : 'campaign'),
      sourceLabel: task?.sourceLabel || task?.assignedDepartmentName || task?.contentSectionName || (campaign.campaignName || campaign.name ? 'حملة' : 'تاسك'),
      title: v188Title(task),
      campaignName: campaign.campaignName || campaign.name || task?.campaignName || '',
      type: row.contentType || (typeof prepTaskTypeLabel === 'function' ? prepTaskTypeLabel(task) : '') || task?.taskType || task?.type || '',
      requiredFile: (typeof prepTaskRequiredFileLabel === 'function' ? prepTaskRequiredFileLabel(task) : '') || task?.requiredFile || 'ملف نهائي',
      platforms: v188List(task?.platforms || task?.platform || campaign.platforms || campaign.platform),
      platformTypes: task?.platformTypes || {},
      platformPublishing: Array.isArray(task?.platformPublishing) ? task.platformPublishing : [],
      postType: task?.postType || task?.publishType || '',
      postTypeLabel: task?.postTypeLabel || '',
      requiredDimensions: task?.requiredDimensions || null,
      caption: task?.caption || task?.publishCaption || task?.copy || campaign.caption || '',
      hashtags: task?.hashtags || task?.hashtagsText || task?.publishHashtags || campaign.hashtags || '',
      publishDate: (typeof prepTaskDate === 'function' ? prepTaskDate(task, campaign) : '') || task?.publishDate || task?.date || task?.scheduleDate || task?.scheduledDate || '',
      publishTime: task?.publishTime || task?.scheduleTime || task?.time || '',
      deadline: task?.deadline || task?.dueDate || task?.requiredDate || task?.deliveryDate || '',
      notes: task?.notes || task?.note || task?.instructions || task?.description || row.description || '',
      progress: task?.progress || 0,
      raw: task
    };
    try{ return typeof enrichPrepTaskFromSchedule === 'function' ? enrichPrepTaskFromSchedule(base, campaign, task) : base; }catch(_){ return base; }
  }
  function v188ScheduleTasks(){
    const list = [];
    try{
      (campaigns || []).forEach(campaign => {
        (campaign.publishSchedule || []).forEach((row, index) => {
          if(!v188AllowedForCurrentUser(row)) return;
          const platformPublishing = Array.isArray(row.platformPublishing) ? row.platformPublishing : [];
          const platforms = v188List(row.platforms || row.platform || platformPublishing.map(x => x.platform));
          list.push({
            id: `schedule_${campaign.id || campaign.campaignCode || v188Identity(campaign.campaignName || campaign.name || 'campaign')}_${index}`,
            sourceType: 'campaign_schedule',
            sourceLabel: 'جدول النشر',
            title: row.output || row.title || row.taskName || `منشور ${campaign.campaignName || campaign.name || 'حملة'}`,
            campaignName: campaign.campaignName || campaign.name || campaign.campaignCode || '',
            type: (typeof prepTaskTypeLabel === 'function' ? prepTaskTypeLabel(row) : '') || row.contentType || row.postTypeLabel || row.postType || '',
            requiredFile: (typeof prepTaskRequiredFileLabel === 'function' ? prepTaskRequiredFileLabel(row) : '') || row.requiredFile || 'ملف نهائي',
            platforms,
            platformTypes: row.platformTypes || {},
            platformPublishing,
            postType: row.postType || row.publishType || '',
            postTypeLabel: row.postTypeLabel || '',
            requiredDimensions: row.requiredDimensions || null,
            caption: row.caption || campaign.caption || '',
            hashtags: row.hashtags || campaign.hashtags || '',
            publishDate: row.date || row.publishDate || row.scheduleDate || '',
            publishTime: row.time || row.publishTime || row.scheduleTime || '',
            deadline: row.deadline || row.deliveryDate || row.date || '',
            notes: row.note || row.notes || '',
            progress: row.progress || 0,
            raw: row
          });
        });
      });
    }catch(err){ console.warn('v188 schedule fallback failed', err); }
    return list;
  }
  function v188AllRawTasks(){
    const out = [];
    try{ (campaigns || []).forEach(campaign => (tasksForCampaign(campaign) || []).forEach(task => out.push(task))); }catch(_){ }
    try{ (campaignTasks || []).forEach(task => out.push(task)); }catch(_){ }
    return out;
  }
  window.getPublishingPrepTasks = getPublishingPrepTasks = function(){
    const map = new Map();
    const add = task => {
      if(!task || !task.id) return;
      if(!map.has(task.id)) map.set(task.id, task);
    };
    try{ (typeof publishPrepTasksFromExistingTasks === 'function' ? publishPrepTasksFromExistingTasks() : []).forEach(add); }catch(_){ }
    v188AllRawTasks().forEach(raw => {
      const campaign = (typeof campaignForPrepTask === 'function' ? campaignForPrepTask(raw) : null) || (typeof campaignForTask === 'function' ? campaignForTask(raw) : null) || {};
      if(!v188AllowedForCurrentUser(raw)) return;
      if(v188IsContentOrStructureRequest(raw)) return;
      try{ if(typeof isTaskWaitingForDependency === 'function' && isTaskWaitingForDependency(raw) && !v188HasPublishSignal(raw, campaign)) return; }catch(_){ }
      if(!v188HasPublishSignal(raw, campaign)) return;
      add(v188NormalizeTask(raw));
    });
    v188ScheduleTasks().forEach(add);
    return [...map.values()];
  };

  const oldRenderPublishPrepPageV188 = typeof renderPublishPrepPage === 'function' ? renderPublishPrepPage : null;
  if(oldRenderPublishPrepPageV188){
    renderPublishPrepPage = function(){
      oldRenderPublishPrepPageV188();
      try{
        const isAdmin = typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin();
        document.querySelectorAll('#publishPrepStats .publish-center-stat:first-child span').forEach(el => { el.textContent = isAdmin ? 'كل التاسكات' : 'تاسكاتي'; });
        const title = document.querySelector('#publish-prep .card-title h2');
        if(title && isAdmin) title.textContent = 'كل تاسكات تجهيز النشر';
      }catch(_){ }
    };
  }
  if(typeof renderPublishPrepPage === 'function' && typeof getRoute === 'function' && getRoute() === 'publish-prep') renderPublishPrepPage();
})();


/* v195 - polished Task Template naming + always open approved structure */
(function(){
  try{ window.MZJ_APP_VERSION = 'v195'; }catch(_){ }
  function v195Clean(value){ try{ return normalizeText(value || ''); }catch(_){ return String(value || '').trim(); } }
  function v195Id(value){ try{ return identityClean(value || ''); }catch(_){ return v195Clean(value).toLowerCase(); } }
  function v195IsContentTemplateTask(task){
    const src = v195Id(task?.source || task?.raw?.source || '');
    return !!(task?.contentTemplateTask || src.includes('campaignstructurecontenttemplate'));
  }
  function v195TaskShortNo(value){
    const text = v195Clean(value || '');
    const m = text.match(/N\s*0*([0-9]+)/i);
    if(m) return `N${String(Number(m[1])).padStart(2, '0')}`;
    return text.split('-').map(x => x.trim()).filter(Boolean).slice(-1)[0] || text;
  }
  function v195ContentTemplateTitle(task){
    const row = task?.structureRow || task?.raw?.structureRow || {};
    const no = v195TaskShortNo(task?.structureTaskNo || task?.taskNo || row.taskNo || (typeof structureTaskNumber === 'function' ? structureTaskNumber(task) : ''));
    let type = v195Clean(row.contentType || row.contentName || task?.contentType || task?.structureTaskLabel || task?.product || task?.creative || task?.taskType || '');
    type = type.replace(/^Task\s*Template\s*-?\s*/i, '').replace(/^قسم\s*المحتو[ىي]\s*\/\s*/i, '').trim();
    if(no && type.includes(no)) type = type.replace(no, '').replace(/^\s*[-/]+\s*/, '').trim();
    return [no, type || 'Task Template'].filter(Boolean).join(' - ');
  }
  if(typeof shortTaskName === 'function'){
    const prevShortTaskNameV195 = shortTaskName;
    shortTaskName = function(task){
      if(v195IsContentTemplateTask(task)) return escapeHtml(v195ContentTemplateTitle(task));
      return prevShortTaskNameV195(task);
    };
  }
  if(typeof renderStructureSection === 'function'){
    const prevRenderStructureSectionV195 = renderStructureSection;
    renderStructureSection = function(task){
      let html = prevRenderStructureSectionV195(task);
      try{
        const structure = taskStructure(task);
        const status = structure?.status || '';
        const hasStructureFile = !!(structure?.fileData || structure?.fileName || structure?.fileSize || (structureSheetTables(structure) || []).length || (structureDistributionRows(structure) || []).length);
        if(hasStructureFile && (status === 'approved' || status === 'distributed')){
          html = html.replace(/>مراجعة الهيكل<|>عرض الهيكل</g, '>فتح الهيكل المعتمد<');
          if(!html.includes('structure-approved-open-extra')){
            html = html.replace('<div class="structure-approved-message">تم اعتماد الهيكل. ابدأ توزيع تاسكات الهيكل على اليوزرات.</div>', `<div class="structure-approved-message structure-approved-open-extra">تم اعتماد الهيكل. تقدر تفتحه في أي وقت للمراجعة أو التوزيع. <button class="mini-btn" type="button" data-open-structure-review="${escapeHtml(task.id)}">فتح الهيكل المعتمد</button></div>`);
          }
        }
      }catch(_){ }
      return html;
    };
  }
  if(typeof openStructureReviewPopup === 'function'){
    const prevOpenStructureReviewPopupV195 = openStructureReviewPopup;
    openStructureReviewPopup = function(taskId){
      prevOpenStructureReviewPopupV195(taskId);
      try{
        const task = findTaskById(taskId);
        const status = taskStructure(task)?.status || '';
        const popup = document.querySelector('.structure-review-popup');
        if(popup && (status === 'approved' || status === 'distributed')){
          const title = popup.querySelector('.structure-review-head h3');
          if(title) title.textContent = 'عرض الهيكل المعتمد';
          popup.querySelectorAll('[data-structure-approve]').forEach(btn => btn.remove());
        }
      }catch(_){ }
    };
  }
})();


/* v196 - Task Template clean column C + stable approved structure open for admins */
(function(){
  try{ window.MZJ_APP_VERSION = 'v196'; }catch(_){ }
  if(typeof renderStructureSection === 'function'){
    const prevRenderStructureSectionV196 = renderStructureSection;
    renderStructureSection = function(task){
      let html = prevRenderStructureSectionV196(task);
      try{
        const structure = taskStructure(task) || {};
        const status = String(structure.status || '').trim();
        const admin = typeof isCurrentUserAdmin === 'function' && isCurrentUserAdmin();
        const hasStructureFile = !!(structure.fileData || structure.fileName || structure.fileSize || (typeof structureSheetTables === 'function' && (structureSheetTables(structure) || []).length) || (typeof structureDistributionRows === 'function' && (structureDistributionRows(structure) || []).length));
        if(admin && hasStructureFile && (status === 'approved' || status === 'distributed')){
          html = html.replace(/>مراجعة الهيكل</g, '>فتح الهيكل المعتمد<').replace(/>عرض الهيكل</g, '>فتح الهيكل المعتمد<');
          const extraBtn = `<button class="btn btn-primary structure-approved-admin-open" type="button" data-open-structure-review="${escapeHtml(task.id)}">فتح الهيكل المعتمد</button>`;
          if(!html.includes('structure-approved-admin-open')){
            if(html.includes('structure-approved-message')){
              html = html.replace('</div>${structureAssigneeTable(task)}</div>', `${extraBtn}</div>${structureAssigneeTable(task)}</div>`);
              if(!html.includes('structure-approved-admin-open')) html = html.replace(/(<div class="structure-approved-message"[^>]*>.*?<\/div>)/, `$1${extraBtn}`);
            }else{
              html = html.replace('</div>', `${extraBtn}</div>`);
            }
          }
        }
      }catch(_){ }
      return html;
    };
  }
  if(typeof openStructureReviewPopup === 'function'){
    const prevOpenStructureReviewPopupV196 = openStructureReviewPopup;
    openStructureReviewPopup = function(taskId){
      prevOpenStructureReviewPopupV196(taskId);
      try{
        const task = findTaskById(taskId);
        const status = String((taskStructure(task) || {}).status || '').trim();
        const popup = document.querySelector('.structure-review-popup');
        if(popup && (status === 'approved' || status === 'distributed')){
          const title = popup.querySelector('.structure-review-head h3');
          if(title) title.textContent = 'فتح الهيكل المعتمد';
          popup.querySelectorAll('[data-structure-approve]').forEach(btn => btn.remove());
        }
      }catch(_){ }
    };
  }
})();

/* v197 - keep approved structure request visible for admin readiness dashboard */
(function(){
  try{ window.MZJ_APP_VERSION = 'v197'; }catch(_){ }
  function v197StructureStatus(task){
    try{ return String((taskStructure(task) || {}).status || '').trim(); }catch(_){ return ''; }
  }
  function v197IsMainStructureRequest(task){
    if(!task) return false;
    try{
      if(typeof isCampaignContentWritingTask === 'function' && isCampaignContentWritingTask(task)) return true;
      if(task.needsStructureUpload || task.structureRequest || task.campaignStructureTask) return true;
      const source = typeof identityClean === 'function' ? identityClean(task.source || task.raw?.source || '') : String(task.source || '').toLowerCase();
      if(source.includes('structure') && source.includes('campaign') && !source.includes('template')) return true;
      const type = typeof identityClean === 'function' ? identityClean([task.taskType, task.structureTaskLabel, task.contentSectionName, task.assignedDepartmentName].filter(Boolean).join(' ')) : String(task.taskType || '');
      return type.includes('طلب هيكل') || (type.includes('كتابه محتوي حمله') || type.includes('كتابه محتوى حمله'));
    }catch(_){ return false; }
  }
  function v197TaskDoneForReadiness(task){
    try{
      if(typeof taskProgress === 'function' && taskProgress(task) >= 100) return true;
      const files = typeof taskFiles === 'function' ? taskFiles(task) : [];
      return files.some(file => file?.isFinal || file?.uploadKind === 'final' || file?.kind === 'final' || file?.purpose === 'final');
    }catch(_){ return false; }
  }
  function v197AdminTaskSort(a, b){
    const pa = v197IsMainStructureRequest(a) ? -1 : 0;
    const pb = v197IsMainStructureRequest(b) ? -1 : 0;
    if(pa !== pb) return pa - pb;
    const ai = Number(a?.creativeIndex ?? 9999), bi = Number(b?.creativeIndex ?? 9999);
    if(ai !== bi) return ai - bi;
    return String(a?.id || '').localeCompare(String(b?.id || ''));
  }
  window.v197IsMainStructureRequest = v197IsMainStructureRequest;

  if(typeof adminDashboardTasksForCampaign === 'function'){
    adminDashboardTasksForCampaign = function(campaign){
      try{ return (tasksForCampaign(campaign) || []).slice().sort(v197AdminTaskSort); }
      catch(_){ return []; }
    };
  }

  if(typeof campaignTasksSnapshot === 'function'){
    campaignTasksSnapshot = function(campaign){
      const related = typeof adminDashboardTasksForCampaign === 'function' ? adminDashboardTasksForCampaign(campaign) : [];
      const received = related.filter(task => task.received || task.receivedConfirmed).length;
      const progress = typeof campaignRequiredProgressFromTasks === 'function' ? campaignRequiredProgressFromTasks(related) : 0;
      const publish = typeof campaignPublishProgress === 'function' ? campaignPublishProgress(campaign) : 0;
      const structureAttached = typeof campaignStructureAttachedCount === 'function' ? campaignStructureAttachedCount(related) : 0;
      const mainStructureTasks = related.filter(v197IsMainStructureRequest);
      const nonStructureTasks = related.filter(task => !v197IsMainStructureRequest(task));
      const hasApprovedStructure = mainStructureTasks.some(task => ['approved','distributed'].includes(v197StructureStatus(task)) || (typeof taskStructureAttached === 'function' && taskStructureAttached(task)));
      const nonStructureDone = nonStructureTasks.length > 0 && nonStructureTasks.every(v197TaskDoneForReadiness);
      const keepStructureInReadiness = hasApprovedStructure && !nonStructureDone;
      return { related, received, progress, publish, total: related.length, structureAttached, hasApprovedStructure, keepStructureInReadiness };
    };
  }

  if(typeof renderCampaignInlineTasks === 'function'){
    renderCampaignInlineTasks = function(campaign){
      const related = (typeof adminDashboardTasksForCampaign === 'function' ? adminDashboardTasksForCampaign(campaign) : []).slice().sort(v197AdminTaskSort);
      const grouped = typeof groupTasksForKanban === 'function' ? groupTasksForKanban(related) : [];
      const taskItem = task => `<article class="inline-task-row ${v197IsMainStructureRequest(task) ? 'inline-task-row-structure-first' : ''}">
        <div><strong>${shortTaskName(task)}</strong><p>${escapeHtml([taskDepartmentLabel(task), task.taskType, taskOwnerName(task)].filter(Boolean).join(' / '))}</p></div>
        <span class="inline-state-stack"><span class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</span>${taskStructureAttachedBadge(task)}</span>
        <b>${taskProgress(task)}%</b>
        <button type="button" class="mini-btn" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(task.campaignId || '')}">تفاصيل</button>
      </article>`;
      return `<div class="campaign-inline-tasks">${grouped.length ? grouped.map(group => `<section class="inline-task-group"><div class="inline-task-group-title"><h3>${group.label}</h3><span>${group.tasks.length}</span></div>${group.tasks.map(taskItem).join('')}</section>`).join('') : '<div class="empty-state soft-empty">لا توجد تاسكات للحملة.</div>'}</div>`;
    };
  }

  if(typeof renderAdminDashboard === 'function'){
    renderAdminDashboard = function(){
      const allTasks = campaigns.flatMap(campaign => adminDashboardTasksForCampaign(campaign));
      const count = document.getElementById('dashboardCampaignsCount'); if(count) count.textContent = campaigns.length || '—';
      const tasksCount = document.getElementById('dashboardTasksCount'); if(tasksCount) tasksCount.textContent = allTasks.length || '—';
      const adminBoard = document.getElementById('adminDashboardBoard');
      if(!adminBoard) return;
      if(!isCurrentUserAdmin()) { renderUserDashboard(); return; }
      setDashboardMode('admin');
      const items = campaigns.map(campaign => ({ campaign, ...campaignTasksSnapshot(campaign) }));
      const requiredItems = items.filter(item => item.total && item.received < item.total);
      const readinessItems = items.filter(item => item.total && (item.progress < 100 || item.keepStructureInReadiness));
      const publishItems = items.filter(item => item.progress >= 100 && item.publish < 100 && !item.keepStructureInReadiness);
      const archiveItems = items.filter(item => item.progress >= 100 && item.publish >= 100 && !item.keepStructureInReadiness);

      const requiredCard = item => `<article class="dash-task-receive-card">
        <div class="dash-card-top"><strong>${shortCampaignTitle(item.campaign)}</strong><span>${escapeHtml(item.campaign.campaignCode || item.campaign.campaign_code || 'بدون كود')}</span></div>
        <div class="receive-meter"><strong>${item.received}/${item.total}</strong><span>تم الاستلام</span></div>
        <div class="receive-list">${item.related.map(task => `<div><span><b>${shortTaskName(task)}</b><em>${taskOwnerName(task)}</em></span><span class="receive-state-stack"><b class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</b>${taskStructureAttachedBadge(task)}</span></div>`).join('')}</div>
      </article>`;

      const readinessCard = item => `<article class="dash-campaign-card dash-ready-card" data-open-campaign="${escapeHtml(item.campaign.id)}">
        <div class="dash-card-top"><strong>${shortCampaignTitle(item.campaign)}</strong><span>${item.progress}%</span></div>
        <p>${escapeHtml(item.campaign.campaignCode || item.campaign.campaign_code || 'بدون كود')} · ${item.total} تاسك</p>
        ${item.structureAttached ? `<div class="structure-attach-alert">تم إرفاق الهيكل · ${item.structureAttached}</div>` : ''}
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
    };
  }

  try{
    if(typeof getRoute === 'function' && getRoute() === 'dashboard' && typeof renderAdminDashboard === 'function') renderAdminDashboard();
  }catch(_){ }
})();

/* v198 - details after structure distribution + creative types + content Task Template access */
(function(){
  try{ window.MZJ_APP_VERSION = 'v198'; }catch(_){ }

  function v198Clean(value){
    try{ return normalizeText(value || ''); }catch(_){ return String(value || '').trim(); }
  }
  function v198Identity(value){
    try{ return identityClean(value || ''); }catch(_){ return v198Clean(value).toLowerCase(); }
  }
  function v198Unique(list){
    try{ return uniqueList(list); }catch(_){ return Array.from(new Set((list || []).filter(Boolean))); }
  }
  function v198TaskIdKeys(task){
    return v198Unique([
      task?.id,
      task?.docId,
      task?.taskId,
      task?.linkedExecutionTaskId,
      task?.linkedContentTemplateTaskId,
      task?.parentStructureTaskId,
      task?.contentExecutionPairKey,
      task?.linkedExecutionPairKey,
      task?.structureTaskNo,
      task?.taskNo
    ].map(v198Clean).filter(Boolean));
  }
  function v198TaskMatchesId(task, wanted){
    const cleanWanted = v198Clean(wanted);
    if(!cleanWanted) return false;
    const wantedIdentity = v198Identity(cleanWanted);
    return v198TaskIdKeys(task).some(key => key === cleanWanted || v198Identity(key) === wantedIdentity);
  }

  if(typeof findTaskById === 'function'){
    const prevFindTaskByIdV198 = findTaskById;
    findTaskById = function(taskId, campaignId = ''){
      let found = null;
      try{ found = prevFindTaskByIdV198(taskId, campaignId); }catch(_){ found = null; }
      if(found) return found;
      const cleanCampaign = v198Clean(campaignId);
      const list = Array.isArray(campaigns) ? campaigns : [];
      const candidates = cleanCampaign ? list.filter(c => [c.id, c.docId, c.campaignId].map(v198Clean).includes(cleanCampaign)) : list;
      for(const campaign of candidates){
        const taskSources = [];
        try{ taskSources.push(...(Array.isArray(campaign.departmentTasks) ? campaign.departmentTasks : [])); }catch(_){ }
        try{ taskSources.push(...(typeof tasksForCampaign === 'function' ? tasksForCampaign(campaign) : [])); }catch(_){ }
        const match = taskSources.find(task => v198TaskMatchesId(task, taskId));
        if(match){
          try{ return normalizeCampaignTask({ ...match, campaignId: match.campaignId || campaign.id }, campaign); }catch(_){ return { ...match, campaignId: match.campaignId || campaign.id }; }
        }
      }
      return null;
    };
  }

  if(typeof renderTaskDetail === 'function'){
    renderTaskDetail = function(taskId, campaignId = ''){
      const task = findTaskById(taskId, campaignId);
      if(!task){
        try{ showToast('تعذر فتح تفاصيل التاسك. تم تحديث البحث عن التاسكات، جرّب تحديث الصفحة لو استمرت المشكلة.'); }catch(_){ }
        return;
      }
      if(!isCurrentUserAdmin() && !currentUserMatchesTaskExact(task)){
        try{ showToast('التاسك غير مسند لهذا المستخدم.'); }catch(_){ }
        return;
      }
      openTaskModal(task);
    };
  }

  function v198CreativeTypesForTask(task){
    const campaign = (typeof campaignForTask === 'function' ? campaignForTask(task) : null) || {};
    const list = Array.isArray(campaign.creatives) ? campaign.creatives : [];
    const labels = [];
    const taskLink = v198Clean((typeof taskCreativeLinkCode === 'function' ? taskCreativeLinkCode(task) : '') || task?.creativeLinkCode || task?.campaignCreativeCode || task?.structureCreativeLinkCode).toUpperCase();
    const taskShort = v198Clean(task?.creativeShortCode || (typeof extractCreativeShortCodeFromTaskNo === 'function' ? extractCreativeShortCodeFromTaskNo(task?.taskNo || task?.structureTaskNo || '') : '')).toUpperCase();
    list.forEach((item, index) => {
      const name = v198Clean(item?.creative || item?.product || '');
      if(!name) return;
      const itemShort = v198Clean(item?.creativeShortCode || (typeof creativeShortCodeForName === 'function' ? creativeShortCodeForName(name) : '')).toUpperCase();
      const itemLink = v198Clean(typeof creativeLinkCodeForIndex === 'function' ? creativeLinkCodeForIndex(campaign.campaignCode || campaign.campaign_code || '', index) : '').toUpperCase();
      if((taskShort && itemShort && taskShort === itemShort) || (taskLink && itemLink && taskLink === itemLink) || v198Identity(task?.creative) === v198Identity(name)) labels.push(name);
    });
    if(!labels.length) labels.push(task?.creative, task?.product, task?.structureRow?.creative, task?.structureRow?.contentType);
    return v198Unique(labels.map(v198Clean).filter(Boolean));
  }

  function v198ContentTemplateStatusLabel(status){
    const clean = v198Clean(status || '');
    if(clean === 'approved') return 'تم اعتماد Task Template';
    if(clean === 'pending_review') return 'في انتظار مراجعة الأدمن';
    if(clean === 'needs_changes') return 'محتاج تعديل';
    if(clean === 'rejected') return 'مرفوض';
    return 'لم يتم رفع Task Template';
  }
  function v198IsContentTaskEligibleForTemplate(task){
    if(!task) return false;
    const role = typeof normalizeDepartmentRole === 'function' ? normalizeDepartmentRole(task.departmentRole || task.assignedDepartmentName || task.contentSectionName || '') : '';
    if(role !== 'content') return false;
    if(task.contentTemplateTask || task.source === 'campaign-structure-content-template') return true;
    if(task.structureRow || task.structureGenerated || task.needsTaskTemplate || task.needsContentTemplate) return true;
    const text = v198Identity([task.taskType, task.structureTaskLabel, task.taskNo, task.structureTaskNo].filter(Boolean).join(' '));
    return text.includes('task template') || text.includes('محتوي') || text.includes('محتوى');
  }
  function v198RenderTaskTemplateSection(task){
    if(!v198IsContentTaskEligibleForTemplate(task)) return '';
    const admin = typeof isCurrentUserAdmin === 'function' ? isCurrentUserAdmin() : false;
    const tpl = task.taskTemplate || {};
    const hasFile = !!(tpl.fileData || tpl.fileName || tpl.fileSize || (Array.isArray(tpl.sheetTables) && tpl.sheetTables.length) || tpl.sheetTablesJson);
    const canUpload = !admin && (!tpl.status || ['not_uploaded','needs_changes','rejected'].includes(v198Clean(tpl.status)));
    const fieldsHtml = (typeof v172RenderTaskTemplateFields === 'function') ? v172RenderTaskTemplateFields(tpl) : '';
    return `<div class="modal-section task-template-section task-template-section-v198"><div class="modal-section-title"><h3>Task Template - قسم المحتوى</h3><span>${escapeHtml(v198ContentTemplateStatusLabel(tpl.status))}</span></div>
      <div class="structure-actions">
        ${canUpload ? `<button class="btn btn-light" type="button" data-download-task-template="${escapeHtml(task.id)}">تحميل قالب Task Template</button><button class="btn btn-primary" type="button" data-upload-task-template="${escapeHtml(task.id)}">رفع ملف Task Template</button>` : ''}
        ${hasFile ? `<span class="structure-file-name structure-attached-label">تم رفع Task Template</span>${tpl.fileName ? `<span class="structure-file-name">${escapeHtml(tpl.fileName)}</span>` : ''}` : '<span class="structure-file-name muted">لم يتم رفع Task Template</span>'}
        ${tpl.fileData ? `<a class="btn btn-light" href="${escapeHtml(tpl.fileData)}" download="${escapeHtml(tpl.fileName || 'task-template.xlsx')}">تحميل الملف المرفوع</a>` : ''}
        ${admin && hasFile ? `<button class="btn btn-primary" type="button" data-open-task-template-review="${escapeHtml(task.id)}">مراجعة Task Template</button>` : ''}
      </div>
      ${fieldsHtml}
      ${task.linkedExecutionDepartmentName || task.linkedExecutionAssigneeName ? `<div class="task-template-link-note">مرتبط بتاسك: ${escapeHtml(task.linkedExecutionDepartmentName || '')} / ${escapeHtml(task.linkedExecutionAssigneeName || '')}</div>` : ''}
    </div>`;
  }

  if(typeof buildTaskDetailHtml === 'function'){
    const prevBuildTaskDetailHtmlV198 = buildTaskDetailHtml;
    buildTaskDetailHtml = function(task){
      let html = prevBuildTaskDetailHtmlV198(task);
      const creativeTypes = v198CreativeTypesForTask(task);
      if(creativeTypes.length){
        const creativeCard = `<div class="brief-box creative-types-box-v198"><span>أنواع الكرييتيف المختارة</span><strong>${escapeHtml(creativeTypes.join('، '))}</strong></div>`;
        if(!html.includes('creative-types-box-v198')){
          html = html.replace('<div class="modal-section task-brief-row task-brief-row-compact">', `<div class="modal-section task-brief-row task-brief-row-compact">${creativeCard}`);
        }
      }
      const templateSection = v198RenderTaskTemplateSection(task);
      if(templateSection && !html.includes('task-template-section-v198') && !html.includes('Task Template - قسم المحتوى')){
        html = html.replace('<div class="modal-section task-actions-section compact-actions-section">', `${templateSection}<div class="modal-section task-actions-section compact-actions-section">`);
      }
      return html;
    };
  }

  if(typeof renderCampaignInlineTasks === 'function'){
    const prevRenderCampaignInlineTasksV198 = renderCampaignInlineTasks;
    renderCampaignInlineTasks = function(campaign){
      try{
        const related = (typeof adminDashboardTasksForCampaign === 'function' ? adminDashboardTasksForCampaign(campaign) : []).slice().sort(typeof v197AdminTaskSort === 'function' ? v197AdminTaskSort : undefined);
        const grouped = typeof groupTasksForKanban === 'function' ? groupTasksForKanban(related) : [];
        const taskItem = task => `<article class="inline-task-row ${typeof v197IsMainStructureRequest === 'function' && v197IsMainStructureRequest(task) ? 'inline-task-row-structure-first' : ''}">
          <div><strong>${shortTaskName(task)}</strong><p>${escapeHtml([taskDepartmentLabel(task), task.taskType, taskOwnerName(task)].filter(Boolean).join(' / '))}</p></div>
          <span class="inline-state-stack"><span class="state-chip ${receivedClass(task)}">${receivedLabel(task)}</span>${taskStructureAttachedBadge(task)}</span>
          <b>${taskProgress(task)}%</b>
          <button type="button" class="mini-btn" data-open-task="${escapeHtml(task.id)}" data-task-campaign="${escapeHtml(campaign.id || task.campaignId || '')}">تفاصيل</button>
        </article>`;
        return `<div class="campaign-inline-tasks">${grouped.length ? grouped.map(group => `<section class="inline-task-group"><div class="inline-task-group-title"><h3>${group.label}</h3><span>${group.tasks.length}</span></div>${group.tasks.map(taskItem).join('')}</section>`).join('') : '<div class="empty-state soft-empty">لا توجد تاسكات للحملة.</div>'}</div>`;
      }catch(error){ console.error('v198 render campaign inline tasks failed', error); return prevRenderCampaignInlineTasksV198(campaign); }
    };
  }

  try{ if(typeof getRoute === 'function' && getRoute() === 'dashboard' && typeof renderAdminDashboard === 'function') renderAdminDashboard(); }catch(_){ }
})();

/* v199 - shooting executor to content writer deadline inside step 2 */
(function(){
  function v199ParseJson(value, fallback){
    try { return value ? JSON.parse(value) : fallback; } catch(e){ return fallback; }
  }
  function v199KeyForRow(row){
    return normalizeText(row?.dataset?.execId || row?.dataset?.execName || '');
  }
  function v199PanelRoleBlock(panel, role){
    const clean = normalizeDepartmentRole(role || '');
    return panel?.querySelector(`[data-assignment-role="${clean}"]`) || null;
  }
  function v199StoreDeadline(block, row, value){
    if(!block || !row) return;
    const key = v199KeyForRow(row);
    if(!key) return;
    const map = v199ParseJson(block.dataset.contentWritingDeadlines || '{}', {});
    if(value) map[key] = value; else delete map[key];
    block.dataset.contentWritingDeadlines = JSON.stringify(map);
  }
  function v199DeadlineForRow(block, row){
    const key = v199KeyForRow(row);
    const map = v199ParseJson(block?.dataset?.contentWritingDeadlines || '{}', {});
    return key ? (map[key] || '') : '';
  }
  function v199RowHasWriter(row){
    return !!row?.querySelector('.js-user-content-link-check:checked');
  }
  function v199EnhanceContentDeadlineForBlock(block){
    if(!block) return;
    const role = normalizeDepartmentRole(block.dataset.assignmentRole || '');
    if(role !== 'shooting') return;
    block.querySelectorAll('.js-user-content-link-row').forEach(row => {
      let wrap = row.querySelector('.js-content-writing-deadline-wrap');
      if(!wrap){
        wrap = document.createElement('label');
        wrap.className = 'content-writing-deadline-wrap js-content-writing-deadline-wrap';
        wrap.innerHTML = '<span>موعد تسليم كتابة محتوى التاسك</span><input type="date" class="js-content-writing-deadline" />';
        row.appendChild(wrap);
      }
      const input = wrap.querySelector('.js-content-writing-deadline');
      if(input && !input.value){ input.value = v199DeadlineForRow(block, row); }
      wrap.classList.toggle('is-hidden', !v199RowHasWriter(row));
    });
  }
  function v199EnhanceContentDeadlines(panel){
    const root = panel || document;
    root.querySelectorAll('[data-assignment-role="shooting"]').forEach(v199EnhanceContentDeadlineForBlock);
  }
  function v199ReadShootingLinks(panel){
    const block = v199PanelRoleBlock(panel, 'shooting');
    if(!block) return { ids: [], names: [], links: [] };
    v199EnhanceContentDeadlineForBlock(block);
    const links = [...block.querySelectorAll('.js-user-content-link-row')].map(row => {
      const inputDate = row.querySelector('.js-content-writing-deadline');
      const deadline = normalizeText(inputDate?.value || v199DeadlineForRow(block, row) || '');
      if(inputDate) v199StoreDeadline(block, row, deadline);
      const checks = [...row.querySelectorAll('.js-user-content-link-check:checked')];
      return {
        executorUserId: normalizeText(row.dataset.execId || ''),
        executorUserName: normalizeText(row.dataset.execName || ''),
        userId: normalizeText(row.dataset.execId || ''),
        userName: normalizeText(row.dataset.execName || ''),
        role: 'shooting',
        departmentRole: 'shooting',
        departmentCode: roleCode('shooting'),
        contentUserIds: checks.map(input => normalizeText(input.value || '')).filter(Boolean),
        contentUserNames: checks.map(input => normalizeText(input.dataset.name || '')).filter(Boolean),
        contentWritingDeadline: deadline,
        contentWriterDeadline: deadline,
        contentTaskDeadline: deadline
      };
    }).filter(link => (link.executorUserId || link.executorUserName) && ((link.contentUserIds || []).length || (link.contentUserNames || []).length));
    return {
      ids: uniqueList(links.flatMap(link => link.contentUserIds || []).filter(Boolean)),
      names: uniqueList(links.flatMap(link => link.contentUserNames || []).filter(Boolean)),
      links
    };
  }

  const oldSyncPanelDynamicStateV199 = syncPanelDynamicState;
  syncPanelDynamicState = function(panel){
    const result = oldSyncPanelDynamicStateV199 ? oldSyncPanelDynamicStateV199(panel) : panel;
    v199EnhanceContentDeadlines(panel);
    return result;
  };

  const oldRefreshContentDependencyPickersV199 = refreshContentDependencyPickers;
  refreshContentDependencyPickers = function(panel){
    if(oldRefreshContentDependencyPickersV199) oldRefreshContentDependencyPickersV199(panel);
    v199EnhanceContentDeadlines(panel);
  };

  const oldSelectedContentDependencyV199 = selectedContentDependency;
  selectedContentDependency = function(panel, role){
    const clean = normalizeDepartmentRole(role || '');
    if(clean === 'shooting') return v199ReadShootingLinks(panel);
    return oldSelectedContentDependencyV199 ? oldSelectedContentDependencyV199(panel, role) : { ids: [], names: [], links: [] };
  };

  const oldSelectedRoleTaskFromPanelV199 = selectedRoleTaskFromPanel;
  selectedRoleTaskFromPanel = function(panel, role){
    const task = oldSelectedRoleTaskFromPanelV199 ? oldSelectedRoleTaskFromPanelV199(panel, role) : null;
    if(!task) return task;
    if(normalizeDepartmentRole(role || '') === 'shooting'){
      const linked = v199ReadShootingLinks(panel);
      task.dependencyLinks = linked.links;
      task.dependsOnContentUserIds = linked.ids;
      task.dependsOnContentUserNames = linked.names;
      task.upstreamUserIds = linked.ids;
      task.upstreamUserNames = linked.names;
      task.upstreamUserLabel = (linked.names || []).join('، ');
      task.contentWritingDeadlines = linked.links.map(link => ({
        executorUserId: link.executorUserId,
        executorUserName: link.executorUserName,
        contentUserIds: link.contentUserIds,
        contentUserNames: link.contentUserNames,
        deadline: link.contentWritingDeadline || ''
      }));
      task.contentWritingDeadline = uniqueList(linked.links.map(link => link.contentWritingDeadline).filter(Boolean)).join('، ');
    }
    return task;
  };

  document.addEventListener('change', function(event){
    const row = event.target.closest?.('.js-user-content-link-row');
    const block = event.target.closest?.('[data-assignment-role="shooting"]');
    if(!row || !block) return;
    if(event.target.classList.contains('js-content-writing-deadline')){
      v199StoreDeadline(block, row, normalizeText(event.target.value || ''));
    }
    if(event.target.classList.contains('js-user-content-link-check')){
      v199EnhanceContentDeadlineForBlock(block);
    }
  }, true);

  document.addEventListener('click', function(event){
    const panel = event.target.closest?.('.creative-assignment-panel');
    if(panel) setTimeout(() => v199EnhanceContentDeadlines(panel), 30);
  }, true);
})();

/* v200 - per shooting/content-writer deadline rows */
(function(){
  function safeText(value){ return typeof normalizeText === 'function' ? normalizeText(value || '') : String(value || '').trim(); }
  function safeRole(value){ return typeof normalizeDepartmentRole === 'function' ? normalizeDepartmentRole(value || '') : safeText(value); }
  function parseJson(value, fallback){ try { return value ? JSON.parse(value) : fallback; } catch(e){ return fallback; } }
  function encodeJson(value){ try { return JSON.stringify(value || {}); } catch(e){ return '{}'; } }
  function uniq(arr){ return typeof uniqueList === 'function' ? uniqueList(arr) : Array.from(new Set((arr || []).filter(Boolean))); }
  function esc(value){ return typeof escapeHtml === 'function' ? escapeHtml(value || '') : String(value || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
  function rCode(role){ return typeof roleCode === 'function' ? roleCode(role) : role; }
  function keyPart(value){ return safeText(value).replace(/\s+/g, ' ').toLowerCase(); }
  function execKey(row){ return keyPart(row?.dataset?.execId || row?.dataset?.execName || ''); }
  function writerKey(input){ return keyPart(input?.value || input?.dataset?.name || ''); }
  function pairKey(row, input){ return `${execKey(row)}::${writerKey(input)}`; }
  function mapFor(block){ return parseJson(block?.dataset?.contentWritingDeadlinesV200 || block?.dataset?.contentWritingDeadlines || '{}', {}); }
  function setMap(block, map){ if(block) block.dataset.contentWritingDeadlinesV200 = encodeJson(map); }
  function oldRowDeadline(block, row){
    const key = execKey(row);
    const old = parseJson(block?.dataset?.contentWritingDeadlines || '{}', {});
    return key ? (old[key] || '') : '';
  }
  function storePair(block, row, input, value){
    const key = pairKey(row, input);
    if(!key || key === '::') return;
    const map = mapFor(block);
    if(value) map[key] = value; else delete map[key];
    setMap(block, map);
  }
  function valueForPair(block, row, input){
    const map = mapFor(block);
    const key = pairKey(row, input);
    return key ? (map[key] || '') : '';
  }
  function ensureStyle(){
    if(document.getElementById('v200ContentWriterDeadlineStyle')) return;
    const style = document.createElement('style');
    style.id = 'v200ContentWriterDeadlineStyle';
    style.textContent = `
      .content-writing-deadline-wrap.js-content-writing-deadline-wrap{display:none!important}
      .content-writer-deadline-list{display:grid!important;gap:5px!important;margin-top:6px!important;padding:7px!important;border:1px dashed rgba(120,70,50,.22)!important;border-radius:10px!important;background:rgba(255,248,244,.72)!important;max-height:150px!important;overflow:auto!important}
      .content-writer-deadline-list.is-hidden{display:none!important}
      .content-writer-deadline-title{font-weight:900!important;color:#6b3b2f!important;font-size:10.5px!important;line-height:1.1!important;margin-bottom:2px!important}
      .content-writer-deadline-row{display:grid!important;grid-template-columns:minmax(90px,1fr) 118px!important;gap:6px!important;align-items:center!important;margin:0!important}
      .content-writer-deadline-row span{font-size:10.5px!important;font-weight:800!important;color:#4b2b24!important;line-height:1.1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .content-writer-deadline-row input{width:118px!important;max-width:118px!important;height:28px!important;min-height:28px!important;border:1px solid rgba(120,70,50,.25)!important;border-radius:8px!important;padding:2px 6px!important;background:#fff!important;color:#2d1b16!important;font-size:11px!important;font-family:inherit!important;font-weight:800!important;box-sizing:border-box!important}
      @media(max-width:720px){.content-writer-deadline-row{grid-template-columns:minmax(70px,1fr) 112px!important}.content-writer-deadline-row input{width:112px!important;max-width:112px!important}}
    `;
    document.head.appendChild(style);
  }
  function enhanceBlock(block){
    if(!block || safeRole(block.dataset.assignmentRole || '') !== 'shooting') return;
    ensureStyle();
    block.querySelectorAll('.js-user-content-link-row').forEach(row => {
      const oldWrap = row.querySelector('.js-content-writing-deadline-wrap');
      if(oldWrap) oldWrap.style.display = 'none';
      let list = row.querySelector('.js-content-writer-deadline-list');
      if(!list){
        list = document.createElement('div');
        list.className = 'content-writer-deadline-list js-content-writer-deadline-list is-hidden';
        row.appendChild(list);
      }
      const checks = [...row.querySelectorAll('.js-user-content-link-check:checked')];
      if(!checks.length){
        list.classList.add('is-hidden');
        list.innerHTML = '';
        return;
      }
      list.classList.remove('is-hidden');
      list.innerHTML = `<div class="content-writer-deadline-title">مواعيد تسليم كتابة المحتوى لكل كاتب</div>${checks.map(input => {
        const current = valueForPair(block, row, input) || oldRowDeadline(block, row) || '';
        if(current) storePair(block, row, input, current);
        return `<label class="content-writer-deadline-row"><span>${esc(input.dataset.name || input.value || 'كاتب محتوى')}</span><input type="date" class="js-content-writer-deadline" data-writer-id="${esc(input.value || '')}" data-writer-name="${esc(input.dataset.name || '')}" value="${esc(current)}" /></label>`;
      }).join('')}`;
    });
  }
  function enhancePanel(panel){
    const root = panel || document;
    root.querySelectorAll('[data-assignment-role="shooting"]').forEach(enhanceBlock);
  }
  function panelRoleBlock(panel, role){
    const clean = safeRole(role || '');
    return panel?.querySelector(`[data-assignment-role="${clean}"]`) || null;
  }
  function readShootingLinks(panel){
    const block = panelRoleBlock(panel, 'shooting');
    if(!block) return { ids: [], names: [], links: [] };
    enhanceBlock(block);
    const links = [...block.querySelectorAll('.js-user-content-link-row')].map(row => {
      const checks = [...row.querySelectorAll('.js-user-content-link-check:checked')];
      const perWriter = checks.map(input => {
        const dateInput = row.querySelector(`.js-content-writer-deadline[data-writer-id="${CSS.escape(input.value || '')}"]`);
        const deadline = safeText(dateInput?.value || valueForPair(block, row, input) || '');
        if(deadline) storePair(block, row, input, deadline);
        return {
          contentUserId: safeText(input.value || ''),
          contentUserName: safeText(input.dataset.name || ''),
          writerId: safeText(input.value || ''),
          writerName: safeText(input.dataset.name || ''),
          deadline,
          contentWritingDeadline: deadline,
          contentWriterDeadline: deadline,
          contentTaskDeadline: deadline
        };
      });
      const deadlines = uniq(perWriter.map(item => item.deadline).filter(Boolean));
      return {
        executorUserId: safeText(row.dataset.execId || ''),
        executorUserName: safeText(row.dataset.execName || ''),
        userId: safeText(row.dataset.execId || ''),
        userName: safeText(row.dataset.execName || ''),
        role: 'shooting',
        departmentRole: 'shooting',
        departmentCode: rCode('shooting'),
        contentUserIds: perWriter.map(item => item.contentUserId).filter(Boolean),
        contentUserNames: perWriter.map(item => item.contentUserName).filter(Boolean),
        contentWriterDeadlines: perWriter,
        contentWritingDeadlines: perWriter,
        contentWritingDeadline: deadlines.join('، '),
        contentWriterDeadline: deadlines.join('، '),
        contentTaskDeadline: deadlines.join('، ')
      };
    }).filter(link => (link.executorUserId || link.executorUserName) && ((link.contentUserIds || []).length || (link.contentUserNames || []).length));
    return { ids: uniq(links.flatMap(link => link.contentUserIds || [])), names: uniq(links.flatMap(link => link.contentUserNames || [])), links };
  }

  const prevSync = typeof syncPanelDynamicState === 'function' ? syncPanelDynamicState : null;
  if(prevSync){ syncPanelDynamicState = function(panel){ const result = prevSync(panel); enhancePanel(panel); return result; }; }

  const prevRefresh = typeof refreshContentDependencyPickers === 'function' ? refreshContentDependencyPickers : null;
  if(prevRefresh){ refreshContentDependencyPickers = function(panel){ const result = prevRefresh(panel); enhancePanel(panel); return result; }; }

  const prevSelectedContentDependency = typeof selectedContentDependency === 'function' ? selectedContentDependency : null;
  selectedContentDependency = function(panel, role){
    if(safeRole(role || '') === 'shooting') return readShootingLinks(panel);
    return prevSelectedContentDependency ? prevSelectedContentDependency(panel, role) : { ids: [], names: [], links: [] };
  };

  const prevSelectedRoleTaskFromPanel = typeof selectedRoleTaskFromPanel === 'function' ? selectedRoleTaskFromPanel : null;
  selectedRoleTaskFromPanel = function(panel, role){
    const task = prevSelectedRoleTaskFromPanel ? prevSelectedRoleTaskFromPanel(panel, role) : null;
    if(task && safeRole(role || '') === 'shooting'){
      const linked = readShootingLinks(panel);
      task.dependencyLinks = linked.links;
      task.dependsOnContentUserIds = linked.ids;
      task.dependsOnContentUserNames = linked.names;
      task.upstreamUserIds = linked.ids;
      task.upstreamUserNames = linked.names;
      task.upstreamUserLabel = (linked.names || []).join('، ');
      task.contentWritingDeadlines = linked.links.flatMap(link => (link.contentWriterDeadlines || []).map(item => ({
        executorUserId: link.executorUserId,
        executorUserName: link.executorUserName,
        contentUserId: item.contentUserId,
        contentUserName: item.contentUserName,
        deadline: item.deadline || ''
      })));
      task.contentWritingDeadline = uniq(task.contentWritingDeadlines.map(item => item.deadline).filter(Boolean)).join('، ');
    }
    return task;
  };

  document.addEventListener('change', function(event){
    const row = event.target.closest?.('.js-user-content-link-row');
    const block = event.target.closest?.('[data-assignment-role="shooting"]');
    if(!row || !block) return;
    if(event.target.classList.contains('js-content-writer-deadline')){
      const fakeInput = { value: event.target.dataset.writerId || '', dataset: { name: event.target.dataset.writerName || '' } };
      storePair(block, row, fakeInput, safeText(event.target.value || ''));
    }
    if(event.target.classList.contains('js-user-content-link-check')) setTimeout(() => enhanceBlock(block), 0);
  }, true);

  document.addEventListener('click', function(event){
    // v212: do not rebuild shooting rows while the native calendar is being opened/used.
    if(event.target?.matches?.('input[type="date"], .js-content-writer-deadline, .v209-linked-writer-deadline') || event.target?.closest?.('.content-writer-deadline-list,.v209-linked-writer-deadlines')) return;
    const panel = event.target.closest?.('.creative-assignment-panel');
    if(panel) setTimeout(() => enhancePanel(panel), 40);
  }, true);

  setTimeout(() => enhancePanel(document), 200);
})();


/* v202 - campaign goal in step 1 and visible in all task details */
(function(){
  function v202Goal(task){
    try{
      const campaign = (typeof campaignForTask === 'function' ? campaignForTask(task) : {}) || {};
      return normalizeText(campaign.campaign_goal || campaign.campaignGoal || task?.campaign_goal || task?.campaignGoal || '');
    }catch(e){ return ''; }
  }
  if(typeof buildTaskDetailHtml === 'function'){
    const previousBuildTaskDetailHtmlV202 = buildTaskDetailHtml;
    buildTaskDetailHtml = function(task){
      let html = previousBuildTaskDetailHtmlV202(task);
      const goal = v202Goal(task);
      if(goal && !html.includes('campaign-goal-box-v202')){
        const goalBox = `<div class="campaign-info-box campaign-goal-box-v202 wide"><span>هدف الحملة</span><strong>${escapeHtml(goal)}</strong></div>`;
        const oldGoalBoxPattern = /<div class="campaign-info-box"><span>هدف الحملة<\/span><strong>[\s\S]*?<\/strong><\/div>/;
        if(oldGoalBoxPattern.test(html)) html = html.replace(oldGoalBoxPattern, goalBox);
        else html = html.replace('<div class="campaign-info-compact">', `<div class="campaign-info-compact">${goalBox}`);
      }
      return html;
    };
  }
})();

/* v206 - show selected structure creatives and per-content-writer deadlines in step 2 */
(function(){
  const VERSION = '206';
  try{ window.MZJ_APP_VERSION = VERSION; }catch(_){ }
  const clean = value => (typeof normalizeText === 'function' ? normalizeText(value || '') : String(value || '').trim());
  const esc = value => (typeof escapeHtml === 'function' ? escapeHtml(value || '') : String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const uniq = list => (typeof uniqueList === 'function' ? uniqueList(list) : [...new Set((list || []).filter(Boolean))]);

  function selectedStructureCreatives(){
    const names = [];
    document.querySelectorAll('#creativeRows .creative-row-card').forEach(row => {
      if(typeof selectedCreativeNames === 'function') names.push(...selectedCreativeNames(row));
      row.querySelectorAll('.creative-assignment-panel').forEach(panel => names.push(clean(panel.dataset.creativeName || '')));
    });
    return uniq(names.map(clean).filter(Boolean));
  }

  function writerRowsFromRequest(){
    const assignees = typeof campaignRequestContentAssignees === 'function' ? campaignRequestContentAssignees() : { ids: [], names: [] };
    const rows = Math.max((assignees.ids || []).length, (assignees.names || []).length);
    return Array.from({ length: rows }, (_, i) => ({
      id: clean((assignees.ids || [])[i] || (assignees.names || [])[i] || ''),
      name: clean((assignees.names || [])[i] || (assignees.ids || [])[i] || '')
    })).filter(item => item.id || item.name);
  }

  function currentDeadlineValues(){
    const values = { byId: {}, byName: {} };
    document.querySelectorAll('.v206-content-writer-deadline').forEach(input => {
      const value = clean(input.value || '');
      const id = clean(input.dataset.writerId || '');
      const name = clean(input.dataset.writerName || '');
      if(id) values.byId[id] = value;
      if(name) values.byName[name] = value;
    });
    return values;
  }

  function ensureDeadlineBox(){
    const panel = document.querySelector('[data-campaign-wizard-step="2"]');
    if(!panel) return null;
    let box = panel.querySelector('#contentWriterDeadlinesStep2');
    if(box) return box;
    box = document.createElement('div');
    box.id = 'contentWriterDeadlinesStep2';
    box.className = 'content-writer-deadlines-step2';
    box.innerHTML = '<div class="empty-state mini-empty">اختار يوزرات كتابة المحتوى من الخطوة الأولى لعرض مواعيد التسليم.</div>';
    const toolbar = panel.querySelector('.section-toolbar');
    if(toolbar && toolbar.parentNode) toolbar.insertAdjacentElement('afterend', box);
    else panel.insertBefore(box, panel.firstChild);
    return box;
  }

  function renderDeadlineBox(){
    const box = ensureDeadlineBox();
    if(!box) return;
    const writers = writerRowsFromRequest();
    const previous = currentDeadlineValues();
    const fallbackDate = clean(document.querySelector('#campaignRequestForm [name="structure_deadline"]')?.value || '');
    const creatives = selectedStructureCreatives();
    const creativeHtml = creatives.length
      ? `<div class="v206-selected-creatives"><span>الكريتيف المطلوب للهيكل</span><strong>${esc(creatives.join('، '))}</strong></div>`
      : `<div class="v206-selected-creatives muted"><span>الكريتيف المطلوب للهيكل</span><strong>اختار كريتيف واحد أو أكثر من زر اختيار الكريتيفات واليوزرات</strong></div>`;
    if(!writers.length){
      box.innerHTML = `${creativeHtml}<div class="empty-state mini-empty">اختار يوزرات كتابة المحتوى من الخطوة الأولى عشان تظهر مواعيد تسليم كتابة المحتوى لكل كاتب.</div>`;
      return;
    }
    const rowsHtml = writers.map(writer => {
      const value = previous.byId[writer.id] || previous.byName[writer.name] || fallbackDate || '';
      return `<label class="v206-writer-deadline-row"><span>${esc(writer.name || writer.id)}</span><input class="v206-content-writer-deadline" type="date" value="${esc(value)}" data-writer-id="${esc(writer.id)}" data-writer-name="${esc(writer.name)}"></label>`;
    }).join('');
    box.innerHTML = `${creativeHtml}<div class="v206-deadline-head"><strong>مواعيد تسليم كتابة المحتوى لكل كاتب</strong><small>كل كاتب محتوى له موعد مستقل، والموعد هيتحفظ في التاسك بتاعه.</small></div><div class="v206-deadline-grid">${rowsHtml}</div>`;
  }

  function deadlinePayload(){
    const list = [];
    const byId = {};
    const byName = {};
    document.querySelectorAll('.v206-content-writer-deadline').forEach(input => {
      const id = clean(input.dataset.writerId || '');
      const name = clean(input.dataset.writerName || '');
      const deadline = clean(input.value || '');
      if(!id && !name) return;
      const item = { writerId: id, contentUserId: id, writerName: name, contentUserName: name, deadline, contentWritingDeadline: deadline, contentWriterDeadline: deadline };
      list.push(item);
      if(id) byId[id] = deadline;
      if(name) byName[name] = deadline;
    });
    return { list, byId, byName };
  }

  function dateForUserFromPayload(payload, userId, userName){
    const id = clean(userId || '');
    const name = clean(userName || '');
    if(id && payload.byId[id] !== undefined) return payload.byId[id] || '';
    if(name && payload.byName[name] !== undefined) return payload.byName[name] || '';
    return '';
  }

  const previousCampaignWizardSetStepV206 = typeof campaignWizardSetStep === 'function' ? campaignWizardSetStep : null;
  if(previousCampaignWizardSetStepV206){
    campaignWizardSetStep = function(step){
      const result = previousCampaignWizardSetStepV206(step);
      if(String(step || '') === '2') setTimeout(renderDeadlineBox, 80);
      return result;
    };
  }

  const previousOpenCreativeAssignmentPopupV206 = typeof openCreativeAssignmentPopup === 'function' ? openCreativeAssignmentPopup : null;
  if(previousOpenCreativeAssignmentPopupV206){
    openCreativeAssignmentPopup = function(row){
      const result = previousOpenCreativeAssignmentPopupV206(row);
      setTimeout(renderDeadlineBox, 120);
      return result;
    };
  }

  const previousSaveCreativeAssignmentPopupV206 = typeof saveCreativeAssignmentPopup === 'function' ? saveCreativeAssignmentPopup : null;
  if(previousSaveCreativeAssignmentPopupV206){
    saveCreativeAssignmentPopup = function(){
      const result = previousSaveCreativeAssignmentPopupV206();
      setTimeout(renderDeadlineBox, 80);
      return result;
    };
  }

  const previousRefreshCreativeAssignmentPanelsV206 = typeof refreshCreativeAssignmentPanels === 'function' ? refreshCreativeAssignmentPanels : null;
  if(previousRefreshCreativeAssignmentPanelsV206){
    refreshCreativeAssignmentPanels = function(row){
      const result = previousRefreshCreativeAssignmentPanelsV206(row);
      setTimeout(renderDeadlineBox, 60);
      return result;
    };
  }

  const previousCollectCampaignRowsV206 = typeof collectCampaignRows === 'function' ? collectCampaignRows : null;
  if(previousCollectCampaignRowsV206){
    collectCampaignRows = function(){
      renderDeadlineBox();
      const rows = previousCollectCampaignRowsV206.apply(this, arguments) || [];
      const deadlines = deadlinePayload();
      const requiredCreatives = selectedStructureCreatives();
      rows.forEach(row => {
        (row.tasks || []).forEach(task => {
          const role = clean(task.departmentRole || task.contentSectionName || '').toLowerCase();
          const isContentTask = role === 'content' || task.needsStructureUpload || task.structureRequestTask;
          if(!isContentTask) return;
          task.contentWriterDeadlines = deadlines.list;
          task.contentWritingDeadlines = deadlines.list;
          task.contentWriterDeadlinesById = deadlines.byId;
          task.contentWriterDeadlinesByName = deadlines.byName;
          task.writerDeadlineMode = 'per_content_writer';
          if(requiredCreatives.length){
            task.creativeBundleNames = requiredCreatives;
            task.structureRequiredCreatives = requiredCreatives;
            task.structureCreativeLabel = requiredCreatives.join('، ');
          }
        });
      });
      return rows;
    };
  }

  const previousBuildCampaignTaskDocsV206 = typeof buildCampaignTaskDocs === 'function' ? buildCampaignTaskDocs : null;
  if(previousBuildCampaignTaskDocsV206){
    buildCampaignTaskDocs = function(campaignId, payload){
      const docs = previousBuildCampaignTaskDocsV206.apply(this, arguments) || [];
      const deadlines = deadlinePayload();
      const requiredCreatives = uniq((payload?.creatives || []).flatMap(row => {
        const fromTasks = (row.tasks || []).flatMap(task => task.structureRequiredCreatives || task.creativeBundleNames || []);
        return [row.creative, ...fromTasks].map(clean).filter(Boolean);
      }));
      docs.forEach(doc => {
        const isStructure = !!doc.needsStructureUpload || clean(doc.departmentRole || '') === 'content' || clean(doc.sourceRequestStep || '') === 'campaign_request_data';
        if(!isStructure) return;
        const perUserDate = dateForUserFromPayload(deadlines, doc.userId || doc.assignedToId || doc.assigneeUid, doc.userName || doc.assignedToName || doc.assigneeName);
        if(perUserDate){
          doc.requiredDate = perUserDate;
          doc.dueDate = perUserDate;
          doc.structureDeadline = perUserDate;
          doc.contentWritingDeadline = perUserDate;
          doc.contentWriterDeadline = perUserDate;
          doc.contentTaskDeadline = perUserDate;
        }
        if(requiredCreatives.length){
          doc.creativeBundleNames = requiredCreatives;
          doc.structureRequiredCreatives = requiredCreatives;
          doc.structureCreativeLabel = requiredCreatives.join('، ');
          if(doc.needsStructureUpload) doc.creative = requiredCreatives.join('، ');
        }
      });
      return docs;
    };
  }

  if(typeof buildTaskDetailHtml === 'function'){
    const previousBuildTaskDetailHtmlV206 = buildTaskDetailHtml;
    buildTaskDetailHtml = function(task){
      let html = previousBuildTaskDetailHtmlV206(task);
      const isStructure = !!task?.needsStructureUpload || clean(task?.departmentRole || '') === 'content' || clean(task?.sourceRequestStep || '') === 'campaign_request_data';
      const creativeList = uniq([...(Array.isArray(task?.structureRequiredCreatives) ? task.structureRequiredCreatives : []), ...(Array.isArray(task?.creativeBundleNames) ? task.creativeBundleNames : []), task?.structureCreativeLabel, task?.creative].flatMap(item => Array.isArray(item) ? item : String(item || '').split('،')).map(clean).filter(Boolean));
      const deadline = clean(task?.contentWritingDeadline || task?.contentWriterDeadline || task?.contentTaskDeadline || task?.structureDeadline || task?.requiredDate || task?.dueDate || '');
      const boxes = [];
      if(isStructure && creativeList.length) boxes.push(`<div class="campaign-info-box wide v206-structure-creatives-box"><span>الكريتيف المطلوب للهيكل</span><strong>${esc(creativeList.join('، '))}</strong></div>`);
      if(isStructure && deadline) boxes.push(`<div class="campaign-info-box v206-content-deadline-box"><span>موعد تسليم كتابة المحتوى</span><strong>${esc(typeof formatDateShort === 'function' ? formatDateShort(deadline) : deadline)}</strong></div>`);
      if(boxes.length && !html.includes('v206-structure-creatives-box')){
        if(html.includes('<div class="campaign-info-compact">')) html = html.replace('<div class="campaign-info-compact">', `<div class="campaign-info-compact">${boxes.join('')}`);
        else html = boxes.join('') + html;
      }
      return html;
    };
  }

  document.addEventListener('change', function(event){
    if(event.target.closest('#campaignRequestForm .js-request-content-writers') || event.target.matches('#campaignRequestForm [name="structure_deadline"]') || event.target.matches('.js-creative-check') || event.target.matches('.js-popup-creative-check')){
      setTimeout(renderDeadlineBox, 60);
    }
    if(event.target.matches('.v206-content-writer-deadline')){
      event.target.setAttribute('value', event.target.value || '');
    }
  }, true);
  document.addEventListener('click', function(event){
    if(event.target.closest('[data-campaign-wizard-next], [data-campaign-wizard-target], [data-save-creative-assignment-popup], .open-creative-assignment-popup')) setTimeout(renderDeadlineBox, 120);
  }, true);
  setTimeout(renderDeadlineBox, 300);
})();

/* v207 - force visible content-writer deadlines in step 2 after selecting structure creatives */
(function(){
  const VERSION = '207';
  try{ window.MZJ_APP_VERSION = VERSION; }catch(_){ }
  const clean = v => (typeof normalizeText === 'function' ? normalizeText(v || '') : String(v || '').trim());
  const esc = v => (typeof escapeHtml === 'function' ? escapeHtml(v || '') : String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const uniq = list => (typeof uniqueList === 'function' ? uniqueList(list) : Array.from(new Set((list || []).map(clean).filter(Boolean))));
  const splitNames = text => clean(text).split(/[،,|]+/).map(clean).filter(Boolean).filter(x => !/^اختيار/.test(x));

  function ensureStyle(){
    if(document.getElementById('v207StructureDeadlineStyle')) return;
    const style = document.createElement('style');
    style.id = 'v207StructureDeadlineStyle';
    style.textContent = `
      .content-writer-deadlines-step2,.v207-row-deadline-box{display:block!important;margin:10px 0 12px!important;padding:10px!important;border:1px dashed rgba(121,67,52,.28)!important;border-radius:14px!important;background:#fff9f5!important;color:#4b2b24!important;box-sizing:border-box!important;clear:both!important;position:relative!important;z-index:3!important}
      .v207-row-deadline-box{margin:8px 0!important;background:#fff!important;border-style:solid!important}
      .v207-selected-creatives,.v206-selected-creatives{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:7px 9px!important;border:1px solid rgba(121,67,52,.18)!important;border-radius:11px!important;background:#fff!important;margin-bottom:8px!important;font-size:11.5px!important;font-weight:900!important;line-height:1.4!important}
      .v207-selected-creatives span,.v206-selected-creatives span{color:#8a4f3f!important;white-space:nowrap!important}
      .v207-selected-creatives strong,.v206-selected-creatives strong{color:#3d241e!important;text-align:left!important;direction:rtl!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .v207-selected-creatives.muted strong,.v206-selected-creatives.muted strong{color:#9b7b71!important;font-weight:800!important}
      .v207-deadline-head,.v206-deadline-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin:0 0 7px!important;color:#6b3b2f!important}
      .v207-deadline-head strong,.v206-deadline-head strong{font-size:12px!important;font-weight:950!important}
      .v207-deadline-head small,.v206-deadline-head small{font-size:10.5px!important;color:#8f6d63!important;font-weight:800!important}
      .v207-deadline-grid,.v206-deadline-grid{display:grid!important;grid-template-columns:repeat(2,minmax(170px,1fr))!important;gap:7px!important;margin:0!important;max-height:150px!important;overflow:auto!important;padding:2px!important;box-sizing:border-box!important}
      .v207-writer-deadline-row,.v206-writer-deadline-row{display:grid!important;grid-template-columns:minmax(70px,1fr) 132px!important;align-items:center!important;gap:7px!important;margin:0!important;padding:7px!important;border:1px solid rgba(121,67,52,.16)!important;border-radius:10px!important;background:#fff!important;box-sizing:border-box!important;min-width:0!important}
      .v207-writer-deadline-row span,.v206-writer-deadline-row span{font-size:11.5px!important;font-weight:900!important;color:#4b2b24!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;min-width:0!important}
      .v207-writer-deadline-row input,.v206-writer-deadline-row input{width:132px!important;max-width:132px!important;height:30px!important;min-height:30px!important;padding:2px 6px!important;border:1px solid rgba(121,67,52,.28)!important;border-radius:8px!important;background:#fff!important;color:#2d1b16!important;font-size:11px!important;font-weight:800!important;font-family:inherit!important;box-sizing:border-box!important}
      .v207-panel-writer-deadlines{display:block!important;margin:8px 0!important;padding:8px!important;border:1px solid rgba(121,67,52,.18)!important;border-radius:12px!important;background:#fffaf7!important;clear:both!important}
      .v207-panel-writer-deadlines .v207-deadline-grid{grid-template-columns:1fr!important;max-height:120px!important}
      .v207-panel-writer-deadlines .v207-writer-deadline-row{grid-template-columns:minmax(65px,1fr) 126px!important;padding:6px!important}
      .v207-panel-writer-deadlines .v207-writer-deadline-row input{width:126px!important;max-width:126px!important;height:28px!important;min-height:28px!important}
      @media(max-width:820px){.v207-deadline-grid,.v206-deadline-grid{grid-template-columns:1fr!important}.v207-deadline-head,.v206-deadline-head{display:block!important}.v207-writer-deadline-row,.v206-writer-deadline-row{grid-template-columns:minmax(65px,1fr) 122px!important}.v207-writer-deadline-row input,.v206-writer-deadline-row input{width:122px!important;max-width:122px!important}}
    `;
    document.head.appendChild(style);
  }

  function requestWriters(){
    const picker = document.querySelector('#campaignRequestForm .js-request-content-writers');
    if(!picker) return [];
    let ids = [];
    let names = [];
    try{ if(typeof selectedOptionValues === 'function') ids = ids.concat(selectedOptionValues(picker)); }catch(_){ }
    try{ if(typeof selectedOptionTexts === 'function') names = names.concat(selectedOptionTexts(picker)); }catch(_){ }
    try{ if(typeof storedMultiValues === 'function'){ ids = ids.concat(storedMultiValues(picker, 'selectedIds')); names = names.concat(storedMultiValues(picker, 'selectedNames')); } }catch(_){ }
    ids = ids.concat([...picker.querySelectorAll('input[type="checkbox"]:checked')].map(input => clean(input.value)));
    names = names.concat([...picker.querySelectorAll('input[type="checkbox"]:checked')].map(input => clean(input.dataset.name || input.closest('label')?.textContent || '')));
    names = names.concat(splitNames(picker.querySelector('.multi-toggle')?.textContent || ''));
    ids = uniq(ids);
    names = uniq(names);
    const max = Math.max(ids.length, names.length);
    return Array.from({length:max}, (_, i) => ({ id: ids[i] || names[i] || '', name: names[i] || ids[i] || '' })).filter(x => x.id || x.name);
  }

  function selectedCreatives(){
    const out = [];
    document.querySelectorAll('#creativeRows .creative-row-card').forEach(row => {
      try{ if(typeof selectedCreativeNames === 'function') out.push(...selectedCreativeNames(row)); }catch(_){ }
      row.querySelectorAll('.js-creative-check:checked,.js-popup-creative-check:checked').forEach(input => out.push(clean(input.value || input.dataset.name || '')));
      row.querySelectorAll('.creative-assignment-panel').forEach(panel => out.push(clean(panel.dataset.creativeName || panel.querySelector('.creative-assignment-title strong')?.textContent || '')));
    });
    return uniq(out);
  }

  function existingValues(){
    const byId = {}, byName = {};
    document.querySelectorAll('.v206-content-writer-deadline,.v207-content-writer-deadline').forEach(input => {
      const val = clean(input.value || input.getAttribute('value') || '');
      const id = clean(input.dataset.writerId || '');
      const name = clean(input.dataset.writerName || '');
      if(id && val) byId[id] = val;
      if(name && val) byName[name] = val;
    });
    return {byId, byName};
  }

  function creativeHtml(){
    const creatives = selectedCreatives();
    return creatives.length
      ? `<div class="v207-selected-creatives"><span>الكريتيف المطلوب للهيكل</span><strong>${esc(creatives.join('، '))}</strong></div>`
      : `<div class="v207-selected-creatives muted"><span>الكريتيف المطلوب للهيكل</span><strong>اختار كريتيف واحد أو أكثر</strong></div>`;
  }

  function deadlineGridHtml(compact){
    const writers = requestWriters();
    const previous = existingValues();
    const fallback = clean(document.querySelector('#campaignRequestForm [name="structure_deadline"]')?.value || '');
    if(!writers.length) return `<div class="empty-state mini-empty">اختار يوزرات كتابة المحتوى من الخطوة الأولى عشان تظهر مواعيد تسليم كتابة المحتوى لكل كاتب.</div>`;
    const rows = writers.map(writer => {
      const value = previous.byId[writer.id] || previous.byName[writer.name] || fallback || '';
      return `<label class="v207-writer-deadline-row"><span>${esc(writer.name || writer.id)}</span><input class="v206-content-writer-deadline v207-content-writer-deadline" type="date" value="${esc(value)}" data-writer-id="${esc(writer.id)}" data-writer-name="${esc(writer.name)}"></label>`;
    }).join('');
    return `<div class="v207-deadline-head"><strong>مواعيد تسليم كتابة المحتوى لكل كاتب</strong>${compact ? '' : '<small>كل كاتب محتوى له موعد مستقل</small>'}</div><div class="v207-deadline-grid">${rows}</div>`;
  }

  function ensureTopBox(){
    const panel = document.querySelector('[data-campaign-wizard-step="2"]');
    if(!panel) return null;
    let box = panel.querySelector('#contentWriterDeadlinesStep2');
    if(!box){
      box = document.createElement('div');
      box.id = 'contentWriterDeadlinesStep2';
      box.className = 'content-writer-deadlines-step2';
      const creativeRows = panel.querySelector('#creativeRows');
      if(creativeRows) creativeRows.insertAdjacentElement('beforebegin', box);
      else panel.appendChild(box);
    }
    return box;
  }

  function renderPanelBoxes(){
    document.querySelectorAll('#creativeRows .creative-assignment-panel').forEach(panel => {
      let box = panel.querySelector('.v207-panel-writer-deadlines');
      if(!box){
        box = document.createElement('div');
        box.className = 'v207-panel-writer-deadlines';
        const after = panel.querySelector('.assignment-users-grid, .creative-assignment-fields, .section-users-grid') || panel.firstElementChild;
        if(after && after.parentNode === panel) after.insertAdjacentElement('afterend', box); else panel.appendChild(box);
      }
      box.innerHTML = creativeHtml() + deadlineGridHtml(true);
    });
  }

  function renderV207Deadlines(){
    ensureStyle();
    const top = ensureTopBox();
    if(top) top.innerHTML = creativeHtml() + deadlineGridHtml(false);
    renderPanelBoxes();
  }

  function syncSameWriter(source){
    const id = clean(source.dataset.writerId || '');
    const name = clean(source.dataset.writerName || '');
    const value = source.value || '';
    document.querySelectorAll('.v206-content-writer-deadline,.v207-content-writer-deadline').forEach(input => {
      if(input === source) return;
      const sameId = id && clean(input.dataset.writerId || '') === id;
      const sameName = name && clean(input.dataset.writerName || '') === name;
      if(sameId || sameName){ input.value = value; input.setAttribute('value', value); }
    });
  }

  const oldStep = typeof campaignWizardSetStep === 'function' ? campaignWizardSetStep : null;
  if(oldStep){
    campaignWizardSetStep = function(step){ const result = oldStep.apply(this, arguments); if(String(step || '') === '2') setTimeout(renderV207Deadlines, 120); return result; };
  }
  const oldRefresh = typeof refreshCreativeAssignmentPanels === 'function' ? refreshCreativeAssignmentPanels : null;
  if(oldRefresh){ refreshCreativeAssignmentPanels = function(){ const result = oldRefresh.apply(this, arguments); setTimeout(renderV207Deadlines, 100); return result; }; }
  const oldSavePopup = typeof saveCreativeAssignmentPopup === 'function' ? saveCreativeAssignmentPopup : null;
  if(oldSavePopup){ saveCreativeAssignmentPopup = function(){ const result = oldSavePopup.apply(this, arguments); setTimeout(renderV207Deadlines, 120); return result; }; }

  document.addEventListener('change', function(event){
    if(event.target.matches('.v206-content-writer-deadline,.v207-content-writer-deadline')) syncSameWriter(event.target);
    if(event.target.closest('#campaignRequestForm .js-request-content-writers') || event.target.matches('#campaignRequestForm [name="structure_deadline"]') || event.target.matches('.js-creative-check,.js-popup-creative-check,.js-role-picker input[type="checkbox"]')) setTimeout(renderV207Deadlines, 90);
  }, true);
  document.addEventListener('click', function(event){
    if(event.target.closest('[data-campaign-wizard-next],[data-campaign-wizard-target],.open-creative-assignment-popup,[data-save-creative-assignment-popup],.multi-toggle,.js-role-picker')) setTimeout(renderV207Deadlines, 140);
  }, true);
  setTimeout(renderV207Deadlines, 500);
})();

/* v209 - content-writer deadlines for all execution sections */
(function(){
  const VERSION = '209';
  try{ window.MZJ_APP_VERSION = VERSION; }catch(_){ }
  const clean = value => (typeof normalizeText === 'function' ? normalizeText(value || '') : String(value || '').trim());
  const esc = value => (typeof escapeHtml === 'function' ? escapeHtml(value || '') : String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const uniq = list => (typeof uniqueList === 'function' ? uniqueList(list) : Array.from(new Set((list || []).filter(Boolean))));
  const safeRole = value => (typeof normalizeDepartmentRole === 'function' ? normalizeDepartmentRole(value || '') : clean(value));
  const rCode = role => (typeof roleCode === 'function' ? roleCode(role) : role);
  const roleLabel = role => (typeof defaultRoleSectionName === 'function' ? defaultRoleSectionName(role) : ({design:'قسم التصميم',shooting:'قسم التصوير',montage:'قسم المونتاج',publish:'قسم النشر'}[role] || 'القسم'));
  const EXEC_ROLES = ['design','shooting','montage','publish'];
  const store = window.__MZJ_V209_WRITER_DEADLINES__ || (window.__MZJ_V209_WRITER_DEADLINES__ = {});

  function keyPart(value){ return clean(value).replace(/\s+/g, ' ').toLowerCase(); }
  function rowKey(block, row, writerId, writerName){
    const role = safeRole(block?.dataset?.assignmentRole || '');
    const creative = keyPart(block?.closest?.('.creative-assignment-panel')?.dataset?.creativeName || '');
    const exec = keyPart(row?.dataset?.execId || row?.dataset?.execName || '');
    const writer = keyPart(writerId || writerName || '');
    return [creative, role, exec, writer].join('::');
  }
  function setValue(block, row, writerId, writerName, value){
    const key = rowKey(block, row, writerId, writerName);
    if(!key || key.endsWith('::')) return;
    if(value) store[key] = value; else delete store[key];
    try{ window.__MZJ_V209_WRITER_DEADLINES__ = store; }catch(_){ }
  }
  function getValue(block, row, writerId, writerName){
    // v213: keep dates independent per creative + section + executor + writer.
    // Do not inherit the date from the global writer deadline block or from
    // another section, because that made dates chosen in التصميم appear
    // automatically in التصوير / المونتاج.
    const key = rowKey(block, row, writerId, writerName);
    return store[key] || '';
  }

  function ensureStyle(){
    if(document.getElementById('v209AllSectionWriterDeadlinesStyle')) return;
    const style = document.createElement('style');
    style.id = 'v209AllSectionWriterDeadlinesStyle';
    style.textContent = `
      .content-writer-deadline-list.js-content-writer-deadline-list{display:none!important}
      .v209-linked-writer-deadlines{display:grid!important;gap:6px!important;margin-top:7px!important;padding:8px!important;border:1px dashed rgba(120,70,50,.22)!important;border-radius:10px!important;background:rgba(255,248,244,.75)!important;max-height:165px!important;overflow:auto!important;grid-column:1 / -1!important}
      .v209-linked-writer-deadlines.is-hidden{display:none!important}
      .v209-linked-writer-deadlines-title{font-size:11px!important;font-weight:900!important;color:#6b3b2f!important;line-height:1.2!important;margin-bottom:2px!important}
      .v209-linked-writer-deadline-row{display:grid!important;grid-template-columns:minmax(90px,1fr) 122px!important;gap:6px!important;align-items:center!important;margin:0!important}
      .v209-linked-writer-deadline-row span{font-size:11px!important;font-weight:800!important;color:#3f241e!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .v209-linked-writer-deadline-row input{width:122px!important;max-width:122px!important;height:28px!important;min-height:28px!important;border:1px solid rgba(120,70,50,.25)!important;border-radius:8px!important;background:#fff!important;color:#2d1b16!important;font-size:11px!important;font-weight:800!important;padding:2px 6px!important;box-sizing:border-box!important}
      @media(max-width:720px){.v209-linked-writer-deadline-row{grid-template-columns:1fr!important}.v209-linked-writer-deadline-row input{width:100%!important;max-width:100%!important}}
    `;
    document.head.appendChild(style);
  }

  function enhanceBlock(block){
    if(!block) return;
    const role = safeRole(block.dataset.assignmentRole || '');
    if(!EXEC_ROLES.includes(role)) return;
    ensureStyle();
    block.querySelectorAll('.js-user-content-link-row').forEach(row => {
      row.querySelectorAll('.content-writing-deadline-wrap,.js-content-writing-deadline-wrap,.content-writer-deadline-list.js-content-writer-deadline-list').forEach(el => { el.style.display = 'none'; });
      let box = row.querySelector('.v209-linked-writer-deadlines');
      if(!box){
        box = document.createElement('div');
        box.className = 'v209-linked-writer-deadlines is-hidden';
        row.appendChild(box);
      }
      const checks = [...row.querySelectorAll('.js-user-content-link-check:checked')];
      if(!checks.length){
        box.classList.add('is-hidden');
        box.innerHTML = '';
        return;
      }
      box.classList.remove('is-hidden');
      box.innerHTML = `<div class="v209-linked-writer-deadlines-title">مواعيد تسليم كتابة المحتوى لكل كاتب</div>${checks.map(input => {
        const writerId = clean(input.value || '');
        const writerName = clean(input.dataset.name || input.parentElement?.textContent || 'كاتب محتوى');
        const value = getValue(block, row, writerId, writerName);
        if(value) setValue(block, row, writerId, writerName, value);
        return `<label class="v209-linked-writer-deadline-row"><span>${esc(writerName || writerId || 'كاتب محتوى')}</span><input type="date" class="v209-linked-writer-deadline" data-writer-id="${esc(writerId)}" data-writer-name="${esc(writerName)}" value="${esc(value)}"></label>`;
      }).join('')}`;
    });
  }
  function enhancePanel(panel){
    const root = panel || document;
    root.querySelectorAll('[data-assignment-role]').forEach(enhanceBlock);
  }
  function blockFor(panel, role){
    const cleanRole = safeRole(role || '');
    return panel?.querySelector(`[data-assignment-role="${cleanRole}"]`) || null;
  }
  function readLinks(panel, role){
    const cleanRole = safeRole(role || '');
    if(!EXEC_ROLES.includes(cleanRole)) return { ids: [], names: [], links: [] };
    const block = blockFor(panel, cleanRole);
    if(!block) return { ids: [], names: [], links: [] };
    enhanceBlock(block);
    const links = [...block.querySelectorAll('.js-user-content-link-row')].map(row => {
      const checks = [...row.querySelectorAll('.js-user-content-link-check:checked')];
      const perWriter = checks.map(input => {
        const writerId = clean(input.value || '');
        const writerName = clean(input.dataset.name || input.parentElement?.textContent || '');
        const dateInput = [...row.querySelectorAll('.v209-linked-writer-deadline')].find(el => clean(el.dataset.writerId || '') === writerId || clean(el.dataset.writerName || '') === writerName);
        const deadline = clean(dateInput?.value || getValue(block, row, writerId, writerName) || '');
        if(deadline) setValue(block, row, writerId, writerName, deadline);
        return {
          contentUserId: writerId,
          contentUserName: writerName,
          writerId,
          writerName,
          deadline,
          contentWritingDeadline: deadline,
          contentWriterDeadline: deadline,
          contentTaskDeadline: deadline
        };
      });
      const deadlines = uniq(perWriter.map(item => item.deadline).filter(Boolean));
      return {
        executorUserId: clean(row.dataset.execId || ''),
        executorUserName: clean(row.dataset.execName || ''),
        userId: clean(row.dataset.execId || ''),
        userName: clean(row.dataset.execName || ''),
        role: cleanRole,
        departmentRole: cleanRole,
        departmentCode: rCode(cleanRole),
        departmentName: roleLabel(cleanRole),
        contentUserIds: perWriter.map(item => item.contentUserId).filter(Boolean),
        contentUserNames: perWriter.map(item => item.contentUserName).filter(Boolean),
        contentWriterDeadlines: perWriter,
        contentWritingDeadlines: perWriter,
        contentWritingDeadline: deadlines.join('، '),
        contentWriterDeadline: deadlines.join('، '),
        contentTaskDeadline: deadlines.join('، ')
      };
    }).filter(link => (link.executorUserId || link.executorUserName) && ((link.contentUserIds || []).length || (link.contentUserNames || []).length));
    return { ids: uniq(links.flatMap(link => link.contentUserIds || [])), names: uniq(links.flatMap(link => link.contentUserNames || [])), links };
  }

  const prevSync = typeof syncPanelDynamicState === 'function' ? syncPanelDynamicState : null;
  if(prevSync){ syncPanelDynamicState = function(panel){ const result = prevSync.apply(this, arguments); setTimeout(() => enhancePanel(panel), 0); return result; }; }

  const prevRefresh = typeof refreshContentDependencyPickers === 'function' ? refreshContentDependencyPickers : null;
  if(prevRefresh){ refreshContentDependencyPickers = function(panel){ const result = prevRefresh.apply(this, arguments); setTimeout(() => enhancePanel(panel), 0); return result; }; }

  const prevSelectedContentDependency = typeof selectedContentDependency === 'function' ? selectedContentDependency : null;
  selectedContentDependency = function(panel, role){
    const cleanRole = safeRole(role || '');
    if(EXEC_ROLES.includes(cleanRole)) return readLinks(panel, cleanRole);
    return prevSelectedContentDependency ? prevSelectedContentDependency.apply(this, arguments) : { ids: [], names: [], links: [] };
  };

  const prevSelectedRoleTaskFromPanel = typeof selectedRoleTaskFromPanel === 'function' ? selectedRoleTaskFromPanel : null;
  selectedRoleTaskFromPanel = function(panel, role){
    const task = prevSelectedRoleTaskFromPanel ? prevSelectedRoleTaskFromPanel.apply(this, arguments) : null;
    const cleanRole = safeRole(role || '');
    if(task && EXEC_ROLES.includes(cleanRole)){
      const linked = readLinks(panel, cleanRole);
      task.dependencyLinks = linked.links;
      task.dependsOnContentUserIds = linked.ids;
      task.dependsOnContentUserNames = linked.names;
      task.upstreamUserIds = linked.ids;
      task.upstreamUserNames = linked.names;
      task.upstreamUserLabel = (linked.names || []).join('، ');
      task.contentWritingDeadlines = linked.links.flatMap(link => (link.contentWriterDeadlines || []).map(item => ({
        executorUserId: link.executorUserId,
        executorUserName: link.executorUserName,
        contentUserId: item.contentUserId,
        contentUserName: item.contentUserName,
        deadline: item.deadline || ''
      })));
      task.contentWritingDeadline = uniq(task.contentWritingDeadlines.map(item => item.deadline).filter(Boolean)).join('، ');
    }
    return task;
  };

  document.addEventListener('change', function(event){
    const row = event.target.closest?.('.js-user-content-link-row');
    const block = event.target.closest?.('[data-assignment-role]');
    if(!row || !block || !EXEC_ROLES.includes(safeRole(block.dataset.assignmentRole || ''))) return;
    if(event.target.classList.contains('v209-linked-writer-deadline')){
      setValue(block, row, event.target.dataset.writerId || '', event.target.dataset.writerName || '', clean(event.target.value || ''));
    }
    if(event.target.classList.contains('js-user-content-link-check')) setTimeout(() => enhanceBlock(block), 0);
  }, true);

  document.addEventListener('click', function(event){
    // v210: Do not re-render the assignment panel while the user is opening/using
    // a native date picker. Re-rendering the row replaces the input element and
    // makes the calendar popup disappear immediately.
    if(event.target?.matches?.('input[type="date"], .v209-linked-writer-deadline') || event.target?.closest?.('.v209-linked-writer-deadlines')) return;
    const panel = event.target.closest?.('.creative-assignment-panel') || document.querySelector('[data-campaign-wizard-step="2"]');
    setTimeout(() => enhancePanel(panel || document), 60);
  }, true);
  document.addEventListener('change', function(event){
    if(event.target.matches('.js-role-picker input[type="checkbox"],.js-creative-check,.js-popup-creative-check')) setTimeout(() => enhancePanel(document), 100);
  }, true);
  setTimeout(() => enhancePanel(document), 300);
})();

/* v211 - stable inline date selectors for linked writer deadlines */
if(false){(function(){
  function pad(n){ return String(n || '').padStart(2, '0'); }
  function parseDateValue(value){
    const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? { y: m[1], m: m[2], d: m[3] } : { y: '', m: '', d: '' };
  }
  function daysInMonth(y, m){
    const year = Number(y || new Date().getFullYear());
    const month = Number(m || 1);
    return new Date(year, month, 0).getDate();
  }
  function makeOptions(max, selected, label){
    let html = `<option value="">${label}</option>`;
    for(let i=1;i<=max;i++){
      const v = pad(i);
      html += `<option value="${v}"${v === selected ? ' selected' : ''}>${v}</option>`;
    }
    return html;
  }
  function makeYearOptions(selected){
    const now = new Date().getFullYear();
    let html = '<option value="">سنة</option>';
    for(let y=now-1; y<=now+5; y++){
      const v = String(y);
      html += `<option value="${v}"${v === selected ? ' selected' : ''}>${v}</option>`;
    }
    return html;
  }
  function ensureStyle(){
    if(document.getElementById('v211StableDateSelectStyle')) return;
    const style = document.createElement('style');
    style.id = 'v211StableDateSelectStyle';
    style.textContent = `
      .v209-linked-writer-deadline-row{grid-template-columns:minmax(90px,1fr) 210px!important;align-items:center!important}
      .v211-date-selects{width:210px!important;max-width:210px!important;display:grid!important;grid-template-columns:1fr 1fr 1.35fr!important;gap:4px!important;direction:ltr!important;position:relative!important;z-index:5!important}
      .v211-date-selects select{height:28px!important;min-height:28px!important;border:1px solid rgba(120,70,50,.25)!important;border-radius:8px!important;background:#fff!important;color:#2d1b16!important;font-size:10.5px!important;font-weight:800!important;padding:2px 4px!important;box-sizing:border-box!important;outline:none!important;cursor:pointer!important}
      .v211-date-selects select:focus{border-color:#8b4b3d!important;box-shadow:0 0 0 2px rgba(139,75,61,.10)!important}
      .v211-date-native-hidden{display:none!important}
      @media(max-width:720px){.v209-linked-writer-deadline-row{grid-template-columns:1fr!important}.v211-date-selects{width:100%!important;max-width:100%!important}}
    `;
    document.head.appendChild(style);
  }
  function convertInput(input){
    if(!input || input.dataset.v211Converted === '1') return;
    ensureStyle();
    const parts = parseDateValue(input.value || '');
    const wrap = document.createElement('div');
    wrap.className = 'v211-date-selects';
    wrap.innerHTML = `<select class="v211-day" aria-label="اليوم">${makeOptions(daysInMonth(parts.y, parts.m), parts.d, 'يوم')}</select><select class="v211-month" aria-label="الشهر">${makeOptions(12, parts.m, 'شهر')}</select><select class="v211-year" aria-label="السنة">${makeYearOptions(parts.y)}</select>`;
    input.classList.add('v211-date-native-hidden');
    input.type = 'hidden';
    input.dataset.v211Converted = '1';
    input.parentNode.insertBefore(wrap, input);
    const day = wrap.querySelector('.v211-day');
    const month = wrap.querySelector('.v211-month');
    const year = wrap.querySelector('.v211-year');
    function refreshDays(){
      const current = day.value;
      const max = daysInMonth(year.value, month.value);
      day.innerHTML = makeOptions(max, current && Number(current) <= max ? current : '', 'يوم');
    }
    function sync(){
      if(year.value && month.value && day.value){
        input.value = `${year.value}-${month.value}-${day.value}`;
      }else{
        input.value = '';
      }
      input.dispatchEvent(new Event('change', { bubbles:true }));
    }
    month.addEventListener('change', function(e){ e.stopPropagation(); refreshDays(); sync(); });
    year.addEventListener('change', function(e){ e.stopPropagation(); refreshDays(); sync(); });
    day.addEventListener('change', function(e){ e.stopPropagation(); sync(); });
    ['pointerdown','mousedown','mouseup','click','focusin'].forEach(type => {
      wrap.addEventListener(type, function(e){ e.stopPropagation(); }, true);
    });
  }
  function scan(root){
    (root || document).querySelectorAll?.('.v209-linked-writer-deadline:not([data-v211-converted="1"])')?.forEach(convertInput);
  }
  document.addEventListener('DOMContentLoaded', function(){ scan(document); });
  document.addEventListener('change', function(e){
    if(e.target?.classList?.contains('js-user-content-link-check') || e.target?.classList?.contains('js-creative-check') || e.target?.classList?.contains('js-popup-creative-check')){
      setTimeout(() => scan(document), 120);
    }
  }, true);
  document.addEventListener('click', function(){ setTimeout(() => scan(document), 120); }, true);
  const observer = new MutationObserver(function(mutations){
    for(const m of mutations){
      for(const node of m.addedNodes || []){
        if(node.nodeType === 1){
          if(node.matches?.('.v209-linked-writer-deadline')) convertInput(node);
          else scan(node);
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(() => scan(document), 300);
  setTimeout(() => scan(document), 1000);
})();}


/* v212 - restore native calendar picker and keep deadline rows stable */
(function(){
  function ensureStyle(){
    if(document.getElementById('v212NativeDatePickerStyle')) return;
    const style=document.createElement('style');
    style.id='v212NativeDatePickerStyle';
    style.textContent=`
      .v211-date-selects{display:none!important}
      .v211-date-native-hidden{display:block!important}
      .v209-linked-writer-deadline-row{grid-template-columns:minmax(90px,1fr) 132px!important;align-items:center!important}
      .v209-linked-writer-deadline-row input[type="date"],
      .content-writer-deadline-row input[type="date"]{display:block!important;width:132px!important;max-width:132px!important;height:30px!important;min-height:30px!important;border:1px solid rgba(120,70,50,.25)!important;border-radius:8px!important;background:#fff!important;color:#2d1b16!important;font-size:11px!important;font-weight:800!important;padding:2px 6px!important;box-sizing:border-box!important;position:relative!important;z-index:20!important;pointer-events:auto!important}
      @media(max-width:720px){.v209-linked-writer-deadline-row{grid-template-columns:1fr!important}.v209-linked-writer-deadline-row input[type="date"],.content-writer-deadline-row input[type="date"]{width:100%!important;max-width:100%!important}}
    `;
    document.head.appendChild(style);
  }
  function restoreNativeDateInputs(root){
    ensureStyle();
    (root || document).querySelectorAll?.('.v209-linked-writer-deadline,.js-content-writer-deadline').forEach(input => {
      if(input.tagName !== 'INPUT') return;
      input.type='date';
      input.classList.remove('v211-date-native-hidden');
      input.style.display='block';
      if(input.previousElementSibling?.classList?.contains('v211-date-selects')) input.previousElementSibling.remove();
    });
  }
  ['pointerdown','mousedown','mouseup','click','focusin','focus','keydown'].forEach(type => {
    document.addEventListener(type, function(event){
      if(event.target?.matches?.('.v209-linked-writer-deadline,.js-content-writer-deadline,input[type="date"]')){
        event.stopPropagation();
      }
    }, true);
  });
  document.addEventListener('change', function(event){
    if(event.target?.matches?.('.v209-linked-writer-deadline,.js-content-writer-deadline')){
      // Keep the row visible after selecting the date, but do not rebuild immediately.
      const input=event.target;
      input.setAttribute('value', input.value || '');
    }
  }, true);
  const observer=new MutationObserver(muts=>{
    for(const m of muts){ for(const node of m.addedNodes||[]){ if(node.nodeType===1) restoreNativeDateInputs(node); } }
  });
  try{ observer.observe(document.documentElement,{childList:true,subtree:true}); }catch(_){ }
  document.addEventListener('DOMContentLoaded',()=>restoreNativeDateInputs(document));
  setTimeout(()=>restoreNativeDateInputs(document),200);
  setTimeout(()=>restoreNativeDateInputs(document),800);
  setTimeout(()=>restoreNativeDateInputs(document),1600);
})();


/* v213 - isolate writer deadlines per section and compact creative chooser */
(function(){
  try{ window.MZJ_APP_VERSION = '213'; }catch(_){ }
  function ensureStyle(){
    if(document.getElementById('v213WriterDeadlineAndCreativeCompactStyle')) return;
    const style = document.createElement('style');
    style.id = 'v213WriterDeadlineAndCreativeCompactStyle';
    style.textContent = `
      /* Show only the per-execution-section deadline block. Hide older global/duplicate blocks. */
      .content-writer-deadlines-step2,
      .v207-panel-writer-deadlines,
      .content-writer-deadline-list.js-content-writer-deadline-list,
      .content-writing-deadline-wrap.js-content-writing-deadline-wrap{display:none!important}
      .v209-linked-writer-deadlines{display:grid!important;max-height:118px!important;overflow:auto!important;padding:7px!important;margin-top:6px!important;gap:5px!important}
      .v209-linked-writer-deadlines.is-hidden{display:none!important}
      .v209-linked-writer-deadlines-title{font-size:10.5px!important;margin:0!important;line-height:1.15!important}
      .v209-linked-writer-deadline-row{grid-template-columns:minmax(85px,1fr) 122px!important;gap:5px!important;min-height:28px!important}
      .v209-linked-writer-deadline-row input[type="date"]{height:27px!important;min-height:27px!important;width:122px!important;max-width:122px!important;font-size:10.5px!important;padding:1px 5px!important}
      .v209-linked-writer-deadline-row span{font-size:10.5px!important;line-height:1.15!important}
      /* Compact the creative picker area so the users/sections area gets more visible space. */
      .creative-assignment-popup-dialog{max-height:92vh!important}
      .creative-popup-checks{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(132px,1fr))!important;gap:5px!important;max-height:168px!important;overflow:auto!important;padding:5px!important}
      .popup-creative-check-card{min-height:30px!important;padding:5px 7px!important;border-radius:8px!important;gap:5px!important}
      .popup-creative-index{width:22px!important;height:22px!important;min-width:22px!important;font-size:10px!important;border-radius:7px!important}
      .popup-creative-text strong{font-size:9.8px!important;line-height:1.05!important;max-height:22px!important;overflow:hidden!important}
      .popup-creative-text small{font-size:8.8px!important;line-height:1!important;max-height:11px!important;overflow:hidden!important}
      .popup-creative-check-ui{width:18px!important;height:18px!important;min-width:18px!important;border-radius:6px!important;font-size:10px!important}
      .creative-popup-body,.creative-popup-panels{gap:8px!important}
      @media(max-width:720px){.creative-popup-checks{grid-template-columns:repeat(2,minmax(120px,1fr))!important;max-height:150px!important}.v209-linked-writer-deadline-row{grid-template-columns:1fr!important}.v209-linked-writer-deadline-row input[type="date"]{width:100%!important;max-width:100%!important}}
    `;
    document.head.appendChild(style);
  }
  function hideDuplicateDeadlineBlocks(root){
    ensureStyle();
    (root || document).querySelectorAll?.('.content-writer-deadlines-step2,.v207-panel-writer-deadlines,.content-writer-deadline-list.js-content-writer-deadline-list,.content-writing-deadline-wrap.js-content-writing-deadline-wrap').forEach(el => {
      el.style.setProperty('display','none','important');
    });
    (root || document).querySelectorAll?.('.v209-linked-writer-deadline').forEach(input => {
      if(input.tagName === 'INPUT'){
        input.type = 'date';
        input.classList.remove('v211-date-native-hidden');
        input.style.setProperty('display','block','important');
      }
    });
  }
  ['DOMContentLoaded','change','click','input'].forEach(type => {
    document.addEventListener(type, function(){ setTimeout(() => hideDuplicateDeadlineBlocks(document), type === 'DOMContentLoaded' ? 0 : 40); }, true);
  });
  const observer = new MutationObserver(function(mutations){
    for(const m of mutations){
      for(const node of m.addedNodes || []){
        if(node.nodeType === 1) hideDuplicateDeadlineBlocks(node);
      }
    }
  });
  try{ observer.observe(document.documentElement, { childList:true, subtree:true }); }catch(_){ }
  setTimeout(() => hideDuplicateDeadlineBlocks(document), 100);
  setTimeout(() => hideDuplicateDeadlineBlocks(document), 700);
})();
