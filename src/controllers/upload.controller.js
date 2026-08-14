const response = require('../utils/response');

async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return response.badRequest(res, 'File tidak ditemukan');
    }
    return response.success(res, { url: `/uploads/${req.file.filename}` }, 'File berhasil diunggah');
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadFile };
