# InvenOrder - Premium Inventory & Order Management System

A high-performance, full-stack MERN application for modern business management. Inspired by premium food-delivery UI aesthetics, it offers a seamless experience for managing products, tracking real-time stock, and processing customer orders.

## ✨ Features

- **Authentication**: Secure JWT-based admin login and registration.
- **Dashboard**: Real-time analytics, including total sales, stock alerts, and popular items.
- **Product Management**: Full CRUD operations with search and category filtering.
- **Inventory Tracking**: Automatic stock updates on order placement with low-stock visual cues.
- **Order Processing**: Multi-product order creation with real-time total calculation.
- **Responsive UI**: Glassmorphism design system built with Tailwind CSS and Framer Motion.

## 🚀 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT, BcryptJS.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed locally or a MongoDB Atlas URI

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   npm run dev # requires nodemon
   # or
   node index.js
   ```

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

## 📸 UI Aesthetic
The application follows a warm, premium color palette (`#FF7A00`) with soft gradients and glassmorphism elements, ensuring a modern and professional management experience.
