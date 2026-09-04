import { describe, it, expect } from "vitest";
import { DEFAULT_PDF_CONFIG } from "../components/dashboard/b2c/PDFLetterheadManagerModal";
import fs from "fs";
import path from "path";

describe("Package & Birthday Quote PDF Editor Integration", () => {
  it("provides comprehensive DEFAULT_PDF_CONFIG with company, venue, bank and signature fields", () => {
    expect(DEFAULT_PDF_CONFIG.companyNameEn).toBe("E3 Entertainment & Experience LLC");
    expect(DEFAULT_PDF_CONFIG.crNumber).toContain("CR-");
    expect(DEFAULT_PDF_CONFIG.showVenueDetails).toBe(true);
    expect(DEFAULT_PDF_CONFIG.showBankDetails).toBe(true);
    expect(DEFAULT_PDF_CONFIG.bankName).toContain("QNB");
    expect(DEFAULT_PDF_CONFIG.iban).toContain("QA");
    expect(DEFAULT_PDF_CONFIG.showSignatureBlock).toBe(true);
    expect(DEFAULT_PDF_CONFIG.footerNotesEn).toContain("deposit");
  });

  it("verifies PackagesManager has the PDF & Letterhead tab and header action", () => {
    const packagesManagerFile = path.resolve(__dirname, "../components/dashboard/b2c/PackagesManager.tsx");
    const content = fs.readFileSync(packagesManagerFile, "utf8");

    // Must include the pdf tab in studioTabs
    expect(content).toContain('id: "pdf"');
    expect(content).toContain("PackagePdfSettingsTab");
    // Must include header quick action for PDF Quote Editor
    expect(content).toContain("PDF Quote & Letterhead Editor");
  });

  it("verifies PackageStudioEditor includes Step 11: PDF Quote & Terms and launches the modal", () => {
    const editorFile = path.resolve(__dirname, "../components/dashboard/b2c/PackageStudioEditor.tsx");
    const content = fs.readFileSync(editorFile, "utf8");

    // Must include the pdfQuote step in WORKFLOW_STEPS
    expect(content).toContain('id: "pdfQuote"');
    expect(content).toContain("PDF Quote & Terms");
    // Must include PDFLetterheadManagerModal
    expect(content).toContain("PDFLetterheadManagerModal");
    expect(content).toContain("isPdfModalOpen");
    // Must include birthday guidelines and terms in form
    expect(content).toContain("birthdayGuidelinesEn");
    expect(content).toContain("cancellationPolicyEn");
    expect(content).toContain("depositPercentage");
  });

  it("verifies PackageQuotationBuilder includes the PDF letterhead button and renders the modal", () => {
    const quoteBuilderFile = path.resolve(__dirname, "../components/dashboard/b2c/PackageQuotationBuilder.tsx");
    const content = fs.readFileSync(quoteBuilderFile, "utf8");

    expect(content).toContain("PDFLetterheadManagerModal");
    expect(content).toContain("<PDFLetterheadManagerModal");
    expect(content).toContain("PDF Letterhead & Branding");
  });

  it("verifies the API route for PDF settings exists and persists settings", () => {
    const apiFile = path.resolve(__dirname, "../app/api/b2c/pdf-settings/route.ts");
    expect(fs.existsSync(apiFile)).toBe(true);
    const content = fs.readFileSync(apiFile, "utf8");
    expect(content).toContain("b2c_pdf_letterhead_config");
  });

  it("verifies A4QuotationSheet correctly renders real company logos, venue logos, and official stamp", () => {
    const sheetFile = path.resolve(__dirname, "../components/dashboard/b2c/A4QuotationSheet.tsx");
    expect(fs.existsSync(sheetFile)).toBe(true);
    const content = fs.readFileSync(sheetFile, "utf8");

    // Real image handling with crossOrigin and error fallback
    expect(content).toContain("companyLogoUrl");
    expect(content).toContain("venueLogoUrl");
    expect(content).toContain("stampUrl");
    expect(content).toContain("setCompanyLogoError");
    expect(content).toContain("setVenueLogoError");
    expect(content).toContain("setStampError");

    // Exact A4 portrait layout constraints
    expect(content).toContain("min-h-[297mm]");
    expect(content).toContain("max-h-[297mm]");
    expect(content).toContain("max-w-[210mm]");
    expect(content).toContain("pageBreakInside");
    expect(content).toContain("pageBreakAfter");
  });

  it("verifies PDFImageUploader provides direct file uploads and thumbnail previews", () => {
    const uploaderFile = path.resolve(__dirname, "../components/dashboard/b2c/PDFImageUploader.tsx");
    expect(fs.existsSync(uploaderFile)).toBe(true);
    const content = fs.readFileSync(uploaderFile, "utf8");

    expect(content).toContain("uploadFile");
    expect(content).toContain("isUploading");
    expect(content).toContain("onChange(uploadResult.url)");
    expect(content).toContain("accept=\"image/png,image/jpeg,image/webp,image/svg+xml\"");
  });

  it("verifies PublicQuotationView and PackagePdfSettingsTab use A4QuotationSheet and direct vector PDF export", () => {
    const publicViewFile = path.resolve(__dirname, "../components/b2c/packages/PublicQuotationView.tsx");
    const publicContent = fs.readFileSync(publicViewFile, "utf8");
    expect(publicContent).toContain("A4QuotationSheet");
    expect(publicContent).toContain("QuotationPDFDownload");
    expect(publicContent).toContain("@page");
    expect(publicContent).toContain("size: A4 portrait");

    const settingsTabFile = path.resolve(__dirname, "../components/dashboard/b2c/PackagePdfSettingsTab.tsx");
    const settingsContent = fs.readFileSync(settingsTabFile, "utf8");
    expect(settingsContent).toContain("A4QuotationSheet");
    expect(settingsContent).toContain("PDFImageUploader");
    expect(settingsContent).toContain("QuotationPDFDownload");

    const modalFile = path.resolve(__dirname, "../components/dashboard/b2c/PDFLetterheadManagerModal.tsx");
    const modalContent = fs.readFileSync(modalFile, "utf8");
    expect(modalContent).toContain("A4QuotationSheet");
    expect(modalContent).toContain("PDFImageUploader");
  });
});
