import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const NAVY = "#0B2545";
const NAVY_LIGHT = "#2C5A9C";
const GOLD = "#C9A227";
const GOLD_LIGHT = "#F6E7B4";
const SLATE = "#64748B";
const GREEN = "#059669";
const RED = "#DC2626";
const BG_TINT = "#F8FAFC";

const LOGO_PATH = path.join(process.cwd(), "assets", "logo.png");
const hasLogo = fs.existsSync(LOGO_PATH);

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount || 0,
  );

const drawWatermark = (doc) => {
  if (!hasLogo) return;
  doc.save();
  doc.opacity(0.06);
  doc.image(LOGO_PATH, 140, 280, { width: 320 });
  doc.opacity(1);
  doc.restore();
};

/**
 * Streams a PDF account statement directly to the HTTP response.
 */
export const generateStatementPdf = ({
  res,
  user,
  account,
  transactions,
  periodLabel,
  openingBalance,
  closingBalance,
}) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  drawWatermark(doc);

  // --- Header band ---
  doc.rect(0, 0, 595, 100).fillColor(NAVY).fill();
  doc.rect(0, 96, 595, 4).fillColor(GOLD).fill();

  if (hasLogo) {
    doc.image(LOGO_PATH, 50, 24, { width: 48, height: 48 });
    doc
      .fillColor("#FFFFFF")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Swiss Meridian Bank", 108, 32);
    doc
      .fillColor(GOLD_LIGHT)
      .fontSize(9)
      .font("Helvetica")
      .text("Account Statement", 108, 56);
  } else {
    doc
      .fillColor("#FFFFFF")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Swiss Meridian Bank", 50, 32);
    doc
      .fillColor(GOLD_LIGHT)
      .fontSize(9)
      .font("Helvetica")
      .text("Account Statement", 50, 56);
  }

  doc
    .fillColor("#CBD5E1")
    .fontSize(9)
    .text(`Statement Period: ${periodLabel}`, 350, 32, {
      width: 195,
      align: "right",
    })
    .text(`Generated: ${new Date().toLocaleDateString("en-US")}`, 350, 46, {
      width: 195,
      align: "right",
    });

  // --- Account info ---
  let y = 125;
  doc
    .fillColor(NAVY)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Account Holder", 50, y);
  doc
    .fillColor(SLATE)
    .fontSize(10)
    .font("Helvetica")
    .text(`${user.firstName} ${user.lastName}`, 50, y + 16);
  doc.fillColor(NAVY_LIGHT).text(user.email, 50, y + 30);

  doc
    .fillColor(NAVY)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Account Details", 300, y);
  doc
    .fillColor(SLATE)
    .fontSize(10)
    .font("Helvetica")
    .text("Account Number: ", 300, y + 16, { continued: true })
    .fillColor(NAVY_LIGHT)
    .font("Helvetica-Bold")
    .text(account.accountNumber);
  doc
    .fillColor(SLATE)
    .font("Helvetica")
    .text("Account Type: ", 300, y + 30, { continued: true })
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .text(
      account.accountType.replace("_", " ") +
        (account.isJoint ? " (Joint)" : ""),
    );
  doc
    .fillColor(SLATE)
    .font("Helvetica")
    .text("Currency: ", 300, y + 44, { continued: true })
    .fillColor(NAVY_LIGHT)
    .font("Helvetica-Bold")
    .text(account.currency);

  y += 75;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#E2E8F0").lineWidth(1).stroke();
  y += 15;

  // --- Balance summary (colored cards) ---
  const cardWidth = 158;
  const cardGap = 10;

  doc.roundedRect(50, y, cardWidth, 58, 6).fillColor(BG_TINT).fill();
  doc.roundedRect(50, y, 4, 58).fillColor(NAVY_LIGHT).fill();
  doc
    .fillColor(SLATE)
    .fontSize(8.5)
    .font("Helvetica")
    .text("OPENING BALANCE", 62, y + 12);
  doc
    .fillColor(NAVY)
    .fontSize(15)
    .font("Helvetica-Bold")
    .text(formatMoney(openingBalance, account.currency), 62, y + 27);

  const x2 = 50 + cardWidth + cardGap;
  doc.roundedRect(x2, y, cardWidth, 58, 6).fillColor(BG_TINT).fill();
  doc.roundedRect(x2, y, 4, 58).fillColor(GOLD).fill();
  doc
    .fillColor(SLATE)
    .fontSize(8.5)
    .font("Helvetica")
    .text("CLOSING BALANCE", x2 + 12, y + 12);
  doc
    .fillColor(NAVY)
    .fontSize(15)
    .font("Helvetica-Bold")
    .text(formatMoney(closingBalance, account.currency), x2 + 12, y + 27);

  const x3 = x2 + cardWidth + cardGap;
  doc.roundedRect(x3, y, cardWidth, 58, 6).fillColor(BG_TINT).fill();
  doc.roundedRect(x3, y, 4, 58).fillColor(GREEN).fill();
  doc
    .fillColor(SLATE)
    .fontSize(8.5)
    .font("Helvetica")
    .text("TOTAL TRANSACTIONS", x3 + 12, y + 12);
  doc
    .fillColor(NAVY)
    .fontSize(15)
    .font("Helvetica-Bold")
    .text(String(transactions.length), x3 + 12, y + 27);

  y += 80;

  // --- Transaction table header ---
  doc
    .fillColor(NAVY)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Transaction History", 50, y);
  y += 22;

  const colX = { date: 50, desc: 130, ref: 320, amount: 480 };

  doc
    .roundedRect(50, y - 4, 495, 22, 4)
    .fillColor(NAVY)
    .fill();
  doc
    .fillColor("#FFFFFF")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("DATE", colX.date + 8, y + 2)
    .text("DESCRIPTION", colX.desc, y + 2)
    .text("REFERENCE", colX.ref, y + 2)
    .text("AMOUNT", colX.amount, y + 2, { width: 57, align: "right" });
  y += 26;

  if (transactions.length === 0) {
    doc
      .fillColor(SLATE)
      .fontSize(10)
      .font("Helvetica")
      .text("No transactions during this period.", 50, y);
    y += 20;
  }

  transactions.forEach((tx, i) => {
    if (y > 700) {
      doc.addPage();
      drawWatermark(doc);
      y = 50;
    }

    if (i % 2 === 0) {
      doc
        .rect(50, y - 4, 495, 20)
        .fillColor("#F8FAFC")
        .fill();
    }

    const isCredit =
      tx.receiver?.toString() === user._id.toString() ||
      tx.type === "adjustment_credit" ||
      tx.type === "loan_disbursement";
    const sign = isCredit ? "+" : "-";
    const color = isCredit ? GREEN : RED;

    doc
      .fillColor(SLATE)
      .fontSize(8.5)
      .font("Helvetica")
      .text(
        new Date(tx.createdAt).toLocaleDateString("en-US"),
        colX.date + 8,
        y,
        { width: 75 },
      )
      .text((tx.description || tx.category || "").slice(0, 35), colX.desc, y, {
        width: 180,
      })
      .fillColor(NAVY_LIGHT)
      .text(tx.reference, colX.ref, y, { width: 150 });
    doc
      .fillColor(color)
      .font("Helvetica-Bold")
      .text(`${sign}${formatMoney(tx.amount, tx.currency)}`, colX.amount, y, {
        width: 57,
        align: "right",
      });

    y += 20;
  });

  // --- Footer ---
  const footerY = 770;
  doc
    .moveTo(50, footerY - 12)
    .lineTo(545, footerY - 12)
    .strokeColor(GOLD)
    .lineWidth(1)
    .stroke();
  doc
    .fillColor(SLATE)
    .fontSize(8)
    .font("Helvetica")
    .text(
      "Swiss Meridian Bank, Member FDIC. Deposits insured up to $250,000 per depositor, per ownership category. This statement is provided for informational purposes only.",
      50,
      footerY,
      { width: 495, align: "center" },
    );

  doc.end();
};
