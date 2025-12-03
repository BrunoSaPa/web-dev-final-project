# Code Explanation

## Architecture Overview

This project implements a full MERN stack (MongoDB, Express, React, Node.js) architecture with a dual-server setup: Next.js for the frontend and Express for the backend API.

## Frontend Structure

### Next.js Configuration (`next.config.mjs`)
- Configures request routing for production environment
- Uses `beforeFiles` for specific endpoints (admin, test routes)
- Uses `afterFiles` for catch-all proxying to Express backend
- Prevents rewrite interception of Next.js API routes

### Filter Data Route (`app/filters-data/route.js`)
- Alternative filter endpoint positioned OUTSIDE `/api/` path
- Avoids next.config.mjs rewrite interception
- Implements retry logic with exponential backoff
  - 12 retry attempts with progressive timeouts (3-6.6 seconds)
  - 200ms + 100ms per attempt delay between retries
- Graceful fallback to empty filter arrays on complete failure
- Direct proxy to Express `/api/species/filters` endpoint

### Client-Side API (`lib/api.js`)
- `getFilterOptions()` function differentiates between environments
- **Client-side (browser)**: Uses `/filters-data` endpoint
- **Server-side (Next.js)**: Direct connection to `localhost:3001` Express
- Conditional routing based on `typeof window`
- Includes console logging for debugging filter operations

### Layout (`app/layout.js`)
- Sets up the root layout with Bootstrap styling
- Implements AuthSessionProvider for NextAuth session management
- Wraps all pages with Navbar and Footer
- Uses Bootstrap CSS and icons globally

### Pages

**Home Page (`app/page.jsx`)**
- Fetches random featured species from the API
- Displays hero section with project mission
- Shows statistics about endangered species
- Features a carousel of randomly selected species
- Responsive design with gradient overlays

**Catalog Page (`app/catalog/page.jsx`)**
- Main species browsing interface
- Implements advanced filtering system
- Supports pagination
- Integrates with SpeciesFilters component
- Displays species in a card grid layout

**Profile Page (`app/profile/page.jsx`)**
- Protected route requiring authentication
- Displays user information
- Shows user's contributed species
- Provides form to submit new species
- Handles contribution approval workflow

**Admin Page (`app/admin/page.jsx`)**
- Admin-only dashboard for reviewing contributions
- Shows pending species submissions
- Allows approval or rejection of contributions
- Requires session validation

**Species Detail Page (`app/especie/[id]/page.jsx`)**
- Dynamic route for individual species
- Displays comprehensive species information
- Shows taxonomic classification
- Displays species photos and conservation status
- Links to related species

### Components

**Navbar (`components/Navbar.jsx`)**
- Navigation menu with links to all pages
- Shows user authentication status
- Displays user profile picture when logged in
- Sign in/Sign out buttons

**SpeciesCard (`components/SpeciesCard.jsx`)**
- Reusable component for displaying species in grid/list format
- Shows species image, scientific name, common name
- Displays conservation status with color coding
- Links to detail page

**SpeciesFilters (`components/SpeciesFilters.jsx`)**
- Advanced filtering interface
- Supports multiple filter types: status, location, taxonomy
- Handles search functionality
- Pagination controls

**FeaturedSpeciesCarousel (`components/FeaturedSpeciesCarousel.jsx`)**
- Bootstrap carousel component
- Displays featured endangered species
- Auto-rotates through species
- Shows key conservation information

**SessionProvider (`components/SessionProvider.jsx`)**
- Client-side wrapper for NextAuth session
- Provides session context to child components
- Enables useSession hook usage

**BootstrapClient (`components/BootstrapClient.jsx`)**
- Loads Bootstrap JavaScript on client side
- Enables interactive Bootstrap components

## Backend Structure

### Express Server (`server.js`)

**In-Memory Filter Cache**
- Implements 5-minute TTL cache for filter options
- Reduces database queries significantly
- Cache functions: `getFiltersCache()`, `setFiltersCache()`
- Automatically refreshes after TTL expires

**Species Routes**

- GET `/api/species`: Fetches species with comprehensive filtering
  - Supports pagination (page, limit)
  - Filters by status, location, taxonomy
  - Search by scientific or common names
  - Restricts to approved species by default
  - Returns paginated results with metadata

- POST `/api/species`: Creates new species entry
  - Validates required fields
  - Stores submission with pending approval status
  - Returns created species document

- GET `/api/species/filters`: Returns available filter options (OPTIMIZED)
  - Uses MongoDB aggregation pipeline with `$facet` for efficiency
  - Eliminates need to load all documents into memory
  - Queries distinct values for: reino, filo, clase, orden, familia, categoria_lista_roja
  - Returns cached result if available (5-minute cache)
  - Performance: 5+ seconds → 500-800ms on first call, <1ms on cached calls
  - Default static list of 32 Mexican states (no parsing needed)

**Admin Routes**

- POST `/api/admin/approve`: Approves or rejects pending submissions
  - Requires authentication (basic validation)
  - Updates species approval state
  - Returns success/error message

