import { ref, set, get, push, remove } from 'firebase/database';
import { database } from './firebase';

export const saveItinerary = async (itineraryData) => {
  try {
    const userId = itineraryData.userId || 'anonymous';
    // Save to wishlist instead of itineraries
    const wishlistRef = ref(database, `users/${userId}/wishlist`);
    const newWishlistItemRef = push(wishlistRef);
    const id = newWishlistItemRef.key;
    
    await set(newWishlistItemRef, {
      ...itineraryData,
      createdAt: itineraryData.createdAt || new Date().toISOString(),
      updatedAt: itineraryData.updatedAt || new Date().toISOString(),
      addedToWishlistAt: new Date().toISOString(),
      id,
      userId
    });
    
    return id;
  } catch (error) {
    console.error('Error saving to wishlist:', error);
    throw error;
  }
};

export const loadItinerary = async (id) => {
  try {
    const itineraryRef = ref(database, `itineraries/${id}`);
    const snapshot = await get(itineraryRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading itinerary:', error);
    throw error;
  }
};

export const getUserItineraries = async (userId) => {
  try {
    // Load from wishlist
    const wishlistRef = ref(database, `users/${userId}/wishlist`);
    const snapshot = await get(wishlistRef);
    
    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data
      })).sort((a, b) => {
        // Sort by addedToWishlistAt or updatedAt descending (most recent first)
        return new Date(b.addedToWishlistAt || b.updatedAt || b.createdAt) - new Date(a.addedToWishlistAt || a.updatedAt || a.createdAt);
      });
    }
    return [];
  } catch (error) {
    console.error('Error loading user wishlist:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const getUserWishlist = getUserItineraries;

export const getWishlistItem = async (userId, itemId) => {
  try {
    const wishlistItemRef = ref(database, `users/${userId}/wishlist/${itemId}`);
    const snapshot = await get(wishlistItemRef);
    
    if (snapshot.exists()) {
      return {
        id: itemId,
        ...snapshot.val()
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading wishlist item:', error);
    throw error;
  }
};

export const removeFromWishlist = async (userId, itemId) => {
  try {
    const wishlistItemRef = ref(database, `users/${userId}/wishlist/${itemId}`);
    await remove(wishlistItemRef);
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

