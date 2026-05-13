import nodemailer from "nodemailer";
import { formatDate } from "@/utils/formatters.util";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface ServiceOrderEmailData {
  clientName: string;
  clientPhone: string;
  branchName?: string;
  products: {
    productName: string;
    cost: number;
  }[];
  totalTech: number;
  deliveryDate?: string;
  orderNumber: string;
}

export const emailService = {
  async sendServiceOrderNotification(data: ServiceOrderEmailData) {
    const techEmail = process.env.SMTP_TECH_EMAIL;

    if (!techEmail) {
      console.error("SMTP_TECH_EMAIL no está configurado");
      return;
    }

    const productsList = data.products
      .map((p) => `<li><strong>${p.productName}</strong>: $${p.cost.toLocaleString("es-AR")}</li>`)
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .info-row {
              margin: 15px 0;
              padding: 10px;
              background: #f5f5f5;
              border-left: 4px solid #667eea;
            }
            .label {
              font-weight: bold;
              color: #667eea;
            }
            .products {
              margin: 20px 0;
            }
            .products ul {
              list-style: none;
              padding: 0;
            }
            .products li {
              padding: 10px;
              margin: 5px 0;
              background: #f0f0f0;
              border-radius: 5px;
            }
            .total {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              text-align: right;
              margin-top: 20px;
              padding: 15px;
              background: #f0f0f0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 Nueva Orden de Servicio</h1>
              <p>Orden #${data.orderNumber}</p>
            </div>
            <div class="content">
              <h2>Detalles de la Orden</h2>
              
              <div class="info-row">
                <span class="label">Cliente:</span> ${data.clientName}
              </div>
              
              <div class="info-row">
                <span class="label">Teléfono:</span> ${data.clientPhone}
              </div>
              
              ${
                data.branchName
                  ? `
              <div class="info-row">
                <span class="label">Sucursal:</span> ${data.branchName}
              </div>
              `
                  : ""
              }
              
              ${
                data.deliveryDate
                  ? `
              <div class="info-row">
                <span class="label">Fecha de Entrega:</span> <strong>${formatDate(data.deliveryDate)}</strong>
              </div>
              `
                  : ""
              }
              
              <div class="products">
                <h3>Servicios a Realizar:</h3>
                <ul>
                  ${productsList}
                </ul>
              </div>
              
              <div class="total">
                Total Técnico: $${data.totalTech.toLocaleString("es-AR")}
              </div>
              
              <div class="footer">
                <p>Este es un correo automático. Por favor no responder.</p>
                <p>Sistema de Gestión de Servicios Técnicos</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: techEmail,
        subject: `🔧 Nueva Orden de Servicio #${data.orderNumber} - ${data.clientName}`,
        html: htmlContent,
      });

      console.log(`Email enviado exitosamente a ${techEmail}`);
    } catch (error) {
      console.error("Error al enviar email:", error);
      throw error;
    }
  },
};
