'use client';

import { useState } from 'react';
import { useBroadcastNotification } from '@/lib/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, ArrowLeft, Loader2, Send, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const broadcastSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message too long'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

type BroadcastFormData = z.infer<typeof broadcastSchema>;

export default function BroadcastNotificationPage() {
  const broadcastMutation = useBroadcastNotification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const onSubmit = (data: BroadcastFormData) => {
    broadcastMutation.mutate(data, {
      onSuccess: () => {
        reset();
        toast.success('Notification broadcasted successfully!');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.error || 'Failed to send notification');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Broadcast Notification
          </h1>
          <p className="text-muted-foreground mt-1">
            Send notifications to all active users on the platform
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Broadcast Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Create Broadcast Message</CardTitle>
            <CardDescription>
              Compose a notification that will be sent to all active users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., System Maintenance Notice"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-3 py-2 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your message here..."
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <select
                  id="priority"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  {...register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={broadcastMutation.isPending}
              >
                {broadcastMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to All Users
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Who will receive this?</p>
                <p className="text-muted-foreground">All active users with verified accounts</p>
              </div>
              <div>
                <p className="font-medium">Expiration</p>
                <p className="text-muted-foreground">Notifications expire after 30 days</p>
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-muted-foreground">Instant delivery to all users</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Priority Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-medium">Low:</span>
                <span className="text-muted-foreground">General updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="font-medium">Medium:</span>
                <span className="text-muted-foreground">Important info</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="font-medium">High:</span>
                <span className="text-muted-foreground">Requires attention</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-medium">Urgent:</span>
                <span className="text-muted-foreground">Critical alerts</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Use Responsibly
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Broadcast notifications are sent to all users. Please ensure your message is
                    relevant and necessary.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
