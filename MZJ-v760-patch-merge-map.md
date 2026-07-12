# خريطة باتشات MZJ v760

- عدد أسطر `app.js`: **42,620**
- عدد كتل الإصدارات/الباتشات المكتشفة: **209**
- عدد الدوال التي أعيد تعريفها أكثر من مرة: **70**

## أكبر سلاسل إعادة التعريف

| الدالة | مرات إعادة التعريف | أول/آخر سطر |
|---|---:|---|
| `getVisibleTasksForCurrentUser` | 21 | 25849 → 42389 |
| `tasksForCampaign` | 20 | 20494 → 42360 |
| `buildTaskDetailHtml` | 19 | 13418 → 37221 |
| `findTaskById` | 16 | 14768 → 33963 |
| `buildDepartmentTasks` | 13 | 12666 → 34041 |
| `campaignTasksSnapshot` | 10 | 14645 → 40547 |
| `renderAdminDashboard` | 9 | 14675 → 39154 |
| `shortTaskName` | 8 | 12460 → 34972 |
| `taskStructure` | 8 | 25081 → 30681 |
| `updateTaskOnFirebase` | 8 | 23940 → 41430 |
| `v174SetTaskTemplateDecision` | 8 | 34075 → 35261 |
| `adminDashboardTasksForCampaign` | 7 | 14638 → 40542 |
| `renderTaskDetail` | 7 | 14789 → 29315 |
| `buildCampaignTaskDocs` | 6 | 15407 → 25708 |
| `collectCampaignRows` | 6 | 12629 → 21906 |
| `downloadStructureTemplateForTaskExact` | 6 | 12310 → 21272 |
| `openCreativeAssignmentPopup` | 6 | 15352 → 26842 |
| `openTaskModal` | 6 | 14015 → 40274 |
| `renderCampaignInlineTasks` | 6 | 14661 → 17179 |
| `saveStructureDistribution` | 6 | 13301 → 34831 |
| `selectedContentDependency` | 6 | 12733 → 15773 |
| `uploadStructureFileForTask` | 6 | 24007 → 30752 |
| `isTaskWaitingForDependency` | 5 | 25751 → 42367 |
| `receivedClass` | 5 | 16381 → 33266 |
| `receivedLabel` | 5 | 16374 → 33252 |
| `setStructureStatus` | 5 | 24067 → 34066 |
| `downloadStructureTemplateForTask` | 4 | 22014 → 23846 |
| `getPublishingPrepTasks` | 4 | 14154 → 40947 |
| `publishPrepHasFinalFile` | 4 | 34166 → 40953 |
| `refreshContentDependencyPickers` | 4 | 12705 → 14983 |
| `renderUserDashboard` | 4 | 28958 → 37133 |
| `selectedRoleTaskFromPanel` | 4 | 13065 → 15780 |
| `structureTaskNumber` | 4 | 34127 → 34966 |
| `toggleTaskReceived` | 4 | 24472 → 32016 |
| `buildStructureTaskFromRow` | 3 | 13295 → 17116 |
| `campaignWizardSetStep` | 3 | 15343 → 26625 |
| `creativeAssignmentPanelHtml` | 3 | 19800 → 26806 |
| `publishPrepFinalFileRecord` | 3 | 40395 → 40960 |
| `publishPrepTaskProgress` | 3 | 40371 → 40950 |
| `publishPrepTasksFromExistingTasks` | 3 | 12553 → 40359 |

## كتل الباتشات حسب الترتيب

