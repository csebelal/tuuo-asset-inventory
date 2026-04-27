# TUUO Asset Inventory Management System

A comprehensive IT asset management system built with React, Node.js, Express, and MongoDB.

## Features

- Dashboard with KPIs, charts, and real-time insights
- Asset management with detailed tracking
- Maintenance tracking (Dust Clean, Peripheral Tracker, Maintenance Log)
- Parts & Components change tracking
- User authentication and role management
- Department and floor-based organization
- Network mapping
- CSV import/export
- Reports generation

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** Node.js, Express, MongoDB
- **Authentication:** JWT

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/tuuo-asset-inventory.git
cd tuuo-asset-inventory
```

2. **Setup Server**
```bash
cd server
npm install
```

3. **Create .env file in server folder**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tuuo_assets
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

4. **Setup Client**
```bash
cd ../client
npm install
```

### Running the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev


npx concurrently "npm run dev --prefix server" "npm run dev --prefix client"
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default Login

- Username: `admin`
- Password: `admin123`

## Project Structure

```
tuuo-asset-inventory/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── api/           # API client
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # MongoDB models
│   │   ├── middleware/     # Express middleware
│   │   └── config/        # Configuration
│   └── ...
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - Register new user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/users/:id` - Update user
- `DELETE /api/v1/auth/users/:id` - Delete user
- `POST /api/v1/auth/change-password` - Change password

### Assets
- `GET /api/v1/assets` - Get all assets
- `POST /api/v1/assets` - Create asset
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset

### Dashboard
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/dashboard/by-department` - Assets by department
- `GET /api/v1/dashboard/by-floor` - Assets by floor
- `GET /api/v1/dashboard/by-type` - Assets by type

### Maintenance
- `GET /api/v1/maintenance` - Get maintenance logs
- `POST /api/v1/maintenance/dust-clean` - Record dust clean
- `POST /api/v1/maintenance/peripheral` - Record peripheral change

### Parts & Components
- `GET /api/v1/parts` - Get all part change records
- `POST /api/v1/parts` - Create part change record
- `PUT /api/v1/parts/:id` - Update part change record
- `DELETE /api/v1/parts/:id` - Delete part change record
- `GET /api/v1/parts/by-asset/:assetSL` - Get records by asset
- `GET /api/v1/parts/by-component/:type` - Get records by component type

### Import
- `POST /api/v1/import/csv` - Import assets from CSV

### Reports
- `GET /api/v1/reports/csv` - Export assets as CSV
- `GET /api/v1/reports/json` - Export assets as JSON

## License

MIT License - Developed by [Belal Hossain](https://belal09.netlify.app/)
