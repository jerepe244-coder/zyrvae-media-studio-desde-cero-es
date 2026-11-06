// Gestor de Proyectos Locales y Borradores de ZYRVAE Media Studio
// Permite al usuario guardar sus creaciones, reutilizarlas y editarlas sin perder su trabajo.

export interface SavedProject {
  id: string;
  title: string;
  htmlCode: string;
  durationSeconds: number;
  aspectRatio: "9:16" | "16:9" | "1:1";
  updatedAt: string;
  type: "draft" | "rendered";
  category?: string;
}

const STORAGE_KEY = "zyrvae_user_saved_projects";

export function getSavedProjects(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[UserLibrary] Error al leer proyectos guardados:", err);
    return [];
  }
}

export function saveProject(
  project: {
    id?: string;
    title: string;
    htmlCode: string;
    durationSeconds?: number;
    aspectRatio?: "9:16" | "16:9" | "1:1";
    type?: "draft" | "rendered";
    category?: string;
  }
): SavedProject {
  if (typeof window === "undefined") {
    return {
      id: project.id || "local",
      title: project.title,
      htmlCode: project.htmlCode,
      durationSeconds: project.durationSeconds || 15,
      aspectRatio: project.aspectRatio || "9:16",
      updatedAt: new Date().toISOString(),
      type: project.type || "draft",
      category: project.category || "General",
    };
  }

  try {
    const current = getSavedProjects();
    const id = project.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const existingIndex = current.findIndex((p) => p.id === id);
    const updatedItem: SavedProject = {
      id,
      title: (project.title && project.title.trim()) || "Proyecto Sin Título",
      htmlCode: project.htmlCode,
      durationSeconds: project.durationSeconds || 15,
      aspectRatio: project.aspectRatio || "9:16",
      updatedAt: nowIso,
      type: project.type || "draft",
      category: project.category || "General",
    };

    let nextList: SavedProject[];
    if (existingIndex >= 0) {
      nextList = [...current];
      nextList[existingIndex] = updatedItem;
    } else {
      nextList = [updatedItem, ...current];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    // Disparar evento para sincronización entre pestañas o componentes
    window.dispatchEvent(new Event("zyrvae_projects_updated"));
    return updatedItem;
  } catch (err) {
    console.error("[UserLibrary] Error al guardar proyecto:", err);
    throw err;
  }
}

export function deleteSavedProject(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedProjects();
    const filtered = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("zyrvae_projects_updated"));
  } catch (err) {
    console.error("[UserLibrary] Error al eliminar proyecto:", err);
  }
}

export function getSavedProjectById(id: string): SavedProject | undefined {
  const all = getSavedProjects();
  return all.find((p) => p.id === id);
}
