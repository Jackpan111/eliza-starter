const fs = require("fs");
const path = require("path");

const directory = path.resolve(__dirname, "agent-sdk");
const targetSymbols = ["configureSettings", "findNearestEnvFile", "updateRecentMessageState"];
const fileExtensions = [".ts", ".tsx"];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      callback(fullPath);
    }
  });
}

walk(directory, (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let original = content;

  targetSymbols.forEach((symbol) => {
    const importRegex = new RegExp(`^.*\\b${symbol}\\b.*from\\s+['"][^'"]+['"];?`, "gm");
    content = content.replace(importRegex, (line) => `// ⛔️ auto-disabled\n// ${line}`);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log("🔧 Zmodyfikowano:", filePath);
  }
});