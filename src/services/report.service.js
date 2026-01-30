const Report = require('../models/Report');
const User = require('../models/User');
const { NotFoundError, BadRequestError } = require('../utils/domainErrors');
const connectionRepository = require('../repositories/connection.repository');

class ReportService {
    async createReport(reporterId, reportedUserId, reason) {
        if (reporterId.toString() === reportedUserId.toString()) {
            throw new BadRequestError('You cannot report yourself');
        }

        const reportedUser = await User.findById(reportedUserId);
        if (!reportedUser) {
            throw new NotFoundError('User being reported not found');
        }

        const report = await Report.create({
            reporter: reporterId,
            reportedUser: reportedUserId,
            reason
        });

        // Automatically block the user when reported (standard safety practice)
        await connectionRepository.block(reporterId, reportedUserId);

        return report;
    }

    async getMyReports(userId) {
        return await Report.find({ reporter: userId }).sort({ createdAt: -1 });
    }
}

module.exports = new ReportService();
