(function(){
  'use strict';

  const COLLECTION = window.MZJ_PACKAGES_COLLECTION || 'marketing_car_packages';
  const DEFAULT_CATEGORIES = ['العائلية', 'الفضية', 'الذهبية', 'VIP'];
  const state = {
    packages: [],
    selectedId: '',
    selectedCategory: 'الذهبية',
    searchText: '',
    viewMode: 'cards',
    unsubscribe: null,
    listenerStarted: false,
    retryTimer: null,
    bound: false,
    loadError: ''
  };

  window.renderPackagesPage = renderPackagesPage;
  document.addEventListener('DOMContentLoaded', bindPackagesPage, { once: true });

  function renderPackagesPage(){
    bindPackagesPage();
    startListener();
    renderAll();
  }

  function bindPackagesPage(){
    if(state.bound) return;
    state.bound = true;

    document.getElementById('packagesSearchInput')?.addEventListener('input', event => {
      state.searchText = clean(event.target.value).toLowerCase();
      renderAll();
    });

    document.getElementById('packagesCategoryFilter')?.addEventListener('change', event => {
      state.selectedCategory = event.target.value || 'all';
      renderAll();
    });

    document.getElementById('packagesViewMode')?.addEventListener('change', event => {
      state.viewMode = event.target.value === 'table' ? 'table' : 'cards';
      renderAll();
    });

    document.getElementById('packagesCategoryTabs')?.addEventListener('click', event => {
      const button = event.target.closest('[data-package-category]');
      if(!button) return;
      state.selectedCategory = button.dataset.packageCategory || 'all';
      renderAll();
    });

    document.getElementById('packageCategoryInput')?.addEventListener('change', event => {
      const custom = document.getElementById('packageCustomCategoryInput');
      if(custom) custom.classList.toggle('show', event.target.value === '__custom__');
    });

    document.getElementById('packagesRefreshBtn')?.addEventListener('click', restartListener);
    document.getElementById('packagesExportPdfBtn')?.addEventListener('click', exportPdf);
    document.getElementById('packageCreateBtn')?.addEventListener('click', createPackage);
    document.getElementById('packageUpdateBtn')?.addEventListener('click', updatePackage);
    document.getElementById('packageDeleteBtn')?.addEventListener('click', deleteSelectedPackage);

    document.getElementById('packagesCards')?.addEventListener('click', event => {
      const card = event.target.closest('[data-package-id]');
      if(card) selectPackage(card.dataset.packageId || '');
    });

    document.getElementById('packagesTableBody')?.addEventListener('click', event => {
      const edit = event.target.closest('[data-package-edit]');
      if(edit){
        selectPackage(edit.dataset.packageEdit || '');
        return;
      }
      const remove = event.target.closest('[data-package-delete]');
      if(remove) deletePackage(remove.dataset.packageDelete || '');
    });
  }

  function startListener(){
    if(state.listenerStarted) return;
    if(typeof mainDb === 'undefined' || !mainDb || typeof safeCollection !== 'function'){
      state.loadError = 'جاري تهيئة اتصال Firebase...';
      renderAll();
      scheduleRetry();
      return;
    }

    state.listenerStarted = true;
    state.loadError = '';
    try{
      state.unsubscribe = safeCollection(COLLECTION).onSnapshot(snapshot => {
        state.packages = snapshot.docs.map(doc => normalizePackage(doc.id, doc.data() || {}));
        state.loadError = '';
        renderAll();
      }, error => {
        console.error('Packages listener error', error);
        state.listenerStarted = false;
        state.loadError = friendlyFirebaseError(error);
        renderAll();
      });
    }catch(error){
      console.error('Packages listener setup error', error);
      state.listenerStarted = false;
      state.loadError = friendlyFirebaseError(error);
      renderAll();
    }
  }

  function scheduleRetry(){
    if(state.retryTimer) return;
    state.retryTimer = window.setTimeout(() => {
      state.retryTimer = null;
      if(!state.listenerStarted) startListener();
    }, 800);
  }

  function restartListener(){
    try{ state.unsubscribe?.(); }catch(_){ }
    state.unsubscribe = null;
    state.listenerStarted = false;
    state.loadError = '';
    startListener();
    notify('تم تحديث بيانات الباقات.');
  }

  function normalizePackage(id, data){
    const procedures = normalizeProcedures(data);
    return {
      id,
      name: clean(data.name || data.packageName),
      category: clean(data.category || data.classification) || 'بدون تصنيف',
      price: numberValue(data.price ?? data.packageValue),
      discountPercent: numberValue(data.discountPercent ?? data.cashDiscount ?? data.discount),
      procedures,
      careItems: normalizeLines(data.careItems || data.carCareItems || data.care || data.careText),
      delivery: clean(data.delivery || data.deliveryType || firstValue(data.deliveryItems)) || 'إلى باب البيت',
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    };
  }

  function normalizeProcedures(data){
    const source = data.procedures && typeof data.procedures === 'object' && !Array.isArray(data.procedures)
      ? data.procedures
      : {};
    const legacy = Array.isArray(data.procedures) ? data.procedures.map(clean) : [];
    return {
      registration: booleanValue(source.registration ?? data.registration ?? data.registrationFees, legacy, 'رسوم التسجيل'),
      insurance: booleanValue(source.insurance ?? data.insurance, legacy, 'التأمين'),
      issuance: booleanValue(source.issuance ?? data.issuance ?? data.issuanceFees, legacy, 'رسوم الإصدار')
    };
  }

  function booleanValue(value, legacy, label){
    if(typeof value === 'boolean') return value;
    if(value !== undefined && value !== null && clean(value) !== '') return true;
    return legacy.includes(label);
  }

  function getVisiblePackages(){
    const query = state.searchText;
    return [...state.packages]
      .filter(item => state.selectedCategory === 'all' || item.category === state.selectedCategory)
      .filter(item => {
        if(!query) return true;
        return [item.name, item.category, item.price, item.discountPercent, item.delivery, ...item.careItems, ...procedureLabels(item)]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const categoryOrder = categoryRank(a.category) - categoryRank(b.category);
        if(categoryOrder !== 0) return categoryOrder;
        return a.name.localeCompare(b.name, 'ar');
      });
  }

  function renderAll(){
    if(!document.getElementById('packages')) return;
    renderCategoryControls();
    renderCards();
    renderTable();
    syncViewMode();
    syncSelectionButtons();
  }

  function renderCategoryControls(){
    const categories = getCategories();
    const tabs = document.getElementById('packagesCategoryTabs');
    if(tabs){
      tabs.innerHTML = DEFAULT_CATEGORIES.map(category => `<button class="package-category-tab${state.selectedCategory === category ? ' active' : ''}" data-package-category="${escapeHtml(category)}" type="button">${categoryIcon(category)} ${escapeHtml(category)}</button>`).join('');
    }

    const filter = document.getElementById('packagesCategoryFilter');
    if(filter){
      filter.innerHTML = `<option value="all">كل التصنيفات</option>${categories.map(category => `<option value="${escapeHtml(category)}"${state.selectedCategory === category ? ' selected' : ''}>${escapeHtml(category)}</option>`).join('')}`;
      filter.value = categories.includes(state.selectedCategory) || state.selectedCategory === 'all' ? state.selectedCategory : 'all';
    }

    const categoryInput = document.getElementById('packageCategoryInput');
    if(categoryInput && !categoryInput.dataset.ready){
      categoryInput.innerHTML = `${DEFAULT_CATEGORIES.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}<option value="__custom__">تصنيف جديد...</option>`;
      categoryInput.dataset.ready = '1';
      categoryInput.value = 'الذهبية';
    }
  }

  function renderCards(){
    const container = document.getElementById('packagesCards');
    const title = document.getElementById('packagesCurrentTitle');
    const count = document.getElementById('packagesCount');
    if(!container) return;

    const visible = getVisiblePackages();
    if(title) title.textContent = state.selectedCategory === 'all' ? 'الباقات — كل التصنيفات' : `الباقات — التصنيف: ${state.selectedCategory}`;
    if(count) count.textContent = `${visible.length} باقة`;

    if(state.loadError){
      container.innerHTML = `<div class="empty-state packages-empty">${escapeHtml(state.loadError)}</div>`;
      return;
    }

    if(!visible.length){
      container.innerHTML = '<div class="empty-state packages-empty">لا توجد باقات في التصنيف الحالي. استخدم نموذج معلومات الباقة لإنشاء أول باقة.</div>';
      return;
    }

    container.innerHTML = visible.map(item => `
      <article class="package-card${state.selectedId === item.id ? ' selected' : ''}" data-package-id="${escapeHtml(item.id)}" tabindex="0">
        <div class="package-card-top">
          <h3>${escapeHtml(item.name || 'باقة بدون اسم')}</h3>
          <div class="package-card-price">${formatNumber(item.price)} <small>ر.س</small></div>
        </div>
        <div class="package-card-discount"><span>خصم نقدي</span><strong>${formatNumber(item.discountPercent)}%</strong></div>
        ${renderCardSection('▤', 'الإجراءات المشمولة', procedureLabels(item))}
        ${renderCardSection('🚗', 'العناية بالسيارة', item.careItems)}
        <div class="package-card-section"><h4><span>🚚</span><span>التوصيل</span></h4><div class="package-card-delivery">${escapeHtml(item.delivery || '—')}</div></div>
        <div class="package-card-footer">◉ التصنيف: ${escapeHtml(item.category)}</div>
      </article>`).join('');
  }

  function renderCardSection(icon, title, rows){
    const items = rows.length ? rows : ['لا توجد بيانات'];
    return `<div class="package-card-section"><h4><span>${icon}</span><span>${escapeHtml(title)}</span></h4><ul>${items.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul></div>`;
  }

  function renderTable(){
    const body = document.getElementById('packagesTableBody');
    if(!body) return;
    const visible = getVisiblePackages();

    if(state.loadError){
      body.innerHTML = `<tr><td colspan="8"><div class="empty-state">${escapeHtml(state.loadError)}</div></td></tr>`;
      return;
    }

    if(!visible.length){
      body.innerHTML = '<tr><td colspan="8"><div class="empty-state">لا توجد باقات لعرضها.</div></td></tr>';
      return;
    }

    body.innerHTML = visible.map(item => `
      <tr>
        <td>${escapeHtml(item.category)}</td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${formatNumber(item.price)} ر.س</td>
        <td>${formatNumber(item.discountPercent)}%</td>
        <td><small>${procedureLabels(item).map(escapeHtml).join('<br>') || '—'}</small></td>
        <td><small>${item.careItems.map(escapeHtml).join('<br>') || '—'}</small></td>
        <td>${escapeHtml(item.delivery || '—')}</td>
        <td><div class="packages-table-actions"><button class="btn btn-light" data-package-edit="${escapeHtml(item.id)}" type="button">تعديل</button><button class="btn package-delete-btn" data-package-delete="${escapeHtml(item.id)}" type="button">حذف</button></div></td>
      </tr>`).join('');
  }

  function syncViewMode(){
    const cards = document.getElementById('packagesCards');
    const table = document.getElementById('packagesTableView');
    const select = document.getElementById('packagesViewMode');
    if(cards) cards.classList.toggle('hidden', state.viewMode === 'table');
    if(table) table.classList.toggle('show', state.viewMode === 'table');
    if(select) select.value = state.viewMode;
  }

  function selectPackage(id){
    const item = state.packages.find(row => row.id === id);
    if(!item) return;
    state.selectedId = item.id;
    setValue('packageNameInput', item.name);
    setCategoryValue(item.category);
    setValue('packagePriceInput', item.price);
    setValue('packageDiscountInput', item.discountPercent);
    setChecked('packageRegistrationInput', item.procedures.registration);
    setChecked('packageInsuranceInput', item.procedures.insurance);
    setChecked('packageIssuanceInput', item.procedures.issuance);
    setValue('packageCareInput', item.careItems.join('\n'));
    setDelivery(item.delivery);
    const label = document.getElementById('packageSelectedLabel');
    if(label){
      label.textContent = `الباقة المحددة: ${item.name}`;
      label.classList.add('show');
    }
    setMessage('تم تحميل بيانات الباقة للتعديل أو الحذف.');
    syncSelectionButtons();
    renderCards();
    document.getElementById('packageNameInput')?.focus();
  }

  function resetForm(){
    state.selectedId = '';
    document.getElementById('packagesForm')?.reset();
    const category = document.getElementById('packageCategoryInput');
    if(category) category.value = 'الذهبية';
    const custom = document.getElementById('packageCustomCategoryInput');
    if(custom){ custom.value = ''; custom.classList.remove('show'); }
    setDelivery('إلى باب البيت');
    const label = document.getElementById('packageSelectedLabel');
    label?.classList.remove('show');
    setMessage('');
    syncSelectionButtons();
    renderCards();
  }

  async function createPackage(){
    const payload = readFormPayload();
    if(!payload) return;
    if(!firebaseReady()) return;
    try{
      await safeCollection(COLLECTION).add({ ...payload, createdAt: timestamp(), updatedAt: timestamp() });
      notify('تم إنشاء الباقة بنجاح.');
      state.selectedCategory = payload.category;
      resetForm();
    }catch(error){
      console.error('Create package error', error);
      setMessage(friendlyFirebaseError(error));
    }
  }

  async function updatePackage(){
    if(!state.selectedId){ setMessage('اختر باقة من المعاينة أو الجدول أولاً.'); return; }
    const payload = readFormPayload();
    if(!payload || !firebaseReady()) return;
    try{
      await safeCollection(COLLECTION).doc(state.selectedId).set({ ...payload, updatedAt: timestamp() }, { merge: true });
      notify('تم تعديل الباقة بنجاح.');
      state.selectedCategory = payload.category;
      resetForm();
    }catch(error){
      console.error('Update package error', error);
      setMessage(friendlyFirebaseError(error));
    }
  }

  async function deleteSelectedPackage(){
    if(!state.selectedId){ setMessage('اختر باقة من المعاينة أو الجدول أولاً.'); return; }
    await deletePackage(state.selectedId);
  }

  async function deletePackage(id){
    const item = state.packages.find(row => row.id === id);
    if(!item || !firebaseReady()) return;
    if(!window.confirm(`تأكيد حذف الباقة «${item.name}»؟`)) return;
    try{
      await safeCollection(COLLECTION).doc(id).delete();
      notify('تم حذف الباقة بنجاح.');
      resetForm();
    }catch(error){
      console.error('Delete package error', error);
      setMessage(friendlyFirebaseError(error));
    }
  }

  function readFormPayload(){
    const name = clean(document.getElementById('packageNameInput')?.value);
    const category = getCategoryValue();
    const price = numberValue(document.getElementById('packagePriceInput')?.value);
    const discountPercent = numberValue(document.getElementById('packageDiscountInput')?.value);
    const careItems = normalizeLines(document.getElementById('packageCareInput')?.value);
    const delivery = document.querySelector('input[name="packageDelivery"]:checked')?.value || '';

    if(!name){ setMessage('اكتب اسم الباقة.'); return null; }
    if(!category){ setMessage('اختر تصنيف الباقة أو اكتب تصنيفاً جديداً.'); return null; }
    if(price < 0){ setMessage('قيمة الباقة غير صحيحة.'); return null; }
    if(discountPercent < 0 || discountPercent > 100){ setMessage('الخصم النقدي يجب أن يكون من 0 إلى 100.'); return null; }

    return {
      name,
      category,
      price,
      discountPercent,
      procedures: {
        registration: Boolean(document.getElementById('packageRegistrationInput')?.checked),
        insurance: Boolean(document.getElementById('packageInsuranceInput')?.checked),
        issuance: Boolean(document.getElementById('packageIssuanceInput')?.checked)
      },
      careItems,
      delivery: delivery || 'إلى باب البيت'
    };
  }

  function exportPdf(){
    const rows = getVisiblePackages();
    if(!rows.length){ notify('لا توجد باقات ظاهرة لتصديرها.'); return; }
    const popup = window.open('', '_blank', 'width=1200,height=900');
    if(!popup){ notify('اسمح بفتح النوافذ المنبثقة ثم حاول مرة أخرى.'); return; }

    const category = state.selectedCategory === 'all' ? 'كل التصنيفات' : state.selectedCategory;
    const cards = rows.map(item => `<article class="card"><h2>${escapeHtml(item.name)}</h2><div class="price">${formatNumber(item.price)} ر.س</div><div class="discount"><span>خصم نقدي</span><b>${formatNumber(item.discountPercent)}%</b></div>${pdfSection('الإجراءات المشمولة', procedureLabels(item))}${pdfSection('العناية بالسيارة', item.careItems)}${pdfSection('التوصيل', [item.delivery])}<footer>التصنيف: ${escapeHtml(item.category)}</footer></article>`).join('');

    popup.document.open();
    popup.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>باقات ${escapeHtml(category)}</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;font-family:Tajawal,Arial,sans-serif;color:#2f201c;background:#fff}.head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:2px solid #e6d2c4;padding-bottom:14px;margin-bottom:18px}.head h1{margin:0;color:#5a3a32;font-size:27px}.head p{margin:5px 0 0;color:#8a746a}.head .date{font-weight:800;color:#6c4036}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card{border:1px solid #e6d2c4;border-radius:15px;overflow:hidden;break-inside:avoid;background:#fffdfc}.card h2{font-size:17px;text-align:center;margin:0;padding:14px 12px 7px}.price{text-align:center;color:#9d5119;font-weight:900;font-size:21px;padding-bottom:12px;border-bottom:1px solid #e6d2c4}.discount{text-align:center;padding:10px;border-bottom:1px solid #e6d2c4}.discount span{display:block;font-size:12px}.discount b{color:#179246;font-size:16px}.section{margin:9px;border:1px solid #e6d2c4;border-radius:10px;overflow:hidden}.section h3{margin:0;background:#fbf4ed;color:#9d5119;padding:8px 10px;font-size:12px}.section ul{margin:0;padding:9px 25px 9px 10px}.section li{font-size:11px;line-height:1.65}.card footer{margin:9px;padding:9px;text-align:center;background:#fbf4ed;border:1px solid #e6d2c4;border-radius:9px;color:#9d5119;font-weight:800;font-size:11px}@media print{body{padding:0}.grid{grid-template-columns:repeat(3,minmax(0,1fr))}}</style></head><body><header class="head"><div><h1>إدارة الباقات</h1><p>${escapeHtml(category)}</p></div><div class="date">${escapeHtml(new Date().toLocaleString('ar-SA'))}</div></header><main class="grid">${cards}</main><script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>`);
    popup.document.close();
  }

  function pdfSection(title, rows){
    const items = rows.length ? rows : ['لا توجد بيانات'];
    return `<section class="section"><h3>${escapeHtml(title)}</h3><ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`;
  }

  function procedureLabels(item){
    const rows = [];
    if(item.procedures.registration) rows.push('رسوم التسجيل');
    if(item.procedures.insurance) rows.push('التأمين');
    if(item.procedures.issuance) rows.push('رسوم الإصدار');
    return rows;
  }

  function getCategories(){
    const custom = state.packages.map(item => item.category).filter(Boolean).filter(category => !DEFAULT_CATEGORIES.includes(category));
    return [...DEFAULT_CATEGORIES, ...[...new Set(custom)].sort((a, b) => a.localeCompare(b, 'ar'))];
  }

  function categoryRank(category){
    const index = getCategories().indexOf(category);
    return index === -1 ? 999 : index;
  }

  function categoryIcon(category){
    return ({ 'العائلية':'♙', 'الفضية':'⬡', 'الذهبية':'♙', 'VIP':'♕' })[category] || '◉';
  }

  function getCategoryValue(){
    const selected = document.getElementById('packageCategoryInput')?.value || '';
    if(selected === '__custom__') return clean(document.getElementById('packageCustomCategoryInput')?.value);
    return clean(selected);
  }

  function setCategoryValue(value){
    const select = document.getElementById('packageCategoryInput');
    const custom = document.getElementById('packageCustomCategoryInput');
    if(!select || !custom) return;
    if(DEFAULT_CATEGORIES.includes(value)){
      select.value = value;
      custom.value = '';
      custom.classList.remove('show');
    }else{
      select.value = '__custom__';
      custom.value = value;
      custom.classList.add('show');
    }
  }

  function syncSelectionButtons(){
    const hasSelection = Boolean(state.selectedId);
    const update = document.getElementById('packageUpdateBtn');
    const remove = document.getElementById('packageDeleteBtn');
    if(update) update.disabled = !hasSelection;
    if(remove) remove.disabled = !hasSelection;
  }

  function firebaseReady(){
    if(typeof mainDb === 'undefined' || !mainDb || typeof safeCollection !== 'function'){
      setMessage('اتصال Firebase غير جاهز حالياً. انتظر لحظات ثم حاول مرة أخرى.');
      scheduleRetry();
      return false;
    }
    return true;
  }

  function friendlyFirebaseError(error){
    const code = String(error?.code || '');
    const message = String(error?.message || '');
    if(code.includes('permission-denied') || message.toLowerCase().includes('insufficient permissions')){
      return 'صلاحيات مجموعة الباقات غير مفعلة. انشر ملف firestore.rules المرفق مع السورس.';
    }
    return message || 'تعذر تحميل بيانات الباقات.';
  }

  function timestamp(){
    if(typeof serverTime === 'function') return serverTime();
    return window.firebase?.firestore?.FieldValue?.serverTimestamp ? firebase.firestore.FieldValue.serverTimestamp() : new Date();
  }

  function setDelivery(value){
    const target = [...document.querySelectorAll('input[name="packageDelivery"]')].find(input => input.value === value);
    if(target) target.checked = true;
  }

  function setChecked(id, value){
    const element = document.getElementById(id);
    if(element) element.checked = Boolean(value);
  }

  function setValue(id, value){
    const element = document.getElementById(id);
    if(element) element.value = value ?? '';
  }

  function setMessage(message){
    const element = document.getElementById('packagesFormMessage');
    if(element) element.textContent = message || '';
  }

  function notify(message){
    if(typeof showToast === 'function') showToast(message);
    else console.log(message);
  }

  function normalizeLines(value){
    if(Array.isArray(value)) return [...new Set(value.map(clean).filter(Boolean))];
    return [...new Set(String(value || '').split(/\r?\n|،|,/).map(clean).filter(Boolean))];
  }

  function firstValue(value){
    if(Array.isArray(value)) return value[0] || '';
    return value || '';
  }

  function numberValue(value){
    if(typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value ?? '').replace(/[^0-9.-]/g, '');
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  function formatNumber(value){
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numberValue(value));
  }

  function clean(value){
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[character]);
  }
})();