| الإصدار | الأسطر | التصنيف | مستمعات أحداث | أهم الدوال المعدلة | الوصف |
|---|---:|---|---:|---|---|
| v517 | 2–1093 | other | 1 | `MZJAddPlatformPostTypeRow`, `MZJSetPlatformPostTypesRows`, `MZJSyncPlatformPostTypesTextarea`, `__MZJ_V517_EARLY_FLOW_GUARD__` | /* MZJ v517 early flow click guard */ |
| v84 | 1094–1094 | other | 0 | — | // v84 hard fix: refreshDynamicSelects no longer removes platform post-type controls |
| v83 | 1095–4093 | other | 4 | `MZJForceRefreshPublishAgendaPlatformTypes`, `__mzjUploadDetailsOpen`, `activeUploadProgressState`, `lastNotificationKeys`, `mzjHandleStockShotChange`, `notificationAudioCtx` | // v83 hard fix: جدول النشر - إظهار نوع النشر والأبعاد فور اختيار المنصة بدون الحاجة لتحديث الجدول |
| v32 | 4094–5126 | other | 0 | `activeTaskModalMeta`, `activeUploadProgressState`, `lastTime`, `publishPrepFirestoreReady`, `publishPrepSubmissionsCache` | // v32: final media upload is allowed by Storage Rules during the current integration stage. |
| v133 | 5127–12058 | structure | 110 | `__MZJ_CALENDAR_ENTRIES_BY_DATE__`, `forcedExecutionHeader`, `platformConnectionsCache`, `publishComposerEditingId`, `publishPrepFirestoreReady`, `publishPrepSubmissionsCache` | // v133 exact fix: in the approved structure display we are rendering the real Excel template. |
| v148 | 12059–12164 | other | 0 | — | // v148: download fix for templates that do not contain xl/sharedStrings.xml. |
| v156 | 12165–12248 | campaign_creation | 0 | — | // v156 override: exact template download with creative short code, department code and user code columns. |
| v159 | 12249–12390 | other | 0 | `downloadStructureTemplateForTaskExact`, `isRealStructureDistributionRow`, `isStructureCodeOnlyValue`, `structureDisplayRowHasRealExecutionData`, `userCodeFromIdentity` | // v159 final fixes: exact 21 Campaign Logic fields, formatted link-code columns, ignore code-only rows. |
| v160 | 12391–12503 | structure | 0 | `collectStructurePopupMeta`, `isRealStructureDistributionRow`, `openStructureDistributionPopup`, `saveStructureDistributionPopup`, `shortTaskName`, `structureContentTaskLabel` | // v160 fixes: hide user picker in structure distribution, filter generated code-only rows harder, and shorten visible task names. |
| v161 | 12504–12570 | structure | 0 | `publishPrepTasksFromExistingTasks` | // v161 fix: تجهيز النشر يقرأ تاسكات الهيكل الموزعة بعد اختيار المنصات وتاريخ النشر. |
| v162 | 12571–12693 | campaign_creation | 0 | `buildDepartmentTasks`, `collectCampaignRows`, `ensurePanelHasAllRoleAssignments`, `structureRequestAdded` | // v162: one structure request per campaign row, no content section inside creative step, link execution roles to all step-1 content writers. |
| v163 | 12694–12782 | structure | 1 | `buildDepartmentTasks`, `contentDependencyPickerHtml`, `creativeAssignmentRoleBlocksHtml`, `refreshContentDependencyPickers`, `selectedContentDependency` | /* v163 - per content writer structure tasks + execution users linked to selected content writers */ |
| v164 | 12783–12912 | other | 0 | `downloadStructureTemplateForTaskExact`, `refreshContentDependencyPickers`, `selectedContentDependency` | /* v164 - no default content-writer checks + remove execution angle/highlight columns from template */ |
| v165 | 12913–13204 | dashboard | 1 | `downloadStructureTemplateForTaskExact`, `refreshContentDependencyPickers`, `selectedContentDependency`, `selectedRoleTaskFromPanel`, `syncPanelDynamicState` | /* v165 - per-user content-writer linking inside execution roles + clearer dashboard names + full task details scroll */ |
| v171 | 13205–13428 | task_template | 0 | `buildStructureTaskFromRow`, `buildTaskDetailHtml`, `saveStructureDistribution` | /* v171 - content task template workflow linked to execution tasks */ |
| v172 | 13429–13591 | task_template | 0 | — | /* v172 - exact Task Template parser: key/value sheet uploaded by content writer */ |
| v177 | 13592–14006 | task_template | 2 | — | /* v177 - Task Template must use real uploaded file data only, never fallback to structure task fields */ |
| v172 | 14007–14011 | task_template | 0 | — | /* v172 - task template exact file support */ |
| v182 | 14012–14025 | structure | 0 | `openTaskModal` | /* v182 - keep normal task details as a vertical scrollable detail view, not the structure sheet layout */ |
| v184 | 14026–14173 | task_template | 0 | `getPublishingPrepTasks`, `publishPrepSearchText`, `publishPrepTasksFromExistingTasks` | /* v184 - Publish Prep shows approved execution tasks from structure only, with approved Task Template caption/hashtags */ |
| v187 | 14174–14327 | publish_prep | 1 | `MZJ_LAST_PATCH`, `openPublishPrepEditModal`, `savePublishPrepEditModal` | /* v187 fix: make Publish Prep meta edit button open/save reliably */ |
| v188 | 14328–14489 | structure | 0 | `renderPublishPrepPage` | /* v188 fix: Publish Prep must list every eligible publishing task, not only the latest approved structure subset. */ |
| v195 | 14490–14556 | task_template | 0 | `openStructureReviewPopup`, `renderStructureSection`, `shortTaskName` | /* v195 - polished Task Template naming + always open approved structure */ |
| v196 | 14557–14602 | task_template | 0 | `openStructureReviewPopup`, `renderStructureSection` | /* v196 - Task Template clean column C + stable approved structure open for admins */ |
| v197 | 14603–14731 | dashboard | 0 | `adminDashboardTasksForCampaign`, `campaignTasksSnapshot`, `renderAdminDashboard`, `renderCampaignInlineTasks`, `v197IsMainStructureRequest` | /* v197 - keep approved structure request visible for admin readiness dashboard */ |
| v198 | 14732–14894 | campaign_creation | 0 | `buildTaskDetailHtml`, `findTaskById`, `renderCampaignInlineTasks`, `renderTaskDetail` | /* v198 - details after structure distribution + creative types + content Task Template access */ |
| v199 | 14895–15036 | campaign_creation | 2 | `refreshContentDependencyPickers`, `selectedContentDependency`, `selectedRoleTaskFromPanel`, `syncPanelDynamicState` | /* v199 - shooting executor to content writer deadline inside step 2 */ |
| v200 | 15037–15207 | other | 2 | `selectedContentDependency`, `selectedRoleTaskFromPanel` | /* v200 - per shooting/content-writer deadline rows */ |
| v212 | 15208–15217 | other | 0 | — | // v212: do not rebuild shooting rows while the native calendar is being opened/used. |
| v202 | 15218–15241 | campaign_creation | 0 | `buildTaskDetailHtml` | /* v202 - campaign goal in step 1 and visible in all task details */ |
| v206 | 15242–15468 | campaign_creation | 2 | `buildCampaignTaskDocs`, `buildTaskDetailHtml`, `campaignWizardSetStep`, `collectCampaignRows`, `openCreativeAssignmentPopup`, `refreshCreativeAssignmentPanels` | /* v206 - show selected structure creatives and per-content-writer deadlines in step 2 */ |
| v207 | 15469–15628 | campaign_creation | 2 | `campaignWizardSetStep` | /* v207 - force visible content-writer deadlines in step 2 after selecting structure creatives */ |
| v209 | 15629–15656 | other | 0 | — | /* v209 - content-writer deadlines for all execution sections */ |
| v213 | 15657–15813 | campaign_creation | 2 | `selectedContentDependency`, `selectedRoleTaskFromPanel` | // v213: keep dates independent per creative + section + executor + writer. |
| v210 | 15814–15826 | other | 1 | — | // v210: Do not re-render the assignment panel while the user is opening/using |
| v211 | 15827–15929 | other | 7 | — | /* v211 - stable inline date selectors for linked writer deadlines */ |
| v212 | 15930–15958 | other | 1 | — | /* v212 - restore native calendar picker and keep deadline rows stable */ |
| v217 | 15959–15981 | other | 2 | — | // v217: protect native date picker from later document-level rebuild/cleanup listeners. |
| v213 | 15982–16028 | campaign_creation | 1 | — | /* v213 - isolate writer deadlines per section and compact creative chooser */ |
| v217 | 16029–16048 | other | 0 | — | // v217: do not touch/re-style date inputs while the picker is opening or active. |
| v214 | 16049–16110 | other | 1 | — | /* v214 - remove duplicate writer deadline blocks and stop sticky inner scroll */ |
| v217 | 16111–16130 | other | 0 | — | // v217: never run cleanup from date input events; cleanup mutates the input/row and closes the native calendar. |
| v215 | 16131–16161 | campaign_creation | 4 | — | /* v215 - section notes in creative assignment step 2 */ |
| v216 | 16162–16289 | campaign_creation | 0 | `downloadStructureTemplateForTaskExact` | /* v216 - fill structure template content type rows by selected creative quantities */ |
| v219 | 16290–16292 | task_template | 0 | — | /* v219 - robust Task Template field reparse from stored uploaded XLSX */ |
| v220 | 16293–16543 | task_template | 2 | `campaignTasksSnapshot`, `fillSettingsForm`, `receivedClass`, `receivedLabel`, `renderAdminDashboard`, `renderCampaignInlineTasks` | /* v220 - Dashboard Task Template badges + content approval waiting state + owner color settings */ |
| v221 | 16544–16752 | dashboard | 2 | `campaignTasksSnapshot`, `fillSettingsForm`, `receivedClass`, `receivedLabel`, `renderAdminDashboard`, `renderCampaignInlineTasks` | /* v221 - keep owner colors in Firebase only + cleaner dashboard task number display */ |
| v222 | 16753–16974 | other | 0 | `buildStructureTaskFromRow`, `campaignTasksSnapshot`, `mergeStructureAdditionIntoExistingTask`, `receivedClass`, `receivedLabel`, `renderAdminDashboard` | /* v222 - show only real task number from sheet + show approved content writer beside execution assignee */ |
| v132 | 16975–16975 | structure | 0 | — | /* v132 - exact approved structure execution headers */ |
| v223 | 16976–17325 | other | 0 | `buildStructureTaskFromRow`, `campaignTasksSnapshot`, `mergeStructureAdditionIntoExistingTask`, `receivedClass`, `receivedLabel`, `renderAdminDashboard` | /* v223 - show approved source content writer only + full real task code as card text */ |
| v17 | 17326–18824 | other | 50 | `checklistApplyingCaptionStyle`, `checklistRendering`, `checklistStudioReady`, `done`, `dragging`, `mzjChecklistPickVideoForShot` | // v17: بداية الاستخدام تكون 0 افتراضيًا دائمًا عند الاستيراد، حتى لو ملف CSV فيه قيمة مختلفة. |
| v11 | 18825–19027 | other | 0 | `drawPreviewAt`, `previewChecklistVideo`, `startPreviewPlayback`, `toggleChecklistPreview` | // v11 player/timeline fix: real video playback preview instead of frame-by-frame seeking. |
| v19 | 19028–19043 | other | 0 | `mzjChecklistGetActiveShots`, `mzjChecklistGetAllShots`, `mzjChecklistGetFileForShot`, `mzjChecklistGetMediaFiles`, `mzjChecklistSetNativeFileForShot` | // v19: expose checklist data for Reference Slots and CapCut draft export. |
| v19 | 19044–19577 | other | 12 | `mzjReferenceRefreshSlots` | /* v19 Reference-Based Editing: Slots are the selection UI + CapCut Draft export beta */ |
| v33 | 19578–19792 | other | 1 | — | // v33 Local Publisher: platform/content-type times, web controls, and Electron command requests. |
| v92 | 19793–19944 | campaign_creation | 3 | `collectCampaignRows`, `creativeAssignmentPanelHtml`, `refreshCreativePopupPanels`, `selectedCarsFromCreativePanel`, `updateCreativePanelCarVisibility`, `updateProductOutput` | /* MZJ v92 - Sequential creative car choice flow */ |
| v93 | 19945–20311 | campaign_creation | 3 | `collectCampaignRows`, `creativeAssignmentPanelHtml`, `ensureCreativeAssignmentPopup`, `getCreativePopupSelected`, `openCreativeAssignmentPopup`, `popupCreativeCheckboxList` | /* MZJ v93 - Full redesign for campaign step 2 popup: vertical creatives, cars beside, departments beside, duplicate creative instances */ |
| v94 | 20312–20392 | campaign_creation | 0 | `buildCampaignTaskDocs`, `collectCampaignRows` | /* MZJ v94 - Fix step 2 redesign: only saved creatives create rows, and only ONE structure request task per campaign */ |
| v95 | 20393–20564 | structure | 1 | `buildCampaignTaskDocs`, `cleanupCampaignDuplicateStructureRequests`, `mzjCollapseDuplicateStructureRequests`, `renderCampaignDetail`, `tasksForCampaign` | /* MZJ v95 - Legacy cleanup: collapse old duplicated structure requests created by v93/v94 for existing campaigns. */ |
| v98 | 20565–20989 | campaign_creation | 4 | `addBudgetItem`, `budgetItemTotal`, `collectBudgetRows`, `openCampaignEditModal`, `productOptions`, `renderBudgetSummary` | /* MZJ v98 - Larger Campaign Management budget popup with funnel totals and per-platform values. */ |
| v104 | 20990–20992 | other | 0 | — | /* MZJ v104 - Cars in Content Execution Direction template/review. */ |
| v105 | 20993–21177 | structure | 0 | `buildCampaignTaskDocs`, `buildTaskDetailHtml`, `downloadStructureTemplateForTaskExact`, `mzjCarsForStructureRow`, `mzjStructureTaskCarsText` | /* MZJ v105 - Final structure car pipeline: task details + template + review fields. */ |
| v106 | 21178–21359 | structure | 0 | `downloadStructureTemplateForTaskExact` | /* MZJ v106 - structure template rows only for current content writer task, no repeated 50 rows. */ |
| v121 | 21360–21530 | other | 2 | `exportCampaignAuditWorkbook` | /* v121 - campaign audit Excel export/import review only (no writes to marketing_campaigns) */ |
| v122 | 21531–21570 | campaign_creation | 0 | `renderCampaignCards` | /* v122 - make campaign audit Excel controls visible after budget card override */ |
| v134 | 21571–21588 | dashboard | 0 | `renderAdminDashboard` | // v134: removed the dashboard "رفع شيت مراجعة حملة" tool. |
| v124 | 21589–21795 | other | 2 | `exportCampaignAuditWorkbook`, `renderCampaignCards` | /* v124 - fix Campaign Audit Excel long-cell export limit (based on v123) */ |
| v125 | 21796–22054 | campaign_creation | 0 | `buildCampaignTaskDocs`, `buildDepartmentTasks`, `collectCampaignRows`, `downloadStructureTemplateForTask`, `mzjCampaignCreativeRowsForStructureTask`, `structureTemplateRowsForTask` | /* MZJ v125 - Fix structure request and template to use saved creative instances without dedupe */ |
| v126 | 22055–22218 | structure | 0 | `downloadStructureTemplateForTask` | /* MZJ v126 - restore exact styled structure template while keeping v125 multi-instance rows. */ |
| v127 | 22219–22396 | structure | 0 | `downloadStructureTemplateForTask` | /* MZJ v127 - fix structure template download trigger and fallback. */ |
| v128 | 22397–23858 | structure | 0 | `downloadStructureTemplateForTask`, `downloadStructureTemplateForTaskExact` | /* MZJ v128 - use the real styled structure Excel template file and fill rows without fallback ugly sheet. */ |
| v139 | 23859–24102 | task_template | 0 | `ensureStructureSheetLoaded`, `reloadStructureSheetFromStoredFile`, `setStructureStatus`, `targetCampaign`, `targetTask`, `tasksForCampaign` | /* v139 - safe Storage persistence for Structure + Task Template, no departmentTasks map corruption */ |
| v140 | 24103–24302 | task_template | 0 | `ensureStructureSheetLoaded`, `isCampaignStructureTask`, `matched`, `reloadStructureSheetFromStoredFile`, `renderStructureSection`, `renderStructureWorkbookTable` | /* v140 - explicit structure upload UI + array-only recovery for structure and Task Template storage */ |
| v141 | 24303–24595 | task_template | 2 | `buildTaskDetailHtml`, `matched`, `toggleTaskReceived`, `updateTaskOnFirebase` | /* v141 - fix receive persistence + Task Template upload on Storage only */ |
| v142 | 24596–24648 | task_template | 0 | `buildTaskDetailHtml`, `tasksForCampaign` | /* v142 - targeted fix: non-content receive persistence + Task Template upload visibility, without changing campaign creation */ |
| v143 | 24649–24805 | task_template | 0 | `buildTaskDetailHtml`, `findTaskById`, `refreshOpenTaskModal`, `tasksForCampaign` | /* v143 - dedupe Task Template tasks and show approved content template on execution tasks only */ |
| v144 | 24806–25004 | task_template | 0 | `buildTaskDetailHtml`, `findTaskById`, `tasksForCampaign` | /* v144 - show approved content Task Template fields inside linked execution task details only */ |
| v146 | 25005–25284 | task_template | 0 | `buildTaskDetailHtml`, `findTaskById`, `taskStructure`, `tasksForCampaign`, `uploadStructureFileForTask` | /* v146 - targeted recovery from v144: multi content structure uploads + approved content template in execution details + hide aggregate tasks */ |
| v152 | 25285–25585 | task_template | 0 | `__MZJ_INDEPENDENT_UPLOADS__`, `findTaskById`, `taskStructure`, `tasksForCampaign`, `updateTaskOnFirebase`, `uploadStructureFileForTask` | /* v152 - independent upload documents for Structure + Task Template (no campaign doc growth) */ |
| v401 | 25586–25809 | campaign_creation | 0 | `buildCampaignTaskDocs`, `buildDepartmentTasks`, `isTaskWaitingForDependency`, `taskStructure`, `tasksForCampaign` | /* v401 - campaign structure flow fix: one structure task per content writer, preserve creative-car mapping, user-specific structure upload badges, keep execution tasks waiting unt |
| v402 | 25810–25858 | other | 0 | `getVisibleTasksForCurrentUser` | /* v402 - hide pre-approval execution waiting tasks from content writers. */ |
| v404 | 25859–25994 | task_template | 0 | `getVisibleTasksForCurrentUser`, `taskStructure`, `taskStructureAttached`, `taskStructureAttachedBadge` | /* v404 - content structure upload is per writer + content template tasks appear only after structure approval. */ |
| v405 | 25995–26221 | task_template | 0 | `buildTaskDetailHtml`, `findTaskById`, `taskTemplateBadge`, `tasksForCampaign` | /* v405 - Task Template ownership per content writer + approved content data on all linked execution tasks. */ |
| v409 | 26222–26357 | other | 0 | `buildDepartmentTasks`, `departmentForUser`, `getVisibleTasksForCurrentUser`, `tasksForCampaign`, `usersForRole` | /* v409 - multi-department user membership: content writer tasks should not depend on single user.department field. */ |
| v411 | 26358–26529 | campaign_creation | 0 | `buildDepartmentTasks`, `renderTaskCard`, `taskDependencyApproved` | /* v411 - content dependency split: execution waiting tasks are scoped per content writer; v410 wizard UI reverted by building from v409 base. */ |
| v414 | 26530–26659 | campaign_creation | 2 | `campaignWizardMove`, `campaignWizardSetStep`, `openCreativeAssignmentPopup` | /* MZJ v414 - Four-stage Campaign Builder + clean studio safeguards */ |
| v417 | 26660–26731 | campaign_creation | 4 | `openCreativeAssignmentPopup` | /* MZJ v417 - Creative Studio UX + wizard navigation hard fix */ |
| v418 | 26732–26779 | campaign_creation | 2 | `openCreativeAssignmentPopup` | /* MZJ v418 - Creative Studio polish: full overlay, clean current header, search focus */ |
| v423 | 26780–26856 | campaign_creation | 1 | `creativeAssignmentPanelHtml`, `openCreativeAssignmentPopup` | /* MZJ v423 - Safe UI only: show selected creative details as 4 cards without touching save logic */ |
| v426 | 26857–26996 | dashboard | 0 | `getVisibleTasksForCurrentUser` | /* MZJ v426 - dashboard content phase visibility: structure first, execution waiting after approval */ |
| v427 | 26997–27131 | dashboard | 0 | `getVisibleTasksForCurrentUser` | /* MZJ v427 - strict content writer dashboard: hide execution tasks until that writer structure is admin-approved */ |
| v428 | 27132–27285 | structure | 0 | `getVisibleTasksForCurrentUser` | /* MZJ v428 - hard gate execution waiting tasks when current user still has pending content structure in same campaign */ |
| v429 | 27286–27482 | dashboard | 0 | `getVisibleTasksForCurrentUser`, `shortTaskName` | /* MZJ v429 - robust content structure dashboard visibility by writer assignment */ |
| v430 | 27483–27579 | structure | 0 | `getVisibleTasksForCurrentUser`, `renderTaskDetail` | /* MZJ v430 - exact content structure owner visibility + detail open fix */ |
| v431 | 27580–27744 | structure | 0 | `getVisibleTasksForCurrentUser` | /* MZJ v431 - keep waiting tasks visible for non-content assignees while content structure is pending */ |
| v432 | 27745–28064 | other | 0 | `buildDepartmentTasks` | /* MZJ v432 - authoritative one execution task per executor/content-writer pair (no car/quantity duplicates) */ |
| v446 | 28065–28301 | dashboard | 0 | `adminDashboardTasksForCampaign`, `campaignTasksSnapshot`, `getVisibleTasksForCurrentUser`, `renderTaskDetail` | /* MZJ v446 - authoritative dashboard visibility from stored executor/content pairs */ |
| v447 | 28302–28381 | campaign_creation | 0 | `renderBudgetSummary` | /* MZJ v447 - content structure count label + detailed PDF budget by creative/platform */ |
| v448 | 28382–28825 | other | 0 | `adminDashboardTasksForCampaign`, `buildDepartmentTasks`, `campaignTasksSnapshot`, `getVisibleTasksForCurrentUser`, `renderTaskDetail` | /* MZJ v448 - clean legacy task generation and rebuild canonical executor/content pairs */ |
| v450 | 28826–28933 | dashboard | 0 | `findTaskById`, `openTaskModal`, `renderTaskDetail` | /* MZJ v450 - exact executive dashboard task detail by card key */ |
| v450 | 28934–28973 | other | 0 | `renderUserDashboard` | // v450: لا نعتمد على ترتيب الكروت بصرياً/DOM لأن RTL والجروبات ممكن تعكس الترتيب. |
| v452 | 28974–29171 | other | 1 | `buildTaskDetailHtml`, `findTaskById`, `openTaskModal`, `renderTaskDetail`, `renderUserDashboard` | /* MZJ v452 - force executive detail from clicked card writer/pair */ |
| v453 | 29172–29341 | other | 1 | `MZJ_FORCED_DETAIL_TASK`, `findTaskById`, `openTaskModal`, `renderTaskDetail` | /* MZJ v453 - hard patch executive detail writer field after render */ |
| v454 | 29342–29528 | task_template | 1 | `buildTaskDetailHtml`, `findTaskById`, `getVisibleTasksForCurrentUser`, `taskStructure`, `toggleTaskReceived` | /* MZJ v454 - writer-owned structure + content template waiting tasks + reliable receive */ |
| v455 | 29529–29685 | structure | 1 | `MZJ_DIRECT_PATCH_TASK`, `toggleTaskReceived`, `updateTaskOnFirebase`, `uploadStructureFileForTask` | /* MZJ v455 - direct Firebase task receipt + writer-owned structure authoritative */ |
| v456 | 29686–29869 | structure | 1 | `MZJ_V456_LOCATE_TASK`, `MZJ_V456_PATCH_TASK`, `campaignForTask`, `findTaskById`, `getVisibleTasksForCurrentUser`, `tasksForCampaign` | /* MZJ v456 - real content flow: receive + writer owned structure + template tasks from all sources */ |
| v457 | 29870–30197 | task_template | 3 | `MZJ_V457_LISTENERS_READY`, `findTaskById`, `getVisibleTasksForCurrentUser`, `saveStructureDistribution`, `setStructureStatus`, `taskStructure` | /* MZJ v457 - canonical writer-owned structures and per-task template documents */ |
| v458 | 30198–30430 | structure | 1 | `MZJ_V458_LISTENERS_READY`, `findTaskById`, `saveStructureDistribution`, `taskStructure` | /* MZJ v458 - hard writer-owned structure receive and template flow */ |
| v459 | 30431–30438 | task_details | 0 | — | /* MZJ v459 - receive button campaign id from task id */ |
| v461 | 30439–30582 | task_details | 1 | `MZJ_APP_VERSION`, `MZJ_LAST_PATCH`, `MZJ_V461_RECEIVE_CLICK_BOUND`, `MZJ_V461_RECEIVE_TASK`, `toggleTaskReceived` | /* MZJ v461 - hard override receive content task from current campaigns */ |
| v462 | 30583–30786 | structure | 0 | `findTaskById`, `taskStructure`, `taskStructureAttached`, `taskStructureAttachedBadge`, `tasksForCampaign`, `uploadStructureFileForTask` | /* MZJ v462 - hard isolate campaign structure uploads per content writer */ |
| v463 | 30787–30988 | task_template | 0 | `getVisibleTasksForCurrentUser`, `saveStructureDistribution` | /* MZJ v463 - guarantee content Task Template visibility after approved structure distribution */ |
| v464 | 30989–31163 | task_template | 0 | `getVisibleTasksForCurrentUser`, `saveStructureDistribution` | /* MZJ v464 - approved structure owner is authoritative for Task Template distribution */ |
| v465 | 31164–31345 | task_template | 0 | `MZJ_TASK_TEMPLATE_DOCS`, `findTaskById`, `taskTemplateAttached`, `taskTemplateBadge`, `toggleTaskReceived` | /* MZJ v465 - sync Task Template receive/upload state to admin dashboard */ |
| v465b | 31346–31367 | task_template | 0 | — | /* MZJ v465b - preserve raw campaign Task Template state before virtual regeneration */ |
| v466 | 31368–31476 | task_template | 1 | — | /* MZJ v466 - approve Task Template without hiding existing execution tasks + close popup */ |
| v467 | 31477–31594 | task_template | 1 | `getVisibleTasksForCurrentUser`, `v171ApproveTaskTemplate` | /* MZJ v467 - restore already distributed tasks after Task Template approval */ |
| v468 | 31595–31743 | task_template | 1 | `taskTemplateAttached`, `taskTemplateBadge`, `v171ApproveTaskTemplate` | /* MZJ v468 - exact Task Template attachment/approval scope + dashboard dedupe */ |
| v470 | 31744–31847 | structure | 0 | — | /* MZJ v470 - single-source structure distribution, no duplicate generated tasks */ |
| v491 | 31848–32019 | other | 1 | `adminDashboardTasksForCampaign`, `buildDepartmentTasks`, `getVisibleTasksForCurrentUser`, `saveStructureDistribution`, `setStructureStatus`, `tasksForCampaign` | /* MZJ v491 - rebuilt campaign/task flow from scratch around sheet codes */ |
| v492 | 32020–32045 | structure | 0 | `setStructureStatus` | /* MZJ v492 - structure approve triggers clean distribution immediately */ |
| v493 | 32046–32183 | task_template | 1 | `matchedExec`, `v493DecideTaskTemplate` | /* MZJ v493 - Task Template review buttons update execution task by sheet-code keys */ |
| v498 | 32184–32259 | other | 1 | `MZJ_v498_approveStructureAuthoritative`, `MZJ_v498_decideTemplateAuthoritative` | /* MZJ v498 - authoritative approval writes campaign departmentTasks after distribution */ |
| v494 | 32260–32326 | task_template | 0 | — | /* MZJ v494 - hard override structure approval + task template approval by sheet codes */ |
| v495 | 32327–32406 | other | 1 | `MZJ_v494_approveStructureHard`, `MZJ_v494_decideTemplateHard`, `matched` | // v495: match by the sheet-code key, but do not fail when the older execution card |
| v499 | 32407–32538 | structure | 1 | `MZJ_v498_approveStructureAuthoritative`, `MZJ_v499_hardSyncApprovedStructure` | /* MZJ v499 - post-distribution authoritative sync for approved structures */ |
| v500 | 32539–32602 | structure | 1 | `MZJ_v499_hardSyncApprovedStructure`, `MZJ_v500_syncAllApprovedStructures` | /* MZJ v500 - cache-busted approved structure watcher and stale execution task fixer */ |
| v501 | 32603–32660 | structure | 1 | `MZJ_v499_hardSyncApprovedStructure`, `MZJ_v500_syncAllApprovedStructures`, `MZJ_v501_syncAllApprovedStructures`, `MZJ_v501_syncApprovedStructureCampaign` | /* MZJ v501 - fix approved structure no longer shown as waiting for structure + realtime campaign cleanup */ |
| v502 | 32661–32946 | dashboard | 2 | `anchor`, `openTaskModal`, `refreshOpenTaskModal` | /* MZJ v502 - luxury user task details layout only */ |
| v503 | 32947–33062 | dashboard | 1 | `MZJ_V503_OPEN_READY_CAMPAIGN`, `renderAdminDashboard`, `toggleCampaignInlineTasks` | /* v503 - stable readiness inline task expansion only */ |
| v504 | 33063–33177 | dashboard | 1 | — | /* v504 - robust user task detail assignment actions only */ |
| v505 | 33178–33296 | other | 0 | `MZJ_v505_needsContentApproval`, `campaignTasksSnapshot`, `receivedClass`, `receivedLabel`, `renderAdminDashboard` | /* v505 - strict first content user approval waiting detector only */ |
| v506 | 33297–33469 | dashboard | 0 | `MZJ_v506_splitExecByLinkedWriters`, `adminDashboardTasksForCampaign`, `buildDepartmentTasks`, `campaignTasksSnapshot`, `getVisibleTasksForCurrentUser`, `tasksForCampaign` | /* v506 - split execution dashboard cards per linked content writer */ |
| v507 | 33470–33542 | other | 0 | `buildDepartmentTasks` | /* v507 - use legacy per-writer execution pairing logic from v470 without importing old bugs */ |
| v508 | 33543–33597 | dashboard | 0 | `MZJ_LAST_PATCH`, `campaignTasksSnapshot` | /* v508 - repair dashboard campaign snapshot after v507 per-writer split */ |
| v509 | 33598–33763 | task_template | 0 | `MZJ_v509_taskTemplateFields`, `buildTaskDetailHtml`, `v171OpenTaskTemplateReview`, `v175RenderTaskTemplateReviewView` | /* v509 - professional Task Template review + readable approved script layout (UI/read only) */ |
| v510 | 33764–33977 | task_template | 0 | `adminDashboardTasksForCampaign`, `buildDepartmentTasks`, `buildTaskDetailHtml`, `findTaskById`, `getVisibleTasksForCurrentUser`, `tasksForCampaign` | /* v510 - stabilize content structure count + persist approved Task Template display after refresh */ |
| v516 | 33978–34088 | task_template | 0 | `MZJ_v516_approveStructure`, `MZJ_v516_decideTaskTemplate`, `buildDepartmentTasks`, `isTaskWaitingForDependency`, `setStructureStatus`, `v174SetTaskTemplateDecision` | /* MZJ v516 - final campaign flow rewrite from source (structure -> content template -> execution) */ |
| v519 | 34089–34252 | task_template | 0 | `buildTaskDetailHtml`, `isTaskWaitingForDependency`, `publishPrepHasFinalFile`, `shortTaskName`, `structureTaskNumber`, `taskWorkflowStatus` | /* v519 - approved Task Template release + clean visible task numbers + no final-file gate for content tasks */ |
| v520 | 34253–34401 | task_template | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v519_approveTaskTemplate`, `MZJ_v520_approveTaskTemplate`, `v171ApproveTaskTemplate`, `v174SetTaskTemplateDecision` | /* v520 - strict Task Template approval matching: no duplicate content cards, no broad template injection */ |
| v522 | 34402–34562 | task_template | 0 | `MZJ_v516_approveStructure`, `MZJ_v516_decideTaskTemplate`, `MZJ_v520_approveTaskTemplate`, `MZJ_v522_approveStructure`, `MZJ_v522_decideTaskTemplate`, `isTaskWaitingForDependency` | /* v522 - structure approval releases same writer execution tasks; Task Template data is scoped by full task code suffix (B01/N01) */ |
| v523 | 34563–34760 | other | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v520_approveTaskTemplate`, `MZJ_v522_decideTaskTemplate`, `MZJ_v523_decideTaskTemplate`, `shortTaskName`, `structureTaskNumber` | /* v523 - unified task-code templates + exact approved template scope + exec stays active, not completed */ |
| v524 | 34761–34852 | structure | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v520_approveTaskTemplate`, `MZJ_v522_decideTaskTemplate`, `MZJ_v523_decideTaskTemplate`, `MZJ_v524_approveStructure`, `MZJ_v524_decideTaskTemplate` | /* MZJ v524 - authoritative campaign document linking: structure -> template -> exact execution */ |
| v525 | 34853–34920 | other | 0 | `MZJ_v525_decideTaskTemplate`, `actualTaskNo`, `shortTaskName`, `structureTaskNumber` | /* MZJ v525 - strict user-facing task suffixes + exact approved template visibility */ |
| v526 | 34921–34991 | other | 0 | `actualTaskNo`, `shortTaskName`, `structureTaskNumber` | /* MZJ v526 - hard stop broad template fallback + forced user-facing suffix everywhere */ |
| v527 | 34992–35072 | task_template | 0 | `MZJ_v527_decideTaskTemplate` | /* MZJ v527 - no template bleed: exact suffix/pair only + execution never completed by content template */ |
| v528 | 35073–35168 | task_template | 0 | `MZJ_v528_decideTaskTemplate` | /* MZJ v528 - one-to-one content template binding; content completes, execution stays manual */ |
| v529 | 35169–35237 | task_template | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v524_decideTaskTemplate`, `MZJ_v525_decideTaskTemplate`, `MZJ_v526_decideTaskTemplate`, `MZJ_v527_decideTaskTemplate`, `MZJ_v528_decideTaskTemplate` | /* MZJ v529 - fix Task Template review buttons id binding */ |
| v530 | 35238–35269 | task_template | 0 | `MZJ_LAST_PATCH`, `MZJ_v516_decideTaskTemplate`, `MZJ_v524_decideTaskTemplate`, `MZJ_v525_decideTaskTemplate`, `MZJ_v526_decideTaskTemplate`, `MZJ_v527_decideTaskTemplate` | /* MZJ v530 - define campaign collection global for Task Template approval handlers */ |
| v531 | 35270–35791 | campaign_creation | 4 | `MZJ_v531_buildCleanDepartmentTasks`, `MZJ_v531_renderCreateCampaign` | /* MZJ v531 - clean create campaign page and one-to-one clean creation model */ |
| v533 | 35792–35890 | campaign_creation | 1 | `renderRoute` | /* MZJ v533 - clean one-page create campaign layout matching approved concept */ |
| v534 | 35891–35957 | campaign_creation | 1 | — | /* MZJ v534 - hard clean create campaign DOM and fit approved one-page layout */ |
| v543 | 35958–35959 | other | 0 | — | /* MZJ v543 - v537/v538 legacy create-campaign overrides removed; stable v543 logic below */ |
| v543 | 35960–36019 | campaign_creation | 2 | — | /* MZJ v543 - stable creative selection from v538 source */ |
| v545 | 36020–36132 | campaign_creation | 3 | — | /* MZJ v545 - safe create campaign layout cleanup from v543 */ |
| v546 | 36133–36207 | campaign_creation | 2 | — | /* MZJ v546 - targeted create campaign visual cleanup from v545 */ |
| v548 | 36208–36282 | campaign_creation | 3 | — | /* MZJ v548 - saved creative cards and inline content-writer receiving dates */ |
| v550 | 36283–36303 | campaign_creation | 1 | — | /* MZJ v550 - multiple saved creatives container */ |
| v552 | 36304–36394 | other | 3 | — | /* MZJ v552 - stable inline writer receiving date picker */ |
| v553 | 36395–36457 | other | 2 | — | /* MZJ v553 - remove legacy empty review-save panel */ |
| v557 | 36458–36607 | other | 3 | `saveCampaignToFirebase` | /* MZJ v557 - reliable car search and marketing_campaigns save guard */ |
| v558 | 36608–36679 | other | 2 | `__MZJ_CREATE_CAMPAIGN_SAVING__`, `originalSaveFn` | /* MZJ v558 - single campaign save guard: prevent duplicate marketing_campaigns writes */ |
| v559 | 36680–36976 | dashboard | 1 | `buildTaskDetailHtml`, `renderUserDashboard` | /* MZJ v559 - user dashboards/cards/details only (content + execution), keep theme/background intact */ |
| v560 | 36977–36995 | campaign_creation | 1 | — | /* MZJ v560 - user dashboard transparency + safe creative labels */ |
| v568 | 36996–37181 | dashboard | 1 | `buildTaskDetailHtml`, `renderUserDashboard`, `toggleTaskStep` | /* MZJ v568 - multi-department user dashboard without section switching; do not change content flow */ |
| v569 | 37182–37235 | dashboard | 0 | `buildTaskDetailHtml` | /* MZJ v569 - show campaign selected cars in content structure task details/dashboard without changing theme */ |
| v570 | 37236–37431 | task_template | 4 | — | /* MZJ v570 - clean structure and task template review engine */ |
| v581 | 37432–37501 | task_template | 0 | `MZJ_v516_approveStructure`, `MZJ_v516_decideTaskTemplate`, `MZJ_v570_approveStructure`, `MZJ_v570_decideTaskTemplate`, `v174SetTaskTemplateDecision` | /* MZJ v581 - targeted flow fixes only: structure label, safe Task Template approval, linked content label */ |
| v583 | 37502–37614 | task_template | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v570_decideTaskTemplate`, `MZJ_v583_decideTaskTemplate`, `v174SetTaskTemplateDecision` | /* MZJ v583 - targeted Task Template approval/detail fixes only */ |
| v584 | 37615–37663 | other | 0 | — | /* MZJ v584 - inline review notes visibility + execution detail cleanup */ |
| v585 | 37664–37820 | task_template | 0 | — | /* MZJ v585 - persistent inline review notes + keep execution tasks execution after Task Template approval */ |
| v586 | 37821–37918 | task_template | 1 | — | /* MZJ v586 - unified review notes storage + hard execution task lock after template approval */ |
| v588 | 37919–38056 | task_template | 0 | — | /* MZJ v588 - strict Task Template vs execution separation after structure/template approval */ |
| v589 | 38057–38140 | campaign_creation | 1 | — | /* MZJ v589 - only requested fixes: one approved Task Template section + safer multi-creative saving */ |
| v590 | 38141–38154 | campaign_creation | 1 | — | /* MZJ v590 - strict multi creative in create campaign builder */ |
| v589b | 38155–38176 | campaign_creation | 1 | — | /* MZJ v589b - save current creative before choosing the next one */ |
| v593 | 38177–38407 | dashboard | 3 | — | /* MZJ v593 - clean content-exec linking + safe template upload + dashboard cards */ |
| v612 | 38408–38611 | other | 4 | — | /* MZJ v612 - old-source safe create layout + per executor content writer/date + exact exec status */ |
| v615 | 38612–38683 | other | 2 | — | /* MZJ v615 - transplanted v603 create link behavior on v612 */ |
| v615 | 38684–38700 | other | 1 | — | /* MZJ v615 - capture create-campaign save buttons for transplanted v603 save */ |
| v217 | 38701–38703 | other | 0 | — | /* v217 - date picker stability fix: date-input events no longer trigger assignment panel cleanup while the native picker is open. */ |
| v618 | 38704–38720 | other | 1 | — | /* v618 - keep v603 linked writer date fields stable. |
| v619 | 38721–38734 | dashboard | 0 | — | /* MZJ v619 - keep user theme buttons visible above executive dashboard title */ |
| v756 | 38735–39242 | dashboard | 0 | `__MZJ_V677_FLOW__`, `__MZJ_V677_LIVE__`, `campaigns`, `renderAdminDashboard` | /* MZJ v756 - clean dashboard flow with strict final-upload progress and campaign groups */ |
| v753 | 39243–39948 | other | 6 | `refreshOpenTaskModal` | // v753: نستخدم المسارات المحفوظة من rawSource أولاً لأنها راجعة من إنشاء الفولدرات الحقيقي. |
| v649 | 39949–40179 | campaign_creation | 5 | `__MZJ_V649_CREATE_CAMPAIGN__` | /* MZJ v649 create campaign approved 3-step concept rebuild */ |
| v699 | 40180–40193 | other | 1 | — | /* MZJ v699 - luxury owner/writer badges with stronger professional border */ |
| v702 | 40194–40450 | publish_prep | 2 | `getPublishingPrepTasks`, `openTaskModal`, `publishPrepEffectiveCaption`, `publishPrepEffectiveHashtags`, `publishPrepFinalFileRecord`, `publishPrepHasFinalFile` | /* MZJ v702 - final file upload for completed task details + publish prep mirrors TASK required details */ |
| v703 | 40451–40453 | publish_prep | 0 | — | /* MZJ v703 removed: final upload is integrated in execDetails original flow. */ |
| v721 | 40454–40563 | dashboard | 0 | `adminDashboardTasksForCampaign`, `campaignTasksSnapshot`, `tasksForCampaign` | /* v721 - restore structure request in TASK required/readiness until admin approval */ |
| v723 | 40564–40573 | other | 1 | — | /* v723 - keep publish release button independent from campaign card open */ |
| v726 | 40574–40749 | publish_prep | 0 | `getPublishingPrepTasks`, `publishPrepEffectivePlatforms`, `publishPrepFinalFileRecord`, `publishPrepHasEffectivePlatformTypeData`, `publishPrepHasFinalFile`, `publishPrepTaskProgress` | /* MZJ v726 - publish prep reconcile duplicate task cards and final-file metadata */ |
| v729 | 40750–40970 | dashboard | 0 | `getPublishingPrepTasks`, `publishPrepFinalFileRecord`, `publishPrepHasFinalFile`, `publishPrepTaskProgress` | /* MZJ v729 - publish prep uses real dashboard tasks only */ |
| v730 | 40971–41027 | publish_prep | 3 | `renderPublishPrepPage` | /* v730 publish prep page only redesign */ |
| v732 | 41028–41129 | publish_prep | 3 | `renderPublishPrepPage` | /* v732 - publish prep only: short names + clean edit modal + multi post types */ |
| v97 | 41130–41335 | dashboard | 1 | `__MZJ_ADD_ADMIN_NOTIFICATION__`, `__MZJ_V97_ADMIN_NOTIFICATIONS__`, `adminNotificationItems`, `notificationItemHtml`, `pushAdminCampaignNotification`, `showLiveNotification` | /* v97 - admin notification targets + reliable task action notifications */ |
| v97 | 41336–41542 | dashboard | 1 | `__MZJ_ADD_ADMIN_NOTIFICATION__`, `__MZJ_V97_ADMIN_NOTIFICATIONS__`, `adminNotificationItems`, `notificationItemHtml`, `pushAdminCampaignNotification`, `showLiveNotification` | /* v97 - admin notification targets + reliable task action notifications */ |
| v717 | 41543–41947 | other | 6 | — | /* MZJ v717 - clean 5 step campaign creation flow refinements */ |
| v722 | 41948–41950 | task_template | 0 | — | /* v722 - content Task Template details: remove content fields and add admin note */ |
| v723 | 41951–42036 | task_template | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v522_decideTaskTemplate`, `MZJ_v570_decideTaskTemplate`, `v174SetTaskTemplateDecision` | /* v723 - clean 5-step flow: open execution tasks after Task Template approval */ |
| v724 | 42037–42250 | task_template | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v522_decideTaskTemplate`, `MZJ_v570_decideTaskTemplate`, `v174SetTaskTemplateDecision` | /* v724 - correct content-first flow: approving Task Template releases existing execution task cards */ |
| v725 | 42251–42457 | task_template | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v522_decideTaskTemplate`, `MZJ_v570_decideTaskTemplate`, `getVisibleTasksForCurrentUser`, `isTaskWaitingForDependency`, `tasksForCampaign` | /* v725 - final content-first release: approved Task Template makes the existing execution task visible and carries approved details */ |
| v726 | 42458–42575 | campaign_creation | 0 | `MZJ_v516_decideTaskTemplate`, `MZJ_v522_decideTaskTemplate`, `MZJ_v570_decideTaskTemplate`, `MZJ_v724_decideTaskTemplate`, `MZJ_v725_decideTaskTemplate`, `MZJ_v726_decideTaskTemplate` | /* MZJ v726 - remove legacy task-distribution conflict: content-first Task Template approval releases existing execution tasks by pair/writer/creative */ |
| v729 | 42576–42577 | task_template | 0 | — | /* MZJ v729: execution task template view shows script only as split scenes/slides, no duplicate full script block. */ |
| v736 | 42578–42578 | dashboard | 0 | — | /* MZJ v736 - direct dashboard grouping; removed legacy admin post-process patches. */ |
| v735 | 42579–42581 | task_template | 0 | — | /* MZJ v735: Task Template approval stays active; not completed/hidden. */ |
| v737 | 42582–42584 | dashboard | 0 | — | /* MZJ v737: readiness column shows each campaign first; opening it reveals department task groups. */ |
| v750 | 42585–42585 | other | 0 | — | /* v750 - direct mzjfolder user-gesture launch */ |
| v752 | 42586–42620 | task_details | 1 | `MZJ_COPY_RAIDRIVE_PATH`, `MZJ_OPEN_RAIDRIVE_PATH`, `copyRaiDrivePath`, `copyRaidrivePath`, `openRaiDrivePath`, `openRaidrivePath` | /* v752 - clean raw task paths without breaking task details */ |

## نتيجة الدمج المقترحة

الدمج يجب أن يتم حسب الوظيفة، وليس حسب رقم الإصدار. ترتيب الوحدات المقترح:

1. `campaign-flow` — إنشاء الحملة وحفظها.
2. `task-pairing` — علاقة الكرييتيف × المنفذ × كاتب المحتوى.
3. `task-template-flow` — الرفع، المراجعة، الرفض، إعادة الرفع، الاعتماد.
4. `task-visibility` — ما يظهر لكل يوزر وأدمن.
5. `dashboard-flow` — التجميع والكانبان والتحديث.
6. `task-details` — فتح التفاصيل والبيانات والملفات.
7. `publish-prep` — تجهيز النشر والملف النهائي.

لا يتم حذف أي سلسلة قديمة قبل مقارنة ناتج الوحدة الجديدة معها في نفس البيانات.