const fs = require('fs');
const vm = require('vm');
const ctx = { window: {}, self: {}, global: {}, setTimeout, clearTimeout, Promise, Uint8Array, ArrayBuffer, Blob: function(){} };
ctx.window = ctx; ctx.self = ctx; ctx.global = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('/mnt/data/v141_work/assets/js/jszip.min.js','utf8'), ctx);
const app = fs.readFileSync('/mnt/data/v141_work/assets/js/app.js','utf8');
const m = app.match(/const STRUCTURE_TEMPLATE_BASE64_V141 = '([^']+)'/);
console.log('base64 found', !!m, m && m[1].length);
(async()=>{
  const zip = await ctx.JSZip.loadAsync(m[1], {base64:true});
  const f = zip.file('xl/worksheets/sheet1.xml');
  console.log('sheet exists', !!f);
  const xml = await f.async('string');
  console.log('xml size', xml.length, xml.slice(0,50));
})();
