const express = require("express");
const router = new express.Router();
const Product = require("../models/products");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const product = require("../models/products");

//Creating products
router.post("/products", auth, userAdmin("admin"), async (req, res) => {
  req.body.user = req.user.id;
  const products = new Product(req.body);
  try {
    await products.save();
    res.status(201).json(products);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Get All products
router.get("/allProducts", async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      throw new Error("Products not found!");
    }
    res.json(products);
  } catch (e) {
    res.status(404).json(e);
  }
});

//GET single product
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById({ _id: req.params.id });

    if (!product) {
      throw new Error("Product not Found!");
    }

    res.send(product);
  } catch (e) {
    res.status(404).send(e);
  }
});

//Features in products
//GET /products?search=
router.get("/products", async (req, res) => {
  // const search = {};
  const products = await Product.find({ name: req.query.search });

  try {
    if (req.query.filter === "lth") {
      products.sort(function (a, b) {
        return a.price - b.price;
      });
    } else {
      products.sort(function (a, b) {
        return -(a.price - b.price);
      });
    }
    res.json(products);
  } catch (e) {
    res.status(500).json(e);
  }
});

//Creating reaviews
router.patch("/products/reviews", auth, async (req, res) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    ratings: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  console.log("isReviewed", isReviewed);

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReview = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//Updating products
router.patch("/products/:id", admin("admin"), async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "description",
    "price",
    "ratings",
    "images",
    "catagory",
    "stock",
    "numOfReview",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "invalid updates" });
  }
  try {
    const products = await Product.findOne({ _id: req.params.id });

    if (!products) {
      return res.status(404).json();
    }

    updates.forEach((update) => (products[update] = req.body[update]));
    await products.save();
    res.json(products);
  } catch (e) {
    res.status(400).json(e);
  }
});

//GET all Reviews of a products
router.get("/products/allreviews", async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);

    if (!product) {
      throw new Error("Product not found!");
    }
    res.json({
      reviews: product.reviews,
    });
  } catch (e) {
    res.status(404).json(e);
  }
});

//Deleting reviews
router.delete("/products/allreviews", async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);

    if (!product) {
      throw new Error("Product not found!");
    }

    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;

    reviews.forEach((rev) => {
      avg += rev.rating;
    });

    const ratings = avg / reviews.length;

    const numOfReview = reviews.length;

    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReview,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.json({
      reviews: product.reviews,
    });
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

//Deleting products
router.delete("/products/:id", auth, admin("admin"), async (req, res) => {
  try {
    const products = await Product.findOneAndDelete({ _id: req.params.id });
    if (!products) {
      return res.status(404).json();
    }
    res.send(products);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
