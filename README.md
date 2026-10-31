# Connectly — Social Media Platform

**Connectly** is a full-stack social media application that allows users to create accounts, share posts, interact with other users, and build social connections. It provides an interactive social networking experience with authentication, a personalized feed, user profiles, and post engagement.

## Live Demo

🌐 **Application:** https://connectly-ashen-three.vercel.app/

⚙️ **Backend API:** https://connectly-api-sh3c.onrender.com/

## Features

- **User Authentication:** Register and log in securely using password hashing and JWT authentication.
- **Create Posts:** Publish text-based posts.
- **Social Feed:** View posts shared by users.
- **Like and Unlike Posts:** Interact with posts.
- **Comments:** Add and view comments on posts.
- **Explore:** Search posts by content or author name.
- **User Profiles:** View profile information and personal posts.
- **Follow and Unfollow:** Build connections with other users.
- **Followers and Following:** View follower and following counts and lists.
- **Suggested Users:** Discover other users to follow.
- **Responsive Interface:** Navigate the application through a social-media-style layout.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- React Router
- Fetch API

### Backend
- Node.js
- Express.js
- REST API
- JSON Web Tokens (JWT)
- bcryptjs

### Database
- MongoDB Atlas
- Mongoose

### Deployment
- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

## Project Structure

```text
CodeAlpha_Connectly/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or MongoDB database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Elizabethdebebe1234/CodeAlpha_Connectly.git
cd CodeAlpha_Connectly
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`.

### 3. Configure the frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/posts` | Retrieve posts |
| POST | `/api/posts` | Create a post |
| POST | `/api/posts/:id/like` | Like or unlike a post |
| POST | `/api/posts/:id/comments` | Add a comment |
| GET | `/api/users/me` | Retrieve the current user's profile |
| GET | `/api/users/suggestions` | Retrieve suggested users |
| POST | `/api/users/:id/follow` | Follow or unfollow a user |
| GET | `/api/health` | Check API health |

Protected routes require a valid JWT token.

## Security

- Passwords are hashed using bcryptjs.
- JWT authentication protects private API routes.
- Sensitive configuration is stored in environment variables.
- Environment files are excluded from version control.

## Future Improvements

- Direct messaging.
- Dedicated notification system.
- Image and video uploads.
- Real-time interactions.
- Additional profile customization.

## Developer

**Elizabeth Debebe**

- GitHub: [Elizabethdebebe1234](https://github.com/Elizabethdebebe1234)
- Project Repository: [CodeAlpha_Connectly](https://github.com/Elizabethdebebe1234/CodeAlpha_Connectly)

## Internship

Developed as part of the **CodeAlpha Full Stack Development Internship**.
