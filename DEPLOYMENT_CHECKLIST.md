# Quick Deployment Checklist

Use this checklist while deploying. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Pre-deployment
- [x] Code updated with environment variables
- [x] All files committed to GitHub
- [ ] `.env` configured locally (if testing)
- [ ] API keys ready (GROQ_API_KEY)

## Backend (Render)
- [ ] Create Render account
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set environment variables:
  - [ ] GROQ_API_KEY
  - [ ] GOOGLE_API_KEY (optional)
  - [ ] ALLOWED_ORIGINS (will update later)
  - [ ] ENVIRONMENT=production
- [ ] Deploy and wait for completion
- [ ] Copy backend URL: `________________`
- [ ] Test health endpoint: /health

## Frontend (Vercel)
- [ ] Create Vercel account
- [ ] Create new Project
- [ ] Import GitHub repository
- [ ] Set Root Directory: `gcc-hiring-frontend`
- [ ] Set environment variables:
  - [ ] VITE_API_BASE_URL=https://your-backend.onrender.com
  - [ ] VITE_WS_BASE_URL=wss://your-backend.onrender.com
- [ ] Deploy and wait for completion
- [ ] Copy frontend URL: `________________`

## Post-deployment
- [ ] Update Render ALLOWED_ORIGINS with Vercel URL
- [ ] Wait for Render to redeploy
- [ ] Test full application flow
- [ ] Verify WebSocket interview works

## Testing
- [ ] Home page loads
- [ ] User registration
- [ ] Application form
- [ ] Aptitude quiz
- [ ] DSA quiz
- [ ] **HR Interview (WebSocket)** Critical
- [ ] Chatbot
- [ ] Profile page

---

**Estimated Time**: 30-40 minutes
**Deployment Date**: _______________
**URLs**:
- Backend: _______________
- Frontend: _______________
