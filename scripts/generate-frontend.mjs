import fs from "fs";
import path from "path";

const root = process.cwd();

function write(rel, content) {
  const fixed = content.replaceAll("<motion", "<motion").replaceAll("</motion>", "</motion>");
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, fixed);
  console.log("wrote", rel);
}

// Fix motion -> div in content before write
function w(rel, content) {
  const fixed = content
    .replaceAll("<motion", "<motion")
    .replaceAll("</motion>", "</motion>");
  write(rel, fixed);
}
