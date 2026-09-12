import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Globe2, LockKeyhole } from 'lucide-react';
import { auth, googleProvider } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Brand from '../../components/brand/Brand';
import { Button } from '../../components/ui/Primitives';
import { getErrorMessage } from '../../utils/errors';
import LanguageSwitcher from '../../components/layout/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, role, profileError } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role) navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
  }, [isAuthenticated, role, navigate]);

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('auth.loginError')));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try { await signInWithPopup(auth, googleProvider); }
    catch (err: unknown) { setError(getErrorMessage(err, t('auth.googleError'))); }
  };

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="auth-brand-row"><Brand /><LanguageSwitcher /></div>
        <div className="auth-intro-copy">
          <p className="eyebrow">{t('auth.loginEyebrow')}</p>
          <h1>{t('auth.loginHeroTitle')}</h1>
          <p>{t('auth.loginHeroDescription')}</p>
          <ul className="auth-benefits">
            <li><CheckCircle2 size={18} /> {t('auth.benefitLots')}</li>
            <li><CheckCircle2 size={18} /> {t('auth.benefitMarketplace')}</li>
            <li><CheckCircle2 size={18} /> {t('auth.benefitStatus')}</li>
          </ul>
        </div>
        <p className="auth-footnote">{t('auth.loginFootnote')}</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-panel-heading">
            <div className="auth-icon"><LockKeyhole size={20} /></div>
            <p className="eyebrow">{t('auth.secureAccess')}</p>
            <h2>{t('auth.welcomeBack')}</h2>
            <p>{t('auth.loginDescription')}</p>
          </div>

          {(error || profileError) && <div className="auth-error" role="alert">{error || (profileError ? t(profileError) : '')}</div>}

          <form onSubmit={handleEmailLogin} className="auth-form">
            <label className="form-field">
              <span className="form-label">{t('auth.email')}</span>
              <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('auth.emailPlaceholder')} required />
            </label>
            <label className="form-field">
              <span className="form-label">{t('auth.password')}</span>
              <input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('auth.passwordPlaceholder')} required />
            </label>
            <Button type="submit" loading={isSubmitting} className="auth-submit">{t('auth.signIn')} <ArrowRight size={17} /></Button>
          </form>

          <div className="auth-divider"><span>{t('auth.continueWith')}</span></div>
          <Button type="button" variant="secondary" onClick={handleGoogleLogin} className="auth-submit"><Globe2 size={17} /> {t('auth.google')}</Button>

          <p className="auth-switch">{t('auth.newToMarketplace')} <Link to="/auth/register">{t('auth.createAccount')}</Link></p>
        </div>
      </section>
    </main>
  );
}
