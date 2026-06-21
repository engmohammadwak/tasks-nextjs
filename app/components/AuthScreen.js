'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('الرجاء تعبئة جميع الحقول', true);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      showToast('بيانات الدخول غير صحيحة', true);
    } else {
      showToast('تم تسجيل الدخول بنجاح');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('الرجاء تعبئة جميع الحقول', true);
      return;
    }
    if (password.length < 8) {
      showToast('كلمة المرور يجب أن تكون 8 أحرف على الأقل', true);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone: phone || null },
      },
    });
    setLoading(false);
    if (error) {
      showToast(error.message, true);
    } else {
      showToast('تم إنشاء الحساب! تحقق من بريدك لتأكيده');
      setTimeout(() => setMode('login'), 2500);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('الرجاء إدخال البريد الإلكتروني', true);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
    });
    setLoading(false);
    if (error) {
      showToast(error.message, true);
    } else {
      showToast('تم إرسال رابط استعادة كلمة المرور');
      setMode('login');
    }
  };

  const titles = {
    login: { h: 'مرحباً بعودتك', s: 'سجّل دخولك لمتابعة مهامك واجتماعاتك' },
    signup: { h: 'إنشاء حساب جديد', s: 'ابدأ رحلتك في تنظيم مهامك بكفاءة' },
    forgot: { h: 'نسيت كلمة المرور؟', s: 'أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة' },
  };

  return (
    <div className="app auth-mode">
      <div className="content-area">
        <section className="page auth-page active">
          <div className="auth-scroll">
            <div className="auth-hero">
              {mode !== 'login' && (
                <button className="auth-back" onClick={() => setMode('login')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              )}
              <div className="auth-logo">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/>
                  <path d="m17 8 2 2 4-4"/><path d="m17 14 2 2 4-4"/>
                </svg>
              </div>
              <h1 className="auth-title">{titles[mode].h}</h1>
              <p className="auth-sub">{titles[mode].s}</p>
            </div>

            <form className="auth-form" onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot}>
              {mode === 'signup' && (
                <div className="form-field">
                  <label>الاسم الكامل</label>
                  <div className="auth-input-wrap">
                    <svg className="icon auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="أحمد المنصوري" autoComplete="name" />
                  </div>
                </div>
              )}

              <div className="form-field">
                <label>البريد الإلكتروني</label>
                <div className="auth-input-wrap">
                  <svg className="icon auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" dir="ltr" style={{ textAlign: 'right' }} autoComplete="email" />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="form-field">
                  <label>رقم الجوال (اختياري)</label>
                  <div className="auth-input-wrap">
                    <svg className="icon auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 5X XXX XXXX" dir="ltr" style={{ textAlign: 'right' }} autoComplete="tel" />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="form-field">
                  <div className="auth-label-row">
                    <label>كلمة المرور</label>
                    {mode === 'login' && (
                      <button type="button" className="auth-link-small" onClick={() => setMode('forgot')}>
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>
                  <div className="auth-input-wrap">
                    <svg className="icon auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? '٨ أحرف على الأقل' : '••••••••'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                    <button type="button" className="auth-input-eye" onClick={() => setShowPwd(!showPwd)} aria-label="إظهار">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px' }} disabled={loading}>
                {loading ? 'جارٍ المعالجة...' : mode === 'login' ? 'تسجيل الدخول' : mode === 'signup' ? 'إنشاء الحساب' : 'إرسال رابط الاستعادة'}
              </button>

              <div className="auth-footer">
                {mode === 'login' && (
                  <>
                    ليس لديك حساب؟
                    <button type="button" className="auth-link" onClick={() => setMode('signup')}>أنشئ حساباً جديداً</button>
                  </>
                )}
                {mode === 'signup' && (
                  <>
                    لديك حساب بالفعل؟
                    <button type="button" className="auth-link" onClick={() => setMode('login')}>سجّل دخولك</button>
                  </>
                )}
                {mode === 'forgot' && (
                  <>
                    تذكرت كلمة المرور؟
                    <button type="button" className="auth-link" onClick={() => setMode('login')}>تسجيل الدخول</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>

      {toast && (
        <div className="toast show" style={toast.isError ? { background: '#DC2626' } : {}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
