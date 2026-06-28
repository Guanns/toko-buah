/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React from 'react';
import Hero from '../../components/Hero';
import VoucherHome from '../../components/VoucherHome';
import VisiMisi from '../../components/VisiMisi';
import CaraKerja from '../../components/CaraKerja';
import Footer from '../../components/Footer';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */

const Home = () => {
  return (
    <div className="pt-20">
      <Hero />
      <VoucherHome />
      <VisiMisi />
      <CaraKerja />
      <Footer />
    </div>
  );
};

export default Home;
