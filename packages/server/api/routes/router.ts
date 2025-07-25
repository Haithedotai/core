import { Hono } from "hono";
import context from "./context";
import upload from "./upload";

const routes = new Hono()
.route("/context", context)
.route("/upload", upload)

export default routes;