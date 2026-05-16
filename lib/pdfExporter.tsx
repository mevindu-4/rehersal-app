import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createServiceSupabaseClient } from "@/lib/db";
import type { FeedbackReportJSON } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 12 },
  section: { marginBottom: 10 },
  heading: { fontSize: 13, marginBottom: 4, fontWeight: "bold" },
});

function ReportPdfDocument({ report }: { report: FeedbackReportJSON }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Rehearsal Feedback Report</Text>
        <Text style={styles.section}>
          Target: {report.target_name} · Score: {report.overall_score}/100
        </Text>
        <View style={styles.section}>
          <Text style={styles.heading}>Executive Summary</Text>
          <Text>{report.executive_summary}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Best Moments</Text>
          {report.best_moments.map((m, i) => (
            <Text key={`b-${i}`}>
              [{m.timestamp}] {m.user_said} — {m.reason}
            </Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Areas to Improve</Text>
          {report.weak_moments.map((m, i) => (
            <Text key={`w-${i}`}>
              [{m.timestamp}] {m.user_said} — {m.reason}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export async function exportReportPdf(reportId: string): Promise<string> {
  const supabase = createServiceSupabaseClient();

  const { data: report, error } = await supabase
    .from("feedback_reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (error || !report) throw new Error("Report not found");

  const reportJson = report.report_json as FeedbackReportJSON;
  const buffer = await renderToBuffer(
    <ReportPdfDocument report={reportJson} />
  );

  const path = `reports/${report.session_id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("reports")
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: signed } = await supabase.storage
    .from("reports")
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (!signed?.signedUrl) throw new Error("Failed to create signed URL");

  await supabase
    .from("feedback_reports")
    .update({ pdf_url: signed.signedUrl })
    .eq("id", reportId);

  return signed.signedUrl;
}
