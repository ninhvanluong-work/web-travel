export interface UploadResponse {
  data: {
    fileType: string;
    url: string;
  };
  code: number;
  message: string;
  error: null | string;
}
