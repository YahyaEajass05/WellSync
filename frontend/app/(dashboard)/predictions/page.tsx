'use client';

import Link from 'next/link';
import { usePredictions } from '@/lib/hooks/usePredictions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BarChart3, Heart, Plus } from 'lucide-react';
import { formatDateTime, getWellnessColor } from '@/lib/utils';

export default function PredictionsPage() {
  const { predictions, isLoading } = usePredictions();

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
        <div className="flex gap-2">
          <Link href="/predictions/mental-wellness">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Prediction
            </Button>
          </Link>
        </div>
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
              {predictions.map((prediction) => (
                <div
                  key={prediction._id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{
                        backgroundColor: `${getWellnessColor(
                          prediction.result.prediction
                        )}20`,
                        color: getWellnessColor(prediction.result.prediction),
                      }}
                    >
                      {prediction.result.prediction.toFixed(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {prediction.predictionType.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {prediction.result.interpretation || 'No interpretation'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(prediction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
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
    </div>
  );
}
