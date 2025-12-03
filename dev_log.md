# Development Log

## September 4 - Project Planning and Design

We discussed the major sections and structure of the project. We brainstormed content organization and page layout. We created the first design draft with color schemes and component hierarchy.

## September 8 - Design Refinement

**Bruno**: I revised the project color palette, since I felt that the one we had before did not communicate what the scope of our project was in the best way. I also reworked some of the look and feel of some components of the project.

## October 19 - Project Restructuring and Backend Setup

**Bruno**: I initialized the project restructuring, organized the folders according to best practices, and created the new server so the endpoint / returns the index.ejs file.

**Mateo**: I changed all the files to an EJS format so we could use them as templates.

## October 20 - API Integration

**Mateo**: I connected the server to the APIs so we could have the information to fill the templates.

## October 21 - Responsiveness and Interactivity

**Nicolás**: I implemented responsiveness to ensure the platform works seamlessly across all device sizes.

**Bruno**: I made the featured endangered species actually fetch data from our API and trimmed that to only 3 random records. I also added filters to the catalog page.

**Nicolás**: I changed the buttons and carousel to improve the overall interactivity and visual appeal.

## November 15-20 - Major Technology Stack Migration to React

We decided to migrate the entire project from EJS templates to a modern React with Next.js. This was a major milestone that required complete restructuring.

**Bruno**: I led the architecture redesign and oversaw the migration to Next.js 16 framework. I restructured the folder organization for React architecture and managed the component redesign process. We redesigned all UI components using React best practices.

**Mateo**: I managed the component structure and prepared the API integration for the new React-based system. I ensured that all the backend logic would work seamlessly with the new frontend.

**Nicolás**: I ensured responsive design implementation with Bootstrap 5 styling throughout the new React interface. I refined all design elements to work with the new React-based interface.

We all contributed to updating all templates to React components and implementing responsive Bootstrap 5 styling.

## November 21 - Database Setup and Mongoose Schema

**Mateo**: I designed and created the comprehensive MongoDB database structure with Mongoose ODM. I implemented the Species collection schema with 15+ fields including taxonomic information, conservation status, and user contribution tracking. I set up proper indexing for scientific names, timestamp management (createdAt, updatedAt), and support for the approval workflow states (pending, approved, rejected).

## November 23 - API Development and Advanced Filtering

**Bruno**: I worked on designing the API architecture and the complex filtering logic. I developed the advanced query building system that handles multi-criteria filtering.

**Mateo**: I implemented the complete REST API with Express.js backend. I created:
- GET /api/species with pagination and filtering
- POST /api/species for species submissions
- GET /api/species/filters for dynamic filter options

I built the complex query system that supports taxonomic filters (reino, filo, clase, orden, familia), location-based filtering with accent handling, and search by scientific and common names.

**Nicolás**: I ensured the frontend filtering interface worked smoothly with the backend API, optimizing the user experience.

## November 25 - MongoDB Connection and Data Persistence

**Mateo**: I successfully integrated MongoDB Atlas with the application. I implemented connection caching to prevent multiple connections and set up Mongoose connection pooling. I configured proper error handling for database operations and established reliable connections from both the Next.js and Express servers. I tested data persistence across sessions to ensure everything works correctly.

## November 27 - Google Authentication and Admin Panel

**Bruno**: I led the implementation of the authentication system and admin features. I worked on the overall architecture for user authentication and session management.

**Mateo**: I integrated NextAuth.js with Google OAuth 2.0 and set up secure session management. I created the species submission workflow with the approval system (approve/reject/pending states).

**Nicolás**: I designed and implemented the user interface for both the user profile page and the admin dashboard. I created the approval workflow interface and ensured the UI was intuitive for admin use.

We all secured the admin endpoints with proper authorization to ensure only administrators can approve or reject contributions.

## November 28 - Comprehensive Testing

We conducted full testing of all project features and components:

**Bruno**: I tested the user authentication flow and verified that the approval workflow worked correctly.

