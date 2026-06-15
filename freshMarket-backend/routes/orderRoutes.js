const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { createOrder, getUserOrders, completeOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

// api /orders
router.post('/orders',                          createOrder);
// api /orders/user/:id
router.get('/orders/user/:id',                  getUserOrders);
// api /orders/:id/complete
router.put('/orders/:id/complete',              completeOrder);
// api /admin/orders
router.get('/admin/orders',      verifyToken, requireRole('admin', 'kasir'), getAllOrders);
// api /admin/orders/:id/status
router.put('/admin/orders/:id/status', verifyToken, requireRole('admin', 'kasir'), updateOrderStatus);

module.exports = router;
