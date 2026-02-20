'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Brain,
  BarChart3,
  Heart,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  Moon,
  Sun,
  ChevronDown,
  Activity,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';

/* ─── tiny hook: count up animation ─── */
function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

/* ─── intersection observer hook ─── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── stat card ─── */
function StatCard({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const count = useCountUp(value, 2000, start);
  return (
    <div className="text-center">
      <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

/* ─── feature card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: string;
}) {
  return (
    <div
      className="landing-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2"
      style={{ animationDelay: delay }}
    >
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-5 shadow-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} transition-all duration-500 rounded-b-2xl`} />
    </div>
  );
}

/* ─── testimonial card ─── */
function TestimonialCard({
  name,
  role,
  text,
  rating,
  avatar,
}: {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col gap-4 hover:border-primary/40 transition-all duration-300">
      <div className="flex gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-muted-foreground italic leading-relaxed">"{text}"</p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── step card ─── */
function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-5 items-start group">
      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-lg mb-1">{title}</h4>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { ref: statsRef, inView: statsInView } = useInView();

  useEffect(() => setMounted(true), []);

  const features = [
    {
      icon: Brain,
      title: 'Mental Wellness AI',
      description: 'Get a personalised wellness score (0–100) powered by ensemble ML models trained on thousands of student profiles.',
      gradient: 'from-cyan-500 to-blue-600',
      delay: '0ms',
    },
    {
      icon: Activity,
      title: 'Stress Level Detection',
      description: 'Classify your stress into Low, Moderate, High, or Very High — with actionable steps for each level.',
      gradient: 'from-violet-500 to-purple-600',
      delay: '100ms',
    },
    {
      icon: BookOpen,
      title: 'Academic Impact',
      description: 'Discover how screen time, sleep, and social media usage are impacting your academic performance.',
      gradient: 'from-emerald-500 to-green-600',
      delay: '200ms',
    },
    {
      icon: TrendingUp,
      title: 'Trend Analytics',
      description: 'Track your wellness journey over time with beautiful charts and 30-day trend summaries.',
      gradient: 'from-orange-500 to-amber-600',
      delay: '300ms',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted, never sold, and fully under your control. GDPR compliant by design.',
      gradient: 'from-rose-500 to-pink-600',
      delay: '400ms',
    },
    {
      icon: Zap,
      title: 'Instant Predictions',
      description: 'Get your wellness report in under 2 seconds. Our FastAPI service runs models at lightning speed.',
      gradient: 'from-yellow-500 to-orange-500',
      delay: '500ms',
    },
  ];

  const testimonials = [
    {
      name: 'Aisha Perera',
      role: 'Medical Student, Colombo',
      text: 'WellSync helped me identify that my late-night screen time was tanking my focus. My GPA improved after following the recommendations.',
      rating: 5,
      avatar: 'AP',
    },
    {
      name: 'Rahul Sharma',
      role: 'Engineering Student, Kandy',
      text: 'The stress level analysis was eye-opening. I didn\'t realise I was in the "Very High" category until WellSync flagged it.',
      rating: 5,
      avatar: 'RS',
    },
    {
      name: 'Priya Fernando',
      role: 'Business Student, Galle',
      text: 'Weekly wellness reports sent to my email keep me accountable. The PDF breakdowns are incredibly detailed and easy to understand.',
      rating: 5,
      avatar: 'PF',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Animated gradient background ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px] animate-blob" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Brain className="h-8 w-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              WellSync
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </button>
            )}
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-lg shadow-blue-500/30">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative container mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Advanced Machine Learning
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up">
          Your Mental Wellness,{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Supercharged by AI
          </span>
        </h1>

        <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
          WellSync analyses your lifestyle, sleep, screen time, and social media habits to predict your mental wellness score, stress level, and academic impact — in real time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-400">
          <Link href="/register">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-xl shadow-blue-500/30 text-base px-8 hover:scale-105 transition-transform duration-300"
            >
              Start For Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-base px-8 hover:scale-105 transition-transform duration-300"
            >
              Explore Features <ChevronDown className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Hero card preview */}
        <div className="relative max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-black/20">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Wellness Score', value: '87/100', color: 'text-emerald-400', icon: Heart },
                { label: 'Stress Level', value: 'Low', color: 'text-cyan-400', icon: Activity },
                { label: 'Academic Risk', value: 'Minimal', color: 'text-violet-400', icon: BookOpen },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <Icon className={`h-6 w-6 ${color} mx-auto mb-2`} />
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live prediction · Updated just now
            </div>
          </div>
          {/* Glow */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-2xl" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} className="border-y border-white/10 bg-white/3 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value={95} suffix="%" label="Prediction Accuracy" start={statsInView} />
          <StatCard value={3} suffix=" Models" label="AI/ML Models" start={statsInView} />
          <StatCard value={8} suffix=" Types" label="Email Notifications" start={statsInView} />
          <StatCard value={100} suffix="%" label="Privacy First" start={statsInView} />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="container mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-medium mb-4">
            <Zap className="h-3.5 w-3.5" /> Everything You Need
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Built for Student{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
              Wellbeing
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Six powerful features working together to give you a complete picture of your mental health and academic journey.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-white/3 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-6 py-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
                <CheckCircle className="h-3.5 w-3.5" /> Simple Process
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                How{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                  WellSync
                </span>{' '}
                Works
              </h2>
              <div className="flex flex-col gap-8">
                <StepCard number="1" title="Create Your Free Account" description="Sign up in under 60 seconds. Verify your email and you're ready to go." />
                <StepCard number="2" title="Enter Your Lifestyle Data" description="Answer a few quick questions about your sleep, screen time, study habits, and social media usage." />
                <StepCard number="3" title="Get AI Predictions" description="Our ensemble ML models analyse your data and deliver instant wellness, stress, and academic reports." />
                <StepCard number="4" title="Track & Improve" description="Receive weekly email summaries, follow recommendations, and watch your wellness score rise over time." />
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">wellsync — prediction result</span>
                </div>
                <div className="space-y-4 font-mono text-sm">
                  {[
                    { key: 'wellness_score', value: '87.3', color: 'text-emerald-400' },
                    { key: 'stress_level', value: '"Low"', color: 'text-cyan-400' },
                    { key: 'academic_risk', value: '"Minimal"', color: 'text-violet-400' },
                    { key: 'confidence', value: '0.94', color: 'text-yellow-400' },
                    { key: 'recommendations', value: '[3 items]', color: 'text-orange-400' },
                  ].map(({ key, value, color }) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-muted-foreground">"{key}":</span>
                      <span className={`font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Prediction completed in 1.2s
                </div>
              </div>
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="container mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-medium mb-4">
            <Users className="h-3.5 w-3.5" /> Student Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Students
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">See what real students are saying about WellSync.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-24 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            Ready to take control of your{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              wellness?
            </span>
          </h2>
          <p className="text-muted-foreground text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of students who use WellSync to stay on top of their mental health and academic performance.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-2xl shadow-blue-500/40 text-lg px-10 py-6 hover:scale-105 transition-transform duration-300"
            >
              Get Started For Free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-4">No credit card required · Free forever</p>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-white/3">
        <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            <span className="font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">WellSync</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} WellSync · Built at ICBT Campus · MIT License
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
