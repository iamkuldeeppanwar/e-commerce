const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      e,
    });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
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

router.get("/users/me", auth, (req, res) => {
  res.send(req.user);
});

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

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

const upload = multer({
  dest: "avatars",
});
router.post("/users/me/avatar", upload.single("avatar"), (req, res) => {
  res.send();
});

module.exports = router;
