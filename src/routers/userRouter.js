import express from "express";
import { startGithubLogin, finishGithubLogin, logout, getedit, postedit, getChangepassword, postChangepassword, see } from "../controllers/userControl.js"; 
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../middlewares.js";


const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware ,logout);
userRouter
    .route("/edit")
    .all(protectorMiddleware)
    .get(getedit)
    .post(avatarUpload.single("avatar"), postedit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangepassword).post(postChangepassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", see);

export default userRouter;