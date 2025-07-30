import { HaitheAuthClient } from "./auth";
import { BaseClient } from "../shared/baseClient";
import type { Product } from "../shared/types";

export class HaitheProductsClient extends BaseClient {
  private authClient: HaitheAuthClient;

  constructor(authClient: HaitheAuthClient, options?: { debug?: boolean }) {
    super(authClient["baseUrl"], options?.debug);
    this.authClient = authClient;
  }

  async getAllProducts(): Promise<Product[]> {
    const response = await this.fetch<{ products: Product[] }>(
      "/v1/products",
      this.authClient.getAuthToken()
    );
    return response.products;
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.fetch<{ product: Product }>(
      `/v1/products/${id}`,
      this.authClient.getAuthToken()
    );
    return response.product;
  }

  // Project product management
  async enableProjectProduct(projectId: number, productId: number): Promise<void> {
    return this.fetch(
      `/v1/products/${productId}/enable?project_id=${projectId}`,
      this.authClient.getAuthToken(),
      { method: "POST" }
    );
  }

  async disableProjectProduct(projectId: number, productId: number): Promise<void> {
    return this.fetch(
      `/v1/products/${productId}/disable?project_id=${projectId}`,
      this.authClient.getAuthToken(),
      { method: "DELETE" }
    );
  }
}