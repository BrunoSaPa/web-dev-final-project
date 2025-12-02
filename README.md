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

3. Create a `.env` file in the root directory and add the following environment variables:
```
# Next.js Configuration
NEXT_PUBLIC_EXPRESS_API_URL=http://localhost:3001

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?appName=<appName>

# Express Server
EXPRESS_PORT=3001

# Authentication (Google OAuth)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<a-random-secret-string>
```

## Running the Project

The project uses two servers that must run concurrently: the Next.js frontend server and the Express.js backend API server.

### Development Mode (Recommended)

Run both servers simultaneously with:

```bash
npm run dev-all
```

This will start:
- Next.js dev server on http://localhost:3000
- Express.js API server on http://localhost:3001

### Individual Servers

If you need to run servers separately:

**Frontend only:**
```bash
npm run dev
```

**Backend only:**
```bash
npm run express:dev
```

### Production Build

Build the Next.js application:
```bash
npm run build
npm run start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Authentication endpoints
│   │   ├── species/               # Species API routes
│   │   └── admin/                 # Admin-only endpoints
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
│   └── models/
│       ├── Species.js             # Species mongoose schema
│       └── Species-express.js     # Species model for Express
├── server.js                      # Express.js server
├── public/                        # Static assets
└── package.json                   # Dependencies and scripts
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

**GET /api/species/filters**
Get available filter options for the UI.

### Admin Endpoints

**POST /api/admin/approve**
Approve or reject pending species contributions (admin only).

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
- Verify MONGODB_URI is set correctly in `.env`
- Check MongoDB Atlas network access settings
- Ensure your IP is whitelisted in MongoDB Atlas

### "Next.js and Express servers not running"
- Run `npm run dev-all` instead of individual commands
- Check that ports 3000 and 3001 are available
- Review terminal output for error messages

### "Authentication not working"
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- Check NEXTAUTH_URL matches your deployment URL
- Ensure NEXTAUTH_SECRET is set (generate with openssl rand -base64 32)

## Documentation Files

- **code_explanation.md**: Technical documentation of code components
- **dev_log.md**: Development timeline and team contributions
- **README.md**: This file - complete project documentation

## Project Status

This project is a completed final submission for the web development course. All core requirements have been implemented including full MERN stack usage, authentication, data persistence, API design, and user contribution workflows.