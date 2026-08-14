const laundryProfileService = require('../services/laundryProfile.service');
const response = require('../utils/response');

async function getProfile(req, res, next) {
  try {
    const profile = await laundryProfileService.getProfile();
    return response.success(res, profile);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await laundryProfileService.updateProfile(req.body);
    return response.success(res, profile, 'Profil laundry berhasil disimpan');
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
