import db from "../config/database.js";
import until from "node:util";
const query = until.promisify(db.query).bind(db);

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
    return result.length > 0 ? result[0].product_id : null;
  },
  // Lấy id của danh mục
  async getCategoryId(product_id) {
    const sql = `SELECT category_id FROM view_product_variants WHERE product_id = ?`;
    const results = await query(sql, [product_id]);
    return results.length > 0 ? results[0].category_id : null;
  },
  // Lấy danh sách sản phẩm bán chạy
  async getBestSellerProductsOfCates(category_id, limit) {
    const sql = `
      SELECT * FROM view_products_resume 
      WHERE category_id = ? 
      ORDER BY product_variant_is_bestseller DESC
      LIMIT 0, ?
  `;
    try {
      const bestSellerProductsOfCates = await new Promise((resolve, reject) => {
        db.query(sql, [category_id, limit], (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      });
      return bestSellerProductsOfCates;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm bán chạy: ", error);
      return 0;
    }
  },
  // Mỗi danh mục sẽ có 8 sản phẩm bán chạy
  async getCates() {
    const getCateQuery = `
      SELECT categories.*, COUNT(product_id) AS category_count
      FROM categories 
      LEFT JOIN products
        ON products.category_id = categories.category_id
        AND category_is_display = 1
      GROUP BY category_id;
  `;
    try {
      const cates = await new Promise((resolve, reject) => {
        db.query(getCateQuery, (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      });
      // Với mỗi danh mục, lấy danh sách sản phẩm bán chạy và gán vào thuộc tính danh mục
      await Promise.all(
        cates.map(async (cate) => {
          const bestSellerProducts = await getBestSellerProductsOfCates(
            Number(cate.category_id),
            8
          );
          cate.bestSellerProductsOfCates = bestSellerProducts;
        })
      );
      return cates;
    } catch (error) {
      console.error("Lỗi khi lấy danh mục: ", error);
      return 0;
    }
  },
  // Lấy sản phẩm nổi bật
  async getOutstandingProducts() {
    const sql =
      "SELECT * FROM view_products_resume ORDER BY product_view_count DESC LIMIT 0, 7";
    try {
      const outstandingProducts = await new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      });
      return outstandingProducts;
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm nổi bật: ", error);
      return 0;
    }
  },
};

export default generate;
