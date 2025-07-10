import { Hono } from "hono";
import context from "./context";

const routes = new Hono()
.route("/context", context)

export default routes;