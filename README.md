# Pinecrest Bank

A full-stack banking web application built as a portfolio project. Real
registration, real admin approval, real balance transfers, and multi-channel
notifications (email, SMS, in-app) — no demo/mock login, everything runs on
an actual MongoDB-backed flow.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Recharts + Socket.io client
- **Backend:** Node.js + Express + MongoDB (Mongoose) + Socket.io
- **Email:** Brevo (Sendinblue) API
- **SMS:** Twilio
- **Deploy:** Frontend → Vercel · Backend → Render

## Project structure

```
pinecrest-bank/
├── backend/           Node/Express API
│   ├── config/        MongoDB connection
│   ├── controllers/   Route logic (auth, users, transactions, admin)
│   ├── middleware/     JWT auth + role guards
│   ├── models/        Mongoose schemas
│   ├── routes/        Express routers
│   ├── utils/         Email, SMS, notifications, ID generators
│   ├── cron/          Daily savings interest job
│   ├── socket.js       Socket.io setup
│   ├── seedAdmin.js    One-time admin account creator
│   └── server.js
└── frontend/          React app
    ├── src/
    │   ├── api/        Axios client
    │   ├── context/     Auth + Socket context
    │   ├── components/  Sidebar, BottomNav, layouts, carousel
    │   └── pages/       Landing, auth flow, user dashboard, admin dashboard
    └── public/          Put your logo.png here
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — any long random strings
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` — from your Brevo account
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — from Twilio
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — used once by the seed script

Create the first admin account:

```bash
node seedAdmin.js
```

Run the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Drop your logo file into `frontend/public/logo.png`.

Run the app:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

## How the real flow works

1. **Register** — user fills a 4-step form (personal info, address/SSN,
   account type + currency, password + 4-digit transaction PIN).
2. **Verify** — separate email OTP and SMS OTP must both be confirmed.
3. **Pending review** — account sits in `pending` status until an admin
   approves it from `/admin/approvals`.
4. **Login** — only works once verified AND approved.
5. **Bank** — transfers (internal to another Well Trust account, or external
   to any other bank, simulated) debit/credit real balances in MongoDB and
   fire email + SMS + in-app notifications via Socket.io.
6. **Admin** — can search/filter users, approve/reject/suspend/freeze
   accounts, manually credit or debit balances, and view every transaction
   and audit log platform-wide.

## Deployment

**Backend → Render**
1. Push `backend/` to GitHub (or the whole repo).
2. New Web Service on Render, root directory `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add all `.env` variables in Render's environment settings.
5. Set `CLIENT_URL` to your deployed Vercel URL once you have it.

**Frontend → Vercel**
1. Import the repo, root directory `frontend`.
2. Framework preset: Vite.
3. Add `VITE_API_URL` and `VITE_SOCKET_URL` pointing to your Render backend URL.

## Notes on realism vs. actual banking

This is a portfolio project — it is **not** a chartered or FDIC-insured
bank. External transfers are simulated (they debit the sender but don't
move real money anywhere). Multi-currency transfers only work between two
accounts holding the *same* currency for now (cross-currency conversion is a
good phase-2 feature). SSNs are hashed and only the last 4 digits are
stored in plain form, matching how real banks display them back to users.

## What to build next

- Bill pay / airtime-style utility payments
- PDF statement generation (you've got PDFKit/jsPDF experience already)
- Scheduled/recurring transfers
- Admin CSV export for transactions
- Cross-currency conversion on transfer
