'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePredictions } from '@/lib/hooks/usePredictions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BarChart3, Heart, Plus, X, Calendar, TrendingUp, Activity, Mail } from 'lucide-react';
import { formatDateTime, getWellnessColor } from '@/lib/utils';
import { predictionsApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Prediction } from '@/types';

export default function PredictionsPage() {
  const { predictions, isLoading } = usePredictions();
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleEmailReport = async () => {
    if (!selectedPrediction) return;

    setIsSendingEmail(true);
    try {
      await predictionsApi.emailReport(selectedPrediction._id);
      toast.success('Prediction report sent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email report');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictions</h1>
          <p className="text-muted-foreground">
            View and manage your wellness predictions
          </p>
        </div>
        <Link href="/predictions/mental-wellness">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Prediction
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/predictions/mental-wellness">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Mental Wellness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Predict your mental wellness score based on lifestyle factors
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/predictions/academic">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Academic Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analyze how digital habits affect academic performance
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/predictions/stress">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Stress Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assess your stress level and get personalized recommendations
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length > 0 ? (
            <div className="space-y-4">
              {predictions.map((prediction) => {
                // Safely get prediction value with fallback
                const predictionValue = prediction.result?.prediction ?? 0;
                const predictionType = prediction.predictionType || 'unknown';
                const displayType = predictionType.replace(/_/g, ' ');
                
                return (
                  <div
                    key={prediction._id}
                    className="flex items-center justify-between border rounded-lg p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{
                          backgroundColor: `${getWellnessColor(predictionValue)}20`,
                          color: getWellnessColor(predictionValue),
                        }}
                      >
                        {predictionValue.toFixed(1)}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">
                          {displayType}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {prediction.result?.interpretation || 'No interpretation'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(prediction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedPrediction(prediction)}
                    >
                      View Details
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No predictions yet. Create your first prediction to get started!
              </p>
              <Link href="/predictions/mental-wellness">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Prediction
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Details Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold capitalize">
                  {(selectedPrediction.predictionType || 'unknown').replace(/_/g, ' ')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDateTime(selectedPrediction.createdAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPrediction(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Score Display */}
              <div className="text-center p-6 rounded-lg border" style={{
                backgroundColor: `${getWellnessColor(selectedPrediction.result?.prediction ?? 0)}10`,
                borderColor: getWellnessColor(selectedPrediction.result?.prediction ?? 0)
              }}>
                <div className="text-5xl font-bold mb-2" style={{
                  color: getWellnessColor(selectedPrediction.result?.prediction ?? 0)
                }}>
                  {(selectedPrediction.result?.prediction ?? 0).toFixed(2)}
                </div>
                <div className="text-lg font-semibold mb-1">
                  {selectedPrediction.result?.interpretation || 'No interpretation'}
                </div>
                {selectedPrediction.result?.stressCategory && (
                  <div className="text-sm text-muted-foreground">
                    Category: {selectedPrediction.result.stressCategory}
                  </div>
                )}
              </div>

              {/* Model Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Model Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">Model Used</div>
                    <div className="font-medium">{selectedPrediction.result?.modelName || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">Features Processed</div>
                    <div className="font-medium">{selectedPrediction.result?.inputFeaturesProcessed || 'N/A'}</div>
                  </div>
                  {selectedPrediction.result?.confidenceMetrics?.modelR2Score !== undefined && (
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">R² Score</div>
                      <div className="font-medium">{(selectedPrediction.result.confidenceMetrics.modelR2Score * 100).toFixed(1)}%</div>
                    </div>
                  )}
                  {selectedPrediction.result?.confidenceMetrics?.modelMAE !== undefined && (
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Mean Absolute Error</div>
                      <div className="font-medium">{selectedPrediction.result.confidenceMetrics.modelMAE.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {selectedPrediction.result?.recommendations && selectedPrediction.result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {selectedPrediction.result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted">
                        <span className="text-primary mt-1">•</span>
                        <span className="flex-1">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Input Data */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Input Data
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedPrediction.inputData || {}).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="font-medium">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              {selectedPrediction.metadata && (
                <div>
                  <h3 className="font-semibold mb-3">Metadata</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedPrediction.metadata.processingTime && (
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="text-xs text-muted-foreground">Processing Time</div>
                        <div className="font-medium">{selectedPrediction.metadata.processingTime}ms</div>
                      </div>
                    )}
                    {selectedPrediction.metadata.apiVersion && (
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="text-xs text-muted-foreground">API Version</div>
                        <div className="font-medium">{selectedPrediction.metadata.apiVersion}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPrediction(null)}>
                Close
              </Button>
              <Button 
                onClick={handleEmailReport}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          </div>
        </div>
      )}
    </div>
  );
}
