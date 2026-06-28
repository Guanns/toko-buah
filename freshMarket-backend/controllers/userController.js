
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { cleanInput, isValidEmail } = require('../middleware/auth');

/* -------------------------------------------------------------------------- */
/*                               PROFIL PENGGUNA                              */
/* -------------------------------------------------------------------------- */

const getProfile = (req, res) => {
    const requestedId = parseInt(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== requestedId) {
        return res.status(403).json({ error: 'Anda tidak diizinkan mengakses profil pengguna lain.' });
    }
    db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [requestedId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil data profil' });
        if (results.length === 0) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        res.json(results[0]);
    });
};

/* -------------------------------------------------------------------------- */
/*                          MEMPERBARUI PROFIL PENGGUNA                       */
/* -------------------------------------------------------------------------- */

const updateProfile = (req, res) => {
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ error: 'Tidak diizinkan memperbarui profil pengguna lain.' });
    }
    let { name, email } = req.body;
    name = cleanInput(name);
    email = cleanInput(email);

    if (!name || !email) return res.status(400).json({ error: 'Nama dan email wajib diisi!' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Format email tidak valid!' });

    db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });
        if (results.length > 0) return res.status(400).json({ error: 'Email sudah digunakan akun lain!' });

        db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ error: 'Gagal memperbarui profil' });
            res.json({ message: 'Profil berhasil diperbarui!', name, email });
        });
    });
};

/* -------------------------------------------------------------------------- */
/*                        MEMPERBARUI KATA SANDI PENGGUNA                     */
/* -------------------------------------------------------------------------- */

const updatePassword = async (req, res) => {
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ error: 'Tidak diizinkan mengubah sandi akun lain.' });
    }
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) return res.status(400).json({ error: 'Semua kolom sandi wajib diisi!' });
    if (new_password.length < 6) return res.status(400).json({ error: 'Kata sandi baru minimal 6 karakter!' });

    db.query('SELECT password FROM users WHERE id = ?', [req.params.id], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });
        if (results.length === 0) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

        const isMatch = await bcrypt.compare(current_password, results[0].password);
        if (!isMatch) return res.status(401).json({ error: 'Kata sandi saat ini tidak sesuai!' });

        const hashed = await bcrypt.hash(new_password, 10);
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.params.id], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ error: 'Gagal memperbarui kata sandi' });
            res.json({ message: 'Kata sandi berhasil diperbarui!' });
        });
    });
};

module.exports = { getProfile, updateProfile, updatePassword };
