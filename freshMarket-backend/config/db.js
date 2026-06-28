
const mysql = require('mysql2');

/* -------------------------------------------------------------------------- */
/*                            KONFIGURASI DATABASE                            */
/* -------------------------------------------------------------------------- */
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : '',
    database: process.env.DB_NAME || 'freshmarket_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/* -------------------------------------------------------------------------- */
/*                            PENGUJIAN KONEKSI                               */
/* -------------------------------------------------------------------------- */
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Gagal melakukan koneksi ke MySQL:', err.message);
    } else {
        console.log('Berhasil terhubung ke database MySQL (freshmarket_db)');
        connection.release();
    }
});

module.exports = db;
