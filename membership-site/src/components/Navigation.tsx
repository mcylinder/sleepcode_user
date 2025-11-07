'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-[#9098a1] bg-[#fcf0e8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-[#4e88dd] transition-colors duration-200">
              SleepCoding
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/about" 
              className={`nav-link px-3 py-2 text-sm font-medium ${
                isActive('/about') ? 'text-[#4e88dd] active' : 'text-[#465362] hover:text-[#4e88dd]'
              }`}
            >
              About
            </Link>
            <Link 
              href="/pricing" 
              className={`nav-link px-3 py-2 text-sm font-medium ${
                isActive('/pricing') ? 'text-[#4e88dd] active' : 'text-[#465362] hover:text-[#4e88dd]'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/faq" 
              className={`nav-link px-3 py-2 text-sm font-medium ${
                isActive('/faq') ? 'text-[#4e88dd] active' : 'text-[#465362] hover:text-[#4e88dd]'
              }`}
            >
              FAQ
            </Link>
            <Link 
              href="/contact" 
              className={`nav-link px-3 py-2 text-sm font-medium ${
                isActive('/contact') ? 'text-[#4e88dd] active' : 'text-[#465362] hover:text-[#4e88dd]'
              }`}
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop user menu */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Link 
                    href="/account" 
                    className={`px-3 py-2 text-sm font-medium ${
                      isActive('/account') ? 'text-cyan-700' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Account
                  </Link>
                  <Link 
                    href="/sessions" 
                    className={`px-3 py-2 text-sm font-medium ${
                      isActive('/sessions') ? 'text-cyan-700' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Sessions
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="btn-primary text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Slide-out menu */}
        <div 
          className={`absolute right-0 top-0 h-full w-80 bg-[#340c35] shadow-xl transform transition-transform duration-[1200ms] ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}
        >
          <div className="px-4 pt-6 pb-4 space-y-2">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <Link 
              href="/about" 
              className={`block px-3 py-2 text-base font-medium ${
                isActive('/about') ? 'text-[#b6e3f6]' : 'text-white hover:text-[#4e88dd]'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/pricing" 
              className={`block px-3 py-2 text-base font-medium ${
                isActive('/pricing') ? 'text-[#b6e3f6]' : 'text-white hover:text-[#4e88dd]'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/faq" 
              className={`block px-3 py-2 text-base font-medium ${
                isActive('/faq') ? 'text-[#b6e3f6]' : 'text-white hover:text-[#4e88dd]'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link 
              href="/contact" 
              className={`block px-3 py-2 text-base font-medium ${
                isActive('/contact') ? 'text-[#b6e3f6]' : 'text-white hover:text-[#4e88dd]'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Mobile user menu */}
            {currentUser ? (
              <>
                <div className="border-t border-white border-opacity-20 pt-4 mt-4">
                  <Link 
                    href="/account" 
                    className={`block px-3 py-2 text-base font-medium ${
                      isActive('/account') ? 'text-[#b6e3f6]' : 'text-white hover:text-[#4e88dd]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <Link 
                    href="/sessions" 
                    className={`block px-3 py-2 text-base font-medium ${
                      isActive('/sessions') ? 'text-[#b6e3f6]' : 'text-white hover:text-[#4e88dd]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sessions
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:text-[#4e88dd]"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-white border-opacity-20 pt-4 mt-4">
                <Link 
                  href="/login" 
                  className="block px-3 py-2 text-base font-medium text-white hover:text-[#4e88dd]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 