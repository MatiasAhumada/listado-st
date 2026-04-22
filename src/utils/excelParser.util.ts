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
  nombre = nombre.replace(/\s+(Mecanico|wp|gold|wuzip|Black|Negro|Blanco|Dorado|Plateado|Azul|Rojo|Verde|Rosa|C\/M|S\/L|incell|oled|AMM|AMP|ASS|SERVICE PACK|PACK|\(.*?\)|1ra calidad|2da calidad).*$/i, "");
  
  nombre = nombre.replace(/\s+\/.*$/, "");
  
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

  const grupos: { marca: string; productos: { descripcion: string; precio: number }[] }[] = [];
  let marcaActual = "";
  let grupoActual: { descripcion: string; precio: number }[] = [];

  for (let i = 0; i < data.length; i++) {
    const fila = data[i];
    
    if (!fila || fila.length === 0 || (!fila[0] && !fila[1])) {
      if (grupoActual.length > 0) {
        grupos.push({ marca: marcaActual, productos: [...grupoActual] });
        grupoActual = [];
      }
      continue;
    }

    const primeraColumna = fila[0]?.toString() || "";
    const segundaColumna = fila[1];

    const marca = detectarMarca(primeraColumna);
    if (marca) {
      if (grupoActual.length > 0) {
        grupos.push({ marca: marcaActual, productos: [...grupoActual] });
        grupoActual = [];
      }
      marcaActual = marca;
      continue;
    }

    if (primeraColumna.includes("•") && segundaColumna) {
      const descripcion = primeraColumna.trim();
      const precio = limpiarPrecio(segundaColumna);

      if (precio > 0 && descripcion) {
        grupoActual.push({ descripcion, precio });
      }
    }
  }

  if (grupoActual.length > 0) {
    grupos.push({ marca: marcaActual, productos: [...grupoActual] });
  }

  const productosProcesados: ProductoProcesado[] = [];

  for (const grupo of grupos) {
    if (grupo.productos.length === 0) continue;

    const nombreBase = extraerNombreBase(grupo.productos[0].descripcion);
    const precios = grupo.productos.map((p) => p.precio);
    const promedio = precios.reduce((a, b) => a + b, 0) / precios.length;

    productosProcesados.push({
      name: `${grupo.marca} ${nombreBase}`.trim(),
      costTech: Math.round(promedio),
      costTechMargin: 100,
      type: "MODULO",
      quality: "OLED",
    });
  }

  return productosProcesados;
}
