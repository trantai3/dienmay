import database from "../config/database";
import jwt from "jsonwebtoken";
const query = database.promise().query;

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.adminSave;

    if (!token) {
      return res.status(401).redirect("/admin/login");
    }

    // 1. Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Kiểm tra nếu admin có tồn tại hay không
    const [results] = await query("SELECT * FROM admin WHERE admin_id = ?", [
      decoded.id,
    ]);

    if (results.length === 0) {
      return res.status(401).redirect("/admin/login");
    }

    req.admin = results[0];
    next();
  } catch (err) {
    return res.status(401).redirect("/admin/login");
  }
};

export const checkAuth = (req, res, next) => {
  const token = req.cookies?.adminSave;
  return token ? res.redirect("/admin/") : next();
};
