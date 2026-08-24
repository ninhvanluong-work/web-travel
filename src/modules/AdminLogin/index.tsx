import { AdminLoginBranding } from './admin-login-branding';
import { AdminLoginForm } from './admin-login-form';

export default function AdminLoginModule() {
  return (
    <div className="flex min-h-screen">
      <AdminLoginForm />
      <AdminLoginBranding />
    </div>
  );
}
