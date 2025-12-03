# Mexican Wildlife Conservation Platform

A comprehensive web application for discovering, documenting, and protecting Mexico's endangered species. This full-stack MERN project combines modern technologies to create a professional platform for wildlife conservation.

## Project Overview

This platform allows users to explore over 12,000 endangered species from Mexico, submit conservation contributions, and manage species data. The application features user authentication, admin approval workflows, advanced filtering capabilities, and integration with third-party biodiversity APIs.

## Key Features

- **User Authentication**: Google OAuth 2.0 integration with NextAuth.js for secure account creation and management
- **Species Database**: Browse and search 10,000+ Mexican endangered species with detailed information
- **Advanced Filtering**: Filter species by conservation status, taxonomic classification (reino, filo, clase, orden, familia), location, and search terms
- **User Contributions**: Authenticated users can submit new species data for conservation tracking
- **Admin Dashboard**: Review and approve user contributions with an intuitive admin panel
- **Responsive Design**: Bootstrap-based responsive UI that works seamlessly across all devices
- **RESTful API**: Well-designed Express.js API with comprehensive error handling
- **Data Persistence**: MongoDB integration for reliable data storage across sessions

## Tech Stack

- **Frontend**: React 19, Next.js 16, Bootstrap 5
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: NextAuth.js with Google OAuth 2.0
- **Styling**: Bootstrap 5, CSS3
- **Data Management**: Mongoose ODM for MongoDB

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.x or higher
- npm or yarn package manager
- MongoDB connection URI (provided in environment setup)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-dev-final-project
```

2. Install dependencies:
```bash
npm install
```

3. **Configure environment variables:**

### For Local Development

Create a `.env.local` file in the root directory with your local configuration:

```bash
# Email for admin access
EMAIL_ADMIN=your-email@example.com

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB connection string
MONGODB_URI=your-mongodb-uri

# NextAuth configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# API URL
NEXT_PUBLIC_EXPRESS_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

### For Render Deployment

Set these environment variables in the Render dashboard:

```bash
EMAIL_ADMIN=your-email@example.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-uri
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-render-url.onrender.com
NEXT_PUBLIC_EXPRESS_API_URL=/api
NODE_ENV=production
```

⚠️ **Never commit actual credentials to Git. Use `.env.local` for development.**

**Render Build Settings:**
- Build Command: `npm run build`
- Start Command: `npm start`

## Running the Project

### Development Mode (Local)

For full development with both frontend and backend running:

```bash
npm run dev-all
```

This concurrently runs:
- Next.js frontend on `http://localhost:3000`
- Express backend on `http://localhost:3001`

Or run individually:
```bash
npm run dev          # Next.js frontend only
npm run express:dev  # Express backend only (with hot reload)
```

### Production Build (Local Test)

Build the Next.js application for production and test locally:

```bash
npm run build
npm run start
```

This starts the production server which:
1. Starts Express backend on port 3001
2. Waits 5 seconds for MongoDB connection
3. Starts Next.js frontend on port 3000
4. Proxies API requests from frontend to backend

### Production Deployment (Render)

1. Push your code to GitHub
2. Connect your repository to Render
3. Configure environment variables in Render dashboard
4. Set Build Command: `npm run build`
5. Set Start Command: `npm start`
6. Render will auto-deploy on each push to main branch


## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Authentication endpoints
│   │   ├── species/               # Species API routes
│   │   ├── admin/                 # Admin-only endpoints
│   │   ├── warmup/                # Health check endpoint
│   │   ├── debug/filters/         # Debug filter endpoint
│   │   └── test-db/               # Database test endpoint
│   ├── filters-data/              # Fast filter endpoint (outside /api)
│   ├── components/                # React components
│   ├── admin/                     # Admin panel pages
│   ├── catalog/                   # Species catalog
│   ├── especie/[id]/              # Species detail pages
│   ├── profile/                   # User profile management
│   ├── contact/                   # Contact page
│   ├── learn/                     # Educational content
│   └── layout.js                  # Root layout
├── lib/
│   ├── mongodb.js                 # MongoDB connection (Next.js)
│   ├── mongodb-express.js         # MongoDB connection (Express)
│   ├── api.js                     # API utility functions
│   ├── apiUtils.js                # Client-side API helpers
│   ├── controllers/
│   │   └── speciesController.js  # Business logic for species
│   └── models/
│       ├── Species.js             # Species mongoose schema (Next.js)
│       └── Species-express.js     # Species model (Express)
├── server.js                      # Express.js server with optimized filters
├── start-prod.js                  # Production startup orchestration
├── next.config.mjs                # Next.js routing and rewrites config
├── render.yaml                    # Render deployment configuration
├── middleware.js                  # Next.js middleware
├── public/                        # Static assets
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## API Endpoints

### Species Endpoints

**GET /api/species**
Fetch species with filtering and pagination.

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 15)
- `status`: Conservation status (e.g., "Vulnerable", "Endangered")
- `search`: Search by common or scientific name
- `estado`: Filter by state/location
- `reino`, `filo`, `clase`, `orden`, `familia`: Taxonomic filters
- `added_by`: Filter by contributor email
- `state`: Filter by approval state (pending, approved, rejected)

**POST /api/species**
Submit a new species record (requires authentication).

