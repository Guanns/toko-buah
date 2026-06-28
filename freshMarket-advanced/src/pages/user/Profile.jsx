/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');

  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);

  const [currentPassword, setCurrentPassword]     = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [showCurrent, setShowCurrent]             = useState(false);
  const [showNew, setShowNew]                     = useState(false);
  const [showConfirm, setShowConfirm]             = useState(false);
  const [passLoading, setPassLoading]             = useState(false);
  const [passMsg, setPassMsg]                     = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setName(user.name || '');
    setEmail(user.email || '');
    setAddress(user.address || '');
  }, [user, navigate]);

  const showMsg = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter(null), 4000);
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {

        updateUser({ name: data.name, email: data.email, address: address });
        showMsg(setInfoMsg, 'success', 'Profil berhasil diperbarui!');
      } else {
        showMsg(setInfoMsg, 'error', data.error || 'Gagal memperbarui profil.');
      }
    } catch {
      showMsg(setInfoMsg, 'error', 'Gagal terhubung ke server.');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMsg(setPassMsg, 'error', 'Konfirmasi kata sandi tidak cocok!');
      return;
    }
    setPassLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/user/profile/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        showMsg(setPassMsg, 'success', 'Kata sandi berhasil diperbarui!');
      } else {
        showMsg(setPassMsg, 'error', data.error || 'Gagal memperbarui kata sandi.');
      }
    } catch {
      showMsg(setPassMsg, 'error', 'Gagal terhubung ke server.');
    } finally {
      setPassLoading(false);
    }
  };

  const Alert = ({ msg }) => {
    if (!msg) return null;
    const isSuccess = msg.type === 'success';
    return (
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
        {isSuccess ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
        {msg.text}
      </div>
    );
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 text-sm font-medium placeholder-slate-400";

  return (
    <div className="min-h-screen bg-slate-50/60 pt-28 pb-16 px-4 font-sans">
      <div className="max-w-xl mx-auto">

        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5 mb-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-black uppercase shrink-0 border border-emerald-100">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800 capitalize leading-tight">{user?.name}</p>
            <p className="text-sm text-slate-400 font-medium mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'kasir' ? 'Kasir' : 'Pelanggan'}
            </span>
          </div>
        </div>

        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'info' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User size={15} /> Informasi Akun
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'password' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck size={15} /> Keamanan
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-5">Edit Informasi Profil</h2>
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600 block">Nama Lengkap</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-4 text-slate-400" />
                  <input
                    type="text" required value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600 block">Alamat Email</label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-4 text-slate-400" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600 block">Alamat Pengiriman</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap pengiriman Anda"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 text-sm font-medium placeholder-slate-400 resize-none"
                />
              </div>
              <Alert msg={infoMsg} />
              <button
                type="submit" disabled={infoLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm"
              >
                {infoLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-5">Ganti Kata Sandi</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {[
                { label: 'Kata Sandi Saat Ini', val: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: setShowCurrent },
                { label: 'Kata Sandi Baru',     val: newPassword,     set: setNewPassword,     show: showNew,     toggle: setShowNew },
                { label: 'Konfirmasi Kata Sandi Baru', val: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: setShowConfirm },
              ].map(({ label, val, set, show, toggle }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600 block">{label}</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-4 text-slate-400" />
                    <input
                      type={show ? 'text' : 'password'} required value={val}
                      onChange={e => set(e.target.value)}
                      placeholder="••••••••" minLength={6}
                      className={`${inputClass} pr-12`}
                    />
                    <button type="button" onClick={() => toggle(!show)} className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <Alert msg={passMsg} />
              <button
                type="submit" disabled={passLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm"
              >
                {passLoading ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
