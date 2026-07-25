export function extractApiError(error: any): string {
  const data = error?.data || error;

  if (!data) return "An unexpected error occurred. Please try again.";

  // Case 1: Direct string
  if (typeof data === "string") {
    return data;
  }

  // Case 2: Direct array
  if (Array.isArray(data)) {
    return data.map(item => (typeof item === "string" ? item : extractApiError(item))).join(", ");
  }

  // Case 3: Object handling (DRF response)
  if (typeof data === "object" && data !== null) {
    if (data.detail && typeof data.detail === "string") return data.detail;
    if (data.error && typeof data.error === "string") return data.error;
    if (data.message && typeof data.message === "string") return data.message;
    if (data.non_field_errors) {
      return Array.isArray(data.non_field_errors) 
        ? data.non_field_errors.join(", ") 
        : String(data.non_field_errors);
    }

    const entries = Object.entries(data);
    if (entries.length > 0) {
      const messages: string[] = [];
      for (const [key, val] of entries) {
        const fieldName = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        if (Array.isArray(val)) {
          messages.push(`${fieldName}: ${val.join(", ")}`);
        } else if (typeof val === "string") {
          messages.push(`${fieldName}: ${val}`);
        } else if (typeof val === "object" && val !== null) {
          messages.push(`${fieldName}: ${JSON.stringify(val)}`);
        }
      }
      if (messages.length > 0) return messages.join(" | ");
    }
  }

  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

