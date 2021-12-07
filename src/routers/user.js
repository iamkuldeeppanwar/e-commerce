const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");

//Creating or Register User
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 30000),
      httpOnly: true,
    });

    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      success: false,
      e,
    });
  }
});

//test
router.get("/", (req, res) => {
  res.cookie("jwt", "hello shobhit", {
    expires: new Date(Date.now() + 50000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
  });
});

//Login User
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 30000),
      httpOnly: true,
    });

    res.status(200).json({
      user,
      token,
      message: "success",
    });
  } catch (e) {
    res.status(404).json({
      sucsses: false,
      message: "Unable to login",
    });
  }
});

//Authenticate user
router.get("/users/me", auth, (req, res) => {
  res.send(req.user);
});

//Forget Password
router.get("/users/fpassword", auth, async (req, res) => {
  try {
    const user = await User.find(req.body.email);
    console.log(user);
    if (!user) {
      throw new Error("User not Found!");
    }
    res.json(user);
  } catch (e) {
    res.status(404).json(e);
  }
});

//Reset Password
router.post("/users/Rpassword", async (req, res) => {
  const email = req.body.email;
  console.log(email);
  try {
    const user = await User.findOne({ email });
    user.password = req.body.password;
    console.log(user.password);
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

//Logout User
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//Update User Profile
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Delete User
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

//User Profile Picture
const upload = multer({
  dest: "avatars",
});
router.post("/users/me/avatar", upload.single("avatar"), (req, res) => {
  res.send();
});

module.exports = router;
