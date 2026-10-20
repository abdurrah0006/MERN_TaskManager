# Project Manager — MERN Task Board

A full-stack project and task manager with a **React/Vite frontend**, **Express/Node.js API**, **MongoDB**, and **Socket.IO** for live board updates.

## Features

- Register and sign in
- Create and open projects
- Organize project tasks into status columns
- Add task titles and descriptions
- Move tasks between columns to update status
- Add comments and receive live task/comment updates
- Protected dashboard and project-board pages

## Tech stack

- React, React Router, Vite, and Socket.IO client
- Node.js and Express
- MongoDB with Mongoose
- JWT authentication
- Socket.IO server

## Run locally

Start the API in one terminal:

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-random-secret>
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the frontend terminal. The frontend API and Socket.IO clients currently target `localhost:5000`; update those base URLs if the server runs elsewhere.

## Project structure

- `frontend/` — React pages, API client, Socket.IO client, and styles
- `backend/` — Express server, database connection, auth, project/task/comment routes, and socket events

Keep credentials in local environment files and do not commit them.
