const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getProfile, updateProfile, updatePassword } = require('../controllers/userController');

// api /profile/:id
router.get('/profile/:id',          verifyToken, getProfile);
// api /profile/:id
router.put('/profile/:id',          verifyToken, updateProfile);
// api /profile/:id/password
router.put('/profile/:id/password', verifyToken, updatePassword);

module.exports = router;
