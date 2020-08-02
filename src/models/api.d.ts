export interface DirectoryResponse {
  path: string;
  images: Image[];
}

export interface Image {
  id: string;
  fileName: string;
  fileExtension: string;
  contentType: string;
  url: string;
  thumbnail: string;
  selected?: boolean;
}
