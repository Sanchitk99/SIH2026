import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { ClipboardList, FileText, Home, LogOut, PlusCircle, ShieldCheck, UserRound, Warehouse } from 'lucide-react';
import Brand from '../brand/Brand';
import LanguageSwitcher from './LanguageSwitcher';

type NavItem = { to: string; labelKey: string; icon: typeof Home };

function initials(label?: string) {
  return (label || 'KC').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function AppLayout() {
  const { role, backendUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navByRole: Record<string, NavItem[]> = {
    COLLECTOR: [
      { to: '/collector/dashboard', labelKey: 'nav.overview', icon: Home },
      { to: '/collector/lots/create', labelKey: 'nav.addEWaste', icon: PlusCircle },
      { to: '/collector/lots', labelKey: 'nav.myLotsQuotes', icon: ClipboardList },
      { to: '/collector/transactions', labelKey: 'nav.transactions', icon: FileText },
      { to: '/collector/safety', labelKey: 'nav.safety', icon: ShieldCheck },
    ],
    RECYCLER: [
      { to: '/recycler/dashboard', labelKey: 'nav.marketplace', icon: Home },
      { to: '/recycler/profile', labelKey: 'nav.facilityProfile', icon: Warehouse },
      { to: '/recycler/transactions', labelKey: 'nav.handovers', icon: FileText },
    ],
    ADMIN: [{ to: '/admin/dashboard', labelKey: 'nav.adminOverview', icon: Home }],
  };

  const navItems = navByRole[role || ''] || [];
  const activeLabel = navItems.find((item) => location.pathname === item.to)?.labelKey || 'nav.workspace';
  const roleLabel = role ? t(`roles.${role}`) : t('nav.workspace');

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth/login');
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label={t('nav.primary')}>
        <div className="sidebar-top">
          <Brand />
          <p className="sidebar-role">{roleLabel} · {t('nav.workspace')}</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, labelKey, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-mini">
            <span className="user-avatar" aria-hidden="true">{initials(roleLabel)}</span>
            <div><strong>{roleLabel}</strong><span>{backendUser?.is_active ? t('common.activeAccount') : t('common.accountReview')}</span></div>
          </div>
          <button type="button" className="logout-button" onClick={handleLogout}><LogOut size={16} aria-hidden="true" /> {t('common.logout')}</button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <p className="topbar-context">{t(activeLabel)}</p>
          <div className="topbar-actions">
            <LanguageSwitcher />
            <div className="profile-chip">
              <span className="user-avatar" aria-hidden="true">{initials(roleLabel)}</span>
              <div><strong>{roleLabel}</strong><span>{roleLabel}</span></div>
            </div>
          </div>
        </header>

        <div className="mobile-brandbar"><Brand compact /></div>
        <main className="page-wrap"><Outlet /></main>

        <nav className="mobile-bottom-nav" aria-label={t('nav.mobile')}>
          {navItems.map(({ to, labelKey, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
              <Icon size={19} aria-hidden="true" /><span>{t(labelKey)}</span>
            </NavLink>
          ))}
          {navItems.length === 0 && <NavLink to="/auth/login"><UserRound size={19} /> <span>{t('common.login')}</span></NavLink>}
        </nav>
      </div>
    </div>
  );
}
