import general from "../general.model.js";
import db from "../../config/database.js";
const query = db.query;
const index = {
  async getCountCart(customer_id) {
    try {
      const sql = "SELECT * FROM view_count_cart WHERE user_id = ?";
      const [rows] = await db.query(sql, [customer_id]);
      return rows.length ? rows[0].count_cart : 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  },
  async getShortCart(customer_id) {
    try {
      const sql = "SELECT * FROM view_cart WHERE customer_id = ?";
      const [rows] = await db.query(sql, [customer_id]);
      return rows;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin giỏ hàng:", error);
      return [];
    }
  },
};

export default index;
