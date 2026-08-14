const historyService = require('../services/history.service');
const response = require('../utils/response');

async function listHistory(req, res, next) {
  try {
    const { search, startDate, endDate, status, service, page, limit } = req.query;
    const statuses = status ? String(status).split(',').filter(Boolean) : [];
    const services = service ? String(service).split(',').filter(Boolean) : [];

    const result = await historyService.listHistory({
      search,
      startDate,
      endDate,
      statuses,
      services,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
}

module.exports = { listHistory };
