const fs = require("fs");
const files = process.argv.slice(2);
for (const p of files) {
  let c = fs.readFileSync(p, "utf8");
  c = c.replace(/<\/?motion\b/g, (m) => (m.startsWith("</") ? "</div>" : "<div"));
  fs.writeFileSync(p, c);
  console.log(p, c.includes("motion") ? "WARN" : "ok");
}
