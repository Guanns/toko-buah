
const db = require('../config/db');
const { cleanInput, isValidEmail } = require('../middleware/auth');
const bcrypt = require('bcrypt');

/* -------------------------------------------------------------------------- */
/*                          DAFTAR AKUN STAFF KASIR                           */
/* -------------------------------------------------------------------------- */

const getStaff = (req, res) => {
    db.query("SELECT id, name, email, role, created_at FROM users WHERE role = 'kasir' ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil data kasir' });
        res.json(results);
    });
};

/* -------------------------------------------------------------------------- */
/*                        BUAT AKUN STAFF KASIR BARU                          */
/* -------------------------------------------------------------------------- */

const createStaff = async (req, res) => {
    let { name, email, password } = req.body;
    name = cleanInput(name);
    email = cleanInput(email);

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Semua kolom data kasir wajib diisi!' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Format email staff kasir tidak valid!' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Kata sandi staff kasir minimal 6 karakter!' });
    }

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('❌ SQL Error Cek Email:', err);
                return res.status(500).json({ error: 'Terjadi kesalahan basis data saat pengecekan email.' });
            }
            if (results.length > 0) return res.status(400).json({ error: 'Email staff kasir sudah digunakan!' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const queryInsert = 'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())';
            db.query(queryInsert, [name, email, hashedPassword, 'kasir'], (errInsert) => {
                if (errInsert) {
                    console.error('❌ SQL Error Insert Kasir:', errInsert);
                    return res.status(500).json({ error: errInsert.message || 'Terjadi penolakan query internal basis data.' });
                }
                res.status(201).json({ message: 'Akun Kasir berhasil didaftarkan oleh sistem!' });
            });
        });
    } catch (error) {
        console.error('❌ Catch Block Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/* -------------------------------------------------------------------------- */
/*                          PERBARUI AKUN STAFF KASIR                         */
/* -------------------------------------------------------------------------- */

const updateStaff = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Nama dan Email kasir wajib diisi!' });
    }

    try {
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ? AND role = 'kasir'", [name, email, hashedPassword, id], (err) => {
                if (err) {
                    console.error('❌ SQL Error Update Kasir (With Pass):', err);
                    return res.status(500).json({ error: err.message || 'Gagal memperbarui data kasir' });
                }
                res.json({ message: 'Data kasir dan sandi baru berhasil diperbarui!' });
            });
        } else {
            db.query("UPDATE users SET name = ?, email = ? WHERE id = ? AND role = 'kasir'", [name, email, id], (err) => {
                if (err) {
                    console.error('❌ SQL Error Update Kasir (No Pass):', err);
                    return res.status(500).json({ error: err.message || 'Gagal memperbarui data kasir' });
                }
                res.json({ message: 'Data informasi kasir berhasil diperbarui!' });
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/* -------------------------------------------------------------------------- */
/*                            HAPUS AKUN STAFF KASIR                          */
/* -------------------------------------------------------------------------- */

const deleteStaff = (req, res) => {
    db.query("DELETE FROM users WHERE id = ? AND role = 'kasir'", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Gagal menonaktifkan akun staff kasir' });
        res.json({ message: 'Akun staff kasir berhasil dihapus dari sistem!' });
    });
};

module.exports = { getStaff, createStaff, updateStaff, deleteStaff };
