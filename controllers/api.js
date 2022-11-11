require("dotenv").config();
const Post = require("../models/posts");
const User = require("../models/users");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const passport = require("passport");
const key = require("../config/keys").SECRET_KEY;

module.exports = class API {
  static async fetchAllPost(req, res) {
    try {
      const posts = await Post.find();
      res.status(200).json(posts);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
  static async fetchPostByID(req, res) {
    const id = req.params.id;
    try {
      const post = await Post.findById(id);
      res.status(200).json(post);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  static async createPost(req, res) {
    const post = req.body;
    const imagename = req.file.filename;
    post.image = imagename;
    try {
      await Post.create(post);
      res.status(200).json({ message: "Post successfully!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  static async updatePost(req, res) {
    const id = req.params.id;
    let new_img = "";
    if (req.file) {
      new_img = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.old_img);
      } catch (error) {
        console.log(error);
      }
    } else {
      new_img = req.body.old_img;
    }
    const newPost = req.body;
    newPost.image = new_img;
    try {
      await Post.findByIdAndUpdate(id, newPost);
      res.status(200).json({ message: "Post updated successfully!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  static async deletePost(req, res) {
    const id = req.params.id;
    try {
      const result = await Post.findByIdAndDelete(id);
      if (result.image != "") {
        try {
          fs.unlinkSync("./uploads/" + result.image);
        } catch (error) {
          console.log(error);
        }
      }
      res.status(200).json({ message: "Post deleted successfully!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async userRegister(req, res) {
    let { name, username, email, password, confirm_password } = req.body;
    if (password !== confirm_password) {
      res.status(200).json({ message: "Password do not match." });
    }
    User.findOne({
      username: username,
    }).then((user) => {
      if (user) {
        return res.status(400).json({ message: "Username is already taken." });
      }
    });
    User.findOne({
      email: email,
    }).then((user) => {
      if (user) {
        return res.status(400).json({ message: "Email is already registred." });
      }
    });
    let newUser = new User({
      name,
      username,
      email,
      password,
      confirm_password,
    });
    //Hash the psw
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then((user) => {
          return res.status(200).json({
            success: true,
            message: "User is now registered.",
          });
        });
      });
    });
  }
  static async userLogin(req, res) {
    User.findOne({ username: req.body.username }).then((user) => {
      if (!user) {
        return res
          .status(400)
          .json({ message: "User not found.", success: false });
      }
      bcrypt.compare(req.body.password, user.password).then((isMatch) => {
        if (isMatch) {
          const payload = {
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
          };
          jwt.sign(payload, key, { expiresIn: "1d" }, (error, token) => {
            res.status(200).json({
              success: true,
              user: user,
              token: `Bearer ${token}`,
              message: "You are now logged in.",
            });
          });
        } else {
          return res
            .status(400)
            .json({ message: "Incorrect password.", success: false });
        }
      });
    });
  }
  
  // static async userProfile (req, res) {
  //   const user = await User.findById(req.user._id);

  //   if (user) {
  //     res.json({
  //       _id: user._id,
  //       name: user.name,
  //       email: user.email,
  //       createdAt: user.createdAt,
  //     });
  //   } else {
  //     res.status(404);
  //     throw new Error("User not found");
  //   }
  // }
  // static async fetchUser(req, res) {
  //     const user = await User.findById(req.user._id);
  //     if (user) {
  //       res.json({
  //         _id: user._id,
  //         name: user.name,
  //         username: user.username,
  //         email: user.email,
  //         created: user.created,
  //       });
  //     } else {
  //       res.status(404);
  //       throw new Error("User not found");
  //     }
  // }
};
