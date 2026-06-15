const router = require('express').Router();
const { login, register } = require('../controllers/authController');

// api /login
router.post('/login', login);
// api /register
router.post('/register', register);

module.exports = router;
