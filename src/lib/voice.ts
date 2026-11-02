export interface Recording {
  id: string;
  createdAt: string;
  seconds: number;
  type: string;
}

/** En IndexedDB: la lista vive en LIST_KEY y cada audio en `voz:<id>`. */
export const LIST_KEY = "voz:lista";
export const audioKey = (id: string) => `voz:${id}`;
