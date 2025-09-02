# POAM Tracker Next

**Advanced Plan of Action and Milestones tracking system for comprehensive vulnerability management and security operations.**

Created by **Jeremiah P.**

This is a Next.js-based POAM (Plan of Action and Milestones) tracker built with modern web technologies to provide enterprise-grade security management capabilities.

## Architecture

This application uses a **dual-service architecture**:

- **Frontend**: Next.js application (port 3000)
- **Backend**: NestJS API service (port 3001)

### API Migration Status

✅ **Completed**: All Next.js API routes have been converted to proxy requests to the NestJS backend:
- Users management (`/api/users/*`)
- Packages management (`/api/packages/*`)
- Systems management (`/api/systems/*`)
- Groups management (`/api/groups/*`)
- Authentication (`/api/auth/*`)
- Teams management (`/api/teams/*`)
- Dashboard stats (`/api/dashboard/*`)
- Vulnerabilities (`/api/vulnerabilities/*`)
- STIG findings (`/api/systems/[id]/stig/*`)

## Getting Started

### Prerequisites

1. Copy environment configuration:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
BACKEND_URL=http://localhost:3001
JWT_SECRET=your-jwt-secret-key-here
```

### Running the Application

**Option 1: Both services simultaneously**
```bash
# Install dependencies for both frontend and backend
npm install
cd backend && npm install && cd ..

# Run both services (requires two terminals)
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend  
npm run dev
```

**Option 2: Development mode**
```bash
npm run dev        # Frontend (port 3000)
cd backend && npm run start:dev  # Backend (port 3001)
```

### Service URLs
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)

### API Migration Details

All Next.js API routes have been converted to proxy requests to the NestJS backend using the `/lib/backend-api.ts` utility. Key changes:

1. **Authentication**: JWT tokens are extracted from requests and forwarded to backend
2. **Error Handling**: Standardized error responses using `BackendApiError` class
3. **Request Forwarding**: All API calls are proxied to `BACKEND_URL` (default: http://localhost:3001)

### Migration Validation Checklist

- ✅ **Core API routes** (users, packages, systems, groups)
- ✅ **Authentication flows** (login, logout, CSRF)
- ✅ **Dashboard and statistics** endpoints
- ✅ **Vulnerability and STIG management** 
- ✅ **Environment configuration** setup
- ✅ **Backend URL configuration**
- ✅ **Production build** passes successfully
- ✅ **TypeScript errors** resolved in API layer
- ⚠️ **Remaining**: POAMs, Knowledge Center, STPs (will use backend when controllers are implemented)

### Build Status

✅ **Production build successful** - All 46 API routes converted and building properly

### Troubleshooting

**Backend Connection Issues:**
1. Ensure NestJS backend is running on port 3001
2. Check `BACKEND_URL` in `.env` file
3. Verify CORS configuration in backend allows frontend URL

**Authentication Issues:**
1. Ensure `JWT_SECRET` matches between frontend and backend
2. Check cookie settings (httpOnly, secure, sameSite)
3. Verify token extraction logic in `lib/backend-api.ts`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
