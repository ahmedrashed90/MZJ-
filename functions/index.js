const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');

admin.initializeApp();
const db = admin.firestore();

const SITE_URL = (process.env.MZJ_SITE_URL || 'https://mzj.vercel.app').replace(/\/$/, '');
const READY_PUBLISH_ENDPOINT = `${SITE_URL}/api/meta/ready-publish`;
const TASK_LIMIT = Number(process.env.AUTO_PUBLISH_LIMIT || 20);
const TZ = 'Asia/Riyadh';

function normalizePlatform(platform) {
  const text = String(platform || '').trim().toLowerCase();
  if (text.includes('facebook') || text.includes('فيس')) return 'facebook';
  if (text.includes('instagram') || text.includes('انست')) return 'instagram';
  if (text.includes('tiktok') || text.includes('تيك')) return 'tiktok';
  if (text.includes('youtube') || text.includes('you tube') || text.includes('يوتيوب')) return 'youtube';
  if (text.includes('snapchat') || text.includes('snap chat') || text.includes('snap') || text.includes('سناب')) return 'snapchat';
  return text;
}

function parsePlatforms(value) {
  const arr = Array.isArray(value) ? value : String(value || '').split(/[,،+]/);
  return [...new Set(arr.map(normalizePlatform).filter(Boolean))];
}

function normalizePostType(value) {
  const text = String(value || '').trim().toLowerCase();
  if (text.includes('photo') || text.includes('image') || text.includes('بوست صور') || text.includes('صورة')) return 'photo_post';
  if (text.includes('story') || text.includes('ستوري')) return 'story';
  if (text.includes('hd') || text.includes('فيديو hd')) return 'hd_video';
  if (text.includes('reel') || text.includes('short') || text.includes('ريل')) return 'reel';
  return text;
}

function postTypeLabel(value) {
  const type = normalizePostType(value);
  return ({ photo_post: 'بوست صور', reel: 'ريل', story: 'ستوري', hd_video: 'فيديو HD' })[type] || type || '';
}

function riyadhParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false
  }).formatToParts(date).reduce((acc, part) => { acc[part.type] = part.value; return acc; }, {});
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour || 0) };
}

function dayNumber(dateText) {
  const value = String(dateText || '').slice(0, 10);
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 86400000);
}

function getPlatformHours(settings = {}) {
  const oldHour = Number.isFinite(Number(settings.autoPublishHour)) ? Number(settings.autoPublishHour) : 12;
  const raw = settings.autoPublishPlatformHours || {};
  const allowedHours = [15, 18, 21, 12];
  const hour = (value, fallback) => {
    const n = Number(value);
    if (allowedHours.includes(n)) return n;
    if (allowedHours.includes(Number(fallback))) return Number(fallback);
    return allowedHours.includes(oldHour) ? oldHour : 12;
  };
  return {
    facebook: hour(raw.facebook, 15),
    instagram: hour(raw.instagram, 18),
    tiktok: hour(raw.tiktok, 21),
    youtube: hour(raw.youtube, 12),
    snapchat: hour(raw.snapchat, 18),
    default: hour(raw.default, oldHour)
  };
}

function platformHour(platform, hours) {
  return Number.isFinite(Number(hours[platform])) ? Number(hours[platform]) : Number(hours.default || 12);
}

function taskPublishDate(task) {
  return String(task.publishDate || task.scheduleDate || (task.taskSnapshot && task.taskSnapshot.publishDate) || '').trim().slice(0, 10);
}

function taskExplicitTime(task) {
  return String(task.publishTime || task.scheduleTime || (task.taskSnapshot && task.taskSnapshot.publishTime) || '').trim();
}

