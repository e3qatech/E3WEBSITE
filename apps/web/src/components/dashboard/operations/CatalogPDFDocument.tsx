"use client";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  coverPage: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#09090b', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  coverTitle: { fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
  coverSubtitle: { fontSize: 18, color: '#aaaaaa' },
  section: { marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 20 },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold', color: '#ff3b00' },
  desc: { fontSize: 12, color: '#333', lineHeight: 1.5 },
});

const CatalogPDF = ({ catalogData }: { catalogData: any }) => (
  <Document>
    <Page size="A4" style={styles.coverPage}>
      <Text style={styles.coverTitle}>E3 {catalogData?.template}</Text>
      <Text style={styles.coverSubtitle}>Service Portfolio & Capabilities</Text>
    </Page>
    <Page size="A4" style={styles.page}>
      {catalogData?.items?.map((item: any, i: number) => (
        <View style={styles.section} key={i}>
          <Text style={styles.title}>{item.titleEn}</Text>
          <Text style={styles.desc}>{item.taglineEn || "Professional event engineering and management services."}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

export default function CatalogPDFDownload({ catalogData }: { catalogData: any }) {
  return (
    <PDFDownloadLink document={<CatalogPDF catalogData={catalogData} />} fileName={`E3_${catalogData.template.replace(/\s+/g, '_')}.pdf`}>
      {/* @ts-ignore */}
      {({ loading }) => (
        <span className="flex items-center gap-2">
          {loading ? 'Preparing PDF...' : 'Export PDF'}
        </span>
      )}
    </PDFDownloadLink>
  );
}
