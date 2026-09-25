export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  const status = err.status || (err.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ error: err.message || "Server error" });
}
