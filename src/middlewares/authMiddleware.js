import db from "../config/database.js";
import jwt from "jsonwebtoken";
import general from "../models/general.model.js";

const query = db.query;
export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.userSave;
    if (!token) {
      return res.status(401).redirect("/auth/login");
    }

    // 1. Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Kiểm tra xem người dùng có tồn tại không
    const [results] = await query("SELECT * FROM view_user WHERE user_id = ?", [
      decoded.id,
    ]);

    if (results.length === 0) {
      return res.status(401).redirect("/auth/login");
    }

    req.user = results[0]; // Gán thông tin người dùng vào req
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).redirect("/auth/login");
  }
};

export const checkAuth = (req, res, next) => {
  return req.cookies?.userSave ? res.redirect("/") : next();
};

export const checkUnAuth = (req, res, next) => {
  return !req.cookies?.userSave ? res.status(401).redirect("/") : next();
};

export const getLoggedIn = async (req, res, next) => {
  if (!req.cookies?.userSave) {
    return next();
  }

  try {
    // 1. Xác thực token
    const decoded = jwt.verify(req.cookies.userSave, process.env.JWT_SECRET);

    // 2. Kiểm tra người dùng có tồn tại không
    const [results] = await query("SELECT * FROM view_user WHERE user_id = ?", [
      decoded.id,
    ]);

    if (results.length === 0) {
      return next();
    }

    // 3. Định dạng ngày sinh
    results.forEach((user) => {
      user.user_birth_format = general.toDDMMYYYY(new Date(user.user_birth));
    });

    req.user = results[0];
    next();
  } catch (err) {
    console.error("Error in getLoggedIn:", err);
    next();
  }
};
