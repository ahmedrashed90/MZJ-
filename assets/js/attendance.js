(function(){
  const DEFAULT_SETTINGS = {
    id:'default', enabled:true, workStartTime:'16:00', workEndTime:'21:00', startTime:'16:00', endTime:'21:00', graceMinutes:15,
    presenceHeartbeatSeconds:60, offlineAfterMinutes:10, idleAfterMinutes:5, timezone:'Asia/Riyadh'
  };
  const state = {
    settings:{...DEFAULT_SETTINGS}, records:[], presence:[], requests:[], reportRecords:null, unsub:[], booted:false,
    lastActivityAt:new Date(), currentRecord:null, popupOpen:false, reportFilters:null
  };
  const coll = (name) => mainDb && safeCollection ? safeCollection(name) : null;
  const esc = (v) => (typeof escapeHtml === 'function' ? escapeHtml(v) : String(v??'').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])));
  const norm = (v) => String(v ?? '').trim();
  const lower = (v) => norm(v).toLowerCase();
  const isEmailValue = (v) => /@/.test(norm(v));
  const cleanName = (v) => {
    const s = norm(v);
    if(!s || isEmailValue(s)) return '';
    if(s.includes('—')) return cleanName(s.split('—')[0]);
    return s;
  };
  const todayKey = () => {
    const d = new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`;
  };
  const monthStartKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; };
  const nowIso = () => new Date().toISOString();
  const currentUser = () => (typeof getCurrentUserIdentity === 'function' ? getCurrentUserIdentity() : (JSON.parse(localStorage.getItem('mzj_user')||'{}')||{}));
  const localUser = () => { try{return JSON.parse(localStorage.getItem('mzj_user')||'{}')||{};}catch(_){return {};} };
  const isAdmin = () => {
    const u = localUser(); const role=lower(u.role); const dep=lower(u.department || u.departmentId); const email=lower(u.email || currentUser().email);
    return ['hossamzayan10@gmail.com','mr.ahmed_rashed@outlook.sa'].includes(email) || ['admin','super_admin','management','marketing_manager','manager','owner'].includes(role) || dep === 'management';
  };
  const getSettings = () => ({...DEFAULT_SETTINGS, ...(state.settings||{})});
  const mins = (hhmm) => { const [h,m]=String(hhmm||'00:00').split(':').map(Number); return (Number.isFinite(h)?h:0)*60 + (Number.isFinite(m)?m:0); };
  const dateFromValue = (value) => {
    if(!value) return null;
    if(value && typeof value.toDate === 'function') return value.toDate();
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const dateKeyOf = (value) => {
    if(!value) return '';
    const s = norm(value);
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = dateFromValue(value);
    if(!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const fmtTime = (value) => {
    const d = dateFromValue(value); if(!d) return '—';
    return d.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
  };
  const relative = (value) => {
    const d = dateFromValue(value); if(!d) return '—';
    const diff = Math.max(0, Math.round((Date.now()-d.getTime())/60000));
    if(diff < 1) return 'الآن'; if(diff === 1) return 'منذ دقيقة'; if(diff < 60) return `منذ ${diff} دقيقة`; return `منذ ${Math.round(diff/60)} ساعة`;
  };
  const minutesLabel = (m) => {
    const n = Math.max(0, Math.round(Number(m)||0));
    const h = Math.floor(n/60); const r = n%60;
    if(h && r) return `${h}س ${r}د`;
    if(h) return `${h}س`;
    return `${r}د`;
  };
  const docIdFor = (u=currentUser()) => `${todayKey()}_${norm(u.uid || u.id || u.email || 'user').replace(/[\/\s]+/g,'_')}`;
  const userAliases = (u) => {
    const out=[];
    [u?.uid,u?.id,u?.userUid,u?.userId].forEach(x=>{ const v=lower(x); if(v) out.push(`uid:${v}`); });
    [u?.email,u?.userEmail].forEach(x=>{ const v=lower(x); if(v) out.push(`email:${v}`); });
    return [...new Set(out)];
  };
  const displayNameOf = (u) => cleanName(u?.name) || cleanName(u?.displayName) || cleanName(u?.username) || cleanName(u?.label) || 'مستخدم بدون اسم';
  function employeeFromDepartmentMember(member, dep){
    const uid = norm(member?.uid || member?.id || member?.userUid || member?.userId || '');
    const email = norm(member?.email || member?.userEmail || '');
    const name = displayNameOf(member);
    if(!uid && !email && !name) return null;
    return {
      uid, id: uid || email, email, userEmail: email, name, displayName:name,
      role: member?.role || 'user', department: member?.department || dep?.id || '', departmentId: dep?.id || member?.departmentId || '',
      departmentName: dep?.name || member?.departmentName || member?.department || dep?.id || ''
    };
  }
  function mergeEmployee(existing, incoming){
    if(!existing) return {...incoming, name: displayNameOf(incoming), displayName: displayNameOf(incoming)};
    const currentName = displayNameOf(existing);
    const incomingName = displayNameOf(incoming);
    const currentIsPlaceholder = currentName === 'مستخدم بدون اسم';
    const finalName = !currentIsPlaceholder ? currentName : incomingName;
    return {
      ...existing,
      uid: existing.uid || incoming.uid || '',
      id: existing.id || incoming.id || incoming.uid || incoming.email || '',
      email: existing.email || incoming.email || incoming.userEmail || '',
      userEmail: existing.userEmail || existing.email || incoming.userEmail || incoming.email || '',
      name: finalName,
      displayName: finalName,
      role: existing.role || incoming.role || 'user',
      department: existing.department || incoming.department || '',
      departmentId: existing.departmentId || incoming.departmentId || '',
      departmentName: existing.departmentName || incoming.departmentName || existing.department || incoming.department || ''
    };
  }
  function collectEmployees(){
    const usersIndex = new Map();
    const addToIndex = (u) => userAliases(u).forEach(a => usersIndex.set(a,u));
    (Array.isArray(users)?users:[]).forEach(u => addToIndex({uid:u.uid||u.id||'',id:u.id||u.uid||'',email:u.email||'',userEmail:u.email||'',name:u.name||u.displayName||u.username||'',displayName:u.displayName||u.name||'',role:u.role||'user',department:u.department||'',departmentId:u.departmentId||'',departmentName:u.departmentName||u.department||''}));
    (Array.isArray(departments)?departments:[]).forEach(dep => {
      [...(Array.isArray(dep.members)?dep.members:[]), ...(Array.isArray(dep.users)?dep.users:[])].forEach(member => addToIndex(employeeFromDepartmentMember(member, dep)));
    });

    const map = new Map();
    const aliases = new Map();
    const put = (raw) => {
      if(!raw) return;
      const incoming = {...raw, name: displayNameOf(raw), displayName: displayNameOf(raw)};
      const allAliases = userAliases(incoming);
      let primary = allAliases.map(a=>aliases.get(a)).find(Boolean) || allAliases[0] || `name:${lower(incoming.name)}|dept:${lower(incoming.departmentId||incoming.departmentName||incoming.department)}`;
      const existing = map.get(primary);
      const merged = mergeEmployee(existing, incoming);
      map.set(primary, merged);
      userAliases(merged).forEach(a=>aliases.set(a, primary));
    };
    const resolveFallback = (value, dep) => {
      const raw = norm(value); if(!raw) return null;
      const alias = isEmailValue(raw) ? `email:${lower(raw)}` : `uid:${lower(raw)}`;
      const known = usersIndex.get(alias);
      if(known) return employeeFromDepartmentMember({...known, department:known.department || dep?.id}, dep);
      return employeeFromDepartmentMember({uid:isEmailValue(raw)?'':raw, id:isEmailValue(raw)?'':raw, email:isEmailValue(raw)?raw:'', name:''}, dep);
    };
    (Array.isArray(departments)?departments:[]).forEach(dep => {
      [...(Array.isArray(dep.members)?dep.members:[]), ...(Array.isArray(dep.users)?dep.users:[])].forEach(member => put(employeeFromDepartmentMember(member, dep)));
      [...(Array.isArray(dep.memberUids)?dep.memberUids:[]), ...(Array.isArray(dep.memberEmails)?dep.memberEmails:[]), ...(Array.isArray(dep.userIds)?dep.userIds:[])].forEach(value => put(resolveFallback(value, dep)));
    });
    (Array.isArray(users)?users:[]).forEach(u => put({uid:u.uid||u.id||'',id:u.id||u.uid||'',email:u.email||'',userEmail:u.email||'',name:u.name||u.displayName||u.username||'',displayName:u.displayName||u.name||'',role:u.role||'user',department:u.department||'',departmentId:u.departmentId||'',departmentName:u.departmentName||u.department||''}));
    return [...map.values()].filter(u => u.uid || u.id || u.email || cleanName(u.name)).sort((a,b)=>displayNameOf(a).localeCompare(displayNameOf(b),'ar'));
  }
  function recordForEmployee(emp, records=state.records){
    const aliases = userAliases(emp);
    return (records||[]).find(r => userAliases(r).some(a=>aliases.includes(a))) || null;
  }
  function presenceForEmployee(emp){
    const aliases = userAliases(emp);
    return state.presence.find(r => userAliases(r).some(a=>aliases.includes(a))) || null;
  }
  function statusOfRecord(rec){
    if(!rec) return {label:'لم يسجل', cls:'gray'};
    if(rec.checkOutAt || rec.checkOutTime) return {label:'منصرف', cls:'gray'};
    if(rec.isLate || rec.status === 'متأخر' || rec.attendanceStatus === 'late' || Number(rec.lateMinutes||0)>0) return {label:'متأخر', cls:'orange'};
    return {label:'حاضر', cls:'green'};
  }
  function onlineStatus(pres){
    if(!pres || !pres.lastSeenAt) return {label:'أوفلاين', cls:'red'};
    const d = dateFromValue(pres.lastSeenAt); if(!d) return {label:'أوفلاين', cls:'red'};
    const diff = Math.round((Date.now()-d.getTime())/60000);
    if(diff <= (getSettings().idleAfterMinutes || 5)) return {label:'أونلاين', cls:'green'};
    if(diff <= (getSettings().offlineAfterMinutes || 10)) return {label:'غير نشط', cls:'orange'};
    return {label:'أوفلاين', cls:'red'};
  }
  function lateMinutesOf(rec){
    if(!rec) return 0;
    if(Number.isFinite(Number(rec.lateMinutes))) return Math.max(0, Number(rec.lateMinutes));
    const check = dateFromValue(rec.checkInAt || rec.checkInTime); if(!check) return 0;
    const start = mins(rec.workStartTime || rec.startTime || getSettings().workStartTime || getSettings().startTime);
    const grace = Number(rec.graceMinutes ?? getSettings().graceMinutes ?? 0);
    const actual = check.getHours()*60 + check.getMinutes();
    return Math.max(0, actual - start - grace);
  }
  function workMinutesOf(rec){
    if(!rec) return 0;
    const saved = Number(rec.workMinutes ?? rec.workingMinutes);
    if(Number.isFinite(saved) && saved>0) return saved;
    const inD = dateFromValue(rec.checkInAt || rec.checkInTime);
    const outD = dateFromValue(rec.checkOutAt || rec.checkOutTime);
    if(!inD || !outD) return 0;
    return Math.max(0, Math.round((outD.getTime()-inD.getTime())/60000));
  }
  async function ensureSettings(){
    if(!mainDb) return;
    try{
      const ref = coll(window.MZJ_ATTENDANCE_SETTINGS_COLLECTION || 'attendance_settings').doc('default');
      const snap = await ref.get();
      if(snap.exists) state.settings = {...DEFAULT_SETTINGS, ...(snap.data()||{})};
      else state.settings = {...DEFAULT_SETTINGS};
    }catch(e){ console.warn('attendance settings fallback', e); state.settings = {...DEFAULT_SETTINGS}; }
  }
  function startSnapshots(){
    if(!mainDb || state.booted) return; state.booted = true;
    ensureSettings().then(()=>{ updateTopbar(); maybeShowCheckInPopup(); renderPage(); });
    const day=todayKey();
    const safeListen = (name, cb) => {
      try{ const unsub = coll(name).where('dayKey','==',day).onSnapshot(s=>cb(s.docs.map(d=>({id:d.id,...(d.data()||{})}))), e=>{ console.error(name,e); cb(null,e); }); state.unsub.push(unsub); }catch(e){ console.error(name,e); cb(null,e); }
    };
    safeListen(window.MZJ_ATTENDANCE_RECORDS_COLLECTION || 'attendance_records', (rows,err)=>{ if(!err) state.records=rows||[]; afterData(); });
    safeListen(window.MZJ_PRESENCE_STATUS_COLLECTION || 'presence_status', (rows,err)=>{ if(!err) state.presence=rows||[]; afterData(); });
    safeListen(window.MZJ_ATTENDANCE_REQUESTS_COLLECTION || 'attendance_requests', (rows,err)=>{ if(!err) state.requests=rows||[]; afterData(); });
    loadReportRecords(); trackActivity(); setInterval(updatePresence, 60000); setTimeout(updatePresence, 2000);
  }
  function afterData(){ updateTopbar(); maybeShowCheckInPopup(); if(location.hash==='#attendance') renderPage(); }
  async function loadReportRecords(force=false){
    if(!mainDb || (state.reportRecords && !force)) return state.reportRecords || [];
    try{
      const snap = await coll(window.MZJ_ATTENDANCE_RECORDS_COLLECTION || 'attendance_records').get();
      state.reportRecords = snap.docs.map(d=>({id:d.id,...(d.data()||{})}));
    }catch(e){ console.warn('attendance reports load failed', e); state.reportRecords = state.records.slice(); }
    if(location.hash==='#attendance') renderPage();
    return state.reportRecords;
  }
  async function checkIn(){
    const u=currentUser(); if(!u.uid && !u.id && !u.email) return alert('لم يتم التعرف على المستخدم.');
    const settings=getSettings(); const now=new Date(); const day=todayKey(); const currentMins=now.getHours()*60+now.getMinutes(); const late=Math.max(0,currentMins-mins(settings.workStartTime||settings.startTime)-Number(settings.graceMinutes||0));
    const lu=localUser(); const displayName=displayNameOf({...lu,...u});
    const data={ id:docIdFor(u), uid:u.uid||u.id||u.email, userId:u.id||u.uid||u.email, userUid:u.uid||u.id||u.email, userName:displayName, userEmail:u.email||lu.email||'', displayName, role:u.role||lu.role||'', department:lu.department||'', departmentId:lu.departmentId||'', departmentName:lu.departmentName||lu.department||'', date:day, dayKey:day, checkInAt:nowIso(), checkInTime:nowIso(), status:late>0?'متأخر':'حاضر', attendanceStatus:late>0?'late':'present', isLate:late>0, lateMinutes:late, workStartTime:settings.workStartTime||settings.startTime, workEndTime:settings.workEndTime||settings.endTime, graceMinutes:Number(settings.graceMinutes||0), checkInSource:'marketing_system', checkInMethod:'manual_button', deviceInfo:{userAgent:navigator.userAgent, platform:navigator.platform}, userAgent:navigator.userAgent, platform:navigator.platform, lastSeenAt:nowIso(), lastActivityAt:nowIso(), createdAt:nowIso(), updatedAt:nowIso() };
    await coll(window.MZJ_ATTENDANCE_RECORDS_COLLECTION || 'attendance_records').doc(data.id).set(data,{merge:true});
    state.reportRecords=null; await updatePresence('تسجيل حضور'); closePopup(); updateTopbar(); renderPage();
  }
  async function checkOut(){
    const u=currentUser(); const id=docIdFor(u); const rec=state.records.find(r=>r.id===id) || state.currentRecord;
    const inD = rec ? dateFromValue(rec.checkInAt || rec.checkInTime) : null; const outD = new Date();
    const workMinutes = inD ? Math.max(0, Math.round((outD.getTime()-inD.getTime())/60000)) : 0;
    const data={checkOutAt:nowIso(), checkOutTime:nowIso(), status:'منصرف', attendanceStatus:'checked_out', workMinutes, workingMinutes:workMinutes, workingHours:Math.round((workMinutes/60)*100)/100, checkOutSource:'marketing_system', checkOutMethod:'manual_button', updatedAt:nowIso()};
    await coll(window.MZJ_ATTENDANCE_RECORDS_COLLECTION || 'attendance_records').doc((rec&&rec.id)||id).set(data,{merge:true});
    state.reportRecords=null; await updatePresence('تسجيل انصراف'); updateTopbar(); renderPage();
  }
  async function updatePresence(activity){
    if(!mainDb) return; const u=currentUser(); if(!u.uid && !u.id && !u.email) return;
    const lu=localUser(); const id = norm(u.uid || u.id || u.email).replace(/[\/\s]+/g,'_'); const displayName=displayNameOf({...lu,...u});
    const data={ id, uid:u.uid||u.id||u.email, userId:u.id||u.uid||u.email, userUid:u.uid||u.id||u.email, userName:displayName, userEmail:u.email||lu.email||'', displayName, role:u.role||lu.role||'', department:lu.department||'', departmentId:lu.departmentId||'', departmentName:lu.departmentName||lu.department||'', date:todayKey(), dayKey:todayKey(), isOnline:true, online:true, presenceStatus:'online', lastSeenAt:nowIso(), lastActivityAt:state.lastActivityAt.toISOString(), lastActivityType:activity||'فتح السيستم', lastPage:(location.hash||'#dashboard').replace('#',''), todayAttendanceId:docIdFor(u), deviceInfo:{userAgent:navigator.userAgent, platform:navigator.platform}, userAgent:navigator.userAgent, platform:navigator.platform, updatedAt:nowIso(), createdAt:nowIso() };
    try{ await coll(window.MZJ_PRESENCE_STATUS_COLLECTION || 'presence_status').doc(id).set(data,{merge:true}); }catch(e){ console.warn('presence update failed', e); }
  }
  function trackActivity(){ ['click','keydown','input','change','scroll'].forEach(ev=>document.addEventListener(ev,()=>{ state.lastActivityAt=new Date(); },{passive:true})); }
  function myRecord(){ const u=currentUser(); const aliases=userAliases({uid:u.uid,id:u.id,email:u.email,userEmail:u.email}); return state.records.find(r=>r.id===docIdFor(u) || userAliases(r).some(a=>aliases.includes(a))) || null; }
  function updateTopbar(){
    const slot=document.getElementById('attendanceTopbarSlot'); if(!slot) return; const rec=myRecord(); state.currentRecord=rec;
    const st=statusOfRecord(rec); const present=!!rec && !(rec.checkOutAt||rec.checkOutTime);
    slot.innerHTML=`<div class="attendance-mini-card ${present?'is-present':st.cls==='orange'?'is-late':rec?'is-out':''}"><span class="dot"></span><span>${rec?`${st.label} اليوم ${fmtTime(rec.checkInAt||rec.checkInTime)}`:'لم تسجل حضور اليوم'}</span>${present?'<button class="danger" type="button" data-att-checkout>تسجيل انصراف</button>':''}</div>`;
  }
  function maybeShowCheckInPopup(){ if(state.popupOpen || isAdmin()) return; const rec=myRecord(); if(rec) return; if(!isLoggedIn || !isLoggedIn()) return; setTimeout(openPopup,250); }
  function openPopup(){ if(state.popupOpen || myRecord()) return; state.popupOpen=true; const div=document.createElement('div'); div.className='attendance-modal-backdrop'; div.id='attendanceCheckInPopup'; div.innerHTML=`<div class="attendance-modal"><div class="attendance-modal-icon">🕒</div><h2>تسجيل حضور اليوم</h2><p>سيتم تسجيل وقت حضورك الحالي داخل سيستم التسويق.</p><div class="btn-row"><button class="attendance-btn success" data-att-checkin type="button">تسجيل حضور</button></div></div>`; document.body.appendChild(div); }
  function closePopup(){ state.popupOpen=false; document.getElementById('attendanceCheckInPopup')?.remove(); }
  async function saveSettings(){
    const data={...getSettings(), workStartTime:document.getElementById('attStartTime')?.value||'16:00', startTime:document.getElementById('attStartTime')?.value||'16:00', workEndTime:document.getElementById('attEndTime')?.value||'21:00', endTime:document.getElementById('attEndTime')?.value||'21:00', graceMinutes:Number(document.getElementById('attGraceMinutes')?.value||15), updatedAt:nowIso(), updatedBy:currentUser().uid||currentUser().email||''};
    state.settings=data; await coll(window.MZJ_ATTENDANCE_SETTINGS_COLLECTION || 'attendance_settings').doc('default').set(data,{merge:true}); document.getElementById('attendanceSettingsMsg').textContent='تم حفظ مواعيد الدوام.'; renderPage();
  }
  function getReportFilters(){
    return state.reportFilters || {from:monthStartKey(), to:todayKey(), department:'all', employee:'all', status:'all'};
  }
  function setReportFiltersFromDom(){
    state.reportFilters = {from:document.getElementById('attReportFrom')?.value||monthStartKey(), to:document.getElementById('attReportTo')?.value||todayKey(), department:document.getElementById('attReportDepartment')?.value||'all', employee:document.getElementById('attReportEmployee')?.value||'all', status:document.getElementById('attReportStatus')?.value||'all'};
  }
  function datesBetween(from,to){
    const out=[]; const start=new Date(`${from}T00:00:00`); const end=new Date(`${to}T00:00:00`); if(Number.isNaN(start)||Number.isNaN(end)) return [todayKey()];
    for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)) out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    return out;
  }
  function reportRows(employees){
    const f=getReportFilters(); const allRecords=state.reportRecords || state.records || []; const days=datesBetween(f.from,f.to); const totalDays=days.length;
    let filteredEmployees=employees.filter(emp => (f.department==='all' || (emp.departmentId||emp.departmentName||emp.department)===f.department) && (f.employee==='all' || (userAliases(emp).includes(f.employee) || `name:${lower(emp.name)}`===f.employee)));
    let rows = filteredEmployees.map(emp=>{
      const aliases=userAliases(emp);
      const recs=allRecords.filter(r=>aliases.some(a=>userAliases(r).includes(a)) && days.includes(r.dayKey || dateKeyOf(r.date) || dateKeyOf(r.checkInAt || r.checkInTime)));
      const lateTotal=recs.reduce((s,r)=>s+lateMinutesOf(r),0); const lateCount=recs.filter(r=>lateMinutesOf(r)>0 || statusOfRecord(r).cls==='orange').length;
      const noCheckout=recs.filter(r=>!(r.checkOutAt||r.checkOutTime)).length; const workTotal=recs.reduce((s,r)=>s+workMinutesOf(r),0);
      const absent=Math.max(0,totalDays-recs.length);
      const status = lateCount ? 'late' : recs.length ? 'present' : 'absent';
      return {emp,totalDays,present:recs.length,absent,lateCount,lateTotal,noCheckout,workTotal,status};
    });
    if(f.status==='present') rows=rows.filter(r=>r.present>0);
    if(f.status==='late') rows=rows.filter(r=>r.lateCount>0);
    if(f.status==='absent') rows=rows.filter(r=>r.absent>0 && r.present===0);
    if(f.status==='no_checkout') rows=rows.filter(r=>r.noCheckout>0);
    return rows;
  }
  function reportStatusBadge(row){
    if(row.lateCount > 0) return '<span class="attendance-badge orange">متأخر</span>';
    if(row.present > 0 && row.noCheckout > 0) return '<span class="attendance-badge red">بدون انصراف</span>';
    if(row.present > 0) return '<span class="attendance-badge green">منتظم</span>';
    return '<span class="attendance-badge gray">لم يسجل</span>';
  }
  function formatReportRange(f){
    return `${f.from || monthStartKey()} إلى ${f.to || todayKey()}`;
  }
  function reportDailyRows(employees){
    const f=getReportFilters();
    const allRecords=state.reportRecords || state.records || [];
    const days=datesBetween(f.from,f.to);
    let filteredEmployees=employees.filter(emp => (f.department==='all' || (emp.departmentId||emp.departmentName||emp.department)===f.department) && (f.employee==='all' || (userAliases(emp).includes(f.employee) || `name:${lower(emp.name)}`===f.employee)));
    const rows=[];
    filteredEmployees.forEach(emp=>{
      const aliases=userAliases(emp);
      const recs=allRecords.filter(r=>aliases.some(a=>userAliases(r).includes(a)) && days.includes(r.dayKey || dateKeyOf(r.date) || dateKeyOf(r.checkInAt || r.checkInTime)));
      recs.forEach(rec=>{
        const st=statusOfRecord(rec);
        if(f.status==='late' && !(lateMinutesOf(rec)>0 || st.cls==='orange')) return;
        if(f.status==='no_checkout' && (rec.checkOutAt||rec.checkOutTime)) return;
        if(f.status==='absent') return;
        rows.push({emp,rec,date:rec.dayKey || dateKeyOf(rec.date) || dateKeyOf(rec.checkInAt || rec.checkInTime) || '—', status:st});
      });
      if(f.status==='absent'){
        const recordedDays=new Set(recs.map(r=>r.dayKey || dateKeyOf(r.date) || dateKeyOf(r.checkInAt || r.checkInTime)).filter(Boolean));
        days.filter(day=>!recordedDays.has(day)).forEach(day=>rows.push({emp,rec:null,date:day,status:{label:'لم يسجل',cls:'gray'}}));
      }
    });
    return rows.sort((a,b)=>String(a.date).localeCompare(String(b.date)) || displayNameOf(a.emp).localeCompare(displayNameOf(b.emp),'ar'));
  }
  function renderReports(employees){
    const f=getReportFilters();
    const departmentsList=[...new Map(employees.map(e=>[(e.departmentId||e.departmentName||e.department||'none'), e.departmentName||e.department||'—'])).entries()];
    const employeeOptions=employees.map(e=>`<option value="${esc(userAliases(e)[0] || `name:${lower(e.name)}`)}" ${f.employee===(userAliases(e)[0] || `name:${lower(e.name)}`)?'selected':''}>${esc(displayNameOf(e))}</option>`).join('');
    const rows=reportRows(employees);
    const dailyRows=reportDailyRows(employees).slice(0,150);
    const totals=rows.reduce((a,r)=>({present:a.present+r.present, absent:a.absent+r.absent, lateCount:a.lateCount+r.lateCount, lateTotal:a.lateTotal+r.lateTotal, noCheckout:a.noCheckout+r.noCheckout, workTotal:a.workTotal+r.workTotal}),{present:0,absent:0,lateCount:0,lateTotal:0,noCheckout:0,workTotal:0});
    return `<section class="attendance-report-pro">
      <div class="attendance-report-header">
        <div>
          <h2>تقارير الحضور والانصراف</h2>
          <p>ملخص احترافي للفترة المحددة مع حساب مدة التأخير بعد فترة السماح.</p>
        </div>
        <div class="attendance-report-period">${esc(formatReportRange(f))}</div>
      </div>
      <div class="attendance-report-panel">
        <div class="attendance-report-filters pro">
          <label class="attendance-field"><span>من تاريخ</span><input id="attReportFrom" type="date" value="${esc(f.from)}"></label>
          <label class="attendance-field"><span>إلى تاريخ</span><input id="attReportTo" type="date" value="${esc(f.to)}"></label>
          <label class="attendance-field"><span>القسم</span><select id="attReportDepartment"><option value="all">كل الأقسام</option>${departmentsList.map(([id,name])=>`<option value="${esc(id)}" ${f.department===id?'selected':''}>${esc(name)}</option>`).join('')}</select></label>
          <label class="attendance-field"><span>الموظف</span><select id="attReportEmployee"><option value="all">كل الموظفين</option>${employeeOptions}</select></label>
          <label class="attendance-field"><span>الحالة</span><select id="attReportStatus"><option value="all">كل الحالات</option><option value="present" ${f.status==='present'?'selected':''}>حضور</option><option value="late" ${f.status==='late'?'selected':''}>تأخير</option><option value="absent" ${f.status==='absent'?'selected':''}>لم يسجل</option><option value="no_checkout" ${f.status==='no_checkout'?'selected':''}>بدون انصراف</option></select></label>
          <div class="attendance-report-actions pro"><button class="attendance-btn" type="button" data-att-run-report>عرض التقرير</button><button class="attendance-btn secondary" type="button" data-att-export-report>تصدير Excel</button></div>
        </div>
        <div class="attendance-kpi-row">
          <div class="attendance-kpi green"><span>أيام الحضور</span><strong>${totals.present}</strong><small>إجمالي أيام الحضور</small></div>
          <div class="attendance-kpi red"><span>لم يسجل</span><strong>${totals.absent}</strong><small>أيام بدون حضور</small></div>
          <div class="attendance-kpi orange"><span>مرات التأخير</span><strong>${totals.lateCount}</strong><small>${minutesLabel(totals.lateTotal)} إجمالي التأخير</small></div>
          <div class="attendance-kpi brown"><span>بدون انصراف</span><strong>${totals.noCheckout}</strong><small>سجلات مفتوحة</small></div>
          <div class="attendance-kpi blue"><span>ساعات العمل</span><strong>${minutesLabel(totals.workTotal)}</strong><small>إجمالي الفترة</small></div>
        </div>
        <div class="attendance-report-section-title"><h3>ملخص الموظفين</h3><span>${rows.length} موظف</span></div>
        <div class="attendance-table-wrap report-wrap"><table class="attendance-table attendance-report-table" id="attendanceReportTable"><thead><tr><th>الموظف</th><th>القسم</th><th>الحالة</th><th>أيام الحضور</th><th>لم يسجل</th><th>مرات التأخير</th><th>إجمالي التأخير</th><th>بدون انصراف</th><th>إجمالي ساعات العمل</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="employee-cell"><strong>${esc(displayNameOf(r.emp))}</strong></td><td>${esc(r.emp.departmentName||r.emp.department||'—')}</td><td>${reportStatusBadge(r)}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.lateCount}</td><td>${minutesLabel(r.lateTotal)}</td><td>${r.noCheckout}</td><td>${minutesLabel(r.workTotal)}</td></tr>`).join('') || '<tr><td colspan="9" class="attendance-empty-row">لا توجد نتائج حسب الفلاتر الحالية.</td></tr>'}</tbody></table></div>
        <div class="attendance-report-section-title"><h3>تفاصيل السجلات</h3><span>${dailyRows.length ? 'آخر 150 سجل حسب الفلتر' : 'لا توجد سجلات'}</span></div>
        <div class="attendance-table-wrap report-wrap"><table class="attendance-table attendance-report-table" id="attendanceDailyReportTable"><thead><tr><th>التاريخ</th><th>الموظف</th><th>القسم</th><th>الحالة</th><th>وقت الحضور</th><th>وقت الانصراف</th><th>مدة التأخير</th><th>ساعات العمل</th></tr></thead><tbody>${dailyRows.map(r=>`<tr><td>${esc(r.date)}</td><td class="employee-cell"><strong>${esc(displayNameOf(r.emp))}</strong></td><td>${esc(r.emp.departmentName||r.emp.department||'—')}</td><td><span class="attendance-badge ${r.status.cls}">${r.status.label}</span></td><td>${r.rec?fmtTime(r.rec.checkInAt||r.rec.checkInTime):'—'}</td><td>${r.rec?fmtTime(r.rec.checkOutAt||r.rec.checkOutTime):'—'}</td><td>${r.rec?minutesLabel(lateMinutesOf(r.rec)):'—'}</td><td>${r.rec?minutesLabel(workMinutesOf(r.rec)):'—'}</td></tr>`).join('') || '<tr><td colspan="8" class="attendance-empty-row">لا توجد سجلات تفصيلية حسب الفلاتر الحالية.</td></tr>'}</tbody></table></div>
      </div>
    </section>`;
  }
  function renderPage(){
    const root=document.getElementById('attendanceRoot'); if(!root) return; if(!mainDb){ root.innerHTML='<div class="attendance-empty">اتصال Firebase غير متاح.</div>'; return; }
    if(!isAdmin()){ renderUser(root); return; }
    const employees=collectEmployees(); const settings=getSettings();
    const rows=employees.map(emp=>{ const rec=recordForEmployee(emp); const pres=presenceForEmployee(emp); return {emp,rec,pres,st:statusOfRecord(rec),on:onlineStatus(pres)}; });
    const countPresent=rows.filter(r=>r.rec && !(r.rec.checkOutAt||r.rec.checkOutTime) && r.st.cls==='green').length;
    const countLate=rows.filter(r=>r.st.cls==='orange').length; const countAbsent=rows.filter(r=>!r.rec).length; const countOnline=rows.filter(r=>r.on.cls==='green').length;
    root.innerHTML=`<div class="attendance-grid"><div class="attendance-stat green"><small>حاضر</small><strong>${countPresent}</strong></div><div class="attendance-stat orange"><small>متأخر</small><strong>${countLate}</strong></div><div class="attendance-stat red"><small>لم يسجل</small><strong>${countAbsent}</strong></div><div class="attendance-stat blue"><small>أونلاين الآن</small><strong>${countOnline}</strong></div></div><div class="attendance-layout"><div class="attendance-card"><div class="attendance-card-title"><h2>متابعة حضور اليوم</h2><span class="attendance-muted">${todayKey()}</span></div>${employees.length?`<div class="attendance-table-wrap"><table class="attendance-table"><thead><tr><th>الموظف</th><th>القسم</th><th>الحضور</th><th>الأونلاين</th><th>وقت الحضور</th><th>وقت الانصراف</th><th>مدة التأخير</th><th>آخر ظهور</th><th>آخر نشاط</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(displayNameOf(r.emp))}</td><td>${esc(r.emp.departmentName||r.emp.department||'—')}</td><td><span class="attendance-badge ${r.st.cls}">${r.st.label}</span></td><td><span class="attendance-badge ${r.on.cls}">${r.on.label}</span></td><td>${fmtTime(r.rec?.checkInAt||r.rec?.checkInTime)}</td><td>${fmtTime(r.rec?.checkOutAt||r.rec?.checkOutTime)}</td><td>${r.rec?minutesLabel(lateMinutesOf(r.rec)):'—'}</td><td>${relative(r.pres?.lastSeenAt)}</td><td>${esc(r.pres?.lastActivityType||'—')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="attendance-empty">لا توجد بيانات موظفين داخل الأقسام حتى الآن.</div>'}</div><div class="attendance-card"><div class="attendance-card-title"><h2>إعدادات الدوام</h2><span class="attendance-muted">للأدمن فقط</span></div><div class="attendance-settings-grid"><label class="attendance-field"><span>بداية الدوام</span><input id="attStartTime" type="time" value="${esc(settings.workStartTime||settings.startTime||'16:00')}"></label><label class="attendance-field"><span>نهاية الدوام</span><input id="attEndTime" type="time" value="${esc(settings.workEndTime||settings.endTime||'21:00')}"></label><label class="attendance-field"><span>فترة السماح بالدقائق</span><input id="attGraceMinutes" type="number" min="0" value="${esc(settings.graceMinutes||15)}"></label></div><div class="attendance-actions"><button class="attendance-btn" type="button" data-att-save-settings>حفظ الإعدادات</button><span class="attendance-msg" id="attendanceSettingsMsg"></span></div><p class="attendance-muted" style="margin-top:12px">لو لم يتم إنشاء إعدادات في قاعدة البيانات، يستخدم السيستم تلقائياً 4:00 م إلى 9:00 م.</p></div></div>${renderReports(employees)}`;
  }
  function renderUser(root){ const rec=myRecord(); const st=statusOfRecord(rec); root.innerHTML=`<div class="attendance-user-card"><h2>حضور اليوم</h2><p class="attendance-muted">تسجيل الحضور والانصراف داخل سيستم التسويق.</p><div class="attendance-user-status"><strong><span class="attendance-badge ${st.cls}">${st.label}</span></strong>${rec && !(rec.checkOutAt||rec.checkOutTime)?'<button class="attendance-btn danger" data-att-checkout type="button">تسجيل انصراف</button>':'<button class="attendance-btn success" data-att-checkin type="button">تسجيل حضور</button>'}</div><div class="attendance-user-times"><div class="attendance-time-box"><small>وقت الحضور</small><strong>${fmtTime(rec?.checkInAt||rec?.checkInTime)}</strong></div><div class="attendance-time-box"><small>وقت الانصراف</small><strong>${fmtTime(rec?.checkOutAt||rec?.checkOutTime)}</strong></div><div class="attendance-time-box"><small>مدة التأخير</small><strong>${rec?minutesLabel(lateMinutesOf(rec)):'—'}</strong></div><div class="attendance-time-box"><small>ساعات العمل</small><strong>${rec?minutesLabel(workMinutesOf(rec)):'—'}</strong></div></div></div>`; }
  function xlsxEscXml(value){
    return String(value ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }
  function xlsxColumnName(n){
    let s='';
    while(n>0){ const m=(n-1)%26; s=String.fromCharCode(65+m)+s; n=Math.floor((n-1)/26); }
    return s;
  }
  function xlsxCellXml(rowIndex, colIndex, value, styleIndex){
    const ref = `${xlsxColumnName(colIndex)}${rowIndex}`;
    const style = styleIndex ? ` s="${styleIndex}"` : '';
    if(typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"${style}><v>${value}</v></c>`;
    const text = xlsxEscXml(value);
    return `<c r="${ref}" t="inlineStr"${style}><is><t>${text}</t></is></c>`;
  }
  function xlsxSheetXml(rows, colWidths){
    const cols = (colWidths||[]).map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
    const sheetRows = rows.map((row, rIdx) => {
      const rowNumber = rIdx + 1;
      const cells = row.map((cell, cIdx) => {
        const value = cell && typeof cell === 'object' && !Array.isArray(cell) ? cell.v : cell;
        const styleIndex = cell && typeof cell === 'object' && !Array.isArray(cell) ? (cell.s || 0) : 0;
        return xlsxCellXml(rowNumber, cIdx + 1, value, styleIndex);
      }).join('');
      return `<row r="${rowNumber}">${cells}</row>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0" rightToLeft="1"/></sheetViews><cols>${cols}</cols><sheetData>${sheetRows}</sheetData></worksheet>`;
  }
  function xlsxWorkbookXml(){
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView rightToLeft="1"/></bookViews><sheets><sheet name="ملخص الموظفين" sheetId="1" r:id="rId1"/><sheet name="تفاصيل السجلات" sheetId="2" r:id="rId2"/></sheets></workbook>`;
  }
  function xlsxStylesXml(){
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><name val="Tajawal"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Tajawal"/></font><font><b/><sz val="14"/><color rgb="FF4A2B22"/><name val="Tajawal"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF7A4638"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF7EFE9"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9C7BD"/></left><right style="thin"><color rgb="FFD9C7BD"/></right><top style="thin"><color rgb="FFD9C7BD"/></top><bottom style="thin"><color rgb="FFD9C7BD"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="right" vertical="center" readingOrder="2"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" readingOrder="2" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="right" vertical="center" readingOrder="2"/></xf><xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyAlignment="1"><alignment horizontal="right" vertical="center" readingOrder="2" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  }
  function buildXlsxRows(){
    const f = getReportFilters();
    const employees = collectEmployees();
    const rows = reportRows(employees);
    const dailyRows = reportDailyRows(employees);
    const summary = [
      [{v:'تقرير الحضور والانصراف',s:2},{v:`الفترة: ${formatReportRange(f)}`,s:3}],
      [],
      ['الموظف','القسم','الحالة','أيام الحضور','لم يسجل','مرات التأخير','إجمالي التأخير','بدون انصراف','إجمالي ساعات العمل'].map(v=>({v,s:1})),
      ...rows.map(r=>[
        displayNameOf(r.emp),
        r.emp.departmentName || r.emp.department || '—',
        r.lateCount>0 ? 'متأخر' : (r.present>0 && r.noCheckout>0 ? 'بدون انصراف' : (r.present>0 ? 'منتظم' : 'لم يسجل')),
        r.present,
        r.absent,
        r.lateCount,
        minutesLabel(r.lateTotal),
        r.noCheckout,
        minutesLabel(r.workTotal)
      ])
    ];
    const details = [
      [{v:'تفاصيل سجلات الحضور والانصراف',s:2},{v:`الفترة: ${formatReportRange(f)}`,s:3}],
      [],
      ['التاريخ','الموظف','القسم','الحالة','وقت الحضور','وقت الانصراف','مدة التأخير','ساعات العمل'].map(v=>({v,s:1})),
      ...dailyRows.map(r=>[
        r.date,
        displayNameOf(r.emp),
        r.emp.departmentName || r.emp.department || '—',
        r.status.label,
        r.rec ? fmtTime(r.rec.checkInAt || r.rec.checkInTime) : '—',
        r.rec ? fmtTime(r.rec.checkOutAt || r.rec.checkOutTime) : '—',
        r.rec ? minutesLabel(lateMinutesOf(r.rec)) : '—',
        r.rec ? minutesLabel(workMinutesOf(r.rec)) : '—'
      ])
    ];
    return {summary, details};
  }
  function crc32(bytes){
    let table = crc32.table;
    if(!table){
      table = crc32.table = new Uint32Array(256);
      for(let i=0;i<256;i++){ let c=i; for(let k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); table[i]=c>>>0; }
    }
    let crc = 0xFFFFFFFF;
    for(let i=0;i<bytes.length;i++) crc = table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function u16(n){ return [n & 255, (n >>> 8) & 255]; }
  function u32(n){ return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
  function concatBytes(parts){ const len=parts.reduce((s,p)=>s+p.length,0); const out=new Uint8Array(len); let o=0; parts.forEach(p=>{out.set(p,o); o+=p.length;}); return out; }
  function makeXlsxZip(files){
    const enc = new TextEncoder();
    const localParts=[]; const centralParts=[]; let offset=0;
    const now=new Date(); const dosTime=((now.getHours()&31)<<11)|((now.getMinutes()&63)<<5)|Math.floor(now.getSeconds()/2); const dosDate=(((now.getFullYear()-1980)&127)<<9)|((now.getMonth()+1)<<5)|now.getDate();
    files.forEach(file=>{
      const nameBytes=enc.encode(file.name); const data=typeof file.data === 'string' ? enc.encode(file.data) : file.data; const crc=crc32(data); const size=data.length;
      const local=concatBytes([new Uint8Array([0x50,0x4b,0x03,0x04]), new Uint8Array(u16(20)), new Uint8Array(u16(0x0800)), new Uint8Array(u16(0)), new Uint8Array(u16(dosTime)), new Uint8Array(u16(dosDate)), new Uint8Array(u32(crc)), new Uint8Array(u32(size)), new Uint8Array(u32(size)), new Uint8Array(u16(nameBytes.length)), new Uint8Array(u16(0)), nameBytes, data]);
      localParts.push(local);
      const central=concatBytes([new Uint8Array([0x50,0x4b,0x01,0x02]), new Uint8Array(u16(20)), new Uint8Array(u16(20)), new Uint8Array(u16(0x0800)), new Uint8Array(u16(0)), new Uint8Array(u16(dosTime)), new Uint8Array(u16(dosDate)), new Uint8Array(u32(crc)), new Uint8Array(u32(size)), new Uint8Array(u32(size)), new Uint8Array(u16(nameBytes.length)), new Uint8Array(u16(0)), new Uint8Array(u16(0)), new Uint8Array(u16(0)), new Uint8Array(u16(0)), new Uint8Array(u32(0)), new Uint8Array(u32(offset)), nameBytes]);
      centralParts.push(central); offset += local.length;
    });
    const centralSize=centralParts.reduce((s,p)=>s+p.length,0); const centralOffset=offset;
    const end=concatBytes([new Uint8Array([0x50,0x4b,0x05,0x06]), new Uint8Array(u16(0)), new Uint8Array(u16(0)), new Uint8Array(u16(files.length)), new Uint8Array(u16(files.length)), new Uint8Array(u32(centralSize)), new Uint8Array(u32(centralOffset)), new Uint8Array(u16(0))]);
    return concatBytes([...localParts, ...centralParts, end]);
  }
  function exportReportExcel(){
    const data = buildXlsxRows();
    const files = [
      {name:'[Content_Types].xml', data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'},
      {name:'_rels/.rels', data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
      {name:'xl/workbook.xml', data:xlsxWorkbookXml()},
      {name:'xl/_rels/workbook.xml.rels', data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
      {name:'xl/styles.xml', data:xlsxStylesXml()},
      {name:'xl/worksheets/sheet1.xml', data:xlsxSheetXml(data.summary, [26,24,16,14,14,14,18,16,22])},
      {name:'xl/worksheets/sheet2.xml', data:xlsxSheetXml(data.details, [16,26,24,16,16,16,16,18])}
    ];
    const bytes = makeXlsxZip(files);
    const blob = new Blob([bytes], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`attendance-report-${todayKey()}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  document.addEventListener('click', async e=>{ const t=e.target.closest('[data-att-checkin],[data-att-checkout],[data-att-save-settings],[data-att-run-report],[data-att-export-report]'); if(!t) return; e.preventDefault(); try{ t.disabled=true; if(t.matches('[data-att-checkin]')) await checkIn(); if(t.matches('[data-att-checkout]')) await checkOut(); if(t.matches('[data-att-save-settings]')) await saveSettings(); if(t.matches('[data-att-run-report]')) { setReportFiltersFromDom(); await loadReportRecords(true); renderPage(); } if(t.matches('[data-att-export-report]')) { setReportFiltersFromDom(); await loadReportRecords(true); renderPage(); setTimeout(exportReportExcel,50); } }catch(err){ console.error(err); alert(err?.message || 'تعذر تنفيذ الإجراء.'); }finally{ t.disabled=false; } });
  function boot(){ if(!isLoggedIn || !isLoggedIn()) return; startSnapshots(); updateTopbar(); }
  window.MZJAttendance={renderPage,updateTopbar,boot,loadReportRecords};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,500)); window.addEventListener('hashchange',()=>setTimeout(()=>{boot(); if(location.hash==='#attendance')renderPage();},100)); setInterval(()=>{ if(isLoggedIn && isLoggedIn()) { boot(); updateTopbar(); if(location.hash==='#attendance') renderPage(); } },4000);
})();
