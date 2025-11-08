'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserWishlist, removeFromWishlist } from '@/lib/firebaseService';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const savedUser = localStorage.getItem('travelr_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser({
            email: firebaseUser.email,
            uid: firebaseUser.uid,
          });
        }
        setAuthLoading(false);
      } else {
        router.push('/');
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && user.uid) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user || !user.uid) return;
    
    setLoading(true);
    try {
      const wishlistData = await getUserWishlist(user.uid);
      setWishlist(wishlistData || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    if (!user || !user.uid) return;
    
    if (!confirm('Are you sure you want to remove this itinerary from your wishlist?')) {
      return;
    }

    try {
      await removeFromWishlist(user.uid, itemId);
      toast.success('Removed from wishlist');
      // Reload wishlist
      await loadWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('travelr_user');
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            {user && (
              <div className="space-y-1">
                {user.name && (
                  <p className="text-gray-100 font-semibold text-lg">
                    {user.name}
                  </p>
                )}
                <p className="text-gray-300">
                  {user.email}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-gray-700/60 text-gray-200 rounded-lg font-medium hover:bg-gray-600/80 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gray-700/60 text-gray-200 rounded-lg font-medium hover:bg-gray-600/80 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Wishlist Section */}
        <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-emerald-500/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3 mb-2">
                <span className="text-4xl">❤️</span>
                My Wishlist
              </h2>
              <p className="text-gray-300">
                {wishlist.length === 0 
                  ? 'No itineraries in your wishlist yet' 
                  : `${wishlist.length} ${wishlist.length === 1 ? 'itinerary' : 'itineraries'} saved`}
              </p>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl text-gray-400 mb-4">Your wishlist is empty</p>
              <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
              >
                Create New Itinerary
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => {
                const formData = item.formData || {};
                const itinerary = item.itinerary || [];
                
                return (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-cyan-900/40 backdrop-blur-sm rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500/60 p-6 transition-all shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-100 mb-2">
                          {formData.destination || 'Untitled Itinerary'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                          <span>📅</span>
                          <span>{formData.days || 0} {formData.days === 1 ? 'day' : 'days'}</span>
                        </div>
                        {formData.startDate && (
                          <p className="text-sm text-gray-400">
                            {formatDate(formData.startDate)}
                            {formData.endDate && ` - ${formatDate(formData.endDate)}`}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-900/50 backdrop-blur-sm text-emerald-300 rounded-full text-xs font-semibold">
                          <span>❤️</span>
                          Wishlisted
                        </span>
                      </div>
                    </div>

                    {itinerary.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Preview:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {itinerary.slice(0, 4).map((day) => (
                            <div
                              key={day.day}
                              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 border border-emerald-500/20"
                            >
                              <p className="text-xs font-semibold text-emerald-400">Day {day.day}</p>
                              {day.morning && (
                                <p className="text-xs text-gray-300 truncate">
                                  {day.morning.activity || day.morning.name}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/dashboard?wishlist=${item.id}`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all text-center text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="px-4 py-2 bg-red-900/50 text-red-300 rounded-lg font-medium hover:bg-red-800/70 border border-red-500/50 transition-all text-sm"
                        title="Remove from wishlist"
                      >
                        🗑️
                      </button>
                    </div>

                    {item.addedToWishlistAt && (
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Added {formatDate(item.addedToWishlistAt)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

