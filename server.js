import { createServer } from "http-server";
import { app } from "./app.js";
import { connectDB } from "./data/database.js";
import cloudinary from 'cloudinary'
import { Server } from "socket.io"
import http from "http"

connectDB();

// Create an HTTP server using your existing Express app
const server = http.createServer(app);

// Create a Socket.IO server by passing the HTTP server
const io = new Server(server);

io.on("connection",(socket)=>{
    console.log('A user connected');

    // Handle when a user joins a group chat room
    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

server.listen(process.env.PORT, () => {
    console.log(`Server running on port 🔥 ${process.env.PORT}`);
});

// Export the 'io' object to make it available to other parts of your application
export default io;
