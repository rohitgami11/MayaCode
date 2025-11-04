// Minimal health check script for iisnode
// This file should be accessible via: https://your-app.azurewebsites.net/health-check.js
// If this works but index.js doesn't, it's a problem with index.js or its dependencies

process.stderr.write("Health check script executed\n");
process.stderr.write("Node version: " + process.version + "\n");
process.stderr.write("Working directory: " + process.cwd() + "\n");

const http = require("http");

const server = http.createServer((req, res) => {
  process.stderr.write("Health check request received\n");
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    status: "healthy",
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    message: "Health check endpoint is working"
  }));
});

const PORT = process.env.PORT || 8000;
process.stderr.write("Attempting to listen on port: " + PORT + "\n");

server.listen(PORT, () => {
  process.stderr.write("Health check server listening on port: " + PORT + "\n");
  console.log("Health check server is running");
}).on('error', (error) => {
  process.stderr.write("Health check server error: " + error.message + "\n");
  console.error("Health check server error:", error);
});

module.exports = server;

