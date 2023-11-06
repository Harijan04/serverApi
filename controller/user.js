
import apiFetch from '../../copyCOde/dataFetch.js'
import { asyncError, errorMiddleware } from '../middleware/error.js'
import { User } from '../models/user.js'
import { Post } from "../models/post.js";
import ErrorHandler from '../utils/error.js'
import { CookieOptions, getDataUris, sendToken, sendVerificationEmail } from '../utils/features.js'
import cloudinary from 'cloudinary'
import validator from 'validator';

export const getMyProfile = asyncError(async (req, res) => {
    const user = await User.findById(req.user._id).populate("posts")
    res.status(200).json({
        success: true,
        user
    })
}
)

export const register = asyncError(async (req, res) => {
    const { name, email, password } = req.body;
    let existingUser = await User.findOne({ email });

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
    }

    let avatar = undefined

    if (req.file) {
        //req.file
        const file = getDataUris(req.file)
        // Add cloudinary
        const mycloud = await cloudinary.v2.uploader.upload(file.content)

        avatar = {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        }
        console.log(mycloud.secure_url);
    }

    const user = await User.create({ name, email, password, avatar });


    sendToken(user, res, `Registered Successfully ${user.name}`, 201);
});













export const Login = asyncError(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler('Incorrect email or password',400))
  
    if(!password) return next(new ErrorHandler("Incorrect password or email"))

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
        return next(new ErrorHandler("Incorrect password or email"))
    }
  
        // Password matches, send the token and a success message
        sendToken(user, res, `Login Successfully ${user.name}`, 201);
  
});


export const LOgOut = asyncError((req, res, next) => {
    res.status(200).cookie("token", "",
        {
            ...CookieOptions,
            expires: new Date(Date.now())
        }).json({ message: "Logged out Successfully" });

})


///Update Sections

export const updateProfile = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    const { name, email } = req.body

    if (name) user.name = name
    if (email) user.email = email

    await user.save()
    res.status(200).json({
        success: true,
        message: "Profile updated",
        user,
    })

})

export const updatePassword = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password")

    const { oldPassword, NewPassword } = req.body

    if (!oldPassword || !NewPassword) return next(new ErrorHandler("Enter all fied", 400))
    const isMatched = await user.comparePassword(oldPassword)

    if (!isMatched) return next(new ErrorHandler("Incorrect Old password"))

    user.password = NewPassword;
    await user.save()

    res.status(200).json({
        success: true,
        message: 'Password updated succefully'
    })
})



///Update pic

export const updatePic = asyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)




    const file = getDataUris(req.file)

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    const mycloud = await cloudinary.v2.uploader.upload(file.content)

    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url
    }
    console.log(mycloud.secure_url);


    await user.save()
    res.status(200).json({
        success: true,
        message: "Avatar pic updated",
        user,
    })
})


////Follow and unFollow

export const followUser = asyncError(async (req, res, next) => {
    const userFollow = await User.findById(req.params.id)
    const loggedInUser = await User.findById(req.user._id)

    if (!userFollow) next(new ErrorHandler("User Not Fund", 404))

    if (loggedInUser.following.includes(userFollow._id)) {
        const indexFollowing = loggedInUser.following.indexOf(userFollow._id)
        loggedInUser.following.splice(indexFollowing, 1)

        const indexFollowers = userFollow.followers.indexOf(loggedInUser._id)
        userFollow.followers.splice(indexFollowers, 1)

        await userFollow.save()
        await loggedInUser.save()

        res.status(200).json({
            success: true,
            message: 'Unfollowing'
        })

    } else {
        loggedInUser.following.push(userFollow._id)
        userFollow.followers.push(loggedInUser._id)

        await loggedInUser.save()
        await userFollow.save()

        res.status(200).json({
            success: true,
            message: 'Following'
        })
    }



})

