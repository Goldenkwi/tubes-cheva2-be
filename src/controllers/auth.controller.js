const authService = require('../services/auth.service');
const response = require('../utils/response');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return response.success(res, result, 'Login berhasil');
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return response.created(res, user, 'Staff berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return response.success(res, user);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    // Stateless JWT: nothing to invalidate server-side. Client is
    // responsible for discarding the token.
    return response.success(res, null, 'Logout berhasil');
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, getProfile, logout };
