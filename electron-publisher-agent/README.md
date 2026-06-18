# MZJ Publisher Agent

وكيل النشر المحلي لنظام MZJ.

## v38

- واجهة Electron جديدة بتنسيق احترافي.
- ترتيب الستوري رقميًا حسب بداية اسم الملف: `1`, `2`, `10` وليس ترتيب نصي.
- حفظ `storyOrder` و `sortOrder` داخل كل Job.
- إضافة دقيقة تلقائيًا بين كل ستوري والثانية حسب الترتيب.
- دعم Facebook Story كمسار منفصل عن Facebook Post.
- تحسين تشخيص Instagram Story عند عدم رجوع Media ID، مع حفظ رد Meta كاملًا داخل الخطأ.
- انتظار قصير بعد رفع الملف إلى Firebase Storage قبل إرسال الرابط إلى Meta.
- استمرار دعم `npm run dist` كـ Portable EXE.

## التشغيل

```powershell
npm install
npm start
```

## بناء نسخة Portable

```powershell
npm run dist
```

## ملاحظات

- Facebook Post/Reel يعملان عبر نفس مسار النشر الموجود في صفحة تجهيز النشر.
- Facebook Story يستخدم مسار photo_stories/video_stories ولا يستخدم مسار البوست العادي.
- Instagram Story يحتاج ملفات بأبعاد وصيغ مقبولة ورابط Storage متاح للعامة.


## v40 TikTok + Reel Story Rules

- TikTok now creates jobs for Post, Reel, and Story.
- TikTok Post uses image files from the `ستوري` folder, not the `بوست` folder.
- Reel videos from the `ريل` folder are also created as Story jobs for Facebook, Instagram, and TikTok.
- Video files placed inside the `ستوري` folder are also created as Reel jobs for Facebook, Instagram, and TikTok.
- Story order remains numeric using the file name prefix and the generated `storyOrder` field.
