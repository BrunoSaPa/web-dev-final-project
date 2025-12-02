# Code Explanation

## Architecture Overview

This project implements a full MERN stack (MongoDB, Express, React, Node.js) architecture with a dual-server setup: Next.js for the frontend and Express for the backend API.

## Frontend Components

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

- GET `/api/species/filters`: Returns available filter options
  - Aggregates unique values from database
  - Returns options for all filter types

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

## Error Handling

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