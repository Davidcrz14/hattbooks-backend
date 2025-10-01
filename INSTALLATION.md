# 🚀 Installation Guide - HattBooks Backend

## Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)
- npm or yarn

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hattbooks-backend.git
cd hattbooks-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your variables:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/hattbooks
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Optional (for Auth0 social login)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.yourdomain.com
```

**Generate secure JWT secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Add it to `.env` as `MONGODB_URI`

### 5. (Optional) Create dev user

```bash
npm run seed:dev
```

This creates a test user with:
- Email: `dev@hattbooks.com`
- Username: `devuser`
- Auth0 ID: `auth0|dev-user-123`

### 6. Start the server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

## 📖 API Documentation

Once the server is running, access the API documentation at:

- **Interactive Docs**: http://localhost:5000/api/docs
- **OpenAPI JSON**: http://localhost:5000/api/openapi.json

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test
```

## 📝 Available Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run seed:dev # Create development user (needs to be added to package.json)
```

## 🔧 Troubleshooting

### MongoDB Connection Error

If you see:
```
MongoDB Connection Failed: connect ECONNREFUSED
```

**Solutions:**
1. Make sure MongoDB is running locally
2. Check your `MONGODB_URI` in `.env`
3. Verify network connectivity to MongoDB Atlas

### Port Already in Use

If port 5000 is in use:
```bash
# Change PORT in .env
PORT=3000
```

### Auth0 Errors

Auth0 is **optional**. If not configured:
- Local email/password authentication still works
- Use `/api/auth/register-local` and `/api/auth/login-local` endpoints

## 🔐 Security Notes

⚠️ **NEVER commit `.env` to version control**

⚠️ **In production:**
- Use strong JWT secrets (64+ characters)
- Enable HTTPS
- Configure proper CORS origins
- Use environment variables for all secrets
- Rotate secrets regularly

## 📚 Next Steps

1. Read the [API Documentation](http://localhost:5000/api/docs)
2. Test endpoints with the included [Postman Collection](./HattBooks_API.postman_collection.json)
3. Check the [README](./README.MD) for project roadmap

## 🐛 Issues?

Create an issue on GitHub with:
- Environment details (Node version, OS)
- Error messages
- Steps to reproduce
