let selectedFolder = '';
let scannedJobs = [];
let scannedDays = 0;
let warnings = [];
const $ = id => document.getElementById(id);
$('yearInput').value = new Date().getFullYear();
function selectedPlatforms(){ return [...document.querySelectorAll('.platforms input:checked')].map(i => i.value); }
function setStatus(text, cls=''){ const el=$('statusText'); el.textContent=text; el.className='status '+cls; }
function render(){
  $('folderPath').textContent = selectedFolder || 'لم يتم اختيار فولدر بعد';
  $('stats').innerHTML = `<div><span>الأيام</span><strong>${scannedDays}</strong></div><div><span>المهام</span><strong>${scannedJobs.length}</strong></div><div><span>تحذيرات</span><strong>${warnings.length}</strong></div><div><span>جاهز للحفظ</span><strong>${scannedJobs.length ? 'نعم' : 'لا'}</strong></div>`;
  $('warnings').innerHTML = warnings.length ? warnings.map(w => `<p class="warn">⚠ ${w}</p>`).join('') : '<p class="ok">لا توجد تحذيرات.</p>';
  $('jobsBody').innerHTML = scannedJobs.length ? scannedJobs.slice(0,300).map(job => `<tr><td>${job.publishDate} ${job.publishTime}</td><td>${job.contentType}</td><td>${job.title}</td><td>${job.filesCount}</td><td>${job.captionText ? 'موجود' : 'بدون'}</td></tr>`).join('') : '<tr><td colspan="5" class="muted">لا توجد مهام بعد.</td></tr>';
}
$('pickFolderBtn').addEventListener('click', async () => { selectedFolder = await window.mzjPublisherAgent.chooseAgendaFolder() || selectedFolder; render(); });
$('scanBtn').addEventListener('click', async () => {
  if(!selectedFolder) return setStatus('اختار فولدر الأجندة الأول.', 'warn');
  setStatus('جاري فحص الأجندة...');
  const result = await window.mzjPublisherAgent.scanAgendaFolder({ folderPath:selectedFolder, year:$('yearInput').value, platforms:selectedPlatforms(), times:{ post:$('postTime').value, reel:$('reelTime').value, story:$('storyTime').value } });
  scannedJobs = result.jobs || []; scannedDays = result.days || 0; warnings = result.warnings || [];
  render(); setStatus(`تم الفحص: ${scannedJobs.length} مهمة.`, 'ok');
});
$('saveBtn').addEventListener('click', async () => {
  if(!scannedJobs.length) return setStatus('لا توجد مهام للحفظ. افحص الأجندة أولاً.', 'warn');
  setStatus('جاري الحفظ في Firebase...');
  const result = await window.mzjPublisherAgent.savePublishingJobs({ jobs:scannedJobs });
  setStatus(`تم حفظ ${result.saved || 0} مهمة في Firebase.`, 'ok');
});
render();
