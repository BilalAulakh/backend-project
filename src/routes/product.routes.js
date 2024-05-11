import Router from "express";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getAllProducts, productCreate } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route('/add-product').post(
  upload.fields([
    { name: "imageFile"},
   
  ]),
  verifyJWT,
  productCreate
);

router.route('/get-allproduct').get(verifyJWT,getAllProducts)
export default router;
