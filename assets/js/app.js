
/* MZJ v517 early flow click guard */
(function(){
  if(window.__MZJ_V517_EARLY_FLOW_GUARD__) return;
  window.__MZJ_V517_EARLY_FLOW_GUARD__ = true;
  window.addEventListener('click', function(event){
    var target = event.target && event.target.closest ? event.target.closest('[data-structure-approve],[data-task-template-approve],[data-task-template-needs-changes],[data-task-template-reject]') : null;
    if(!target) return;
    if(target.dataset && target.dataset.structureApprove && typeof window.MZJ_v516_approveStructure === 'function'){
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      Promise.resolve(window.MZJ_v516_approveStructure(target.dataset.structureApprove || '')).catch(function(error){ console.error('v517 approve click failed', error); try{ if(typeof showToast === 'function') showToast((error && error.message) || 'تعذر اعتماد الهيكل.'); }catch(_){} });
      return;
    }
    if(target.dataset && (target.dataset.taskTemplateApprove || target.dataset.taskTemplateNeedsChanges || target.dataset.taskTemplateReject) && typeof window.MZJ_v516_decideTaskTemplate === 'function'){
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
      var id = target.dataset.taskTemplateApprove || target.dataset.taskTemplateNeedsChanges || target.dataset.taskTemplateReject || '';
      var decision = target.dataset.taskTemplateApprove ? 'approved' : (target.dataset.taskTemplateNeedsChanges ? 'needs_changes' : 'rejected');
      Promise.resolve(window.MZJ_v516_decideTaskTemplate(id, decision)).catch(function(error){ console.error('v517 template click failed', error); try{ if(typeof showToast === 'function') showToast((error && error.message) || 'تعذر تنفيذ الإجراء.'); }catch(_){} });
    }
  }, true);
})();

window.MZJ_PUBLISHING_JOBS_COLLECTION = "publishing_jobs";
window.MZJ_PUBLISH_AGENT_DEVICES_COLLECTION = "publish_agent_devices";
window.MZJ_PLATFORM_CONNECTIONS_COLLECTION = "platform_connections";

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
window.MZJ_CAMPAIGN_COUNTERS_COLLECTION = "marketing_campaign_counters";
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
window.MZJ_PACKAGES_COLLECTION = "marketing_car_packages";
window.MZJ_STOCK_META_COLLECTION = "marketing_stock_cars"; // مسار حفظ حالة تم التصوير

