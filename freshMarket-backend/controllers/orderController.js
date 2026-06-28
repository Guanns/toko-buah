
const db = require('../config/db');
const { cleanInput } = require('../middleware/auth');

/* -------------------------------------------------------------------------- */
/*                         PROSES CHECKOUT & TRANSAKSI                        */
/* -------------------------------------------------------------------------- */

const createOrder = (req, res) => {
    const { user_id, total_amount, items, voucher_code, payment_method } = req.body;
    const safePaymentMethod = cleanInput(payment_method || 'qris');

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        connection.beginTransaction(err => {
            if (err) { connection.release(); return res.status(500).json({ error: 'Transaction error' }); }

            const firstItem = Array.isArray(items) && items.length > 0 ? items[0] : {};
            const shippingAddress = firstItem.shipping_address || null;
            const phoneNumber = firstItem.phone_number || null;

            const insertOrderQuery = `
                INSERT INTO orders (user_id, total_amount, status, created_at, shipping_address, phone_number, voucher_code)
                VALUES (?, ?, 'MENUNGGU_ADMIN', NOW(), ?, ?, ?)
            `;
            connection.query(insertOrderQuery, [user_id, total_amount, shippingAddress, phoneNumber, voucher_code || null], (err, orderResult) => {
                if (err) { connection.rollback(() => connection.release()); return res.status(500).json({ error: err.message }); }

                const orderId = orderResult.insertId;
                const orderItemsData = items.map(item => [orderId, item.id, item.quantity, Number(item.priceNumber ?? item.price ?? 0)]);

                connection.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?', [orderItemsData], (err) => {
                    if (err) { connection.rollback(() => connection.release()); return res.status(500).json({ error: err.message }); }

                    const promises = items.map(item =>
                        new Promise((resolve, reject) => {
                            connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id], (err) => {
                                if (err) reject(err); else resolve();
                            });
                        })
                    );

                    if (voucher_code) {
                        promises.push(new Promise((resolve, reject) => {
                            connection.query(
                                'UPDATE vouchers SET quota = quota - 1 WHERE code = ? AND quota IS NOT NULL AND quota > 0',
                                [voucher_code],
                                (err) => { if (err) reject(err); else resolve(); }
                            );
                        }));
                    }

                    Promise.all(promises)
                        .then(() => {
                            connection.commit(err => {
                                if (err) { connection.rollback(() => connection.release()); return res.status(500).json({ error: 'Commit error' }); }
                                connection.release();
                                res.status(201).json({ message: 'Pesanan berhasil diproses!', order_id: orderId });
                            });
                        })
                        .catch(() => {
                            connection.rollback(() => connection.release());
                            return res.status(500).json({ error: 'Gagal memotong stok atau kuota' });
                        });
                });
            });
        });
    });
};

/* -------------------------------------------------------------------------- */
/*                         RIWAYAT PESANAN PELANGGAN                          */
/* -------------------------------------------------------------------------- */

const getUserOrders = (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT
            o.id,
            o.created_at as date,
            o.status,
            o.total_amount as total,
            (
                SELECT JSON_ARRAYAGG(JSON_OBJECT('name', p.name, 'qty', oi.quantity, 'price', oi.price))
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = o.id
            ) as items
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `;
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                      DAFTAR SEMUA PESANAN (MANAJEMEN)                      */
/* -------------------------------------------------------------------------- */

const getAllOrders = (req, res) => {
    const query = `
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
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                     KONFIRMASI PENYELESAIAN PESANAN                        */
/* -------------------------------------------------------------------------- */

const completeOrder = (req, res) => {
    const orderId = req.params.id;
    db.query("UPDATE orders SET status = 'SELESAI' WHERE id = ?", [orderId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Pesanan diselesaikan' });
    });
};

/* -------------------------------------------------------------------------- */
/*                           UPDATE STATUS PESANAN                            */
/* -------------------------------------------------------------------------- */

const updateOrderStatus = (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status berhasil diupdate' });
    });
};

module.exports = { createOrder, getUserOrders, getAllOrders, completeOrder, updateOrderStatus };
