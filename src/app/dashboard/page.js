'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getWishlistItem } from '@/lib/firebaseService';
import TravelFormCards from '@/components/TravelFormCards';
import ItineraryDisplay from '@/components/ItineraryDisplay';
import BudgetCalculator from '@/components/BudgetCalculator';
import PackingList from '@/components/PackingList';
import ItineraryMap from '@/components/ItineraryMap';
import ItineraryActions from '@/components/ItineraryActions';

function DashboardContent() {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [packingListState, setPackingListState] = useState(null);
  const [struckOffItemsState, setStruckOffItemsState] = useState({});
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from localStorage or set from Firebase
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
        // Not authenticated, redirect to landing page
        router.push('/');
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load wishlist item if query parameter is present
  useEffect(() => {
    const loadWishlistItem = async () => {
      const wishlistId = searchParams?.get('wishlist');
      if (!wishlistId || !user?.uid) return;

      setLoadingWishlist(true);
      try {
        const wishlistItem = await getWishlistItem(user.uid, wishlistId);
        if (wishlistItem) {
          // Set the itinerary and form data from wishlist item
          const { formData: savedFormData, itinerary: savedItinerary, hotels, flights, tips, packingList, struckOffItems, ...rest } = wishlistItem;
          
          setItinerary({
            itinerary: savedItinerary || wishlistItem.itinerary,
            hotels: hotels || wishlistItem.hotels,
            flights: flights || wishlistItem.flights,
            tips: tips || wishlistItem.tips,
            ...rest
          });
          setFormData(savedFormData || wishlistItem.formData);
          // Restore saved states
          if (packingList || wishlistItem.packingList) {
            setPackingListState(packingList || wishlistItem.packingList);
          }
          if (struckOffItems || wishlistItem.struckOffItems) {
            setStruckOffItemsState(struckOffItems || wishlistItem.struckOffItems);
          }
          toast.success('Wishlist item loaded!');
          
          // Remove query parameter from URL
          router.replace('/dashboard', { scroll: false });
        } else {
          toast.error('Wishlist item not found');
        }
      } catch (error) {
        console.error('Error loading wishlist item:', error);
        toast.error('Failed to load wishlist item');
      } finally {
        setLoadingWishlist(false);
      }
    };

    if (user && searchParams) {
      loadWishlistItem();
    }
  }, [user, searchParams, router]);

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

  const handleGenerateItinerary = async (data) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    setFormData(data);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setItinerary(result.data);
        toast.success('Itinerary generated successfully!');
      } else {
        const errorMsg = result.error || 'Failed to generate itinerary';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateDay = async (dayNumber, section = null, currentItem = null) => {
    if (!formData || !itinerary) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          regenerateDay: dayNumber,
          existingItinerary: itinerary,
          replaceSection: section,
          currentItem: currentItem,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.itinerary) {
        const updatedItinerary = { ...itinerary };
        const dayIndex = updatedItinerary.itinerary.findIndex(d => d.day === dayNumber);
        if (dayIndex !== -1 && result.data.itinerary[0]) {
          // If replacing a specific section, merge it
          if (section && result.data.itinerary[0][section]) {
            updatedItinerary.itinerary[dayIndex] = {
              ...updatedItinerary.itinerary[dayIndex],
              [section]: result.data.itinerary[0][section]
            };
          } else {
            // Replace entire day
            updatedItinerary.itinerary[dayIndex] = result.data.itinerary[0];
          }
          setItinerary(updatedItinerary);
          toast.success('Itinerary updated!');
        }
      }
    } catch (err) {
      console.error('Error regenerating day:', err);
      toast.error('Error regenerating day');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async (packingListData = null, struckOffData = null) => {
    if (!itinerary || !formData || !user) return;
    
    try {
      const { saveItinerary } = await import('@/lib/firebaseService');
      await saveItinerary({
        ...itinerary,
        formData,
        packingList: packingListData || packingListState,
        struckOffItems: struckOffData || struckOffItemsState,
        userId: user.uid || user.email,
        updatedAt: new Date().toISOString(),
      });
      // Update local state if provided
      if (packingListData) setPackingListState(packingListData);
      if (struckOffData) setStruckOffItemsState(struckOffData);
      // Silent save - no toast to avoid spam
    } catch (error) {
      console.error('Auto-save error:', error);
      // Silent fail - don't interrupt user experience
    }
  };

  const handleFormError = (errorMessage) => {
    toast.error(errorMessage);
  };

  const handleSaveSuccess = (id) => {
    toast.success('Added to wishlist successfully!');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            {user && (
              <div className="text-left">
                <p className="text-sm text-gray-400">
                  {user.name ? `Welcome back, ${user.name}!` : 'Welcome back!'}
                </p>
                <p className="text-sm font-medium text-gray-200">{user.email}</p>
              </div>
            )}
            <div className="flex-1"></div>
            {user && (
              <div className="flex gap-3">
                <Link
                  href="/profile"
                  className="px-4 py-2 text-sm bg-gray-700/60 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-colors flex items-center gap-2"
                >
                  <span>❤️</span>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-gray-700/60 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          {/* Removed TravelR heading - planes provide visual interest */}
              <p className="text-xl text-gray-300">
                Your intelligent travel planning assistant
              </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!itinerary && !loadingWishlist && (
            <>
              <TravelFormCards 
                onSubmit={handleGenerateItinerary} 
                loading={loading}
                onError={handleFormError}
              />

              {error && (
                <div className="mt-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg">
                  {error}
                </div>
              )}

              {loading && (
                <div className="mt-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                  <p className="mt-4 text-gray-400 font-medium">Creating your perfect itinerary...</p>
                </div>
              )}
            </>
          )}

          {loadingWishlist && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-400 font-medium">Loading wishlist item...</p>
            </div>
          )}

          {itinerary && formData && (
            <div className="mt-8 space-y-8">
              <div className="flex justify-between items-center">
                <ItineraryActions
                  itineraryData={itinerary}
                  formData={formData}
                  onRegenerateDay={handleRegenerateDay}
                  onSaveSuccess={handleSaveSuccess}
                  userId={user?.uid || user?.email}
                />
                    <button
                      onClick={() => {
                        setItinerary(null);
                        setFormData(null);
                        setError(null);
                        toast.success('Create a new itinerary');
                      }}
                      className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      ✨ New Itinerary
                    </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <BudgetCalculator
                  itinerary={itinerary}
                  budget={formData.budget}
                  travelerCount={formData.travelerCount}
                  days={formData.days}
                />
                    <PackingList
                      destination={formData.destination}
                      days={formData.days}
                      interests={formData.interests}
                      startDate={formData.startDate}
                      onSave={(packingListData) => handleAutoSave(packingListData, null)}
                      savedPackingList={packingListState || itinerary.packingList}
                    />
              </div>

              <ItineraryMap
                itinerary={itinerary.itinerary}
                destination={formData.destination}
              />

              <ItineraryDisplay
                data={{...itinerary, struckOffItems: struckOffItemsState}}
                onRegenerateDay={handleRegenerateDay}
                formData={formData}
                onSaveItinerary={(packingListData, struckOffData) => {
                  if (struckOffData) setStruckOffItemsState(struckOffData);
                  handleAutoSave(packingListData, struckOffData);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="mt-4 text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