### Database Models

**Species Schema (`lib/models/Species.js`)**
```javascript
- nombre_cientifico: String (unique, required)
- nombre_comun: String
- categoria_lista_roja: String (conservation status)
- fotos: [String] (array of image URLs)
- foto_principal: String (primary image)
- descripcion: String
- reino, filo, clase, orden, familia: Taxonomy fields
- top_lugares: String (geographic locations)
- id_taxon_sis, inat_id, gbif_id: Third-party API identifiers
- json_completo: String (complete metadata)
- added_by: String (contributor email)
- state: String (pending/approved/rejected)
- timestamps: Auto-managed creation/update times
```

### Database Connections

**MongoDB Connection - Next.js (`lib/mongodb.js`)**
- Implements connection caching to prevent multiple connections
- Uses Mongoose for object modeling
- Handles connection errors gracefully
- Global singleton pattern

**MongoDB Connection - Express (`lib/mongodb-express.js`)**
- Separate connection for Express server
- Implements same caching strategy
- Direct MongoDB client usage

### API Utilities

**Client-Side API Utils (`lib/apiUtils.js`)**
- Centralized API call function
- Abstracts URL construction
- Differentiates between Next.js and Express endpoints
- Handles cross-origin requests

**Backend API Functions (`lib/api.js`)**
- Server-side API helper functions
- Wraps MongoDB queries
- Includes error handling and logging

## Authentication Flow

1. User clicks "Sign In" button
2. Redirected to Google OAuth login
3. NextAuth.js handles OAuth callback
4. User session stored and managed by NextAuth
5. Session token included in requests to protected routes
6. Admin routes validate session before processing

## Data Flow

### Viewing Species
1. User navigates to catalog
2. Frontend fetches species from Express API
3. API queries MongoDB with applied filters
4. Results returned with pagination metadata
5. Frontend renders species cards
6. User can click for detailed view

### Submitting Species
1. Authenticated user fills contribution form
2. Form submitted to `/api/species` endpoint
3. Backend validates fields
4. Entry stored with 'pending' state
5. Admin notified of pending approval
6. Upon approval, species becomes visible to public

## Production Deployment Architecture

### Process Orchestration (`start-prod.js`)
- Launches Express backend on port 3001
- Waits 5 seconds for MongoDB connection to establish
- Then launches Next.js frontend on port 3000
- Sequential startup prevents race conditions
- Logs "Express is ready!" when backend is functional
- Environment variable `EXPRESS_PORT` controls backend port

### Production Startup Flow
1. `npm start` → runs `start-prod.js`
2. Express server initializes and connects to MongoDB
3. Wait 5 seconds for stable connection
4. Next.js builds and starts (if not pre-built)
5. Frontend ready to proxy requests to Express backend

### Environment Configuration
**Production (Render):**
- `NODE_ENV=production`
- `EXPRESS_PORT=3001`
- `MONGODB_URI=<MongoDB Atlas connection>`
- `NEXTAUTH_SECRET=<secure session key>`
- `NEXTAUTH_URL=https://render-url.onrender.com`

**Development (Local):**
- `NODE_ENV=development`
- `EXPRESS_PORT=3001`
- `MONGODB_URI=<local or Atlas>`
- `.env.local` for overrides

### Render Deployment Configuration (`render.yaml`)
```yaml
services:
  - type: web
    name: web-dev-final-project
    env: node
    plan: free
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

## Performance Optimizations

### Filter Endpoint Optimization
**Problem**: Original implementation loaded all documents into memory
- Multiple `Species.find({})` queries without limits
- JSON parsing of complete documents
- Location extraction from all records
- Result: 5+ seconds response time

**Solution**: MongoDB aggregation pipeline with caching
- Single aggregation with `$facet` to get all distincts atomically
- No document loading into application memory
- Efficient database-side grouping and filtering
- In-memory cache with 5-minute TTL
- Result: 500-800ms first call, <1ms cached calls

### Request Retry Logic
- Handles slow Express startup in production
- Progressive timeout increase (prevents false negatives)
- Exponential backoff between retries
- Graceful degradation (empty filters rather than crash)
- Both `/api/species/filters` and `/filters-data` implement this

- Database connection failures are logged and caught
- API validation errors return appropriate HTTP status codes
- Client-side components display user-friendly error messages
- Server-side errors logged to console
- Try-catch blocks wrap critical operations
- Graceful fallbacks for missing data

## Security Implementation

- NextAuth.js manages session tokens
- API endpoints validate user sessions
- MongoDB credentials stored in environment variables
- CORS configured for allowed origins
- Input validation on form submissions
- Authorization checks for admin endpoints

## References

- Bootstrap carousel implementation: https://getbootstrap.com/docs/4.0/components/carousel/
- NextAuth setup: https://github.com/nextauthjs/next-auth-example
- Next.js documentation: https://nextjs.org/docs
- Express.js documentation: https://expressjs.com
- MongoDB documentation: https://docs.mongodb.com