<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF6B35,50:F7C59F,100:1A1A2E&height=200&section=header&text=SyncRide&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=GenAI%20Powered%20Travel%20Assistant&descAlignY=60&descSize=20&descColor=ffffff" width="100%"/>

<br/>

[![Live Demo](https://img.shields.io/badge/🚌_Live_Demo-syncride.web.app-FF6B35?style=for-the-badge&logoColor=white)](https://syncride-d95f4.web.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-98.5%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/adityadhimaann/sync-ride-assist)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Commits](https://img.shields.io/badge/Commits-59-FF6B35?style=for-the-badge&logo=git&logoColor=white)](https://github.com/adityadhimaann/sync-ride-assist/commits/main)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

<br/>

> **SyncRide** is a GenAI-powered travel assistant that helps budget commuters in India never miss their bus — combining real-time delay prediction, AI-driven route planning, and a bilingual conversational interface (Hindi + English).

<br/>

</div>

---

## 📋 Table of Contents

- [🎯 The Problem](#-the-problem)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🤖 AI Pipeline](#-ai-pipeline)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🔥 Firebase Setup](#-firebase-setup)
- [🌍 Deployment](#-deployment)
- [📈 Impact & Metrics](#-impact--metrics)
- [🙌 Author](#-author)

---

## 🎯 The Problem

Budget commuters in India — especially in Tier 2 and Tier 3 cities — face a painful daily reality:

| Problem | Impact |
|---------|--------|
| Bus delays are unpredictable | Missed connections, late arrivals |
| No real-time route intelligence | Manual planning wastes 10–15 min per trip |
| Last-mile gap is unaccounted for | Journey planning stops at the bus stop |
| Apps are English-only | Non-English speakers are underserved |

**SyncRide solves all four.** In under 30 seconds, a user can describe their journey in Hindi or English and get a complete, AI-generated door-to-door travel plan with real-time delay awareness.

---

## ✨ Features

### 🚌 Core Travel Intelligence
| Feature | Description |
|---------|-------------|
| **Real-time Delay Prediction** | Live bus delay data via Firebase Realtime DB |
| **Smart Intercept Suggestions** | AI recommends alternative catch points if your bus is delayed |
| **Last-Mile Planning** | Complete door-to-door journey including walking/auto for first and last mile |
| **Smart Trip Extraction** | Describe your journey in natural language — AI extracts origin, destination, time automatically |
| **Proactive Delay Alerts** | Get notified before you leave, not after you've missed the bus |

### 🤖 AI Conversational Layer
| Feature | Description |
|---------|-------------|
| **Bilingual AI (Hindi + English)** | Full conversational support in both languages |
| **RAG-powered Route Data** | Retrieval-Augmented Generation for accurate, real route information |
| **LLM Trip Planning** | OpenAI-powered complete journey generation from unstructured input |
| **Recovery Planning** | If you miss a bus, AI instantly suggests the next best route |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
│          React + TypeScript + Tailwind CSS (Vite)           │
│   [Chat Interface]  [Route Map]  [Delay Dashboard]          │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │    AI ORCHESTRATION     │
          │   OpenAI API + RAG      │
          │  ┌─────────────────┐    │
          │  │ Trip Extractor  │    │
          │  │ Route Planner   │    │
          │  │ Alert Generator │    │
          │  └─────────────────┘    │
          └────────────┬────────────┘
                       │
     ┌─────────────────▼──────────────────┐
     │         FIREBASE BACKEND           │
     │  ┌─────────────┐  ┌─────────────┐  │
     │  │  Realtime   │  │   Firestore │  │
     │  │  Database   │  │  (Routes,   │  │
     │  │  (Live      │  │   Stops,    │  │
     │  │   Delays)   │  │   History)  │  │
     │  └─────────────┘  └─────────────┘  │
     │  ┌─────────────┐                   │
     │  │   Firebase  │                   │
     │  │   Hosting   │                   │
     │  └─────────────┘                   │
     └────────────────────────────────────┘
```

---

## 🤖 AI Pipeline

### Trip Planning Flow

```
User Input (Hindi or English)
"कल सुबह 8 बजे मुझे रेलवे स्टेशन जाना है"
        │
        ▼
┌─────────────────────────────────┐
│      LANGUAGE DETECTION         │
│   Hindi → translate to English  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│      ENTITY EXTRACTION (LLM)    │
│  Origin: Current Location       │
│  Destination: Railway Station   │
│  Time: Tomorrow 8:00 AM         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│     RAG — ROUTE RETRIEVAL       │
│  Query route database for       │
│  matching bus lines + stops     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│    REAL-TIME DELAY CHECK        │
│  Firebase Realtime DB lookup    │
│  for current/predicted delays   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│    JOURNEY PLAN GENERATION      │
│  Walk → Bus → Intercept → Walk  │
│  With timing buffers for delays │
└────────────┬────────────────────┘
             │
             ▼
   Complete Door-to-Door Plan
   Returned in User's Language
```

### RAG Architecture

```
Route Data (Bus stops, schedules, routes)
        │
        ▼
   Vector Embeddings
        │
        ▼
   Vector Store
        │
   User Query ──────► Similarity Search
                            │
                            ▼
                    Relevant Context
                            │
                    + User Query
                            │
                            ▼
                      LLM (OpenAI)
                            │
                            ▼
                    Accurate Route Plan
```

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React.js-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

### Backend & Data
![Firebase](https://img.shields.io/badge/Firebase_Realtime_DB-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase_Hosting-FF6F00?style=flat-square&logo=firebase&logoColor=white)

### AI & ML
![OpenAI](https://img.shields.io/badge/OpenAI_API-412991?style=flat-square&logo=openai&logoColor=white)
![RAG](https://img.shields.io/badge/RAG_Pipeline-FF6B35?style=flat-square&logoColor=white)

### Dev Tools
![Bun](https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.x
bun >= 1.x        # recommended (or npm works too)
Firebase account  # for Realtime Database
OpenAI API key    # for AI features
```

### 1. Clone the Repository

```bash
git clone https://github.com/adityadhimaann/sync-ride-assist.git
cd sync-ride-assist
```

### 2. Install Dependencies

```bash
# Using Bun (recommended - faster)
bun install

# Or using npm
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Locally

```bash
# Using Bun
bun run dev

# Or npm
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
sync-ride-assist/
├── src/
│   ├── components/          # UI components
│   │   ├── chat/            # Conversational AI interface
│   │   ├── map/             # Route map display
│   │   ├── delay/           # Delay prediction widgets
│   │   └── common/          # Shared UI elements
│   ├── hooks/               # Custom React hooks
│   ├── services/
│   │   ├── ai/              # OpenAI API integration
│   │   │   ├── extractor.ts # Trip entity extraction
│   │   │   ├── planner.ts   # Journey plan generation
│   │   │   └── rag.ts       # RAG pipeline
│   │   ├── firebase/        # Firebase Realtime DB client
│   │   └── translation/     # Hindi/English handling
│   ├── store/               # State management
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions
├── public/                  # Static assets
├── .env.example             # Environment variable template
├── .firebaserc              # Firebase project config
├── firebase.json            # Firebase hosting config
├── database.rules.json      # Firebase security rules
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
├── vitest.config.ts         # Test configuration
└── tsconfig.json            # TypeScript config
```

---

## 🔥 Firebase Setup

### 1. Create a Firebase Project

Go to [Firebase Console](https://console.firebase.google.com) → New Project → Enable Realtime Database.

### 2. Set Database Rules

Copy the rules from `database.rules.json` into your Firebase Realtime Database rules tab:

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "delays": {
      ".read": true
    },
    "routes": {
      ".read": true
    }
  }
}
```

### 3. Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Build the project
bun run build

# Deploy
firebase deploy
```

---

## 🌍 Deployment

The app is deployed on **Firebase Hosting** for zero-config, CDN-backed delivery.

```bash
# Build production bundle
bun run build

# Preview locally before deploy
firebase serve

# Deploy to production
firebase deploy --only hosting
```

**Live URL:** [syncride.web.app](https://syncride.web.app)

---

## 📈 Impact & Metrics

| Metric | Value |
|--------|-------|
| **Journey planning time** | Reduced from 10–15 min → under 30 seconds |
| **Missed bus reduction** | Targets 5–15% improvement for daily commuters |
| **Languages supported** | Hindi + English (bilingual AI) |
| **Codebase** | 98.5% TypeScript, 59 commits |
| **Bundle tool** | Vite + Bun for fast builds |
| **Deployment** | Firebase Hosting (global CDN) |

---

## 🙌 Author

<div align="center">

**Aditya Kumar**

[![Portfolio](https://img.shields.io/badge/Portfolio-adidev.works-FF6B35?style=for-the-badge&logo=firefox&logoColor=white)](https://www.adidev.works)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-adityadhimaann-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adityadhimaann)
[![GitHub](https://img.shields.io/badge/GitHub-adityadhimaann-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/adityadhimaann)
[![Email](https://img.shields.io/badge/Email-dhimanaditya56@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:dhimanaditya56@gmail.com)

*Final-year CSE @ Lovely Professional University | Full-Stack & AI Builder*

*Top 15 / 25,000+ — Finarva AI Hackathon (Gromo × AWS × Sarvam AI)*

</div>

---

<div align="center">

If SyncRide helped you or inspired your work, drop a ⭐ — it means a lot!

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1A1A2E,50:F7C59F,100:FF6B35&height=100&section=footer" width="100%"/>

</div>
