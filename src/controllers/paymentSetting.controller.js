const paymentSettingService = require('../services/paymentSetting.service');
const response = require('../utils/response');

async function getSettings(req, res, next) {
  try {
    const settings = await paymentSettingService.getSettings();
    return response.success(res, settings);
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await paymentSettingService.updateSettings(req.body);
    return response.success(res, settings, 'Pengaturan pembayaran berhasil disimpan');
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
