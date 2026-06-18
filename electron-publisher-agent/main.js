const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const mammoth = require('mammoth');

const CONFIG_PATH = path.join(__dirname, 'publisher-config.json');
let firebaseCache = null;

function createWindow(){
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    title: 'MZJ Publisher Agent',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if(process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if(BrowserWindow.getAllWindows().length === 0) createWindow(); });

function normalizeArabicName(value){
  return String(value || '').trim().replace(/[إأآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase();
}
function isDirentName(dirent, expected){ return normalizeArabicName(dirent.name) === normalizeArabicName(expected); }
function safeId(value){ return String(value || '').replace(/[\/\.\#\$\[\]]/g, '_').replace(/\s+/g, '_').slice(0, 900); }
function hash(value){ return crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 12); }
function leadingNumber(value){
  const name = String(value?.name || value || '').trim();
  const match = name.match(/^\s*(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}
function naturalSort(list){
  return list.sort((a,b) => {
    const an = leadingNumber(a);
    const bn = leadingNumber(b);
    if(an !== bn) return an - bn;
    return String(a.name || a).localeCompare(String(b.name || b), 'ar', { numeric:true, sensitivity:'base' });
  });
}
function isImage(name){ return /\.(png|jpe?g|webp|gif)$/i.test(name); }
function isVideo(name){ return /\.(mp4|mov|m4v|webm)$/i.test(name); }
function isMedia(name){ return isImage(name) || isVideo(name); }
function isWord(name){ return /\.(docx|doc)$/i.test(name); }
async function existsDir(p){ try{ return (await fs.stat(p)).isDirectory(); }catch(_){ return false; } }
async function readDirSafe(p){ try{ return await fs.readdir(p, { withFileTypes:true }); }catch(_){ return []; } }
async function findChildDir(parent, expected){
  const list = await readDirSafe(parent);
  const item = list.find(d => d.isDirectory() && isDirentName(d, expected));
  return item ? path.join(parent, item.name) : null;
}
async function listMediaFiles(folder, filter){
  if(!folder || !(await existsDir(folder))) return [];
  const items = await readDirSafe(folder);
  return naturalSort(items.filter(d => d.isFile() && filter(d.name)).map(d => ({ name:d.name, path:path.join(folder, d.name) })));
}
async function readCaption(dayFolder){
  const captionFolder = await findChildDir(dayFolder, 'كابشن');
  if(!captionFolder) return { text:'', filePath:'', error:'لا يوجد فولدر كابشن' };
  const files = naturalSort((await readDirSafe(captionFolder)).filter(d => d.isFile() && isWord(d.name)));
  const preferred = files.find(f => normalizeArabicName(path.parse(f.name).name) === normalizeArabicName('كابشن')) || files[0];
  if(!preferred) return { text:'', filePath:'', error:'لا يوجد ملف Word داخل فولدر كابشن' };
  const filePath = path.join(captionFolder, preferred.name);
  if(/\.doc$/i.test(preferred.name)) return { text:'', filePath, error:'ملفات doc القديمة غير مدعومة حاليًا. استخدم docx.' };
  try{
    const result = await mammoth.extractRawText({ path:filePath });
    return { text:String(result.value || '').trim(), filePath, error:'' };
  }catch(error){
    return { text:'', filePath, error:error.message || String(error) };
  }
}
const LOCAL_PUBLISHER_PLATFORMS = ['facebook','instagram','tiktok','youtube','snapchat'];
const LOCAL_PUBLISHER_DEFAULT_TIMES = {
  facebook: { post:'12:00', reel:'18:00', story:'21:00' },
  instagram: { post:'13:00', reel:'19:00', story:'22:00' },
  tiktok: { post:'15:00', reel:'20:00', story:'22:30' },
  youtube: { post:'', reel:'18:30', story:'' },
  snapchat: { post:'', reel:'', story:'23:00' }
};
const STORY_PLATFORMS = ['facebook','instagram','tiktok','snapchat'];
const REEL_AS_STORY_PLATFORMS = ['facebook','instagram','tiktok'];
const STORY_VIDEO_AS_REEL_PLATFORMS = ['facebook','instagram','tiktok'];
function cleanTime(value){
  const v = String(value || '').trim();
  return /^\d{2}:\d{2}$/.test(v) ? v : '';
}
function addMinutesToTime(time, minutes){
  const safe = cleanTime(time) || '09:00';
  const [h,m] = safe.split(':').map(Number);
  const total = (h * 60 + m + Number(minutes || 0)) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
}
function normalizePlatformTimes(input){
  const out = JSON.parse(JSON.stringify(LOCAL_PUBLISHER_DEFAULT_TIMES));
  const saved = input || {};
  LOCAL_PUBLISHER_PLATFORMS.forEach(platform => {
    out[platform] = out[platform] || {};
    ['post','reel','story'].forEach(type => {
      const value = cleanTime(saved?.[platform]?.[type]);
      if(value) out[platform][type] = value;
    });
  });
  return out;
}
async function loadLocalPublisherPlatformTimes(){
  try{
    const { config, db, fsMod } = await getFirebase();
    const ref = fsMod.doc(db, config.systemSettingsCollection || 'system_settings', config.systemSettingsDoc || 'main');
    const snap = await fsMod.getDoc(ref);
    return normalizePlatformTimes(snap.exists() ? snap.data()?.localPublisherPlatformTimes : null);
  }catch(error){
    console.warn('Unable to load local publisher platform times; using defaults.', error.message || error);
    return normalizePlatformTimes(null);
  }
}

async function loadPlatformConnections(){
  try{
    const { config, db, fsMod } = await getFirebase();
    const collectionName = config.platformConnectionsCollection || 'platform_connections';
    const snap = await fsMod.getDocs(fsMod.collection(db, collectionName));
    const connections = {};
    snap.docs.forEach(docSnap => {
      const data = docSnap.data() || {};
      const key = String(data.platform || docSnap.id || '').toLowerCase();
      if(key) connections[key] = { id:docSnap.id, ...data };
    });
    return connections;
  }catch(error){
    console.warn('Unable to load platform connections.', error.message || error);
    return {};
  }
}
function redactConnectionForUi(conn){
  if(!conn) return null;
  return {
    platform: conn.platform || '',
    connected: !!(conn.connected || conn.status === 'connected'),
    status: conn.status || (conn.connected ? 'connected' : 'disconnected'),
    state: conn.state || '',
    accountName: conn.accountName || conn.pageName || conn.channelTitle || conn.username || conn.accountId || conn.pageId || '',
    hasToken: !!(conn.hasToken || conn.tokenStored || conn.accessToken || conn.refreshToken || conn.pageAccessToken),
    updatedAtIso: conn.updatedAtIso || conn.connectedAtIso || '',
    source: conn.source || ''
  };
}
function platformReady(connections, platform){
  const conn = connections && connections[platform];
  return !!(conn && (conn.connected || conn.status === 'connected') && (conn.hasToken || conn.tokenStored || conn.accessToken || conn.refreshToken || conn.pageAccessToken || platform === 'whatsapp'));
}
function timeForPlatform(platformTimes, platform, contentType, fallback){
  return cleanTime(platformTimes?.[platform]?.[contentType]) || cleanTime(fallback?.[platform]?.[contentType]) || cleanTime(fallback?.[contentType]) || cleanTime(LOCAL_PUBLISHER_DEFAULT_TIMES?.[platform]?.[contentType]) || '';
}
function makeJob({ agendaRoot, dayFolder, dateIso, time, contentType, title, files, caption, captionPath, platform, index, storyOrder }){
  const publishTime = cleanTime(time) || '09:00';
  const scheduledAtIso = `${dateIso}T${publishTime}:00`;
  const basis = [agendaRoot, dayFolder, platform || '', contentType, title, index || 0, files.map(f => f.path).join('|')].join('|');
  return {
    id: safeId(`local_${dateIso}_${platform || 'all'}_${contentType}_${index || 1}_${hash(basis)}`),
    source: 'electron-local-agent',
    agendaRoot,
    dayFolder,
    date: dateIso,
    publishDate: dateIso,
    publishTime,
    scheduledAtIso,
    contentType,
    title,
    platform: platform || '',
    platforms: platform ? [platform] : [],
    files: files.map(f => ({ name:f.name, localPath:f.path, type:isVideo(f.name) ? 'video' : 'image' })),
    filesLocalPaths: files.map(f => f.path),
    filesCount: files.length,
    storyOrder: contentType === 'story' ? Number(storyOrder || index || 0) : null,
    sortOrder: contentType === 'story' ? Number(storyOrder || index || 0) : Number(index || 0),
    captionText: caption || '',
    captionFilePath: captionPath || '',
    requestedAction: '',
    status: 'scheduled',
    createdAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString()
  };
}
async function scanAgendaFolder(payload){
  const agendaRoot = payload.folderPath;
  const year = Number(payload.year || new Date().getFullYear());
  const selectedPlatforms = Array.isArray(payload.platforms) && payload.platforms.length ? payload.platforms.filter(p => LOCAL_PUBLISHER_PLATFORMS.includes(p)) : ['facebook','instagram'];
  const platformTimes = normalizePlatformTimes(payload.platformTimes || await loadLocalPublisherPlatformTimes());
  const platformConnections = await loadPlatformConnections();
  const fallbackTimes = payload.times || {};
  const missingPlatforms = selectedPlatforms.filter(platform => !platformReady(platformConnections, platform));
  const rootItems = await readDirSafe(agendaRoot);
  const dayFolders = naturalSort(rootItems.filter(d => d.isDirectory() && /^(\d{1,2})-(\d{1,2})$/.test(d.name)));
  const jobs = [];
  const warnings = [];
  missingPlatforms.forEach(platform => warnings.push(`المنصة ${platform} غير مربوطة مركزيًا في Firebase أو لا يوجد توكن محفوظ. سيتم إنشاء المهام لكن النشر الفعلي يحتاج ربط المنصة.`));
  for(const day of dayFolders){
    const m = day.name.match(/^(\d{1,2})-(\d{1,2})$/);
    const dd = String(Number(m[1])).padStart(2, '0');
    const mm = String(Number(m[2])).padStart(2, '0');
    const dateIso = `${year}-${mm}-${dd}`;
    const dayPath = path.join(agendaRoot, day.name);
    const captionInfo = await readCaption(dayPath);
    const caption = captionInfo.text || '';
    if(captionInfo.error) warnings.push(`${day.name}: ${captionInfo.error}`);

    const postFolder = await findChildDir(dayPath, 'بوست');
    const postFiles = await listMediaFiles(postFolder, isImage);

    const reelFolder = await findChildDir(dayPath, 'ريل');
    const reelFiles = await listMediaFiles(reelFolder, isVideo);

    const storyFolder = await findChildDir(dayPath, 'ستوري');
    const storyFiles = await listMediaFiles(storyFolder, isMedia);
    const storyImageFiles = storyFiles.filter(file => isImage(file.name));
    const storyVideoFiles = storyFiles.filter(file => isVideo(file.name));

    if(postFiles.length){
      selectedPlatforms.filter(platform => platform !== 'tiktok').forEach(platform => {
        const time = timeForPlatform(platformTimes, platform, 'post', fallbackTimes);
        if(!time) return;
        jobs.push(makeJob({ agendaRoot, dayFolder:day.name, dateIso, time, contentType:'post', title:`بوست ${day.name} - ${platform}`, files:postFiles, caption, captionPath:captionInfo.filePath, platform, index:1 }));
      });
    }

    if(storyImageFiles.length && selectedPlatforms.includes('tiktok')){
      const time = timeForPlatform(platformTimes, 'tiktok', 'post', fallbackTimes);
      if(time){
        jobs.push(makeJob({ agendaRoot, dayFolder:day.name, dateIso, time, contentType:'post', title:`بوست ${day.name} - tiktok - من فولدر ستوري`, files:storyImageFiles, caption, captionPath:captionInfo.filePath, platform:'tiktok', index:1 }));
      }
    }

    reelFiles.forEach((file, i) => selectedPlatforms.forEach(platform => {
      const time = timeForPlatform(platformTimes, platform, 'reel', fallbackTimes);
      if(!time) return;
      jobs.push(makeJob({ agendaRoot, dayFolder:day.name, dateIso, time, contentType:'reel', title:`ريل ${day.name} - ${i+1} - ${platform} - من فولدر ريل`, files:[file], caption, captionPath:captionInfo.filePath, platform, index:i+1 }));
    }));

    storyVideoFiles.forEach((file, i) => selectedPlatforms.filter(p => STORY_VIDEO_AS_REEL_PLATFORMS.includes(p)).forEach(platform => {
      const time = timeForPlatform(platformTimes, platform, 'reel', fallbackTimes);
      if(!time) return;
      const offsetIndex = reelFiles.length + i + 1;
      jobs.push(makeJob({ agendaRoot, dayFolder:day.name, dateIso, time:addMinutesToTime(time, offsetIndex - 1), contentType:'reel', title:`ريل ${day.name} - ${offsetIndex} - ${platform} - من فولدر ستوري`, files:[file], caption, captionPath:captionInfo.filePath, platform, index:offsetIndex }));
    }));

    const storyFromStoryFolderJobs = storyFiles.map((file, i) => ({ file, index:i + 1, source:'story-folder' }));
    const reelAsStoryJobs = reelFiles.map((file, i) => ({ file, index:storyFromStoryFolderJobs.length + i + 1, source:'reel-folder' }));
    [...storyFromStoryFolderJobs, ...reelAsStoryJobs].forEach(({ file, index, source }) => selectedPlatforms.filter(p => STORY_PLATFORMS.includes(p)).forEach(platform => {
      if(source === 'reel-folder' && !REEL_AS_STORY_PLATFORMS.includes(platform)) return;
      const baseTime = timeForPlatform(platformTimes, platform, 'story', fallbackTimes);
      if(!baseTime) return;
      const time = addMinutesToTime(baseTime, index - 1);
      const sourceLabel = source === 'reel-folder' ? 'من فولدر ريل' : 'من فولدر ستوري';
      jobs.push(makeJob({ agendaRoot, dayFolder:day.name, dateIso, time, contentType:'story', title:`ستوري ${day.name} - ${index} - ${platform} - ${sourceLabel} - ${file.name}`, files:[file], caption:'', captionPath:'', platform, index, storyOrder:index }));
    }));
  }
  return { ok:true, folderPath:agendaRoot, jobs, warnings, days:dayFolders.length, platformTimes };
}
function mimeTypeForFile(filePath = ''){
  const ext = String(path.extname(filePath || '')).toLowerCase();
  return ({ '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.gif':'image/gif', '.mp4':'video/mp4', '.mov':'video/quicktime', '.m4v':'video/x-m4v', '.webm':'video/webm' })[ext] || 'application/octet-stream';
}
function safeStorageFileName(name = ''){
  return String(name || 'media-file').replace(/[\/#?%*:|"<>]+/g, '-').replace(/\s+/g, '-').slice(0, 140) || 'media-file';
}
function inferReadyPostType(job = {}){
  const type = String(job.contentType || job.type || '').toLowerCase();
  if(type.includes('story')) return 'story';
  if(type.includes('reel') || type.includes('short')) return 'reel';
  return 'photo_post';
}
function publishEndpointFromConfig(config = {}){
  if(config.publishEndpoint) return String(config.publishEndpoint).replace(/\/$/, '');
  const site = String(config.siteUrl || config.webAppUrl || 'https://mzj.vercel.app').replace(/\/$/, '');
  return `${site}/api/meta/publish/ready`;
}

async function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }
async function waitForPublicMediaUrl(url, attempts = 6){
  if(!url) return false;
  for(let i = 0; i < attempts; i += 1){
    try{
      const response = await fetch(url, { method:'HEAD' });
      if(response.ok) return true;
    }catch(_){/* retry */}
    await sleep(900 + (i * 250));
  }
  return false;
}
async function uploadLocalJobMedia(job){
  const { config, firebaseApp } = await getFirebase();
  const storageMod = await import('firebase/storage');
  const storage = storageMod.getStorage(firebaseApp);
  const files = Array.isArray(job.files) && job.files.length ? job.files : (Array.isArray(job.filesLocalPaths) ? job.filesLocalPaths.map(localPath => ({ localPath, name:path.basename(localPath) })) : []);
  if(!files.length) return [];
  const uploaded = [];
  for(let i = 0; i < files.length; i += 1){
    const file = files[i] || {};
    const localPath = String(file.localPath || file.path || file || '').trim();
    if(!localPath) throw new Error('Local media path is missing.');
    const buffer = await fs.readFile(localPath);
    const name = file.name || path.basename(localPath);
    const contentType = file.mimeType || (file.type && String(file.type).includes('/') ? file.type : mimeTypeForFile(localPath));
    const storagePath = `local-publisher-media/${safeId(job.id || 'job')}/${String(i+1).padStart(2,'0')}-${Date.now()}-${safeStorageFileName(name)}`;
    const storageRef = storageMod.ref(storage, storagePath);
    await storageMod.uploadBytes(storageRef, buffer, { contentType, customMetadata:{ localJobId:String(job.id || ''), originalFileName:String(name || ''), source:'electron-local-agent' } });
    const downloadURL = await storageMod.getDownloadURL(storageRef);
    await waitForPublicMediaUrl(downloadURL).catch(()=>false);
    uploaded.push({ url:downloadURL, downloadURL, storagePath, name, localPath, contentType, type:contentType });
  }
  return uploaded;
}
async function publishLocalJobViaReadyEndpoint(job, uploadedMedia){
  const { config } = await getFirebase();
  const platform = String(job.platform || (Array.isArray(job.platforms) ? job.platforms[0] : '') || '').toLowerCase();
  const urls = uploadedMedia.map(item => item.downloadURL || item.url).filter(Boolean);
  const first = uploadedMedia[0] || {};
  const caption = String(job.captionText || job.caption || '').trim();
  const payload = {
    taskId: job.id || '',
    localJobId: job.id || '',
    title: job.title || first.name || 'MZJ Local Publish',
    contentType: job.contentType || '',
    postType: inferReadyPostType(job),
    postTypeLabel: job.contentType || '',
    platforms: platform ? [platform] : (Array.isArray(job.platforms) ? job.platforms : []),
    caption,
    hashtags: job.hashtagsText || job.hashtags || '',
    mediaUrl: urls[0] || '',
    finalFileUrl: urls[0] || '',
    mediaUrls: urls,
    fileUrls: urls,
    fileName: first.name || '',
    fileNames: uploadedMedia.map(item => item.name).filter(Boolean),
    mimeType: first.contentType || first.type || '',
    source: 'electron-local-agent',
    taskSnapshot: { title:job.title || '', sourceType:'local-publisher', publishDate:job.publishDate || job.date || '', publishTime:job.publishTime || '', platforms: platform ? [platform] : [] }
  };
  const endpoint = publishEndpointFromConfig(config);
  const response = await fetch(endpoint, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
  const data = await response.json().catch(() => ({}));
  if(!response.ok || data.ok === false){
    const errors = Array.isArray(data.results) ? data.results.map(item => `${item.platform || platform || ''}: ${item.error || (item.skipped ? 'skipped' : 'failed')}`).join(' | ') : '';
    throw new Error(data.error || errors || `Publish endpoint failed: ${response.status}`);
  }
  return data;
}
async function processRequestedJob(docSnap){
  const { fsMod } = await getFirebase();
  const job = { id:docSnap.id, ...(docSnap.data() || {}) };
  const now = new Date().toISOString();
  const platform = String(job.platform || (Array.isArray(job.platforms) ? job.platforms[0] : '') || '').toLowerCase();
  const connections = await loadPlatformConnections();
  const ready = platform ? platformReady(connections, platform) : false;
  await fsMod.setDoc(docSnap.ref, { status:'publishing', agentLastSeenAtIso:now, publishStartedAtIso:now, publishAttempts:Number(job.publishAttempts || 0) + 1, agentCentralConnectionReady:ready, error:'', lastError:'', updatedAtIso:now, updatedAt:fsMod.serverTimestamp() }, { merge:true });
  if(platform && !ready) throw new Error(`${platform} غير مربوط مركزيًا في Firebase أو لا يوجد توكن محفوظ.`);
  const uploaded = await uploadLocalJobMedia(job);
  const result = await publishLocalJobViaReadyEndpoint(job, uploaded);
  const doneAt = new Date().toISOString();
  await fsMod.setDoc(docSnap.ref, { status:'published', requestedAction:'', publishedAtIso:doneAt, publishCompletedAtIso:doneAt, uploadedMedia:uploaded, publishResult:result, agentNote:'تم النشر فعليًا من Electron باستخدام نفس مسار نشر صفحة تجهيز النشر.', updatedAtIso:doneAt, updatedAt:fsMod.serverTimestamp() }, { merge:true });
  return { ok:true, id:docSnap.id, platform, result };
}
async function markRequestedJobsSeen(){
  const { config, db, fsMod } = await getFirebase();
  const collectionName = config.jobsCollection || 'publishing_jobs';
  const jobsRef = fsMod.collection(db, collectionName);
  const statuses = ['manual_publish_requested','retry_requested'];
  let handled = 0;
  let published = 0;
  let failed = 0;
  const results = [];
  for(const status of statuses){
    const q = fsMod.query(jobsRef, fsMod.where('status', '==', status), fsMod.limit(10));
    const snap = await fsMod.getDocs(q);
    const docs = snap.docs.slice().sort((a,b) => {
      const ad = a.data() || {}; const bd = b.data() || {};
      const at = `${ad.publishDate || ad.date || ''} ${ad.publishTime || ''} ${String(ad.storyOrder || ad.sortOrder || 0).padStart(4,'0')}`;
      const bt = `${bd.publishDate || bd.date || ''} ${bd.publishTime || ''} ${String(bd.storyOrder || bd.sortOrder || 0).padStart(4,'0')}`;
      return at.localeCompare(bt, 'ar', { numeric:true, sensitivity:'base' });
    });
    for(const docSnap of docs){
      handled += 1;
      try{
        const result = await processRequestedJob(docSnap);
        published += 1;
        results.push(result);
      }catch(error){
        failed += 1;
        const now = new Date().toISOString();
        await fsMod.setDoc(docSnap.ref, { status:'failed', error:error.message || String(error), lastError:error.message || String(error), publishFailedAtIso:now, agentNote:'فشل النشر الفعلي من Electron. راجع error/lastError.', updatedAtIso:now, updatedAt:fsMod.serverTimestamp() }, { merge:true }).catch(()=>null);
        results.push({ ok:false, id:docSnap.id, error:error.message || String(error) });
      }
    }
  }
  return { ok:true, handled, published, failed, results };
}

async function loadConfig(){
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}
async function getFirebase(){
  if(firebaseCache) return firebaseCache;
  const config = await loadConfig();
  const appMod = await import('firebase/app');
  const fsMod = await import('firebase/firestore');
  const firebaseApp = appMod.initializeApp(config.firebaseConfig);
  const db = fsMod.getFirestore(firebaseApp);
  firebaseCache = { config, firebaseApp, db, fsMod };
  return firebaseCache;
}
async function saveJobsToFirebase(payload){
  const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];
  const { config, db, fsMod } = await getFirebase();
  const collectionName = config.jobsCollection || 'publishing_jobs';
  let saved = 0;
  for(const job of jobs){
    const ref = fsMod.doc(db, collectionName, safeId(job.id || `job_${Date.now()}_${saved}`));
    await fsMod.setDoc(ref, { ...job, agentRequiresCentralConnection:true, updatedAtIso:new Date().toISOString(), updatedAt:fsMod.serverTimestamp() }, { merge:true });
    saved += 1;
  }
  return { ok:true, saved };
}

ipcMain.handle('choose-agenda-folder', async () => {
  const result = await dialog.showOpenDialog({ properties:['openDirectory'], title:'اختار فولدر الأجندة' });
  if(result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});
ipcMain.handle('scan-agenda-folder', async (_event, payload) => scanAgendaFolder(payload || {}));
ipcMain.handle('save-publishing-jobs', async (_event, payload) => saveJobsToFirebase(payload || {}));
ipcMain.handle('check-publishing-commands', async () => markRequestedJobsSeen());
ipcMain.handle('load-platform-connections', async () => { const connections = await loadPlatformConnections(); return { ok:true, connections:Object.fromEntries(Object.entries(connections).map(([key, value]) => [key, redactConnectionForUi(value)])) }; });
