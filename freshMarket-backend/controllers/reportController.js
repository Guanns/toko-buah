/**
 * ==============================================================================
 * MODUL: reportController.js
 * KELOMPOK: Controller Laporan & Dashboard
 * DESKRIPSI: Menyediakan metrik performa toko dan ringkasan transaksi untuk
 *            visualisasi dashboard admin maupun penutupan harian kasir.
 * INTEGRASI: Mengambil data dari tabel MySQL orders, order_items, users, dan vouchers.
 * ==============================================================================
 */

const db = require('../config/db');
const { cleanInput } = require('../middleware/auth');

/* -------------------------------------------------------------------------- */
/*                         STATISTIK RINGKASAN ADMIN                          */
/* -------------------------------------------------------------------------- */
// function getAdminStats
const getAdminStats = (req, res) => {
    const stats = {};

    const qTotalIncome = "SELECT SUM(total_amount) as total FROM orders WHERE status = 'SELESAI'";
    const qMonthlyIncome = "SELECT SUM(total_amount) as total FROM orders WHERE status = 'SELESAI' AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())";
    const qTotalOrders = "SELECT COUNT(*) as total FROM orders WHERE status = 'SELESAI'";
    const qTotalUsers = "SELECT COUNT(*) as total FROM users WHERE role = 'user'";
    const qWeeklySales = `
        SELECT DATE(created_at) as date, SUM(total_amount) as amount 
        FROM orders 
        WHERE status = 'SELESAI' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    `;
    const qBestSellers = `
        SELECT p.id, p.name, p.sku, p.category, p.price, p.image_url, SUM(oi.quantity) as total_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'SELESAI'
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
    `;

    db.query(qTotalIncome, (err, r1) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalIncome = r1[0]?.total || 0;

        db.query(qMonthlyIncome, (err, r2) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.monthlyIncome = r2[0]?.total || 0;

            db.query(qTotalOrders, (err, r3) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.totalOrders = r3[0]?.total || 0;

                db.query(qTotalUsers, (err, r4) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.totalUsers = r4[0]?.total || 0;

                    db.query(qWeeklySales, (err, r5) => {
                        if (err) return res.status(500).json({ error: err.message });
                        stats.weeklySales = r5;

                        db.query(qBestSellers, (err, r6) => {
                            if (err) return res.status(500).json({ error: err.message });
                            stats.bestSellers = r6;
                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
};

/* -------------------------------------------------------------------------- */
/*                         STATISTIK RINGKASAN KASIR                          */
/* -------------------------------------------------------------------------- */
// function getKasirStats
const getKasirStats = (req, res) => {
    const stats = {};

    const qTodayIncome = "SELECT SUM(total_amount) as total FROM orders WHERE status = 'SELESAI' AND DATE(created_at) = CURDATE()";
    const qTodayOrders = 'SELECT COUNT(*) as total FROM orders WHERE DATE(created_at) = CURDATE()';
    const qPendingOrders = "SELECT COUNT(*) as total FROM orders WHERE status IN ('MENUNGGU_ADMIN', 'DIPROSES')";
    const qRecentOrders = `
        SELECT 
            o.id, 
            u.name as customer_name, 
            o.created_at, 
            o.status, 
            o.total_amount,
            o.shipping_address,
            o.phone_number,
            (
                SELECT JSON_ARRAYAGG(JSON_OBJECT('name', p.name, 'qty', oi.quantity))
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = o.id
            ) as items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
    `;
    const qLowStockProducts = "SELECT id, name, sku, stock, price, image_url FROM products WHERE stock < 10 AND status = 'PUBLISHED'";

    db.query(qTodayIncome, (err, r1) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.todayIncome = r1[0]?.total || 0;

        db.query(qTodayOrders, (err, r2) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.todayOrders = r2[0]?.total || 0;

            db.query(qPendingOrders, (err, r3) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.pendingOrders = r3[0]?.total || 0;

                db.query(qRecentOrders, (err, r4) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.recentOrders = r4;

                    db.query(qLowStockProducts, (err, r5) => {
                        if (err) return res.status(500).json({ error: err.message });
                        stats.lowStockProducts = r5;
                        res.json(stats);
                    });
                });
            });
        });
    });
};

/* -------------------------------------------------------------------------- */
/*                        LAPORAN RINGKASAN PENJUALAN                         */
/* -------------------------------------------------------------------------- */
// function getSalesSummary
const getSalesSummary = (req, res) => {
    let { startDate, endDate } = req.query;
    startDate = cleanInput(startDate || '');
    endDate = cleanInput(endDate || '');

    const dateFilter = startDate && endDate ? 'AND DATE(o.created_at) BETWEEN ? AND ?' : '';
    const dateFilterSub = startDate && endDate ? 'AND DATE(ord.created_at) BETWEEN ? AND ?' : '';

    const query = `
        SELECT
            COALESCE(SUM(o.total_amount), 0) AS total_pendapatan,
            COUNT(o.id)                       AS total_transaksi,
            COALESCE(AVG(o.total_amount), 0)  AS rata_rata_transaksi,
            COALESCE((
                SELECT SUM(
                    CASE
                        WHEN v.discount_type = 'FIXED' THEN v.discount_value
                        WHEN v.discount_type = 'PERCENT' AND v.discount_value < 100 THEN (ord.total_amount / (1 - v.discount_value / 100)) - ord.total_amount
                        ELSE 0
                    END
                )
                FROM orders ord
                JOIN vouchers v ON ord.voucher_code = v.code
                WHERE ord.status = 'SELESAI'
                ${dateFilterSub}
            ), 0) AS total_diskon
        FROM orders o
        WHERE o.status = 'SELESAI'
        ${dateFilter}
    `;

    const finalParams = startDate && endDate ? [startDate, endDate, startDate, endDate] : [];

    db.query(query, finalParams, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
};

/* -------------------------------------------------------------------------- */
/*                          LAPORAN PRODUK TERLARIS                           */
/* -------------------------------------------------------------------------- */
// function getTopProducts
const getTopProducts = (req, res) => {
    const limit = parseInt(cleanInput(String(req.query.limit || '10'))) || 10;

    const query = `
        SELECT
            p.sku,
            p.name,
            p.category,
            SUM(oi.quantity)            AS total_terjual,
            SUM(oi.quantity * oi.price) AS akumulasi_pendapatan
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders   o ON oi.order_id   = o.id
        WHERE o.status = 'SELESAI'
        GROUP BY p.id, p.sku, p.name, p.category
        ORDER BY total_terjual DESC
        LIMIT ?
    `;
    db.query(query, [limit], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                       LAPORAN KINERJA VOUCHER PROMO                        */
/* -------------------------------------------------------------------------- */
// function getVoucherPerformance
const getVoucherPerformance = (req, res) => {
    const query = `
        SELECT
            o.voucher_code          AS kode_voucher,
            COUNT(o.id)             AS frekuensi_penggunaan,
            COALESCE(
                SUM(
                    CASE
                        WHEN v.discount_type = 'FIXED'   THEN v.discount_value
                        WHEN v.discount_type = 'PERCENT' AND v.discount_value < 100 THEN (o.total_amount / (1 - v.discount_value / 100)) - o.total_amount
                        ELSE 0
                    END
                ), 0
            )                       AS total_potongan
        FROM orders o
        LEFT JOIN vouchers v ON v.code = o.voucher_code
        WHERE o.voucher_code IS NOT NULL AND o.voucher_code != '' AND o.status = 'SELESAI'
        GROUP BY o.voucher_code
        ORDER BY frekuensi_penggunaan DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                LAPORAN PENUTUPAN HARIAN (CLOSING KASIR)                    */
/* -------------------------------------------------------------------------- */
// function getDailyClosing
const getDailyClosing = (req, res) => {
    const qStatus = `
        SELECT
            status,
            COUNT(id)                      AS jumlah_transaksi,
            COALESCE(SUM(total_amount), 0) AS total_nominal
        FROM orders
        WHERE DATE(created_at) = CURDATE()
        GROUP BY status
        ORDER BY FIELD(status, 'MENUNGGU_ADMIN', 'DIPROSES', 'DIKIRIM', 'SELESAI')
    `;
    const qIncome = `
        SELECT COALESCE(SUM(total_amount), 0) AS total_masuk
        FROM orders
        WHERE status = 'SELESAI' AND DATE(created_at) = CURDATE()
    `;

    db.query(qStatus, (err, statusRows) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(qIncome, (err2, incomeRows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({
                ringkasan_status: statusRows,
                total_pemasukan: incomeRows[0]?.total_masuk || 0
            });
        });
    });
};

/* -------------------------------------------------------------------------- */
/*                    LAPORAN FREKUENSI METODE PEMBAYARAN                     */
/* -------------------------------------------------------------------------- */
// function getPaymentMethods
const getPaymentMethods = (req, res) => {
    
    const query = `
        SELECT
            status                         AS metode_label,
            COUNT(id)                      AS frekuensi,
            COALESCE(SUM(total_amount), 0) AS total_nominal
        FROM orders
        WHERE DATE(created_at) = CURDATE()
        GROUP BY status
        ORDER BY total_nominal DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                     LAPORAN PERINGATAN STOK TIPIS                          */
/* -------------------------------------------------------------------------- */
// function getLowStock
const getLowStock = (req, res) => {
    db.query(
        "SELECT id, sku, name, category, stock, price FROM products WHERE stock < 10 AND status = 'PUBLISHED' ORDER BY stock ASC",
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
};

module.exports = {
    getAdminStats,
    getKasirStats,
    getSalesSummary,
    getTopProducts,
    getVoucherPerformance,
    getDailyClosing,
    getPaymentMethods,
    getLowStock
};
