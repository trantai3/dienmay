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
  async checkCart(customer_id, product_variant_id) {
    try {
      const sql =
        "SELECT * FROM view_cart WHERE customer_id = ? AND product_variant_id = ?";
      const [rows] = await db.query(sql, [customer_id, product_variant_id]);
      return rows.length > 0 ? 1 : 0;
    } catch (error) {
      console.error("Error in checkCart:", error);
      return 0;
    }
  },
  async getNoti(user_id) {
    try {
      const sql = "SELECT * FROM view_notifications WHERE user_id = ?";
      const [rows] = await db.query(sql, [user_id]);
      return rows;
    } catch (error) {
      console.error("Error in getNoti:", error);
      return [];
    }
  },
  async header_user(req) {
    if (!req.user) return 0;

    const { customer_id, user_id } = req.user;
    const shortCarts = await index.getShortCart(customer_id);
    const noti = await index.getNoti(user_id);

    return {
      user: req.user,
      countCart: shortCarts.length,
      shortCarts,
      noti,
    };
  },
};

export default index;
