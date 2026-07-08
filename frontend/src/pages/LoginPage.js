import React, { useState } from 'react';
import api from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.overlay}>
          <h1 style={styles.brandTitle}>لوحة التحكم</h1>
          <p style={styles.brandDesc}>نظام إدارة متكامل للإنذارات والخصومات والتعويضات</p>
          <div style={styles.features}>
            <div style={styles.feature}>✅ إدارة الكابتنات</div>
            <div style={styles.feature}>📱 ربط الواتساب</div>
            <div style={styles.feature}>📊 تقارير متقدمة</div>
            <div style={styles.feature}>⚖️ نظام الطعون</div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <div style={styles.logoCircle}>🔐</div>
          <h2 style={styles.title}>بصمة الابداع</h2>
          <p style={styles.subtitle}>سجّل دخولك للمتابعة</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="البريد الإلكتروني"
              />
            </div>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="كلمة المرور"
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

var styles = {
  container: { display: 'flex', minHeight: '100vh', direction: 'rtl' },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  overlay: { textAlign: 'center', color: 'white', maxWidth: '400px' },
  brandTitle: { fontSize: '36px', fontWeight: '800', marginBottom: '15px' },
  brandDesc: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', lineHeight: '1.8' },
  features: { display: 'flex', flexDirection: 'column', gap: '15px' },
  feature: { fontSize: '16px', color: 'rgba(255,255,255,0.9)', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' },
  rightPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backgroundColor: '#f8f9fa' },
  formContainer: { width: '100%', maxWidth: '400px', textAlign: 'center' },
  logoCircle: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '35px', margin: '0 auto 20px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '5px' },
  subtitle: { fontSize: '14px', color: '#999', marginBottom: '30px' },
  inputWrapper: { position: 'relative', marginBottom: '20px' },
  inputIcon: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' },
  input: { width: '100%', padding: '15px 50px 15px 15px', border: '2px solid #e9ecef', borderRadius: '12px', fontSize: '15px', backgroundColor: 'white', transition: 'border 0.3s', outline: 'none', boxSizing: 'border-box' },
  button: { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s' },
  error: { backgroundColor: '#fff3f3', color: '#dc3545', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', border: '1px solid #ffcdd2' }
};

export default LoginPage;