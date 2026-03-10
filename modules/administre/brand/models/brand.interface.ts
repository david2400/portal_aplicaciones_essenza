export interface IBrandAddRequest {
  name: string;
  description?: string;
  slug: string;
}

export interface IBrandUpdateRequest extends IBrandAddRequest {
  id: number;
}
