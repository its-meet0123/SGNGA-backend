const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${req.method} ${req.path}\n`;

  fs.appendFile(path.join(logDir, 'app.log'), logMessage, (err) => {
    if (err) console.error('Error writing to log:', err);
  });

  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
};

module.exports = logger;
