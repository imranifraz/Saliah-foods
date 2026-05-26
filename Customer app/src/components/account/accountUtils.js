import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { contactInfo } from "../../data/pages";
import { GST_LABEL } from "../../data/pricing";

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", percent: 0, color: "bg-cream-200" };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = [
    "bg-red-400/70",
    "bg-amber-400/80",
    "bg-gold-400/90",
    "bg-emerald-700/70",
    "bg-emerald-800",
  ];
  const idx = Math.min(score, 4);

  return {
    score: idx,
    label: labels[idx],
    percent: Math.min(100, 20 + idx * 20),
    color: colors[idx],
  };
}

export function getOrderStatusBadge(status) {
  if (status === "delivered") {
    return { label: "Delivered", className: "account-badge account-badge--delivered" };
  }
  if (status === "cancelled") {
    return { label: "Cancelled", className: "account-badge account-badge--cancelled" };
  }
  if (status === "placed" || status === "confirmed") {
    return { label: "Processing", className: "account-badge account-badge--processing" };
  }
  return { label: "In transit", className: "account-badge account-badge--pending" };
}

export function getPaymentStatusLabel(order) {
  if (order.customer?.payment?.status === "pending_configuration") return "Payment pending";
  if (order.status === "cancelled") {
    return order.paymentMethod === "razorpay" ? "Refund initiated" : "Refunded";
  }
  if (order.paymentMethod === "razorpay" || order.paymentMethod === "upi") return "Paid online";
  if (order.status === "delivered") return "Paid on delivery";
  return "Pay on delivery";
}

const COMPANY_NAME = "Saliah Foods";
const COMPANY_LOGO_URL = "/assets/application-logo.png";
const COMPANY_GST_NUMBER = (import.meta.env.VITE_SALIAH_GST_NUMBER ?? "").trim();

function formatInvoiceMoney(value) {
  return `Rs. ${Math.round(Number(value ?? 0)).toLocaleString("en-IN")}`;
}

function formatInvoiceDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInvoicePaymentMethod(order) {
  if (order.paymentMethod === "razorpay") return "Razorpay";
  if (order.paymentMethod === "upi") return "UPI";
  return "Cash on Delivery";
}

async function loadImageAsDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Logo asset could not be loaded");
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Logo asset could not be read"));
    reader.readAsDataURL(blob);
  });
}

export async function downloadOrderInvoice(order) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  let cursorY = 42;

  doc.setFillColor(22, 49, 42);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 108, 18, 18, "F");

  try {
    const logo = await loadImageAsDataUrl(COMPANY_LOGO_URL);
    doc.addImage(logo, "PNG", margin + 18, cursorY + 18, 150, 33);
  } catch {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(COMPANY_NAME, margin + 18, cursorY + 40);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("TAX INVOICE", pageWidth - margin - 18, cursorY + 32, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice No: ${order.id}`, pageWidth - margin - 18, cursorY + 54, { align: "right" });
  doc.text(`Invoice Date: ${formatInvoiceDate(order.createdAt)}`, pageWidth - margin - 18, cursorY + 70, {
    align: "right",
  });
  doc.text(`Payment: ${getInvoicePaymentMethod(order)}`, pageWidth - margin - 18, cursorY + 86, {
    align: "right",
  });

  cursorY += 132;

  doc.setTextColor(22, 49, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("From", margin, cursorY);
  doc.text("Bill To", pageWidth / 2 + 10, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const companyLines = [
    COMPANY_NAME,
    ...String(contactInfo.address ?? "")
      .split("\n")
      .filter(Boolean),
    `Phone: ${contactInfo.phone}`,
    `Email: ${contactInfo.email}`,
    `GSTIN: ${COMPANY_GST_NUMBER || "Not configured"}`,
  ];
  doc.text(companyLines, margin, cursorY + 18, { lineHeightFactor: 1.45 });

  const billingLines = [
    order.customer?.fullName ?? "Customer",
    ...[
      order.customer?.addressLine1,
      order.customer?.addressLine2,
      [order.customer?.city, order.customer?.state].filter(Boolean).join(", "),
      order.customer?.pincode,
    ].filter(Boolean),
    `Phone: ${order.customer?.phone ?? "-"}`,
    `Email: ${order.customer?.email ?? "-"}`,
  ];
  doc.text(billingLines, pageWidth / 2 + 10, cursorY + 18, { lineHeightFactor: 1.45, maxWidth: 220 });

  cursorY += 120;

  autoTable(doc, {
    startY: cursorY,
    head: [["Item", "Pack", "Qty", "Unit Price", "Amount"]],
    body: order.items.map((item) => [
      item.name,
      item.packSize ?? "-",
      String(item.quantity ?? 0),
      formatInvoiceMoney(item.priceValue ?? 0),
      formatInvoiceMoney((item.priceValue ?? 0) * (item.quantity ?? 0)),
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [22, 49, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
      lineColor: [226, 229, 223],
      lineWidth: 1,
      textColor: [22, 49, 42],
    },
    alternateRowStyles: {
      fillColor: [250, 247, 239],
    },
    columnStyles: {
      0: { cellWidth: 200 },
      1: { cellWidth: 80 },
      2: { halign: "center", cellWidth: 50 },
      3: { halign: "right", cellWidth: 90 },
      4: { halign: "right", cellWidth: 95 },
    },
    margin: { left: margin, right: margin },
  });

  cursorY = doc.lastAutoTable.finalY + 18;
  const summaryX = pageWidth - margin - 200;

  doc.setDrawColor(226, 229, 223);
  doc.setFillColor(250, 247, 239);
  doc.roundedRect(summaryX, cursorY, 200, 110, 14, 14, "FD");

  const summaryRows = [
    ["Subtotal", formatInvoiceMoney(order.subtotal ?? 0)],
    ["Shipping", (order.shipping ?? 0) === 0 ? "Free" : formatInvoiceMoney(order.shipping ?? 0)],
  ];

  if (order.gstAmount != null) {
    summaryRows.push([order.gstLabel ?? GST_LABEL, formatInvoiceMoney(order.gstAmount)]);
  }

  summaryRows.push(["Total", formatInvoiceMoney(order.total ?? 0)]);

  let summaryY = cursorY + 24;
  summaryRows.forEach(([label, value], index) => {
    const isTotal = index === summaryRows.length - 1;
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setFontSize(isTotal ? 12 : 10);
    doc.text(label, summaryX + 16, summaryY);
    doc.text(value, summaryX + 184, summaryY, { align: "right" });
    summaryY += isTotal ? 24 : 18;
  });

  const footerY = Math.max(summaryY + 24, pageHeight - 70);
  doc.setDrawColor(226, 229, 223);
  doc.line(margin, footerY - 12, pageWidth - margin, footerY - 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(92, 107, 102);
  doc.text("Thank you for choosing Saliah Foods.", margin, footerY);
  doc.text("This is a computer-generated invoice.", pageWidth - margin, footerY, { align: "right" });

  doc.save(`${order.id}-invoice.pdf`);
}

export const ADDRESS_TYPE_OPTIONS = ["Home", "Office", "Other"];
