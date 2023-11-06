import express from 'express'
import { isAuthenticated } from '../middleware/auth.js'
import { createChat, deleteChat, getAllChat, getGroupMessages } from '../controller/chat.js'

const route = express.Router()

route.post('/groups/:id/chat',isAuthenticated,createChat)
route.get('/chat',isAuthenticated,getAllChat)
route.delete('/chat/delete/:id',isAuthenticated,deleteChat)
route.get("/chat/:groupId/messages",isAuthenticated, getGroupMessages)

export default route