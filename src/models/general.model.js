import db from "../config/database.js";
const query = db.query;

const general = {
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
    return `${date} tháng ${month} năm ${year} ${general.toHHMM(datetime)}`;
  },
  // Hàm xử lý tiền tệ
  toCurrency(money) {
    return new Intl.NumberFormat("vi-VN").format(money) + "đ";
  },
  // Lấy id của sản phẩm
  async getProductId(product_variant_id) {
    const sql = `SELECT product_id FROM product_variants WHERE product_variant_id = ?`;
    const [rows] = await query(sql, [product_variant_id]);
    return rows.length ? rows[0].product_id : [];
  },
  // Lấy id của danh mục
  async getCategoryId(product_id) {
    const sql = `SELECT category_id FROM view_product_variants WHERE product_id = ?`;
    const [rows] = await query(sql, [product_id]);
    return rows.length ? rows[0].category_id : [];
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
      const [rows] = await query(sql, [category_id, limit]);
      return rows;
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
      const [cates] = await query(sql);
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
      const [rows] = await query(sql);
      return rows;
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
      const [newProducts] = await query(sql);
      return newProducts;
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm mới:", error);
      return [];
    }
  },
  // Lấy danh sách sản phẩm có giảm giá
  async getDiscountProducts() {
    try {
      const sql =
        "SELECT * FROM view_product_variants WHERE discount_amount IS NOT NULL ORDER BY discount_amount DESC";
      const [discountProducts] = await query(sql);
      return discountProducts;
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
      return [];
    }
  },
  // Lấy danh sách các sản phẩm có cùng danh mục
  async getCateProducts(req, product_variant_id, limit = 8) {
    try {
      let product_id = await general.getProductId(product_variant_id);
      let category_id = await general.getCategoryId(product_id);

      // Nếu có category_id từ query params thì dùng nó, nếu không thì dùng category_id lấy từ DB
      category_id = req.query.category_id || category_id;

      const sql = `
          SELECT * FROM view_products_resume 
          WHERE category_id = ? 
          ORDER BY product_variant_is_bestseller DESC
          LIMIT ?
      `;

      const [cateProducts] = await query(sql, [category_id, limit]);
      return cateProducts;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm theo danh mục:", error);
      return [];
    }
  },
  // Lấy danh sách sản phẩm không cùng danh mục với sản phẩm được chọn
  async getNotCateProducts(req, product_variant_id, limit = 8) {
    try {
      let product_id = await general.getProductId(product_variant_id);
      let category_id =
        req.query.category_id || (await general.getCategoryId(product_id));

      const sql = `
          SELECT * FROM view_products_resume 
          WHERE category_id != ? 
          ORDER BY product_variant_is_bestseller DESC 
          LIMIT ?;
      `;

      const [rows] = await query(sql, [category_id, limit]);
      return rows;
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách sản phẩm không cùng danh mục:",
        error
      );
      return [];
    }
  },
  // Lấy chi tiết một biến thể của sản phẩm
  async getVariantProduct(product_variant_id) {
    try {
      const sql = `SELECT * FROM view_product_variants WHERE product_variant_id = ?`;
      const [variantProducts] = await query(sql, [product_variant_id]);
      return variantProducts.length ? variantProducts[0] : null;
    } catch (error) {
      console.error("Lỗi khi lấy biến thể sản phẩm:", error);
      return null;
    }
  },
  // Lấy danh sách các biến thể
  async getProductVariants(product_variant_id) {
    try {
      const product_id = await general.getProductId(product_variant_id);
      if (!product_id) return [];

      const sql = `SELECT * FROM view_product_variant_detail WHERE product_id = ?`;
      const [productVariants] = await query(sql, [product_id]);

      return productVariants;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách biến thể sản phẩm:", error);
      return [];
    }
  },
  // Lấy phương thức định dạng dữ liệu
  async formatFunction() {
    const formatFunction = {
      toCurrency: general.toCurrency,
      toDDMMYYYY: general.toDDMMYYYY,
      toHHMM: general.toHHMM,
    };
    return formatFunction;
  },
};

export default general;
