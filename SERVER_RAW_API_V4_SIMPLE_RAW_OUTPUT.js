const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const PORT = 3030;
const API_TOKEN = "MZJ_RAW_SECRET_2026_CHANGE_ME";
const RAW_ROOT = "/var/www/mzj-raw";
const PUBLIC_BASE_URL = "http://152.239.121.92:8080/raw";

function safeName(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "item";
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeCreative(item, index) {
  const name = item && typeof item === "object" ? (item.name || item.creativeName || item.title || `Creative-${index + 1}`) : item;
  const folderName = item && typeof item === "object" ? (item.folderName || item.creativeFolderName || name) : name;
  return {
    name: String(name || `Creative-${index + 1}`),
    folderName: safeName(folderName || name || `Creative-${index + 1}`),
    creativeInstanceId: item && typeof item === "object" ? (item.creativeInstanceId || item.id || "") : "",
    creativeId: item && typeof item === "object" ? (item.creativeId || "") : "",
    creativeIndex: item && typeof item === "object" ? (item.creativeIndex || index + 1) : index + 1,
    creativeShortCode: item && typeof item === "object" ? (item.creativeShortCode || "") : "",
    cars: asArray(item && item.cars),
    users: asArray(item && item.users),
  };
}

function normalizeCar(car, index) {
  if (typeof car === "string") {
    return { name: car, folderName: safeName(car || `car-${index + 1}`), id: "" };
  }
  const name = car && (car.name || car.label || car.title || car.id || `car-${index + 1}`);
  return {
    name: String(name || `car-${index + 1}`),
    folderName: safeName((car && car.folderName) || name || `car-${index + 1}`),
    id: car && (car.id || car.uniqueSpecKey || car.unique || ""),
  };
}

function normalizeUser(user, index) {
  if (typeof user === "string") {
    return { name: user, folderName: safeName(user || `user-${index + 1}`), uid: "", role: "", department: "" };
  }
  const name = user && (user.name || user.displayName || user.userName || user.uid || `user-${index + 1}`);
  return {
    name: String(name || `user-${index + 1}`),
    folderName: safeName((user && user.folderName) || name || `user-${index + 1}`),
    uid: user && (user.uid || user.id || ""),
    role: user && (user.role || ""),
    department: user && (user.department || ""),
  };
}

function urlJoin(...parts) {
  return parts.map((p, i) => String(p || "").replace(i === 0 ? /\/+$/g : /^\/+|\/+$/g, "")).filter(Boolean).join("/") + "/";
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "mzj-raw-api", layout: "simple-raw-output" });
});

app.post("/api/create-raw-folders", (req, res) => {
  try {
    const token = req.headers["x-api-token"] || req.body.token;
    if (token !== API_TOKEN) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const monthKey = safeName(req.body.monthKey);
    const campaignCode = safeName(req.body.campaignCode);
    const creatives = asArray(req.body.creatives);

    if (!monthKey || !campaignCode || !campaignFolderName || !creatives.length) {
      return res.status(400).json({ ok: false, message: "monthKey, campaignCode, campaignFolderName and creatives are required" });
    }

    const campaignRoot = path.join(RAW_ROOT, monthKey, campaignFolderName);
    ensureDir(campaignRoot);

    const rawFolders = {};

    creatives.forEach((item, index) => {
      const creative = normalizeCreative(item, index);
      const creativePath = path.join(campaignRoot, creative.folderName);
      const rawPath = path.join(creativePath, "01-RAW");
      const outputPath = path.join(creativePath, "02-OUTPUT");

      ensureDir(rawPath);
      ensureDir(outputPath);

      const carsResult = {};
      creative.cars.forEach((rawCar, carIndex) => {
        const car = normalizeCar(rawCar, carIndex);
        const carPath = path.join(rawPath, car.folderName);
        ensureDir(carPath);
        carsResult[car.folderName] = {
          id: car.id,
          name: car.name,
          folderName: car.folderName,
          folderPath: carPath,
          folderUrl: urlJoin(PUBLIC_BASE_URL, monthKey, campaignCode, creative.folderName, "01-RAW", car.folderName),
        };
      });

      const usersResult = {};
      creative.users.forEach((rawUser, userIndex) => {
        const user = normalizeUser(rawUser, userIndex);
        const userOutputPath = path.join(outputPath, user.folderName);
        ensureDir(userOutputPath);
        usersResult[user.folderName] = {
          uid: user.uid,
          name: user.name,
          role: user.role,
          department: user.department,
          folderName: user.folderName,
          folderPath: userOutputPath,
          outputFolderUrl: urlJoin(PUBLIC_BASE_URL, monthKey, campaignCode, creative.folderName, "02-OUTPUT", user.folderName),
        };
      });

      rawFolders[creative.folderName] = {
        name: creative.name,
        folderName: creative.folderName,
        creativeInstanceId: creative.creativeInstanceId,
        creativeId: creative.creativeId,
        creativeIndex: creative.creativeIndex,
        creativeShortCode: creative.creativeShortCode,
        folderPath: creativePath,
        folderUrl: urlJoin(PUBLIC_BASE_URL, monthKey, campaignCode, creative.folderName),
        rawFolderUrl: urlJoin(PUBLIC_BASE_URL, monthKey, campaignCode, creative.folderName, "01-RAW"),
        outputFolderUrl: urlJoin(PUBLIC_BASE_URL, monthKey, campaignCode, creative.folderName, "02-OUTPUT"),
        subFolders: {
          raw: urlJoin(PUBLIC_BASE_URL, monthKey, campaignCode, creative.folderName, "01-RAW"),
          output: urlJoin(PUBLIC_BASE_URL, monthKey, campaignCode, creative.folderName, "02-OUTPUT"),
        },
        cars: carsResult,
        users: usersResult,
      };
    });

    res.json({
      ok: true,
      message: "Raw folders created successfully",
      layout: "simple-raw-output",
      rawBaseUrl: PUBLIC_BASE_URL,
      monthKey,
      campaignCode,
      campaignFolderName,
      campaignFolderUrl: urlJoin(PUBLIC_BASE_URL, monthKey, campaignCode),
      rawFolders,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`MZJ Raw API running on 127.0.0.1:${PORT}`);
});
