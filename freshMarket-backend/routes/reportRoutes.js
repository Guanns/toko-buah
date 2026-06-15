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

// api /admin/dashboard/stats
router.get('/admin/dashboard/stats',  verifyToken, requireRole('admin'),          getAdminStats);
// api /kasir/dashboard/stats
router.get('/kasir/dashboard/stats',  verifyToken, requireRole('admin', 'kasir'), getKasirStats);

// api /admin/reports/sales-summary
router.get('/admin/reports/sales-summary',      verifyToken, requireRole('admin'), getSalesSummary);
// api /admin/reports/top-products
router.get('/admin/reports/top-products',        verifyToken, requireRole('admin'), getTopProducts);
// api /admin/reports/voucher-performance
router.get('/admin/reports/voucher-performance', verifyToken, requireRole('admin'), getVoucherPerformance);

// api /kasir/reports/daily-closing
router.get('/kasir/reports/daily-closing',   verifyToken, requireRole('admin', 'kasir'), getDailyClosing);
// api /kasir/reports/payment-methods
router.get('/kasir/reports/payment-methods', verifyToken, requireRole('admin', 'kasir'), getPaymentMethods);
// api /kasir/reports/low-stock
router.get('/kasir/reports/low-stock',       verifyToken, requireRole('admin', 'kasir'), getLowStock);

module.exports = router;
