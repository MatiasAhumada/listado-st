export const IMAGE_UPLOAD_CONFIG = {
  SUPPORTED_EXTENSIONS: [".jfif", ".jpg", ".jpeg", ".png", ".webp"],
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  OUTPUT_FORMAT: "webp",
  QUALITY: 85,
  EFFORT: 6,
} as const;

export const IMAGE_UPLOAD_MESSAGES = {
  UNSUPPORTED_FORMAT: "Formato de imagen no soportado. Use: JFIF, JPG, JPEG, PNG o WEBP",
  FILE_TOO_LARGE: "El archivo es demasiado grande. Máximo 10MB",
  UPLOAD_SUCCESS: "Imagen subida exitosamente",
  UPLOAD_ERROR: "Error al subir la imagen",
} as const;