export const deleteMyProfile = asyncError(async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;

        // Deleting user
        await user.deleteOne();

        // Deleting posts
        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            if (post) {
                await post.deleteOne();
            }
        }

        // Removing followers
        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);
            if (follower) {
                const index = follower.following.indexOf(userId);
                follower.following.splice(index, 1);
                await follower.save();
            }
        }

        // Removing following
        for (let i = 0; i < following.length; i++) {
            const followee = await User.findById(following[i]);
            if (followee) {
                const index = followee.followers.indexOf(userId);
                followee.followers.splice(index, 1);
                await followee.save();
            }
        }

        // User logout
        res.status(200).cookie("token", null, {
            ...CookieOptions,
            expires: new Date(Date.now())
        }).json({
            success: true,
            data: { message: "Account Deleted" }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});



//Forgot and resetpassword



export const forgotPassword = asyncError(async (req, res, next) => {
    let email = req.body.email;

    const user = await User.findOne({ email })

    if (!user) return next(new ErrorHandler("Email Does not exist"))

    //max,min 2000,10000
    //math.random()*(max-min)+min
    const randomNumber = Math.random() * (999999 - 100000) + 100000
    const opt = Math.floor(randomNumber)

    const opt_exp = new Date();
    opt_exp.setMinutes(opt_exp.getMinutes() + 15);

    user.otp = opt;
    user.otp_Expire = opt_exp
    console.log(opt)
    console.log(user.otp_Expire)


    try {
        await user.save();
    } catch (error) {
        console.error('Error saving user with OTP:', error);
        // Handle the error or return it to the caller.
        // For example: return next(error);
    }


    try {
        await sendVerificationEmail(user.email, opt, user.name)
    } catch (error) {
        user.opt = null;
        user.otp_Expire = null
        await user.save()

        return next(error)

    }

    res.status(200).json({
        success: true,
        message: "Check your Email",
        user,
    })



})
export const resetPassword = asyncError(async (req, res, next) => {
    const { otp, password } = req.body;

    const user = await User.findOne({
        otp,
        otp_Expire: {
            $gt: Date.now()
        }
    });
    console.log("Incoming OTP:", otp);
    console.log("User's OTP:", user ? user.otp : null);
    console.log("User's OTP Expiry:", user ? user.otp_Expire : null);

    // Check if a user was found
    if (!user) {
        console.log("Invalid opt or expired");
        return next(new ErrorHandler("Invalid opt or expired"));
    }

    console.log("OTP:", user.otp); // Log the value of OTP
    console.log("OTP Expiry:", user.otp_Expire); // Log the value of OTP Expiry

    // Check if the user object is not null or undefined before accessing 'otp' property
    if (user.otp === undefined) {
        console.log("OTP is undefined");
        return next(new ErrorHandler("Invalid opt or expired"));
    }

    if(!password) return next(new ErrorHandler("Enter password Please"))

    user.password = password;
    user.otp = undefined;
    user.otp_Expire = undefined;

    try {
        await user.save();
    } catch (err) {
        console.log(err);
    }
    res.status(200).json({
        success: true,
        message: "Reset Password Successfully"
    });
});

export const getUserById = asyncError(async (req, res, next) => {
    const userId = req.params.id; // Get the user ID from the request parameters
  
    // Use Mongoose's findById method to find the user by their ID
    const user = await User.findById(userId);
  
    if (!user) {
      return next(new ErrorHandler(`User not found with ID: ${userId}`, 404));
    }
  
    // If the user is found, send a success response with the user data
    res.status(200).json({
      success: true,
      user,
    });
  });

export const searchUsersByName = asyncError(async (req, res) => {
    const { name } = req.query; // Get the name parameter from the query string
  
    if (!name) {
      return res.status(400).json({ message: 'Name parameter is required' });
    }
  
    // Use a regular expression to perform a case-insensitive search
    const regex = new RegExp(name, 'i');
  
    // Find users whose name matches the provided search term
    const users = await User.find({ name: regex }).populate('posts') ;
  
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found with the provided name' });
    }
  
    res.status(200).json({
    
      users,
    });
  });