const routes = ['dashboard','reports','create-campaign','create-agenda','campaigns','packages','social-publisher','platform-settings','publish-prep','checklist-reel','tasks','calendar','receipt-calendar','stock','departments','local-publisher','settings'];
const pageAliases = {
  database: 'reports',
  report: 'reports',
  reports: 'reports',
  admin: 'settings',
  users: 'settings',
  permissions: 'settings',
  dashboard: 'dashboard',
  campaigns: 'campaigns',
  packages: 'packages',
  package: 'packages',
  package_management: 'packages',
  'package-management': 'packages',
  'إدارة-الباقات': 'packages',
  'الباقات': 'packages',
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
  'local-publisher': 'local-publisher',
  local_publisher: 'local-publisher',
  publishing_jobs: 'local-publisher',
  electron_publisher: 'local-publisher',
  'جدولة-النشر-المحلي': 'local-publisher',
  'checklist-reel': 'checklist-reel',
  checklist_reel: 'checklist-reel',
  car_reel_checklist: 'checklist-reel',
  'ريل-السيارات': 'checklist-reel',
  'create-campaign': 'create-campaign',
  'create-agenda': 'create-agenda',
  create_agenda: 'create-agenda',
  agenda: 'create-agenda',
  create_campaign: 'create-campaign',
  departments: 'departments',
  content: 'departments',
  calendar: 'calendar',
  'receipt-calendar': 'receipt-calendar',
  receipt_calendar: 'receipt-calendar',
  'تقويم-الاستلام': 'receipt-calendar',
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
let stockAuth = null;
let stockWorkflowAuthPromise = null;
let departments = [];
let users = [];
let creatives = [];
const MZJ_DEFAULT_CREATIVE_CATALOG = [
  // قسم المونتاج
  { name:'REEL - مواصفات كامله - STUDIO', code:'M-RL-SPEC-ST', departmentRole:'montage', departmentName:'قسم المونتاج', order:1 },
  { name:'REEL - اهم المواصفات - STUDIO', code:'M-RL-TOP-ST', departmentRole:'montage', departmentName:'قسم المونتاج', order:2 },
  { name:'REEL - SHORT/TREND - SHOWROOM', code:'M-RL-TRD-SR', departmentRole:'montage', departmentName:'قسم المونتاج', order:3 },
  { name:'REEL - UGC - SHOWROOM', code:'M-RL-UGC-SR', departmentRole:'montage', departmentName:'قسم المونتاج', order:4 },
  { name:'REEL - حملات - SHOWROOM', code:'M-RL-CMP-SR', departmentRole:'montage', departmentName:'قسم المونتاج', order:5 },
  { name:'REEL - معارضنا - SHOWROOM', code:'M-RL-SHOW-SR', departmentRole:'montage', departmentName:'قسم المونتاج', order:6 },
  { name:'REEL - تجربه عميل - SHOWROOM', code:'M-RL-CUST-SR', departmentRole:'montage', departmentName:'قسم المونتاج', order:7 },
  { name:'VIDEO - مواصفات - STUDIO', code:'M-VD-SPEC-ST', departmentRole:'montage', departmentName:'قسم المونتاج', order:8 },
  { name:'VIDEO - فيلم سياره - STUDIO', code:'M-VD-CAR-ST', departmentRole:'montage', departmentName:'قسم المونتاج', order:9 },
  { name:'VIDEO - فيلم - STUDIO', code:'M-VD-FILM-ST', departmentRole:'montage', departmentName:'قسم المونتاج', order:10 },
  { name:'VIDEO - مواصفات - SHOWROOM', code:'M-VD-SPEC-SR', departmentRole:'montage', departmentName:'قسم المونتاج', order:11 },
  { name:'VIDEO - فيلم - SHOWROOM', code:'M-VD-FILM-SR', departmentRole:'montage', departmentName:'قسم المونتاج', order:12 },
  { name:'VIDEO - معارضنا - SHOWROOM', code:'M-VD-SHOW-SR', departmentRole:'montage', departmentName:'قسم المونتاج', order:13 },

  // قسم التصميم
  { name:'POST', code:'D-POST', departmentRole:'design', departmentName:'قسم التصميم', order:1 },
  { name:'CAROUSEL', code:'D-CAROUSEL', departmentRole:'design', departmentName:'قسم التصميم', order:2 },
  { name:'PANNER', code:'D-PANNER', departmentRole:'design', departmentName:'قسم التصميم', order:3 },
  { name:'MOTION', code:'D-MOTION', departmentRole:'design', departmentName:'قسم التصميم', order:4 },
  { name:'GIF', code:'D-GIF', departmentRole:'design', departmentName:'قسم التصميم', order:5 },
  { name:'PRINT', code:'D-PRINT', departmentRole:'design', departmentName:'قسم التصميم', order:6 },
  { name:'MZJ-INTERIAL', code:'D-INTERIAL', departmentRole:'design', departmentName:'قسم التصميم', order:7 },
  { name:'STORY - جاهزة الان - STUDIO', code:'M-ST-READY-ST', departmentRole:'design', departmentName:'قسم التصميم', order:8 },
  { name:'STORY - سعرها اليوم - STUDIO', code:'M-ST-PRICE-ST', departmentRole:'design', departmentName:'قسم التصميم', order:9 },
  { name:'STORY - قسطها الان - STUDIO', code:'M-ST-INST-ST', departmentRole:'design', departmentName:'قسم التصميم', order:10 },
  { name:'STORY - معرضنا - SHOWROOM', code:'M-ST-SHOW-SR', departmentRole:'design', departmentName:'قسم التصميم', order:11 },
  { name:'STORY - جاهزة الان - SHOWROOM', code:'M-ST-READY-SR', departmentRole:'design', departmentName:'قسم التصميم', order:12 },
  { name:'STORY - سعرها اليوم - SHOWROOM', code:'M-ST-PRICE-SR', departmentRole:'design', departmentName:'قسم التصميم', order:13 },
  { name:'STORY - قسطها الان - SHOWROOM', code:'M-ST-INST-SR', departmentRole:'design', departmentName:'قسم التصميم', order:14 },

  // قسم التصوير
  { name:'تصوير صور السياره', code:'P-CAR-PHOTO', departmentRole:'shooting', departmentName:'قسم التصوير', order:1 },
  { name:'تصوير ريل - مواصفات - STUDIO', code:'P-RL-SPEC-ST', departmentRole:'shooting', departmentName:'قسم التصوير', order:2 },
  { name:'تصوير ريل - SHORT/TREND - SHOWROOM', code:'P-RL-TRD-SR', departmentRole:'shooting', departmentName:'قسم التصوير', order:3 },
  { name:'تصوير ريل - UGC - SHOWROOM', code:'P-RL-UGC-SR', departmentRole:'shooting', departmentName:'قسم التصوير', order:4 },
  { name:'تصوير ريل - معارضنا - SHOWROOM', code:'P-RL-SHOW-SR', departmentRole:'shooting', departmentName:'قسم التصوير', order:5 },
  { name:'تصوير ريل - تجربه عميل - SHOWROOM', code:'P-RL-CUST-SR', departmentRole:'shooting', departmentName:'قسم التصوير', order:6 },
  { name:'تصوير فيديو - مواصفات - STUDIO', code:'P-VD-SPEC-ST', departmentRole:'shooting', departmentName:'قسم التصوير', order:7 },
  { name:'تصوير فيديو - مواصفات - SHOWROOM', code:'P-VD-SPEC-SR', departmentRole:'shooting', departmentName:'قسم التصوير', order:8 },
  { name:'تصوير فيديو - معارضنا - SHOWROOM', code:'P-VD-SHOW-SR', departmentRole:'shooting', departmentName:'قسم التصوير', order:9 },
  { name:'تصوير ستوري - سياره - STUDIO', code:'P-ST-CAR-ST', departmentRole:'shooting', departmentName:'قسم التصوير', order:10 },
  { name:'تصوير ستوري - معرضنا - SHOWROOM', code:'P-ST-SHOW-SR', departmentRole:'shooting', departmentName:'قسم التصوير', order:11 }
];
window.MZJ_DEFAULT_CREATIVE_CATALOG = MZJ_DEFAULT_CREATIVE_CATALOG;
const MZJ_DEFAULT_CREATIVE_NAMES = MZJ_DEFAULT_CREATIVE_CATALOG.map(item => item.name);
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
let stockRequestBranches = [];
let stockPhotoRequests = [];
let stockPhotoRequestsUnsubscribe = null;
let systemSettings = {};
let activeTaskModalMeta = null;
let publishPrepSubmissionsCache = null;
let publishPrepFirestoreReady = false;
let publishPrepUnsubscribe = null;
let publishLogsCache = [];
let publishLogsUnsubscribe = null;
let platformConnectionsCache = {};
let platformConnectionsUnsubscribe = null;
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
  if(route === 'create-agenda' && typeof window.MZJAgendaRender === 'function') window.MZJAgendaRender();
  if(route === 'dashboard') renderAdminDashboard();
  if(route === 'calendar') renderCalendarPage();
  if(route === 'receipt-calendar' && typeof window.MZJRenderReceiptCalendarPage === 'function') window.MZJRenderReceiptCalendarPage();
  if(route === 'tasks') renderTasksPage();
  if(route === 'stock') renderStock();
  if(route === 'reports') renderDatabasePage();
  if(route === 'packages' && typeof window.renderPackagesPage === 'function') window.renderPackagesPage();
  if(route === 'social-publisher') renderSocialPublisherPage();
  if(route === 'platform-settings') renderPlatformSettingsPage();
  if(route === 'publish-prep') renderPublishPrepPage();
  if(route === 'checklist-reel') renderChecklistReelStudio();
  if(route === 'local-publisher'){ loadPublishingJobs?.(); renderLocalPublisherPage?.(); }
}

