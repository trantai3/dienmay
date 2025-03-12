import database from "../config/database";
import jwt from "jsonwebtoken";
const query = database.promise().query;

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.adminSave;
    if (!token) {
      return res.status(401).redirect("/admin/login");
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
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
