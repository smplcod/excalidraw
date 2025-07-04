import { serializeAsJSON } from "@excalidraw/excalidraw/data/json";

import type { ImportedDataState } from "@excalidraw/excalidraw/data/types";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

const SUPABASE_URL = import.meta.env.VITE_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_APP_SUPABASE_ANON_KEY;

const baseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export const saveToSupabase = async (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
  name?: string,
): Promise<{ id: string }> => {
  const payload = JSON.parse(
    serializeAsJSON(elements, appState, files, "database"),
  );

  const body: Record<string, any> = { data: payload };
  if (name) {
    body.name = name;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/drawings`, {
    method: "POST",
    headers: { ...baseHeaders, Prefer: "return=representation" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to save drawing");
  }

  const json = await response.json();
  return { id: json[0].id as string };
};

export const loadFromSupabase = async (
  id: string,
): Promise<ImportedDataState> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/drawings?id=eq.${id}&select=data`,
    {
      headers: baseHeaders,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load drawing");
  }

  const json = await response.json();
  return (json[0]?.data as ImportedDataState) || {};
};

export const listSupabaseDrawings = async (): Promise<
  {
    id: string;
    name: string | null;
  }[]
> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/drawings?select=id,name`,
    { headers: baseHeaders },
  );

  if (!response.ok) {
    throw new Error("Failed to list drawings");
  }

  return (await response.json()) as { id: string; name: string | null }[];
};
