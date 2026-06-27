"use client";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 30, color: '#666' },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  label: { fontSize: 12, color: '#333' },
  value: { fontSize: 12, fontWeight: 'bold' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, backgroundColor: '#f5f5f5', padding: 5 },
});

const RecapPDF = ({ recapData }: { recapData: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Performance Recap Report</Text>
      <Text style={styles.subtitle}>{recapData?.attractionName} | {recapData?.dateRange}</Text>
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Total Visitors</Text>
          <Text style={styles.value}>{recapData?.visitors.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Revenue (QAR)</Text>
          <Text style={styles.value}>{recapData?.revenue.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Average Rating</Text>
          <Text style={styles.value}>{recapData?.avgRating} / 5.0</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Top Ticket Types</Text>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>Ticket</Text>
          <Text style={styles.label}>Sales</Text>
        </View>
        {recapData?.topTickets.map((t: any, i: number) => (
          <View style={styles.row} key={i}>
            <Text style={styles.label}>{t.name}</Text>
            <Text style={styles.value}>{t.count.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function RecapPDFDownload({ recapData }: { recapData: any }) {
  return (
    <PDFDownloadLink document={<RecapPDF recapData={recapData} />} fileName={`E3_Recap_${recapData.dateRange.replace(/\s+/g, '_')}.pdf`}>
      {/* @ts-ignore */}
      {({ loading }) => (
        <span className="flex items-center gap-2">
          {loading ? 'Preparing PDF...' : 'Export PDF'}
        </span>
      )}
    </PDFDownloadLink>
  );
}
