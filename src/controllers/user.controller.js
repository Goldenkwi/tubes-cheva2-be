const userService = require('../services/user.service');
const response = require('../utils/response');

async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers();
    return response.success(res, users);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const user = await userService.updateUser(id, req.body);
    return response.success(res, user, 'User berhasil diperbarui');
  } catch (err) {
    next(err);
  }
}

async function deactivateUser(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const user = await userService.deactivateUser(id);
    return response.success(res, user, 'User berhasil dinonaktifkan');
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, updateUser, deactivateUser };
