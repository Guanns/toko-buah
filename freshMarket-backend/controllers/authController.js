/**
 * ==============================================================================
 * MODUL: authController.js
 * KELOMPOK: Controller Autentikasi
 * DESKRIPSI: Menangani logika bisnis autentikasi pengguna, termasuk masuk log (login)
 *            dan pendaftaran akun baru (register).
 * KEAMANAN: Kata sandi dienkripsi menggunakan bcrypt sebelum disimpan ke database,
 *           serta menghasilkan token akses JWT bertanda tangan digital.
 * ==============================================================================
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { cleanInput, isValidEmail } = require('../middleware/auth');

/* -------------------------------------------------------------------------- */
/*                            LOGIKA MASUK LOG (LOGIN)                        */
/* -------------------------------------------------------------------------- */
/**
 * Rationale: Memverifikasi identitas pengguna menggunakan email dan kata sandi yang valid.
 * Kata sandi diverifikasi melalui pencocokan hash bcrypt, kemudian JWT token dibuat
 * dengan masa kedaluwarsa 1 hari untuk manajemen sesi aman.
 */
// function login
const login = (req, res) => {
    let { email, password } = req.body;
    email = cleanInput(email);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi!' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Format email tidak valid!' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });
        if (results.length === 0) return res.status(401).json({ message: 'Email tidak ditemukan!' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Password salah!' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Login Berhasil', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
};

/* -------------------------------------------------------------------------- */
/*                           LOGIKA DAFTAR AKUN (REGISTER)                    */
/* -------------------------------------------------------------------------- */
/**
 * Rationale: Mendaftarkan akun pelanggan baru dengan menjamin keunikan email.
 * Password di-hash menggunakan bcrypt dengan salt rounds 10 demi keamanan penyimpanan data sensitif.
 */
// function register
const register = async (req, res) => {
    let { name, email, password } = req.body;
    name = cleanInput(name);
    email = cleanInput(email);

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Format email tidak valid!' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Kata sandi minimal 6 karakter!' });
    }

    try {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });
            if (results.length > 0) return res.status(400).json({ message: 'Email ini sudah terdaftar!' });

            const hashedPassword = await bcrypt.hash(password, 10);
            db.query("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, 'user', NOW())", [name, email, hashedPassword], (errInsert) => {
                if (errInsert) return res.status(500).json({ error: 'Gagal membuat akun' });
                res.status(201).json({ message: 'Akun berhasil dibuat! Silakan login.' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error server : ' + error.message });
    }
};

module.exports = { login, register };
