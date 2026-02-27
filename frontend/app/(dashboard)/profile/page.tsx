'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  useProfileOverview, useMentalWellnessProfile, useStudentProfile,
  useScreenTime, useSleep, useSaveMentalWellnessProfile,
  useSaveStudentProfile, useLogScreenTime, useLogSleep,
} from '@/lib/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User, Brain, GraduationCap, Monitor, Moon,
  CheckCircle, AlertCircle, Clock, Activity,
  Save, Eye, Headphones, Coffee, Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
const TABS = [
  { id: 'overview',    label: 'Overview',         icon: User },
  { id: 'wellness',    label: 'Wellness Profile',  icon: Brain },
  { id: 'student',     label: 'Student Profile',   icon: GraduationCap },
  { id: 'screentime',  label: 'Screen Time',       icon: Monitor },
  { id: 'sleep',       label: 'Sleep',             icon: Moon },
] as const;
type TabId = typeof TABS[number]['id'];

// Shared UI helpers
function Badge({ label, color }: { label: string; color: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', color)}>{label}</span>;
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
}

function SelectField({ id, value, onChange, options, placeholder }: {
  id: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
    </select>
  );
}

// Overview Tab
function OverviewTab() {
  const { user: storeUser } = useAuthStore();
  const { data: overview, isLoading: overviewLoading } = useProfileOverview();
  const { data: screenData } = useScreenTime(7);
  const { data: sleepData } = useSleep(7);

  // Fetch fresh user data from API
  const [freshUser, setFreshUser] = useState<any>(storeUser);
  const [userLoading, setUserLoading] = useState(!storeUser);

  useEffect(() => {
    import('@/lib/api').then(({ usersApi }) => {
      usersApi.getProfile().then(u => {
        setFreshUser(u);
        setUserLoading(false);
      }).catch(() => setUserLoading(false));
    });
  }, []);

  if (overviewLoading || userLoading) return <Spinner />;

  const mw = overview?.profiles?.mentalWellness;
  const sp = overview?.profiles?.student;

  // Prefer separately-fetched averages over overview averages (more reliable)
  const screen = screenData?.weeklyAverage ?? overview?.weeklyAverages?.screenTime ?? null;
  const sleep = sleepData?.weeklyAverage ?? overview?.weeklyAverages?.sleep ?? null;

  const displayUser = freshUser ?? storeUser;

  return (
    <div className="space-y-6">
      {/* User Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold select-none">
              {displayUser?.firstName?.[0]?.toUpperCase()}{displayUser?.lastName?.[0]?.toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                {displayUser?.firstName} {displayUser?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
              {displayUser?.profile?.occupation && (
                <p className="text-sm text-muted-foreground">{displayUser.profile.occupation}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {displayUser?.isEmailVerified
                  ? <Badge label="✓ Email Verified" color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" />
                  : <Badge label="⚠ Email Unverified" color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" />}
                <Badge label={displayUser?.role === 'admin' ? '⭐ Admin' : '👤 User'} color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" />
                {displayUser?.profile?.country && (
                  <Badge label={displayUser.profile.country} color="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" />
                )}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Member since {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Wellness Profile Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-blue-500" /> Wellness Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mw?.exists && mw.completed ? (
              // Complete profile — show stats
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Profile complete</span>
                </div>
                {mw.readinessScore !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Readiness score</span>
                    <span className="font-bold"
                      style={{ color: mw.readinessScore >= 70 ? '#16a34a' : mw.readinessScore >= 40 ? '#d97706' : '#dc2626' }}>
                      {mw.readinessScore}/100
                    </span>
                  </div>
                )}
                {mw.stressCategory && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stress level</span>
                    <Badge label={mw.stressCategory}
                      color={mw.stressCategory === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : mw.stressCategory === 'Moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} />
                  </div>
                )}
              </>
            ) : mw?.exists && !mw.completed ? (
              // Profile exists but incomplete
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Profile needs updating</span>
                </div>
                {mw.readinessScore !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Readiness score</span>
                    <span className="font-bold" style={{ color: '#d97706' }}>{mw.readinessScore}/100</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Go to <strong>Wellness Profile</strong> tab to complete it.</p>
              </div>
            ) : (
              // No profile yet
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Not set up yet</span>
                </div>
                <p className="text-xs text-muted-foreground">Go to the <strong>Wellness Profile</strong> tab to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Profile Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-purple-500" /> Student Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sp?.exists && sp.completed ? (
              // Complete profile — show stats
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Profile complete</span>
                </div>
                {sp.academicStanding && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Academic standing</span>
                    <span className="font-semibold">{sp.academicStanding}</span>
                  </div>
                )}
                {sp.riskScore !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Academic risk</span>
                    <Badge label={`${sp.riskScore}%`}
                      color={sp.riskScore < 30 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : sp.riskScore < 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} />
                  </div>
                )}
              </>
            ) : sp?.exists && !sp.completed ? (
              // Profile exists but incomplete
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Profile needs updating</span>
                </div>
                {sp.academicStanding && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Academic standing</span>
                    <span className="font-semibold">{sp.academicStanding}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Go to <strong>Student Profile</strong> tab to complete it.</p>
              </div>
            ) : (
              // No profile yet
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Not set up yet</span>
                </div>
                <p className="text-xs text-muted-foreground">Go to the <strong>Student Profile</strong> tab to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Averages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" /> This Week&apos;s Averages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!screen && !sleep ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm text-muted-foreground">No tracking data yet this week.</p>
              <p className="text-xs text-muted-foreground">Use the <strong>Screen Time</strong> and <strong>Sleep</strong> tabs to start logging daily.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Avg Screen Time"
                value={screen ? `${Number(screen.averageScreenTime).toFixed(1)}h` : '—'}
                sub={screen ? `${screen.daysLogged} days logged` : 'No data yet'}
                color={screen && screen.averageScreenTime > 8 ? '#dc2626' : screen && screen.averageScreenTime > 5 ? '#d97706' : '#16a34a'}
              />
              <StatCard
                label="Work Screen"
                value={screen ? `${Number(screen.averageWorkScreen).toFixed(1)}h` : '—'}
                sub="per day"
              />
              <StatCard
                label="Avg Sleep"
                value={sleep ? `${Number(sleep.averageSleepHours).toFixed(1)}h` : '—'}
                sub={sleep ? `${sleep.daysRecorded} nights recorded` : 'No data yet'}
                color={sleep ? (sleep.averageSleepHours >= 7 ? '#16a34a' : sleep.averageSleepHours >= 5 ? '#d97706' : '#dc2626') : undefined}
              />
              <StatCard
                label="Sleep Quality"
                value={sleep ? `${Number(sleep.averageSleepQuality).toFixed(1)}/5` : '—'}
                sub={sleep ? (sleep.averageSleepQuality >= 3.5 ? 'Good quality' : 'Needs improvement') : 'No data yet'}
                color={sleep ? (sleep.averageSleepQuality >= 3.5 ? '#16a34a' : '#d97706') : undefined}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview?.recentActivity?.screenTime && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Screen Time logged</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(overview.recentActivity.screenTime.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-blue-600">{overview.recentActivity.screenTime.screenTimeHours}h</span>
            </div>
          )}
          {overview?.recentActivity?.sleep && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium">Sleep logged</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(overview.recentActivity.sleep.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-indigo-600">{overview.recentActivity.sleep.sleepHours}h</span>
            </div>
          )}
          {!overview?.recentActivity?.screenTime && !overview?.recentActivity?.sleep && (
            <div className="text-center py-6 space-y-1">
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
              <p className="text-xs text-muted-foreground">Start logging from the <strong>Screen Time</strong> and <strong>Sleep</strong> tabs.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wellness Tab
function WellnessTab() {
  const { data, isLoading } = useMentalWellnessProfile();
  const { mutate: save, isPending, isSuccess, isError, error } = useSaveMentalWellnessProfile();
  const p = data?.profile;

  const [form, setForm] = useState({
    occupation: '',
    workMode: 'Student',
    stressLevel: '5',
    productivity: '50',
    exerciseMinutesPerWeek: '0',
    socialHoursPerWeek: '0',
    isSeeingTherapist: false,
    medicationUsage: 'None',
    hasChronicConditions: false,
  });

  // Sync form with loaded profile data
  useEffect(() => {
    if (p) {
      setForm({
        occupation: p.occupation ?? '',
        workMode: p.workMode ?? 'Student',
        stressLevel: String(p.stressLevel ?? 5),
        productivity: String(p.productivity ?? 50),
        exerciseMinutesPerWeek: String(p.exerciseMinutesPerWeek ?? 0),
        socialHoursPerWeek: String(p.socialHoursPerWeek ?? 0),
        isSeeingTherapist: p.isSeeingTherapist ?? false,
        medicationUsage: p.medicationUsage ?? 'None',
        hasChronicConditions: p.hasChronicConditions ?? false,
      });
    }
  }, [p]);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.occupation) {
      alert('Please select an occupation.');
      return;
    }
    save({
      occupation: form.occupation,
      workMode: form.workMode as any,
      stressLevel: Number(form.stressLevel),
      productivity: Number(form.productivity),
      exerciseMinutesPerWeek: Number(form.exerciseMinutesPerWeek),
      socialHoursPerWeek: Number(form.socialHoursPerWeek),
      isSeeingTherapist: form.isSeeingTherapist,
      medicationUsage: form.medicationUsage as any,
      hasChronicConditions: form.hasChronicConditions,
    });
  };

  if (isLoading) return <Spinner />;
  return (
    <div className="space-y-6">
      <SectionHeader title="Mental Wellness Profile" description="Tell us about your lifestyle and mental wellness habits. This helps improve your prediction accuracy." />
      {data?.readinessScore !== undefined && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Readiness Score" value={`${data.readinessScore}/100`} sub="Overall wellness readiness"
            color={data.readinessScore >= 70 ? '#16a34a' : data.readinessScore >= 40 ? '#d97706' : '#dc2626'} />
          <StatCard label="Stress Category" value={p?.stressCategory ?? 'N/A'} sub={`Level ${p?.stressLevel ?? 'N/A'}/10`} />
          <StatCard label="Productivity" value={p?.productivityCategory ?? 'N/A'} sub={`${p?.productivity ?? 'N/A'}%`} />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update Wellness Profile</CardTitle>
          <CardDescription>All fields help generate better AI predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="occupation">Occupation</Label>
                <SelectField
                  id="occupation"
                  value={form.occupation}
                  onChange={v => set('occupation', v)}
                  options={[
                    'Student',
                    'Software Engineer',
                    'Data Scientist',
                    'Teacher / Educator',
                    'Healthcare Worker',
                    'Business / Manager',
                    'Designer',
                    'Marketing / Sales',
                    'Researcher / Academic',
                    'Freelancer',
                    'Self-employed',
                    'Part-time Worker',
                    'Unemployed',
                    'Other',
                  ]}
                  placeholder="— Select your occupation —"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workMode">Work Mode</Label>
                <SelectField id="workMode" value={form.workMode} onChange={v => set('workMode', v)} options={['Remote','Hybrid','Office','Self-employed','Student']} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stressLevel">Stress Level (0-10) — Current: {form.stressLevel}</Label>
                <input type="range" id="stressLevel" min={0} max={10} step={1} value={form.stressLevel}
                  onChange={e => set('stressLevel', e.target.value)} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground"><span>No stress</span><span>Extreme</span></div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productivity">Productivity % — Current: {form.productivity}%</Label>
                <input type="range" id="productivity" min={0} max={100} step={5} value={form.productivity}
                  onChange={e => set('productivity', e.target.value)} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground"><span>0%</span><span>100%</span></div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exercise">Exercise (min/week)</Label>
                <Input id="exercise" type="number" min={0} max={1000} placeholder="e.g. 150" value={form.exerciseMinutesPerWeek} onChange={e => set('exerciseMinutesPerWeek', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="social">Social Hours/Week</Label>
                <Input id="social" type="number" min={0} max={100} placeholder="e.g. 10" value={form.socialHoursPerWeek} onChange={e => set('socialHoursPerWeek', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="medication">Medication Usage</Label>
                <SelectField id="medication" value={form.medicationUsage} onChange={v => set('medicationUsage', v)} options={['None','Occasional','Regular','Prefer not to say']} />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isSeeingTherapist} onChange={e => set('isSeeingTherapist', e.target.checked)} className="h-4 w-4 accent-primary" />
                <span className="text-sm">Currently seeing a therapist</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hasChronicConditions} onChange={e => set('hasChronicConditions', e.target.checked)} className="h-4 w-4 accent-primary" />
                <span className="text-sm">Has chronic health conditions</span>
              </label>
            </div>
            {isSuccess && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Wellness profile saved successfully!</p>}
            {isError && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {(error as any)?.response?.data?.message ?? 'Failed to save. Please try again.'}</p>}
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="h-4 w-4" />{isPending ? 'Saving...' : 'Save Wellness Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Data constants:
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin',
  'Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia',
  'Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica',
  'Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini',
  'Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada',
  'Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia',
  'Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania',
  'Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania',
  'Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique',
  'Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
  'North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea',
  'Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino',
  'Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain',
  'Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda',
  'Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu',
  'Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

const FIELDS_OF_STUDY = [
  'Accounting & Finance',
  'Agriculture & Environmental Science',
  'Architecture & Urban Planning',
  'Arts & Design',
  'Biological Sciences',
  'Business Administration & Management',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Communication & Media Studies',
  'Computer Science & Software Engineering',
  'Criminology & Law Enforcement',
  'Culinary Arts & Hospitality',
  'Data Science & Artificial Intelligence',
  'Dentistry',
  'Economics',
  'Education & Teaching',
  'Electrical & Electronics Engineering',
  'English & Literature',
  'Environmental Studies',
  'Fashion & Textile Design',
  'Film & Theatre Arts',
  'Geography',
  'Graphic Design',
  'Health Sciences',
  'History',
  'Human Resources Management',
  'Information Technology',
  'International Relations',
  'Journalism',
  'Law & Legal Studies',
  'Linguistics',
  'Logistics & Supply Chain Management',
  'Marketing & Advertising',
  'Mathematics & Statistics',
  'Mechanical Engineering',
  'Medicine & Surgery',
  'Nursing',
  'Nutrition & Dietetics',
  'Pharmacy',
  'Philosophy',
  'Physics',
  'Political Science',
  'Psychology',
  'Public Health',
  'Social Work',
  'Sociology & Anthropology',
  'Sports Science & Physical Education',
  'Tourism & Travel Management',
  'Veterinary Medicine',
  'Other',
];

// Student Tab
function StudentTab() {
  const { data, isLoading } = useStudentProfile();
  const { mutate: save, isPending, isSuccess, isError, error } = useSaveStudentProfile();
  const p = data?.profile;

  const [form, setForm] = useState({
    academicLevel: 'Bachelor',
    country: '',
    institution: '',
    major: '',
    yearOfStudy: '',
    gpa: '',
    attendanceRate: '',
    studyHoursPerWeek: '0',
    hoursWorkedPerWeek: '0',
    partTimeJob: false,
    financialStress: 'None',
    relationshipStatus: 'Prefer not to say',
    livingArrangement: 'Other',
  });

  // Sync form with loaded profile data
  useEffect(() => {
    if (p) {
      setForm({
        academicLevel: p.academicLevel ?? 'Bachelor',
        country: p.country ?? '',
        institution: p.institution ?? '',
        major: p.major ?? '',
        yearOfStudy: p.yearOfStudy != null ? String(p.yearOfStudy) : '',
        gpa: p.gpa != null ? String(p.gpa) : '',
        attendanceRate: p.attendanceRate != null ? String(p.attendanceRate) : '',
        studyHoursPerWeek: String(p.studyHoursPerWeek ?? 0),
        hoursWorkedPerWeek: String(p.hoursWorkedPerWeek ?? 0),
        partTimeJob: p.partTimeJob ?? false,
        financialStress: p.financialStress ?? 'None',
        relationshipStatus: p.relationshipStatus ?? 'Prefer not to say',
        livingArrangement: p.livingArrangement ?? 'Other',
      });
    }
  }, [p]);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      academicLevel: form.academicLevel,
      country: form.country,
      institution: form.institution || undefined,
      major: form.major || undefined,
      studyHoursPerWeek: Number(form.studyHoursPerWeek),
      hoursWorkedPerWeek: Number(form.hoursWorkedPerWeek),
      partTimeJob: form.partTimeJob,
      financialStress: form.financialStress,
      relationshipStatus: form.relationshipStatus,
      livingArrangement: form.livingArrangement,
    };
    if (form.yearOfStudy) payload.yearOfStudy = Number(form.yearOfStudy);
    if (form.gpa) payload.gpa = Number(form.gpa);
    if (form.attendanceRate) payload.attendanceRate = Number(form.attendanceRate);
    save(payload);
  };
  if (isLoading) return <Spinner />;
  return (
    <div className="space-y-6">
      <SectionHeader title="Student Profile" description="Your academic details help us give you more accurate academic impact predictions." />
      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Academic Standing" value={p?.academicStanding ?? 'N/A'} sub={p?.gpa ? `GPA ${p.gpa.toFixed(2)}` : 'No GPA set'} />
          <StatCard label="Academic Risk" value={data.riskScore !== undefined ? `${data.riskScore}%` : 'N/A'} sub="Risk score"
            color={data.riskScore < 30 ? '#16a34a' : data.riskScore < 60 ? '#d97706' : '#dc2626'} />
          <StatCard label="Work-Study Balance" value={p?.workStudyBalance ?? 'N/A'} sub={`${form.studyHoursPerWeek}h study + ${form.hoursWorkedPerWeek}h work`} />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update Student Profile</CardTitle>
          <CardDescription>Academic and lifestyle information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="academicLevel">Academic Level</Label>
                <SelectField id="academicLevel" value={form.academicLevel} onChange={v => set('academicLevel', v)} options={['High School','Bachelor','Master','PhD','Other']} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                <SelectField
                  id="country"
                  value={form.country}
                  onChange={v => set('country', v)}
                  options={COUNTRIES}
                  placeholder="— Select your country —"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="institution">Institution</Label>
                <Input id="institution" placeholder="e.g. ICBT Campus" value={form.institution} onChange={e => set('institution', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="major">Field of Study / Major</Label>
                <SelectField
                  id="major"
                  value={form.major}
                  onChange={v => set('major', v)}
                  options={FIELDS_OF_STUDY}
                  placeholder="— Select your field of study —"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Input id="yearOfStudy" type="number" min={1} max={10} placeholder="e.g. 2" value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gpa">GPA (0-4.0)</Label>
                <Input id="gpa" type="number" min={0} max={4.0} step={0.01} placeholder="e.g. 3.50" value={form.gpa} onChange={e => set('gpa', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="attendanceRate">Attendance Rate (%)</Label>
                <Input id="attendanceRate" type="number" min={0} max={100} placeholder="e.g. 85" value={form.attendanceRate} onChange={e => set('attendanceRate', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="studyHours">Study Hours/Week</Label>
                <Input id="studyHours" type="number" min={0} max={100} placeholder="e.g. 30" value={form.studyHoursPerWeek} onChange={e => set('studyHoursPerWeek', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="financialStress">Financial Stress</Label>
                <SelectField id="financialStress" value={form.financialStress} onChange={v => set('financialStress', v)} options={['None','Low','Moderate','High','Very High']} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="relationshipStatus">Relationship Status</Label>
                <SelectField id="relationshipStatus" value={form.relationshipStatus} onChange={v => set('relationshipStatus', v)} options={['Single','In a relationship','Married','Prefer not to say']} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="livingArrangement">Living Arrangement</Label>
                <SelectField id="livingArrangement" value={form.livingArrangement} onChange={v => set('livingArrangement', v)} options={['On-campus','Off-campus alone','Off-campus with roommates','With family','Other']} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workHours">Work Hours/Week</Label>
                <Input id="workHours" type="number" min={0} max={40} placeholder="e.g. 0" value={form.hoursWorkedPerWeek} onChange={e => set('hoursWorkedPerWeek', e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.partTimeJob} onChange={e => set('partTimeJob', e.target.checked)} className="h-4 w-4 accent-primary" />
              <span className="text-sm">I have a part-time job</span>
            </label>
            {isSuccess && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Student profile saved successfully!</p>}
            {isError && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {(error as any)?.response?.data?.message ?? 'Failed to save. Please try again.'}</p>}
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="h-4 w-4" />{isPending ? 'Saving...' : 'Save Student Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Screen Time Tab:
function ScreenTimeTab() {
  const { data, isLoading } = useScreenTime(7);
  const { mutate: logTime, isPending, isSuccess, isError, error } = useLogScreenTime();
  const [form, setForm] = useState({ screenTimeHours: '', workScreenHours: '', leisureScreenHours: '', eyeStrain: false, headache: false, mood: '', notes: '' });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logTime({
      screenTimeHours: Number(form.screenTimeHours),
      workScreenHours: form.workScreenHours ? Number(form.workScreenHours) : undefined,
      leisureScreenHours: form.leisureScreenHours ? Number(form.leisureScreenHours) : undefined,
      eyeStrain: form.eyeStrain, headache: form.headache,
      mood: form.mood || undefined, notes: form.notes || undefined,
    });
  };
  if (isLoading) return <Spinner />;
  const avg = data?.weeklyAverage;
  return (
    <div className="space-y-6">
      <SectionHeader title="Screen Time" description="Track your daily screen time to monitor digital wellness." />
      {avg && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Avg Daily Screen Time" value={`${avg.averageScreenTime?.toFixed(1) ?? 0}h`} sub={`${avg.daysLogged} days logged`}
            color={avg.averageScreenTime > 8 ? '#dc2626' : avg.averageScreenTime > 5 ? '#d97706' : '#16a34a'} />
          <StatCard label="Avg Work Screen" value={`${avg.averageWorkScreen?.toFixed(1) ?? 0}h`} sub="per day" />
          <StatCard label="Avg Leisure Screen" value={`${avg.averageLeisureScreen?.toFixed(1) ?? 0}h`} sub="per day" />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log Today&apos;s Screen Time</CardTitle>
            <CardDescription>Enter your screen usage for today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="totalScreen">Total Screen Time (hours) <span className="text-destructive">*</span></Label>
                <Input id="totalScreen" type="number" min={0} max={24} step={0.5} placeholder="e.g. 6" value={form.screenTimeHours} onChange={e => set('screenTimeHours', e.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="workScreen">Work Screen (hours)</Label>
                  <Input id="workScreen" type="number" min={0} max={24} step={0.5} placeholder="e.g. 4" value={form.workScreenHours} onChange={e => set('workScreenHours', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="leisureScreen">Leisure Screen (hours)</Label>
                  <Input id="leisureScreen" type="number" min={0} max={24} step={0.5} placeholder="e.g. 2" value={form.leisureScreenHours} onChange={e => set('leisureScreenHours', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="screenMood">Mood</Label>
                <SelectField id="screenMood" value={form.mood} onChange={v => set('mood', v)} options={['very_poor','poor','neutral','good','excellent']} placeholder="Select mood" />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.eyeStrain} onChange={e => set('eyeStrain', e.target.checked)} className="h-4 w-4 accent-primary" />
                  <Eye className="h-3.5 w-3.5" /><span className="text-sm">Eye strain</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.headache} onChange={e => set('headache', e.target.checked)} className="h-4 w-4 accent-primary" />
                  <Headphones className="h-3.5 w-3.5" /><span className="text-sm">Headache</span>
                </label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="screenNotes">Notes (optional)</Label>
                <Input id="screenNotes" placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              {isSuccess && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Screen time logged!</p>}
              {isError && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {(error as any)?.response?.data?.message ?? 'Failed to log.'}</p>}
              <Button type="submit" disabled={isPending} className="w-full gap-2">
                <Monitor className="h-4 w-4" />{isPending ? 'Logging...' : 'Log Screen Time'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last 7 Days</CardTitle>
            <CardDescription>Your recent screen time history</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.trends && data.trends.length > 0 ? (
              <div className="space-y-2">
                {[...data.trends].reverse().map((entry: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">{entry.workScreenHours}h work &middot; {entry.leisureScreenHours}h leisure</p>
                    </div>
                    <span className={cn('font-semibold', entry.screenTimeHours > 8 ? 'text-destructive' : entry.screenTimeHours > 5 ? 'text-yellow-600' : 'text-green-600')}>
                      {entry.screenTimeHours}h
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No screen time logs yet. Start logging today!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sleep Tab:
function SleepTab() {
  const { data, isLoading } = useSleep(7);
  const { mutate: logSleep, isPending, isSuccess, isError, error } = useLogSleep();
  const qualityLabels: Record<string, string> = { '1': 'Very Poor', '2': 'Poor', '3': 'Fair', '4': 'Good', '5': 'Excellent' };
  const [form, setForm] = useState({ sleepHours: '', sleepQuality: '3', bedtime: '', wakeTime: '', sleepInterruptions: '0', screenBeforeSleep: false, caffeine: false, mood: '', notes: '' });
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logSleep({
      sleepHours: Number(form.sleepHours), sleepQuality: Number(form.sleepQuality),
      bedtime: form.bedtime || undefined, wakeTime: form.wakeTime || undefined,
      sleepInterruptions: Number(form.sleepInterruptions),
      screenBeforeSleep: form.screenBeforeSleep, caffeine: form.caffeine,
      mood: form.mood || undefined, notes: form.notes || undefined,
    });
  };
  if (isLoading) return <Spinner />;
  const avg = data?.weeklyAverage;
  return (
    <div className="space-y-6">
      <SectionHeader title="Sleep Tracker" description="Monitor your sleep patterns to understand their impact on your wellness." />
      {avg && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Avg Sleep Hours" value={`${avg.averageSleepHours?.toFixed(1) ?? 0}h`} sub={`${avg.daysRecorded} days recorded`}
            color={avg.averageSleepHours >= 7 ? '#16a34a' : avg.averageSleepHours >= 5 ? '#d97706' : '#dc2626'} />
          <StatCard label="Avg Sleep Quality" value={`${avg.averageSleepQuality?.toFixed(1) ?? 0}/5`}
            sub={avg.averageSleepQuality >= 3.5 ? 'Good quality' : 'Needs improvement'}
            color={avg.averageSleepQuality >= 3.5 ? '#16a34a' : '#d97706'} />
          <StatCard label="Days Recorded" value={avg.daysRecorded ?? 0} sub="this week" />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log Last Night&apos;s Sleep</CardTitle>
            <CardDescription>Record your sleep details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sleepHours">Sleep Hours <span className="text-destructive">*</span></Label>
                <Input id="sleepHours" type="number" min={0} max={24} step={0.5} placeholder="e.g. 7.5" value={form.sleepHours} onChange={e => set('sleepHours', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sleepQuality">Sleep Quality — {qualityLabels[form.sleepQuality]}</Label>
                <input type="range" id="sleepQuality" min={1} max={5} step={1} value={form.sleepQuality}
                  onChange={e => set('sleepQuality', e.target.value)} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Poor</span><span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bedtime">Bedtime</Label>
                  <Input id="bedtime" type="time" value={form.bedtime} onChange={e => set('bedtime', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wakeTime">Wake Time</Label>
                  <Input id="wakeTime" type="time" value={form.wakeTime} onChange={e => set('wakeTime', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sleepInterruptions">Interruptions</Label>
                <Input id="sleepInterruptions" type="number" min={0} max={20} placeholder="0" value={form.sleepInterruptions} onChange={e => set('sleepInterruptions', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sleepMood">Morning Mood</Label>
                <SelectField id="sleepMood" value={form.mood} onChange={v => set('mood', v)} options={['very_poor','poor','neutral','good','excellent']} placeholder="Select mood" />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.screenBeforeSleep} onChange={e => set('screenBeforeSleep', e.target.checked)} className="h-4 w-4 accent-primary" />
                  <Smartphone className="h-3.5 w-3.5" /><span className="text-sm">Screen before sleep</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.caffeine} onChange={e => set('caffeine', e.target.checked)} className="h-4 w-4 accent-primary" />
                  <Coffee className="h-3.5 w-3.5" /><span className="text-sm">Had caffeine</span>
                </label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sleepNotes">Notes (optional)</Label>
                <Input id="sleepNotes" placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              {isSuccess && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Sleep record logged!</p>}
              {isError && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {(error as any)?.response?.data?.message ?? 'Failed to log.'}</p>}
              <Button type="submit" disabled={isPending} className="w-full gap-2">
                <Moon className="h-4 w-4" />{isPending ? 'Logging...' : 'Log Sleep'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last 7 Days</CardTitle>
            <CardDescription>Your recent sleep records</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.records && data.records.length > 0 ? (
              <div className="space-y-2">
                {data.records.map((rec: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">
                        Quality: {qualityLabels[String(rec.sleepQuality)]}
                        {rec.bedtime ? ` · ${rec.bedtime} to ${rec.wakeTime}` : ''}
                      </p>
                    </div>
                    <span className={cn('font-semibold', rec.sleepHours >= 7 ? 'text-green-600' : rec.sleepHours >= 5 ? 'text-yellow-600' : 'text-destructive')}>
                      {rec.sleepHours}h
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No sleep records yet. Start logging tonight!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Page Export:
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your wellness profiles, track sleep and screen time</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-lg border bg-muted p-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors flex-1 justify-center',
                activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div>
        {activeTab === 'overview'   && <OverviewTab />}
        {activeTab === 'wellness'   && <WellnessTab />}
        {activeTab === 'student'    && <StudentTab />}
        {activeTab === 'screentime' && <ScreenTimeTab />}
        {activeTab === 'sleep'      && <SleepTab />}
      </div>
    </div>
  );
}
