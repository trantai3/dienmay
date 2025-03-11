// import lib
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import database from "./src/config/database.js";
import generate from "./src/models/general.model.js";
// Set up config
dotenv.config();

// const route = require("./src/routes/index");

// Kết nối database
database.connect((err) => {
  if (err) {
    console.log("Kết nối thất bại!");
  } else {
    console.log("Kết nối thành công!");
  }
});
// set view engine
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

// use static folder
app.use(express.static(path.join("src", "public")));

//parse URL-encoded bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("secret"));

// route init
// route(app);
// const product = await generate.getCategoryId(1);
// console.log(product);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Website is running at PORT:${port}`);
});
