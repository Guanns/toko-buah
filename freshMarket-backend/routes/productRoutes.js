const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { upload, getCatalog, getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

// api /products
router.get('/products',           getCatalog);
// api /admin/products
router.get('/admin/products',     verifyToken, requireRole('admin', 'kasir'), getAllProducts);
// api /admin/products
router.post('/admin/products',    verifyToken, requireRole('admin'), upload.single('image'), createProduct);
// api /admin/products/:id
router.put('/admin/products/:id', verifyToken, requireRole('admin'), upload.single('image'), updateProduct);
// api /admin/products/:id
router.delete('/admin/products/:id', verifyToken, requireRole('admin'), deleteProduct);

module.exports = router;
