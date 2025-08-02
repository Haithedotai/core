export abstract class BaseClient {
  protected baseUrl: string;
  protected debug: boolean;

  constructor(baseUrl: string, debug: boolean = false) {
    this.baseUrl = baseUrl;
    this.debug = debug;
  }

  public fetch<T>(
    uri: string,
    authToken: string | null,
    args?: Parameters<typeof fetch>[1]
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("Base URL is not set");
    }
    if (!uri.startsWith("/")) {
      uri = `/${uri}`;
    }
    const base = this.baseUrl.endsWith("/")
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const url = base + uri;

    // Safely extract headers and other args
    const { headers: addedHeaders, ...restArgs } = args || {};

    return new Promise((resolve, reject) => {
      fetch(url.toString(), {
        ...restArgs,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          ...addedHeaders,
        },
      })
        .then((response) => {
          if (this.debug) {
            console.log(`Fetched: ${url.toString()} -> ${response.status}`);
          }
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((response) => {
          if (uri === '/v1beta/openai/chat/completions') {
            resolve(response as T);
            return;
          }

          if (
            (!response ||
              typeof response !== "object" ||
              !("success" in response) ||
              !("message" in response) ||
              !("data" in response))
          ) {
            throw new Error("Invalid API response");
          }

          if (!response.success)
            throw new Error(
              "Api call was not successful : " + response.message
            );

          if (this.debug) console.log(`Response from ${url}:`, response);

          if (!response.data) throw new Error("Response data is missing");

          console.log(response.message);
          resolve(response.data as T);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
