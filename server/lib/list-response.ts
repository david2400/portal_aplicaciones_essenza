/**
 * Normaliza respuestas de listado.
 *
 * La spec (`endpoint.json`) no declara el esquema de respuesta de los
 * endpoints `getAll`, y el backend puede devolver un arreglo plano, un
 * envoltorio `{ data: [] }` o una página de Spring (`{ content: [] }`).
 * Las pantallas siempre reciben un arreglo.
 */
export function to_list<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === 'object') {
    const record = response as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.content)) return record.content as T[];
    if (Array.isArray(record.items)) return record.items as T[];
  }
  return [];
}
