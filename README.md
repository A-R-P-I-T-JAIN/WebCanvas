# WebCanvas - Interactive Web Development Environment

## Problem Statement
WebCanvas addresses the challenge of creating an integrated development environment for web development that combines code editing, real-time preview, and collaborative features. Traditional development setups often require multiple tools and configurations, making it difficult for developers to quickly prototype and test web applications.

## Approach & Solution
WebCanvas provides a modern, browser-based development environment that integrates:
- A powerful code editor with syntax highlighting
- Real-time preview capabilities
- Interactive canvas for visual development
- Terminal access for command-line operations
- File system management
- Collaborative features for team development

## Features
- **Integrated Development Environment**
  - Monaco Editor integration for advanced code editing
  - Real-time preview of web applications
  - Terminal access for command-line operations
  - File system management
  
- **Visual Development**
  - Interactive canvas for visual development
  - Excalidraw integration for diagrams and sketches
  - Drag-and-drop interface for components
  
- **Collaboration**
  - Real-time collaboration features
  - User authentication and authorization
  - Project sharing capabilities
  
- **Developer Experience**
  - Syntax highlighting
  - Code completion
  - Multiple theme support
  - Responsive design

## Tech Stack
### Frontend
- React 18
- Vite
- TailwindCSS
- Monaco Editor
- Excalidraw
- GSAP for animations
- Framer Motion
- React Router DOM
- Clerk for authentication

### Backend
- Node.js
- Express.js
- WebSocket for real-time features
- File system operations
- Environment configuration

### Development Tools
- ESLint for code linting
- PostCSS for CSS processing
- Vite for build tooling
- Git for version control

## Run Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Frontend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with necessary environment variables
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the Backend directory with necessary environment variables
4. Start the backend server:
   ```bash
   npm start
   ```

### Accessing the Application
- Frontend will be available at: `http://localhost:5173`
- Backend API will be available at: `http://localhost:3000`

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.
