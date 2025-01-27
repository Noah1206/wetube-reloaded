import express from "express";
import { watch, Getedit, postEdit, getUpload, deleteVideo, postUpload } from "../controllers/videoControl.js";
import { protectorMiddleware, videoUpload } from "../middlewares.js";

const videoRouter = express.Router();


videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(Getedit).post(postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(deleteVideo);
videoRouter.route("/upload")
    .all(protectorMiddleware)
    .get(getUpload)
    .post(videoUpload.single("video"),postUpload);

export default videoRouter;