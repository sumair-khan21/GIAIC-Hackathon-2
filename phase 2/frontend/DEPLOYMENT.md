# Environment Variables Setup for Vercel

## Required Environment Variables

Add these in your **Vercel Project Settings → Environment Variables**:

### 1. Backend API URL
```
NEXT_PUBLIC_API_URL=https://sums2121-todo-backend.hf.space
```

### 2. Better Auth Secret
Generate a secure random string (at least 32 characters):
```
BETTER_AUTH_SECRET=<your-secure-random-secret>
```

### 3. Better Auth URL
Your Vercel deployment URL:
```
BETTER_AUTH_URL=https://giaic-hackathon-todo.vercel.app
```

## How to Set in Vercel:
1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Click on **Environment Variables**
4. Add each variable with its value
5. Select **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. **Redeploy** your application

## Generate Secure Secret
Use this command to generate a secure secret:
```bash
openssl rand -base64 32
```
