import * as XLSX from "xlsx";

export interface ProductoExcelRaw {
  descripcion: string;
  precio: number;
}

export interface ProductoProcesado {
  name: string;
  costTech: number;
  costTechMargin: number;
  type: string;
  quality: string;
}

export function limpiarPrecio(precioStr: string | number): number {
  if (!precioStr) return 0;
  
  const str = precioStr.toString();
  const cleaned = str.replace(/[$.]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function extraerNombreBase(descripcion: string): string {
  let nombre = descripcion.trim();
  
  nombre = nombre.replace(/^•\s*/, "");
  nombre = nombre.replace(/\s+(Mecanico|wp|gold|Black|Negro|Blanco|Dorado|C\/M|S\/L|incell|oled|AMM|AMP|ASS|SERVICE PACK|PACK|\(.*?\)).*$/i, "");
  
  return nombre.trim();
}

export function detectarMarca(linea: string): string | null {
  const marcas = [
    { pattern: /SAMSUNG/i, nombre: "SAMSUNG" },
    { pattern: /MOTOROLA/i, nombre: "MOTOROLA" },
    { pattern: /IPHONE|APPLE/i, nombre: "IPHONE" },
    { pattern: /XIAOMI/i, nombre: "XIAOMI" },
    { pattern: /REALME/i, nombre: "REALME" },
    { pattern: /TCL/i, nombre: "TCL" },
    { pattern: /ALCATEL/i, nombre: "ALCATEL" },
    { pattern: /ZTE/i, nombre: "ZTE" },
    { pattern: /TECNO SPARK|TECTNO SPARK/i, nombre: "TECNO SPARK" },
    { pattern: /INFINIX/i, nombre: "INFINIX" },
    { pattern: /NUBIA/i, nombre: "NUBIA" },
    { pattern: /LG/i, nombre: "LG" },
  ];

  for (const marca of marcas) {
    if (marca.pattern.test(linea)) {
      return marca.nombre;
    }
  }

  return null;
}

export async function procesarExcelFile(file: File): Promise<ProductoProcesado[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const productosRaw: { marca: string; descripcion: string; precio: number }[] = [];
  let marcaActual = "";

  for (const fila of data) {
    if (!fila || fila.length === 0) continue;

    const primeraColumna = fila[0]?.toString() || "";
    const segundaColumna = fila[1];

    const marca = detectarMarca(primeraColumna);
    if (marca) {
      marcaActual = marca;
      continue;
    }

    if (primeraColumna.includes("•") && segundaColumna) {
      const descripcion = primeraColumna.trim();
      const precio = limpiarPrecio(segundaColumna);

      if (precio > 0 && descripcion) {
        productosRaw.push({
          marca: marcaActual,
          descripcion,
          precio,
        });
      }
    }
  }

  const agrupados = new Map<string, { marca: string; precios: number[] }>();

  for (const item of productosRaw) {
    const nombreBase = extraerNombreBase(item.descripcion);
    const key = `${item.marca}-${nombreBase}`;

    if (!agrupados.has(key)) {
      agrupados.set(key, { marca: item.marca, precios: [] });
    }

    agrupados.get(key)!.precios.push(item.precio);
  }

  const productosProcesados: ProductoProcesado[] = [];

  for (const [key, data] of agrupados) {
    const nombreBase = key.split("-").slice(1).join("-");
    const promedio = data.precios.reduce((a, b) => a + b, 0) / data.precios.length;

    productosProcesados.push({
      name: `${data.marca} ${nombreBase}`.trim(),
      costTech: Math.round(promedio),
      costTechMargin: 100,
      type: "MODULO",
      quality: "OLED",
    });
  }

  return productosProcesados;
}
