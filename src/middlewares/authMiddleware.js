import db from "../config/database.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import generate from "../models/general.model.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.userSave;
    console.log(`isLoggedIn: ${token}`);
    if (!token) {
      return res.status(401).redirect("/auth/login");
    }
    // Xác thực token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // Kiểm tra xem người dùng có tồn tại không
    db.query(
      "SELECT * FROM view_user WHERE user_id = ?",
      [decoded.id],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).send("Lỗi máy chủ");
        }

        if (!results || results.length === 0) {
          return res.status(401).redirect("/auth/login");
        }

        req.user = results[0]; // Gán thông tin người dùng vào req
        next();
      }
    );
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).redirect("/auth/login");
  }
};

export const checkAuth = (req, res, next) => {
  if (req.cookies.userSave) {
    res.redirect("/");
  } else {
    next();
  }
};

export const checkUnAuth = (req, res, next) => {
  if (!req.cookies.userSave) {
    res.status(401).redirect("/");
  } else {
    next();
  }
};
