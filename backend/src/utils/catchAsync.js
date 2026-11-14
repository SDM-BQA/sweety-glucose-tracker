// Express doesn't forward rejected promises to the error handler on its
// own; wrapping each async controller keeps every route's try/catch in one place.
function catchAsync(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = catchAsync;
