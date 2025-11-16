'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import LoginModal from './LoginModal';
import Avatar from './Avatar';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isLoggedIn, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-12">
            <a href="/" className="text-xl font-semibold text-gray-900">
              Pack Lab
            </a>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Predict
              </a>
              <a
                href="/history"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                History
              </a>
              <a
                href="/profile"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Profile
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Login
                </button>
                <Avatar size={48} />
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button
                    className="flex items-center justify-center"
                    aria-label="Profile"
                  >
                    <Avatar hash={profile?.userhash} size={48} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View Profile
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex flex-col py-4">
              <a
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Predict
              </a>
              <a
                href="/history"
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                History
              </a>
              <a
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Profile
              </a>
            </div>
          </nav>
        )}
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </header>
  );
}
