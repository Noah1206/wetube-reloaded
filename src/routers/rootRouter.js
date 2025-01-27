import express from "express";
import { Getjoin, postjoin, getlogin, postLogin } from "../controllers/userControl.js";
import { search, home } from "../controllers/videoControl.js";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares.js";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(Getjoin).post(postjoin);
rootRouter.route("/login").all(publicOnlyMiddleware).get(getlogin).post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;