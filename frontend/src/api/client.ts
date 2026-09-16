import type {
  DateSource,
  DuplicateStrategy,
  OrganizeMode,
  OrganizeStats,
  PreviewResult,
  Rule,
  RuleConditionType,
  ScanResult,
  UndoResult,
} from "../types";

class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // response wasn't JSON; keep statusText
    }
    throw new ApiRequestError(detail);
  }
  return response.json() as Promise<T>;
}

export const api = {
  scan(folderPath: string) {
    return request<ScanResult>("/api/scan", {
      method: "POST",
      body: JSON.stringify({ folder_path: folderPath }),
    });
  },

  preview(params: {
    folder_path: string;
    mode: OrganizeMode;
    date_source?: DateSource;
    duplicate_strategy?: DuplicateStrategy;
  }) {
    return request<PreviewResult>("/api/preview", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  organize(previewId: string) {
    return request<OrganizeStats>("/api/organize", {
      method: "POST",
      body: JSON.stringify({ preview_id: previewId }),
    });
  },

  undo() {
    return request<UndoResult>("/api/undo", { method: "POST" });
  },

  statistics() {
    return request<OrganizeStats>("/api/statistics");
  },

  rules: {
    list() {
      return request<Rule[]>("/api/rules");
    },
    create(payload: {
      name: string;
      condition_type: RuleConditionType;
      condition_value: string;
      target_folder: string;
    }) {
      return request<Rule>("/api/rules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update(id: string, payload: Partial<Rule>) {
      return request<Rule>(`/api/rules/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    remove(id: string) {
      return request<{ deleted: boolean }>(`/api/rules/${id}`, {
        method: "DELETE",
      });
    },
  },
};

export { ApiRequestError };
