export type Category =
  | "Images"
  | "Documents"
  | "Videos"
  | "Audio"
  | "Archives"
  | "Code"
  | "Other";

export type OrganizeMode = "by_type" | "by_date" | "custom_rules";
export type DateSource = "modified" | "created";
export type DuplicateStrategy = "rename" | "skip" | "ask" | "replace";

export interface FileEntry {
  name: string;
  path: string;
  extension: string;
  size: number;
  category: Category;
  modified_at: number;
  created_at: number;
}

export interface ScanResult {
  folder_path: string;
  folder_name: string;
  total_files: number;
  total_size: number;
  category_counts: Record<string, number>;
  files: FileEntry[];
}

export interface Operation {
  id: string;
  source: string;
  destination: string;
  category: string;
  size: number;
  is_duplicate: boolean;
  will_skip: boolean;
}

export interface PreviewResult {
  preview_id: string;
  total_files: number;
  total_size: number;
  operations: Operation[];
  skipped: { path: string; reason: string }[];
  duplicates: number;
}

export interface OrganizeStats {
  files_organized: number;
  folders_created: number;
  space_processed: number;
  skipped_files: number;
  duplicates: number;
  time_seconds: number;
  category_breakdown: Record<string, number>;
  failed: { path: string; reason: string }[];
}

export interface UndoResult {
  restored_files: number;
  failed: { path: string; reason: string }[];
}

export type RuleConditionType =
  | "extension"
  | "filename_contains"
  | "category"
  | "size_greater_than";

export interface Rule {
  id: string;
  name: string;
  condition_type: RuleConditionType;
  condition_value: string;
  target_folder: string;
  enabled: boolean;
  priority: number;
}

export interface ApiError {
  detail: string;
}
