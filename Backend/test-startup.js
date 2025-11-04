// Simple test script to verify Node.js can start
// Run this via Kudu Console: node test-startup.js
// Compatible with older Node.js versions (ES5 syntax)

console.log("Testing Node.js startup...");
console.log("Node version:", process.version);
console.log("Working directory:", process.cwd());
console.log("PORT:", process.env.PORT || "not set");

var fs = require("fs");
var path = require("path");

console.log("\nChecking for required files:");
var files = [
  "package.json",
  "src/index.js",
  "src/app.js",
  "web.config"
];

files.forEach(function(file) {
  var fullPath = path.join(process.cwd(), file);
  var exists = fs.existsSync(fullPath);
  var status = exists ? "OK" : "MISSING";
  var icon = exists ? "[OK]" : "[MISSING]";
  console.log("  " + icon + " " + file + " - " + status);
});

console.log("\nChecking for node_modules:");
var nodeModulesPath = path.join(process.cwd(), "node_modules");
if (fs.existsSync(nodeModulesPath)) {
  console.log("  [OK] node_modules exists");
  var expressPath = path.join(nodeModulesPath, "express");
  if (fs.existsSync(expressPath)) {
    console.log("  [OK] express module found");
  } else {
    console.log("  [MISSING] express module NOT found");
  }
} else {
  console.log("  [MISSING] node_modules MISSING - run 'npm install --production'");
}

console.log("\nChecking package.json:");
var packageJsonPath = path.join(process.cwd(), "package.json");
if (fs.existsSync(packageJsonPath)) {
  try {
    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    console.log("  [OK] package.json found");
    console.log("  Name:", packageJson.name);
    console.log("  Start script:", packageJson.scripts && packageJson.scripts.start || "not set");
  } catch (e) {
    console.log("  [ERROR] Could not parse package.json:", e.message);
  }
} else {
  console.log("  [MISSING] package.json not found");
}

console.log("\nBasic checks complete. If all files exist, try running:");
console.log("   node src/index.js");
console.log("\nIf node_modules is missing, run:");
console.log("   npm install --production");