window.MZJGetAgendaCars = function(){
  let rows = [];
  try{
    if(typeof stockRowsWithMeta === 'function') rows = stockRowsWithMeta() || [];
  }catch(_){ rows = []; }
  try{
    if(!rows.length && typeof buildStockGroups === 'function') rows = buildStockGroups() || [];
  }catch(_){ }
  if(Array.isArray(rows) && rows.length){
    return rows.map(group => ({
      __agendaStockGroup: true,
      uniqueSpecKey: group.uniqueSpecKey || group.unique_spec_key || group['Unique Spec Key'] || group.specKey || group.spec_key || group.key || [group.carName, group.statement].filter(Boolean).join(' - '),
      exteriorColor: group.exteriorColor || group.externalColor || group['اللون الخارجي'] || group['لون خارجي'] || '',
      interiorColor: group.interiorColor || group.insideColor || group['اللون الداخلي'] || group['لون داخلي'] || '',
      carName: group.carName || group.name || group.title || '',
      statement: group.statement || group.carStatement || '',
      count: Number(group.count || (Array.isArray(group.cars) ? group.cars.length : 1) || 1)
    }));
  }
  return cars || [];
};

window.MZJGetAgendaContext = function(){
  return { db: mainDb, departments: departments || [], users: users || [], creatives: creatives || [], platforms: platforms || [], cars: window.MZJGetAgendaCars(), currentUser: getCurrentUserIdentity(), serverTime: serverTime };
};

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
    if(firebase.auth){
      try{
        stockAuth = firebase.auth(stockApp);
        try{ stockAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }catch(_){}
      }catch(authError){ console.error('Stock Firebase auth init error', authError); }
    }
  }catch(error){ console.error('Stock Firebase init error', error); }
}

