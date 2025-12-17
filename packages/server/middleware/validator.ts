import { jsonParse } from "@haithe/shared";
import { zValidator } from "@hono/zod-validator";
import { respond } from "../lib/utils/respond";

type Target = Parameters<typeof zValidator>[0];
type Schema = Parameters<typeof zValidator>[1];

export const validator = (target: Target, schema: Schema) => {
	const validatorMiddleware = zValidator(target, schema, (res, ctx) => {
		if (!res.success) {
			return respond.err(
				ctx,
				jsonParse(res.error.message)
					// @ts-expect-error
					.map((m) => m.message.toString())
					.join("\n"),
				400,
			);
		}
	});

	return validatorMiddleware;
};
