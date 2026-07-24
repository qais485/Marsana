import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Phone, MapPin, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api/client';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      setError(null);
      const response = await api.post('/support/contact', formData);
      if (response.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      detail: 'support@marsana.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      detail: '+1 (555) 123-4567',
    },
    {
      icon: MapPin,
      title: 'Address',
      detail: '123 Commerce St, Suite 100\nSan Francisco, CA 94105',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-marsana-50/20 dark:from-surface-950 dark:via-surface-900 dark:to-marsana-950/20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-3">
            Contact Us
          </h1>
          <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto text-sm sm:text-base">
            Have a question or need help? We'd love to hear from you. Send us a message and we'll
            respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {contactInfo.map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-marsana-50 dark:bg-marsana-900/30 rounded-xl">
                    <item.icon className="w-5 h-5 text-marsana-500" />
                  </div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">{item.title}</h3>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-line">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-4 sm:p-6 shadow-sm">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-surface-600 dark:text-surface-400 mb-6">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="btn-marsana"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-premium w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-premium w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-premium w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="input-premium w-full"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sending}
                      className="btn-marsana flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
