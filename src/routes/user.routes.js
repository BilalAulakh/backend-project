import Router from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT} from "../middlewares/auth.middlewares.js";

const router = Router();
// router.post('/register', registerUser)
router.route('/register').post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 5,
    },
  ]),
  registerUser
);
router.route('/login/').post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/refresh-token").post(verifyJWT,refreshAccessToken)

export default router;

