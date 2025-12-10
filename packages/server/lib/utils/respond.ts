import { jsonStringify } from "@haithe/shared";
import type { Response } from "express";
import type { ResponseHeader } from "hono/utils/headers";
import type {
	ClientErrorStatusCode,
	ServerErrorStatusCode,
} from "hono/utils/http-status";
import type { BaseMime } from "hono/utils/mime";
import type { JSONObject } from "hono/utils/types";

export const respond = {
	ok: <
		R extends Response,
		T extends JSONObject | Record<string, unknown>,
		U extends 200 | 201 | 202 | 303,
	>(
		res: R,
		data: T,
		message: string,
		status: U,
		headers?: HeaderRecord,
	) => {
		res.status(status);
		for (const [name, value] of Object.entries(headers || {})) {
			res.header(name, value);
		}
		return res.json({ success: true, data, message }); //status,headers);
	},

	err: <
		R extends Response,
		U extends ClientErrorStatusCode | ServerErrorStatusCode,
	>(
		res: R,
		message: string,
		status: U,
		headers?: HeaderRecord,
	) => {
		res.status(status);
		for (const [name, value] of Object.entries(headers || {})) {
			res.header(name, value);
		}
		return res.json({ success: false, error: jsonStringify(message) }); //, status, headers);
	},
};

type HeaderRecord =
	| Record<"Content-Type", BaseMime>
	| Record<ResponseHeader, string>
	| Record<string, string>;
