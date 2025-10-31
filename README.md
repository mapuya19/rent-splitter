# Rent Splitter

A free, easy-to-use rent and utilities calculator for roommates. Split rent proportionally based on income or room size, and utilities evenly between roommates. Generate shareable links to collaborate with your roommates.

## Features

- 💰 **Income-based rent splitting** - Split rent based on annual income (higher earners pay more)
- 📏 **Room size-based rent splitting** - Split rent based on square footage (larger rooms pay more)
- 🔧 **Room adjustments** - Adjust for private bathrooms, windows, and flexible walls
- ⚡ **Even utilities splitting** - Utilities and expenses are always split evenly
- 💵 **Multi-currency support** - Support for USD, EUR, GBP, CAD, AUD, and more
- 🔗 **Shareable links** - Generate compressed URLs to share calculations with roommates
- 📱 **Responsive design** - Fully optimized for desktop, tablet, and mobile devices
- 🤖 **AI Chatbot Assistant** - Get help filling out forms or learn about features using an intelligent chatbot powered by Groq

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling and responsive design
- [Jest](https://jestjs.io) - Testing framework
- [React Testing Library](https://testing-library.com/react) - Component testing
- [Groq](https://console.groq.com) - AI chatbot powered by Groq API (Llama 3.1)

## SEO Optimization

This project is optimized for search engines with:

- ✅ Comprehensive metadata (Open Graph, Twitter Cards)
- ✅ JSON-LD structured data (Schema.org)
- ✅ Sitemap.xml generation
- ✅ Robots.txt configuration
- ✅ Semantic HTML structure
- ✅ Fully mobile-responsive design with optimized chatbot interface
- ✅ Smooth animations and transitions for better UX
- ✅ Fast page load times

See `DEPLOYMENT.md` for deployment instructions.

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

See `src/__tests__/README.md` for detailed testing documentation.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Chatbot Feature

The application includes an AI-powered chatbot assistant that helps users:

- **Fill out forms automatically** - Tell the chatbot your rent, utilities, and roommate info in natural language
- **Answer questions** - Learn about features, split methods, and how the app works
- **Smart extraction** - The AI extracts structured data from conversational input (rent amounts, incomes, room sizes, etc.)
- **Mobile-optimized** - Fully responsive chatbot interface that adapts to mobile screen sizes
- **Smooth animations** - Polished UI with fade-in, slide, and scale animations for better user experience

The chatbot uses Llama 3.1 8B Instant model via Groq API with a rules-based fallback for reliability.

## Environment Variables

### Required

- `MODEL_API_KEY` - Your Groq API key for chatbot functionality (Llama 3.1 model)
  - Get your API key from: https://console.groq.com/keys
  - **IMPORTANT**: Never commit your API key to version control
  - For local development: Create a `.env.local` file (see `.env.example` for template)
  - For Vercel deployment: Set it in your Vercel project settings under Environment Variables

### Optional

- `NEXT_PUBLIC_APP_URL` - Your app's public URL (defaults to `https://rent-splitter.vercel.app`)
- `NEXT_PUBLIC_GOOGLE_VERIFICATION` - Google Search Console verification code (optional)

### Setup Instructions

1. **Local Development**:
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local and add your API key
   # MODEL_API_KEY=your-actual-api-key-here
   ```

2. **Vercel Deployment**:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add `MODEL_API_KEY` with your Groq API key
   - Redeploy your application

**Note**: The `.env.local` file is gitignored and will not be committed. Use `.env.example` as a template for the required variables.

## License

MIT
