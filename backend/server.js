import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import {Server} from 'socket.io'
import jwt from 'jsonwebtoken';
import mongoose  from 'mongoose';
import projectModel from '../backend/models/projectModel.js'
import { generateResult } from './services/aiService.js';
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors : {
    origin: '*'
  }
});

io.use(async (socket, next ) => {
  try {

    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1]
    const projectId = socket.handshake.query.projectId

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error('Invalid project ID'));
    }

    socket.project = await projectModel.findById(projectId);

    if(!token) {
      return next( new Error('authentication error'))
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET)

    if(!decoded) {
      return next(new Error('authentication error'))
    }

    socket.user = decoded

    next()

  } catch(error) {
    next(error)
  }
})

io.on('connection', socket => {
  socket.roomId = socket.project._id.toString();
  console.log('a user connected')
  socket.join(socket.roomId)

  socket.on('project-message',async  data => {

    const message = data.message;

    console.log('message', data);

    
    const aiIsPresentInMessage = message.includes('@ai');
    
    if (aiIsPresentInMessage) {
      const senderId = data.sender._id;

      const prompt = message.replace('@ai', '');

      const result = await generateResult(prompt);

      console.log(result);

      io.to(socket.roomId).emit('project-message', {
      sender: {
        _id: 'ai',
        email: '@ai'
      },
      message: result,
      receiver: {
        receiverId: senderId,
      }
      });
      return;
    } else {
      // If AI is not present, send the sender's message to the room
      io.to(socket.roomId).emit('project-message', {
        ...data,
      timestamp: new Date()
      });
    }

    // Only send to other users in the room (not the sender)
    socket.to(socket.roomId).emit('project-message', {
      ...data,
      timestamp: new Date()
    })
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.leave(socket.roomId);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

