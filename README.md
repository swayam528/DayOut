# AI-Powered Day Trip Planner

An intelligent travel companion that helps you plan the perfect day trip by leveraging AI to generate personalized itineraries and provide local recommendations. The application combines the power of the Llama API for natural language processing with Google Maps for location services.

Live demo: [day-out-phi.vercel.app](https://day-out-phi.vercel.app)

## Features

- AI-powered itinerary generation based on user preferences
- Interactive map integration with points of interest
- Real-time travel time calculations and route optimization
- Location-based activity recommendations
- Responsive design for mobile and desktop use

## Tech Stack

- **Frontend**: React + Vite
- **AI Integration**: Llama API
- **Maps**: Google Maps JavaScript API
- **Deployment**: Vercel
- **Language**: TypeScript
- **Styling**: CSS

## Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or higher)
- npm or yarn
- A Google Maps API key
- A Llama API key

## Environment Variables

Create a `.env` file in the root directory with:

```plaintext
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_LLAMA_API_KEY=your_llama_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/day-trip-planner.git
cd day-trip-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
day-trip-planner/
├── src/
│   ├── components/     # React components
│   ├── services/      # API integration services
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Helper functions
│   └── App.tsx        # Main application component
├── public/           # Static assets
└── vite.config.ts    # Vite configuration
```

## API Integration

### Google Maps

The application uses the following Google Maps APIs:
- Places API for location search
- Directions API for route planning
- Maps JavaScript API for map rendering

### Llama API

Used for:
- Natural language processing of user inputs
- Generating personalized recommendations
- Processing location context and user preferences

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy using:
```bash
vercel --prod
```

## Local Development

1. Start the development server:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

3. Preview production build:
```bash
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Google Maps Platform for location services
- Llama API for AI capabilities
- Vercel for hosting and deployment
- React and Vite communities for excellent documentation and support
