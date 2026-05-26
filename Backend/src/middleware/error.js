export function notFound(_req, res) {
  res.status(404).json({ ok: false, error: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({
    ok: false,
    error: err.message ?? "Internal server error",
  });
}
