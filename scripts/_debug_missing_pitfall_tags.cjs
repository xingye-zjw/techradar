// Find pitfalls missing `tags` array
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const ROOT = process.cwd();
const DIRS = [path.join(ROOT, 'content', 'intel'), path.join(ROOT, 'content', 'pitfall')];
const missing = [];
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const fn of fs.readdirSync(dir)) {
    if (!/pitfall.*\.md$/.test(fn)) continue;
    const fp = path.join(dir, fn);
    try {
      const m = matter(fs.readFileSync(fp, 'utf8'));
      const tags = m.data.tags;
      const ok = Array.isArray(tags) && tags.filter(x => typeof x === 'string' && x.trim()).length > 0;
      if (!ok) missing.push(path.relative(ROOT, fp));
    } catch (e) { console.log('ERR', fn, e.message); }
  }
}
console.log('Missing tags count:', missing.length);
missing.forEach(x => console.log('  -', x));
