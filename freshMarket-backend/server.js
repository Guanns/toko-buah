
/* -------------------------------------------------------------------------- */
/*                          INISIALISASI & DEPENDENSI                         */
/* -------------------------------------------------------------------------- */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

/* -------------------------------------------------------------------------- */
/*                              MIDDLEWARE GLOBAL                             */
/* -------------------------------------------------------------------------- */
app.use(cors());
app.use(express.json());

/* Penanganan Direktori Unggah File */
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

/* -------------------------------------------------------------------------- */
/*                               PEMETAAN RUTE API                            */
/* -------------------------------------------------------------------------- */
app.use('/api', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin/users', require('./routes/staffRoutes'));
app.use('/api', require('./routes/productRoutes'));
app.use('/api', require('./routes/orderRoutes'));
app.use('/api', require('./routes/voucherRoutes'));
app.use('/api', require('./routes/reportRoutes'));

/* -------------------------------------------------------------------------- */
/*                            MENJALANKAN SERVER                              */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server backend berjalan aktif di http://localhost:${PORT}`);
});
