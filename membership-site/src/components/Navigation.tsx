'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              SleepCode
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/') ? 'text-cyan-950' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/pricing" 
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/pricing') ? 'text-cyan-950' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/faq" 
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/faq') ? 'text-cyan-950' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              FAQ
            </Link>
            <Link 
              href="/contact" 
              className={`px-3 py-2 text-sm font-medium ${
                isActive('/contact') ? 'text-cyan-950' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive('/dashboard') ? 'text-cyan-950' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Dashboard
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
        </div>
      </div>
    </nav>
  );
} 