import * as XLSX from "xlsx";

export interface ProductoExcelRaw {
  descripcion: string;
  precio: number;
}

export interface ProductoProcesado {
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

export function limpiarPrecio(precioStr: string | number): number {
  if (!precioStr) return 0;

  const str = precioStr.toString();
  const cleaned = str.replace(/[$.]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
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

export async function procesarExcelFile(file: File, productType: string = "MODULO"): Promise<ProductoProcesado[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

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

function procesarFormatoTresColumnas(data: any[][], productType: string): ProductoProcesado[] {
  const productosProcesados: ProductoProcesado[] = [];
  const agrupados = new Map<string, number[]>();

  for (let i = 0; i < data.length; i++) {
    const fila = data[i];

    if (!fila || fila.length < 3 || (!fila[0] && !fila[1] && !fila[2])) {
      continue;
    }

    const columna1 = fila[0]?.toString().trim() || "";
    const columna2 = fila[1]?.toString().trim() || "";
    const precio = limpiarPrecio(fila[2]);

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
    const cost = costTech * 8;

    productosProcesados.push({
      name: nombreProducto,
      costTech,
      costTechMargin: 700,
      cost,
      costMargin: 700,
      cash: cost * 2,
      cashMargin: 100,
      credit: cost * 2.2,
      creditMargin: 120,
      type: productType,
    });
  }

  return productosProcesados;
}

function procesarFormatoSimple(data: any[][], productType: string): ProductoProcesado[] {
  const productosProcesados: ProductoProcesado[] = [];
  const agrupados = new Map<string, number[]>();

  for (let i = 0; i < data.length; i++) {
    const fila = data[i];

    if (!fila || fila.length < 2 || (!fila[0] && !fila[1])) {
      continue;
    }

    const descripcion = fila[0]?.toString().trim() || "";
    const precio = limpiarPrecio(fila[1]);

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
    const cost = costTech * 2.5;
    const productName = `${productType} ${nombreProducto}`;

    productosProcesados.push({
      name: productName,
      costTech,
      costTechMargin: 150,
      cost,
      costMargin: 150,
      cash: cost * 2,
      cashMargin: 100,
      credit: cost * 2.2,
      creditMargin: 120,
      type: productType,
    });
  }

  return productosProcesados;
}

function procesarFormatoModulos(data: any[][], productType: string): ProductoProcesado[] {
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
      const precios = items.map((p) => p.precio);
      const promedio = precios.reduce((a, b) => a + b, 0) / precios.length;
      const costTech = Math.round(promedio);
      const cost = costTech * 2;
      const productName = `${productType} ${nombreProducto}`;

      productosProcesados.push({
        name: productName,
        costTech,
        costTechMargin: 100,
        cost,
        costMargin: 100,
        cash: cost * 2,
        cashMargin: 100,
        credit: cost * 2.2,
        creditMargin: 120,
        type: productType,
      });

      const itemsCM = items.filter((p) => /c\/m/i.test(p.descripcion));

      if (itemsCM.length > 0) {
        const preciosCM = itemsCM.map((p) => p.precio);
        const promedioCM = preciosCM.reduce((a, b) => a + b, 0) / preciosCM.length;
        const costTechCM = Math.round(promedioCM);
        const costCM = costTechCM * 2;

        productosProcesados.push({
          name: `${productType} ${nombreProducto} C/M`,
          costTech: costTechCM,
          costTechMargin: 100,
          cost: costCM,
          costMargin: 100,
          cash: costCM * 2,
          cashMargin: 100,
          credit: costCM * 2.2,
          creditMargin: 120,
          type: productType,
        });
      }
    }
  }

  return productosProcesados;
}
