const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { getProfile, updateProfile, updatePassword } = require('../controllers/userController');

router.get('/profile/:id',          verifyToken, getProfile);

router.put('/profile/:id',          verifyToken, updateProfile);

router.put('/profile/:id/password', verifyToken, updatePassword);

module.exports = router;
