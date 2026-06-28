const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
    getAdminStats,
    getKasirStats,
    getSalesSummary,
    getTopProducts,
    getVoucherPerformance,
    getDailyClosing,
    getPaymentMethods,
    getLowStock
} = require('../controllers/reportController');

router.get('/admin/dashboard/stats',  verifyToken, requireRole('admin'),          getAdminStats);

router.get('/kasir/dashboard/stats',  verifyToken, requireRole('admin', 'kasir'), getKasirStats);

router.get('/admin/reports/sales-summary',      verifyToken, requireRole('admin'), getSalesSummary);

router.get('/admin/reports/top-products',        verifyToken, requireRole('admin'), getTopProducts);

router.get('/admin/reports/voucher-performance', verifyToken, requireRole('admin'), getVoucherPerformance);

router.get('/kasir/reports/daily-closing',   verifyToken, requireRole('admin', 'kasir'), getDailyClosing);

router.get('/kasir/reports/payment-methods', verifyToken, requireRole('admin', 'kasir'), getPaymentMethods);

router.get('/kasir/reports/low-stock',       verifyToken, requireRole('admin', 'kasir'), getLowStock);

module.exports = router;
