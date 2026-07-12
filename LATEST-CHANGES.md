# Latest changes

- Restored dashboard task/campaign data by keeping completion text as a visual label only; task classification/status logic was not changed.
- Tasks at 100% display `مكتمل` in cards and details.
- Campaign Management `آخر تحديث` uses the latest known action timestamp across the campaign and its tasks.
- Content Task Template progress in campaign-management task tables is 0% before upload, 50% while uploaded/reviewing/needs changes, and 100% after approval/completion.
- Campaign Management and Database tables fill their cards.
- `عرض البيانات` and `إجراءات` columns are compact instead of consuming excessive width.
- No changes to task pairing, distribution, approvals, uploads, or dashboard filtering.

## جاهزية المطلوب - تقدم الأقسام
- متوسط تقدم كل قسم أصبح يعتمد على النسبة الفعلية لكل تاسك.
- عداد القسم يعرض عدد التاسكات التي بدأت فعليًا من إجمالي التاسكات.
- مثال: 35% + 0% + 0% يعرض 1/3 و12% بدل 0/3 و0%.

## فصل ملخص اليوزرات حسب القسم والدور
- تم تعديل جدول "التاسكات التنفيذية واليوزرات" في صفحة قاعدة البيانات.
- التجميع أصبح حسب اليوزر + القسم + نوع الفلو (Task Template أو تاسك تنفيذي).
- نفس الحساب إذا كان موجودًا في قسم المحتوى وقسم تنفيذي يظهر في سطرين مستقلين.
- لم يتم تعديل HTML أو CSS أو الداش بورد أو بيانات التاسكات.
