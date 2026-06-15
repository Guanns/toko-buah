/**
 * ==============================================================================
 * MODUL: auth.js
 * KELOMPOK: Middleware & Utilitas Autentikasi
 * DESKRIPSI: Fungsi-fungsi middleware untuk memverifikasi token JWT, otorisasi
 *            hak akses pengguna (role-based), serta utilitas sanitasi input.
 * KEAMANAN: Memfilter karakter berbahaya untuk meminimalkan risiko SQL Injection & XSS.
 * ==============================================================================
 */

const jwt = require('jsonwebtoken');

/* -------------------------------------------------------------------------- */
/*                            FUNGSI SANITASI INPUT                           */
/* -------------------------------------------------------------------------- */
/**
 * Rationale: Mengeliminasi karakter SQL/HTML khusus untuk memperkuat
 * keamanan parameter masukan dari manipulasi query atau injeksi skrip.
 */
const cleanInput = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>"';-]/g, '').trim();
};

/* -------------------------------------------------------------------------- */
/*                            VALIDASI FORMAT EMAIL                           */
/* -------------------------------------------------------------------------- */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/* -------------------------------------------------------------------------- */
/*                        MIDDLEWARE VERIFIKASI JWT                           */
/* -------------------------------------------------------------------------- */
/**
 * Rationale: Memastikan permintaan memiliki token otorisasi Bearer JWT
 * yang sah sebelum diizinkan mengakses sumber daya yang dilindungi.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token autentikasi tidak ditemukan.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
};

/* -------------------------------------------------------------------------- */
/*                         MIDDLEWARE OTORISASI PERAN                         */
/* -------------------------------------------------------------------------- */
/**
 * Rationale: Mengontrol akses endpoint khusus berdasarkan otorisasi peran
 * (Role-Based Access Control) yang tersemat dalam klaim payload token.
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki izin untuk endpoint ini.' });
    }
    next();
};

module.exports = { cleanInput, isValidEmail, verifyToken, requireRole };
