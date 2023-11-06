import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import validator from 'validator'
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: [true, 'Email Already Exists'],
        validator: validator.isEmail,


    },

    password: {
        type: String,
        required: [true, "Please enter your Password"],
        minLength: [6, "Password must be at least 6 characters longs"],

    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],


    avatar: {
        public_id: String,
        url: String
    },

    followers: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    ],
    following: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    ],
    isAdmin: {
        type: Boolean,
        default: false, // Set to true for admin users
    },
    groups: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group', // Reference to the groups the user belongs to
        },
    ],
  
    groupInvitations: [
        {
            group: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Group', // Reference to the group
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending',
            },
        },
    ],

  

    otp: Number,
    otp_Expire: Date,




}
)

schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
})

schema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
}

schema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_TOKEN, {
        expiresIn: "15d",
    })

}


export const User = mongoose.model("User", schema)