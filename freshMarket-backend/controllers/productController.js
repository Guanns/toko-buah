
const path = require('path');
const multer = require('multer');
const db = require('../config/db');

/* -------------------------------------------------------------------------- */
/*                  KONFIGURASI PENYIMPANAN GAMBAR (MULTER)                   */
/* -------------------------------------------------------------------------- */

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

/* -------------------------------------------------------------------------- */
/*                            KATALOG PRODUK PUBLIK                           */
/* -------------------------------------------------------------------------- */

const getCatalog = (req, res) => {
    db.query("SELECT * FROM products WHERE status = 'PUBLISHED'", (err, results) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil data produk' });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                      DAFTAR PRODUK UNTUK STAFF / ADMIN                     */
/* -------------------------------------------------------------------------- */

const getAllProducts = (req, res) => {
    const query = `
        SELECT p.*, u1.name as creator_name, u2.name as updater_name
        FROM products p
        LEFT JOIN users u1 ON p.created_by = u1.id
        LEFT JOIN users u2 ON p.updated_by = u2.id
        ORDER BY p.id DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                           TAMBAH PRODUK BARU                               */
/* -------------------------------------------------------------------------- */

const createProduct = (req, res) => {
    const { sku, name, category, price, stock, status, admin_id } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 100);
    const image_url = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : '';

    const query = `INSERT INTO products (sku, slug, name, category, price, stock, image_url, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [sku, slug, name, category, price, stock, image_url, status, admin_id], (err) => {
        if (err) return res.status(err.code === 'ER_DUP_ENTRY' ? 400 : 500).json({ error: err.code === 'ER_DUP_ENTRY' ? 'SKU digunakan!' : err.message });
        res.status(201).json({ message: 'Produk berhasil ditambahkan!' });
    });
};

/* -------------------------------------------------------------------------- */
/*                          MEMPERBARUI DATA PRODUK                           */
/* -------------------------------------------------------------------------- */

const updateProduct = (req, res) => {
    const { id } = req.params;
    const { sku, name, category, price, stock, status, admin_id, existing_image } = req.body;
    const image_url = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : existing_image;

    const query = `UPDATE products SET sku=?, name=?, category=?, price=?, stock=?, image_url=?, status=?, updated_by=? WHERE id=?`;
    db.query(query, [sku, name, category, price, stock, image_url, status, admin_id, id], (err) => {
        if (err) return res.status(err.code === 'ER_DUP_ENTRY' ? 400 : 500).json({ error: err.code === 'ER_DUP_ENTRY' ? 'SKU digunakan!' : err.message });
        res.json({ message: 'Produk berhasil diupdate!' });
    });
};

/* -------------------------------------------------------------------------- */
/*                             MENGHAPUS PRODUK                               */
/* -------------------------------------------------------------------------- */

const deleteProduct = (req, res) => {
    db.query('DELETE FROM products WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Gagal menghapus produk' });
        res.json({ message: 'Produk dihapus!' });
    });
};

module.exports = { upload, getCatalog, getAllProducts, createProduct, updateProduct, deleteProduct };
