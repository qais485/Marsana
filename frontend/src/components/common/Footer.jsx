import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, Heart, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-950 dark:bg-black text-white overflow-hidden">
      {/* Main Footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-marsana-500 to-accent-violet flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Marsana</span>
                <span className="text-[10px] font-medium text-marsana-400 block -mt-1 tracking-wider uppercase">
                  Marketplace
                </span>
              </div>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed max-w-sm mb-5 sm:mb-6">
              Your premium destination for discovering amazing products. We curate the best selection with unmatched quality and service.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-surface-800 hover:bg-marsana-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 sm:mb-5 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2.5">
              {['All Products', 'New Arrivals', 'Best Sellers', 'Sale', 'Categories'].map((link) => (
                <li key={link}>
                  <Link
                    to="/products"
                    className="text-surface-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1 group min-h-[44px]"
                  >
                    {link}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4 sm:mb-5 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2.5">
              {['Help Center', 'Contact Us', 'FAQs', 'Shipping Info', 'Returns'].map((link) => (
                <li key={link}>
                  <Link
                    to="/help"
                    className="text-surface-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1 group min-h-[44px]"
                  >
                    {link}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 sm:mb-5 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@marsana.com" className="flex items-start gap-3 min-h-[44px] py-1">
                  <Mail className="w-4 h-4 text-marsana-400 mt-0.5 flex-shrink-0" />
                  <span className="text-surface-400 text-sm break-all">support@marsana.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+15551234567" className="flex items-start gap-3 min-h-[44px] py-1">
                  <Phone className="w-4 h-4 text-marsana-400 mt-0.5 flex-shrink-0" />
                  <span className="text-surface-400 text-sm">+1 (555) 123-4567</span>
                </a>
              </li>
              <li className="flex items-start gap-3 min-h-[44px] py-1">
                <MapPin className="w-4 h-4 text-marsana-400 mt-0.5 flex-shrink-0" />
                <span className="text-surface-400 text-sm">123 Market Street, San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800">
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-surface-500 text-sm">
            &copy; {new Date().getFullYear()} Marsana Marketplace. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-surface-500">
            <Link to="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">Terms</Link>
            <Link to="#" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
