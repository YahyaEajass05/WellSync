'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, Heart, BarChart3, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const predictionTypes = [
  {
    href: '/predictions/mental-wellness',
    icon: Brain,
    iconColor: 'text-blue-500',
    bg: 'from-blue-500/10 to-cyan-500/10',
    border: 'hover:border-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    badgeLabel: 'Score 0–100',
    title: 'Mental Wellness',
    description:
      'Get a personalised wellness score based on your screen time, sleep quality, exercise habits, stress levels, and social interactions.',
    bullets: ['Ensemble ML model', 'Lifestyle factor analysis', 'Personalised recommendations'],
  },
  {
    href: '/predictions/stress',
    icon: Heart,
    iconColor: 'text-red-500',
    bg: 'from-red-500/10 to-pink-500/10',
    border: 'hover:border-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    badgeLabel: 'Score 0–10',
    title: 'Stress Level',
    description:
      'Classify your stress into Low, Moderate, High, or Very High categories with targeted action plans for each level.',
    bullets: ['Multi-class classification', 'Category-specific advice', 'Urgency-based alerts'],
  },
  {
    href: '/predictions/academic',
    icon: BarChart3,
    iconColor: 'text-purple-500',
    bg: 'from-purple-500/10 to-violet-500/10',
    border: 'hover:border-purple-400',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    badgeLabel: 'Score 2–9',
    title: 'Academic Impact',
    description:
      'Analyse how your social media usage, sleep, and mental health score affect your academic performance and addiction risk.',
    bullets: ['Social media analysis', 'Academic risk scoring', 'Digital habit insights'],
  },
];

export default function NewPredictionPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/predictions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            New Prediction
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose a prediction type to get AI-powered insights about your wellness.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
        {predictionTypes.map(({ href, icon: Icon, iconColor, bg, border, badge, badgeLabel, title, description, bullets }) => (
          <Link key={href} href={href} className="group block">
            <Card
              className={`h-full cursor-pointer border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${border}`}
            >
              <CardHeader className="pb-3">
                <div className={`inline-flex w-fit p-3 rounded-xl bg-gradient-to-br ${bg} mb-3`}>
                  <Icon className={`h-7 w-7 ${iconColor}`} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                    {badgeLabel}
                  </span>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5 mb-4">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className={`flex items-center gap-1 text-sm font-medium ${iconColor} group-hover:gap-2 transition-all`}>
                  Start Prediction <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-foreground mb-1">Pro tip</p>
          <p className="text-muted-foreground">
            Run all three predictions for the most complete picture of your wellness. Each model
            analyses different aspects of your lifestyle and they complement each other perfectly.
          </p>
        </div>
      </div>
    </div>
  );
}
