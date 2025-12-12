import * as t from "drizzle-orm/pg-core";
import { tEvmAddress, timestamps } from "../helpers";

export const users = t.pgTable("users", {
	walletAddress: tEvmAddress().primaryKey(),
	username: t.text().unique(),
	lastActiveAt: t.timestamp({ withTimezone: true }),

	...timestamps,
});

export const usersAgents = t.pgTable("users_agents", {
	id: t.uuid().primaryKey().defaultRandom(),
	userWalletAddress: tEvmAddress().references(() => users.walletAddress, {
		onDelete: "cascade",
	}),

	...timestamps,
});

export const agentMcps = t.pgTable("user_mcps", {
	id: t.uuid().primaryKey().defaultRandom(),
	userWalletAddress: tEvmAddress()
		.references(() => users.walletAddress, {
			onDelete: "cascade",
		})
		.notNull(),
	agentId: t
		.uuid()
		.references(() => usersAgents.id, {
			onDelete: "cascade",
		})
		.notNull(),

	mcpIdentifier: t.text().notNull(),
	mcpConfigEncrypted: t.text().notNull(),
	mcpConfigHash: t.text().notNull(),

	...timestamps,
});
