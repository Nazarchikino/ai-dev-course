function requestLog(req, res, next) {
  if (process.env.LOG_REQUESTS) console.log(`${req.method} ${req.originalUrl}`);
  next();
}

module.exports = { requestLog };