function isPlatformDue(task, platform, settings, nowInfo) {
  if (!task.readyForPublish) return false;
  const date = taskPublishDate(task);
  if (!date) return false;
  const todayN = dayNumber(nowInfo.date);
  const taskN = dayNumber(date);
  if (todayN === null || taskN === null || taskN > todayN) return false;

  const platformState = task.platformPublishState || {};
  const state = platformState[platform] || {};
  if (state.publishedAt || state.status === 'تم النشر' || state.status === 'skipped') return false;

  if (taskN < todayN) return true;

  const explicit = taskExplicitTime(task);
  if (explicit) {
    const h = Number(explicit.slice(0, 2));
    return Number.isFinite(h) ? nowInfo.hour >= h : true;
  }

  const hours = getPlatformHours(settings);
  return nowInfo.hour >= platformHour(platform, hours);
}

function normalizeYouTubePrivacyStatus(value) {
  const text = String(value || '').trim().toLowerCase();
  return ['public', 'unlisted', 'private'].includes(text) ? text : 'unlisted';
}

function buildPayload(task, platform, settings = {}) {
  const snapshot = task.taskSnapshot || {};
  return {
    taskId: task.taskId || task.id,
    title: task.title || snapshot.title || task.campaignName || snapshot.campaignName || 'تاسك تجهيز نشر',
    contentType: task.contentType || task.type || snapshot.contentType || snapshot.type || task.requiredFile || '',
    postType: normalizePostType(task.postType || snapshot.postType || ''),
    postTypeLabel: task.postTypeLabel || snapshot.postTypeLabel || postTypeLabel(task.postType || snapshot.postType || ''),
    requiredDimensions: task.requiredDimensions || snapshot.requiredDimensions || null,
    platforms: [platform],
    caption: String(task.caption || '').trim(),
    hashtags: String(task.hashtags || '').trim(),
    mediaUrl: task.finalFileUrl || task.fileUrl || (task.finalFileRecord && task.finalFileRecord.downloadURL) || (task.finalFileRecord && task.finalFileRecord.fileUrl) || '',
    finalFileUrl: task.finalFileUrl || task.fileUrl || '',
    fileName: task.finalFileName || task.fileName || (task.finalFileRecord && task.finalFileRecord.fileName) || '',
    mimeType: task.mimeType || (task.finalFileRecord && task.finalFileRecord.mimeType) || (task.finalFileRecord && task.finalFileRecord.type) || '',
    youtubePrivacyStatus: normalizeYouTubePrivacyStatus(task.youtubePrivacyStatus || settings.youtubePrivacyStatus || 'unlisted')
  };
}

async function callPublish(payload) {
  const response = await fetch(READY_PUBLISH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok && !data.results) throw new Error(data.error || `Publish endpoint failed: ${response.status}`);
  return data;
}

async function writeLog(taskId, task, platform, result, mode = 'scheduled') {
  const now = new Date().toISOString();
  const ok = Boolean(result && result.ok);
  const skipped = Boolean(result && result.skipped);
  const logId = `log_${String(taskId).replace(/[^a-zA-Z0-9_-]/g, '-')}_${platform}_${Date.now()}`;
  await db.collection('publish_logs').doc(logId).set({
    id: logId,
    taskId,
    sourceType: 'publish-prep',
    title: task.title || (task.taskSnapshot && task.taskSnapshot.title) || 'تاسك تجهيز نشر',
    caption: task.caption || '',
    hashtags: task.hashtags || '',
    platform,
    platforms: [platform],
    type: task.postType || (task.taskSnapshot && task.taskSnapshot.postType) || task.contentType || (task.taskSnapshot && task.taskSnapshot.contentType) || task.type || '',
    postType: normalizePostType(task.postType || (task.taskSnapshot && task.taskSnapshot.postType) || ''),
    postTypeLabel: task.postTypeLabel || (task.taskSnapshot && task.taskSnapshot.postTypeLabel) || postTypeLabel(task.postType || (task.taskSnapshot && task.taskSnapshot.postType) || ''),
    requiredDimensions: task.requiredDimensions || (task.taskSnapshot && task.taskSnapshot.requiredDimensions) || null,
    mode,
    status: ok ? 'تم النشر' : (skipped ? 'تم التخطي' : 'فشل النشر'),
    error: (result && result.error) || '',
    resultId: (result && (result.id || result.postId || (result.result && result.result.id) || (result.publish && result.publish.id))) || '',
    raw: result || null,
    createdAt: now,
    publishedAt: now
  }, { merge: true });
}

