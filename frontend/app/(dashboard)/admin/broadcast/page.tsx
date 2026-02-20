'use client';

import { useState } from 'react';
import { useBroadcastNotification } from '@/lib/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, ArrowLeft, Loader2, Send, Info, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const broadcastSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message too long'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  sendEmail: z.boolean().default(true),
});

type BroadcastFormData = z.infer<typeof broadcastSchema>;

export default function BroadcastNotificationPage() {
  const broadcastMutation = useBroadcastNotification();
  const [lastResult, setLastResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      priority: 'medium',
      sendEmail: true,
    },
  });

  const sendEmail = watch('sendEmail');

  const onSubmit = (data: BroadcastFormData) => {
    broadcastMutation.mutate(data, {
      onSuccess: (response: any) => {
        // Handle both response.data.data and response.data structures
        const result = response?.data?.data || response?.data || response;
        const emailsWereSent = data.sendEmail;
        setLastResult({
          recipientCount: result?.recipientCount || result?.data?.recipientCount || 0,
          emailsSent: emailsWereSent ? (result?.emailsSent ?? result?.data?.emailsSent ?? 0) : null,
          emailsFailed: emailsWereSent ? (result?.emailsFailed ?? result?.data?.emailsFailed ?? 0) : 0,
        });
        reset({ priority: 'medium', sendEmail: true });
        toast.success(
          `Broadcast sent! ${result?.recipientCount || 0} users notified.${emailsWereSent ? ` 📧 ${result?.emailsSent ?? 0} emails delivered.` : ''}`
        );
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

              {/* Send Email Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Send Email Notification</p>
                    <p className="text-xs text-muted-foreground">Also send this as an email to all users</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('sendEmail', !sendEmail)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    sendEmail ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      sendEmail ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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
                    Sending to all users...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {sendEmail ? 'Send Notification + Email to All Users' : 'Send Notification to All Users'}
                  </>
                )}
              </Button>
            </form>

            {/* Last Broadcast Result */}
            {lastResult && (
              <div className="mt-4 p-4 border rounded-lg bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="font-medium text-green-900 dark:text-green-100">Last Broadcast Result</p>
                </div>
                <div className={`grid gap-3 text-sm ${lastResult.emailsSent !== null ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="bg-white dark:bg-green-900/20 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{lastResult.recipientCount}</p>
                    <p className="text-muted-foreground">Total Recipients</p>
                  </div>
                  {lastResult.emailsSent !== null && (
                    <div className="bg-white dark:bg-green-900/20 rounded p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{lastResult.emailsSent}</p>
                      <p className="text-muted-foreground">Emails Sent</p>
                    </div>
                  )}
                  {lastResult.emailsSent === null && (
                    <div className="col-span-1 bg-white dark:bg-green-900/20 rounded p-3 text-center">
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email notifications were disabled for this broadcast
                      </p>
                    </div>
                  )}
                  {lastResult.emailsFailed > 0 && (
                    <div className="col-span-2 bg-red-50 dark:bg-red-900/20 rounded p-3 text-center">
                      <p className="text-sm text-red-600">⚠️ {lastResult.emailsFailed} email(s) failed to deliver</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                <p className="text-muted-foreground">In-app notification + optional email</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">Toggle email delivery on/off per broadcast</p>
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
