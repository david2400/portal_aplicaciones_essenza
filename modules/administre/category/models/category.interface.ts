export interface ICategoryAddRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface ICategoryUpdateRequest extends ICategoryAddRequest {
  id: number;
}
