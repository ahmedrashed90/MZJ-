let selectedFolder = '';
let scannedJobs = [];
let scannedDays = 0;
let warnings = [];
const $ = id => document.getElementById(id);
const PLATFORMS = ['facebook','instagram','tiktok','youtube','snapchat'];
const TYPES = ['post','reel','story'];
const PLATFORM_LABELS = { facebook:'Facebook', instagram:'Instagram', tiktok:'TikTok', youtube:'YouTube', snapchat:'Snapchat' };
const TYPE_LABELS = { post:'وقت البوست', reel:'وقت الريل', story:'وقت الستوري' };
const DEFAULT_TIMES = {
  facebook: { post:'12:00', reel:'18:00', story:'21:00' },
  instagram: { post:'13:00', reel:'19:00', story:'22:00' },
  tiktok: { post:'', reel:'20:00', story:'' },
  youtube: { post:'', reel:'18:30', story:'' },
  snapchat: { post:'', reel:'', story:'23:00' }
};
$('yearInput').value = new Date().getFullYear();
function selectedPlatforms(){ return [...document.querySelectorAll('.platforms input:checked')].map(i => i.value); }
function setStatus(text, cls=''){ const el=$('statusText'); el.textContent=text; el.className='status '+cls; }
function cleanTime(value){ return /^\d{2}:\d{2}$/.test(String(value || '').trim()) ? String(value).trim() : ''; }
function renderPlatformTimes(){
  const body = $('platformTimesBody');
  if(!body) return;
  body.innerHTML = PLATFORMS.map(platform => `<tr>
    <td><strong>${PLATFORM_LABELS[platform] || platform}</strong></td>
    ${TYPES.map(type => `<td><input type="time" data-platform-time="${platform}:${type}" value="${DEFAULT_TIMES?.[platform]?.[type] || ''}"></td>`).join('')}
  </tr>`).join('');
}
function readPlatformTimes(){
  const times = {};
  document.querySelectorAll('[data-platform-time]').forEach(input => {
    const [platform, type] = String(input.getAttribute('data-platform-time') || '').split(':');
    if(!platform || !type) return;
    times[platform] = times[platform] || {};
    times[platform][type] = cleanTime(input.value);
  });
  return times;
}
function render(){
  $('folderPath').textContent = selectedFolder || 'لم يتم اختيار فولدر بعد';
  $('stats').innerHTML = `<div><span>الأيام</span><strong>${scannedDays}</strong></div><div><span>المهام</span><strong>${scannedJobs.length}</strong></div><div><span>تحذيرات</span><strong>${warnings.length}</strong></div><div><span>جاهز للحفظ</span><strong>${scannedJobs.length ? 'نعم' : 'لا'}</strong></div>`;
  $('warnings').innerHTML = warnings.length ? warnings.map(w => `<p class="warn">⚠ ${w}</p>`).join('') : '<p class="ok">لا توجد تحذيرات.</p>';
  $('jobsBody').innerHTML = scannedJobs.length ? scannedJobs.slice(0,300).map(job => `<tr><td>${job.publishDate} ${job.publishTime}</td><td>${job.platform || '-'}</td><td>${job.contentType}</td><td>${job.title}</td><td>${job.filesCount}</td><td>${job.captionText ? 'موجود' : 'بدون'}</td></tr>`).join('') : '<tr><td colspan="6" class="muted">لا توجد مهام بعد.</td></tr>';
}
$('pickFolderBtn').addEventListener('click', async () => { selectedFolder = await window.mzjPublisherAgent.chooseAgendaFolder() || selectedFolder; render(); });
$('scanBtn').addEventListener('click', async () => {
  if(!selectedFolder) return setStatus('اختار فولدر الأجندة الأول.', 'warn');
  setStatus('جاري فحص الأجندة...');
  const result = await window.mzjPublisherAgent.scanAgendaFolder({ folderPath:selectedFolder, year:$('yearInput').value, platforms:selectedPlatforms(), platformTimes:readPlatformTimes() });
  scannedJobs = result.jobs || []; scannedDays = result.days || 0; warnings = result.warnings || [];
  render(); setStatus(`تم الفحص: ${scannedJobs.length} مهمة.`, 'ok');
});
$('saveBtn').addEventListener('click', async () => {
  if(!scannedJobs.length) return setStatus('لا توجد مهام للحفظ. افحص الأجندة أولاً.', 'warn');
  setStatus('جاري الحفظ في Firebase...');
  const result = await window.mzjPublisherAgent.savePublishingJobs({ jobs:scannedJobs });
  setStatus(`تم حفظ ${result.saved || 0} مهمة في Firebase.`, 'ok');
});
$('checkCommandsBtn')?.addEventListener('click', async () => {
  setStatus('جاري فحص أوامر النشر اليدوي وإعادة المحاولة...');
  const result = await window.mzjPublisherAgent.checkPublishingCommands();
  setStatus(`تم فحص الأوامر. عدد الطلبات المستلمة: ${result.handled || 0}.`, 'ok');
});
renderPlatformTimes();
render();
