# ✈️ AI TravelMate

An autonomous AI agent that helps users plan multi-day trips intelligently. The AI reasons about user preferences, optimizes itineraries, and suggests activities, hotels, and restaurants through a simple interactive interface.

## Features

- **Smart Itinerary Generation**: AI creates day-by-day travel plans using GPT-4
- **Personalized Recommendations**: Hotels and restaurants based on budget and interests
- **Interactive UI**: Clean, modern interface built with Next.js and Tailwind CSS
- **Interest-Based Planning**: Customize trips based on sightseeing, food, adventure, culture, and more
- **Budget Flexibility**: Support for budget-friendly, moderate, and luxury travel

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free API key at: https://aistudio.google.com/app/apikey

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Enter your destination (e.g., Paris, Tokyo, New York)
2. Select the number of days (1-14)
3. Choose your interests (sightseeing, food, adventure, etc.)
4. Select your budget level
5. Click "Generate Itinerary" and let AI create your perfect trip!

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini 1.5 Flash
- **Language**: JavaScript/React

## Project Structure

```
travelr/
├── src/
│   ├── app/
│   │   ├── api/generate-itinerary/  # API route for AI generation
│   │   ├── page.js                   # Main page
│   │   └── globals.css               # Global styles
│   └── components/
│       ├── TravelForm.js             # User input form
│       └── ItineraryDisplay.js       # Itinerary results display
```

## API

The app uses Google's Gemini 1.5 Flash model with structured JSON output to generate:
- Day-by-day itineraries with morning, afternoon, and evening activities
- Restaurant recommendations for lunch and dinner
- Hotel suggestions matching your budget
- Travel tips specific to your destination

## License

MIT
