# AI Agent - Collaborative Development Platform

A full-stack MERN application that enables real-time collaborative development with AI assistance. This platform allows developers to create projects, collaborate with team members, and leverage AI-powered code generation using Google's Gemini AI, all within an in-browser development environment powered by WebContainer.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with Redis token blacklisting
- **Project Management**: Create and manage multiple development projects
- **Real-time Collaboration**: Live chat and code synchronization using Socket.io
- **AI Code Generation**: Integrated Google Gemini AI for intelligent code generation and assistance
- **In-Browser IDE**: WebContainer-powered code editor with syntax highlighting
- **Live Preview**: Run and preview Node.js applications directly in the browser
- **File Management**: Create, edit, and manage project files in real-time

### AI Capabilities
- **@ai Command**: Mention `@ai` in chat to trigger AI assistance
- **Code Generation**: Generate complete file structures with proper configurations
- **MERN Stack Expert**: AI trained specifically for MERN stack development
- **Best Practices**: AI follows industry best practices and handles edge cases
- **Modular Code**: Generates clean, maintainable, and well-commented code

## 🏗️ Architecture

### Technology Stack

#### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io 4.8.1
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Caching**: Redis (ioredis) for token blacklisting
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **Validation**: express-validator
- **Logging**: Morgan

#### Frontend
- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.4.1
- **Styling**: Tailwind CSS 3.4.17
- **HTTP Client**: Axios 1.8.4
- **Real-time**: Socket.io Client 4.8.1
- **Code Editor**: WebContainer API 1.5.3
- **Syntax Highlighting**: Highlight.js 11.11.1
- **Markdown Rendering**: markdown-to-jsx 7.7.4
- **Icons**: Remix Icon 4.6.0

### Project Structure

