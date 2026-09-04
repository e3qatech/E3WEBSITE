"use client";

import * as ReactPDF from "@react-pdf/renderer";
const { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } = ReactPDF as any;
import { PDFLetterheadConfig, DEFAULT_PDF_CONFIG } from "./PDFLetterheadManagerModal";
import { A4QuotationData } from "./A4QuotationSheet";
import { Download, Loader2 } from "lucide-react";

const styles = StyleSheet.create({
  page: {
    size: "A4",
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 30,
    paddingRight: 30,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0f172a",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#002B49",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
    marginBottom: 8,
  },
  companyCol: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    height: 38,
    width: "auto",
    maxHeight: 38,
    objectFit: "contain",
  },
  companyTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  companySubtitle: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 2,
  },
  headerRefCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  refLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#7c3aed",
    textTransform: "uppercase",
  },
  refValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  refDate: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 1,
  },
  refValid: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 1,
  },
  contactBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 4,
    marginBottom: 8,
    fontSize: 7.5,
    color: "#475569",
  },
  summaryBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  summaryCol: {
    width: "48%",
  },
  summaryLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summaryName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  summaryText: {
    fontSize: 8,
    color: "#475569",
    marginTop: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#334155",
    textTransform: "uppercase",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8,
    color: "#0f172a",
  },
  colDesc: { width: "55%" },
  colQty: { width: "12%", textAlign: "center" },
  colPrice: { width: "16%", textAlign: "right" },
  colTotal: { width: "17%", textAlign: "right", fontWeight: "bold" },
  tableTotalRow: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 9,
    fontWeight: "bold",
  },
  bankDepositBox: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  depositCol: {
    width: "35%",
    borderRightWidth: 1,
    borderRightColor: "#ede9fe",
    paddingRight: 6,
  },
  depositAmount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#047857",
    marginTop: 1,
  },
  bankCol: {
    width: "65%",
    paddingLeft: 8,
  },
  bankIban: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#4338ca",
    marginTop: 1,
  },
  footerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
  termsCol: {
    width: "65%",
  },
  termsNotice: {
    fontSize: 7,
    color: "#64748b",
    lineHeight: 1.3,
  },
  signatureCol: {
    width: "30%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  signatureLine: {
    width: 90,
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginBottom: 2,
    paddingBottom: 2,
  },
  signatoryName: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  signatoryTitle: {
    fontSize: 6.5,
    color: "#64748b",
  },
  stamp: {
    width: 44,
    height: 44,
    objectFit: "contain",
    marginBottom: -10,
  },
});

interface QuotationPDFDocumentProps {
  config: PDFLetterheadConfig;
  data: A4QuotationData;
}

