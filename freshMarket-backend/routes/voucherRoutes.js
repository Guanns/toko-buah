const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getActiveVouchers, validateVoucher, getAllVouchers, createVoucher, deleteVoucher } = require('../controllers/voucherController');

// api /vouchers/active
router.get('/vouchers/active',     getActiveVouchers);
// api /vouchers/validate
router.post('/vouchers/validate',  validateVoucher);
// api /admin/vouchers
router.get('/admin/vouchers',      verifyToken, requireRole('admin'), getAllVouchers);
// api /admin/vouchers
router.post('/admin/vouchers',     verifyToken, requireRole('admin'), createVoucher);
// api /admin/vouchers/:id
router.delete('/admin/vouchers/:id', verifyToken, requireRole('admin'), deleteVoucher);

module.exports = router;
