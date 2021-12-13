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
    res.status(400).send(e);
  }
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
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("users/avatar/:id", async (req, res) => {
  try {
    const user = await User.findById(res.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    console.log(e);
    res.status(404).send();
  }
});

module.exports = router;
