const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload, getCatalog, getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

router.get('/products',           getCatalog);

router.get('/admin/products',     verifyToken, requireRole('admin', 'kasir'), getAllProducts);

router.post('/admin/products',    verifyToken, requireRole('admin'), upload.single('image'), createProduct);

router.put('/admin/products/:id', verifyToken, requireRole('admin'), upload.single('image'), updateProduct);

router.delete('/admin/products/:id', verifyToken, requireRole('admin'), deleteProduct);

module.exports = router;
