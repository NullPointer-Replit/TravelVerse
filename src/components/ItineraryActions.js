'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { saveItinerary, getUserWishlist } from '@/lib/firebaseService';
import jsPDF from 'jspdf';
import Link from 'next/link';

export default function ItineraryActions({ 
  itineraryData, 
  formData, 
  onRegenerateDay,
  onSaveSuccess,
  userId
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(true);

  // Check if itinerary is already wishlisted
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!userId || !itineraryData || !formData) {
        setCheckingWishlist(false);
        return;
      }

      try {
        const wishlist = await getUserWishlist(userId);
        
        // Check if current itinerary matches any in wishlist
        const matches = wishlist.some((item) => {
          const itemFormData = item.formData || {};
          return (
            itemFormData.destination === formData.destination &&
            itemFormData.startDate === formData.startDate &&
            itemFormData.endDate === formData.endDate &&
            itemFormData.days === formData.days &&
            itemFormData.travelerCount === formData.travelerCount
          );
        });

        setIsWishlisted(matches);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      } finally {
        setCheckingWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [userId, itineraryData, formData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = await saveItinerary({
        ...itineraryData,
        formData,
        userId: userId,
        savedAt: new Date().toISOString(),
      });
      setSaved(true);
      setIsWishlisted(true);
      if (onSaveSuccess) onSaveSuccess(id);
      toast.success('Added to wishlist!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatItineraryForWhatsApp = () => {
    let message = `✈️ *Travel Itinerary for ${formData.destination}*\n\n`;
    message += `📅 Duration: ${formData.days} days\n`;
    message += `👥 Travelers: ${formData.travelerCount}\n`;
    if (formData.startDate) {
      message += `🗓️ Start Date: ${new Date(formData.startDate).toLocaleDateString()}\n`;
    }
    message += `\n🏨 *Recommended Hotels*\n`;
    
    if (itineraryData.hotels && itineraryData.hotels.length > 0) {
      itineraryData.hotels.forEach((hotel, idx) => {
        message += `${idx + 1}. ${hotel.name}\n`;
        message += `   📍 ${hotel.location}\n`;
        const hotelPrice = hotel.pricePerNight 
          ? `₹${parseInt(hotel.pricePerNight).toLocaleString('en-IN')}/night` 
          : hotel.priceRange;
        message += `   💰 ${hotelPrice}\n\n`;
      });
    }

    message += `\n📅 *Daily Itinerary*\n\n`;
    if (itineraryData.itinerary) {
      itineraryData.itinerary.forEach((day) => {
        message += `*Day ${day.day}*\n`;
        if (day.morning) {
          message += `🌅 Morning: ${day.morning.activity}\n`;
          if (day.morning.location) message += `   📍 ${day.morning.location}\n`;
        }
        if (day.lunch) {
          message += `🍽️ Lunch: ${day.lunch.name}\n`;
          if (day.lunch.location) message += `   📍 ${day.lunch.location}\n`;
        }
        if (day.afternoon) {
          message += `☀️ Afternoon: ${day.afternoon.activity}\n`;
          if (day.afternoon.location) message += `   📍 ${day.afternoon.location}\n`;
        }
        if (day.dinner) {
          message += `🍷 Dinner: ${day.dinner.name}\n`;
          if (day.dinner.location) message += `   📍 ${day.dinner.location}\n`;
        }
        if (day.evening) {
          message += `🌙 Evening: ${day.evening.activity}\n`;
        }
        message += `\n`;
      });
    }

    if (itineraryData.tips && itineraryData.tips.length > 0) {
      message += `💡 *Travel Tips*\n`;
      itineraryData.tips.forEach((tip) => {
        message += `• ${tip}\n`;
      });
    }

    return encodeURIComponent(message);
  };

  const handleShareWhatsApp = () => {
    const message = formatItineraryForWhatsApp();
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header with gradient-like effect (using colored rectangles)
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title on colored background
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('✈️ TravelR', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Travel Itinerary', pageWidth / 2, 35, { align: 'center' });
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Info box
    doc.setDrawColor(16, 185, 129);
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(15, yPos, pageWidth - 30, 30, 3, 3, 'FD');
    
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.setFont(undefined, 'bold');
    doc.text('📍 Destination:', 20, yPos + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(formData.destination, 20, yPos + 8);
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('📅 Duration:', 20, yPos + 18);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`${formData.days} days`, 20, yPos + 18);
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('👥 Travelers:', pageWidth / 2 + 10, yPos + 8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`${formData.travelerCount}`, pageWidth / 2 + 10, yPos + 8);
    
    if (formData.startDate) {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('🗓️ Start Date:', pageWidth / 2 + 10, yPos + 18);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(new Date(formData.startDate).toLocaleDateString(), pageWidth / 2 + 10, yPos + 18);
    }
    
    yPos += 40;

    // Hotels section
    if (itineraryData.hotels && itineraryData.hotels.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('🏨 Recommended Hotels', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      itineraryData.hotels.forEach((hotel, idx) => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        // Hotel card background
        doc.setFillColor(245, 255, 250);
        doc.setDrawColor(16, 185, 129);
        doc.roundedRect(20, yPos - 5, pageWidth - 40, 20, 2, 2, 'FD');
        
        doc.setFont(undefined, 'bold');
        doc.text(`${idx + 1}. ${hotel.name}`, 25, yPos + 3);
        doc.setFont(undefined, 'normal');
        doc.text(`📍 ${hotel.location}`, 25, yPos + 8);
        doc.setTextColor(16, 185, 129);
        const hotelPrice = hotel.pricePerNight 
          ? `₹${parseInt(hotel.pricePerNight).toLocaleString('en-IN')}/night` 
          : hotel.priceRange;
        doc.text(`💰 ${hotelPrice}`, 25, yPos + 13);
        doc.setTextColor(0, 0, 0);
        yPos += 25;
      });
      yPos += 5;
    }

    // Daily itinerary
    if (itineraryData.itinerary) {
      itineraryData.itinerary.forEach((day, dayIdx) => {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        // Day header
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(15, yPos - 5, pageWidth - 30, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Day ${day.day}`, 20, yPos + 2);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);

        const activities = [
          { icon: '🌅', label: 'Morning', data: day.morning, field: 'activity' },
          { icon: '🍽️', label: 'Lunch', data: day.lunch, field: 'name' },
          { icon: '☀️', label: 'Afternoon', data: day.afternoon, field: 'activity' },
          { icon: '🍷', label: 'Dinner', data: day.dinner, field: 'name' },
          { icon: '🌙', label: 'Evening', data: day.evening, field: 'activity' },
        ];

        activities.forEach((activity) => {
          if (activity.data && activity.data[activity.field]) {
            doc.setFillColor(250, 255, 252);
            doc.roundedRect(20, yPos - 3, pageWidth - 40, 8, 1, 1, 'F');
            doc.text(`${activity.icon} ${activity.label}: ${activity.data[activity.field]}`, 25, yPos + 2);
            if (activity.data.location) {
              doc.setTextColor(100, 100, 100);
              doc.setFontSize(9);
              doc.text(`📍 ${activity.data.location}`, 25, yPos + 6);
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
            }
            yPos += 10;
          }
        });
        yPos += 5;
      });
    }

    // Tips section
    if (itineraryData.tips && itineraryData.tips.length > 0) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('💡 Travel Tips', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      doc.setFillColor(245, 255, 250);
      doc.roundedRect(20, yPos - 3, pageWidth - 40, itineraryData.tips.length * 8 + 5, 2, 2, 'F');
      
      itineraryData.tips.forEach((tip) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(`• ${tip}`, pageWidth - 50);
        doc.text(lines, 25, yPos + 2);
        yPos += lines.length * 5 + 2;
      });
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by TravelR - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`itinerary-${formData.destination}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {checkingWishlist ? (
        <div className="px-6 py-2 bg-gray-700/60 text-gray-300 rounded-lg font-medium">
          Checking...
        </div>
      ) : isWishlisted ? (
        <Link
          href="/profile"
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <span>✓</span>
          <span>Already in Wishlist</span>
          <span className="text-sm">→ View Profile</span>
        </Link>
      ) : (
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {saving ? 'Adding...' : saved ? '✓ Added!' : '❤️ Add to Wishlist'}
        </button>
      )}

      <button
        onClick={handleExportPDF}
        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
      >
        📄 Export PDF
      </button>

      <button
        onClick={handleShareWhatsApp}
        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
      >
        📱 Share on WhatsApp
      </button>
    </div>
  );
}

