const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const model = mongoose.model("Moviedata", movieSchema);

module.exports = model;
