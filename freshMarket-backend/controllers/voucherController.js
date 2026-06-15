/**
 * ==============================================================================
 * MODUL: voucherController.js
 * KELOMPOK: Controller Voucher Diskon
 * DESKRIPSI: Logika bisnis voucher promosi seperti daftar voucher aktif, validasi
 *            persyaratan belanja, dan pembuatan/penghapusan voucher oleh admin.
 * ==============================================================================
 */

const db = require('../config/db');

/* -------------------------------------------------------------------------- */
/*                            DAFTAR VOUCHER AKTIF                            */
/* -------------------------------------------------------------------------- */
// function getActiveVouchers
const getActiveVouchers = (req, res) => {
    const query = `
        SELECT * FROM vouchers 
        WHERE is_active = TRUE 
        AND (quota IS NULL OR quota > 0) 
        AND (expired_at IS NULL OR expired_at >= CURDATE())
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                        VALIDASI PENGGUNAAN VOUCHER                         */
/* -------------------------------------------------------------------------- */
/**
 * Rationale: Memverifikasi masa kedaluwarsa voucher, kuota yang tersisa,
 * serta ambang batas minimal belanja pelanggan agar diskon promo sah diaplikasikan.
 */
// function validateVoucher
const validateVoucher = (req, res) => {
    const { code, cart_total } = req.body;
    db.query('SELECT * FROM vouchers WHERE code = ? AND is_active = TRUE', [code], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ message: 'Voucher tidak ditemukan atau tidak aktif.' });

        const voucher = results[0];

        if (voucher.expired_at !== null && new Date(voucher.expired_at) < new Date(new Date().setHours(0, 0, 0, 0))) {
            return res.status(400).json({ message: 'Maaf, voucher ini sudah kadaluwarsa.' });
        }
        if (voucher.quota !== null && voucher.quota <= 0) {
            return res.status(400).json({ message: 'Maaf, kuota dari voucher ini sudah habis.' });
        }
        if (cart_total < voucher.min_purchase) {
            return res.status(400).json({ message: `Minimal belanja untuk voucher ini adalah Rp. ${voucher.min_purchase.toLocaleString('id-ID')}` });
        }

        res.json({ message: 'Voucher berhasil digunakan!', voucher });
    });
};

/* -------------------------------------------------------------------------- */
/*                       DAFTAR SEMUA VOUCHER (ADMIN)                         */
/* -------------------------------------------------------------------------- */
// function getAllVouchers
const getAllVouchers = (req, res) => {
    db.query('SELECT * FROM vouchers ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                         BUAT VOUCHER PROMO BARU                            */
/* -------------------------------------------------------------------------- */
// function createVoucher
const createVoucher = (req, res) => {
    const { code, discount_type, discount_value, min_purchase, quota, expired_at } = req.body;

    const finalQuota = (quota === '' || quota === null || quota === undefined) ? null : parseInt(quota);
    const finalExpiredAt = (expired_at === '' || expired_at === null || expired_at === undefined) ? null : expired_at;

    const query = `
        INSERT INTO vouchers (code, discount_type, discount_value, min_purchase, quota, expired_at) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
        query,
        [code.toUpperCase(), discount_type, discount_value, min_purchase, finalQuota, finalExpiredAt],
        (err) => {
            if (err) return res.status(err.code === 'ER_DUP_ENTRY' ? 400 : 500).json({ error: err.code === 'ER_DUP_ENTRY' ? 'Kode Promo sudah ada!' : err.message });
            res.status(201).json({ message: 'Voucher berhasil dibuat!' });
        }
    );
};

/* -------------------------------------------------------------------------- */
/*                            HAPUS VOUCHER PROMO                             */
/* -------------------------------------------------------------------------- */
// function deleteVoucher
const deleteVoucher = (req, res) => {
    db.query('DELETE FROM vouchers WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Voucher dihapus!' });
    });
};

module.exports = { getActiveVouchers, validateVoucher, getAllVouchers, createVoucher, deleteVoucher };
