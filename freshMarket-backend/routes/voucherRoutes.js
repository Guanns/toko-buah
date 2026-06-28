const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getActiveVouchers, validateVoucher, getAllVouchers, createVoucher, deleteVoucher } = require('../controllers/voucherController');

router.get('/vouchers/active',     getActiveVouchers);

router.post('/vouchers/validate',  validateVoucher);

router.get('/admin/vouchers',      verifyToken, requireRole('admin'), getAllVouchers);

router.post('/admin/vouchers',     verifyToken, requireRole('admin'), createVoucher);

router.delete('/admin/vouchers/:id', verifyToken, requireRole('admin'), deleteVoucher);

module.exports = router;
