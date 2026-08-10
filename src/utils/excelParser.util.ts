import * as XLSX from "xlsx";
import { TECH_MARGIN_MODULO, TECH_MARGIN_BATERIA, TECH_MARGIN_BOTON } from "@/constants/pricing.constant";

export interface ServicioExcelRaw {
  descripcion: string;
  precio: number;
}

export interface ServicioProcesado {
  name: string;
  costTech: number;
  costTechMargin: number;
  cost: number;
  costMargin: number;
  cash: number;
  cashMargin: number;
  credit: number;
  creditMargin: number;
  type: string;
}

export type ProductoExcelRaw = ServicioExcelRaw;
export type ProductoProcesado = ServicioProcesado;
type ExcelCell = string | number | boolean | Date | null | undefined;
type ExcelRow = ExcelCell[];

export function limpiarPrecio(precioStr: string | number): number {
  if (!precioStr) return 0;

  const str = precioStr.toString();
  const cleaned = str.replace(/[$.]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function leerCelda(celda: ExcelCell): string {
  return celda?.toString().trim() ?? "";
}

function leerPrecio(celda: ExcelCell): number {
  return limpiarPrecio(leerCelda(celda));
}

export function esVarianteRtech(descripcion: string): boolean {
  return /r[-\s]?tech/i.test(descripcion);
}

export function tieneClaveRemovible(descripcion: string): boolean {
  return /\s+(Mecanico|wp|gold|wuzip|Black|Negro|Blanco|Dorado|Plateado|Azul|Rojo|Verde|Rosa|Crown|Repart|REPART|GX|gx|caja naranja|naranja|S\/L|incell|oled|AMM|AMP|ASS|SERVICE PACK|PACK|1ra calidad|2da calidad)/i.test(
    descripcion
  );
}

export function extraerNombreBase(descripcion: string): string {
  let nombre = descripcion.trim();

  nombre = nombre.replace(/^•\s*/, "");

  nombre = nombre.replace(/\(.*?\)/g, "");

  nombre = nombre.replace(/\s+-+.*$/g, "");

  nombre = nombre.replace(
    /\s+(Mecanico|wp|gold|wuzip|Black|Negro|Blanco|Dorado|Plateado|Azul|Rojo|Verde|Rosa|Crown|Repart|REPART|GX|gx|caja naranja|naranja|S\/L|incell|oled|AMM|AMP|ASS|SERVICE PACK|PACK|1ra calidad|2da calidad).*$/i,
    ""
  );

  nombre = nombre.replace(/\s+\/.*$/, "");

  nombre = nombre.replace(/\s*-+\s*$/g, "");
  nombre = nombre.replace(/\s+/g, " ");

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

export async function procesarExcelFile(file: File, productType: string = "MODULO"): Promise<ServicioProcesado[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1 });

  if (productType === "VIDRIOS_CAMARA" || productType === "BOTON_POWER" || productType === "BANDEJA_SIM") {
    return procesarFormatoTresColumnas(data, productType);
  }

  if (
    productType === "BATERIA" ||
    productType === "PIN" ||
    productType === "CONSOLA" ||
    productType === "FLEX" ||
    productType === "SOFTWARE"
  ) {
    return procesarFormatoSimple(data, productType);
  }

  return procesarFormatoModulos(data, productType);
}

function procesarFormatoTresColumnas(data: ExcelRow[], productType: string): ServicioProcesado[] {
  const productosProcesados: ServicioProcesado[] = [];
  const agrupados = new Map<string, number[]>();

  for (let i = 0; i < data.length; i++) {
    const fila = data[i];

    if (!fila || fila.length < 3 || (!fila[0] && !fila[1] && !fila[2])) {
      continue;
    }

    const columna1 = leerCelda(fila[0]);
    const columna2 = leerCelda(fila[1]);
    const precio = leerPrecio(fila[2]);

    if (precio > 0 && columna1 && columna2) {
      const nombreCompleto = `${columna1} ${columna2}`.trim();
      const nombreLimpio = extraerNombreBase(nombreCompleto);
      const clave = nombreLimpio.trim();

      if (!agrupados.has(clave)) {
        agrupados.set(clave, []);
      }
      agrupados.get(clave)!.push(precio);
    }
  }

  for (const [nombreProducto, precios] of agrupados) {
    const promedio = precios.reduce((a, b) => a + b, 0) / precios.length;
    const costTech = Math.round(promedio);
    const cost = costTech * (1 + TECH_MARGIN_BOTON / 100);

    productosProcesados.push({
      name: nombreProducto,
      costTech,
      costTechMargin: TECH_MARGIN_BOTON,
      cost,
      costMargin: TECH_MARGIN_BOTON,
      cash: cost * 2,
      cashMargin: 100,
      credit: cost * 2.2,
      creditMargin: 120,
      type: productType,
    });
  }

  return productosProcesados;
}

function procesarFormatoSimple(data: ExcelRow[], productType: string): ServicioProcesado[] {
  const productosProcesados: ServicioProcesado[] = [];
  const agrupados = new Map<string, number[]>();

  for (let i = 0; i < data.length; i++) {
    const fila = data[i];

    if (!fila || fila.length < 2 || (!fila[0] && !fila[1])) {
      continue;
    }

    const descripcion = leerCelda(fila[0]);
    const precio = leerPrecio(fila[1]);

    if (precio > 0 && descripcion) {
      const nombreLimpio = extraerNombreBase(descripcion);
      const clave = nombreLimpio.trim();

      if (!agrupados.has(clave)) {
        agrupados.set(clave, []);
      }
      agrupados.get(clave)!.push(precio);
    }
  }

  for (const [nombreProducto, precios] of agrupados) {
    const promedio = precios.reduce((a, b) => a + b, 0) / precios.length;
    const costTech = Math.round(promedio);
    const cost = costTech * (1 + TECH_MARGIN_BATERIA / 100);
    const productName = `${productType} ${nombreProducto}`;

    productosProcesados.push({
      name: productName,
      costTech,
      costTechMargin: TECH_MARGIN_BATERIA,
      cost,
      costMargin: TECH_MARGIN_BATERIA,
      cash: cost * 2,
      cashMargin: 100,
      credit: cost * 2.2,
      creditMargin: 120,
      type: productType,
    });
  }

  return productosProcesados;
}

function procesarFormatoModulos(data: ExcelRow[], productType: string): ServicioProcesado[] {
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

    const primeraColumna = leerCelda(fila[0]);
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
      const precio = leerPrecio(segundaColumna);

      if (precio > 0 && descripcion && !esVarianteRtech(descripcion)) {
        grupoActual.push({ descripcion, precio });
      }
    }
  }

  if (grupoActual.length > 0) {
    grupos.push({ marca: marcaActual, productos: [...grupoActual] });
  }

  const productosProcesados: ServicioProcesado[] = [];

  for (const grupo of grupos) {
    if (grupo.productos.length === 0) continue;

    const agrupados = new Map<string, { descripcion: string; precio: number }[]>();

    for (const producto of grupo.productos) {
      const nombreLimpio = extraerNombreBase(producto.descripcion);
      const clave = `${grupo.marca} ${nombreLimpio}`.trim();

      if (!agrupados.has(clave)) {
        agrupados.set(clave, []);
      }
      agrupados.get(clave)!.push(producto);
    }

    for (const [nombreProducto, items] of agrupados) {
      const itemsCM = items.filter((p) => /c\/m/i.test(p.descripcion));
      const itemsSinCM = items.filter((p) => !/c\/m/i.test(p.descripcion));

      let costTech: number;
      let productName: string;

      if (itemsCM.length > 0) {
        const preciosCM = itemsCM.map((p) => p.precio);
        const promedioCM = preciosCM.reduce((a, b) => a + b, 0) / preciosCM.length;
        costTech = Math.round(promedioCM);
        productName = `${productType} ${nombreProducto} C/M`;
      } else {
        const preciosSinCM = itemsSinCM.map((p) => p.precio);
        const promedioSinCM = preciosSinCM.reduce((a, b) => a + b, 0) / preciosSinCM.length;
        costTech = Math.round(promedioSinCM);
        productName = `${productType} ${nombreProducto}`;
      }

      const cost = costTech * (1 + TECH_MARGIN_MODULO / 100);

      productosProcesados.push({
        name: productName,
        costTech,
        costTechMargin: TECH_MARGIN_MODULO,
        cost,
        costMargin: TECH_MARGIN_MODULO,
        cash: cost * 2,
        cashMargin: 100,
        credit: cost * 2.2,
        creditMargin: 120,
        type: productType,
      });
    }
  }

  return productosProcesados;
}
