import nodemailer from "nodemailer";
import { formatCurrency, formatDate } from "@/utils/formatters.util";
import {
  EMAIL_HEADER_TITLE,
  EMAIL_SECTION_DETALLES,
  EMAIL_LABEL_CLIENTE,
  EMAIL_LABEL_TELEFONO,
  EMAIL_LABEL_RETIRO_SUCURSAL,
  EMAIL_LABEL_FECHA_ENTREGA,
  EMAIL_LABEL_SERVICIOS,
  EMAIL_LABEL_COSTO_TECNICO_OS,
  EMAIL_FOOTER_AUTOMATICO,
  EMAIL_FOOTER_SISTEMA,
} from "@/constants/serviceOrder.constant";

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
    unitCostTech: number;
  }[];
  totalCostTech: number;
  deliveryDate?: string;
  orderNumber: string;
}

export const emailService = {
  async sendServiceOrderNotification(data: ServiceOrderEmailData) {
    const techEmail = process.env.SMTP_TECH_EMAIL;

    if (!techEmail) {
      return;
    }

    const productsList = data.products
      .map((p) => `<li><strong>${p.productName}</strong>: ${formatCurrency(p.unitCostTech)}</li>`)
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
              <h1>${EMAIL_HEADER_TITLE}</h1>
              <p>Orden #${data.orderNumber}</p>
            </div>
            <div class="content">
              <h2>${EMAIL_SECTION_DETALLES}</h2>

              <div class="info-row">
                <span class="label">${EMAIL_LABEL_CLIENTE}</span> ${data.clientName}
              </div>

              <div class="info-row">
                <span class="label">${EMAIL_LABEL_TELEFONO}</span> ${data.clientPhone}
              </div>

              ${
                data.branchName
                  ? `
              <div class="info-row">
                <span class="label">${EMAIL_LABEL_RETIRO_SUCURSAL}</span> ${data.branchName}
              </div>
              `
                  : ""
              }

              ${
                data.deliveryDate
                  ? `
              <div class="info-row">
                <span class="label">${EMAIL_LABEL_FECHA_ENTREGA}</span> <strong>${formatDate(data.deliveryDate)}</strong>
              </div>
              `
                  : ""
              }

              <div class="products">
                <h3>${EMAIL_LABEL_SERVICIOS}</h3>
                <ul>
                  ${productsList}
                </ul>
              </div>

              <div class="total">
                ${EMAIL_LABEL_COSTO_TECNICO_OS} ${formatCurrency(data.totalCostTech)}
              </div>

              <div class="footer">
                <p>${EMAIL_FOOTER_AUTOMATICO}</p>
                <p>${EMAIL_FOOTER_SISTEMA}</p>
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
        subject: `${EMAIL_HEADER_TITLE} #${data.orderNumber} - ${data.clientName}`,
        html: htmlContent,
      });
    } catch (error) {
      throw error;
    }
  },
};
