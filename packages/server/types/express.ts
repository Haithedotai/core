declare global {
	namespace Express {
		// These open interfaces may be extended in an application-specific manner via declaration merging.
		// See for example method-override.d.ts (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/method-override/index.d.ts)
		interface Request {}
		interface Response {}
		interface Locals {}
		interface Application {}
	}
}
export interface Dictionary<T> {
	[key: string]: T;
}

export interface ParamsDictionary {
	[key: string]: string;
}
export type ParamsArray = string[];
export type Params = ParamsDictionary | ParamsArray;

export interface Locals extends Express.Locals {}

export type PathParams = string | RegExp | Array<string | RegExp>;

type RemoveTail<
	S extends string,
	Tail extends string,
> = S extends `${infer P}${Tail}` ? P : S;
type GetRouteParameter<S extends string> = RemoveTail<
	RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
	`.${string}`
>;

export type RouteParameters<Route extends string> =
	Route extends `${infer Required}{${infer Optional}}${infer Next}`
		? ParseRouteParameters<Required> &
				Partial<ParseRouteParameters<Optional>> &
				RouteParameters<Next>
		: ParseRouteParameters<Route>;

type ParseRouteParameters<Route extends string> = string extends Route
	? ParamsDictionary
	: Route extends `${string}(${string}`
		? ParamsDictionary // TODO: handling for regex parameters
		: Route extends `${string}:${infer Rest}`
			? (GetRouteParameter<Rest> extends never
					? ParamsDictionary
					: GetRouteParameter<Rest> extends `${infer ParamName}?`
						? { [P in ParamName]?: string } // TODO: Remove old `?` handling when Express 5 is promoted to "latest"
						: { [P in GetRouteParameter<Rest>]: string }) &
					(Rest extends `${GetRouteParameter<Rest>}${infer Next}`
						? RouteParameters<Next>
						: unknown)
			: unknown;