**Mateo**: I tested the API endpoints, verified database connections and data persistence, and tested the species submission and retrieval functionality.

**Nicolás**: I tested the responsive design on multiple devices, verified the user interface responsiveness, and ensured all visual elements worked correctly across different screen sizes.

We all participated in testing:
- User authentication flow
- Species browsing and filtering functionality
- User contribution submission process
- Admin approval workflow
- Responsive design on mobile and desktop
- API endpoints and error handling
- Session management across page navigation
- Fixed and refined any issues discovered

## December 1 - Final Documentation and Completion

We completed the comprehensive final documentation of our project. We created all documentation ourselves (Bruno, Mateo, and Nicolás), and we asked for AI assistance to help us organize it better, structure it professionally, and ensure completeness. The documentation includes:

- README with installation and running instructions
- Technical code explanation documenting all components and architecture
- Development log recording the complete project timeline (this file)
- Conclusion document with challenges, solutions, and design decisions
- Real-world applications analysis
- Personal reflections from all three team members

## December 3 - Production Optimization and Render Deployment

**Mateo**: I optimized the application for production deployment on Render. Key improvements:

### Production Architecture
- **Dual-Process Model**: `start-prod.js` orchestrates both Express backend (port 3001) and Next.js frontend (port 3000)
- **MongoDB**: Connected via MongoDB Atlas with connection pooling and proper error handling
- **Caching Strategy**: 5-minute in-memory cache for filter options to reduce database queries

### Performance Optimizations
1. **Filter Endpoint Optimization**:
   - Changed from loading all documents into memory to using MongoDB aggregation pipeline ($facet)
   - Reduced query time from 5+ seconds to 500-800ms on first call
   - Implemented in-memory caching with 5-minute TTL for subsequent calls
   - Uses simplified state list (32 Mexican states) instead of parsing all documents

2. **Next.js Routing Configuration**:
   - Fixed critical issue where `next.config.mjs` rewrites were intercepting /api/* routes before Next.js could process them
   - Restructured rewrites with `beforeFiles` (specific endpoints) and `afterFiles` (catch-all to Express)
   - Created `/filters-data` endpoint outside /api path to avoid rewrite interception

3. **Request Retry Logic**:
   - Implemented exponential backoff with progressive timeouts (3-6.6 seconds)
   - 12 retry attempts with progressive delays (200ms initial, +100ms each attempt)
   - Graceful fallback to empty filter arrays if all retries fail

### Key Files for Production
- `server.js`: Express backend with optimized filter aggregation and MongoDB connection
- `start-prod.js`: Production startup script with proper port configuration and startup delays
- `next.config.mjs`: Route rewrites for Express proxying with corrected logic
- `app/filters-data/route.js`: Fast filter endpoint with retry logic
- `lib/api.js`: Client-side API utilities with conditional host resolution
- `render.yaml`: Render deployment configuration

### Environment Configuration
- `EXPRESS_PORT=3001`: Backend server port
- `MONGODB_URI`: MongoDB Atlas connection string (from Render secrets)
- `NEXTAUTH_SECRET`: NextAuth.js session secret (from Render secrets)
- `NODE_ENV=production`: Enables production-specific optimizations

### Debugging and Monitoring
- Server logs include timestamps and operation counters
- Filter endpoint logs show aggregation results: reinos, filos, clases, ordenes, familias, statuses counts
- Retry attempts are logged to trace connection issues
- Cache hit/miss is logged for monitoring optimization effectiveness

### Deployment Flow
1. Render auto-deploys on git push to main
2. Start-prod.js waits 5 seconds for Express MongoDB connection
3. Express startup logs confirm "[Warmup] ✓ Express is ready!"
4. Next.js then starts and can proxy requests to Express
5. Filter endpoints respond with 500-800ms latency (first call), then instant with cache

This optimization ensures the application performs well in production while maintaining all functionality across local development and Render deployment.