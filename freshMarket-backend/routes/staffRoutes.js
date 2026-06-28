const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');

router.get('/',      verifyToken, requireRole('admin'), getStaff);

router.post('/',     verifyToken, requireRole('admin'), createStaff);

router.put('/:id',   verifyToken, requireRole('admin'), updateStaff);

router.delete('/:id', verifyToken, requireRole('admin'), deleteStaff);

module.exports = router;
