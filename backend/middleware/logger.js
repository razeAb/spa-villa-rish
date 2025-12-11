// Minimal request logger for visibility in production/dev
module.exports = function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const msg = `${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`;
    if (res.statusCode >= 500) {
      console.error(msg);
    } else if (res.statusCode >= 400) {
      console.warn(msg);
    } else {
      console.log(msg);
    }
  });
  next();
};