export function QuotationPDFDocument({ config, data }: QuotationPDFDocumentProps) {
  const quoteNumber = data.quoteNumber || "QTE-2026-0842";
  const createdDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Sep 04, 2026";
  const validDate = data.validUntil
    ? new Date(data.validUntil).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Sep 18, 2026";

  const customerName = data.customerName || "Customer Name";
  const companyOrOrg = data.companyOrOrg || "Organization";
  const customerEmail = data.customerEmail || "contact@example.qa";
  const customerPhone = data.customerPhone || "";
  const packageTitle = data.packageTitleEn || "VIP Celebration Package";
  const venueTitle = data.venueNameEn || config.venueNameEn;
  const currency = data.currency || "QAR";

  const items = data.items && data.items.length > 0 ? data.items : [
    { titleEn: "VIP Birthday Celebration Suite (2 Hours Private Access)", itemType: "PACKAGE_TIER", quantity: 1, unitPrice: 2200, totalPrice: 2200 },
    { titleEn: "Guest Pass Package Allocation (20 Participants)", itemType: "INCLUSION", quantity: 20, unitPrice: 0, totalPrice: 0 },
    { titleEn: "Custom Themed Cake Ceremony & Dedicated Animator Host", itemType: "ADDON", quantity: 1, unitPrice: 650, totalPrice: 650 },
    { titleEn: "Grip Socks & Commemorative Birthday Medals (20 Pairs)", itemType: "ADDON", quantity: 20, unitPrice: 20, totalPrice: 400 },
  ];

  const total = data.grandTotal ?? items.reduce((sum, it) => sum + (it.totalPrice ?? (it.unitPrice || 0) * (it.quantity || 1)), 0);
  const deposit = data.depositAmount ?? Math.round(total * 0.5);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Accent Bar */}
        {config.showLetterheadBar && (
          <View style={[styles.accentBar, { backgroundColor: config.headerBannerColor || "#002B49" }]} />
        )}

        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.companyCol}>
              {config.showCompanyLogo && config.companyLogoUrl && (
                <Image src={config.companyLogoUrl} style={styles.logo} />
              )}
              <View>
                <Text style={styles.companyTitle}>{config.companyNameEn}</Text>
                <Text style={styles.companySubtitle}>
                  CR: {config.crNumber} • Tax TIN: {config.taxRegistrationNumber}
                </Text>
              </View>
            </View>

            <View style={styles.headerRefCol}>
              <Text style={styles.refLabel}>OFFICIAL QUOTATION REF</Text>
              <Text style={styles.refValue}>{quoteNumber}</Text>
              <Text style={styles.refDate}>Date: {createdDate}</Text>
              <Text style={styles.refValid}>Valid Until: {validDate}</Text>
            </View>
          </View>

          {/* Contact Bar */}
          <View style={styles.contactBar}>
            <Text>{config.addressEn}</Text>
            <Text>Tel: {config.phone} • Email: {config.email} • {config.website}</Text>
          </View>

          {/* Summary Box */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>PREPARED FOR</Text>
              <Text style={styles.summaryName}>{customerName}</Text>
              {companyOrOrg && <Text style={styles.summaryText}>{companyOrOrg}</Text>}
              <Text style={styles.summaryText}>{customerEmail} {customerPhone ? `• ${customerPhone}` : ""}</Text>
            </View>

            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>PACKAGE & VENUE</Text>
              <Text style={styles.summaryName}>{packageTitle}</Text>
              <Text style={styles.summaryText}>{venueTitle} {config.hallOrZoneEn ? `• ${config.hallOrZoneEn}` : ""}</Text>
              {config.onSiteCoordinator && (
                <Text style={styles.summaryText}>Coordinator: {config.onSiteCoordinator} ({config.coordinatorPhone})</Text>
              )}
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDesc}>DESCRIPTION OF SERVICES</Text>
              <Text style={styles.colQty}>QTY</Text>
              <Text style={styles.colPrice}>UNIT PRICE</Text>
              <Text style={styles.colTotal}>TOTAL ({currency})</Text>
            </View>

            {items.map((it, idx) => {
              const rowTotal = it.totalPrice ?? (it.unitPrice || 0) * (it.quantity || 1);
              return (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.colDesc}>{it.titleEn}</Text>
                  <Text style={styles.colQty}>{it.quantity || 1}</Text>
                  <Text style={styles.colPrice}>
                    {(it.unitPrice || 0) === 0 ? "INCLUDED" : `${(it.unitPrice || 0).toLocaleString()} ${currency}`}
                  </Text>
                  <Text style={styles.colTotal}>
                    {rowTotal === 0 ? "INCLUDED" : `${rowTotal.toLocaleString()} ${currency}`}
                  </Text>
                </View>
              );
            })}

            {/* Total Row */}
            <View style={styles.tableTotalRow}>
              <Text style={styles.colDesc}>* Inclusive of operational staffing, insurance & coordination</Text>
              <Text style={styles.colQty}></Text>
              <Text style={styles.colPrice}>GRAND TOTAL:</Text>
              <Text style={[styles.colTotal, { color: "#4c1d95" }]}>{total.toLocaleString()} {currency}</Text>
            </View>
          </View>

          {/* Bank & Deposit Box */}
          <View style={styles.bankDepositBox}>
            <View style={styles.depositCol}>
              <Text style={styles.summaryLabel}>ADVANCE DEPOSIT (50%)</Text>
              <Text style={styles.depositAmount}>{deposit.toLocaleString()} {currency}</Text>
              <Text style={{ fontSize: 6.5, color: "#64748b", marginTop: 2 }}>Secures hall exclusivity & date</Text>
            </View>

            {config.showBankDetails && (
              <View style={styles.bankCol}>
                <Text style={styles.summaryLabel}>WIRE PAYMENT DETAILS</Text>
                <Text style={{ fontSize: 8, color: "#1e293b", fontWeight: "bold" }}>{config.bankName} • {config.accountTitle}</Text>
                <Text style={styles.bankIban}>IBAN: {config.iban}</Text>
                {config.swiftBic && <Text style={{ fontSize: 7.5, color: "#64748b" }}>SWIFT/BIC: {config.swiftBic}</Text>}
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <View style={styles.termsCol}>
            <Text style={[styles.summaryLabel, { color: "#475569" }]}>TERMS & CONDITIONS:</Text>
            <Text style={styles.termsNotice}>{config.footerNotesEn}</Text>
            <Text style={{ fontSize: 6.5, color: "#94a3b8", marginTop: 2 }}>
              E3 Experience Engineering LLC • Licensed by Ministry of Commerce and Industry • State of Qatar
            </Text>
          </View>

          {config.showSignatureBlock && (
            <View style={styles.signatureCol}>
              {config.showStamp && config.stampUrl && (
                <Image src={config.stampUrl} style={styles.stamp} />
              )}
              <View style={styles.signatureLine}>
                <Text style={{ fontSize: 6.5, color: "#94a3b8", fontStyle: "italic", textAlign: "center" }}>
                  Digitally Verified
                </Text>
              </View>
              <Text style={styles.signatoryName}>{config.authorizedSignatoryName}</Text>
              <Text style={styles.signatoryTitle}>{config.authorizedSignatoryTitle}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

interface QuotationPDFDownloadProps {
  config: PDFLetterheadConfig;
  data: A4QuotationData;
  fileName?: string;
  className?: string;
}

export default function QuotationPDFDownload({
  config,
  data,
  fileName,
  className,
}: QuotationPDFDownloadProps) {
  const safeFileName = fileName || `E3_Quotation_${data.quoteNumber || "Quote"}.pdf`;

  return (
    <PDFDownloadLink
      document={<QuotationPDFDocument config={config} data={data} />}
      fileName={safeFileName}
      className={className || "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"}
    >
      {(params: any) => (
        <span className="flex items-center gap-1.5">
          {params?.loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Vector PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download 1-Page Vector PDF</span>
            </>
          )}
        </span>
      )}
    </PDFDownloadLink>
  );
}
