const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const userRouter = require("./routers/user");
const productRouter = require("./routers/products");
const orderRouter = require("./routers/order");
const cookieParser = require("cookie-parser");
require("./mongodb/mongoose");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(userRouter);
app.use(productRouter);
app.use(orderRouter);

app.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
