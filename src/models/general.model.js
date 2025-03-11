import db from "../config/database.js";
import util from "node:util";

const query = util.promisify(db.query).bind(db);

const generate = {
  // Hàm xử lý datetỉme ---> Thứ x, ngày x tháng x năm x
  toXDDMMYYYY(datetime) {
    const days = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    const day = days[datetime.getDay()];
    const date = datetime.getDate();
    const month = datetime.getMonth() + 1;
    const year = datetime.getFullYear();
    return `${day}, ngày ${date} tháng ${month} năm ${year}`;
  },
  // Hàm xử lý datetime ---> DD tháng MM năm YYYY
  toDDthangMMnamYYYY(datetime) {
    const date = datetime.getDate().toString().padStart(2, "0");
    const month = (datetime.getMonth() + 1).toString().padStart(2, "0");
    const year = datetime.getFullYear();
    return `${date} tháng ${month} năm ${year}`;
  },
  // Hàm xử lý datetime ---> DD/MM/YYYY
  toDDMMYYYY(datetime) {
    const date = datetime.getDate().toString().padStart(2, "0");
    const month = (datetime.getMonth() + 1).toString().padStart(2, "0");
    const year = datetime.getFullYear();
    return `${date}/${month}/${year}`;
  },
  // Hàm xử lý datetime ---> giờ:phút
  toHHMM(datetime) {
    const hour = datetime.getHours().toString().padStart(2, "0");
    const minute = datetime.getMinutes().toString().padStart(2, "0");
    return `${hour}:${minute}`;
  },
  // Hàm xử lý datetime ---> DD tháng MM HH:MM
  toDDMMYYYYHHMM(datetime) {
    const date = datetime.getDate().toString().padStart(2, "0");
    const month = (datetime.getMonth() + 1).toString().padStart(2, "0");
    const year = datetime.getFullYear();
    return `${date} tháng ${month} năm ${year} ${generate.toHHMM(datetime)}`;
  },
  // Hàm xử lý tiền tệ
  toCurrency(money) {
    return new Intl.NumberFormat("vi-VN").format(money) + "đ";
  },
  // Lấy id của sản phẩm
  async getProductId(product_variant_id) {
    const sql = `SELECT product_id FROM product_variants WHERE product_variant_id = ?`;
    const result = await query(sql, [product_variant_id]);
    return result.length ? result[0].product_id : null;
  },
  // Lấy id của danh mục
  async getCategoryId(product_id) {
    const sql = `SELECT category_id FROM view_product_variants WHERE product_id = ?`;
    const results = await query(sql, [product_id]);
    return results.length ? results[0].category_id : null;
  },
  // Lấy danh sách sản phẩm bán chạy
  async getBestSellerProductsOfCates(category_id, limit) {
    const sql = `
      SELECT * FROM view_products_resume 
      WHERE category_id = ? 
      ORDER BY product_variant_is_bestseller DESC
      LIMIT ?;
    `;
    try {
      return await query(sql, [category_id, limit]);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm bán chạy:", error);
      return [];
    }
  },
  // Lấy danh mục sản phẩm (Mỗi danh mục có 8 sản phẩm bán chạy)
  async getCates() {
    const sql = `
      SELECT c.*, COUNT(p.product_id) AS category_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.category_id AND c.category_is_display = 1
      GROUP BY c.category_id;
    `;
    try {
      const cates = await query(sql);
      await Promise.all(
        cates.map(async (cate) => {
          cate.bestSellerProductsOfCates =
            await this.getBestSellerProductsOfCates(cate.category_id, 8);
        })
      );
      return cates;
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      return [];
    }
  },
  // Lấy sản phẩm nổi bật (7 sản phẩm có lượt xem cao nhất)
  async getOutstandingProducts() {
    const sql = `SELECT * FROM view_products_resume ORDER BY product_view_count DESC LIMIT 7`;
    try {
      return await query(sql);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm nổi bật:", error);
      return [];
    }
  },
  // Lấy danh sách các sản phẩm mới nhất từ bảng
  async getNewProducts() {
    try {
      const sql =
        "SELECT * FROM view_products_resume ORDER BY product_lastdate_added DESC";
      const newProducts = await query(sql);
      return newProducts;
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm mới:", error);
      return 0;
    }
  },
  // Lấy danh sách sản phẩm có giảm giá
  async getDiscountProducts() {
    try {
      const sql =
        "SELECT * FROM view_product_variants WHERE discount_amount IS NOT NULL ORDER BY discount_amount DESC";
      const discountProducts = await query(sql);
      return discountProducts;
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
      return 0;
    }
  },
};

export default generate;
