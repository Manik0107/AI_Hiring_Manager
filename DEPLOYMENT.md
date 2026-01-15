# Deployment Guide - AI Hiring Manager

This guide will help you deploy your AI Hiring Manager application to production.

## Architecture
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (FastAPI with WebSocket support)

## Quick Start

### 1. Deploy Backend to Render

1. **Create Account**: Go to [render.com](https://render.com) and sign up
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect Repository**: Select your `AI_Hiring_Manager` GitHub repo
4. **Configure**:
   - Name: `ai-hiring-manager-backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** (in Render dashboard):
   ```
   GROQ_API_KEY=<your-groq-key>
   GOOGLE_API_KEY=<your-google-key>
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ENVIRONMENT=production
   PYTHON_VERSION=3.11
   ```
6. **Deploy** and wait 5-10 minutes
7. **Save your URL**: `https://your-backend.onrender.com`

### 2. Deploy Frontend to Vercel

1. **Create Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **New Project**: Click "Add New..." → "Project"
3. **Import Repository**: Select your `AI_Hiring_Manager` repo
4. **Configure**:
   - Framework: Vite
   - Root Directory: `gcc-hiring-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_WS_BASE_URL=wss://your-backend.onrender.com
   ```
   **Important**: Use `wss://` (not `ws://`) for WebSocket URL
6. **Deploy** and wait 2-5 minutes
7. **Save your URL**: `https://your-app.vercel.app`

### 3. Update CORS Settings

1. Go back to **Render Dashboard**
2. Update `ALLOWED_ORIGINS` environment variable:
   ```
   https://your-app.vercel.app,http://localhost:5173
   ```
3. Render will auto-redeploy

## Testing Checklist

- [ ] Backend health check: `https://your-backend.onrender.com/health`
- [ ] Frontend loads successfully
- [ ] User registration works
- [ ] Application form submission works
- [ ] Aptitude quiz completes
- [ ] DSA quiz completes
- [ ] HR Interview WebSocket connection works **Critical**
- [ ] Chatbot responds to messages
- [ ] Profile page shows correct status

## Troubleshooting

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your exact Vercel URL
- Check for trailing slashes

### WebSocket Failed
- Ensure `VITE_WS_BASE_URL` uses `wss://` (not `ws://`)
- Check Render logs for errors

### API Not Responding
- Verify backend is running (green status in Render)
- Test health endpoint directly
- Check environment variables are set

### 502 Bad Gateway
- Check Render logs for Python errors
- Verify `GROQ_API_KEY` is set correctly
- Ensure all dependencies are in `requirements.txt`

## File Structure

```
AI_Hiring_Manager/
├── api/                      # FastAPI backend
├── core/                     # Core business logic
├── gcc-hiring-frontend/      # React frontend
│   ├── src/
│   ├── package.json
│   └── .env.example
├── requirements.txt          # Python dependencies
├── render.yaml              # Render config
└── .env.example             # Backend env vars
```

## Environment Variables Reference

### Backend (.env)
```bash
GROQ_API_KEY=your_groq_key
GOOGLE_API_KEY=your_google_key
ALLOWED_ORIGINS=https://your-frontend.vercel.app
ENVIRONMENT=production
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_WS_BASE_URL=wss://your-backend.onrender.com
```

## Auto-Deployment

Both platforms auto-deploy on git push to `main`:
```bash
git add .
git commit -m "Update features"
git push origin main
```

## Custom Domains (Optional)

**Vercel**:
1. Project Settings → Domains
2. Add your domain
3. Follow DNS instructions

**Render**:
1. Service Settings → Custom Domain
2. Add your domain
3. Update DNS records

## Cost Estimation

- **Render**: Free tier available (with limitations)
- **Vercel**: Free tier for personal projects

## Need Help?

Check logs:
- **Render**: Dashboard → Logs
- **Vercel**: Deployments → Function Logs

## Estimated Time
Total deployment: **30-40 minutes**

---

Good luck with your deployment!