**GET /api/species/filters** (OPTIMIZED)
Get available filter options for the UI.
- Response includes: reino, filo, clase, orden, familia, categoria_lista_roja, estados
- Uses MongoDB aggregation pipeline for efficiency
- Results cached for 5 minutes in memory
- First call: ~500-800ms, Cached calls: <1ms
- Client-side requests go through `/filters-data` endpoint

**GET /filters-data** (PRODUCTION OPTIMIZED)
Alternative filter endpoint outside `/api/` path for production deployments.
- Avoids next.config.mjs rewrite interception
- Implements retry logic (12 attempts with exponential backoff)
- Used by client-side `getFilterOptions()` in production
- Direct proxy to `/api/species/filters`

### Admin Endpoints

**POST /api/admin/approve**
Approve or reject pending species contributions (admin only).

### Utility Endpoints

**GET /api/warmup**
Health check endpoint to verify Express backend is ready.

**GET /api/debug/filters** (DEPRECATED)
Debug endpoint showing filter aggregation details.

## Data Model

### Species Schema
```
{
  nombre_cientifico: String (unique, required),
  nombre_comun: String,
  categoria_lista_roja: String,
  fotos: [String],
  foto_principal: String,
  descripcion: String,
  reino: String,
  filo: String,
  clase: String,
  orden: String,
  familia: String,
  top_lugares: String,
  id_taxon_sis: Number,
  inat_id: Number,
  gbif_id: Number,
  added_by: String,
  state: String (enum: ['pending', 'approved', 'rejected']),
  json_completo: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Authentication**: Secure OAuth 2.0 implementation with NextAuth.js
- **Session Management**: Server-side session handling to maintain user state across requests
- **Authorization**: Admin-only access to approval endpoints
- **Data Validation**: Input validation on both client and server sides
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **CORS**: Configured CORS for secure cross-origin requests

## Error Handling

The application implements comprehensive error handling across all layers:

- **Client-side**: User-friendly error messages displayed in the UI
- **Server-side**: Detailed error logging with appropriate HTTP status codes
- **Database**: Connection error handling and retry logic
- **API**: Validation errors and meaningful error responses

Example error response:
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

## Scripts

```bash
npm run dev              # Start Next.js dev server
npm run express         # Start Express server
npm run express:dev     # Start Express server with nodemon (auto-reload)
npm run dev-all         # Run both servers concurrently
npm run build          # Build Next.js for production
npm run start          # Start Next.js in production
npm run lint           # Run ESLint
```

## Database

The project uses MongoDB Atlas for data storage. All species data, user contributions, and approval states are persisted in the MongoDB database. The connection is established through Mongoose with proper error handling and connection pooling.

## Third-Party Integrations

- **Google OAuth**: User authentication and account creation
- **Bootstrap**: UI component library
- **Mongoose**: MongoDB object modeling

## Contributing

To contribute to the species database:

1. Create an account using Google OAuth
2. Navigate to your profile
3. Submit species information through the contribution form
4. Wait for admin approval
5. Your contribution will be reviewed and added to the public database

## Troubleshooting

### "Cannot connect to MongoDB"
- Verify MONGODB_URI is set correctly in `.env` or Render dashboard
- Check MongoDB Atlas network access settings
- Ensure your IP is whitelisted in MongoDB Atlas

### "Next.js and Express servers not running"
- Run `npm run dev-all` for development instead of individual commands
- Check that ports 3000 and 3001 are available
- Review terminal output for error messages

### "Authentication not working"
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- Check NEXTAUTH_URL matches your deployment URL
- Ensure NEXTAUTH_SECRET is set (generate with openssl rand -base64 32)

### "Filters not loading in Render"
- Filters use MongoDB aggregation pipeline which may be slow on first load
- First call takes ~500-800ms, subsequent calls use 5-minute cache (<1ms)
- Check browser console for `/filters-data` endpoint errors
- Verify Express backend is running: check logs for "[Warmup] ✓ Express is ready!"
- Ensure MONGODB_URI is correctly connected in Render

### "Render deployment issues"
- Build command must be: `npm run build`
- Start command must be: `npm start`
- Express takes 5 seconds to connect to MongoDB before Next.js starts
- Check "Events" tab in Render dashboard for deployment logs
- Ensure all environment variables are set in Render dashboard

## Architecture Notes

### Dual-Process Architecture
The application uses two separate processes in production:
- **Express Backend**: Runs on port 3001, handles API requests and MongoDB queries
- **Next.js Frontend**: Runs on port 3000, serves React UI and proxies API calls

### Request Flow
1. Browser requests → Next.js (port 3000)
2. API calls → Routed through next.config.mjs rewrites
3. Specific admin/test routes → Direct to Express
4. Catch-all `/api/*` → Proxied to Express (port 3001)
5. Filter requests → Go through `/filters-data` endpoint (avoids rewrite interception)

### Performance Considerations
- **Filter Caching**: 5-minute in-memory cache reduces MongoDB queries
- **Aggregation Pipeline**: Uses MongoDB `$facet` instead of loading all documents
- **Startup Delay**: 5-second wait ensures Express has stable MongoDB connection before Next.js starts
- **Retry Logic**: 12 attempts with exponential backoff handles temporary connection issues

## Documentation Files

- **code_explanation.md**: Technical documentation of code components and architecture
- **dev_log.md**: Development timeline, team contributions, and production optimization details
- **CONCLUSION.md**: Project challenges, solutions, and lessons learned
- **README.md**: This file - complete project documentation and usage guide