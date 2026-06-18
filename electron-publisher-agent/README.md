# MZJ Publisher Agent

برنامج Electron لقراءة أجندة النشر من فولدرات الجهاز وحفظ مهام النشر في Firebase حتى تظهر في صفحة **جدولة النشر المحلي** داخل السيستم.

## طريقة التشغيل

```powershell
cd electron-publisher-agent
npm install
npm start
```

## بناء نسخة Windows

```powershell
npm run dist
```

ملف التثبيت يظهر داخل فولدر `dist`.

## نظام الفولدرات المعتمد

```text
فولدر الأجندة/
├── 17-6/
│   ├── بوست/      ← بوست Carousel واحد بكل الصور
│   ├── ريل/       ← كل فيديو Reel منفصل
│   ├── ستوري/     ← كل ملف Story منفصل
│   └── كابشن/
│       └── كابشن.docx
└── 18-6/
```

## أوقات النشر

الأفضل ضبط أوقات النشر من صفحة **جدولة النشر المحلي** داخل السيستم:

- Facebook: وقت بوست / ريل / ستوري
- Instagram: وقت بوست / ريل / ستوري
- TikTok: وقت ريل أو أي نوع متاح
- YouTube: وقت ريل / Shorts
- Snapchat: وقت ستوري

Electron يقرأ هذه الإعدادات من `system_settings/main.localPublisherPlatformTimes` عند فحص الأجندة، ويقوم بإنشاء Job منفصل لكل منصة وكل نوع محتوى بالوقت المناسب.

## أوامر من السيستم

صفحة السيستم تستطيع تعديل موعد المهمة أو إرسال طلب:

- `manual_publish_requested` للنشر الآن
- `retry_requested` لإعادة المحاولة

زر **فحص أوامر النشر الآن / إعادة المحاولة** داخل Electron يتحقق من هذه الطلبات ويعلم عليها بأن البرنامج استلمها. تنفيذ النشر الفعلي يعتمد على وحدة نشر المنصة عند تفعيلها.


## Windows build

Use the portable build by default:

```powershell
npm install
npm run dist
```

The output will be a portable `.exe` inside `dist`. This avoids NSIS installer errors on some Windows machines.

If you specifically need an installer later, use:

```powershell
npm run dist:installer
```

## v35 - Central platform connections

- Platform links are now expected to be stored in Firebase collection `platform_connections`.
- Link platforms from the web dashboard page "ربط المنصات" on the developer/account device.
- The web API saves Meta / TikTok / YouTube connection status and tokens into Firebase after OAuth callback/status checks.
- Electron on the files device reads `platform_connections` and shows whether each platform is centrally connected.
- Local files still remain on the Electron device; the web dashboard can send commands through `publishing_jobs`.

Important: deploy `firestore.rules` after uploading this version.

## v36 - النشر الفعلي من زر نشر الآن

تم تعديل زر نشر الآن في صفحة جدولة النشر المحلي بحيث يرسل أمر إلى Firebase، وElectron يلتقط الأمر تلقائيًا كل 5 ثوانٍ بدون الحاجة للضغط اليدوي داخل البرنامج.

طريقة التنفيذ الجديدة:
1. Electron يقرأ أمر `manual_publish_requested` أو `retry_requested` من `publishing_jobs`.
2. يغير حالة المهمة إلى `publishing`.
3. يرفع الملف المحلي من `localPath` إلى Firebase Storage داخل `local-publisher-media` للحصول على رابط عام صالح للنشر.
4. يستدعي نفس endpoint المستخدم في صفحة تجهيز النشر: `/api/meta/publish/ready`.
5. يحدث حالة المهمة إلى `published` أو `failed` مع حفظ نتيجة النشر أو الخطأ.

مهم: يجب أن تكون Firebase Storage rules تسمح برفع وقراءة ملفات `local-publisher-media` أو تكون القواعد الحالية تسمح بذلك.
