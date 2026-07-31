# 🍔 Campus Bites - College Canteen Pre-Order System

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

**Campus Bites** is a modern, full-stack college canteen pre-ordering system built to eliminate long queues and streamline canteen operations. It features a futuristic "2026 Zomato-inspired" UI with glassmorphism, smooth animations, and a seamless user experience.

---

## 🚀 Features

### 👨‍🎓 For Students
- **Smart Menu Browsing:** Explore categorized food items with rich visuals.
- **Pre-Order System:** Select items and set a specific pickup time.
- **Live Order Tracking:** Monitor order status from 'Pending' to 'Ready'.
- **Google OAuth:** Fast and secure login using Google accounts.
- **Premium UI:** Dark mode aesthetic with glassmorphism and smooth transitons.

### 🧑‍🍳 For Kitchen Staff
- **Kitchen View:** Real-time dashboard for active orders.
- **Order Management:** Update order status ('Preparing', 'Ready', 'Completed').
- **Queue Efficiency:** Reduced rush-hour pressure with scheduled pickups.

### 🛡️ For Admin
- **Menu Management:** Add, edit, or remove dishes easily.
- **Analytics:** View sales data and popular items (Coming Soon/In-progress).
- **Control Panel:** Manage user roles and system settings.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Lucide Icons, Framer Motion (planned animations).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Mongoose).
- **Authentication:** JWT (JSON Web Tokens) & Google OAuth 2.0.
- **Styling:** Vanilla CSS (Custom Glassmorphism and Modern UI tokens).
- **Deployment:** Vercel (Frontend), Render (Backend).

---

## 📦 Project Structure

```text
campus-bites/
├── src/                # React Frontend
│   ├── components/     # Reusable UI components
│   ├── context/        # Auth and Cart Contexts
│   ├── pages/          # Student/Admin/Staff pages
│   └── assets/         # Styles and images
├── server/             # Node.js Backend
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # Express API endpoints
│   ├── middleware/     # Auth and validation
│   └── index.js        # Server entry point
└── public/             # Static assets
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js installed
- MongoDB Atlas account (for database)

### 2. Clone the Repository
```bash
git clone https://github.com/akashhg2007/campus-bites.git
cd campus-bites
```

### 3. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```
Start the server:
```bash
npm start
```

### 4. Frontend Setup
```bash
cd ..
npm install
```
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
Start the development server:
```bash
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add some NewFeature'`).
4. Push to the Branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

**Built with ❤️ for better campus dining.am i connected **
