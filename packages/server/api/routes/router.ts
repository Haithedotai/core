import { Hono } from "hono";
import context from "./context";
import upload from "./upload";
import docs from "./docs/docs.route";

const routes = new Hono()
.route("/context", context)
.route("/upload", upload)
.route("/docs", docs)

export default routes;