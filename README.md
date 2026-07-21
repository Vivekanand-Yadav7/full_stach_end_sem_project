# 🍽️ InvenOrder — AI-Powered Food Ordering & Inventory Platform

A full-stack MERN application with an integrated **RAG (Retrieval-Augmented Generation) pipeline** and **hybrid AI recommendation engine**. Built for modern food-delivery businesses, it combines semantic search, vector similarity, and personalized ranking to deliver an intelligent ordering experience.

---

## ✨ Features

### Core Platform
- **Authentication**: JWT-based login/registration + **Google OAuth 2.0** sign-in.
- **Dashboard**: Real-time analytics — total sales, stock alerts, popular items, and order trends.
- **Product Management**: Full CRUD with Cloudinary image uploads, search, and category filtering.
- **Inventory Tracking**: Automatic stock deduction on order placement with low-stock visual cues.
- **Order Processing**: Multi-product cart with real-time total calculation and order history.
- **Responsive UI**: Glassmorphism design system built with Tailwind CSS and Framer Motion.

### 🤖 AI & RAG Features
- **Smart Search (RAG Pipeline)**: Natural-language product search powered by Google Gemini embeddings and Qdrant vector store.
- **Hybrid Recommendation Engine**: Real-time product suggestions combining:
  - **Vector Similarity** — Qdrant cosine similarity search on product embeddings.
  - **Frequently Bought Together** — Co-occurrence pattern mining stored in PostgreSQL.
  - **Personalized Ranking** — User preference embeddings persisted in `UserEmbedding` table and re-queried on each session.
- **Auto-Indexing**: Products are automatically embedded and upserted into Qdrant on creation or update.
- **LLM-Augmented Results**: Retrieved product context is injected into a Gemini prompt to generate a natural-language recommendation narrative alongside product IDs.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, Tailwind CSS, Lucide React, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Neon) via **Prisma ORM** |
| **Vector Store** | **Qdrant Cloud** (cosine similarity search) |
| **AI / Embeddings** | **Google Gemini** (`text-embedding-004` + `gemini-2.0-flash`) |
| **Image Storage** | **Cloudinary** |
| **Auth** | JWT, BcryptJS, **Google OAuth 2.0** (Passport.js) |
| **Deployment** | **Render** (backend) + **Vercel** (frontend) |

---

## 🧠 RAG Architecture

```
User Query / Cart Update
        │
        ▼
  [Gemini Embeddings]          ← text-embedding-004
        │
        ▼
  [Qdrant Vector Search]       ← cosine similarity on 'products' collection
        │
        ├── Smart Search path ──► [Gemini LLM prompt] ──► Natural-language response
        │
        └── Recommend path ────► [Ranker] ──► Top-10 ranked products
                                    ▲
                          ┌─────────┴──────────┐
                   [Vector Similar]  [Freq. Bought Together]  [User Profile]
```

### RAG Modules (`server/rag/`)

| Module | Path | Purpose |
|---|---|---|
| `embeddings.js` | `ingest/` | Generates Gemini embeddings for text |
| `vectorStore.js` | `ingest/` | Qdrant CRUD — upsert, delete, search |
| `indexProduct.js` | `ingest/` | Builds document & indexes a product |
| `documentBuilder.js` | `ingest/` | Formats product fields into indexable text |
| `retriever.js` | `retrieve/` | Orchestrates embed → search → LLM prompt |
| `prompt.js` | `retrieve/` | Constructs the Gemini RAG prompt |
| `recommend.service.js` | `recommend/` | Orchestrates all recommendation sources |
| `vectorRecommend.js` | `recommend/` | Vector-based item similarity |
| `frequentlyBoughtTogether.js` | `recommend/` | Co-occurrence query from PostgreSQL |
| `userProfile.js` | `recommend/` | Loads/saves user preference embedding |
| `ranker.js` | `recommend/` | Merges & scores final recommendation list |

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js ≥ 18
- PostgreSQL instance (local or [Neon](https://neon.tech))
- [Qdrant Cloud](https://qdrant.to/cloud) cluster
- Google Cloud project with **Gemini API** and **OAuth 2.0** credentials enabled
- [Cloudinary](https://cloudinary.com) account

---

### Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example env file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env`:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Auth
   JWT_SECRET=your_strong_random_jwt_secret

   # Database (PostgreSQL / Neon)
   DATABASE_URL=postgresql://user:password@host:5432/db?schema=public

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

   # Google Gemini AI (RAG / Smart Search)
   GOOGLE_API_KEY=your_google_gemini_api_key

   # Qdrant Vector DB
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your_qdrant_api_key

   # Cloudinary (Image Uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Frontend URL (CORS + OAuth redirect)
   CLIENT_URL=http://localhost:5173
   ```

5. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   # or for development
   npx prisma db push
   ```

6. (Optional) Seed the database and index products into Qdrant:
   ```bash
   node seed.js
   node sync-products.js
   ```

7. Start the server:
   ```bash
   npm run dev
   ```

---

### Frontend Setup

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login with email/password |
| `GET` | `/api/auth/google` | Initiate Google OAuth |
| `GET` | `/api/products` | List all products |
| `POST` | `/api/products` | Create a product (auto-indexes to Qdrant) |
| `PUT` | `/api/products/:id` | Update a product (re-indexes to Qdrant) |
| `DELETE` | `/api/products/:id` | Delete a product (removes from Qdrant) |
| `POST` | `/api/smart-search` | **RAG semantic search** with Gemini LLM |
| `POST` | `/api/recommend` | **Hybrid AI recommendations** |
| `GET` | `/api/orders` | Get user orders |
| `POST` | `/api/orders` | Place a new order |
| `GET` | `/api/dashboard` | Get dashboard analytics |

---

## 🗄️ Database Schema

The PostgreSQL schema (managed via Prisma) includes:

- **User** — Authentication, roles (`customer` / `retailer`), Google OAuth linkage.
- **Product** — Name, price, category, ingredients, nutrition, stock, Cloudinary image URL.
- **Order / OrderItem** — Order lifecycle with cascading item relations.
- **FoodCoOccurrence** — Tracks which products are ordered together (powers "frequently bought together").
- **UserEmbedding** — Stores per-user preference vectors for personalized RAG recommendations.

---

## 🚢 Deployment

The application is production-deployed using:

| Service | Usage |
|---|---|
| **Render** | Node.js backend (auto-deploys from `main` branch via `render.yaml`) |
| **Vercel** | React frontend (auto-deploys on push) |
| **Neon** | Serverless PostgreSQL |
| **Qdrant Cloud** | Managed vector database |
| **Cloudinary** | Product image CDN |

> **Note:** Ensure all environment variables are configured in the Render dashboard. Trailing whitespace in `QDRANT_URL` or `GOOGLE_API_KEY` values will cause connection failures — the server sanitizes these automatically via `.trim()`.

---

## 📸 UI Aesthetic

The application follows a warm, premium color palette (`#FF7A00`) with soft gradients, glassmorphism cards, and Framer Motion animations — delivering a modern, professional management and ordering experience.
