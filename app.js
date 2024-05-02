require("dotenv").config({
  debug: true,
});

const express = require("express");
const app = express();
const movieRouter = require("./routes/movies");
const reviewRouter = require("./routes/reviews");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const cors = require("cors");

// const firebaseConfig = {
//   type: process.env.TYPE,
//   project_id: `${process.env.PROJECT_ID}`,
//   private_key_id: process.env.PRIVATE_KEY_ID,
//   private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
//   client_email: process.env.CLIENT_EMAIL,
//   client_id: process.env.CLIENT_ID,
//   auth_uri: process.env.AUTH_URI,
//   token_uri: process.env.TOKEN_URI,
//   auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
//   client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
// };

// admin.initializeApp({
//   credential: admin.credential.cert(firebaseConfig),
// });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/movies", movieRouter);
app.use("/reviews", reviewRouter);

mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log(err));

app.get("/", (_req, res) => {
  res.status(200).json({ message: "hello user" });
});

app.listen(process.env.PORT, () => {
  console.log("server on port: ", process.env.PORT);
});
