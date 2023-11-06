import mongoose  from "mongoose";
const schema = new mongoose.Schema({
   caption:{type:String},

   images:[{
     public_id:String,
     url:String
   }],

   owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   },

   createdAt:{
     type:Date,
     default:Date.now,
   },

   likes:[
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    }
   ],

 comments:[
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        comment:{
            type:String,
            required:true 
        },
        replies: [
          {
              user: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User"
              },
              comment: {
                  type: String,
                  required: true
              },
              replies: [ // Replies to this reply
              {
                  user: {
                      type: mongoose.Schema.Types.ObjectId,
                      ref: "User"
                  },
                  comment: {
                      type: String,
                      required: true
                  }
              }
          ]
          }
      ]
    }
 ]

})

export const Post = mongoose.model("Post",schema)