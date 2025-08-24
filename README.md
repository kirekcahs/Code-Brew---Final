# CodeBrew POS System

A full-featured Point of Sale (POS) system for coffee shops, built with **React (Vite + TypeScript)** for the frontend and **Node.js + Express + PostgreSQL** for the backend.

---

## 🚀 Features

### Frontend (React + Vite + TypeScript)
- **Role-based Authentication:** Admin, Branch Officer, Cashier
- **Branch Management:** Admins can select and manage branches
- **Dashboard:** Real-time stats, recent orders, low stock, top-selling products
- **Inventory Management:** Add, edit, delete, and filter inventory items
- **Asset Management:** Track and manage shop assets
- **Reports:** Interactive charts (sales, inventory, products) using Chart.js
- **POS Interface:** Fast, intuitive order-taking and payment processing
- **Responsive Design:** Works on desktop and mobile
- **Modern UI:** Coffee-themed, clean, and user-friendly

### Backend (Node.js + Express + PostgreSQL)
- **RESTful API:** For all POS, inventory, asset, and settings operations
- **Role-based Access Control:** Secure endpoints for each user type
- **Branch-aware Data:** All data is filtered by branch
- **Settings Management:** Store and update global settings (e.g., tax rate)
- **Secure Authentication:** JWT-based login and protected routes
- **Database:** PostgreSQL with connection pooling

---

## 🗂️ Project Structure

```
backend_codebrew/
  ├── src/
  │   ├── config/         # Database config
  │   ├── controllers/    # Express route controllers
  │   ├── routes/         # Express route definitions
  │   ├── index.js        # Main Express app
  │   └── ...             # Other backend files
  └── package.json

other-frontend/
  ├── src/
  │   ├── components/     # Reusable React components
  │   ├── pages/          # Page-level React components
  │   ├── App.tsx         # Main React app
  │   └── ...             # Other frontend files
  └── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```sh
git clone https://github.com/kirekcahs/Code-Brew---Final.git
cd Code-Brew---Final
```

### 2. Install dependencies

#### Backend
```sh
cd backend_codebrew
npm install
```

#### Frontend
```sh
cd ../other-frontend
npm install
```

### 3. Configure environment variables

#### Backend
- Create a `.env` file in `backend_codebrew/` with your PostgreSQL connection string and JWT secret.

#### Example `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/codebrewdb
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 4. Set up the database

- Create the PostgreSQL database and tables. Example for the `settings` table:

```sql
CREATE TABLE settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT
);
INSERT INTO settings (setting_key, setting_value) VALUES ('tax_rate', '12');
```
- Create other tables as needed for users, branches, inventory, assets, orders, etc.

### 5. Run the backend

```sh
cd backend_codebrew
npm start
```
The backend will run on [http://localhost:3000](http://localhost:3000)

### 6. Run the frontend

```sh
cd ../other-frontend
npm run dev
```
The frontend will run on [http://localhost:5173](http://localhost:5173) (default Vite port)

---

## 🛡️ Authentication

- JWT-based authentication.
- Store the token in `localStorage` after login.
- Role-based access for Admin, Branch Officer, and Cashier.

---

## 📝 Customization

- Update theme colors and branding in `src/components` and `src/pages`.
- Add more settings or features as needed.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
-
