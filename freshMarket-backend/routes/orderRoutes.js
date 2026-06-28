const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { createOrder, getUserOrders, completeOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/orders',                          createOrder);

router.get('/orders/user/:id',                  getUserOrders);

router.put('/orders/:id/complete',              completeOrder);

router.get('/admin/orders',      verifyToken, requireRole('admin', 'kasir'), getAllOrders);

router.put('/admin/orders/:id/status', verifyToken, requireRole('admin', 'kasir'), updateOrderStatus);

module.exports = router;
