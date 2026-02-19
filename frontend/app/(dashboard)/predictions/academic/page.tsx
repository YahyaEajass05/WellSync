'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, ArrowLeft, Loader2, Info } from 'lucide-react';
import axios from '@/lib/api/axios-instance';
import { toast } from 'sonner';

export default function AcademicImpactPredictionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    academic_level: 'Bachelor',
    country: 'USA',
    most_used_platform: 'Instagram',
    avg_daily_usage_hours: '',
    sleep_hours_per_night: '',
    mental_health_score: '',
    conflicts_over_social_media: '',
    affects_academic_performance: 'No',
    relationship_status: 'Single'
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
      const response = await axios.get('/predictions/examples/academic_impact');
      const example = response.data.data.example;
      setFormData({
        age: example.age.toString(),
        gender: example.gender,
        academic_level: example.academic_level,
        country: example.country,
        most_used_platform: example.most_used_platform,
        avg_daily_usage_hours: example.avg_daily_usage_hours.toString(),
        sleep_hours_per_night: example.sleep_hours_per_night.toString(),
        mental_health_score: example.mental_health_score.toString(),
        conflicts_over_social_media: example.conflicts_over_social_media.toString(),
        affects_academic_performance: example.affects_academic_performance,
        relationship_status: example.relationship_status
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
        academic_level: formData.academic_level,
        country: formData.country,
        most_used_platform: formData.most_used_platform,
        avg_daily_usage_hours: parseFloat(formData.avg_daily_usage_hours),
        sleep_hours_per_night: parseFloat(formData.sleep_hours_per_night),
        mental_health_score: parseInt(formData.mental_health_score),
        conflicts_over_social_media: parseInt(formData.conflicts_over_social_media),
        affects_academic_performance: formData.affects_academic_performance,
        relationship_status: formData.relationship_status
      };

      const response = await axios.post('/predictions/academic-impact', payload);
      
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

  const getAddictionColor = (score: number) => {
    if (score >= 7) return '#ef4444';
    if (score >= 5) return '#f59e0b';
    return '#22c55e';
  };

  const getAddictionLabel = (score: number) => {
    if (score >= 7) return 'High Risk';
    if (score >= 5) return 'Moderate Risk';
    return 'Low Risk';
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
            <BarChart3 className="h-8 w-8 text-primary" />
            Academic Impact Prediction
          </h1>
          <p className="text-muted-foreground">
            Analyze how social media usage affects your academic performance
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div className="text-sm text-orange-900 dark:text-orange-100">
              <p className="font-semibold mb-1">How it works:</p>
              <p>
                Our AI analyzes your social media usage patterns, sleep habits, and mental health to predict
                potential addiction levels and academic impact. Scores range from 2-9, with higher scores
                indicating greater risk.
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
              <CardDescription>Fill in your social media and academic details</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={loadExampleData}>
              Load Example
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="17"
                    max="30"
                    required
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g., 21"
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
                  <Label htmlFor="academic_level">Academic Level *</Label>
                  <select
                    id="academic_level"
                    name="academic_level"
                    required
                    value={formData.academic_level}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <select
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="India">India</option>
                    <option value="China">China</option>
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Italy">Italy</option>
                    <option value="Spain">Spain</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Mexico">Mexico</option>
                    <option value="South Korea">South Korea</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Egypt">Egypt</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Iran">Iran</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Poland">Poland</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Peru">Peru</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Norway">Norway</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Finland">Finland</option>
                    <option value="Austria">Austria</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Greece">Greece</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Romania">Romania</option>
                    <option value="Hungary">Hungary</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Singapore">Singapore</option>
                    <option value="UAE">United Arab Emirates</option>
                    <option value="Israel">Israel</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Chile">Chile</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Panama">Panama</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="relationship_status">Relationship Status *</Label>
                  <select
                    id="relationship_status"
                    name="relationship_status"
                    required
                    value={formData.relationship_status}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Single">Single</option>
                    <option value="In a relationship">In a relationship</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Social Media Usage */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Social Media Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="most_used_platform">Most Used Platform *</Label>
                  <select
                    id="most_used_platform"
                    name="most_used_platform"
                    required
                    value={formData.most_used_platform}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Twitter">Twitter</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="avg_daily_usage_hours">Daily Usage (Hours) *</Label>
                  <Input
                    id="avg_daily_usage_hours"
                    name="avg_daily_usage_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={formData.avg_daily_usage_hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 4.5"
                  />
                </div>

                <div>
                  <Label htmlFor="conflicts_over_social_media">Conflicts Over Usage (0-5) *</Label>
                  <Input
                    id="conflicts_over_social_media"
                    name="conflicts_over_social_media"
                    type="number"
                    min="0"
                    max="5"
                    required
                    value={formData.conflicts_over_social_media}
                    onChange={handleInputChange}
                    placeholder="0=Never, 5=Always"
                  />
                </div>

                <div>
                  <Label htmlFor="affects_academic_performance">Affects Academic Performance *</Label>
                  <select
                    id="affects_academic_performance"
                    name="affects_academic_performance"
                    required
                    value={formData.affects_academic_performance}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Health */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Health & Wellness</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sleep_hours_per_night">Sleep Hours per Night *</Label>
                  <Input
                    id="sleep_hours_per_night"
                    name="sleep_hours_per_night"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={formData.sleep_hours_per_night}
                    onChange={handleInputChange}
                    placeholder="e.g., 7.0"
                  />
                </div>

                <div>
                  <Label htmlFor="mental_health_score">Mental Health Score (0-10) *</Label>
                  <Input
                    id="mental_health_score"
                    name="mental_health_score"
                    type="number"
                    min="0"
                    max="10"
                    required
                    value={formData.mental_health_score}
                    onChange={handleInputChange}
                    placeholder="0=Poor, 10=Excellent"
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
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Get Prediction
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
            <CardTitle>Your Academic Impact Prediction</CardTitle>
            <CardDescription>Based on your social media usage and AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg">
              <div
                className="text-6xl font-bold mb-2"
                style={{ color: getAddictionColor(prediction.score) }}
              >
                {prediction.score.toFixed(1)}
              </div>
              <div className="text-2xl font-semibold mb-1">
                {getAddictionLabel(prediction.score)}
              </div>
              <div className="text-muted-foreground">Addiction Score (2-9 scale)</div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-1000"
                style={{
                  width: `${((prediction.score - 2) / 7) * 100}%`,
                  backgroundColor: getAddictionColor(prediction.score)
                }}
              />
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Interpretation:</h3>
              <p className="text-sm">{prediction.interpretation}</p>
            </div>

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
                New Prediction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
