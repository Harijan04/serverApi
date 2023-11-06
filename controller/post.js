import { asyncError } from "../middleware/error.js";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { MgetDataUris, getDataUris } from '../utils/features.js'
import cloudinary from 'cloudinary'

export const getallPsot=asyncError(async(req,res,next)=>{
    const post = await Post.find({})


    res.status(200).json({
        success:true,
        post,
    })

})
export const userPosts = async (req, res, next) => {
    try {
      // Use Mongoose to find the user's posts
      const user = await User.findById(req.user._id);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Find the user's posts by querying the Post model
      const userPosts = await Post.find({ owner: req.user._id }).populate('owner');
  
      // Return the user's posts in the response
      res.status(200).json({
        success: true,
        data: userPosts,
      });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


export const createPost= asyncError(async(req,res,next)=>{
    const caption= req.body.caption

let  images = []




if (req.file) {
    //req.file
    const file = getDataUris(req.file)
    // Add cloudinary
    const mycloud = await cloudinary.v2.uploader.upload(file.content)

   images = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url
    }
    console.log(mycloud.secure_url,caption);
}
  

 const post= await Post.create({caption,owner:req.user._id,images})

 const user = await User.findById(req.user._id);
 user.posts.push(post._id);
 await user.save();

    res.status(200).json({
        success : true,
        message:"Post uploaded",
      
    })

})


// ///Like and unlike

export const likePostUnlike = asyncError(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) return next(new ErrorHandler("Post not found", 404));

    const userIndex = post.likes.findIndex((userId) => userId.equals(req.user._id));

    if (userIndex !== -1) {
        // User has already liked the post, so unlike it.
        post.likes.splice(userIndex, 1);
    } else {
        // User hasn't liked the post, so like it.
        post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
        success: true,
        message: userIndex !== -1 ? 'Post Unliked' : 'Post Liked',
        likesCount: post.likes.length,

    });
})



// ///delete Post

export const deletePost = asyncError(async (req, res, next) => {
    //check for owner of this post or admin

    const post = await Post.findById(req.params.id)

    if (!post) return next(new ErrorHandler('No such a Post as found', 404))

    if (post.owner.toString() !== req.user._id.toString()) return next(new ErrorHandler("You can't delete anothers post"))


    await Post.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: 'Deleted Successfully'
    })

    const user = await User.findById(req.user._id)
    let index = user.posts.map(item => item.toString()).indexOf(req.params.id)
    if (index !== -1) {
        user.posts.pull(req.params.id)
        await user.save()
    }

})



export const getPostFollowers = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
  
    const posts = await Post.find({
      owner: {
        $in: user.following
      }
    })
      .populate('owner')
      .sort({ createdAt: -1 }); // Sort by createdAt timestamp in descending order (newest first)
  
    res.status(200).json({
      success: true,
      posts
    });
  });
  


export const updateCaptiopn =asyncError(async(req,res,next)=>{

    const post = await Post.findById(req.params.id)

    if(!post) return next(new ErrorHandler('No such a post found',404))

    if(post.owner.toString() !== req.user._id.toString()) return next(new ErrorHandler('Unauthorized to update anothers post',404))

    post.caption = req.body.caption

    await post.save()

    res.status(200).json({
        success:true,
        message:'Updated succefully',
        post
    })

})


// commentController.js



export const addCommentToPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const newComment = {
            user: req.user._id,
            comment: req.body.commentText
        };

        post.comments.push(newComment);
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};


// replyController.js


export const addReplyToComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const parentCommentId = req.params.commentId; // Assuming you have a route parameter for commentId

        const parentComment = post.comments.id(parentCommentId);

        if (!parentComment) {
            return res.status(404).json({ success: false, message: "Parent comment not found" });
        }

        const newReply = {
            user: req.user._id,
            comment: req.body.commentText
        };

        parentComment.replies.push(newReply);
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};



// replyController.js


export const addReplyToReply = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const parentCommentId = req.params.commentId;
        const parentComment = post.comments.id(parentCommentId);

        if (!parentComment) {
            return res.status(404).json({ success: false, message: "Parent comment not found" });
        }

        const parentReplyId = req.params.replyId; // Assuming you have a route parameter for replyId
        const parentReply = parentComment.replies.id(parentReplyId);

        if (!parentReply) {
            return res.status(404).json({ success: false, message: "Parent reply not found" });
        }

        const newReply = {
            user: req.user._id,
            comment: req.body.commentText
        };

        parentReply.replies.push(newReply);
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};



///Update comment

// updateCommentController.js


// updateCommentController.js



export const updateComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        // Check if the user making the request matches the user who posted the comment
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this comment" });
        }

        // Update the comment content
        comment.comment = req.body.commentText;
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};


// replyToCommentController.js



// updateReplyController.js



export const updateReply = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const replyId = req.params.replyId;
        const reply = comment.replies.id(replyId);

        if (!reply) {
            return res.status(404).json({ success: false, message: "Reply not found" });
        }

        // Check if the user making the request matches the user who posted the reply
        if (reply.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this reply" });
        }

        // Update the reply content
        reply.comment = req.body.commentText;
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};




// updateReplyToReplyController.js



export const updateReplyToReply = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const replyId = req.params.replyId;
        const reply = comment.replies.id(replyId);

        if (!reply) {
            return res.status(404).json({ success: false, message: "Reply not found" });
        }

        const replyToReplyId = req.params.replyToReplyId;
        const replyToReply = reply.replies.id(replyToReplyId);

        if (!replyToReply) {
            return res.status(404).json({ success: false, message: "Reply to reply not found" });
        }

        // Check if the user making the request matches the user who posted the reply to the reply
        if (replyToReply.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this reply to reply" });
        }

        // Update the reply to reply content
        replyToReply.comment = req.body.commentText;
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};




//Delete Comments

// deleteCommentController.js



// deleteCommentController.js



export const deleteComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        // Check if the user making the request matches the user who posted the comment
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this comment" });
        }

        // Remove the comment
        comment.remove();
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};



// deleteReplyController.js



// deleteReplyController.js



export const deleteReply = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const replyId = req.params.replyId;
        const reply = comment.replies.id(replyId);

        if (!reply) {
            return res.status(404).json({ success: false, message: "Reply not found" });
        }

        // Check if the user making the request matches the user who posted the reply
        if (reply.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this reply" });
        }

        // Remove the reply
        reply.remove();
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};



// deleteReplyToReplyController.js



// deleteReplyToReplyController.js



export const deleteReplyToReply = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        const replyId = req.params.replyId;
        const reply = comment.replies.id(replyId);

        if (!reply) {
            return res.status(404).json({ success: false, message: "Reply not found" });
        }

        const replyToReplyId = req.params.replyToReplyId;
        const replyToReply = reply.replies.id(replyToReplyId);

        if (!replyToReply) {
            return res.status(404).json({ success: false, message: "Reply to reply not found" });
        }

        // Check if the user making the request matches the user who posted the reply to the reply
        if (replyToReply.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this reply to reply" });
        }

        // Remove the reply to reply
        replyToReply.remove();
        await post.save();

        res.json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};



/// Like and Unlike Post