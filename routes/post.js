import express from "express"

import { isAuthenticated } from "../middleware/auth.js";
import { multipleUpload, singleUpload,} from "../middleware/multer.js";
import { addCommentToPost, addReplyToComment,  addReplyToReply,  createPost, deleteComment, deletePost, deleteReply, deleteReplyToReply, getPostFollowers, getallPsot, likePostUnlike, updateCaptiopn, updateComment, updateReply, updateReplyToReply, userPosts } from "../controller/post.js";

const router = express.Router()

// router.post("/post",isAuthenticated,createPost,singleUpload)
// router.get("/post/:id",isAuthenticated,likePostUnlike)
// router.delete("/post/:id",isAuthenticated,deletePos)

router.get('/all',getallPsot)
router.post('/newPost',isAuthenticated,singleUpload,createPost)
router.get('/post/:id',isAuthenticated,likePostUnlike).delete('/post/:id',isAuthenticated,deletePost)
router.get('/posts',isAuthenticated,getPostFollowers)
router.put('/post/update/:id',isAuthenticated,updateCaptiopn)
router.get('/userPost',isAuthenticated,userPosts)

///comments
router.post('/post/comment/:id',isAuthenticated,addCommentToPost)
router.post('/posts/:id/comments/:commentId/replies',isAuthenticated,addReplyToComment)
router.post('/posts/:id/comments/:commentId/replies/:replyId/replies',isAuthenticated, addReplyToReply);


//Update commenta
router.put('/posts/:id/comments/:commentId',isAuthenticated, updateComment);
router.post('/posts/:id/comments/:commentId/replies',isAuthenticated,updateReply );
router.post('/posts/:id/comments/:commentId/replies/:replyId/replies',isAuthenticated,updateReplyToReply);

//Delete comments
router.delete('/posts/:id/comments/:commentId',isAuthenticated, deleteComment)
router.delete('/posts/:id/comments/:commentId/replies/:replyId',isAuthenticated, deleteReply);
router.delete('/posts/:id/comments/:commentId/replies/:replyId/replies/:replyToReplyId',isAuthenticated, deleteReplyToReply);




export default router