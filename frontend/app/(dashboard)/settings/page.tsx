'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { settingsApi } from '@/lib/api/settings';
import { useAuthStore } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User, Lock, Bell, Palette, Trash2, ShieldAlert,
  CheckCircle, AlertCircle, Save, Eye, EyeOff, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'personal',     label: 'Personal Info',   icon: User },
  { id: 'password',     label: 'Password',        icon: Lock },
  { id: 'preferences',  label: 'Preferences',     icon: Palette },
  { id: 'notifications',label: 'Notifications',   icon: Bell },
  { id: 'danger',       label: 'Danger Zone',     icon: ShieldAlert },
] as const;
type TabId = typeof TABS[number]['id'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Spinner() {
  return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
}

function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-md px-4 py-3 text-sm', type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-destructive dark:bg-red-900/20')}>
      {type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {message}
    </div>
  );
}

function SelectField({ id, value, onChange, options }: { id: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Personal Info Tab ─────────────────────────────────────────────────────────
function PersonalTab() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const { data: user, isLoading } = useQuery({ queryKey: ['settings-user'], queryFn: settingsApi.getProfile });

  const [form, setForm] = useState({ firstName: '', lastName: '', age: '', gender: '', occupation: '', country: '', phoneNumber: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        age: user.profile?.age != null ? String(user.profile.age) : '',
        gender: user.profile?.gender ?? '',
        occupation: user.profile?.occupation ?? '',
        country: user.profile?.country ?? '',
        phoneNumber: user.profile?.phoneNumber ?? '',
      });
    }
  }, [user]);

  const { mutate, isPending } = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: (updated) => {
      setUser(updated as any);
      queryClient.invalidateQueries({ queryKey: ['settings-user'] });
      setStatus({ type: 'success', message: 'Personal information updated successfully!' });
      setTimeout(() => setStatus(null), 4000);
    },
    onError: (err: any) => {
      setStatus({ type: 'error', message: err?.response?.data?.message ?? 'Failed to update. Please try again.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setStatus({ type: 'error', message: 'First name and last name are required.' });
      return;
    }
    mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      profile: {
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        occupation: form.occupation || undefined,
        country: form.country || undefined,
        phoneNumber: form.phoneNumber || undefined,
      },
    });
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <p className="text-sm text-muted-foreground mt-1">Update your name, age, and other basic details.</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-bold select-none">
              {form.firstName?.[0]?.toUpperCase()}{form.lastName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{form.firstName} {form.lastName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                <Input id="firstName" placeholder="John" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                <Input id="lastName" placeholder="Doe" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min={13} max={120} placeholder="e.g. 21" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <SelectField id="gender" value={form.gender} onChange={v => setForm(f => ({ ...f, gender: v }))}
                  options={[{ value: '', label: '— Select gender —' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }, { value: 'Prefer not to say', label: 'Prefer not to say' }]} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="occupation">Occupation</Label>
                <SelectField id="occupation" value={form.occupation} onChange={v => setForm(f => ({ ...f, occupation: v }))}
                  options={[
                    { value: '', label: '— Select occupation —' },
                    { value: 'Student', label: 'Student' },
                    { value: 'Software Engineer', label: 'Software Engineer' },
                    { value: 'Teacher / Educator', label: 'Teacher / Educator' },
                    { value: 'Healthcare Professional', label: 'Healthcare Professional' },
                    { value: 'Business / Entrepreneur', label: 'Business / Entrepreneur' },
                    { value: 'Designer', label: 'Designer' },
                    { value: 'Researcher / Scientist', label: 'Researcher / Scientist' },
                    { value: 'Engineer (Other)', label: 'Engineer (Other)' },
                    { value: 'Marketing / Sales', label: 'Marketing / Sales' },
                    { value: 'Finance / Accounting', label: 'Finance / Accounting' },
                    { value: 'Legal Professional', label: 'Legal Professional' },
                    { value: 'Artist / Creative', label: 'Artist / Creative' },
                    { value: 'Freelancer', label: 'Freelancer' },
                    { value: 'Unemployed', label: 'Unemployed' },
                    { value: 'Retired', label: 'Retired' },
                    { value: 'Other', label: 'Other' },
                  ]} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <SelectField id="country" value={form.country} onChange={v => setForm(f => ({ ...f, country: v }))}
                  options={[
                    { value: '', label: '— Select country —' },
                    { value: 'Afghanistan', label: 'Afghanistan' },
                    { value: 'Albania', label: 'Albania' },
                    { value: 'Algeria', label: 'Algeria' },
                    { value: 'Argentina', label: 'Argentina' },
                    { value: 'Australia', label: 'Australia' },
                    { value: 'Austria', label: 'Austria' },
                    { value: 'Bangladesh', label: 'Bangladesh' },
                    { value: 'Belgium', label: 'Belgium' },
                    { value: 'Brazil', label: 'Brazil' },
                    { value: 'Canada', label: 'Canada' },
                    { value: 'Chile', label: 'Chile' },
                    { value: 'China', label: 'China' },
                    { value: 'Colombia', label: 'Colombia' },
                    { value: 'Czech Republic', label: 'Czech Republic' },
                    { value: 'Denmark', label: 'Denmark' },
                    { value: 'Egypt', label: 'Egypt' },
                    { value: 'Ethiopia', label: 'Ethiopia' },
                    { value: 'Finland', label: 'Finland' },
                    { value: 'France', label: 'France' },
                    { value: 'Germany', label: 'Germany' },
                    { value: 'Ghana', label: 'Ghana' },
                    { value: 'Greece', label: 'Greece' },
                    { value: 'Hungary', label: 'Hungary' },
                    { value: 'India', label: 'India' },
                    { value: 'Indonesia', label: 'Indonesia' },
                    { value: 'Iran', label: 'Iran' },
                    { value: 'Iraq', label: 'Iraq' },
                    { value: 'Ireland', label: 'Ireland' },
                    { value: 'Israel', label: 'Israel' },
                    { value: 'Italy', label: 'Italy' },
                    { value: 'Japan', label: 'Japan' },
                    { value: 'Jordan', label: 'Jordan' },
                    { value: 'Kenya', label: 'Kenya' },
                    { value: 'Malaysia', label: 'Malaysia' },
                    { value: 'Mexico', label: 'Mexico' },
                    { value: 'Morocco', label: 'Morocco' },
                    { value: 'Myanmar', label: 'Myanmar' },
                    { value: 'Nepal', label: 'Nepal' },
                    { value: 'Netherlands', label: 'Netherlands' },
                    { value: 'New Zealand', label: 'New Zealand' },
                    { value: 'Nigeria', label: 'Nigeria' },
                    { value: 'Norway', label: 'Norway' },
                    { value: 'Pakistan', label: 'Pakistan' },
                    { value: 'Philippines', label: 'Philippines' },
                    { value: 'Poland', label: 'Poland' },
                    { value: 'Portugal', label: 'Portugal' },
                    { value: 'Romania', label: 'Romania' },
                    { value: 'Russia', label: 'Russia' },
                    { value: 'Saudi Arabia', label: 'Saudi Arabia' },
                    { value: 'Singapore', label: 'Singapore' },
                    { value: 'South Africa', label: 'South Africa' },
                    { value: 'South Korea', label: 'South Korea' },
                    { value: 'Spain', label: 'Spain' },
                    { value: 'Sri Lanka', label: 'Sri Lanka' },
                    { value: 'Sweden', label: 'Sweden' },
                    { value: 'Switzerland', label: 'Switzerland' },
                    { value: 'Taiwan', label: 'Taiwan' },
                    { value: 'Tanzania', label: 'Tanzania' },
                    { value: 'Thailand', label: 'Thailand' },
                    { value: 'Turkey', label: 'Turkey' },
                    { value: 'Uganda', label: 'Uganda' },
                    { value: 'Ukraine', label: 'Ukraine' },
                    { value: 'United Arab Emirates', label: 'United Arab Emirates' },
                    { value: 'United Kingdom', label: 'United Kingdom' },
                    { value: 'United States', label: 'United States' },
                    { value: 'Vietnam', label: 'Vietnam' },
                    { value: 'Zimbabwe', label: 'Zimbabwe' },
                    { value: 'Other', label: 'Other' },
                  ]} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="e.g. +94 77 123 4567" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              </div>
            </div>
            {status && <Alert type={status.type} message={status.message} />}
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="h-4 w-4" />{isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Password Tab ──────────────────────────────────────────────────────────────
function PasswordTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus({ type: 'success', message: 'Password changed successfully!' });
      setTimeout(() => setStatus(null), 4000);
    },
    onError: (err: any) => {
      setStatus({ type: 'error', message: err?.response?.data?.message ?? 'Failed to change password.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (form.newPassword.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
      setStatus({ type: 'error', message: 'Password must contain uppercase, lowercase and a number.' });
      return;
    }
    mutate(form);
  };

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strength];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Change Password</h2>
        <p className="text-sm text-muted-foreground mt-1">Keep your account secure with a strong password.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update Password</CardTitle>
          <CardDescription>Must be at least 8 characters with uppercase, lowercase and a number.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label htmlFor="currentPw">Current Password</Label>
              <div className="relative">
                <Input id="currentPw" type={show.current ? 'text' : 'password'} placeholder="Enter current password"
                  value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} required />
                <button type="button" onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPw">New Password</Label>
              <div className="relative">
                <Input id="newPw" type={show.newPw ? 'text' : 'password'} placeholder="Enter new password"
                  value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required />
                <button type="button" onClick={() => setShow(s => ({ ...s, newPw: !s.newPw }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show.newPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= strength ? strengthColor : 'bg-muted')} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Strength: <span className="font-medium">{strengthLabel}</span></p>
                </div>
              )}
            </div>
            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPw">Confirm New Password</Label>
              <div className="relative">
                <Input id="confirmPw" type={show.confirm ? 'text' : 'password'} placeholder="Confirm new password"
                  value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Passwords do not match</p>
              )}
              {form.confirmPassword && form.newPassword === form.confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passwords match</p>
              )}
            </div>
            {status && <Alert type={status.type} message={status.message} />}
            <Button type="submit" disabled={isPending} className="gap-2">
              <Lock className="h-4 w-4" />{isPending ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Preferences Tab ───────────────────────────────────────────────────────────
function PreferencesTab() {
  const queryClient = useQueryClient();
  const { setTheme: setUITheme } = useUIStore();
  const { data: user, isLoading } = useQuery({ queryKey: ['settings-user'], queryFn: settingsApi.getProfile });
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user?.preferences?.theme) setTheme(user.preferences.theme);
  }, [user]);

  const { mutate, isPending } = useMutation({
    mutationFn: (t: 'light' | 'dark' | 'auto') => settingsApi.updatePreferences({ theme: t }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['settings-user'] });
      setUITheme(theme === 'auto' ? 'system' : theme);
      setStatus({ type: 'success', message: 'Theme preference saved!' });
      setTimeout(() => setStatus(null), 3000);
    },
    onError: () => setStatus({ type: 'error', message: 'Failed to save preference.' }),
  });

  if (isLoading) return <Spinner />;

  const themes = [
    { value: 'light', label: 'Light', desc: 'Clean white interface', icon: '☀️' },
    { value: 'dark',  label: 'Dark',  desc: 'Easy on the eyes',      icon: '🌙' },
    { value: 'auto',  label: 'System',desc: 'Follows your OS setting',icon: '💻' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">Customize your WellSync experience.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Theme</CardTitle>
          <CardDescription>Choose how WellSync looks for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {themes.map(t => (
              <button key={t.value} type="button" onClick={() => setTheme(t.value as any)}
                className={cn('flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all text-center',
                  theme === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                <span className="text-2xl">{t.icon}</span>
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.desc}</span>
              </button>
            ))}
          </div>
          {status && <Alert type={status.type} message={status.message} />}
          <Button onClick={() => mutate(theme)} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" />{isPending ? 'Saving...' : 'Save Theme'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({ queryKey: ['settings-user'], queryFn: settingsApi.getProfile });
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user?.preferences?.notifications) {
      setEmailNotif(user.preferences.notifications.email ?? true);
      setPushNotif(user.preferences.notifications.push ?? true);
    }
  }, [user]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => settingsApi.updatePreferences({ notifications: { email: emailNotif, push: pushNotif } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-user'] });
      setStatus({ type: 'success', message: 'Notification preferences saved!' });
      setTimeout(() => setStatus(null), 3000);
    },
    onError: () => setStatus({ type: 'error', message: 'Failed to save preferences.' }),
  });

  if (isLoading) return <Spinner />;

  const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          checked ? 'bg-primary' : 'bg-muted')}>
        <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notification Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Control how and when WellSync notifies you.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notification Channels</CardTitle>
          <CardDescription>Choose which notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle checked={emailNotif} onChange={setEmailNotif}
            label="Email Notifications"
            desc="Receive prediction reports, weekly summaries and alerts via email" />
          <Toggle checked={pushNotif} onChange={setPushNotif}
            label="Push Notifications"
            desc="Get real-time alerts and reminders in your browser" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What you will receive</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              { on: emailNotif, label: 'Weekly wellness summary emails' },
              { on: emailNotif, label: 'Prediction result reports (PDF)' },
              { on: emailNotif, label: 'Password reset and security alerts' },
              { on: pushNotif,  label: 'Real-time prediction notifications' },
              { on: pushNotif,  label: 'Daily logging reminders' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                {item.on ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> : <div className="h-4 w-4 rounded-full border-2 border-muted shrink-0" />}
                <span className={item.on ? '' : 'line-through opacity-50'}>{item.label}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {status && <Alert type={status.type} message={status.message} />}
      <Button onClick={() => mutate()} disabled={isPending} className="gap-2">
        <Save className="h-4 w-4" />{isPending ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}

// ── Danger Zone Tab ───────────────────────────────────────────────────────────
function DangerTab() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { mutate: deactivate, isPending: deactivating } = useMutation({
    mutationFn: settingsApi.deactivateAccount,
    onSuccess: () => {
      logout();
      router.push('/login');
    },
    onError: () => setStatus({ type: 'error', message: 'Failed to deactivate account.' }),
  });

  const { mutate: deleteAcc, isPending: deleting } = useMutation({
    mutationFn: () => settingsApi.deleteAccount(deletePassword),
    onSuccess: () => {
      logout();
      router.push('/login');
    },
    onError: (err: any) => {
      setStatus({ type: 'error', message: err?.response?.data?.error ?? 'Failed to delete account.' });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mt-1">Irreversible actions. Please read carefully before proceeding.</p>
      </div>

      {/* Deactivate */}
      <Card className="border-yellow-300 dark:border-yellow-700">
        <CardHeader>
          <CardTitle className="text-base text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Deactivate Account
          </CardTitle>
          <CardDescription>Temporarily disable your account. You can reactivate by contacting support.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Your data will be preserved but you will not be able to log in until reactivation.</p>
          {!showDeactivateDialog ? (
            <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
              onClick={() => setShowDeactivateDialog(true)}>
              Deactivate My Account
            </Button>
          ) : (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 p-4 space-y-3">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Are you sure you want to deactivate your account?</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeactivateDialog(false)}>Cancel</Button>
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => deactivate()} disabled={deactivating}>
                  {deactivating ? 'Deactivating...' : 'Yes, Deactivate'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Delete Account
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">All your predictions, profiles, and personal data will be permanently erased.</p>
          {!showDeleteDialog ? (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              Delete My Account
            </Button>
          ) : (
            <div className="rounded-lg border border-destructive bg-red-50 dark:bg-red-900/10 p-4 space-y-4">
              <p className="text-sm font-medium text-destructive">This action is permanent and cannot be undone.</p>
              <div className="space-y-1.5">
                <Label htmlFor="confirmText">Type <strong>DELETE</strong> to confirm</Label>
                <Input id="confirmText" placeholder="DELETE" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deletePw">Enter your password</Label>
                <div className="relative">
                  <Input id="deletePw" type={showDeletePw ? 'text' : 'password'} placeholder="Your current password"
                    value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
                  <button type="button" onClick={() => setShowDeletePw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showDeletePw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {status && <Alert type={status.type} message={status.message} />}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setShowDeleteDialog(false); setConfirmDelete(''); setDeletePassword(''); setStatus(null); }}>Cancel</Button>
                <Button variant="destructive" size="sm" disabled={confirmDelete !== 'DELETE' || !deletePassword || deleting}
                  onClick={() => deleteAcc()}>
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign Out</CardTitle>
          <CardDescription>Sign out from your current session on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-2" onClick={() => { logout(); router.push('/login'); }}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar nav */}
        <aside className="lg:w-52 shrink-0">
          <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left w-full',
                    activeTab === tab.id
                      ? tab.id === 'danger' ? 'bg-red-50 text-destructive dark:bg-red-900/20' : 'bg-primary text-primary-foreground'
                      : tab.id === 'danger' ? 'text-destructive hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-accent hover:text-accent-foreground'
                  )}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'personal'      && <PersonalTab />}
          {activeTab === 'password'      && <PasswordTab />}
          {activeTab === 'preferences'   && <PreferencesTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'danger'        && <DangerTab />}
        </div>
      </div>
    </div>
  );
}
