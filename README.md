# 💸 Rent Splitter

**Fair rent and utilities calculator for roommates**

![npm version](https://img.shields.io/npm/v/rent-splitter?style=flat-square)
![License](https://img.shields.io/npm/l/rent-splitter?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)

[Demo](https://rent-splitted.vercel.app) • [Documentation](#-getting-started)

## ✨ Features

- 💰 Income-based rent splitting (proportional to annual income)
- 📏 Room size-based splitting with adjustments (bathroom, window, flex wall)
- ⚡ Utilities and expenses split equally
- 💵 Multi-currency support (USD, EUR, GBP, CAD, AUD, and 10+ more)
- 🔗 Shareable calculations via compressed URLs
- 🤖 AI chatbot for natural language form filling
- ♿ Accessibility-first with keyboard navigation and screen reader support

## 🚀 Getting Started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/matthewapuya/rent-splitter.git
cd rent-splitter
npm install
```

Create `.env.local`:

```bash
MODEL_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your API key from [console.groq.com/keys](https://console.groq.com/keys)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage

**Income-based split** (couples/families): Rent distributed proportionally by annual income

**Room size-based split** (friends/roommates): Rent allocated by square footage with adjustments for room features

**Utilities & expenses**: Split equally among all roommates

**Sharing**: Generate compressed URLs to share calculations with roommates

## 🛠️ Tech Stack

Next.js 15 (App Router) • TypeScript 5 • React 19 • Tailwind CSS v4 • GSAP 3.12 • Jest 29.7 • Groq API (Llama 3.1)

## 🌐 Deployment

**Vercel (recommended):** Import your GitHub repo and Vercel auto-detects Next.js. Set `MODEL_API_KEY` in environment variables.

**Other platforms:** Netlify, Railway, Render, AWS Amplify, or self-hosted Docker. See [`DEPLOYMENT.md`](DEPLOYMENT.md)

## 📚 Documentation

- [Testing](src/__tests__/README.md)
- [Deployment](DEPLOYMENT.md)

## ♻️ Development

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run linter
```
