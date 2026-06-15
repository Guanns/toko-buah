const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');

// api /
router.get('/',      verifyToken, requireRole('admin'), getStaff);
// api /
router.post('/',     verifyToken, requireRole('admin'), createStaff);
// api /:id
router.put('/:id',   verifyToken, requireRole('admin'), updateStaff);
// api /:id
router.delete('/:id', verifyToken, requireRole('admin'), deleteStaff);

module.exports = router;
