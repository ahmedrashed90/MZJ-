
(function(){
  const DEFAULT_SETTINGS = {
    id:'default', enabled:true, workStartTime:'16:00', workEndTime:'21:00', startTime:'16:00', endTime:'21:00', graceMinutes:15,
    presenceHeartbeatSeconds:60, offlineAfterMinutes:10, idleAfterMinutes:5, timezone:'Asia/Riyadh'
  };
  const state = { settings:{...DEFAULT_SETTINGS}, records:[], presence:[], requests:[], unsub:[], booted:false, lastActivityAt:new Date(), currentRecord:null, popupOpen:false, renderTimer:null };
  const coll = (name) => mainDb && safeCollection ? safeCollection(name) : null;
  const esc = (v) => (typeof escapeHtml === 'function' ? escapeHtml(v) : String(v??'').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])));
  const norm = (v) => String(v ?? '').trim();
  const todayKey = () => {
    const d = new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`;
  };
  const nowIso = () => new Date().toISOString();
  const currentUser = () => (typeof getCurrentUserIdentity === 'function' ? getCurrentUserIdentity() : (JSON.parse(localStorage.getItem('mzj_user')||'{}')||{}));
  const localUser = () => { try{return JSON.parse(localStorage.getItem('mzj_user')||'{}')||{};}catch(_){return {};} };
  const userKey = (u) => norm(u?.uid || u?.id || u?.email || u?.userUid || u?.userId || u?.userEmail).toLowerCase();
  const isAdmin = () => {
    const u = localUser(); const role=norm(u.role).toLowerCase(); const dep=norm(u.department || u.departmentId).toLowerCase(); const email=norm(u.email || currentUser().email).toLowerCase();
    return ['hossamzayan10@gmail.com','mr.ahmed_rashed@outlook.sa'].includes(email) || ['admin','super_admin','management','marketing_manager','manager','owner'].includes(role) || dep === 'management';
  };
  const getSettings = () => ({...DEFAULT_SETTINGS, ...(state.settings||{})});
  const mins = (hhmm) => { const [h,m]=String(hhmm||'00:00').split(':').map(Number); return (Number.isFinite(h)?h:0)*60 + (Number.isFinite(m)?m:0); };
  const fmtTime = (value) => {
    if(!value) return '—';
    let d = value && typeof value.toDate === 'function' ? value.toDate() : new Date(value);
    if(!(d instanceof Date) || Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
  };
  const relative = (value) => {
    if(!value) return '—';
    const d = value && typeof value.toDate === 'function' ? value.toDate() : new Date(value); if(Number.isNaN(d.getTime())) return '—';
    const diff = Math.max(0, Math.round((Date.now()-d.getTime())/60000));
    if(diff < 1) return 'الآن'; if(diff === 1) return 'منذ دقيقة'; if(diff < 60) return `منذ ${diff} دقيقة`; return `منذ ${Math.round(diff/60)} ساعة`;
  };
  const docIdFor = (u=currentUser()) => `${todayKey()}_${norm(u.uid || u.id || u.email || 'user').replace(/[\/\s]+/g,'_')}`;
  function employeeFromDepartmentMember(member, dep){
    const uid = norm(member?.uid || member?.id || member?.userUid || member?.userId || '');
    const email = norm(member?.email || member?.userEmail || '');
    const name = norm(member?.name || member?.displayName || member?.username || member?.label || email || uid);
    if(!uid && !email && !name) return null;
    return { uid: uid || email, id: uid || email, email, name, displayName:name, role: member?.role || 'user', department: member?.department || dep?.id || '', departmentId: dep?.id || member?.departmentId || '', departmentName: dep?.name || member?.departmentName || member?.department || '' };
  }
  function collectEmployees(){
    const map = new Map();
    const add = (u) => { if(!u) return; const key = userKey(u) || norm(u.name).toLowerCase(); if(!key || map.has(key)) return; map.set(key,u); };
    (Array.isArray(departments)?departments:[]).forEach(dep => {
      [...(Array.isArray(dep.members)?dep.members:[]), ...(Array.isArray(dep.users)?dep.users:[])].forEach(member => add(employeeFromDepartmentMember(member, dep)));
      (Array.isArray(dep.memberUids)?dep.memberUids:[]).forEach(id => add(employeeFromDepartmentMember({uid:id,id},dep)));
      (Array.isArray(dep.memberEmails)?dep.memberEmails:[]).forEach(email => add(employeeFromDepartmentMember({email,id:email},dep)));
      (Array.isArray(dep.userIds)?dep.userIds:[]).forEach(id => add(employeeFromDepartmentMember({uid:String(id).includes('@')?'':id,email:String(id).includes('@')?id:'',id},dep)));
    });
    (Array.isArray(users)?users:[]).forEach(u => add({uid:u.uid||u.id||u.email,id:u.id||u.uid||u.email,email:u.email||'',name:u.name||u.displayName||u.username||u.email||u.id,displayName:u.displayName||u.name||'',role:u.role||'user',department:u.department||'',departmentId:u.departmentId||'',departmentName:u.departmentName||u.department||''}));
    return [...map.values()].filter(u => norm(u.name || u.email || u.uid));
  }
  function recordForEmployee(emp){
    const keys = [emp.uid, emp.id, emp.email].map(x=>norm(x).toLowerCase()).filter(Boolean);
    return state.records.find(r => keys.includes(norm(r.userUid||r.userId||r.uid).toLowerCase()) || keys.includes(norm(r.userEmail).toLowerCase())) || null;
  }
  function presenceForEmployee(emp){
    const keys = [emp.uid, emp.id, emp.email].map(x=>norm(x).toLowerCase()).filter(Boolean);
    return state.presence.find(r => keys.includes(norm(r.userUid||r.userId||r.uid).toLowerCase()) || keys.includes(norm(r.userEmail).toLowerCase())) || null;
  }
  function statusOfRecord(rec){
    if(!rec) return {label:'لم يسجل', cls:'gray'};
    if(rec.checkOutAt || rec.checkOutTime) return {label:'منصرف', cls:'gray'};
    if(rec.isLate || rec.status === 'متأخر' || rec.attendanceStatus === 'late') return {label:'متأخر', cls:'orange'};
    return {label:'حاضر', cls:'green'};
  }
  function onlineStatus(pres){
    if(!pres || !pres.lastSeenAt) return {label:'أوفلاين', cls:'red'};
    const d = pres.lastSeenAt && typeof pres.lastSeenAt.toDate === 'function' ? pres.lastSeenAt.toDate() : new Date(pres.lastSeenAt);
    const diff = Math.round((Date.now()-d.getTime())/60000);
    if(diff <= (getSettings().idleAfterMinutes || 5)) return {label:'أونلاين', cls:'green'};
    if(diff <= (getSettings().offlineAfterMinutes || 10)) return {label:'غير نشط', cls:'orange'};
    return {label:'أوفلاين', cls:'red'};
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
    trackActivity(); setInterval(updatePresence, 60000); setTimeout(updatePresence, 2000);
  }
  function afterData(){ updateTopbar(); maybeShowCheckInPopup(); if(location.hash==='#attendance') renderPage(); }
  async function checkIn(){
    const u=currentUser(); if(!u.uid && !u.id && !u.email) return alert('لم يتم التعرف على المستخدم.');
    const settings=getSettings(); const now=new Date(); const day=todayKey(); const currentMins=now.getHours()*60+now.getMinutes(); const late=currentMins > (mins(settings.workStartTime||settings.startTime)+Number(settings.graceMinutes||0));
    const data={ id:docIdFor(u), uid:u.uid||u.id||u.email, userId:u.id||u.uid||u.email, userUid:u.uid||u.id||u.email, userName:u.name||u.displayName||u.email||'مستخدم', userEmail:u.email||'', displayName:u.name||u.displayName||'', role:u.role||'', department:localUser().department||'', departmentId:localUser().departmentId||'', date:day, dayKey:day, checkInAt:nowIso(), checkInTime:nowIso(), status:late?'متأخر':'حاضر', attendanceStatus:late?'late':'present', isLate:late, lateMinutes:late?Math.max(0,currentMins-mins(settings.workStartTime||settings.startTime)-Number(settings.graceMinutes||0)):0, workStartTime:settings.workStartTime||settings.startTime, workEndTime:settings.workEndTime||settings.endTime, graceMinutes:Number(settings.graceMinutes||0), checkInSource:'marketing_system', checkInMethod:'manual_button', deviceInfo:{userAgent:navigator.userAgent, platform:navigator.platform}, userAgent:navigator.userAgent, platform:navigator.platform, lastSeenAt:nowIso(), lastActivityAt:nowIso(), createdAt:nowIso(), updatedAt:nowIso() };
    await coll(window.MZJ_ATTENDANCE_RECORDS_COLLECTION || 'attendance_records').doc(data.id).set(data,{merge:true});
    await updatePresence('تسجيل حضور'); closePopup(); updateTopbar(); renderPage();
  }
  async function checkOut(){
    const u=currentUser(); const id=docIdFor(u); const rec=state.records.find(r=>r.id===id) || state.currentRecord;
    const data={checkOutAt:nowIso(), checkOutTime:nowIso(), status:'منصرف', attendanceStatus:'checked_out', checkOutSource:'marketing_system', checkOutMethod:'manual_button', updatedAt:nowIso()};
    await coll(window.MZJ_ATTENDANCE_RECORDS_COLLECTION || 'attendance_records').doc((rec&&rec.id)||id).set(data,{merge:true});
    await updatePresence('تسجيل انصراف'); updateTopbar(); renderPage();
  }
  async function updatePresence(activity){
    if(!mainDb) return; const u=currentUser(); if(!u.uid && !u.id && !u.email) return;
    const id = norm(u.uid || u.id || u.email).replace(/[\/\s]+/g,'_');
    const data={ id, uid:u.uid||u.id||u.email, userId:u.id||u.uid||u.email, userUid:u.uid||u.id||u.email, userName:u.name||u.displayName||u.email||'مستخدم', userEmail:u.email||'', displayName:u.name||u.displayName||'', role:u.role||'', department:localUser().department||'', departmentId:localUser().departmentId||'', date:todayKey(), dayKey:todayKey(), isOnline:true, online:true, presenceStatus:'online', lastSeenAt:nowIso(), lastActivityAt:state.lastActivityAt.toISOString(), lastActivityType:activity||'فتح السيستم', lastPage:(location.hash||'#dashboard').replace('#',''), todayAttendanceId:docIdFor(u), deviceInfo:{userAgent:navigator.userAgent, platform:navigator.platform}, userAgent:navigator.userAgent, platform:navigator.platform, updatedAt:nowIso(), createdAt:nowIso() };
    try{ await coll(window.MZJ_PRESENCE_STATUS_COLLECTION || 'presence_status').doc(id).set(data,{merge:true}); }catch(e){ console.warn('presence update failed', e); }
  }
  function trackActivity(){ ['click','keydown','input','change','scroll'].forEach(ev=>document.addEventListener(ev,()=>{ state.lastActivityAt=new Date(); },{passive:true})); }
  function myRecord(){ const u=currentUser(); const keys=[u.uid,u.id,u.email].map(x=>norm(x).toLowerCase()).filter(Boolean); return state.records.find(r=>r.id===docIdFor(u) || keys.includes(norm(r.userUid||r.userId||r.uid).toLowerCase()) || keys.includes(norm(r.userEmail).toLowerCase())) || null; }
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
  function renderPage(){
    const root=document.getElementById('attendanceRoot'); if(!root) return; if(!mainDb){ root.innerHTML='<div class="attendance-empty">اتصال Firebase غير متاح.</div>'; return; }
    if(!isAdmin()){ renderUser(root); return; }
    const employees=collectEmployees(); const settings=getSettings();
    const rows=employees.map(emp=>{ const rec=recordForEmployee(emp); const pres=presenceForEmployee(emp); return {emp,rec,pres,st:statusOfRecord(rec),on:onlineStatus(pres)}; });
    const countPresent=rows.filter(r=>r.rec && !(r.rec.checkOutAt||r.rec.checkOutTime) && r.st.cls==='green').length;
    const countLate=rows.filter(r=>r.st.cls==='orange').length; const countAbsent=rows.filter(r=>!r.rec).length; const countOnline=rows.filter(r=>r.on.cls==='green').length;
    root.innerHTML=`<div class="attendance-grid"><div class="attendance-stat green"><small>حاضر</small><strong>${countPresent}</strong></div><div class="attendance-stat orange"><small>متأخر</small><strong>${countLate}</strong></div><div class="attendance-stat red"><small>لم يسجل</small><strong>${countAbsent}</strong></div><div class="attendance-stat blue"><small>أونلاين الآن</small><strong>${countOnline}</strong></div></div><div class="attendance-layout"><div class="attendance-card"><div class="attendance-card-title"><h2>متابعة حضور اليوم</h2><span class="attendance-muted">${todayKey()}</span></div>${employees.length?`<div class="attendance-table-wrap"><table class="attendance-table"><thead><tr><th>الموظف</th><th>القسم</th><th>الحضور</th><th>الأونلاين</th><th>وقت الحضور</th><th>وقت الانصراف</th><th>آخر ظهور</th><th>آخر نشاط</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.emp.name||r.emp.email||r.emp.uid)}</td><td>${esc(r.emp.departmentName||r.emp.department||'—')}</td><td><span class="attendance-badge ${r.st.cls}">${r.st.label}</span></td><td><span class="attendance-badge ${r.on.cls}">${r.on.label}</span></td><td>${fmtTime(r.rec?.checkInAt||r.rec?.checkInTime)}</td><td>${fmtTime(r.rec?.checkOutAt||r.rec?.checkOutTime)}</td><td>${relative(r.pres?.lastSeenAt)}</td><td>${esc(r.pres?.lastActivityType||'—')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="attendance-empty">لا توجد بيانات موظفين داخل الأقسام حتى الآن.</div>'}</div><div class="attendance-card"><div class="attendance-card-title"><h2>إعدادات الدوام</h2><span class="attendance-muted">للأدمن فقط</span></div><div class="attendance-settings-grid"><label class="attendance-field"><span>بداية الدوام</span><input id="attStartTime" type="time" value="${esc(settings.workStartTime||settings.startTime||'16:00')}"></label><label class="attendance-field"><span>نهاية الدوام</span><input id="attEndTime" type="time" value="${esc(settings.workEndTime||settings.endTime||'21:00')}"></label><label class="attendance-field"><span>فترة السماح بالدقائق</span><input id="attGraceMinutes" type="number" min="0" value="${esc(settings.graceMinutes||15)}"></label></div><div class="attendance-actions"><button class="attendance-btn" type="button" data-att-save-settings>حفظ الإعدادات</button><span class="attendance-msg" id="attendanceSettingsMsg"></span></div><p class="attendance-muted" style="margin-top:12px">لو لم يتم إنشاء إعدادات في قاعدة البيانات، يستخدم السيستم تلقائياً 4:00 م إلى 9:00 م.</p></div></div>`;
  }
  function renderUser(root){ const rec=myRecord(); const st=statusOfRecord(rec); root.innerHTML=`<div class="attendance-user-card"><h2>حضور اليوم</h2><p class="attendance-muted">تسجيل الحضور والانصراف داخل سيستم التسويق.</p><div class="attendance-user-status"><strong><span class="attendance-badge ${st.cls}">${st.label}</span></strong>${rec && !(rec.checkOutAt||rec.checkOutTime)?'<button class="attendance-btn danger" data-att-checkout type="button">تسجيل انصراف</button>':'<button class="attendance-btn success" data-att-checkin type="button">تسجيل حضور</button>'}</div><div class="attendance-user-times"><div class="attendance-time-box"><small>وقت الحضور</small><strong>${fmtTime(rec?.checkInAt||rec?.checkInTime)}</strong></div><div class="attendance-time-box"><small>وقت الانصراف</small><strong>${fmtTime(rec?.checkOutAt||rec?.checkOutTime)}</strong></div></div></div>`; }
  document.addEventListener('click', async e=>{ const t=e.target.closest('[data-att-checkin],[data-att-checkout],[data-att-save-settings]'); if(!t) return; e.preventDefault(); try{ t.disabled=true; if(t.matches('[data-att-checkin]')) await checkIn(); if(t.matches('[data-att-checkout]')) await checkOut(); if(t.matches('[data-att-save-settings]')) await saveSettings(); }catch(err){ console.error(err); alert(err?.message || 'تعذر تنفيذ الإجراء.'); }finally{ t.disabled=false; } });
  function boot(){ if(!isLoggedIn || !isLoggedIn()) return; startSnapshots(); updateTopbar(); }
  window.MZJAttendance={renderPage,updateTopbar,boot};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,500)); window.addEventListener('hashchange',()=>setTimeout(()=>{boot(); if(location.hash==='#attendance')renderPage();},100)); setInterval(()=>{ if(isLoggedIn && isLoggedIn()) { boot(); updateTopbar(); if(location.hash==='#attendance') renderPage(); } },4000);
})();
