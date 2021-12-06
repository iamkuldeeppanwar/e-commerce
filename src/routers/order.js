const express = require("express");
const Order = require("../models/order");
const router = new express.Router();
const Product = require("../models/products");
const auth = require("../middleware/auth");
const userAdmin = require("../middleware/admin");

//creating order
router.post("/orders", auth, async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  try {
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
    await order.save();
    res.status(201).json({
      success: true,
      order,
    });
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

//GET single order
router.get("/order/:id", auth, userAdmin("admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      throw new Error("order not found!");
    }
    res.json(order);
  } catch (e) {
    res.status(404).json(e);
  }
});

//GET logged in user orders
router.get("/order/me", auth, async (req, res) => {
  try {
    const order = await Order.find({ user: req.user._id });

    res.json(order);
  } catch (e) {
    res.status(404).json(e);
  }
});

//GET all orders for Admin
router.get("/order/admin", auth, userAdmin("admin"), async (req, res) => {
  try {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalAmount;
    });

    res.json({ orders, totalAmount });
  } catch (e) {
    res.status(404).json(e);
  }
});

//update order Status
router.patch("/order/:id", auth, userAdmin("admin"), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new Error("order not found!");
    }

    if (order.orderStatus === "Delivered") {
      return next("You already delivered this product!");
    }

    order.orderItems.forEach(async (order) => {
      await updateStock(order.product, order.quantity);
    });

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (e) {
    console.log(e);
    res.status(404).send(e);
  }
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;
  await product.save();
}

//Delete Order
router.delete("/order/:id", auth, userAdmin("admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new Error("order not found!");
    }

    await order.remove();

    res.json(order);
  } catch (e) {
    res.status(404).json(e);
  }
});

module.exports = router;
