const serviceService = require('../services/service.service');
const response = require('../utils/response');

async function listServices(req, res, next) {
  try {
    const activeOnly = req.query.all !== 'true';
    const services = await serviceService.listServices(activeOnly);
    return response.success(res, services);
  } catch (err) {
    next(err);
  }
}

async function listServiceTree(req, res, next) {
  try {
    const activeOnly = req.query.all !== 'true';
    const services = await serviceService.listServiceTree(activeOnly);
    return response.success(res, services);
  } catch (err) {
    next(err);
  }
}

async function getService(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const service = await serviceService.getService(id);
    return response.success(res, service);
  } catch (err) {
    next(err);
  }
}

async function createService(req, res, next) {
  try {
    const service = await serviceService.createService(req.body);
    return response.created(res, service, 'Layanan berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
}

async function updateService(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const service = await serviceService.updateService(id, req.body);
    return response.success(res, service, 'Layanan berhasil diperbarui');
  } catch (err) {
    next(err);
  }
}

async function deactivateService(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const service = await serviceService.deactivateService(id);
    return response.success(res, service, 'Layanan berhasil dinonaktifkan');
  } catch (err) {
    next(err);
  }
}

module.exports = { listServices, listServiceTree, getService, createService, updateService, deactivateService };
