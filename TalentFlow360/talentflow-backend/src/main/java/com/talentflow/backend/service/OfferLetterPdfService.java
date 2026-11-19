package com.talentflow.backend.service;

import com.talentflow.backend.dto.application.SendOfferLetterRequest;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class OfferLetterPdfService {

    private static final Logger log = LoggerFactory.getLogger(OfferLetterPdfService.class);

    // Color palette matching TalentFlow 360 branding
    private static final Color BRAND_NAVY = new Color(12, 63, 110);    // #0c3f6e
    private static final Color BRAND_ACCENT = new Color(5, 150, 105);  // #059669 (Emerald)
    private static final Color TEXT_DARK = new Color(15, 23, 42);      // #0f172a
    private static final Color TEXT_MUTED = new Color(71, 85, 105);    // #475569
    private static final Color BG_LIGHT = new Color(248, 250, 252);    // #f8fafc
    private static final Color BORDER_GRAY = new Color(226, 232, 240); // #e2e8f0

    public byte[] generateOfferLetterPdf(Long applicationId, SendOfferLetterRequest req) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDFont fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDFont fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont fontItalic = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();
            float margin = 48f;
            float usableWidth = pageWidth - (2 * margin);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                // 1. TOP HEADER BANNER
                float bannerHeight = 84f;
                cs.setNonStrokingColor(BRAND_NAVY);
                cs.addRect(0, pageHeight - bannerHeight, pageWidth, bannerHeight);
                cs.fill();

                // Decorative Emerald Bottom Stripe on Banner
                cs.setNonStrokingColor(BRAND_ACCENT);
                cs.addRect(0, pageHeight - bannerHeight - 4f, pageWidth, 4f);
                cs.fill();

                // Header Texts
                cs.beginText();
                cs.setFont(fontBold, 18f);
                cs.setNonStrokingColor(Color.WHITE);
                cs.newLineAtOffset(margin, pageHeight - 38f);
                String companyTitle = sanitize(req.getCompanyName() != null ? req.getCompanyName().toUpperCase() : "TALENTFLOW 360 PARTNER");
                cs.showText(companyTitle);
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 10f);
                cs.setNonStrokingColor(new Color(224, 242, 254)); // Soft light blue
                cs.newLineAtOffset(margin, pageHeight - 56f);
                cs.showText("TALENT ACQUISITION & PEOPLE OPERATIONS - FORMAL EMPLOYMENT OFFER");
                cs.endText();

                // 2. DOCUMENT METADATA
                float y = pageHeight - bannerHeight - 26f;

                cs.beginText();
                cs.setFont(fontRegular, 9.5f);
                cs.setNonStrokingColor(TEXT_MUTED);
                cs.newLineAtOffset(margin, y);
                String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
                cs.showText("Date: " + dateStr);
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 9.5f);
                cs.setNonStrokingColor(TEXT_MUTED);
                float refX = pageWidth - margin - 180f;
                cs.newLineAtOffset(refX, y);
                cs.showText("Ref: TF360/OFFER/" + (applicationId != null ? applicationId : "APP") + "/" + LocalDate.now().getYear());
                cs.endText();

                y -= 22f;

                // 3. CANDIDATE ADDRESS BLOCK
                cs.beginText();
                cs.setFont(fontBold, 11f);
                cs.setNonStrokingColor(TEXT_DARK);
                cs.newLineAtOffset(margin, y);
                cs.showText("To: " + sanitize(req.getCandidateName()));
                cs.endText();

                y -= 14f;
                if (req.getCandidateEmail() != null && !req.getCandidateEmail().isBlank()) {
                    cs.beginText();
                    cs.setFont(fontRegular, 9.5f);
                    cs.setNonStrokingColor(TEXT_MUTED);
                    cs.newLineAtOffset(margin, y);
                    cs.showText("Email: " + sanitize(req.getCandidateEmail()));
                    cs.endText();
                    y -= 16f;
                } else {
                    y -= 6f;
                }

                // 4. SALUTATION & OPENING
                cs.beginText();
                cs.setFont(fontBold, 11.5f);
                cs.setNonStrokingColor(TEXT_DARK);
                cs.newLineAtOffset(margin, y);
                cs.showText("Dear " + sanitize(req.getCandidateName()) + ",");
                cs.endText();

                y -= 18f;

                String opening = "On behalf of " + sanitize(req.getCompanyName()) +
                        ", we are delighted to extend this formal offer of employment for the position of " +
                        sanitize(req.getJobTitle()) + ". Your background, expertise, and interviews thoroughly impressed our panel, and we are excited about the prospect of you joining our engineering team.";
                y = drawParagraph(cs, fontRegular, 9.5f, TEXT_DARK, opening, margin, y, usableWidth, 13f);

                y -= 10f;

                // 5. EMPLOYMENT DETAILS BOX
                float boxY = y;
                float boxHeight = 118f;

                cs.setNonStrokingColor(BG_LIGHT);
                cs.addRect(margin, boxY - boxHeight, usableWidth, boxHeight);
                cs.fill();

                cs.setStrokingColor(BORDER_GRAY);
                cs.setLineWidth(1f);
                cs.addRect(margin, boxY - boxHeight, usableWidth, boxHeight);
                cs.stroke();

                // Box Header
                cs.setNonStrokingColor(new Color(241, 245, 249));
                cs.addRect(margin, boxY - 24f, usableWidth, 24f);
                cs.fill();

                cs.beginText();
                cs.setFont(fontBold, 10f);
                cs.setNonStrokingColor(BRAND_NAVY);
                cs.newLineAtOffset(margin + 12f, boxY - 16f);
                cs.showText("OFFER SUMMARY & APPOINTMENT TERMS");
                cs.endText();

                // Table rows
                float rowY = boxY - 38f;
                float labelX = margin + 12f;
                float valX = margin + 180f;

                drawTableRow(cs, fontBold, fontRegular, 9f, labelX, valX, rowY, "Position / Designation:", sanitize(req.getJobTitle()));
                rowY -= 15f;
                drawTableRow(cs, fontBold, fontRegular, 9f, labelX, valX, rowY, "Total Annual CTC (Compensation):", "INR " + String.format("%.2f", req.getAnnualCtcLpa()) + " Lakhs per Annum (LPA)");
                rowY -= 15f;
                drawTableRow(cs, fontBold, fontRegular, 9f, labelX, valX, rowY, "Proposed Date of Joining:", sanitize(req.getJoiningDate()));
                rowY -= 15f;
                drawTableRow(cs, fontBold, fontRegular, 9f, labelX, valX, rowY, "Primary Work Location:", sanitize(req.getJobLocation() != null ? req.getJobLocation() : "Corporate Office / Hybrid"));
                rowY -= 15f;
                drawTableRow(cs, fontBold, fontRegular, 9f, labelX, valX, rowY, "Reporting Line / Dept:", sanitize(req.getReportingManager() != null ? req.getReportingManager() : "Engineering Leadership Team"));
                rowY -= 15f;
                drawTableRow(cs, fontBold, fontRegular, 9f, labelX, valX, rowY, "Offer Acceptance Deadline:", sanitize(req.getAcceptanceDeadline() != null ? req.getAcceptanceDeadline() : "Within 7 business days"));

                y = boxY - boxHeight - 16f;

                // 6. COMPENSATION & BENEFITS BREAKDOWN CLAUSE
                cs.beginText();
                cs.setFont(fontBold, 10f);
                cs.setNonStrokingColor(TEXT_DARK);
                cs.newLineAtOffset(margin, y);
                cs.showText("Compensation Structure & Benefits:");
                cs.endText();

                y -= 14f;
                String compDetails = "Your annual gross compensation package includes Base Salary, Flexible Allowances, Performance Bonus, Comprehensive Medical & Group Term Life Insurance, and Statutory Retirals (EPF/Gratuity) in accordance with company policy and applicable Indian labour statutes.";
                y = drawParagraph(cs, fontRegular, 9f, TEXT_MUTED, compDetails, margin, y, usableWidth, 12f);

                y -= 8f;

                // 7. KEY TERMS & CONDITIONS
                cs.beginText();
                cs.setFont(fontBold, 10f);
                cs.setNonStrokingColor(TEXT_DARK);
                cs.newLineAtOffset(margin, y);
                cs.showText("Key Conditions of Employment:");
                cs.endText();

                y -= 14f;
                String terms1 = "1. Background Verification: This offer is subject to satisfactory reference checks, credentials verification, and submission of authentic academic and past employment documentation.";
                y = drawParagraph(cs, fontRegular, 8.8f, TEXT_MUTED, terms1, margin, y, usableWidth, 12f);

                y -= 4f;
                String terms2 = "2. Confidentiality & Code of Conduct: You agree to adhere to company policies, non-disclosure agreements, and protect all proprietary source code, architectures, and intellectual property.";
                y = drawParagraph(cs, fontRegular, 8.8f, TEXT_MUTED, terms2, margin, y, usableWidth, 12f);

                // 8. RECRUITER CUSTOM REMARKS / CONGRATULATIONS NOTE
                if (req.getCustomRemarks() != null && !req.getCustomRemarks().isBlank()) {
                    y -= 8f;
                    float noteBoxY = y;
                    float noteHeight = 36f;

                    cs.setNonStrokingColor(new Color(240, 253, 244)); // Light green bg
                    cs.addRect(margin, noteBoxY - noteHeight, usableWidth, noteHeight);
                    cs.fill();

                    cs.setStrokingColor(new Color(187, 247, 208)); // Green border
                    cs.setLineWidth(1f);
                    cs.addRect(margin, noteBoxY - noteHeight, usableWidth, noteHeight);
                    cs.stroke();

                    cs.beginText();
                    cs.setFont(fontBold, 8.5f);
                    cs.setNonStrokingColor(BRAND_ACCENT);
                    cs.newLineAtOffset(margin + 10f, noteBoxY - 13f);
                    cs.showText("Hiring Manager Note:");
                    cs.endText();

                    cs.beginText();
                    cs.setFont(fontItalic, 8.5f);
                    cs.setNonStrokingColor(new Color(22, 101, 52));
                    cs.newLineAtOffset(margin + 10f, noteBoxY - 26f);
                    String remarkSnippet = sanitize(req.getCustomRemarks());
                    if (remarkSnippet.length() > 95) remarkSnippet = remarkSnippet.substring(0, 92) + "...";
                    cs.showText("\"" + remarkSnippet + "\"");
                    cs.endText();

                    y = noteBoxY - noteHeight - 12f;
                } else {
                    y -= 10f;
                }

                // 9. SIGNATURE & ACCEPTANCE BLOCK
                float signY = Math.max(y, 110f);

                // Left: Company Authorized Signatory
                cs.beginText();
                cs.setFont(fontRegular, 8.5f);
                cs.setNonStrokingColor(TEXT_MUTED);
                cs.newLineAtOffset(margin, signY);
                cs.showText("Sincerely,");
                cs.endText();

                cs.beginText();
                cs.setFont(fontBold, 10f);
                cs.setNonStrokingColor(TEXT_DARK);
                cs.newLineAtOffset(margin, signY - 26f);
                String signee = sanitize(req.getSigneeName() != null ? req.getSigneeName() : "Authorized HR Signatory");
                cs.showText(signee);
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 8.5f);
                cs.setNonStrokingColor(TEXT_MUTED);
                cs.newLineAtOffset(margin, signY - 38f);
                String title = sanitize(req.getSigneeTitle() != null ? req.getSigneeTitle() : "Talent Acquisition & People Operations");
                cs.showText(title + " - " + sanitize(req.getCompanyName()));
                cs.endText();

                // Right: Candidate Acceptance Sign-off
                float candSignX = pageWidth - margin - 220f;
                cs.beginText();
                cs.setFont(fontBold, 9f);
                cs.setNonStrokingColor(TEXT_DARK);
                cs.newLineAtOffset(candSignX, signY);
                cs.showText("Candidate Acceptance:");
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 8f);
                cs.setNonStrokingColor(TEXT_MUTED);
                cs.newLineAtOffset(candSignX, signY - 14f);
                cs.showText("I confirm acceptance of this employment offer.");
                cs.endText();

                cs.setStrokingColor(BORDER_GRAY);
                cs.setLineWidth(1f);
                cs.moveTo(candSignX, signY - 36f);
                cs.lineTo(candSignX + 210f, signY - 36f);
                cs.stroke();

                cs.beginText();
                cs.setFont(fontRegular, 8f);
                cs.setNonStrokingColor(TEXT_MUTED);
                cs.newLineAtOffset(candSignX, signY - 48f);
                cs.showText("Signature & Date: ______________________");
                cs.endText();

                // 10. FOOTER NOTE
                cs.setStrokingColor(BORDER_GRAY);
                cs.setLineWidth(0.5f);
                cs.moveTo(margin, 40f);
                cs.lineTo(pageWidth - margin, 40f);
                cs.stroke();

                cs.beginText();
                cs.setFont(fontRegular, 7.5f);
                cs.setNonStrokingColor(new Color(148, 163, 184));
                cs.newLineAtOffset(margin, 28f);
                cs.showText("TalentFlow 360 Enterprise Recruitment Platform - Official Verifiable Offer Document - Generated with 1-Click ATS Automation");
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            log.info("Successfully generated Offer Letter PDF for application #{}, size: {} bytes", applicationId, baos.size());
            return baos.toByteArray();
        }
    }

    private void drawTableRow(PDPageContentStream cs, PDFont fontBold, PDFont fontRegular, float fontSize,
                              float labelX, float valX, float y, String label, String value) throws IOException {
        cs.beginText();
        cs.setFont(fontBold, fontSize);
        cs.setNonStrokingColor(TEXT_DARK);
        cs.newLineAtOffset(labelX, y);
        cs.showText(label);
        cs.endText();

        cs.beginText();
        cs.setFont(fontRegular, fontSize);
        cs.setNonStrokingColor(TEXT_DARK);
        cs.newLineAtOffset(valX, y);
        cs.showText(value);
        cs.endText();
    }

    private float drawParagraph(PDPageContentStream cs, PDFont font, float fontSize, Color color,
                                String text, float startX, float startY, float maxWidth, float lineHeight) throws IOException {
        float y = startY;
        List<String> lines = wrapText(text, font, fontSize, maxWidth);
        for (String line : lines) {
            cs.beginText();
            cs.setFont(font, fontSize);
            cs.setNonStrokingColor(color);
            cs.newLineAtOffset(startX, y);
            cs.showText(line);
            cs.endText();
            y -= lineHeight;
        }
        return y;
    }

    private List<String> wrapText(String text, PDFont font, float fontSize, float maxWidth) throws IOException {
        List<String> result = new ArrayList<>();
        String[] words = text.split("\\s+");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            String testLine = currentLine.length() == 0 ? word : currentLine + " " + word;
            float lineWidth = font.getStringWidth(testLine) / 1000f * fontSize;
            if (lineWidth <= maxWidth) {
                currentLine = new StringBuilder(testLine);
            } else {
                if (currentLine.length() > 0) {
                    result.add(currentLine.toString());
                }
                currentLine = new StringBuilder(word);
            }
        }
        if (currentLine.length() > 0) {
            result.add(currentLine.toString());
        }
        return result;
    }

    /**
     * Sanitizes strings to pure WinAnsi / ASCII characters to prevent Helvetica font encoding exceptions.
     */
    private String sanitize(String input) {
        if (input == null) return "";
        return input.replace("₹", "INR ")
                .replace("•", "-")
                .replace("–", "-")
                .replace("—", "-")
                .replace("“", "\"")
                .replace("”", "\"")
                .replace("‘", "'")
                .replace("’", "'")
                .replaceAll("[^\\x00-\\x7F]", "")
                .trim();
    }
}
