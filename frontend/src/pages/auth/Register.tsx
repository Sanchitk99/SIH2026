import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { ArrowRight, Building2, UserRound } from 'lucide-react';
import { auth } from '../../firebase/config';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../contexts/AuthContext';
import Brand from '../../components/brand/Brand';
import LanguageSwitcher from '../../components/layout/LanguageSwitcher';
import { Button } from '../../components/ui/Primitives';
import { getErrorMessage } from '../../utils/errors';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'COLLECTOR' as 'COLLECTOR' | 'RECYCLER' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const update = (field: string, value: string) => setFormData((current) => ({ ...current, [field]: value }));

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setIsSubmitting(true);
    try {
      let userCredential: UserCredential;
      try { userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password); }
      catch (err: unknown) { if (!(err instanceof Error && 'code' in err && err.code === 'auth/email-already-in-use')) throw err; userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password); }
      await userCredential.user.getIdToken(true);
      await authApi.registerBackendUser({ name: formData.name, phone: formData.phone, role: formData.role });
      await refreshProfile(); navigate(`/${formData.role.toLowerCase()}/dashboard`);
    } catch (err: unknown) { setError(getErrorMessage(err, t('auth.registerError'))); }
    finally { setIsSubmitting(false); }
  };

  return <main className="auth-page">
    <section className="auth-intro">
      <div className="auth-brand-row"><Brand /><LanguageSwitcher /></div>
      <div className="auth-intro-copy"><p className="eyebrow">{t('auth.registerEyebrow')}</p><h1>{t('auth.registerHeroTitle')}</h1><p>{t('auth.registerHeroDescription')}</p></div>
      <p className="auth-footnote">{t('auth.registerFootnote')}</p>
    </section>
    <section className="auth-panel"><div className="auth-panel-inner">
      <div className="auth-panel-heading"><p className="eyebrow">{t('auth.createWorkspace')}</p><h2>{t('auth.getStarted')}</h2><p>{t('auth.chooseParticipation')}</p></div>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <fieldset className="role-choice">
        <legend className="sr-only">{t('auth.accountType')}</legend>
        <button type="button" className={formData.role === 'COLLECTOR' ? 'selected' : ''} onClick={() => setFormData((current) => ({ ...current, role: 'COLLECTOR' }))}><UserRound size={18} color="#0d5c3a" aria-hidden="true" /><strong>{t('auth.collector')}</strong><span>{t('auth.collectorDescription')}</span></button>
        <button type="button" className={formData.role === 'RECYCLER' ? 'selected' : ''} onClick={() => setFormData((current) => ({ ...current, role: 'RECYCLER' }))}><Building2 size={18} color="#0d5c3a" aria-hidden="true" /><strong>{t('auth.recycler')}</strong><span>{t('auth.recyclerDescription')}</span></button>
      </fieldset>
      <form onSubmit={handleRegister} className="register-form">
        <label className="form-field"><span className="form-label">{t('auth.fullName')}</span><input className="form-input" value={formData.name} onChange={(event) => update('name', event.target.value)} placeholder={t('auth.namePlaceholder')} required /></label>
        <label className="form-field"><span className="form-label">{t('auth.phone')}</span><input className="form-input" type="tel" value={formData.phone} onChange={(event) => update('phone', event.target.value)} placeholder={t('auth.phonePlaceholder')} required /></label>
        <label className="form-field"><span className="form-label">{t('auth.email')}</span><input className="form-input" type="email" value={formData.email} onChange={(event) => update('email', event.target.value)} placeholder={t('auth.emailPlaceholder')} required /></label>
        <label className="form-field"><span className="form-label">{t('auth.password')}</span><input className="form-input" type="password" minLength={6} value={formData.password} onChange={(event) => update('password', event.target.value)} placeholder={t('auth.registerPasswordPlaceholder')} required /></label>
        <Button type="submit" loading={isSubmitting} className="auth-submit">{t('auth.register')} <ArrowRight size={17} /></Button>
      </form>
      <p className="auth-switch">{t('auth.alreadyHaveAccount')} <Link to="/auth/login">{t('auth.signInLink')}</Link></p>
    </div></section>
  </main>;
}
