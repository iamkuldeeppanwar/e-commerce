const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://kuldeep:IGmVp66li2FzqqqN@cluster0-shard-00-00.ghllh.mongodb.net:27017,cluster0-shard-00-01.ghllh.mongodb.net:27017,cluster0-shard-00-02.ghllh.mongodb.net:27017/e-commerce-api?ssl=true&replicaSet=atlas-pujsxy-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
  }
);
