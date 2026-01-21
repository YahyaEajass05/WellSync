import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, BarChart3, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">WellSync</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Mental Wellness
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Predict, monitor, and improve your mental wellness and academic
          performance with advanced AI technology
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <Brain className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Mental Wellness</h3>
            <p className="text-muted-foreground">
              Get AI-powered predictions of your mental wellness score based on
              lifestyle factors
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <BarChart3 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Academic Impact</h3>
            <p className="text-muted-foreground">
              Understand how digital habits affect your academic performance
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <Heart className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Stress Analysis</h3>
            <p className="text-muted-foreground">
              Track stress levels and receive personalized recommendations
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
