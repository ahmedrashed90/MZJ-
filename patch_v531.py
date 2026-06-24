from pathlib import Path
root=Path('/mnt/data/mzj_v531_work')
idx=root/'index.html'
text=idx.read_text(encoding='utf-8')
start=text.index('<section class="view" data-title="إنشاء حملة" id="create-campaign">')
end=text.index('<section class="view" data-title="ربط المنصات" id="social-publisher">')
new_section=r'''<section class="view" data-title="إنشاء حملة" id="create-campaign">
<div class="page-head campaign-builder-head v531-create-head">
  <div class="page-title">
    <h1>إنشاء حملة</h1>
    <p>تصور جديد نظيف لإنشاء الحملة: طلب كاتب المحتوى، اختيار الكرييتيف، الميزانية، ثم المراجعة.</p>
  </div>
  <div class="actions">
    <button class="btn btn-light" id="resetCampaignBuilder" type="button">مسح النموذج</button>
    <button class="btn btn-primary" id="saveCampaignDraft" type="button">إنشاء الحملة</button>
  </div>
</div>

<div aria-label="خطوات إنشاء الحملة" class="campaign-wizard-nav v531-wizard-nav" id="campaignWizardNav">
  <button class="campaign-wizard-step active" data-campaign-wizard-target="1" type="button"><span>1</span><strong>طلب كاتب المحتوى</strong></button>
  <button class="campaign-wizard-step" data-campaign-wizard-target="2" type="button"><span>2</span><strong>اختيار الكرييتيف</strong></button>
  <button class="campaign-wizard-step" data-campaign-wizard-target="3" type="button"><span>3</span><strong>الميزانية</strong></button>
  <button class="campaign-wizard-step" data-campaign-wizard-target="4" type="button"><span>4</span><strong>المراجعة</strong></button>
</div>

<div class="campaign-builder v531-campaign-builder" id="campaignWizard" dir="rtl">
  <section class="card v531-panel campaign-wizard-panel active" data-campaign-wizard-step="1">
    <div class="v531-panel-head"><div><h2>طلب كاتب المحتوى</h2><p>بيانات الطلب الأساسي وكتّاب المحتوى المسؤولين عن رفع الهيكل.</p></div><span class="v531-step-badge">1</span></div>
    <form class="form v531-grid" id="campaignRequestForm">
      <label class="field"><span>تاريخ الحملة</span><input name="campaign_date" type="date" readonly></label>
      <label class="field"><span>بداية النشر</span><input id="publishStartDate" name="publish_start_date" type="date"></label>
      <label class="field"><span>نهاية النشر</span><input id="publishEndDate" name="publish_end_date" type="date"></label>
      <label class="field"><span>نوع الحملة</span><select id="campaignTypeSelect" name="campaign_type_id" class="js-v531-campaign-type"></select></label>
      <label class="field"><span>كود الحملة</span><input id="campaignCodeInput" name="campaign_code" type="text" readonly placeholder="يظهر تلقائي بعد اختيار نوع الحملة"></label>
      <label class="field"><span>اسم الحملة</span><input name="campaign_name" type="text" placeholder="اكتب اسم الحملة"></label>
      <label class="field field-wide"><span>هدف الحملة</span><textarea name="campaign_goal" placeholder="اكتب الهدف"></textarea></label>
      <label class="field field-wide"><span>المطلوب من كاتب المحتوى</span><textarea name="content_writer_brief" placeholder="اكتب المطلوب"></textarea></label>
      <div class="field field-wide"><span>يوزرات كتابة المحتوى لطلب الهيكل</span><div id="v531ContentWriters" class="v531-check-grid"></div></div>
      <label class="field"><span>موعد تسليم الهيكل</span><input name="structure_deadline" type="date"></label>
    </form>
    <div class="campaign-wizard-actions"><button class="btn btn-primary" data-campaign-wizard-next type="button">التالي: اختيار الكرييتيف</button></div>
  </section>

  <section class="card v531-panel campaign-wizard-panel" data-campaign-wizard-step="2">
    <div class="v531-panel-head"><div><h2>اختيار الكرييتيف</h2><p>اختار كرييتيف أو أكثر من صفحة الأقسام، ثم اربط كل قسم بكتّاب المحتوى ومواعيد التسليم.</p></div><span class="v531-step-badge">2</span></div>
    <div class="v531-creative-layout">
      <aside class="v531-creative-picker">
        <label class="field"><span>بحث عن كرييتيف</span><input id="v531CreativeSearch" type="search" placeholder="ابحث عن كرييتيف بالاسم أو النوع..."></label>
        <div id="v531CreativeList" class="v531-creative-list"></div>
      </aside>
      <main class="v531-creative-details">
        <div id="v531SelectedCreatives" class="v531-selected-creatives"><div class="empty-state">اختار كرييتيف واحد أو أكثر.</div></div>
      </main>
    </div>
    <div class="campaign-wizard-actions"><button class="btn btn-light" data-campaign-wizard-prev type="button">السابق</button><button class="btn btn-primary" data-campaign-wizard-next type="button">التالي: الميزانية</button></div>
  </section>

  <section class="card v531-panel campaign-wizard-panel" data-campaign-wizard-step="3">
    <div class="v531-panel-head"><div><h2>الميزانية</h2><p>بنود الميزانية حسب Funnel والكرييتيفات والمنصات.</p></div><button class="btn btn-light" id="addBudgetRowBtn" type="button">＋ إضافة بند ميزانية</button></div>
    <div class="budget-items v531-budget-list" id="budgetRows"><div class="empty-state">لا توجد بنود ميزانية.</div></div>
    <div class="budget-grand-total"><span>إجمالي الميزانية</span><strong id="budgetGrandTotalValue">0</strong></div>
    <div class="campaign-wizard-actions"><button class="btn btn-light" data-campaign-wizard-prev type="button">السابق</button><button class="btn btn-primary" data-campaign-wizard-next type="button">التالي: المراجعة</button></div>
  </section>

  <section class="card v531-panel campaign-wizard-panel" data-campaign-wizard-step="4">
    <div class="v531-panel-head"><div><h2>المراجعة</h2><p>عرض لكل حاجة اختارتها قبل إنشاء الحملة.</p></div><span class="v531-step-badge">4</span></div>
    <div class="review-grid v531-review-grid" id="campaignReviewGrid"></div>
    <div class="campaign-wizard-actions"><button class="btn btn-light" data-campaign-wizard-prev type="button">السابق</button><button class="btn btn-primary" id="campaignWizardFinalSave" type="button">إنشاء الحملة</button></div>
  </section>
</div>
</section>
'''
text=text[:start]+new_section+text[end:]
text=text.replace('assets/js/app.js?v=530','assets/js/app.js?v=531')
idx.write_text(text,encoding='utf-8')
