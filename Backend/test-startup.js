// Simple test script to verify Node.js can start
// Run this via Kudu Console: node test-startup.js

console.log("Testing Node.js startup...");
console.log("Node version:", process.version);
console.log("Working directory:", process.cwd());
console.log("PORT:", process.env.PORT || "not set");

const fs = require("fs");
const path = require("path");

console.log("\nChecking for required files:");
const files = [
  "package.json",
  "src/index.js",
  "src/app.js",
  "web.config"
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${file} - ${exists ? 'exists' : 'MISSING'}`);
});

console.log("\nChecking for node_modules:");
const nodeModulesPath = path.join(process.cwd(), "node_modules");
if (fs.existsSync(nodeModulesPath)) {
  console.log("  ✅ node_modules exists");
  const expressPath = path.join(nodeModulesPath, "express");
  if (fs.existsSync(expressPath)) {
    console.log("  ✅ express module found");
  } else {
    console.log("  ❌ express module NOT found");
  }
} else {
  console.log("  ❌ node_modules MISSING - run 'npm install --production'");
}

console.log("\n✅ Basic checks complete. If all files exist, try running:");
console.log("   node src/index.js");

