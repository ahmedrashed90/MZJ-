(function(){
  'use strict';
  const CREATIVE_MAP = (Array.isArray(window.MZJ_DEFAULT_CREATIVE_CATALOG) ? window.MZJ_DEFAULT_CREATIVE_CATALOG : []).map((item,i)=>({
    id:String(item.id||item.code||('agc-'+(i+1))),
    role:String(item.departmentRole||'montage'),
    departmentName:String(item.departmentName||({montage:'قسم المونتاج',design:'قسم التصميم',shooting:'قسم التصوير'}[item.departmentRole]||'قسم')),
    name:String(item.name||''),
    code:String(item.code||item.shortCode||('CR-'+(i+1)))
  }));
  const state={step:1,data:{month:'',name:'',start:'',end:''},days:[],created:false,creating:false,agendaId:'',campaignId:'',agendaCode:'',modalDay:null,activeTaskId:null,openTaskId:null,rawFolderResult:null};
  const AGENDA_TEMPLATE_BASE64='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';
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const ctx=()=>window.MZJGetAgendaContext?window.MZJGetAgendaContext():{departments:[],users:[],cars:[]};
  const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36);
  function todayMonth(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function monthBounds(m){const [y,mo]=m.split('-').map(Number),a=new Date(y,mo-1,1),b=new Date(y,mo,0);return [iso(a),iso(b)]}
  function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function arDay(s){return new Intl.DateTimeFormat('ar-SA',{weekday:'long'}).format(new Date(s+'T12:00:00'))}
  function arDate(s){return new Intl.DateTimeFormat('ar-SA',{year:'numeric',month:'long',day:'numeric'}).format(new Date(s+'T12:00:00'))}
  function ensureDefaults(){if(!state.data.month){state.data.month=todayMonth();[state.data.start,state.data.end]=monthBounds(state.data.month)}}
  function buildDays(){const old=new Map(state.days.map(d=>[d.date,d]));state.days=[];let d=new Date(state.data.start+'T12:00:00'),e=new Date(state.data.end+'T12:00:00');while(d<=e){const k=iso(d);state.days.push(old.get(k)||{date:k,tasks:[]});d.setDate(d.getDate()+1)}}
  function depByRole(role){const aliases={content:['المحتوى','content'],montage:['المونتاج','montage'],design:['التصميم','design'],shooting:['التصوير','shoot']};return ctx().departments.find(d=>aliases[role].some(a=>(String(d.name||d.slug||'').toLowerCase()).includes(a)))||null}
  function depUsers(dep){if(!dep)return[];const ids=[...(dep.userIds||[]),...(dep.users||[]),...(dep.members||[]),...(dep.memberUids||[])].map(x=>typeof x==='object'?(x.id||x.uid||x.email):x);return ctx().users.filter(u=>ids.includes(u.id)||ids.includes(u.uid)||ids.includes(u.email)||String(u.departmentId||u.department||'')===String(dep.id))}
  function userName(u){return u.name||u.displayName||u.username||u.email||u.id}
  function carField(c,keys){for(const k of keys){const v=c?.[k];if(v!==undefined&&v!==null&&String(v).trim())return String(v).trim()}return''}
  function carInfo(c){const key=carField(c,['Unique Spec Key','uniqueSpecKey','unique_spec_key','uniqueSpec','unique_spec','specKey','spec_key','stockSpecKey','variantKey','variant_key','groupKey','key']) || [carField(c,['carName','name','title','model']),carField(c,['statement','carStatement'])].filter(Boolean).join(' - ');const ext=carField(c,['اللون الخارجي','لون خارجي','exteriorColor','externalColor','exterior_color','outsideColor','colorExterior','bodyColor'])||'—';const inn=carField(c,['اللون الداخلي','لون داخلي','interiorColor','insideColor','interior_color','colorInterior'])||'—';const combo=[key,ext,inn].join(' + ');return{key,ext,inn,combo}}
  function availableCars(){const map=new Map();for(const c of (ctx().cars||[])){const i=carInfo(c);if(!i.key)continue;const dedupe=[i.key,i.ext,i.inn].map(v=>String(v).trim().toLowerCase()).join('||');if(!map.has(dedupe))map.set(dedupe,{id:dedupe,key:i.key,ext:i.ext,inn:i.inn,combo:i.combo,raw:c})}return[...map.values()]}
  function getTask(day,id){return day?.tasks?.find(t=>t.id===id)||null}
  function selectedContentUsers(t){const ids=new Set((t.contentUsers||[]).map(x=>x.id));return depUsers(depByRole('content')).filter(u=>ids.has(String(u.id||u.uid||u.email)))}
  function uniq(values){return [...new Set((values||[]).map(v=>String(v||'').trim()).filter(Boolean))]}
  function cleanId(value){return String(value||'').trim().replace(/[^a-zA-Z0-9_@.-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'x'}
  function roleCode(role){return ({content:'CONTENT',montage:'MONTAGE',design:'DESIGN',shooting:'SHOOTING'})[depByRoleName(role)]||String(role||'OTHER').toUpperCase()}
  function shortUser(user){const raw=String(user?.name||user?.displayName||user?.username||user?.email||user?.id||'USR').trim();const ascii=raw.replace(/[^a-zA-Z0-9]+/g,'').slice(0,8).toUpperCase();return ascii||cleanId(user?.id||raw).slice(0,8).toUpperCase()}
  function creativeCatalog(){
    const dynamic=(ctx().creatives||[]).map((c,i)=>{
      const name=String(c.name||c.title||c.label||c.creativeName||c.type||'').trim();
      if(!name)return null;
      const depName=String(c.departmentName||c.department||c.departmentLabel||c.sectionName||'').trim();
      const role=depByRoleName(c.departmentRole||c.role||depName||name);
      if(!['montage','design','shooting'].includes(role))return null;
      return {id:String(c.id||c.uid||c.code||`ctx-${i+1}`),role,departmentName:({montage:'قسم المونتاج',design:'قسم التصميم',shooting:'قسم التصوير'}[role]),name,code:String(c.code||c.shortCode||c.creativeCode||c.id||`CR-${i+1}`)};
    }).filter(Boolean);
    const map=new Map();
    [...dynamic,...CREATIVE_MAP].forEach(c=>{const key=String(c.name||'').trim().toLowerCase();if(key&&!map.has(key))map.set(key,c)});
    return [...map.values()];
  }
  function agendaPlatformCatalog(){
    const source=Array.isArray(ctx().platforms)?ctx().platforms:[];
    const fallback=['Facebook','Instagram','TikTok','YouTube','Snapchat','حملات واتساب'].map((name,index)=>({id:`agenda-platform-${index+1}`,name}));
    const list=source.length?source:fallback;
    const seen=new Set();
    return list.map((item,index)=>{
      const name=String(item?.name||item?.label||item?.title||item?.platformName||item?.id||'').trim();
      if(!name)return null;
      const key=name.toLowerCase();
      if(seen.has(key))return null;
      seen.add(key);
      return {id:String(item?.id||item?.slug||name||`platform-${index+1}`),name,raw:item};
    }).filter(Boolean);
  }
  function agendaPostTypes(platformName){
    try{
      if(typeof postTypesForPlatform==='function'){
        const configured=postTypesForPlatform(platformName)||[];
        if(Array.isArray(configured)&&configured.length)return configured.map(item=>({
          value:String(item?.value||item?.id||item?.name||item?.label||'').trim(),
          label:String(item?.label||item?.name||item?.value||item?.id||'').trim(),
          width:Number(item?.width||item?.requiredWidth||item?.dimensions?.width||0)||null,
          height:Number(item?.height||item?.requiredHeight||item?.dimensions?.height||0)||null
        })).filter(item=>item.value&&item.label);
      }
    }catch(_){ }
    return [
      {value:'post',label:'بوست',width:1080,height:1080},
      {value:'reel',label:'ريل',width:1080,height:1920},
      {value:'story',label:'ستوري',width:1080,height:1920},
      {value:'photo_post',label:'صور',width:1080,height:1080},
      {value:'hd_video',label:'فيديو',width:1920,height:1080}
    ];
  }
  function normalizeTaskPlatformPublishing(t){
    if(!t)return[];
    const raw=Array.isArray(t.platformPublishing)?t.platformPublishing:[];
    const normalized=[];
    raw.forEach(item=>{
      const platform=String(item?.platform||item?.platformName||item?.platformLabel||'').trim();
      if(!platform)return;
      const types=uniq(Array.isArray(item?.postTypes)?item.postTypes:(item?.postType?[item.postType]:[]));
      const labels=uniq(Array.isArray(item?.postTypesLabels)?item.postTypesLabels:(item?.postTypeLabel?[item.postTypeLabel]:[]));
      const available=agendaPostTypes(platform);
      const postTypes=types.filter(Boolean);
      const postTypesLabels=postTypes.map((value,index)=>labels[index]||available.find(type=>String(type.value)===String(value))?.label||value);
      const requiredDimensions=postTypes.map(value=>{
        const type=available.find(option=>String(option.value)===String(value));
        return type&&type.width&&type.height?{postType:value,width:type.width,height:type.height}:null;
      }).filter(Boolean);
      normalized.push({platform,postTypes,postTypesLabels,postType:postTypes[0]||'',postTypeLabel:postTypesLabels[0]||'',requiredDimensions,requiredDimension:requiredDimensions[0]||null});
    });
    t.platformPublishing=normalized;
    t.platforms=normalized.map(item=>item.platform);
    t.platform=t.platforms.join('، ');
    t.platformTypes=Object.fromEntries(normalized.map(item=>[item.platform,item.postTypes]));
    t.postTypes=uniq(normalized.flatMap(item=>item.postTypes));
    t.postTypeLabels=uniq(normalized.flatMap(item=>item.postTypesLabels));
    return normalized;
  }
  function agendaPublishingRecord(t,platformName,create=false){
    const publishing=normalizeTaskPlatformPublishing(t);
    let record=publishing.find(item=>String(item.platform)===String(platformName));
    if(!record&&create){
      record={platform:platformName,postTypes:[],postTypesLabels:[],postType:'',postTypeLabel:'',requiredDimensions:[],requiredDimension:null};
      publishing.push(record);
      t.platformPublishing=publishing;
      normalizeTaskPlatformPublishing(t);
      record=t.platformPublishing.find(item=>String(item.platform)===String(platformName));
    }
    return record||null;
  }
  function agendaPlatformSummary(t){
    const publishing=normalizeTaskPlatformPublishing(t);
    if(!publishing.length)return 'لم يتم اختيار منصة نشر';
    return publishing.map(item=>`${item.platform}: ${(item.postTypesLabels||[]).join(' + ')||'بدون نوع نشر'}`).join(' | ');
  }
  function renderAgendaPlatformSettings(t){
    const publishing=normalizeTaskPlatformPublishing(t);
    const selected=new Map(publishing.map(item=>[String(item.platform),item]));
    const rows=agendaPlatformCatalog().map(platform=>{
      const record=selected.get(platform.name);
      const checked=!!record;
      const selectedTypes=new Set(record?.postTypes||[]);
      const types=agendaPostTypes(platform.name);
      return `<div class="agenda-platform-row ${checked?'is-selected':''}" data-agenda-platform-row="${esc(platform.name)}">
        <label class="agenda-platform-choice"><input type="checkbox" data-agenda-platform data-task-id="${esc(t.id)}" value="${esc(platform.name)}" ${checked?'checked':''}><span>${esc(platform.name)}</span></label>
        <div class="agenda-post-types ${checked?'':'is-disabled'}">${types.length?types.map(type=>`<label class="agenda-post-type-chip ${selectedTypes.has(type.value)?'selected':''}"><input type="checkbox" data-agenda-post-type data-task-id="${esc(t.id)}" data-platform="${esc(platform.name)}" value="${esc(type.value)}" data-label="${esc(type.label)}" data-width="${type.width||''}" data-height="${type.height||''}" ${selectedTypes.has(type.value)?'checked':''} ${checked?'':'disabled'}><span>${esc(type.label)}${type.width&&type.height?` <small>${type.width}×${type.height}</small>`:''}</span></label>`).join(''):'<span class="muted">لا توجد أنواع نشر مضافة لهذه المنصة.</span>'}</div>
      </div>`;
    }).join('');
    return `<section class="agenda-publish-settings"><div class="agenda-publish-title"><div><h4>📣 المنصات وأنواع النشر</h4><p>يمكن اختيار أكثر من منصة، ولكل منصة أكثر من نوع نشر.</p></div><span>${publishing.length} منصة</span></div><div class="agenda-platform-list">${rows||'<div class="empty-state">لا توجد منصات متاحة.</div>'}</div><div class="agenda-publish-summary">${esc(agendaPlatformSummary(t))}</div></section>`;
  }
  function buildAgendaPublishSchedule(){
    const rows=[];
    state.days.forEach(day=>(day.tasks||[]).forEach((t,taskIndex)=>{
      const platformPublishing=normalizeTaskPlatformPublishing(t).map(item=>({
        platform:item.platform,
        platformLabel:item.platform,
        postTypes:[...(item.postTypes||[])],
        postTypesLabels:[...(item.postTypesLabels||[])],
        postType:item.postTypes?.[0]||'',
        postTypeLabel:item.postTypesLabels?.[0]||'',
        requiredDimensions:Array.isArray(item.requiredDimensions)?item.requiredDimensions.map(value=>({...value})) : []
      }));
      if(!platformPublishing.length)return;
      const platforms=platformPublishing.map(item=>item.platform);
      const postTypes=uniq(platformPublishing.flatMap(item=>item.postTypes||[]));
      const postTypeLabels=uniq(platformPublishing.flatMap(item=>item.postTypesLabels||[]));
      rows.push({
        date:day.date,
        publishDate:day.date,
        day:arDay(day.date),
        output:t.name,
        creative:t.name,
        creativeName:t.name,
        product:t.name,
        productCreative:t.name,
        creativeId:t.id,
        productId:t.id,
        agendaTaskId:t.id,
        creativeCode:t.code,
        source:'agenda',
        platforms,
        platform:platforms.join('، '),
        platformPublishing,
        platformTypes:Object.fromEntries(platformPublishing.map(item=>[item.platform,item.postTypes])),
        postTypes,
        postTypeLabels,
        postType:postTypes.length===1?postTypes[0]:'',
        postTypeLabel:postTypeLabels.length===1?postTypeLabels[0]:(postTypeLabels.length>1?'أنواع متعددة':''),
        order:taskIndex+1
      });
    }));
    return rows;
  }
  function creativeCount(){return state.days.reduce((n,d)=>n+(d.tasks||[]).length,0)}
  function pairRows(){
    const rows=[];
    state.days.forEach((day,dayIndex)=>(day.tasks||[]).forEach((t,taskIndex)=>{
      const add=(rec,role,departmentName,kind,optIndex)=>{
        const validContent=new Set((t.contentUsers||[]).map(x=>String(x.id)));
        uniq(rec.linkedContentUserIds).filter(id=>validContent.has(String(id))).forEach(contentUserId=>{
          const execUser=userById(rec.id)||{id:rec.id};
          const contentRecord=(t.contentUsers||[]).find(x=>String(x.id)===String(contentUserId))||{id:contentUserId,note:''};
          const contentUser=userById(contentUserId)||{id:contentUserId};
          const normalizedRole=depByRoleName(role||departmentName);
          const execId=String(execUser.uid||execUser.id||rec.id);
          const writerId=String(contentUser.uid||contentUser.id||contentUserId);
          const pairKey=[String(t.id),normalizedRole,execId,'content',writerId].join('__');
          rows.push({day,dayIndex,t,taskIndex,rec,contentRecord,execUser,contentUser,role:normalizedRole,departmentName,kind,optIndex,pairKey,execId,writerId});
        });
      };
      (t.baseUsers||[]).forEach(rec=>add(rec,t.role,t.departmentName,'base',0));
      (t.optionals||[]).forEach((o,oi)=>{const dep=(ctx().departments||[]).find(d=>String(d.id)===String(o.departmentId));(o.users||[]).forEach(rec=>add(rec,depByRoleName(dep?.name||''),dep?.name||'قسم اختياري','optional',oi))});
    }));
    return rows;
  }
  function taskCount(){return pairRows().length*2}
  function validationErrors(){
    const errors=[];
    state.days.forEach(day=>(day.tasks||[]).forEach(t=>{
      const label=`${day.date} — ${t.name}`;
      const contentIds=new Set((t.contentUsers||[]).map(x=>String(x.id)));
      const publishing=normalizeTaskPlatformPublishing(t);
      if(!publishing.length)errors.push(`${label}: اختر منصة نشر واحدة على الأقل.`);
      publishing.forEach(item=>{if(!(item.postTypes||[]).length)errors.push(`${label}: اختر نوع نشر واحدًا على الأقل لمنصة ${item.platform}.`)});
      if(!contentIds.size)errors.push(`${label}: اختر يوزرًا واحدًا على الأقل من قسم المحتوى.`);
      if(!(t.baseUsers||[]).length)errors.push(`${label}: اختر يوزرًا واحدًا على الأقل في القسم الأساسي.`);
      const used=new Set();
      const validateExec=(rec,depName)=>{
        const links=uniq(rec.linkedContentUserIds).filter(id=>contentIds.has(String(id)));
        if(!links.length)errors.push(`${label}: اربط ${userName(userById(rec.id)||{id:rec.id})} في ${depName} بيوزر محتوى واحد على الأقل.`);
        links.forEach(id=>used.add(String(id)));
      };
      (t.baseUsers||[]).forEach(rec=>validateExec(rec,t.departmentName));
      (t.optionals||[]).forEach(o=>{
        const dep=(ctx().departments||[]).find(d=>String(d.id)===String(o.departmentId));
        if(!o.departmentId && (o.users||[]).length)errors.push(`${label}: اختر القسم الاختياري.`);
        if(o.departmentId && !(o.users||[]).length)errors.push(`${label}: اختر يوزرًا واحدًا على الأقل في ${dep?.name||'القسم الاختياري'}.`);
        (o.users||[]).forEach(rec=>validateExec(rec,dep?.name||'القسم الاختياري'));
      });
      contentIds.forEach(id=>{if(!used.has(id))errors.push(`${label}: يوزر المحتوى ${userName(userById(id)||{id})} غير مربوط بأي يوزر تنفيذي.`)});
    }));
    return errors;
  }
  function ensureValidAgenda(){
    if(!creativeCount())return ['أضف كرييتيفًا واحدًا على الأقل.'];
    return validationErrors();
  }
  function taskHasAnySelection(t){
    if(!t)return false;
    if((t.contentUsers||[]).length||(t.baseUsers||[]).length||(t.carIds||[]).length||normalizeTaskPlatformPublishing(t).length)return true;
    return (t.optionals||[]).some(o=>o.departmentId||(o.users||[]).length);
  }

  function userById(id){const sid=String(id||'');return (ctx().users||[]).find(u=>[u.id,u.uid,u.email,u.emailLower].some(v=>String(v||'')===sid))||null}
  function selectedNames(records){return (records||[]).map(r=>userName(userById(r.id)||{id:r.id})).filter(Boolean)}
  function taskNumber(t,d){
    if(t && t.taskNo) return String(t.taskNo);
    const all=[];
    state.days.forEach(day=>(day.tasks||[]).forEach(task=>all.push({day,task})));
    const found=all.findIndex(item=>item.task===t || String(item.task?.id)===String(t?.id));
    const serial=String((found >= 0 ? found : all.length)+1).padStart(3,'0');
    const value=`${t.code}-${String(d.date||'').replaceAll('-','')}-${serial}`;
    if(t) t.taskNo=value;
    return value;
  }
  function ensureTaskNumbers(){
    state.days.forEach(day=>(day.tasks||[]).forEach(task=>taskNumber(task,day)));
  }
  function optionalSummary(t){return (t.optionals||[]).map(o=>{const dep=(ctx().departments||[]).find(d=>String(d.id)===String(o.departmentId));const names=selectedNames(o.users);return `${dep?.name||o.departmentId||'قسم اختياري'}: ${names.join('، ')||'—'}`}).join(' | ')}

  function render(){ensureDefaults();const root=document.getElementById('agendaWizardRoot');if(!root)return;root.innerHTML=`<div class="agenda-shell"><div class="agenda-stepper">${[1,2,3].map(n=>`<div class="agenda-step ${state.step===n?'active':''} ${state.step>n?'done':''}"><span class="num">${state.step>n?'✓':n}</span><span>${n===1?'بيانات الأجندة':n===2?'جدول الأيام والربط':'إنشاء الأجندة'}</span></div>`).join('')}</div>${state.step===1?renderStep1():state.step===2?renderStep2():renderStep3()}</div>`;bind();}
  function renderStep1(){return `<section class="agenda-panel"><div class="agenda-title"><i>🗓️</i><div><h2>بيانات الأجندة</h2><p>حدد الشهر وفترة النشر قبل بناء جدول الأيام.</p></div></div><div class="agenda-grid"><div class="agenda-field"><label>الشهر</label><input id="agMonth" class="agenda-input" type="month" value="${state.data.month}"></div><div class="agenda-field"><label>اسم الأجندة</label><input id="agName" class="agenda-input" value="${esc(state.data.name)}" placeholder="مثال: أجندة أغسطس 2026"></div><div class="agenda-field"><label>بداية النشر</label><input id="agStart" class="agenda-input" type="date" value="${state.data.start}"></div><div class="agenda-field"><label>نهاية النشر</label><input id="agEnd" class="agenda-input" type="date" value="${state.data.end}"></div></div><div class="agenda-actions"><span></span><button class="agenda-btn primary" id="agNext1">التالي: جدول الأيام والربط ←</button></div></section>`}
  function renderStep2(){return `<section class="agenda-panel"><div class="agenda-title"><i>📅</i><div><h2>جدول الأيام والربط</h2><p>أضف أكثر من كرييتيف لكل يوم، ثم اربط الأقسام واليوزرات والسيارات وحدد المنصات وأنواع النشر.</p></div></div><div class="agenda-days">${state.days.map(d=>`<div class="agenda-day"><strong>${arDay(d.date)}</strong><span>${arDate(d.date)}</span><div class="agenda-tags">${d.tasks.length?d.tasks.map(t=>`<span class="agenda-tag">${esc(t.name)}${normalizeTaskPlatformPublishing(t).length?` · ${normalizeTaskPlatformPublishing(t).length} منصة`:''}</span>`).join(''):'<span>لا توجد كرييتيفات</span>'}</div><button class="agenda-btn light" data-open-day="${d.date}">إضافة / تعديل الربط</button></div>`).join('')}</div><div class="agenda-actions"><button class="agenda-btn light" id="agBack1">السابق</button><button class="agenda-btn primary" id="agNext2">التالي: المراجعة والإنشاء ←</button></div></section>`}
  function renderStep3(){const rows=state.days.flatMap(d=>d.tasks.map(t=>({d,t})));const pairs=pairRows();return `<section class="agenda-panel"><div class="agenda-title"><i>🚀</i><div><h2>مراجعة وإنشاء الأجندة</h2><p>راجع البيانات ثم أنشئ الأجندة. يتم إنشاء Task Template وتاسك تنفيذ مستقلين لكل علاقة.</p></div></div><div class="agenda-summary"><div class="agenda-stat"><span>الأيام</span><strong>${state.days.length}</strong></div><div class="agenda-stat"><span>الأيام المستخدمة</span><strong>${state.days.filter(d=>d.tasks.length).length}</strong></div><div class="agenda-stat"><span>الكرييتيفات</span><strong>${creativeCount()}</strong></div><div class="agenda-stat"><span>العلاقات</span><strong>${pairs.length}</strong></div><div class="agenda-stat"><span>إجمالي التاسكات</span><strong>${taskCount()}</strong></div></div><div class="agenda-review-list">${rows.length?rows.map(x=>`<div class="agenda-review-row"><span>${arDay(x.d.date)}</span><span>${x.d.date}</span><strong>${esc(x.t.name)}</strong><span>${esc(x.t.code)}</span><small>${esc(agendaPlatformSummary(x.t))}</small></div>`).join(''):'<div class="empty-state">لم تتم إضافة تاسكات.</div>'}</div>${state.created?`<div class="agenda-created">تم إنشاء الأجندة بنجاح. كود الأجندة: ${esc(state.agendaCode||state.agendaId)}</div>`:''}<div class="agenda-actions"><button class="agenda-btn light" id="agBack2">السابق</button><div><button class="agenda-btn light" id="agRawFolders" ${state.created?'':'disabled'}>📁 إنشاء فولدرات الخام</button><button class="agenda-btn light" id="agZip" ${state.created?'':'disabled'}>⬇ تحميل شيتات العلاقات ZIP</button><button class="agenda-btn primary" id="agCreate" ${(state.created||state.creating)?'disabled':''}>${state.creating?'جاري الإنشاء...':'🚀 إنشاء الأجندة'}</button></div></div></section>`}
  function taskCard(t){
    const contentUsers=depUsers(depByRole('content')),baseUsers=depUsers(depByRole(t.role));
    const carLabels=(t.carIds||[]).map(id=>availableCars().find(c=>c.id===id)).filter(Boolean);
    const open=state.openTaskId===t.id;
    const selectedTotal=(t.contentUsers||[]).length+(t.baseUsers||[]).length+(t.optionals||[]).reduce((n,o)=>n+(o.users||[]).length,0);
    const selectedPlatforms=normalizeTaskPlatformPublishing(t).length;
    const touched=taskHasAnySelection(t);
    return `<article class="agenda-task-card ${state.activeTaskId===t.id?'active-task':''} ${open?'is-open':'is-collapsed'} ${touched?'has-selection':'no-selection'}" data-task="${t.id}">
      <div class="agenda-task-head" data-toggle-task="${t.id}" title="اضغط لفتح أو إغلاق الكرييتيف">
        <span class="agenda-accordion-icon">${open?'⌃':'⌄'}</span>
        <div class="agenda-task-title"><h3>${esc(t.name)}</h3><small>${esc(t.departmentName)} · ${selectedTotal} يوزر · ${carLabels.length} سيارة · ${selectedPlatforms} منصة</small><span class="agenda-task-state">${touched?'تم بدء الاختيارات':'لم يتم اختيار أي بيانات بعد'}</span></div>
        <span class="agenda-code">${esc(t.code)}</span>
        <button class="agenda-btn light compact" data-open-car-picker="${t.id}">🚗 اختيار السيارات</button>
        <button class="agenda-delete agenda-delete-task" data-delete-task="${t.id}" title="حذف الكرييتيف">🗑 حذف الكرييتيف</button>
      </div>
      <div class="agenda-task-body" ${open?'':'hidden'}>
        <div class="agenda-role-grid">
          <div class="agenda-role"><h4>📝 قسم المحتوى</h4>${renderUsers(contentUsers,t,'content')}</div>
          <div class="agenda-role"><h4>🎯 القسم الأساسي — ${esc(t.departmentName)}</h4>${renderUsers(baseUsers,t,'base')}</div>
          <div class="agenda-role optional-role"><div class="agenda-role-title"><h4>🧩 الأقسام الاختيارية</h4><button class="agenda-btn light compact" data-add-optional="${t.id}">＋ إضافة قسم</button></div>${(t.optionals||[]).map((o,i)=>renderOptional(t,o,i)).join('')||'<div class="empty-state">لا توجد أقسام اختيارية.</div>'}</div>
        </div>
        ${renderAgendaPlatformSettings(t)}
        <div class="agenda-selected-cars"><h4>🚗 السيارات المختارة لهذا التاسك</h4><div class="agenda-tags">${carLabels.length?carLabels.map(c=>`<span class="agenda-tag">${esc(c.combo)}</span>`).join(''):'<span class="muted">لم يتم اختيار سيارات.</span>'}</div></div>
      </div>
    </article>`
  }
  function renderUsers(list,t,kind,optIndex){
    const selected=kind==='content'?(t.contentUsers||[]):kind==='base'?(t.baseUsers||[]):(t.optionals?.[optIndex]?.users||[]);
    const contentSelected=selectedContentUsers(t);
    if(!list.length)return '<div class="empty-state">لا يوجد يوزرات بالقسم.</div>';
    return list.map(u=>{
      const id=String(u.id||u.uid||u.email),hit=selected.find(x=>String(x.id)===id);
      const linkHtml=(kind==='base'||kind==='optional')&&hit?`<div class="agenda-content-links"><label>ربط مع يوزرات قسم المحتوى</label>${contentSelected.length?contentSelected.map(cu=>{const cid=String(cu.id||cu.uid||cu.email);return `<label class="agenda-link-chip"><input type="checkbox" data-link-content="1" data-task-id="${t.id}" data-user-kind="${kind}" ${optIndex!=null?`data-opt-index="${optIndex}"`:''} data-user-id="${esc(id)}" value="${esc(cid)}" ${(hit.linkedContentUserIds||[]).includes(cid)?'checked':''}><span>${esc(userName(cu))}</span></label>`}).join(''):'<div class="agenda-link-warning">اختر يوزر واحدًا على الأقل من قسم المحتوى أولًا.</div>'}</div>`:'';
      return `<div class="agenda-user ${hit?'selected':''}"><label class="agenda-user-line"><input type="checkbox" data-user-kind="${kind}" data-task-id="${t.id}" ${optIndex!=null?`data-opt-index="${optIndex}"`:''} value="${esc(id)}" ${hit?'checked':''}><span>${esc(userName(u))}</span></label>${hit?`<textarea class="agenda-textarea agenda-user-note" data-note-kind="${kind}" data-task-id="${t.id}" ${optIndex!=null?`data-opt-index="${optIndex}"`:''} data-user-id="${esc(id)}" placeholder="ملاحظة اليوزر التي ستظهر له">${esc(hit.note||'')}</textarea>${linkHtml}`:''}</div>`
    }).join('')
  }
  function renderOptional(t,o,i){
    const dep=ctx().departments.find(d=>String(d.id)===String(o.departmentId));
    const excluded=[depByRole('content')?.id,depByRole(t.role)?.id].map(String);
    return `<div class="agenda-optional-card"><div class="agenda-optional-head"><select class="agenda-select" data-opt-dep="${t.id}" data-opt-index="${i}"><option value="">اختر القسم الاختياري</option>${ctx().departments.filter(d=>!excluded.includes(String(d.id))).map(d=>`<option value="${esc(d.id)}" ${String(d.id)===String(o.departmentId)?'selected':''}>${esc(d.name||d.id)}</option>`).join('')}</select><button class="agenda-delete" data-remove-opt="${t.id}" data-opt-index="${i}">🗑</button></div>${dep?renderUsers(depUsers(dep),t,'optional',i):'<div class="empty-state">اختر القسم لعرض اليوزرات.</div>'}</div>`
  }
  function renderModal(date){
    state.modalDay=date;
    const day=state.days.find(d=>d.date===date);
    if(!state.activeTaskId||!getTask(day,state.activeTaskId))state.activeTaskId=day.tasks[0]?.id||null;
    if(state.openTaskId&& !getTask(day,state.openTaskId))state.openTaskId=null;
    const root=document.getElementById('agendaWizardRoot');
    root.insertAdjacentHTML('beforeend',`<div class="agenda-full-modal">
      <aside class="agenda-modal-col agenda-add-panel"><div class="agenda-modal-head"><h3>➕ إضافة كرييتيف جديد</h3></div><div class="agenda-field"><label>نوع الكرييتيف</label><select id="agCreative" class="agenda-select"><option value="">اختر النوع</option>${['قسم المونتاج','قسم التصميم','قسم التصوير'].map(dep=>`<optgroup label="${dep}">${creativeCatalog().filter(c=>c.departmentName===dep).map(c=>`<option value="${c.id}">${esc(c.name)} — ${c.code}</option>`).join('')}</optgroup>`).join('')}</select></div><div class="agenda-field"><label>العدد</label><input id="agQty" class="agenda-input" type="number" min="1" max="20" value="1"></div><button class="agenda-btn primary wide" id="agAddCreative">＋ إضافة الكرييتيف لليوم</button><div class="agenda-info-box">القسم الأساسي يتحدد تلقائيًا حسب نوع الكرييتيف.</div><button class="agenda-btn primary wide sticky-save" id="agSaveDay">حفظ والعودة للجدول</button></aside>
      <main class="agenda-modal-col agenda-tasks-panel"><div class="agenda-modal-head sticky-head"><div><h2>📅 إضافة / تعديل الربط</h2><p>${arDay(date)} — ${arDate(date)}</p></div><div class="agenda-head-actions"><button class="agenda-btn light compact" id="agQuickAdd">＋ إضافة كرييتيف آخر</button><button class="agenda-delete" id="agCloseModal">✕</button></div></div><div id="agTaskCards">${day.tasks.length?day.tasks.map(taskCard).join(''):'<div class="empty-state large">لا توجد كرييتيفات لهذا اليوم. استخدم لوحة «إضافة كرييتيف جديد».</div>'}</div></main>
    </div>`);bindModal()
  }
  function renderCars(day,q=''){
    const task=getTask(day,state.activeTaskId),selected=new Set(task?.carIds||[]),query=String(q||'').trim().toLowerCase();
    if(!task)return '<div class="empty-state">اضغط «سيارات هذا التاسك» داخل الكرييتيف أولًا.</div>';
    return availableCars().filter(c=>!query||c.combo.toLowerCase().includes(query)).map(c=>`<label class="agenda-car-card ${selected.has(c.id)?'selected':''}"><input type="checkbox" data-car-id="${esc(c.id)}" ${selected.has(c.id)?'checked':''}><div class="agenda-car-combo"><strong>${esc(c.key)}</strong><span>الخارجي: ${esc(c.ext)}</span><span>الداخلي: ${esc(c.inn)}</span></div></label>`).join('')||'<div class="empty-state">لا توجد تركيبات سيارات مطابقة.</div>'
  }
  function bind(){document.getElementById('agMonth')?.addEventListener('change',e=>{state.data.month=e.target.value;[state.data.start,state.data.end]=monthBounds(e.target.value);render()});document.getElementById('agNext1')?.addEventListener('click',()=>{state.data.name=document.getElementById('agName').value.trim();state.data.start=document.getElementById('agStart').value;state.data.end=document.getElementById('agEnd').value;if(!state.data.name||!state.data.start||!state.data.end)return alert('أكمل بيانات الأجندة.');if(state.data.end<state.data.start)return alert('نهاية النشر يجب أن تكون بعد البداية.');buildDays();state.step=2;render()});document.getElementById('agBack1')?.addEventListener('click',()=>{state.step=1;render()});document.getElementById('agNext2')?.addEventListener('click',()=>{const errors=ensureValidAgenda();if(errors.length)return alert('أكمل ربط الأجندة قبل المتابعة:\n\n'+errors.slice(0,8).join('\n'));state.step=3;render()});document.getElementById('agBack2')?.addEventListener('click',()=>{state.step=2;render()});document.querySelectorAll('[data-open-day]').forEach(b=>b.onclick=()=>{const day=state.days.find(d=>d.date===b.dataset.openDay);state.activeTaskId=day?.tasks?.[0]?.id||null;state.openTaskId=day?.tasks?.[0]?.id||null;renderModal(b.dataset.openDay)});document.getElementById('agCreate')?.addEventListener('click',createAgenda);document.getElementById('agZip')?.addEventListener('click',downloadZip);document.getElementById('agRawFolders')?.addEventListener('click',createRawFolders)}
  function bindModal(){
    const day=state.days.find(d=>d.date===state.modalDay);
    const close=()=>{document.querySelector('.agenda-full-modal')?.remove()};
    document.getElementById('agCloseModal').onclick=close;document.getElementById('agSaveDay').onclick=()=>{close();render()};
    const addCreative=()=>{const c=creativeCatalog().find(x=>x.id===document.getElementById('agCreative').value),qty=Math.max(1,parseInt(document.getElementById('agQty').value||1));if(!c)return alert('اختر نوع الكرييتيف.');for(let i=0;i<qty;i++){const id=uid();day.tasks.push({id,name:c.name,code:c.code,role:c.role,departmentName:c.departmentName,contentUsers:[],baseUsers:[],optionals:[],carIds:[],platforms:[],platformPublishing:[],platformTypes:{},postTypes:[],postTypeLabels:[]});state.activeTaskId=id;state.openTaskId=id}refreshModal()};
    document.getElementById('agAddCreative').onclick=addCreative;document.getElementById('agQuickAdd').onclick=()=>document.getElementById('agCreative')?.focus();
    document.querySelectorAll('[data-toggle-task]').forEach(h=>h.onclick=e=>{if(e.target.closest('button'))return;state.openTaskId=state.openTaskId===h.dataset.toggleTask?null:h.dataset.toggleTask;refreshModal()});
    document.querySelectorAll('[data-open-car-picker]').forEach(b=>b.onclick=e=>{e.stopPropagation();openCarPicker(day,b.dataset.openCarPicker)});
    document.querySelectorAll('[data-delete-task]').forEach(b=>b.onclick=()=>{if(!confirm('حذف هذا الكرييتيف؟'))return;day.tasks=day.tasks.filter(t=>t.id!==b.dataset.deleteTask);if(state.activeTaskId===b.dataset.deleteTask)state.activeTaskId=day.tasks[0]?.id||null;if(state.openTaskId===b.dataset.deleteTask)state.openTaskId=day.tasks[0]?.id||null;refreshModal()});
    document.querySelectorAll('[data-add-optional]').forEach(b=>b.onclick=()=>{const t=getTask(day,b.dataset.addOptional);t.optionals.push({departmentId:'',users:[]});refreshModal()});
    document.querySelectorAll('[data-remove-opt]').forEach(b=>b.onclick=()=>{const t=getTask(day,b.dataset.removeOpt);t.optionals.splice(Number(b.dataset.optIndex),1);refreshModal()});
    document.querySelectorAll('[data-opt-dep]').forEach(s=>s.onchange=()=>{const t=getTask(day,s.dataset.optDep);t.optionals[Number(s.dataset.optIndex)]={departmentId:s.value,users:[]};refreshModal()});
    document.querySelectorAll('[data-user-kind]').forEach(ch=>ch.onchange=()=>{const t=getTask(day,ch.dataset.taskId),kind=ch.dataset.userKind,idx=ch.dataset.optIndex!=null?Number(ch.dataset.optIndex):null,arr=kind==='content'?t.contentUsers:kind==='base'?t.baseUsers:t.optionals[idx].users;if(ch.checked){if(!arr.some(x=>String(x.id)===String(ch.value)))arr.push({id:ch.value,note:'',linkedContentUserIds:[]})}else{const p=arr.findIndex(x=>String(x.id)===String(ch.value));if(p>=0)arr.splice(p,1);if(kind==='content'){[...(t.baseUsers||[]),...(t.optionals||[]).flatMap(o=>o.users||[])].forEach(u=>u.linkedContentUserIds=(u.linkedContentUserIds||[]).filter(id=>String(id)!==String(ch.value)))}}refreshModal()});
    document.querySelectorAll('[data-link-content]').forEach(ch=>ch.onchange=()=>{const t=getTask(day,ch.dataset.taskId),kind=ch.dataset.userKind,idx=ch.dataset.optIndex!=null?Number(ch.dataset.optIndex):null,arr=kind==='base'?t.baseUsers:t.optionals[idx].users,rec=arr.find(x=>String(x.id)===String(ch.dataset.userId));if(!rec)return;rec.linkedContentUserIds=rec.linkedContentUserIds||[];if(ch.checked&&!rec.linkedContentUserIds.includes(ch.value))rec.linkedContentUserIds.push(ch.value);if(!ch.checked)rec.linkedContentUserIds=rec.linkedContentUserIds.filter(x=>String(x)!==String(ch.value))});
    document.querySelectorAll('[data-agenda-platform]').forEach(ch=>ch.onchange=()=>{
      const t=getTask(day,ch.dataset.taskId);if(!t)return;
      const platform=ch.value;
      if(ch.checked)agendaPublishingRecord(t,platform,true);
      else{t.platformPublishing=normalizeTaskPlatformPublishing(t).filter(item=>String(item.platform)!==String(platform));normalizeTaskPlatformPublishing(t)}
      refreshModal();
    });
    document.querySelectorAll('[data-agenda-post-type]').forEach(ch=>ch.onchange=()=>{
      const t=getTask(day,ch.dataset.taskId);if(!t)return;
      const record=agendaPublishingRecord(t,ch.dataset.platform,true);if(!record)return;
      const value=String(ch.value||'').trim();
      const label=String(ch.dataset.label||value).trim();
      record.postTypes=uniq(record.postTypes||[]);
      record.postTypesLabels=Array.isArray(record.postTypesLabels)?record.postTypesLabels:[];
      if(ch.checked){
        if(!record.postTypes.includes(value)){record.postTypes.push(value);record.postTypesLabels.push(label)}
      }else{
        const index=record.postTypes.findIndex(item=>String(item)===value);
        if(index>=0){record.postTypes.splice(index,1);record.postTypesLabels.splice(index,1)}
      }
      normalizeTaskPlatformPublishing(t);
      refreshModal();
    });
    document.querySelectorAll('[data-note-kind]').forEach(n=>n.oninput=()=>{const t=getTask(day,n.dataset.taskId),kind=n.dataset.noteKind,idx=n.dataset.optIndex!=null?Number(n.dataset.optIndex):null,arr=kind==='content'?t.contentUsers:kind==='base'?t.baseUsers:t.optionals[idx].users,rec=arr.find(x=>String(x.id)===String(n.dataset.userId));if(rec)rec.note=n.value});
  }

  function openCarPicker(day,taskId){
    const task=getTask(day,taskId);if(!task)return;
    state.activeTaskId=taskId;
    const selected=new Set(task.carIds||[]);
    const modal=document.createElement('div');
    modal.className='agenda-car-picker-overlay';
    modal.innerHTML=`<div class="agenda-car-picker-dialog">
      <div class="agenda-car-picker-head"><div><h2>🚗 اختيار سيارات الكرييتيف</h2><p>${esc(task.name)} — ${esc(task.code)}</p></div><button class="agenda-delete" data-close-car-picker>✕</button></div>
      <div class="agenda-car-picker-toolbar"><input class="agenda-input" data-car-picker-search placeholder="بحث بـ Unique Spec Key أو اللون الخارجي أو الداخلي"><span class="agenda-car-count">المختار: <strong data-car-picker-count>${selected.size}</strong></span></div>
      <div class="agenda-car-picker-list" data-car-picker-list>${renderCarPickerCards(selected)}</div>
      <div class="agenda-car-picker-actions"><button class="agenda-btn light" data-cancel-car-picker>إلغاء</button><button class="agenda-btn primary" data-confirm-car-picker>تأكيد الاختيار</button></div>
    </div>`;
    document.body.appendChild(modal);
    document.body.classList.add('agenda-car-picker-open');
    const close=()=>{
      modal.remove();
      document.body.classList.remove('agenda-car-picker-open');
    };
    const list=modal.querySelector('[data-car-picker-list]');
    const count=modal.querySelector('[data-car-picker-count]');
    const bindCards=()=>list.querySelectorAll('[data-car-picker-id]').forEach(ch=>ch.onchange=()=>{if(ch.checked)selected.add(ch.dataset.carPickerId);else selected.delete(ch.dataset.carPickerId);ch.closest('.agenda-car-card')?.classList.toggle('selected',ch.checked);count.textContent=selected.size});
    bindCards();
    modal.querySelector('[data-car-picker-search]').oninput=e=>{list.innerHTML=renderCarPickerCards(selected,e.target.value);bindCards()};
    modal.querySelector('[data-close-car-picker]').onclick=close;
    modal.querySelector('[data-cancel-car-picker]').onclick=close;
    modal.querySelector('[data-confirm-car-picker]').onclick=()=>{task.carIds=[...selected];close();refreshModal()};
    modal.onclick=e=>{if(e.target===modal)close()};
  }
  function renderCarPickerCards(selected,q=''){
    const query=String(q||'').trim().toLowerCase();
    return availableCars().filter(c=>!query||c.combo.toLowerCase().includes(query)).map(c=>`<label class="agenda-car-card ${selected.has(c.id)?'selected':''}"><input type="checkbox" data-car-picker-id="${esc(c.id)}" ${selected.has(c.id)?'checked':''}><div class="agenda-car-combo"><strong>${esc(c.key)}</strong><span>الخارجي: ${esc(c.ext)}</span><span>الداخلي: ${esc(c.inn)}</span></div></label>`).join('')||'<div class="empty-state">لا توجد تركيبات سيارات مطابقة.</div>'
  }

  function refreshModal(){
    const currentModal=document.querySelector('.agenda-full-modal');
    const currentTasks=currentModal?.querySelector('#agTaskCards');
    const currentAddPanel=currentModal?.querySelector('.agenda-add-panel');
    const viewState={
      windowX:window.scrollX||0,
      windowY:window.scrollY||0,
      modalScrollTop:currentModal?.scrollTop||0,
      tasksScrollTop:currentTasks?.scrollTop||0,
      addPanelScrollTop:currentAddPanel?.scrollTop||0
    };
    currentModal?.remove();
    renderModal(state.modalDay);
    const restore=()=>{
      const nextModal=document.querySelector('.agenda-full-modal');
      const nextTasks=nextModal?.querySelector('#agTaskCards');
      const nextAddPanel=nextModal?.querySelector('.agenda-add-panel');
      if(nextModal)nextModal.scrollTop=viewState.modalScrollTop;
      if(nextTasks)nextTasks.scrollTop=viewState.tasksScrollTop;
      if(nextAddPanel)nextAddPanel.scrollTop=viewState.addPanelScrollTop;
      window.scrollTo(viewState.windowX,viewState.windowY);
    };
    restore();
    requestAnimationFrame(restore);
  }
  function buildDashboardTasks(campaignId,campaignCode){
    const out=[];
    const stamp=new Date().toISOString();
    pairRows().forEach(pair=>{
      const {day,t,rec,contentRecord,execUser,contentUser,role,departmentName,pairKey,execId,writerId}=pair;
      const cars=(t.carIds||[]).map(id=>availableCars().find(c=>c.id===id)?.combo||id);
      const baseNo=taskNumber(t,day);
      const depCode=roleCode(role);
      const templateId=`${campaignId}_TPL_${cleanId(t.id)}_${depCode}_${cleanId(execId)}_${cleanId(writerId)}`;
      const executionId=`${campaignId}_EXEC_${cleanId(t.id)}_${depCode}_${cleanId(execId)}_${cleanId(writerId)}`;
      const templateNo=`${baseNo}-CONTENT-${shortUser(contentUser)}-${depCode}-${shortUser(execUser)}`;
      const executionNo=`${baseNo}-${depCode}-${shortUser(execUser)}-${shortUser(contentUser)}`;
      const common={campaignId,campaignName:state.data.name,campaignCode,source:'agenda',agendaId:state.agendaId,agendaTaskId:t.id,creativeInstanceId:t.id,creativeId:t.code,creative:t.name,creativeName:t.name,contentType:t.name,product:t.name,publishDate:day.date,selectedCars:cars,cars,createdAt:stamp,updatedAt:stamp};
      out.push({...common,id:templateId,taskId:templateId,taskNo:templateNo,taskNumber:templateNo,structureTaskNo:templateNo,taskCode:templateNo,fullTaskCode:templateNo,taskType:'Task Template - قسم المحتوى',title:'Task Template - قسم المحتوى',name:'Task Template - قسم المحتوى',contentTemplateTask:true,taskTemplateTask:true,flowType:'template',taskTemplateFlow:'direct_content_first',departmentRole:'content',assignedDepartmentRole:'content',departmentCode:'CONTENT',assignedDepartmentCode:'CONTENT',assignedDepartmentName:'قسم المحتوى',contentSectionName:'قسم المحتوى',assignedToId:writerId,assignedToUid:contentUser.uid||writerId,assignedToName:userName(contentUser),assignedToEmail:contentUser.email||'',userId:writerId,userUid:contentUser.uid||writerId,userName:userName(contentUser),userEmail:contentUser.email||'',userIds:[writerId],userNames:[userName(contentUser)],contentWriterId:writerId,contentWriterUid:contentUser.uid||writerId,contentWriterName:userName(contentUser),contentWriterEmail:contentUser.email||'',linkedExecutionUserId:execId,linkedExecutionUserUid:execUser.uid||execId,linkedExecutionUserName:userName(execUser),linkedExecutionUserEmail:execUser.email||'',linkedExecutionDepartmentRole:role,linkedExecutionDepartmentCode:depCode,linkedExecutionDepartmentName:departmentName,contentExecutionPairKey:pairKey,linkedExecutionPairKey:pairKey,linkedExecutionPairKeys:[pairKey],linkedExecutionTaskId:executionId,requiredDate:day.date,requiredDateTime:day.date,deadline:day.date,dueDate:day.date,sectionNote:contentRecord.note||rec.note||'',departmentNote:contentRecord.note||rec.note||'',needsStructureUpload:false,structureRequest:false,structureRequestTask:false,status:'pending_task_template',state:'pending_task_template',dashboardStatusLabel:'في انتظار رفع Task Template',taskStatus:'في انتظار Task Template',waitingForTaskTemplate:true,waitingForContent:true,waitingForApproval:false,progress:0,steps:(typeof taskStepTemplate==='function'?taskStepTemplate('content'):[]),attachments:[],taskTemplate:{status:'pending',locked:false,versions:[],notes:[],linkedExecutionPairKey:pairKey}});
      const contentDeadlines={};contentDeadlines[writerId]=day.date;
      out.push({...common,id:executionId,taskId:executionId,taskNo:executionNo,taskNumber:executionNo,structureTaskNo:executionNo,taskCode:executionNo,fullTaskCode:executionNo,taskType:`تنفيذ - ${departmentName}`,title:`تنفيذ - ${departmentName}`,executionTask:true,flowType:'execution_task',departmentRole:role,assignedDepartmentRole:role,departmentCode:depCode,assignedDepartmentCode:depCode,assignedDepartmentName:departmentName,contentSectionName:departmentName,assignedToId:execId,assignedToUid:execUser.uid||execId,assignedToName:userName(execUser),assignedToEmail:execUser.email||'',userId:execId,userUid:execUser.uid||execId,userName:userName(execUser),userEmail:execUser.email||'',userIds:[execId],userNames:[userName(execUser)],upstreamRole:'content',dependencyRole:'content',upstreamUserIds:[writerId],dependsOnContentUserIds:[writerId],linkedContentWriterIds:[writerId],upstreamUserNames:[userName(contentUser)],dependsOnContentUserNames:[userName(contentUser)],linkedContentWriterNames:[userName(contentUser)],upstreamUserLabel:userName(contentUser),linkedContentUserId:writerId,linkedContentUserUid:contentUser.uid||writerId,linkedContentUserName:userName(contentUser),linkedContentUserEmail:contentUser.email||'',contentWriterId:writerId,contentWriterUid:contentUser.uid||writerId,contentWriterName:userName(contentUser),contentWriterEmail:contentUser.email||'',contentDeadlineByUser:contentDeadlines,contentExecutionPairKey:pairKey,linkedExecutionPairKey:pairKey,linkedExecutionPairKeys:[pairKey],sourceContentTemplateTaskId:templateId,linkedContentTemplateTaskId:templateId,sourceStructureRowKey:'CONTENT',requiredDate:day.date,deadline:day.date,dueDate:day.date,sectionNote:rec.note||'',departmentNote:rec.note||'',status:'waiting_task_template',state:'waiting_task_template',dashboardStatusLabel:'في انتظار اعتماد Task Template',taskStatus:'في انتظار Task Template',waitingForTaskTemplate:true,waitingForContent:true,waitingForApproval:true,waitingForApprovalLabel:'في انتظار اعتماد Task Template',progress:0,steps:(typeof taskStepTemplate==='function'?taskStepTemplate(role):[]),attachments:[],execution:{status:'waiting',waitingFor:'task_template'}});
    });
    return out;
  }
  function depByRoleName(name){const x=String(name||'').toLowerCase();if(x.includes('محتوى')||x.includes('content'))return'content';if(x.includes('مونتاج')||x.includes('montage'))return'montage';if(x.includes('تصميم')||x.includes('design'))return'design';if(x.includes('تصوير')||x.includes('shoot'))return'shooting';return'other'}
  async function createAgenda(){
    if(state.creating||state.created)return;
    const errors=ensureValidAgenda();
    if(errors.length)return alert('تعذر إنشاء الأجندة قبل استكمال الربط:\n\n'+errors.slice(0,10).join('\n'));
    const c=ctx();ensureTaskNumbers();state.creating=true;render();
    try{
      if(c.db){
        const agendaRef=c.db.collection('marketing_agendas').doc();
        const campaignRef=c.db.collection('marketing_campaigns').doc(`agenda_${agendaRef.id}`);
        state.agendaId=agendaRef.id;state.campaignId=campaignRef.id;
        state.agendaCode=`AGENDA-${state.data.month.replace('-','')}-${agendaRef.id.slice(0,6).toUpperCase()}`;
        const departmentTasks=buildDashboardTasks(state.campaignId,state.agendaCode);
        const publishSchedule=buildAgendaPublishSchedule();
        const stamp=c.serverTime?c.serverTime():new Date();
        const agendaPayload={id:state.agendaId,campaignId:state.campaignId,agendaCode:state.agendaCode,name:state.data.name,month:state.data.month,publishStart:state.data.start,publishEnd:state.data.end,status:'created',type:'agenda',days:state.days,publishSchedule,totalCreatives:creativeCount(),totalRelations:pairRows().length,totalTasks:departmentTasks.length,createdBy:c.currentUser,createdAt:stamp,updatedAt:stamp};
        const campaignPayload={id:state.campaignId,agendaId:state.agendaId,agendaCode:state.agendaCode,source:'agenda',type:'agenda',campaignName:state.data.name,campaign_name:state.data.name,name:state.data.name,campaignCode:state.agendaCode,campaign_code:state.agendaCode,campaignType:'أجندة',campaign_type:'أجندة',publishStartDate:state.data.start,publishEndDate:state.data.end,startDate:state.data.start,endDate:state.data.end,status:'active',stage:'agenda',taskCount:departmentTasks.length,departmentTasks,days:state.days,publishSchedule,createdAt:stamp,createdBy:c.currentUser,updatedAt:stamp};
        const batch=c.db.batch();batch.set(agendaRef,agendaPayload);batch.set(campaignRef,campaignPayload);await batch.commit();
      }else{state.agendaId='LOCAL-'+Date.now();state.campaignId='agenda_'+state.agendaId;state.agendaCode=`AGENDA-${state.data.month.replace('-','')}-${String(Date.now()).slice(-6)}`}
      state.created=true;state.creating=false;render();
      try{if(typeof window.renderAdminDashboard==='function')window.renderAdminDashboard()}catch(_){ }
    }catch(e){state.creating=false;render();console.error(e);alert('تعذر إنشاء الأجندة: '+(e.message||e))}
  }
  function base64ToArrayBuffer(base64){
    const binary=atob(base64);const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return bytes.buffer;
  }
  async function loadTemplateWorkbook(){
    const wb=new ExcelJS.Workbook();
    let buffer=null;
    try{
      const url=new URL('assets/templates/agenda-task-template.xlsx',document.baseURI).href;
      const res=await fetch(url,{cache:'no-store'});
      if(res.ok)buffer=await res.arrayBuffer();
    }catch(err){console.warn('Agenda template fetch failed; using embedded template.',err)}
    if(!buffer)buffer=base64ToArrayBuffer(AGENDA_TEMPLATE_BASE64);
    await wb.xlsx.load(buffer);return wb;
  }
  function setStyledValue(ws,row,label,value){ws.getCell(`A${row}`).value=label;ws.getCell(`B${row}`).value=value||'';}
  async function taskWorkbook(pair){
    const {day,t,rec,contentRecord,execUser,contentUser,role,departmentName}=pair;
    const wb=await loadTemplateWorkbook();const ws=wb.getWorksheet('Task Template')||wb.worksheets[0];
    const templateTask=buildDashboardTasks('preview','AGENDA-PREVIEW').find(x=>x.contentTemplateTask&&x.contentExecutionPairKey===pair.pairKey);
    setStyledValue(ws,4,'اسم الاجندة',state.data.name);
    setStyledValue(ws,5,'رقم التاسك',templateTask?.taskNo||taskNumber(t,day));
    setStyledValue(ws,6,'نوع المحتوى',t.name);
    setStyledValue(ws,7,'موعد تسليم التاسك',day.date);
    setStyledValue(ws,8,'ملاحظة القسم',contentRecord.note||rec.note||'');
    ws.insertRows(9,[[null,null],[null,null],[null,null],[null,null],[null,null]]);
    const copyStyle=(target,source)=>{['A','B'].forEach(col=>{ws.getCell(`${col}${target}`).style={...ws.getCell(`${col}${source}`).style};ws.getCell(`${col}${target}`).alignment={...ws.getCell(`${col}${source}`).alignment}})};
    [9,10,11,12,13].forEach(r=>copyStyle(r,8));
    setStyledValue(ws,9,'يوزر المحتوى',userName(contentUser));
    setStyledValue(ws,10,'اليوزر التنفيذي',userName(execUser));
    setStyledValue(ws,11,'القسم التنفيذي',departmentName||role);
    setStyledValue(ws,12,'الربط',`${userName(execUser)} ← ${userName(contentUser)}`);
    setStyledValue(ws,13,'السيارات',(t.carIds||[]).map(id=>availableCars().find(c=>c.id===id)?.combo||id).join('\n'));
    ws.getRow(9).height=30;ws.getRow(10).height=30;ws.getRow(11).height=30;ws.getRow(12).height=36;ws.getRow(13).height=60;
    ['B8','B9','B10','B11','B12','B13'].forEach(cell=>ws.getCell(cell).alignment={vertical:'top',horizontal:'right',wrapText:true});
    return wb.xlsx.writeBuffer();
  }
  async function downloadZip(){
    if(!state.created)return;
    const zip=new JSZip();
    try{
      ensureTaskNumbers();let exported=0;const usedNames=new Set();
      for(const pair of pairRows()){
        const buf=await taskWorkbook(pair);
        const preview=buildDashboardTasks('preview','AGENDA-PREVIEW').find(x=>x.contentTemplateTask&&x.contentExecutionPairKey===pair.pairKey);
        let base=String(preview?.taskNo||`${taskNumber(pair.t,pair.day)}-${exported+1}`).replace(/[\/:*?"<>|]/g,'-');
        let fileName=`${base}.xlsx`,copy=2;while(usedNames.has(fileName)){fileName=`${base}-${copy}.xlsx`;copy++}usedNames.add(fileName);zip.file(fileName,buf);exported++;
      }
      if(!exported)throw new Error('لا توجد علاقات صالحة لتصدير الشيتات.');
      const blob=await zip.generateAsync({type:'blob'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(state.data.name||'agenda')+'-task-templates.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    }catch(e){console.error(e);alert('تعذر تجهيز ملف ZIP: '+(e.message||e))}
  }
  function safeFolderName(value){return String(value||'').replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-+|-+$/g,'').slice(0,120)||'item'}
  async function createRawFolders(){
    if(!state.created)return;
    const creatives=[];
    state.days.forEach(day=>day.tasks.forEach((t,i)=>{const users=[];const add=(r,role)=>{const u=userById(r.id)||{};users.push({uid:u.uid||r.id,name:userName(u||{id:r.id}),department:role,folderName:safeFolderName(userName(u||{id:r.id}))})};(t.baseUsers||[]).forEach(r=>add(r,t.role));(t.optionals||[]).forEach(o=>{const dep=(ctx().departments||[]).find(d=>String(d.id)===String(o.departmentId));(o.users||[]).forEach(r=>add(r,depByRoleName(dep?.name||'')))});if(users.length)creatives.push({name:t.name,folderName:safeFolderName(`${day.date}-${t.code}-${t.id.slice(-4)}`),creativeInstanceId:t.id,creativeId:t.code,creativeIndex:i+1,creativeShortCode:t.code,cars:(t.carIds||[]).map(id=>({id,name:availableCars().find(c=>c.id===id)?.combo||id,folderName:safeFolderName(availableCars().find(c=>c.id===id)?.combo||id)})),users})}));
    if(!creatives.length)return alert('لا يوجد كرييتيف فيه يوزرات تنفيذية لإنشاء فولدرات الخام.');
    try{const payload={monthKey:state.data.month,campaignCode:state.agendaCode||`AGENDA-${state.data.month.replace('-','')}`,campaignFolderName:safeFolderName(state.data.name),campaignDisplayName:state.data.name,driveLetter:'Z:',creatives};const res=await fetch('/api/create-raw-folders',{method:'POST',headers:{'Content-Type':'application/json','x-api-token':'MZJ_RAW_SECRET_2026_CHANGE_ME'},body:JSON.stringify(payload)});const data=await res.json().catch(()=>({}));if(!res.ok||!data.ok)throw new Error(data.message||`HTTP ${res.status}`);state.rawFolderResult=data;alert('تم إنشاء فولدرات الخام بنجاح.')}catch(e){console.error(e);alert('تعذر إنشاء فولدرات الخام: '+(e.message||e))}
  }
  // Agenda v12: exact execution action persistence.
  // Agenda tasks live inside marketing_campaigns just like campaign tasks, but their IDs
  // must be updated strictly by the clicked task ID. Pair keys and linked template IDs
  // are relationships only and are never used as the identity of the task being changed.
  function agendaCampaignsList(){
    try{if(Array.isArray(window.campaigns))return window.campaigns}catch(_){ }
    try{if(typeof campaigns!=='undefined'&&Array.isArray(campaigns))return campaigns}catch(_){ }
    return [];
  }
  function agendaTaskId(task){return String(task?.id||task?.taskId||task?.docId||'').trim()}
  function agendaIsTask(task){return !!task&&String(task.source||'').toLowerCase()==='agenda'}
  function agendaLocateExactTask(taskId){
    const wanted=String(taskId||'').trim();
    if(!wanted)return null;
    for(const campaign of agendaCampaignsList()){
      const list=Array.isArray(campaign?.departmentTasks)?campaign.departmentTasks:[];
      const index=list.findIndex(task=>agendaTaskId(task)===wanted);
      if(index>=0&&agendaIsTask(list[index]))return{campaign,tasks:list,index,task:list[index]};
    }
    try{
      const task=typeof findTaskById==='function'?findTaskById(wanted):null;
      if(task&&agendaIsTask(task)){
        const campaign=agendaCampaignsList().find(item=>String(item?.id||item?.docId||'')===String(task.campaignId||''));
        if(campaign){
          const tasks=Array.isArray(campaign.departmentTasks)?campaign.departmentTasks:[];
          const index=tasks.findIndex(item=>agendaTaskId(item)===wanted);
          if(index>=0)return{campaign,tasks,index,task:tasks[index]};
        }
        return{campaign:null,tasks:[],index:-1,task};
      }
    }catch(_){ }
    return null;
  }
  function agendaClean(value){
    try{return typeof cleanFirestoreValue==='function'?cleanFirestoreValue(value):JSON.parse(JSON.stringify(value))}
    catch(_){return value}
  }
  function agendaDb(){
    try{const c=ctx();if(c?.db)return c.db}catch(_){ }
    try{if(window.mainDb)return window.mainDb}catch(_){ }
    try{if(typeof mainDb!=='undefined'&&mainDb)return mainDb}catch(_){ }
    try{if(window.db)return window.db}catch(_){ }
    return null;
  }
  function replaceAgendaCampaignInMemory(campaignId,nextCampaign){
    const replace=list=>{const i=list.findIndex(c=>String(c?.id||c?.docId||'')===String(campaignId));if(i>=0)list[i]=nextCampaign};
    try{if(Array.isArray(window.campaigns))replace(window.campaigns)}catch(_){ }
    try{if(typeof campaigns!=='undefined'&&Array.isArray(campaigns))replace(campaigns)}catch(_){ }
  }
  async function agendaUpdateTaskExact(taskId,patch={},options={}){
    const wanted=String(taskId||'').trim();
    let loc=agendaLocateExactTask(wanted);
    const db=agendaDb();
    if(!db||!wanted)throw new Error('تعذر الاتصال بقاعدة البيانات.');
    let campaign=loc?.campaign||null;
    let tasks=loc?.tasks||[];
    let index=Number(loc?.index??-1);
    if((!campaign||index<0)&&loc?.task?.campaignId){
      const snap=await db.collection(window.MZJ_CAMPAIGNS_COLLECTION||'marketing_campaigns').doc(String(loc.task.campaignId)).get();
      if(snap.exists){
        campaign={id:snap.id,...(snap.data()||{})};
        tasks=Array.isArray(campaign.departmentTasks)?campaign.departmentTasks:[];
        index=tasks.findIndex(task=>agendaTaskId(task)===wanted);
      }
    }
    if(!campaign||index<0)throw new Error('تعذر العثور على تاسك الأجندة داخل الحملة.');
    const stamp=new Date().toISOString();
    const updated=agendaClean({...tasks[index],...patch,id:tasks[index].id||wanted,taskId:tasks[index].taskId||tasks[index].id||wanted,updatedAt:stamp});
    const nextTasks=tasks.map((task,i)=>i===index?updated:task);
    const campaignId=String(campaign.id||campaign.docId||updated.campaignId||'');
    if(!campaignId)throw new Error('تعذر تحديد سجل الأجندة داخل الحملات.');
    const campaignStamp=typeof serverTime==='function'?serverTime():stamp;
    await db.collection(window.MZJ_CAMPAIGNS_COLLECTION||'marketing_campaigns').doc(campaignId).update({departmentTasks:agendaClean(nextTasks),taskCount:nextTasks.length,updatedAt:campaignStamp});
    const nextCampaign={...campaign,departmentTasks:nextTasks,taskCount:nextTasks.length,updatedAt:stamp};
    replaceAgendaCampaignInMemory(campaignId,nextCampaign);
    if(!options.silent){try{if(typeof showToast==='function')showToast('تم تحديث التاسك.')}catch(_){ }}
    return updated;
  }
  async function agendaFetchExactTask(taskId){
    const wanted=String(taskId||'').trim(),db=agendaDb(),loc=agendaLocateExactTask(wanted);
    if(!wanted||!db)throw new Error('تعذر الاتصال بقاعدة البيانات.');
    const campaignId=String(loc?.campaign?.id||loc?.campaign?.docId||loc?.task?.campaignId||'').trim();
    if(!campaignId)return loc;
    const snap=await db.collection(window.MZJ_CAMPAIGNS_COLLECTION||'marketing_campaigns').doc(campaignId).get();
    if(!snap.exists)return loc;
    const campaign={id:snap.id,...(snap.data()||{})};
    const tasks=Array.isArray(campaign.departmentTasks)?campaign.departmentTasks:[];
    const index=tasks.findIndex(task=>agendaTaskId(task)===wanted);
    if(index<0)return loc;
    return {campaign,tasks,index,task:tasks[index]};
  }
  async function agendaMutateTaskExact(taskId,mutator,options={}){
    const wanted=String(taskId||'').trim(),db=agendaDb(),loc=agendaLocateExactTask(wanted);
    if(!wanted||!db)throw new Error('تعذر الاتصال بقاعدة البيانات.');
    const campaignId=String(loc?.campaign?.id||loc?.campaign?.docId||loc?.task?.campaignId||'').trim();
    if(!campaignId)throw new Error('تعذر تحديد سجل الأجندة داخل الحملات.');
    const ref=db.collection(window.MZJ_CAMPAIGNS_COLLECTION||'marketing_campaigns').doc(campaignId);
    let result=null;
    const applyMutation=async(snap,writer)=>{
      if(!snap.exists)throw new Error('تعذر العثور على سجل الأجندة.');
      const campaign={id:snap.id,...(snap.data()||{})};
      const tasks=Array.isArray(campaign.departmentTasks)?campaign.departmentTasks:[];
      const index=tasks.findIndex(task=>agendaTaskId(task)===wanted&&agendaIsTask(task));
      if(index<0)throw new Error('تعذر العثور على تاسك الأجندة داخل الحملة.');
      const current=tasks[index];
      const patch=await mutator({...current},{campaign,tasks,index});
      if(!patch||typeof patch!=='object')throw new Error('تعذر تجهيز تحديث تاسك الأجندة.');
      const stamp=new Date().toISOString();
      const updated=agendaClean({...current,...patch,id:current.id||wanted,taskId:current.taskId||current.id||wanted,updatedAt:stamp});
      const nextTasks=tasks.map((task,i)=>i===index?updated:task);
      const campaignStamp=typeof serverTime==='function'?serverTime():stamp;
      const payload={departmentTasks:agendaClean(nextTasks),taskCount:nextTasks.length,updatedAt:campaignStamp};
      if(writer)writer.update(ref,payload);else await ref.update(payload);
      result={updated,nextCampaign:{...campaign,departmentTasks:nextTasks,taskCount:nextTasks.length,updatedAt:stamp}};
    };
    if(typeof db.runTransaction==='function'){
      await db.runTransaction(async tx=>{const snap=await tx.get(ref);await applyMutation(snap,tx)});
    }else{
      const snap=await ref.get();await applyMutation(snap,null);
    }
    if(result?.nextCampaign)replaceAgendaCampaignInMemory(campaignId,result.nextCampaign);
    if(!options.silent){try{if(typeof showToast==='function')showToast('تم تحديث التاسك.')}catch(_){ }}
    return result?.updated||null;
  }
  function agendaReviewApprovalOrder(task,stageIndex){
    const approvals=agendaApprovalIndices(task),order=approvals.indexOf(Number(stageIndex));
    return order>=0?order+1:0;
  }
  function agendaResolveReviewStage(task,record){
    const steps=agendaWorkflowSteps(task),approvals=agendaApprovalIndices(task);
    const storedOrder=Number(record?.reviewApprovalOrder||0);
    let stageIndex=storedOrder>0?approvals[storedOrder-1]:Number(record?.reviewStageIndex);
    if(!Number.isInteger(stageIndex)||!steps[stageIndex]?.adminOnly)stageIndex=-1;
    if(stageIndex>=0&&steps[stageIndex].done){
      const next=approvals.find(index=>!steps[index]?.done);
      if(next!=null)stageIndex=next;
    }
    if(stageIndex<0){
      const next=approvals.find(index=>!steps[index]?.done);
      if(next!=null)stageIndex=next;
    }
    return {steps,approvals,stageIndex,approvalOrder:stageIndex>=0?approvals.indexOf(stageIndex)+1:0};
  }
  function agendaIdentity(value){return String(value||'').trim().toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ـ/g,'').replace(/[^\u0600-\u06FFa-z0-9@._-]+/g,'')}
  function agendaCurrentUserOwns(task){
    try{if(typeof isCurrentUserAdmin==='function'&&isCurrentUserAdmin())return true}catch(_){ }
    try{if(typeof currentUserMatchesTaskExact==='function'&&currentUserMatchesTaskExact(task))return true}catch(_){ }
    const current=[];
    try{const u=typeof getCurrentUser==='function'?(getCurrentUser()||{}):{};current.push(u.id,u.uid,u.email,u.emailLower,u.name,u.displayName,u.username)}catch(_){ }
    try{const a=window.mainAuth?.currentUser||window.auth?.currentUser||{};current.push(a.uid,a.email,a.displayName)}catch(_){ }
    try{current.push(localStorage.getItem('mzj_login_email'),localStorage.getItem('mzj_user_email'))}catch(_){ }
    const owners=[task?.assignedToId,task?.assignedToUid,task?.assignedToEmail,task?.assignedToName,task?.userId,task?.userUid,task?.userEmail,task?.userName,task?.userIds,task?.userNames].flat(Infinity);
    const me=new Set(current.map(agendaIdentity).filter(Boolean));
    return owners.map(agendaIdentity).filter(Boolean).some(key=>me.has(key));
  }
  function refreshAgendaTaskViews(){
    try{if(typeof refreshOpenTaskModal==='function')refreshOpenTaskModal()}catch(_){ }
    try{if(typeof renderUserDashboard==='function')renderUserDashboard()}catch(_){ }
    try{if(typeof renderAdminDashboard==='function')renderAdminDashboard()}catch(_){ }
    try{if(typeof renderTasksPage==='function')renderTasksPage()}catch(_){ }
    try{if(typeof renderCampaigns==='function')renderCampaigns()}catch(_){ }
    scheduleAgendaReleaseLabels();
  }

  function agendaIsCampaign(campaign){
    if(!campaign)return false;
    const source=String(campaign.source||campaign.type||campaign.stage||'').toLowerCase();
    const code=String(campaign.agendaCode||campaign.campaignCode||campaign.campaign_code||'').toUpperCase();
    return source==='agenda'||!!campaign.agendaId||code.startsWith('AGENDA-');
  }
  function agendaCampaignLookup(value){
    const wanted=String(value||'').trim();
    if(!wanted)return null;
    return agendaCampaignsList().find(campaign=>[
      campaign?.id,campaign?.docId,campaign?.campaignId,campaign?.agendaId,
      campaign?.campaignCode,campaign?.campaign_code,campaign?.agendaCode
    ].some(item=>String(item||'').trim()===wanted))||null;
  }
  let agendaReleasePatchFrame=0;
  function patchAgendaReleaseLabels(){
    document.querySelectorAll('[data-v704-release-campaign]').forEach(button=>{
      const campaign=agendaCampaignLookup(button.dataset.v704ReleaseCampaign||'');
      if(!agendaIsCampaign(campaign))return;
      const title=button.querySelector('span');
      const note=button.querySelector('small');
      if(title&&title.textContent!=='نقل الاجندة الى قسم النشر')title.textContent='نقل الاجندة الى قسم النشر';
      if(note&&note.textContent!=='الاجندة مكتملة 100% وجاهزة للنشر')note.textContent='الاجندة مكتملة 100% وجاهزة للنشر';
    });
  }
  function scheduleAgendaReleaseLabels(){
    if(agendaReleasePatchFrame)return;
    agendaReleasePatchFrame=requestAnimationFrame(()=>{
      agendaReleasePatchFrame=0;
      patchAgendaReleaseLabels();
    });
  }
  function agendaAttachmentFiles(task){
    try{if(typeof taskFiles==='function')return taskFiles(task)}catch(_){ }
    if(Array.isArray(task?.attachments))return task.attachments;
    if(Array.isArray(task?.files))return task.files;
    return [];
  }
  function agendaAttachmentUrl(record){
    return record?.fileUrl||record?.downloadURL||record?.downloadUrl||record?.url||'';
  }
  function agendaAttachmentName(record,fallback='ملف'){
    return record?.fileName||record?.name||record?.title||fallback;
  }
  async function uploadAgendaFinalFile(file,taskId){
    const wanted=String(taskId||'').trim();
    if(!file||!wanted)throw new Error('تعذر تحديد الملف أو تاسك الأجندة.');
    const fresh=await agendaFetchExactTask(wanted);
    const task=fresh?.task;
    if(!task||!agendaIsTask(task))throw new Error('تعذر العثور على تاسك الأجندة.');
    if(typeof uploadTaskFileToDrive!=='function')throw new Error('خدمة رفع الملفات غير متاحة.');
    try{
      if(typeof showUploadProgressToast==='function')showUploadProgressToast(0,'جاري رفع الملف النهائي',{fileName:file.name||'ملف',totalBytes:file.size||0,bytesTransferred:0,speedBps:0,percent:0,cancelable:false,status:'تم اختيار الملف وبدء الرفع'});
    }catch(_){ }
    const record=await uploadTaskFileToDrive(file,task,'final');
    record.uploadKind='final';
    record.kind='final';
    record.purpose='final';
    record.isFinal=true;
    const stamp=new Date().toISOString();
    const saved=await agendaMutateTaskExact(wanted,current=>{
      const files=agendaAttachmentFiles(current);
      return {
        attachments:[...files,record],
        finalFile:record,
        finalFileUrl:agendaAttachmentUrl(record),
        finalFileName:agendaAttachmentName(record,file.name||'ملف'),
        finalUploadedAt:stamp,
        finalSubmitted:true
      };
    },{silent:true});
    try{
      if(typeof pushAdminCampaignNotification==='function')await pushAdminCampaignNotification(wanted,'final_file_uploaded','تم رفع الملف النهائي',{icon:'📦'});
    }catch(error){console.warn('Agenda final file notification failed',error)}
    try{
      if(typeof updatePublishPrepSubmission==='function'){
        const prepId=`task_${wanted}`;
        const submissions=typeof getPublishPrepSubmissions==='function'?(getPublishPrepSubmissions()||{}):{};
        const currentPrep=submissions[prepId]||{};
        await updatePublishPrepSubmission(prepId,{
          sourceType:'agenda',
          sourceLabel:'أجندة',
          agendaId:saved?.agendaId||task.agendaId||'',
          campaignId:saved?.campaignId||task.campaignId||'',
          campaignCode:saved?.campaignCode||task.campaignCode||'',
          fileName:agendaAttachmentName(record,file.name||'ملف'),
          finalFileName:agendaAttachmentName(record,file.name||'ملف'),
          fileUrl:agendaAttachmentUrl(record),
          finalFileUrl:agendaAttachmentUrl(record),
          mimeType:record.mimeType||record.type||file.type||'',
          finalFileRecord:record,
          finalUploadedAt:stamp,
          status:currentPrep.readyForPublish?'جاهز للنشر':(currentPrep.status||'تم رفع الملف النهائي')
        });
      }
    }catch(error){console.warn('Agenda publish prep sync failed',error)}
    try{
      if(typeof showUploadProgressToast==='function')showUploadProgressToast(100,'تم رفع الملف النهائي',{fileName:agendaAttachmentName(record,file.name||'ملف'),totalBytes:file.size||record.size||0,bytesTransferred:file.size||record.size||0,speedBps:0,percent:100,cancelable:false,done:true,status:'تم الحفظ والربط بتجهيز النشر'});
      if(typeof showToast==='function')showToast('تم رفع الملف النهائي وحفظه في تاسك الأجندة.');
    }catch(_){ }
    refreshAgendaTaskViews();
    setTimeout(()=>{
      try{if(typeof window.__MZJ_OPEN_CLEAN_TASK_MODAL__==='function')window.__MZJ_OPEN_CLEAN_TASK_MODAL__(wanted)}catch(_){ }
      scheduleAgendaModalClean();
      scheduleAgendaReleaseLabels();
    },120);
    return saved;
  }

  // Agenda v22: agenda execution tasks use the same department action steps,
  // percentages and ordering rules as campaign tasks. Review-file flow is removed.
  function agendaIsAdmin(){
    try{return typeof isCurrentUserAdmin==='function'&&isCurrentUserAdmin()}catch(_){return false}
  }
  function agendaCampaignActionSteps(task){
    try{
      if(typeof taskWorkflowSteps==='function')return taskWorkflowSteps(task).map((step,index)=>({...step,index}));
    }catch(_){ }
    if(Array.isArray(task?.steps)&&task.steps.length)return task.steps.map((step,index)=>({...step,index}));
    try{
      if(typeof taskStepTemplate==='function')return taskStepTemplate(task?.departmentRole||task?.assignedDepartmentRole||'other').map((step,index)=>({...step,index}));
    }catch(_){ }
    return [];
  }
  function agendaActiveModalTaskId(){
    try{
      if(typeof activeTaskModalMeta!=='undefined'&&activeTaskModalMeta){
        const id=activeTaskModalMeta.taskId||activeTaskModalMeta.id||activeTaskModalMeta.taskKey;
        if(id)return String(id);
      }
    }catch(_){ }
    const button=document.querySelector('#taskModal [data-task-step],#taskModal [data-agenda-task-step]');
    return String(button?.dataset?.taskStep||button?.dataset?.agendaTaskStep||'');
  }
  function agendaPrepareModalButtons(modal,taskId){
    if(!modal||!taskId)return;
    modal.querySelectorAll('[data-agenda-task-step]').forEach(button=>{
      const id=String(button.dataset.agendaTaskStep||'').trim();
      if(id!==String(taskId))return;
      button.dataset.taskStep=id;
      button.removeAttribute('data-agenda-task-step');
    });
  }
  async function agendaToggleCampaignStepExact(taskId,stepIndex){
    const wanted=String(taskId||'').trim();
    const idx=Number(stepIndex);
    if(!wanted||!Number.isInteger(idx))throw new Error('تعذر تحديد إجراء التكليف.');
    return agendaMutateTaskExact(wanted,current=>{
      if(!current||!agendaIsTask(current))throw new Error('تعذر العثور على تاسك الأجندة.');
      if(!agendaIsAdmin()&&!agendaCurrentUserOwns(current))throw new Error('التاسك غير مسند لهذا الحساب.');
      const steps=agendaCampaignActionSteps(current);
      const step=steps[idx];
      if(!step)throw new Error('تعذر العثور على الإجراء المطلوب.');
      if(step.adminOnly&&!agendaIsAdmin())throw new Error('الاعتماد للأدمن فقط.');
      if(!step.done&&steps.slice(0,idx).some(item=>!item.done))throw new Error('لازم تخلص الإجراء السابق الأول.');
      if(step.done&&steps.slice(idx+1).some(item=>item.done))throw new Error('لازم ترجع الإجراءات التالية الأول.');
      step.done=!step.done;
      const progress=Math.min(100,Math.round(steps.reduce((sum,item)=>sum+(item.done?Number(item.percent||0):0),0)));
      const status=progress>=100?'done':'in_progress';
      const stamp=new Date().toISOString();
      return {
        steps,
        progress,
        status,
        deliveredAt:progress>=100?(current.deliveredAt||stamp):'',
        completedAt:progress>=100?(current.completedAt||stamp):'',
        execution:{...(current.execution||{}),steps,progress,status}
      };
    },{silent:true});
  }
  function cleanAgendaTaskModal(){
    const modal=document.getElementById('taskModal');
    if(!modal)return;
    const taskId=agendaActiveModalTaskId();
    const loc=agendaLocateExactTask(taskId);
    const task=loc?.task;
    if(!task||!agendaIsTask(task)){
      modal.classList.remove('agenda-task-modal');
      return;
    }
    modal.classList.add('agenda-task-modal');
    agendaPrepareModalButtons(modal,taskId);
    modal.querySelectorAll('.review-upload-section').forEach(node=>node.remove());
    const filesWrap=modal.querySelector('.task-files-two-cols');
    if(filesWrap&&!filesWrap.querySelector('.final-upload-section'))filesWrap.remove();
    document.getElementById('agendaTaskFileInput')?.remove();
  }
  let agendaModalCleanFrame=0;
  function scheduleAgendaModalClean(){
    if(agendaModalCleanFrame)return;
    agendaModalCleanFrame=requestAnimationFrame(()=>{
      agendaModalCleanFrame=0;
      cleanAgendaTaskModal();
    });
  }
  function installAgendaCampaignActionFlow(){
    window.addEventListener('click',event=>{
      const stepButton=event.target?.closest?.('#taskModal [data-task-step],#taskModal [data-agenda-task-step]');
      if(stepButton){
        const taskId=String(stepButton.dataset.taskStep||stepButton.dataset.agendaTaskStep||'').trim();
        const loc=agendaLocateExactTask(taskId);
        if(loc?.task&&agendaIsTask(loc.task)){
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          if(stepButton.dataset.agendaSaving==='1')return;
          const originalText=stepButton.innerHTML;
          stepButton.dataset.agendaSaving='1';
          stepButton.disabled=true;
          void (async()=>{
            try{
              await agendaToggleCampaignStepExact(taskId,stepButton.dataset.stepIndex);
              try{if(typeof showToast==='function')showToast('تم تنفيذ إجراء التكليف.')}catch(_){ }
              refreshAgendaTaskViews();
              setTimeout(()=>{scheduleAgendaModalClean();refreshAgendaTaskViews()},80);
            }catch(error){
              console.error('Agenda campaign action failed',error);
              try{if(typeof showToast==='function')showToast(error?.message||'تعذر تنفيذ الإجراء.');else alert(error?.message||'تعذر تنفيذ الإجراء.')}catch(_){ }
            }finally{
              if(stepButton.isConnected){delete stepButton.dataset.agendaSaving;stepButton.disabled=false;stepButton.innerHTML=originalText;}
            }
          })();
          return;
        }
      }
      const finalUploadButton=event.target?.closest?.('#taskModal [data-upload-task-attachment="final"]');
      if(finalUploadButton){
        const taskId=agendaActiveModalTaskId();
        const loc=agendaLocateExactTask(taskId);
        if(loc?.task&&agendaIsTask(loc.task)){
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          const input=document.getElementById('taskAttachmentInput');
          if(!input){
            try{if(typeof showToast==='function')showToast('تعذر فتح اختيار الملف.')}catch(_){ }
            return;
          }
          input.dataset.uploadKind='final';
          input.dataset.agendaTaskId=taskId;
          input.click();
          return;
        }
      }
      const reviewButton=event.target?.closest?.('#taskModal [data-upload-task-attachment="review"]');
      if(reviewButton){
        const taskId=agendaActiveModalTaskId();
        const loc=agendaLocateExactTask(taskId);
        if(loc?.task&&agendaIsTask(loc.task)){
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          scheduleAgendaModalClean();
        }
      }
    },true);
    document.addEventListener('change',event=>{
      const input=event.target;
      if(!input||input.id!=='taskAttachmentInput')return;
      const taskId=String(input.dataset.agendaTaskId||agendaActiveModalTaskId()||'').trim();
      const loc=agendaLocateExactTask(taskId);
      if(!loc?.task||!agendaIsTask(loc.task))return;
      const file=input.files?.[0]||null;
      input.value='';
      delete input.dataset.agendaTaskId;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if(!file)return;
      void uploadAgendaFinalFile(file,taskId).catch(error=>{
        console.error('Agenda final upload failed',error);
        try{
          if(typeof showUploadProgressToast==='function')showUploadProgressToast(0,'تعذر رفع الملف',{fileName:file.name||'ملف',totalBytes:file.size||0,bytesTransferred:0,speedBps:0,cancelable:false,status:error?.message||'حدث خطأ أثناء الرفع'});
          if(typeof showToast==='function')showToast(error?.message||'تعذر رفع الملف النهائي.');
          else alert(error?.message||'تعذر رفع الملف النهائي.');
        }catch(_){ }
      });
    },true);
    const observer=new MutationObserver(mutations=>{
      if(mutations.some(item=>item.target?.id==='taskModal'||item.target?.closest?.('#taskModal')||Array.from(item.addedNodes||[]).some(node=>node?.nodeType===1&&(node.id==='taskModal'||node.querySelector?.('#taskModal')))))scheduleAgendaModalClean();
      scheduleAgendaReleaseLabels();
    });
    observer.observe(document.documentElement,{subtree:true,childList:true});
    window.addEventListener('hashchange',()=>{scheduleAgendaModalClean();scheduleAgendaReleaseLabels()});
    window.MZJAgendaUpdateTaskExact=agendaUpdateTaskExact;
    window.MZJAgendaToggleTaskStep=agendaToggleCampaignStepExact;
    scheduleAgendaModalClean();
    scheduleAgendaReleaseLabels();
  }
  installAgendaCampaignActionFlow();

  window.MZJAgendaRender=render;
  window.addEventListener('hashchange',()=>{if(location.hash==='#create-agenda')render()});
})();
