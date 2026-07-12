# Latest merged-flow changes

- Keeps the existing UI and CSS unchanged.
- Keeps the independent Task Template pair distribution.
- Keeps RAW/OUTPUT folders in execution-task details.
- Final-file upload becomes available after the last admin approval step:
  - shooting: second approval
  - montage: second approval
  - design: its single approval
- Content-department Task Template cards show `تم الانتهاء` at 100%.
- Clicking `تم الانتهاء` marks only that Task Template as user-completed and moves it to `التاسكات المنتهية`.
- Execution tasks are not affected by the content Task Template completion action.


## Admin keeps user-completed Task Templates
- زر تم الانتهاء يسجل اكتمال Task Template في عرض اليوزر فقط.
- لا يغير status/state العام للتاسك إلى completed.
- Task Template يظل ضمن تفاصيل جاهزية المطلوب في داش بورد الأدمن ويتحسب 100%.
- في داش بورد اليوزر ينتقل إلى التاسكات المنتهية.
