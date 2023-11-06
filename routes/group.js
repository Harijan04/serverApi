import express from 'express'
import { isAuthenticated } from '../middleware/auth.js'
import { addMemberToGroup, approveJoinRequest, cancelJoinRequest, createGroup, deleteGroup, exitGroup, getGroups, getShareLink, getgroupMember, groupChats,  joinGroupWithLink,  removeUserFromGroup,  sendJoinRequest, shareGroupLink, updateGroup } from '../controller/group.js'
import { singleUpload } from '../middleware/multer.js'

const route = express.Router()


route.get('/groups',isAuthenticated,getGroups)
route.get('/group/members',isAuthenticated,getgroupMember)
route.post('/group/create',isAuthenticated,singleUpload,createGroup)
route.put('/groups/:groupId/members',isAuthenticated,addMemberToGroup);
route.post('/groups/:groupId/join-requests',isAuthenticated, sendJoinRequest);
route.put('/groups/:groupId/approve-join-requests/:userId',isAuthenticated, approveJoinRequest);
route.delete('/groups/:groupId/cancel-join-request', isAuthenticated,cancelJoinRequest);


///delete Group
route.delete("/groups/:id", isAuthenticated,deleteGroup);
//removerFrom Group
route.delete('/groups/:id/members/:userId',isAuthenticated,removeUserFromGroup)

//updategroup 
route.put('/groups/:groupId/update',isAuthenticated, updateGroup);


///User exist
route.delete('/groups/:groupId/exit',isAuthenticated, exitGroup);


///chats

route.get('/group/chats',isAuthenticated,groupChats)


route.post('/groups/:groupId/share-link',isAuthenticated, shareGroupLink)
route.post('/groups/:groupId/join/:linkId',isAuthenticated, joinGroupWithLink);


route.get('/groupS/:groupId',isAuthenticated,getShareLink)


export default route