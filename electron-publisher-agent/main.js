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
function naturalSort(list){ return list.sort((a,b) => String(a.name || a).localeCompare(String(b.name || b), 'ar', { numeric:true, sensitivity:'base' })); }
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
function makeJob({ agendaRoot, dayFolder, dateIso, time, contentType, title, files, caption, captionPath, platforms, index }){
  const scheduledAtIso = `${dateIso}T${time || '09:00'}:00`;
  const basis = [agendaRoot, dayFolder, contentType, title, index || 0, files.map(f => f.path).join('|')].join('|');
  return {
    id: safeId(`local_${dateIso}_${contentType}_${index || 1}_${hash(basis)}`),
    source: 'electron-local-agent',
    agendaRoot,
    dayFolder,
    date: dateIso,
    publishDate: dateIso,
    publishTime: time || '09:00',
    scheduledAtIso,
    contentType,
    title,
    platforms,
    files: files.map(f => ({ name:f.name, localPath:f.path, type:isVideo(f.name) ? 'video' : 'image' })),
    filesLocalPaths: files.map(f => f.path),
    filesCount: files.length,
    captionText: caption || '',
    captionFilePath: captionPath || '',
    status: 'scheduled',
    createdAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString()
  };
}
async function scanAgendaFolder(payload){
  const agendaRoot = payload.folderPath;
  const year = Number(payload.year || new Date().getFullYear());
  const platforms = Array.isArray(payload.platforms) && payload.platforms.length ? payload.platforms : ['facebook','instagram'];
  const times = payload.times || {};
  const rootItems = await readDirSafe(agendaRoot);
  const dayFolders = naturalSort(rootItems.filter(d => d.isDirectory() && /^(\d{1,2})-(\d{1,2})$/.test(d.name)));
  const jobs = [];
  const warnings = [];
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
    if(postFiles.length){
      jobs.push(makeJob({ agendaRoot, dayFolder:day.name, dateIso, time:times.post || '09:00', contentType:'post', title:`بوست ${day.name}`, files:postFiles, caption, captionPath:captionInfo.filePath, platforms, index:1 }));
    }

    const reelFolder = await findChildDir(dayPath, 'ريل');
    const reelFiles = await listMediaFiles(reelFolder, isVideo);
    reelFiles.forEach((file, i) => jobs.push(makeJob({ agendaRoot, dayFolder:day.name, dateIso, time:times.reel || '12:00', contentType:'reel', title:`ريل ${day.name} - ${i+1}`, files:[file], caption, captionPath:captionInfo.filePath, platforms, index:i+1 })));

    const storyFolder = await findChildDir(dayPath, 'ستوري');
    const storyFiles = await listMediaFiles(storyFolder, isMedia);
    storyFiles.forEach((file, i) => jobs.push(makeJob({ agendaRoot, dayFolder:day.name, dateIso, time:times.story || '18:00', contentType:'story', title:`ستوري ${day.name} - ${i+1}`, files:[file], caption:'', captionPath:'', platforms:platforms.filter(p => ['instagram','facebook','snapchat'].includes(p)), index:i+1 })));
  }
  return { ok:true, folderPath:agendaRoot, jobs, warnings, days:dayFolders.length };
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
  firebaseCache = { config, db, fsMod };
  return firebaseCache;
}
async function saveJobsToFirebase(payload){
  const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];
  const { config, db, fsMod } = await getFirebase();
  const collectionName = config.jobsCollection || 'publishing_jobs';
  let saved = 0;
  for(const job of jobs){
    const ref = fsMod.doc(db, collectionName, safeId(job.id || `job_${Date.now()}_${saved}`));
    await fsMod.setDoc(ref, { ...job, updatedAtIso:new Date().toISOString(), updatedAt:fsMod.serverTimestamp() }, { merge:true });
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
