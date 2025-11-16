'use client';

import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import Avatar from '@/components/Avatar';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function ProfilePage() {
  const { isLoggedIn, profile, isLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
      });
    } else if (isLoggedIn && !isLoading) {
      // If logged in but no profile, reset form data
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
      });
    }
  }, [profile, isLoggedIn, isLoading]);

  // Show spinner only during initial auth check, not while waiting for profile
  if (isLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Log In</h1>
              <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </main>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    
    const { error } = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      organization: formData.organization,
    });
    
    if (error) {
      alert('Error updating profile: ' + error.message);
      return;
    }
    
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Profile
            </h1>
            <p className="text-lg text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <Avatar hash={profile?.userhash} size={96} />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    {formData.name || profile?.name || 'User Name'}
                  </h2>
                  <p className="text-gray-600">{formData.email || profile?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter your phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter your organization"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Full Name
                    </label>
                    <p className="text-base text-gray-900">{formData.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-base text-gray-900">{formData.email || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phone
                    </label>
                    <p className="text-base text-gray-900">{formData.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Organization
                    </label>
                    <p className="text-base text-gray-900">{formData.organization || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

