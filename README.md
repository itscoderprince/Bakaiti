<div align="center">
  <h1>💬 Real-Time Chat Application</h1>
  <p>A robust, scalable, and full-stack chat platform built with modern web technologies.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  </p>
</div>

---

## ✨ Features

- **🔐 Secure Authentication**: JWT-based authentication stored in HTTP-only cookies, with passwords hashed using `bcryptjs`.
- **✉️ Direct Messaging**: Real-time ready backend capable of sending and retrieving message histories between users.
- **🛡️ Robust Validation**: Request payloads strongly validated using `Zod` before hitting controllers.
- **🚦 Centralized Error Handling**: Unified system to gracefully catch and format Database timeouts, invalid tokens, and validation errors.
- **📁 MVC Architecture**: Clean code separation handling models, views (soon), and controllers efficiently.

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Backend Framework** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT) |
| **Security** | bcryptjs, CORS, cookie-parser |
| **Validation** | Zod |
| **Package Manager**| pnpm |

## 📂 Folder Structure

```text
📦 server/
 ┣ 📂 config/        # Environment configurations
 ┣ 📂 controllers/   # Business logic (auth, messages)
 ┣ 📂 db/            # Database connection setup
 ┣ 📂 middlewares/   # Auth verification, error handling, validation
 ┣ 📂 models/        # Mongoose schemas (User, Message, Conversation)
 ┣ 📂 routes/        # API route definitions
 ┣ 📂 schemas/       # Zod validation schemas
 ┣ 📂 utils/         # Helper functions (AppError, ApiResponse)
 ┗ 📜 server.js      # Application entry point
```

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [pnpm](https://pnpm.io/) installed
- A running MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd "Chat App"/server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   MONOGDB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   pnpm run dev
   ```
   *The server will start on `http://localhost:5000`*

## 🛣️ API Endpoints

### User
- `POST /api/v1/user/signup` - Register a new user
- `POST /api/v1/user/login` - Login to account
- `POST /api/v1/user/logout` - Logout (Clears cookie)
- `GET /api/v1/user/profile` - Get current logged-in user profile

### Messages
- `POST /api/v1/message/send/:receiverId` - Send a message to a user
- `GET /api/v1/message/:userId` - Get conversation history with a user

---
<div align="center">
  <i>Built with ❤️ by Prince sharam</i>
</div>
