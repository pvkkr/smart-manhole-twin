import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def build_a4_poster(filename="Smart_Manhole_Urban_IoT_Poster_A4.pdf"):
    pdf_path = os.path.join(os.getcwd(), filename)
    
    # Standard A4 Portrait: 595.27 x 841.89 pt. Tight, uniform margins.
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=16,
        rightMargin=16,
        topMargin=14,
        bottomMargin=14
    )

    styles = getSampleStyleSheet()

    # --- Typography Styles ---
    title_style = ParagraphStyle(
        'PTitle',
        fontName='Helvetica-Bold',
        fontSize=16.5,
        leading=20,
        textColor=colors.HexColor('#0284c7'),
        alignment=TA_CENTER
    )

    subtitle_style = ParagraphStyle(
        'PSubTitle',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155'),
        alignment=TA_CENTER
    )

    badge_batch = ParagraphStyle(
        'PBatch',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    team_name = ParagraphStyle(
        'PTeam',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_CENTER
    )

    card_header = ParagraphStyle(
        'PCardH',
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=10.5,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    caption_style = ParagraphStyle(
        'PCaption',
        fontName='Helvetica',
        fontSize=6.8,
        leading=8.6,
        textColor=colors.HexColor('#334155'),
        alignment=TA_CENTER
    )

    footer_style = ParagraphStyle(
        'PFooter',
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor('#475569')
    )

    elements = []
    page_w = 595.27 - 32 # 563.27 pt
    col_w = (page_w - 8) / 2 # 277.63 pt
    img_w = col_w - 8 # 269.63 pt
    img_h = 212 # Uniform aspect ratio ~1.27:1

    # ==================== 1. TITLE & SUBTITLE ====================
    header_data = [
        [Paragraph("<b>SMART MANHOLE UTILITIES URBAN IOT</b>", title_style)],
        [Paragraph("Autonomous Sub-Surface Infrastructure Monitoring, Real-Time Cloud Telemetry &amp; 3D Digital Twin SCADA", subtitle_style)]
    ]
    t_head = Table(header_data, colWidths=[page_w])
    t_head.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(t_head)
    elements.append(Spacer(1, 3))

    # ==================== 2. BATCH 8 & TEAM MEMBERS STRIP (NO GROUP P07) ====================
    batch_strip = [
        [
            Paragraph("<b>BATCH 8</b>", badge_batch),
            Paragraph("<b>2400040006</b><br/>P V Kishor Kumar Reddy", team_name),
            Paragraph("<b>2400040004</b><br/>T Perumal", team_name),
            Paragraph("<b>2400040303</b><br/>Chundu Uday Sai", team_name),
            Paragraph("<b>2400040339</b><br/>Ayan Chowdhury", team_name),
        ]
    ]
    t_batch = Table(batch_strip, colWidths=[83, 120, 120, 120, 120])
    t_batch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#0284c7')), # Batch 8
        ('BACKGROUND', (1,0), (-1,-1), colors.HexColor('#f1f5f9')), # Member Cards
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#0284c7')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    elements.append(t_batch)
    elements.append(Spacer(1, 6))

    # ==================== 3. 2x2 UNIFORM VISUAL GRID ====================
    # Image Paths
    img1_path = os.path.join(os.getcwd(), 'poster_chamber_3d_model.png')
    img2_path = os.path.join(os.getcwd(), 'poster_cad_circuit_uniform.png')
    img3_path = os.path.join(os.getcwd(), 'poster_scada_twin_uniform.png')
    img4_path = os.path.join(os.getcwd(), 'poster_telemetry_uniform.png')

    # Helper: Build a uniform card flowable
    def make_card(num_title, img_path, caption_text):
        card_content = []
        # Header bar
        h_table = Table([[Paragraph(f"<b>{num_title}</b>", card_header)]], colWidths=[col_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                               ('TOPPADDING', (0,0), (-1,-1), 2.5),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                               ('LEFTPADDING', (0,0), (-1,-1), 5)])
        card_content.append(h_table)
        card_content.append(Spacer(1, 2))
        
        # Image
        if os.path.exists(img_path):
            card_content.append(RLImage(img_path, width=img_w, height=img_h))
        card_content.append(Spacer(1, 2))
        
        # Caption
        card_content.append(Paragraph(caption_text, caption_style))
        card_content.append(Spacer(1, 2))
        
        # Wrap in border table
        w_table = Table([[card_content]], colWidths=[col_w])
        w_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 0.9, colors.HexColor('#0284c7')),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ffffff')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        return w_table

    card1 = make_card(
        "1. 3D SUB-SURFACE CHAMBER & SENSOR CONE",
        img1_path,
        "<b>Physical 3D Model:</b> Ultrasonic Beam, Water Level (33.4cm), Toxic Gas Zone & Sealed Enclosure"
    )

    card2 = make_card(
        "2. PROFESSIONAL CAD ELECTRONIC SCHEMATIC",
        img2_path,
        "<b>Complete Hardware Bus:</b> Bare-Metal STM32, NodeMCU Gateway, 6 Sensors & 1kΩ/2kΩ Divider"
    )

    card3 = make_card(
        "3. 3D DIGITAL TWIN SCADA PLATFORM",
        img3_path,
        "<b>WebGL SCADA Twin:</b> Three.js physics rendering lid pitch/roll tilt & chamber surcharge"
    )

    card4 = make_card(
        "4. LIVE TELEMETRY & SYSTEM PERFORMANCE",
        img4_path,
        "<b>Multi-Sensor Field Analytics:</b> Real-time curves (ThingSpeak #3558043) & engineering specs"
    )

    # ROW 1 (Panels 1 & 2)
    grid_row1 = Table([[card1, card2]], colWidths=[col_w, col_w])
    grid_row1.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(grid_row1)
    elements.append(Spacer(1, 6))

    # ROW 2 (Panels 3 & 4)
    grid_row2 = Table([[card3, card4]], colWidths=[col_w, col_w])
    grid_row2.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(grid_row2)
    elements.append(Spacer(1, 5))

    # ==================== 4. FOOTER ====================
    elements.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#0284c7'), spaceAfter=2))
    footer_data = [
        [
            Paragraph("<b>Batch 8</b>", footer_style),
            Paragraph("<b>ThingSpeak IoT Cloud:</b> Channel #3558043 (1s Polling)", ParagraphStyle('FC', parent=footer_style, alignment=TA_CENTER)),
            Paragraph("<b>Live 3D SCADA Twin:</b> <font color='#0284c7'>https://pvkkr.github.io/smart-manhole-twin/</font>", ParagraphStyle('FR', parent=footer_style, alignment=TA_RIGHT))
        ]
    ]
    t_foot = Table(footer_data, colWidths=[100, 220, page_w - 320])
    t_foot.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    elements.append(t_foot)

    doc.build(elements)
    print(f"Successfully generated Uniform A4 Project Poster: {pdf_path}")

if __name__ == "__main__":
    build_a4_poster()
