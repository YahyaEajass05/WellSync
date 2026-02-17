'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, ArrowLeft, Loader2, Info, AlertCircle } from 'lucide-react';
import axios from '@/lib/api/axios-instance';
import { toast } from 'sonner';

export default function StressLevelPredictionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

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
    } catch (error) {
      toast.error('Failed to load example data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);

    try {
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
        productivity_0_100: parseInt(formData.productivity_0_100),
        exercise_minutes_per_week: parseInt(formData.exercise_minutes_per_week),
        social_hours_per_week: parseFloat(formData.social_hours_per_week),
        mental_wellness_index_0_100: parseFloat(formData.mental_wellness_index_0_100)
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

      console.log('Sending stress prediction payload:', payload);

      const response = await axios.post('/predictions/stress-level', payload);
      
      console.log('Stress prediction response:', response.data);
      
      setPrediction(response.data.data.prediction);
      toast.success('Prediction completed successfully!');
      
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Prediction error:', error);
      console.error('Error response:', error.response?.data);
      
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

            <div className="flex gap-3 pt-4">
              <Button onClick={() => router.push('/predictions')} variant="outline" className="flex-1">
                View History
              </Button>
              <Button
                onClick={() => {
                  setPrediction(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1"
              >
                New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
