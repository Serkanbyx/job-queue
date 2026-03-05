import PDFDocument from "pdfkit";
import { Parser as CsvParser } from "json2csv";
import fs from "fs";
import path from "path";
import { ReportJobPayload } from "../schemas/reportSchema";
import { logger } from "../utils/logger";

const REPORTS_DIR = path.resolve(process.cwd(), "reports");

const ensureReportsDir = () => {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
};

export interface ReportResult {
  filePath: string;
  fileName: string;
  type: string;
  recordCount: number;
}

const generatePdf = (payload: ReportJobPayload): Promise<ReportResult> => {
  return new Promise((resolve, reject) => {
    ensureReportsDir();

    const fileName = `${payload.title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);
    const writeStream = fs.createWriteStream(filePath);
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(writeStream);

    doc.fontSize(20).text(payload.title, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(`Generated: ${new Date().toISOString()}`, { align: "center" });
    doc.moveDown(2);

    if (payload.data.length > 0) {
      const headers = Object.keys(payload.data[0]);

      doc.fontSize(10).fillColor("#333");
      doc.text(headers.join(" | "), { underline: true });
      doc.moveDown(0.5);

      for (const row of payload.data) {
        const values = headers.map((h) => String(row[h] ?? ""));
        doc.text(values.join(" | "));
        doc.moveDown(0.3);
      }
    }

    doc.end();

    writeStream.on("finish", () => {
      logger.info(`PDF report generated: ${fileName}`);
      resolve({
        filePath,
        fileName,
        type: "pdf",
        recordCount: payload.data.length,
      });
    });

    writeStream.on("error", reject);
  });
};

const generateCsv = async (
  payload: ReportJobPayload
): Promise<ReportResult> => {
  ensureReportsDir();

  const fileName = `${payload.title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.csv`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const fields = Object.keys(payload.data[0]);
  const parser = new CsvParser({ fields });
  const csv = parser.parse(payload.data);

  fs.writeFileSync(filePath, csv, "utf-8");

  logger.info(`CSV report generated: ${fileName}`);

  return {
    filePath,
    fileName,
    type: "csv",
    recordCount: payload.data.length,
  };
};

export const generateReport = async (
  payload: ReportJobPayload
): Promise<ReportResult> => {
  if (payload.type === "pdf") {
    return generatePdf(payload);
  }
  return generateCsv(payload);
};