```
AI_Agent/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── aiController.js
│   │   ├── projectController.js
│   │   └── userController.js
│   ├── db/                   # Database configuration
│   │   └── db.js
│   ├── middleware/           # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/               # Mongoose schemas
│   │   ├── projectModel.js
│   │   └── userModel.js
│   ├── routes/               # API routes
│   │   ├── aiRoutes.js
│   │   ├── projectRouter.js
│   │   └── userRouter.js
│   ├── services/             # Business logic
│   │   ├── aiService.js
│   │   ├── projectService.js
│   │   ├── redisServices.js
│   │   └── userServices.js
│   ├── .env                  # Environment variables
│   ├── app.js                # Express app configuration
│   ├── server.js             # Server entry point with Socket.io
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/           # Static assets
    │   ├── auth/             # Authentication utilities
    │   ├── config/           # Configuration files
    │   │   ├── axios.js      # Axios instance setup
    │   │   ├── socket.js     # Socket.io client setup
    │   │   └── webContainer.js
    │   ├── context/          # React Context providers
    │   │   └── userContext.jsx
    │   ├── routes/           # Route definitions
    │   │   └── AppRoutes.jsx
    │   ├── screens/          # Page components
    │   │   ├── Home.jsx      # Project dashboard
    │   │   ├── Login.jsx     # Login page
    │   │   ├── Register.jsx  # Registration page
    │   │   └── Project.jsx   # Main IDE interface
    │   ├── App.jsx           # Root component
    │   ├── main.jsx          # Application entry point
    │   └── index.css         # Global styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 📊 Database Schema

### User Model
```javascript
{
  email: String (unique, lowercase, 6-50 chars),
  password: String (hashed with bcrypt)
}
```

### Project Model
```javascript
{
  name: String (unique, lowercase, trimmed),
  users: [ObjectId] (references User model)
}
```

## 🔌 API Endpoints

### User Routes (`/users`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `GET /logout` - Logout user (protected)
- `GET /all` - Get all users (protected)

### Project Routes (`/projects`)
- `POST /create` - Create new project (protected)
- `GET /all` - Get all user projects (protected)
- `PUT /add` - Add collaborators to project (protected)
- `GET /get-project/:projectId` - Get project details (protected)

### AI Routes (`/ai`)
- AI endpoints for code generation and assistance

## 🔐 Authentication Flow

1. **Registration**: User provides email and password (min 6 chars)
2. **Password Hashing**: bcrypt hashes password with salt rounds of 10
3. **JWT Generation**: Server generates JWT token with user email
4. **Token Storage**: Token stored in cookies and/or Authorization header
5. **Protected Routes**: authMiddleware validates JWT and checks Redis blacklist
6. **Logout**: Token added to Redis blacklist for security

## 🤖 AI Integration

### Google Gemini AI Configuration
- **Model**: gemini-1.5-flash
- **Response Format**: JSON
- **System Instruction**: MERN stack expert with 10 years experience
- **Capabilities**:
  - Generates modular, well-commented code
  - Creates complete file structures
  - Provides build and start commands
  - Handles edge cases and errors
  - Follows best practices

### AI Response Format
```json
{
  "text": "Description of generated code",
  "fileTree": {
    "filename.js": {
      "file": {
        "contents": "file content here"
      }
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["app.js"]
  }
}
```

## 🌐 Real-time Features

### Socket.io Implementation

#### Server-side (backend/server.js)
- **Authentication Middleware**: Validates JWT before Socket connection
- **Project Rooms**: Each project has a dedicated Socket.io room
- **AI Message Detection**: Automatically detects `@ai` mentions
- **Message Broadcasting**: Broadcasts messages to all room participants

#### Client-side (frontend/src/config/socket.js)
- **Auto-reconnection**: Maintains persistent connection
- **Project-based Rooms**: Joins specific project rooms
- **Message Handling**: Sends and receives real-time messages
- **FileTree Sync**: Synchronizes generated code across clients

## 💻 WebContainer Integration

### Features
- **In-browser Node.js**: Run Node.js applications directly in the browser
- **File System**: Virtual file system for project files
- **Package Management**: npm install and run commands
- **Live Server**: Automatic server preview with hot reload
- **Code Execution**: Execute JavaScript/Node.js code safely

### Usage Flow
1. AI generates file structure
2. WebContainer mounts the file tree
3. Run `npm install` to install dependencies
4. Execute `npm start` to run the application
5. Preview output in embedded iframe

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Redis server
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ai_agent
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Start Redis server**
   ```bash
   redis-server
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

6. **Run the server**
   ```bash
   node server.js
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   ```
   http://localhost:5173
   ```

## 🎯 Usage Guide

### Getting Started

1. **Register an Account**
   - Navigate to the registration page
   - Provide email and password (min 6 characters)
   - Click "Register"

2. **Create a Project**
   - Click "New Project" on the home page
   - Enter a unique project name
   - Click "Create"

3. **Add Collaborators**
   - Open a project
   - Click "Add Collaborator"
   - Select users from the list
   - Click "Add Collaborators"

4. **Use AI Assistance**
   - In the project chat, type `@ai` followed by your request
   - Example: `@ai create an express server with MongoDB`
   - AI will generate the code structure
   - Files will appear in the file explorer

5. **Run Generated Code**
   - Click on files in the explorer to view/edit
   - Click "Run" button to execute the code
   - View output in the embedded preview

### AI Command Examples

```
@ai create a REST API with user authentication
@ai build a React component for a todo list
@ai create an Express server with MongoDB connection
@ai generate a CRUD API for blog posts
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Token Blacklisting**: Redis-based logout mechanism
- **Input Validation**: express-validator for all inputs
- **CORS Protection**: Configured CORS middleware
- **Environment Variables**: Sensitive data in .env files

## 🚦 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai_agent
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 📦 Dependencies

### Backend Dependencies
- `@google/generative-ai`: ^0.24.0 - Google Gemini AI integration
- `bcrypt`: ^5.1.1 - Password hashing
- `cookie-parser`: ^1.4.7 - Cookie parsing middleware
- `cors`: ^2.8.5 - CORS middleware
- `dotenv`: ^16.4.7 - Environment variable management
- `express`: ^5.1.0 - Web framework
- `express-validator`: ^7.2.1 - Input validation
- `ioredis`: ^5.6.0 - Redis client
- `jsonwebtoken`: ^9.0.2 - JWT authentication
- `mongoose`: ^8.13.1 - MongoDB ODM
- `morgan`: ^1.10.0 - HTTP request logger
- `socket.io`: ^4.8.1 - Real-time communication

### Frontend Dependencies
- `@webcontainer/api`: ^1.5.3 - In-browser Node.js runtime
- `axios`: ^1.8.4 - HTTP client
- `highlight.js`: ^11.11.1 - Syntax highlighting
- `markdown-to-jsx`: ^7.7.4 - Markdown rendering
- `react`: ^19.0.0 - UI library
- `react-dom`: ^19.0.0 - React DOM renderer
- `react-router-dom`: ^7.4.1 - Routing
- `socket.io-client`: ^4.8.1 - Socket.io client
- `tailwindcss`: ^3.4.17 - Utility-first CSS

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **Redis Connection Error**
   - Start Redis server: `redis-server`
   - Check Redis host and port in .env

3. **Socket.io Connection Failed**
   - Verify backend server is running
   - Check CORS configuration
   - Ensure JWT token is valid

4. **WebContainer Not Loading**
   - Check browser compatibility (Chrome/Edge recommended)
   - Clear browser cache
   - Ensure HTTPS in production

5. **AI Not Responding**
   - Verify GEMINI_API_KEY is set correctly
   - Check API quota limits
   - Review console for error messages

## 🎨 UI Features

- **Responsive Design**: Works on desktop and tablet devices
- **Dark Code Editor**: Monokai theme for comfortable coding
- **Syntax Highlighting**: Language-aware code coloring
- **File Tabs**: Multiple file editing with tab interface
- **Live Chat**: Real-time messaging with collaborators
- **Modal Dialogs**: Clean UI for user selection and project creation
- **Scrollable Areas**: Smooth scrolling for messages and code

## 🔄 Development Workflow

1. **Code Generation**: Request code from AI
2. **File Creation**: AI generates file structure
3. **WebContainer Mount**: Files loaded into virtual filesystem
4. **Dependency Installation**: npm install runs automatically
5. **Code Execution**: npm start launches the application
6. **Live Preview**: View output in embedded iframe
7. **Collaboration**: Share and edit with team members in real-time

## 📝 License

This project is open-source and available for educational and commercial use.

## 👥 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📧 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting section

## 🎓 Learning Resources

This project demonstrates:
- Full-stack MERN development
- Real-time WebSocket communication
- AI integration in web applications
- JWT authentication patterns
- Redis caching strategies
- WebContainer API usage
- Modern React patterns (Hooks, Context)
- RESTful API design

---

**Built with ❤️ using the MERN Stack**
