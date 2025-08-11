# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Lumen Concert Map - Interactive concert tour visualization application for the band Lumen, designed for Vercel deployment with dynamic data fetching from concert sources.

## Tech Stack
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: Leaflet with React-Leaflet
- **Database**: Vercel Blob Storage (JSON files)
- **Validation**: Zod schemas
- **Deployment**: Vercel

## Project Structure
```
/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main map page
│   ├── layout.tsx         # Root layout
│   └── api/               
│       └── concerts/      # Concert data endpoint
├── components/            
│   ├── Map/              # Map component with markers
│   ├── ConcertList/      # Concert listing sidebar
│   ├── Stats/            # Tour statistics
│   └── Controls/         # Filter controls
├── lib/                   
│   ├── data/             # Data fetching and parsing
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
└── config/               # Configuration files
```

## Key Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3007
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler check
npm run seed       # Seed Blob Storage with initial data
```

### Testing
```bash
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:e2e   # Run end-to-end tests
```

### Deployment
```bash
vercel            # Deploy to Vercel (requires CLI)
vercel --prod     # Deploy to production
```

## Architecture Decisions

### Data Fetching Strategy
- **Server-side**: API routes handle web scraping to bypass CORS
- **Caching**: ISR (Incremental Static Regeneration) with 1-hour revalidation
- **Fallback**: Static concert data for resilience

### Component Architecture
- **Server Components**: Default for better performance
- **Client Components**: Only for interactive elements (map, filters)
- **Suspense Boundaries**: For progressive loading

### State Management
- URL state for filters (searchParams)
- React Context for global app state
- Local state for component-specific UI

## Key Features to Maintain

### Dynamic Concert Data
- Fetches from multiple sources (primary: Yandex.Afisha)
- Graceful fallback to cached/static data
- Updates every hour via ISR

### Map Functionality
- Interactive markers for each concert
- Route visualization between cities
- Popup details on marker click
- Filter by concert status (past/future)

### Performance Optimizations
- Dynamic imports for heavy libraries (Leaflet)
- Image optimization with next/image
- Font optimization with next/font
- API response caching

## Environment Variables
```env
# .env.local
BLOB_READ_WRITE_TOKEN=your_blob_token_from_vercel
ADMIN_PASSWORD=your_secure_password_here
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
NEXT_PUBLIC_MAP_TOKEN=your_map_token_if_needed
```

## Common Development Tasks

### Managing Concert Data
1. **Add concert**: Use admin panel at `/admin` or POST to `/api/admin/concerts`
2. **Update concert**: PUT to `/api/admin/concerts/[id]`
3. **Delete concert**: DELETE to `/api/admin/concerts/[id]`
4. **Seed database**: POST to `/api/admin/seed` or use admin panel

### Database Schema Changes
1. Update Zod schemas in `lib/types/database.ts`
2. Modify storage utilities in `lib/blob/storage.ts`
3. Update API routes in `app/api/` folders
4. Test with TypeScript: `npm run type-check`

### Adding New Cities/Venues
1. Use admin panel or directly modify seed data
2. Update `app/api/admin/seed/route.ts` for permanent additions
3. Re-seed database with new data

## Deployment Checklist
- [ ] Environment variables set in Vercel dashboard
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript has no errors (`npm run type-check`)
- [ ] Tests pass (`npm test`)
- [ ] Lighthouse score > 90 for performance

## Important Patterns

### Error Handling
- Use error boundaries for component failures
- Implement retry logic for API calls
- Show user-friendly error messages
- Log errors to monitoring service

### Data Validation
- Validate scraped data with Zod schemas
- Sanitize user inputs
- Type-check API responses

### SEO Optimization
- Dynamic metadata based on concerts
- Structured data for events
- Open Graph tags for sharing
- Sitemap generation

## Troubleshooting

### CORS Issues
- Ensure data fetching happens server-side
- Use API routes as proxy
- Never expose scraping logic to client

### Map Not Loading
- Check Leaflet CSS is imported
- Verify dynamic import is working
- Ensure container has defined height

### Data Not Updating
- Check ISR revalidation settings
- Verify scraping endpoints are accessible
- Review cache headers in API responses