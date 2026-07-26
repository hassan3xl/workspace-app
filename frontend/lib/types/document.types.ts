import { UserType } from "./user.types";

export type DocumentType = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: "pdf" | "doc" | "spreadsheet" | "image" | "presentation" | "archive" | "other";
  visibility: "public" | "private";
  uploaded_by: UserType;
  created_at: string;
  updated_at: string;
};
