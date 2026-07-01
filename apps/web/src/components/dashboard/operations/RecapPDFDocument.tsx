"use client";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#7C3AED',
    paddingBottom: 20,
  },
  logoPlaceholder: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F0F23',
    letterSpacing: -1,
  },
  reportType: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  titleSection: {
    marginBottom: 40,
  },
  title: { 
    fontSize: 28, 
    marginBottom: 8, 
    fontWeight: 'bold',
    color: '#0F0F23',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#7C3AED', 
    fontWeight: 'bold',
  },
  dateRange: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  card: {
    width: '30%',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  cardLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F0F23',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F0F23',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  table: {
    width: '100%',
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableHeaderCellRight: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#0F0F23',
  },
  tableCellRight: {
    flex: 1,
    fontSize: 12,
    color: '#0F0F23',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
  }
});

const RecapPDF = ({ recapData }: { recapData: any }) => {
  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoPlaceholder}>E3 ENTERPRISE</Text>
          <Text style={styles.reportType}>Executive Report</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Performance Recap</Text>
          <Text style={styles.subtitle}>{recapData?.attractionName}</Text>
          <Text style={styles.dateRange}>Period: {recapData?.dateRange}</Text>
        </View>
        
        {/* KPI Grid */}
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Visitors</Text>
            <Text style={styles.cardValue}>{recapData?.visitors?.toLocaleString()}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Gross Revenue</Text>
            <Text style={styles.cardValue}>QAR {recapData?.revenue?.toLocaleString()}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Avg. Guest Rating</Text>
            <Text style={styles.cardValue}>{recapData?.avgRating} / 5.0</Text>
          </View>
        </View>

        {/* Top Tickets Table */}
        <Text style={styles.sectionTitle}>Ticket Sales Breakdown</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Ticket Category</Text>
            <Text style={styles.tableHeaderCellRight}>Volume Sold</Text>
          </View>
          {recapData?.topTickets?.map((t: any, i: number) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.tableCell}>{t.name}</Text>
              <Text style={styles.tableCellRight}>{t.count?.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated on {generatedDate}</Text>
          <Text style={styles.footerText}>E3 Dashboard • Confidential</Text>
        </View>

      </Page>
    </Document>
  );
};

export default function RecapPDFDownload({ recapData }: { recapData: any }) {
  return (
    <PDFDownloadLink 
      document={<RecapPDF recapData={recapData} />} 
      fileName={`E3_Executive_Report_${recapData.dateRange.replace(/\s+/g, '_')}.pdf`}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition-colors shadow-sm"
    >
      {/* @ts-ignore */}
      {({ loading }) => (
        <>
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
          )}
          <span>{loading ? 'Preparing Executive PDF...' : 'Download PDF Report'}</span>
        </>
      )}
    </PDFDownloadLink>
  );
}
