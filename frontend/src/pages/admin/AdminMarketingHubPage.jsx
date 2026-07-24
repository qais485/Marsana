import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Bell, Users, ArrowRight, Loader2 } from 'lucide-react';
import marketingService from '../../services/api/marketingService';

export default function AdminMarketingHubPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await marketingService.getDashboard();
        if (response.success) setDashboard(response.data);
      } catch {
        // Dashboard stats optional
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const features = [
    { title: 'Email Campaigns', description: 'Create and send email marketing campaigns', icon: Mail, href: '/admin/marketing/email', color: 'bg-marsana-500', stats: dashboard?.email_campaigns },
    { title: 'SMS Campaigns', description: 'Create and send SMS marketing campaigns', icon: MessageSquare, href: '/admin/marketing/sms', color: 'bg-green-500', stats: dashboard?.sms_campaigns },
    { title: 'Push Campaigns', description: 'Create and send push notification campaigns', icon: Bell, href: '/admin/marketing/push', color: 'bg-purple-500', stats: dashboard?.push_campaigns },
    { title: 'Affiliate System', description: 'Manage affiliate programs and partners', icon: Users, href: '/admin/marketing/affiliates', color: 'bg-orange-500', stats: dashboard?.active_affiliates },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">Marketing</h1>
          <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Manage campaigns and affiliate programs</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-marsana-600 dark:text-marsana-400" /></div>
        ) : (
          <>
            {dashboard && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Total Sent</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{dashboard.total_sent.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Total Opened</p>
                  <p className="text-2xl font-bold text-marsana-600 dark:text-marsana-400">{dashboard.total_opened.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Total Clicked</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboard.total_clicked.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-4">
                  <p className="text-sm text-surface-600 dark:text-surface-400">Affiliate Earnings</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">${dashboard.affiliate_earnings.toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature) => (
                <Link key={feature.title} to={feature.href} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                  <div className={`${feature.color} p-2 sm:p-3 rounded-xl text-white flex-shrink-0`}>
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-900 dark:text-white text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 truncate">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {feature.stats !== undefined && (
                      <span className="text-base sm:text-lg font-bold text-surface-900 dark:text-white">{feature.stats}</span>
                    )}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-surface-400 dark:text-surface-500" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