function ensureStockWorkflowAuth(){
  if(!stockAuth) return Promise.resolve(null);
  if(stockAuth.currentUser) return Promise.resolve(stockAuth.currentUser);
  if(stockWorkflowAuthPromise) return stockWorkflowAuthPromise;
  stockWorkflowAuthPromise = stockAuth.signInAnonymously()
    .then(result => result && result.user ? result.user : stockAuth.currentUser)
    .catch(error => {
      console.error('Stock workflow anonymous auth error', error);
      throw error;
    })
    .finally(() => { stockWorkflowAuthPromise = null; });
  return stockWorkflowAuthPromise;
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
function resolveUserRecord(value){
  const source = (value && typeof value === 'object') ? value : { id: value, uid: value, email: String(value || '').includes('@') ? value : '' };
  const found = findUserByAnyIdentity([source, source.id, source.uid, source.email, source.emailLower, source.name, source.displayName, source.username]);
  const base = found || {};
  const id = base.id || base.uid || source.id || source.uid || source.email || source.emailLower || source.name || source.displayName || '';
  const email = base.email || source.email || (String(source.id || source.uid || '').includes('@') ? (source.id || source.uid) : '') || '';
  const name = userName(base) || source.displayName || source.name || source.username || source.label || email || id;
  return {
    ...source,
    ...base,
    id,
    uid: base.uid || source.uid || id,
    email,
    emailLower: base.emailLower || source.emailLower || String(email || '').toLowerCase(),
    name,
    displayName: base.displayName || source.displayName || name,
    username: base.username || source.username || ''
  };
}
function uniqueUsersByIdentity(list){
  const result = [];
  const seen = new Set();
  (list || []).forEach(item => {
    const user = resolveUserRecord(item);
    const keys = uniqueIdentityKeys([user, user.id, user.uid, user.email, user.emailLower, user.name, user.displayName, user.username]);
    const mainKey = keys[0] || identityClean(user.id || user.email || userName(user));
    if(!mainKey || keys.some(key => seen.has(key))) return;
    keys.forEach(key => seen.add(key));
    result.push(user);
  });
  return result;
}
function departmentMemberValues(dep){
  if(!dep) return [];
  return [
    ...(Array.isArray(dep.users) ? dep.users : []),
    ...(Array.isArray(dep.members) ? dep.members : []),
    ...(Array.isArray(dep.userIds) ? dep.userIds : []),
    ...(Array.isArray(dep.memberUids) ? dep.memberUids : []),
    ...(Array.isArray(dep.memberEmails) ? dep.memberEmails : []),
    ...(Array.isArray(dep.memberNames) ? dep.memberNames : [])
  ];
}
function usersForDepartment(dep){
  return uniqueUsersByIdentity(departmentMemberValues(dep));
}
function usersForRole(role){
  const dep = findDepartmentByRole(role);
  return usersForDepartment(dep);
}
function multiUserOptionsForRole(role, selectedIds = []){
  const selected = Array.isArray(selectedIds) ? selectedIds.map(String) : [];
  const list = usersForRole(role);
  const options = list.map(user => `<option value="${escapeHtml(user.id)}"${selected.includes(String(user.id)) ? ' selected' : ''}>${escapeHtml(userName(user))}</option>`).join('');
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
  const sectionUsers = usersForDepartment(section);
  if(sectionUsers.length) return sectionUsers;
  const departmentId = section?.departmentId || section?.department || section?.contentDepartmentId || '';
  if(departmentId){
    const dep = departments.find(item => item.id === departmentId || item.name === departmentId || item.slug === departmentId);
    const depUsers = usersForDepartment(dep);
    if(depUsers.length) return depUsers;
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
    }else if(el.tagName === 'TEXTAREA'){
      el.setAttribute('value', el.value || '');
      el.textContent = el.value || '';
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
  const seen = new Set();
  const uniquePlatforms = (Array.isArray(platforms) ? platforms : []).filter(item => {
    const name = normalizeText(item?.name || '');
    if(!name) return false;
    const key = normalizePublishPlatformName(name) || name.toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return '<option value="">اختر المنصة</option>' + uniquePlatforms.map(item => {
    const name = normalizeText(item.name || '');
    return `<option value="${escapeHtml(name)}"${selectedValue === name ? ' selected' : ''}>${escapeHtml(name)}</option>`;
  }).join('');
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


