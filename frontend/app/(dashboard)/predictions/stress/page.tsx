'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, ArrowLeft, Loader2, Info, AlertCircle, Lightbulb, X, Mail, Download } from 'lucide-react';
import axios from '@/lib/api/axios-instance';
import { toast } from 'sonner';
import { predictionsApi } from '@/lib/api';
import type { Prediction } from '@/types';

export default function StressLevelPredictionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleEmailReport = async () => {
    const predId = prediction?._id ?? (prediction as any)?.id;
    if (!predId) return;
    
    setIsSendingEmail(true);
    try {
      await predictionsApi.emailReport(predId);
      toast.success('Report sent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    const predId = prediction?._id ?? (prediction as any)?.id;
    if (!predId) return;
    
    setIsDownloadingPDF(true);
    try {
      // Request PDF from backend
      const response = await axios.get(`/predictions/${predId}/pdf`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Stress_Level_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
    } catch (error: any) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF. Please try email report instead.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const getRecommendations = (score: number) => {
    if (score >= 8) {
      return [
        'URGENT: Seek professional mental health support immediately from a licensed therapist or counselor',
        'Practice emergency stress relief: Use deep breathing exercises (4-7-8 technique) multiple times daily',
        'Prioritize restorative sleep: Aim for 8-9 hours of sleep nightly in a dark, quiet, cool environment',
        'Eliminate non-essential stressors: Review your commitments and temporarily remove or delegate tasks where possible',
        'Take frequent breaks: Step away from work/study every 45-60 minutes for at least 5-10 minutes',
        'Reduce screen exposure: Limit screen time to essential activities only, especially 2 hours before bed',
        'Engage in gentle physical activity: Even a 10-minute walk can reduce stress hormones significantly',
        'Connect with support systems: Talk to trusted friends, family members, or join a support group'
      ];
    } else if (score >= 6) {
      return [
        'Implement daily stress management: Practice meditation, yoga, or progressive muscle relaxation for 15-20 minutes',
        'Improve sleep quality and duration: Establish a calming bedtime routine and aim for 7-9 hours',
        'Reduce screen time: Cut back screen use by 1-2 hours daily, particularly before bedtime',
        'Create regular work breaks: Use the Pomodoro Technique (25 minutes work, 5 minutes break)',
        'Exercise regularly: Engage in moderate aerobic exercise for 30-45 minutes, 4-5 times per week',
        'Consider professional counseling: Speaking with a therapist can provide valuable stress management strategies'
      ];
    } else if (score >= 3) {
      return [
        'Continue monitoring stress levels: Keep a stress journal to identify patterns and triggers',
        'Maintain healthy sleep habits: Stick to your 7-9 hour sleep schedule with consistent times',
        'Keep up regular exercise: Continue your current physical activity routine',
        'Practice weekly mindfulness: Dedicate time each week to meditation, yoga, or relaxation',
        'Balance work and leisure: Ensure adequate time for hobbies, socializing, and relaxation'
      ];
    } else {
      return [
        'Excellent work! Continue your current stress management practices',
        'Maintain your healthy lifestyle habits: Keep up good sleep, exercise, and work-life balance',
        'Stay proactive: Continue using stress management techniques to build resilience',
        'Support others: Share your successful strategies with friends or family who may be struggling',
        'Keep building resilience: Try new stress management techniques to expand your coping toolkit'
      ];
    }
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    occupation: 'Student',
    work_mode: 'Hybrid',
    screen_time_hours: '',
    work_screen_hours: '',
    leisure_screen_hours: '',
    sleep_hours: '',
    sleep_quality_1_5: '',
    productivity_0_100: '',
    exercise_minutes_per_week: '',
    social_hours_per_week: '',
    mental_wellness_index_0_100: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadExampleData = async () => {
    try {
      const response = await axios.get('/predictions/examples/stress_level');
      const example = response.data.data.example;
      setFormData({
        age: example.age.toString(),
        gender: example.gender,
        occupation: example.occupation,
        work_mode: example.work_mode,
        screen_time_hours: example.screen_time_hours.toString(),
        work_screen_hours: example.work_screen_hours.toString(),
        leisure_screen_hours: example.leisure_screen_hours.toString(),
        sleep_hours: example.sleep_hours.toString(),
        sleep_quality_1_5: example.sleep_quality_1_5.toString(),
        productivity_0_100: example.productivity_0_100.toString(),
        exercise_minutes_per_week: example.exercise_minutes_per_week.toString(),
        social_hours_per_week: example.social_hours_per_week.toString(),
        mental_wellness_index_0_100: example.mental_wellness_index_0_100.toString()
      });
      toast.success('Example data loaded!');
      setFormErrors({});
    } catch (error) {
      toast.error('Failed to load example data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);
    
    // Client-side validation
    const errors: Record<string, string> = {};
    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      errors.age = 'Age is required.';
    } else if (age < 18 || age > 100) {
      errors.age = 'Age must be between 18 and 100.';
    }
    const sleepQuality = parseInt(formData.sleep_quality_1_5);
    if (!formData.sleep_quality_1_5 || isNaN(sleepQuality) || sleepQuality < 1 || sleepQuality > 5) {
      errors.sleep_quality_1_5 = 'Sleep quality must be between 1 and 5.';
    }
    const productivity = parseInt(formData.productivity_0_100);
    if (!formData.productivity_0_100 || isNaN(productivity) || productivity < 0 || productivity > 100) {
      errors.productivity_0_100 = 'Productivity must be between 0 and 100.';
    }
    const wellnessIndex = parseFloat(formData.mental_wellness_index_0_100);
    if (!formData.mental_wellness_index_0_100 || isNaN(wellnessIndex) || wellnessIndex < 0 || wellnessIndex > 100) {
      errors.mental_wellness_index_0_100 = 'Mental wellness index must be between 0 and 100.';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }
    setFormErrors({});

    try {
      const payload = {
        age,
        gender: formData.gender,
        occupation: formData.occupation,
        work_mode: formData.work_mode,
        screen_time_hours: parseFloat(formData.screen_time_hours),
        work_screen_hours: parseFloat(formData.work_screen_hours),
        leisure_screen_hours: parseFloat(formData.leisure_screen_hours),
        sleep_hours: parseFloat(formData.sleep_hours),
        sleep_quality_1_5: sleepQuality,
        productivity_0_100: productivity,
        exercise_minutes_per_week: parseInt(formData.exercise_minutes_per_week),
        social_hours_per_week: parseFloat(formData.social_hours_per_week),
        mental_wellness_index_0_100: wellnessIndex
      };

      // Validate screen time breakdown
      if (payload.work_screen_hours + payload.leisure_screen_hours > payload.screen_time_hours) {
        toast.error('Work + Leisure screen time cannot exceed Total screen time');
        setIsLoading(false);
        return;
      }

      const response = await axios.post('/predictions/stress-level', payload);
      setPrediction(response.data.data.prediction);
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Prediction completed successfully!');
      
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(error.response?.data?.message || 'Failed to get prediction');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStressColor = (score: number) => {
    if (score >= 8) return '#ef4444';
    if (score >= 6) return '#f97316';
    if (score >= 3) return '#f59e0b';
    return '#22c55e';
  };

  const getStressLabel = (score: number) => {
    if (score >= 8) return 'Very High Stress';
    if (score >= 6) return 'High Stress';
    if (score >= 3) return 'Moderate Stress';
    return 'Low Stress';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/predictions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Stress Level Prediction
          </h1>
          <p className="text-muted-foreground">
            AI-powered stress assessment with personalized recommendations
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="text-sm text-red-900 dark:text-red-100">
              <p className="font-semibold mb-1">How it works:</p>
              <p>
                Our AI model analyzes your lifestyle factors, sleep patterns, and wellness indicators
                to predict your stress level (0-10 scale). You'll receive personalized recommendations
                based on your results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enter Your Information</CardTitle>
              <CardDescription>Complete the form to assess your stress level</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={loadExampleData}>
              Load Example
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    required
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g., 25"
                  />
                  {formErrors.age && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.age}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="occupation">Occupation *</Label>
                  <select
                    id="occupation"
                    name="occupation"
                    required
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Student">Student</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Healthcare Worker">Healthcare Worker</option>
                    <option value="Business Professional">Business Professional</option>
                    <option value="Creative Professional">Creative Professional</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Psychologist">Psychologist</option>
                    <option value="Lawyer">Lawyer</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Designer">Designer</option>
                    <option value="Marketing Professional">Marketing Professional</option>
                    <option value="Sales Representative">Sales Representative</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Lecturer / Professor">Lecturer / Professor</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Architect">Architect</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Social Worker">Social Worker</option>
                    <option value="Police / Military">Police / Military</option>
                    <option value="Retail / Service Worker">Retail / Service Worker</option>
                    <option value="Skilled Tradesperson">Skilled Tradesperson</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="work_mode">Work Mode *</Label>
                  <select
                    id="work_mode"
                    name="work_mode"
                    required
                    value={formData.work_mode}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Screen Time */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Screen Time (Hours per Day)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="screen_time_hours">Total Screen Time *</Label>
                  <Input
                    id="screen_time_hours"
                    name="screen_time_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={formData.screen_time_hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 8.0"
                  />
                </div>

                <div>
                  <Label htmlFor="work_screen_hours">Work Screen Time *</Label>
                  <Input
                    id="work_screen_hours"
                    name="work_screen_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={formData.work_screen_hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 6.0"
                  />
                </div>

                <div>
                  <Label htmlFor="leisure_screen_hours">Leisure Screen Time *</Label>
                  <Input
                    id="leisure_screen_hours"
                    name="leisure_screen_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={formData.leisure_screen_hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 2.0"
                  />
                </div>
              </div>
            </div>

            {/* Sleep & Wellness */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sleep & Wellness</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sleep_hours">Sleep Hours per Night *</Label>
                  <Input
                    id="sleep_hours"
                    name="sleep_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={formData.sleep_hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 7.0"
                  />
                </div>

                <div>
                  <Label htmlFor="sleep_quality_1_5">Sleep Quality (1-5) *</Label>
                  <Input
                    id="sleep_quality_1_5"
                    name="sleep_quality_1_5"
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={formData.sleep_quality_1_5}
                    onChange={handleInputChange}
                    placeholder="1=Poor, 5=Excellent"
                  />
                  {formErrors.sleep_quality_1_5 && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.sleep_quality_1_5}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="productivity_0_100">Productivity (0-100) *</Label>
                  <Input
                    id="productivity_0_100"
                    name="productivity_0_100"
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.productivity_0_100}
                    onChange={handleInputChange}
                    placeholder="0=Not productive, 100=Very productive"
                  />
                  {formErrors.productivity_0_100 && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.productivity_0_100}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mental_wellness_index_0_100">Mental Wellness Index (0-100) *</Label>
                  <Input
                    id="mental_wellness_index_0_100"
                    name="mental_wellness_index_0_100"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={formData.mental_wellness_index_0_100}
                    onChange={handleInputChange}
                    placeholder="e.g., 75.0"
                  />
                  {formErrors.mental_wellness_index_0_100 && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.mental_wellness_index_0_100}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Physical & Social Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Physical & Social Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exercise_minutes_per_week">Exercise (Minutes per Week) *</Label>
                  <Input
                    id="exercise_minutes_per_week"
                    name="exercise_minutes_per_week"
                    type="number"
                    min="0"
                    max="10080"
                    required
                    value={formData.exercise_minutes_per_week}
                    onChange={handleInputChange}
                    placeholder="e.g., 150"
                  />
                </div>

                <div>
                  <Label htmlFor="social_hours_per_week">Social Hours per Week *</Label>
                  <Input
                    id="social_hours_per_week"
                    name="social_hours_per_week"
                    type="number"
                    step="0.5"
                    min="0"
                    max="168"
                    required
                    value={formData.social_hours_per_week}
                    onChange={handleInputChange}
                    placeholder="e.g., 10.0"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Assess Stress Level
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {prediction && (
        <Card id="results" className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Your Stress Level Assessment</CardTitle>
            <CardDescription>Based on your lifestyle factors and AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg">
              <div
                className="text-6xl font-bold mb-2"
                style={{ color: getStressColor(prediction.score) }}
              >
                {prediction.score.toFixed(1)}
              </div>
              <div className="text-2xl font-semibold mb-1">
                {prediction.category || getStressLabel(prediction.score)}
              </div>
              <div className="text-muted-foreground">Stress Level (0-10 scale)</div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-1000"
                style={{
                  width: `${(prediction.score / 10) * 100}%`,
                  backgroundColor: getStressColor(prediction.score)
                }}
              />
            </div>

            {/* Alert for high stress */}
            {prediction.score >= 6 && (
              <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100">High Stress Detected</h3>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      Consider seeking professional support or implementing stress management techniques immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Interpretation:</h3>
              <p className="text-sm">{prediction.interpretation}</p>
            </div>

            {/* Recommendations */}
            {prediction.recommendations && prediction.recommendations.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Personalized Recommendations:</h3>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Model Used</p>
                <p className="font-semibold">{prediction.modelUsed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Analysis Date</p>
                <p className="font-semibold">
                  {new Date(prediction.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowRecommendations(true)}
                  variant="default"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  View Recommendations
                </Button>
                <Button
                  onClick={handleEmailReport}
                  disabled={isSendingEmail}
                  variant="default"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Email Report
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  variant="outline"
                >
                  {isDownloadingPDF ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
                <Button onClick={() => router.push('/predictions')} variant="outline">
                  View History
                </Button>
                <Button
                  onClick={() => {
                    setPrediction(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  variant="outline"
                >
                  New Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Modal */}
      {showRecommendations && prediction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  Personalized Recommendations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your stress level of {prediction.score.toFixed(1)} / 10
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRecommendations(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {getRecommendations(prediction.score).map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <p className="flex-1 pt-1">{rec}</p>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRecommendations(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
