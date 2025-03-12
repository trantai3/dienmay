import index from "../../models/customer/index.model";
import general from "../../models/general.model";

const siteController = {
  async index(req, res) {
    try {
      const header_user = await index.header_user(req);
      const header = await index.header(req);
      const outstandingProducts = await general.getOutstandingProducts(req);
      const newProducts = await general.getNewProducts(req);
      const discountProducts = await general.getDiscountProducts(req);
      const formatFunction = await general.formatFunction();
      res.status(200).render("./pages/site/index", {
        header,
        user: header_user,
        outstandingProducts,
        newProducts,
        discountProducts,
        formatFunction,
      });
    } catch (error) {
      console.error("Error in siteController.index:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

export default siteController;
