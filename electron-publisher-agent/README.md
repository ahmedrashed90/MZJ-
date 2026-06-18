# MZJ Publisher Agent

وكيل النشر المحلي لنظام MZJ.

## v38

- واجهة Electron جديدة بتنسيق احترافي.
- ترتيب الستوري رقميًا حسب بداية اسم الملف: `1`, `2`, `10` وليس ترتيب نصي.
- حفظ `storyOrder` و `sortOrder` داخل كل Job.
- إضافة دقيقة تلقائيًا بين كل ستوري والثانية حسب الترتيب.
- إيقاف Facebook Story مؤقتًا حتى لا ينزل كـ Post عادي.
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
- Facebook Story متوقف مؤقتًا حتى لا يتم نشره كمنشور عادي بالخطأ.
- Instagram Story يحتاج ملفات بأبعاد وصيغ مقبولة ورابط Storage متاح للعامة.