async function runAutoPublishOnce() {
  const settingsSnap = await db.collection('system_settings').doc('main').get();
  const settings = settingsSnap.exists ? (settingsSnap.data() || {}) : {};
  const enabled = settings.autoPublishEnabled !== false;
  const nowInfo = riyadhParts(new Date());
  const result = { ok: true, enabled, now: nowInfo, checked: 0, due: 0, processed: [] };
  if (!enabled) return result;

  const snapshot = await db.collection('publish_prep_tasks').where('readyForPublish', '==', true).limit(TASK_LIMIT).get();
  result.checked = snapshot.size;

  for (const doc of snapshot.docs) {
    const task = { id: doc.id, ...doc.data() };
    const platforms = parsePlatforms(task.platforms || (task.taskSnapshot && task.taskSnapshot.platforms) || '');
    const duePlatforms = platforms.filter(platform => isPlatformDue(task, platform, settings, nowInfo));
    if (!duePlatforms.length) continue;
    result.due += duePlatforms.length;

    const platformPublishState = { ...(task.platformPublishState || {}) };
    for (const platform of duePlatforms) {
      const payload = buildPayload(task, platform, settings);
      const publishedAt = new Date().toISOString();
      try {
        const publishResponse = await callPublish(payload);
        const platformResult = Array.isArray(publishResponse.results) ? (publishResponse.results[0] || publishResponse) : publishResponse;
        await writeLog(doc.id, task, platform, platformResult, 'scheduled');
        platformPublishState[platform] = {
          status: platformResult.ok ? 'تم النشر' : (platformResult.skipped ? 'تم التخطي' : 'فشل النشر'),
          publishedAt: platformResult.ok ? publishedAt : null,
          skippedAt: platformResult.skipped ? publishedAt : null,
          failedAt: (!platformResult.ok && !platformResult.skipped) ? publishedAt : null,
          error: platformResult.error || ''
        };
        result.processed.push({ taskId: doc.id, platform, ok: Boolean(platformResult.ok), skipped: Boolean(platformResult.skipped), error: platformResult.error || '' });
      } catch (error) {
        await writeLog(doc.id, task, platform, { ok: false, error: error.message || String(error) }, 'scheduled');
        platformPublishState[platform] = { status: 'فشل النشر', failedAt: publishedAt, error: error.message || String(error) };
        result.processed.push({ taskId: doc.id, platform, ok: false, error: error.message || String(error) });
      }
    }

    const allDone = platforms.length > 0 && platforms.every(platform => {
      const state = platformPublishState[platform] || {};
      return state.publishedAt || state.skippedAt || state.status === 'تم النشر' || state.status === 'تم التخطي' || state.status === 'skipped';
    });

    await doc.ref.set({
      platformPublishState,
      lastAutoPublishCheckAt: new Date().toISOString(),
      status: allDone ? 'تم النشر' : 'جاهز للنشر',
      publishedAt: allDone ? new Date().toISOString() : (task.publishedAt || null),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  return result;
}

exports.autoPublishScheduledPosts = onSchedule({
  schedule: 'every 60 minutes',
  timeZone: TZ,
  memory: '512MiB',
  timeoutSeconds: 540
}, async () => {
  const result = await runAutoPublishOnce();
  logger.info('autoPublishScheduledPosts result', result);
});

exports.runAutoPublishNow = onRequest({
  cors: true,
  memory: '512MiB',
  timeoutSeconds: 540
}, async (req, res) => {
  try {
    const result = await runAutoPublishOnce();
    res.status(200).json({ ok: true, deployed: 'structure-distribution-rows-fix-v55', ...result });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ ok: false, deployed: 'structure-distribution-rows-fix-v55', error: error.message || String(error) });
  }
});
