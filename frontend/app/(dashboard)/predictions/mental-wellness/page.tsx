'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, ArrowLeft, Loader2, Info, Lightbulb, X, Mail, Download } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import axios from '@/lib/api/axios-instance';
import { toast } from 'sonner';
import { predictionsApi } from '@/lib/api';

export default function MentalWellnessPredictionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleEmailReport = async () => {
    if (!prediction?.id) return;
    
    setIsSendingEmail(true);
    try {
      await predictionsApi.emailReport(prediction.id);
      toast.success('Report sent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!prediction?.id) return;
    
    setIsDownloadingPDF(true);
    try {
      // Request PDF from backend
      const response = await axios.get(`/predictions/${prediction.id}/pdf`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Mental_Wellness_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
    if (score >= 80) {
      return [
        'Continue your excellent sleep schedule: Maintain 7-9 hours of quality sleep each night with consistent bedtimes.',
        'Enhance your exercise routine: Aim for 150+ minutes of moderate aerobic activity per week, plus strength training twice weekly.',
        'Optimize screen time: Keep recreational screen use under 3 hours daily, with no screens 1 hour before bedtime.',
        'Strengthen social connections: Schedule regular quality time with friends and family, at least 10-15 hours weekly.',
        'Practice daily mindfulness: Dedicate 10-15 minutes to meditation, deep breathing, or journaling to maintain mental clarity.'
      ];
    } else if (score >= 70) {
      return [
        'Aim for 7-9 hours of quality sleep each night',
        'Increase exercise to 150+ minutes per week',
        'Reduce non-work screen time',
        'Practice stress management techniques',
        'Maintain work-life balance'
      ];
    } else if (score >= 60) {
      return [
        'Prioritize sleep - aim for consistent 7-9 hours',
        'Start with 30 minutes of exercise 3x per week',
        'Limit screen time, especially before bed',
        'Take regular breaks from work/study',
        'Consider mindfulness or meditation'
      ];
    } else {
      return [
        'Seek professional mental health support',
        'Establish a consistent sleep routine',
        'Reduce screen time significantly',
        'Start gentle physical activity (walking, yoga)',
        'Connect with friends and family',
        'Consider stress counseling or therapy'
      ];
    }
  };

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
    stress_level_0_10: '',
    productivity_0_100: '',
    exercise_minutes_per_week: '',
    social_hours_per_week: ''
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
      const response = await axios.get('/predictions/examples/mental_wellness');
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
        stress_level_0_10: example.stress_level_0_10.toString(),
        productivity_0_100: example.productivity_0_100.toString(),
        exercise_minutes_per_week: example.exercise_minutes_per_week.toString(),
        social_hours_per_week: example.social_hours_per_week.toString()
      });
      toast.success('Example data loaded!');
    } catch (error) {
      toast.error('Failed to load example data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);

    try {
      // Convert form data to numbers
      const payload = {
        age: parseInt(formData.age),
        gender: formData.gender,
        occupation: formData.occupation,
        work_mode: formData.work_mode,
        screen_time_hours: parseFloat(formData.screen_time_hours),
        work_screen_hours: parseFloat(formData.work_screen_hours),
        leisure_screen_hours: parseFloat(formData.leisure_screen_hours),
        sleep_hours: parseFloat(formData.sleep_hours),
        sleep_quality_1_5: parseInt(formData.sleep_quality_1_5),
        stress_level_0_10: parseInt(formData.stress_level_0_10),
        productivity_0_100: parseInt(formData.productivity_0_100),
        exercise_minutes_per_week: parseInt(formData.exercise_minutes_per_week),
        social_hours_per_week: parseFloat(formData.social_hours_per_week)
      };

      // Validate screen time breakdown
      const totalScreen = payload.screen_time_hours;
      const workScreen = payload.work_screen_hours;
      const leisureScreen = payload.leisure_screen_hours;
      
      if (workScreen + leisureScreen > totalScreen) {
        toast.error('Work + Leisure screen time cannot exceed Total screen time');
        setIsLoading(false);
        return;
      }

      console.log('Sending payload:', payload);

      const response = await axios.post('/predictions/mental-wellness', payload);
      
      console.log('Prediction response:', response.data);
      
      setPrediction(response.data.data.prediction);
      toast.success('Prediction completed successfully!');
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Prediction error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        // Show validation errors
        const errors = error.response.data.errors;
        errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else if (error.response?.data?.detail) {
        // FastAPI validation error
        toast.error(error.response.data.detail);
      } else {
        toast.error(error.response?.data?.message || 'Failed to get prediction');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getWellnessColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getWellnessLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/predictions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Mental Wellness Prediction
          </h1>
          <p className="text-muted-foreground">
            Get AI-powered insights about your mental wellness based on your lifestyle
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">How it works:</p>
              <p>
                Our AI model analyzes your lifestyle factors including screen time, sleep quality, 
                exercise habits, and stress levels to predict your mental wellness score (0-100). 
                Higher scores indicate better mental wellness.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enter Your Information</CardTitle>
              <CardDescription>
                Fill in the form below to get your mental wellness prediction
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadExampleData}
            >
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
                </div>

                <div>
                  <Label htmlFor="stress_level_0_10">Stress Level (0-10) *</Label>
                  <Input
                    id="stress_level_0_10"
                    name="stress_level_0_10"
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={formData.stress_level_0_10}
                    onChange={handleInputChange}
                    placeholder="0=No stress, 10=Extreme stress"
                  />
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

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Get Prediction
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <Card id="results" className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Your Mental Wellness Prediction</CardTitle>
            <CardDescription>
              Based on your lifestyle factors and AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
              <div
                className="text-6xl font-bold mb-2"
                style={{ color: getWellnessColor(prediction.score) }}
              >
                {prediction.score.toFixed(1)}
              </div>
              <div className="text-2xl font-semibold mb-1">
                {getWellnessLabel(prediction.score)}
              </div>
              <div className="text-muted-foreground">
                Mental Wellness Score (out of 100)
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${prediction.score}%`,
                  backgroundColor: getWellnessColor(prediction.score)
                }}
              />
            </div>

            {/* Interpretation */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Interpretation:</h3>
              <p className="text-sm">{prediction.interpretation}</p>
            </div>

            {/* Model Info */}
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

            {/* Actions */}
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
                <Button
                  onClick={() => router.push('/predictions')}
                  variant="outline"
                >
                  View History
                </Button>
                <Button
                  onClick={() => {
                    setPrediction(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  variant="outline"
                >
                  New Prediction
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
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  Personalized Recommendations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your mental wellness score of {prediction.score.toFixed(1)}
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

            {/* Modal Content */}
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

            {/* Modal Footer */}
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
