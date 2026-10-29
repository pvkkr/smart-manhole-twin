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
        leftMargin=14,
        rightMargin=14,
        topMargin=12,
        bottomMargin=12
    )

    styles = getSampleStyleSheet()

    # --- Typography Styles ---
    title_style = ParagraphStyle(
        'PTitle',
        fontName='Helvetica-Bold',
        fontSize=15.5,
        leading=18,
        textColor=colors.HexColor('#0284c7'),
        alignment=TA_CENTER
    )

    subtitle_style = ParagraphStyle(
        'PSubTitle',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#334155'),
        alignment=TA_CENTER
    )

    badge_batch = ParagraphStyle(
        'PBatch',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11.5,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    team_name = ParagraphStyle(
        'PTeam',
        fontName='Helvetica-Bold',
        fontSize=7.4,
        leading=9.2,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_CENTER
    )

    card_header = ParagraphStyle(
        'PCardH',
        fontName='Helvetica-Bold',
        fontSize=7.6,
        leading=9.8,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    caption_style = ParagraphStyle(
        'PCaption',
        fontName='Helvetica',
        fontSize=6.4,
        leading=8,
        textColor=colors.HexColor('#334155'),
        alignment=TA_CENTER
    )

    box_title_style = ParagraphStyle(
        'PBoxTitle',
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.2,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    box_bullet = ParagraphStyle(
        'PBoxBullet',
        fontName='Helvetica',
        fontSize=6.0,
        leading=7.8,
        textColor=colors.HexColor('#1e293b')
    )

    footer_style = ParagraphStyle(
        'PFooter',
        fontName='Helvetica-Bold',
        fontSize=6.8,
        leading=9,
        textColor=colors.HexColor('#475569')
    )

    elements = []
    page_w = 595.27 - 28 # 567.27 pt
    col_w = (page_w - 6) / 2 # 280.63 pt
    img_w = col_w - 8 # 272.63 pt
    img_h = 162 # Scaled to leave plenty of room for 4 boxes!

    # ==================== 1. TITLE & SUBTITLE ====================
    header_data = [
        [Paragraph("<b>SMART MANHOLE UTILITIES URBAN IOT</b>", title_style)],
        [Paragraph("Autonomous Sub-Surface Infrastructure Monitoring, Real-Time Cloud Telemetry &amp; 3D Digital Twin SCADA", subtitle_style)]
    ]
    t_head = Table(header_data, colWidths=[page_w])
    t_head.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0.5),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(t_head)
    elements.append(Spacer(1, 2))

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
    t_batch = Table(batch_strip, colWidths=[79, 122, 122, 122, 122])
    t_batch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#0284c7')), # Batch 8
        ('BACKGROUND', (1,0), (-1,-1), colors.HexColor('#f1f5f9')), # Member Cards
        ('BOX', (0,0), (-1,-1), 1.1, colors.HexColor('#0284c7')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    elements.append(t_batch)
    elements.append(Spacer(1, 4))

    # ==================== 3. 2x2 VISUAL DIAGRAMS GRID ====================
    img1_path = os.path.join(os.getcwd(), 'poster_chamber_3d_model.png')
    img2_path = os.path.join(os.getcwd(), 'poster_cad_circuit_uniform.png')
    img3_path = os.path.join(os.getcwd(), 'poster_scada_twin_uniform.png')
    img4_path = os.path.join(os.getcwd(), 'poster_telemetry_uniform.png')

    def make_visual_card(title, img_path, caption):
        content = []
        h_table = Table([[Paragraph(f"<b>{title}</b>", card_header)]], colWidths=[col_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                               ('TOPPADDING', (0,0), (-1,-1), 2),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                               ('LEFTPADDING', (0,0), (-1,-1), 5)])
        content.append(h_table)
        content.append(Spacer(1, 1.5))
        if os.path.exists(img_path):
            content.append(RLImage(img_path, width=img_w, height=img_h))
        content.append(Spacer(1, 1))
        content.append(Paragraph(caption, caption_style))
        content.append(Spacer(1, 1))

        w_table = Table([[content]], colWidths=[col_w])
        w_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#0284c7')),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ffffff')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        return w_table

    card1 = make_visual_card("1. 3D SUB-SURFACE CHAMBER & SENSOR CONE", img1_path,
                             "<b>Physical 3D Model:</b> Ultrasonic Beam, Water Level (33.4cm), Gas Zone & Enclosure")
    card2 = make_visual_card("2. PROFESSIONAL CAD ELECTRONIC SCHEMATIC", img2_path,
                             "<b>Complete Hardware Bus:</b> Bare-Metal STM32, NodeMCU, 6 Sensors & 1kΩ/2kΩ Divider")
    card3 = make_visual_card("3. 3D DIGITAL TWIN SCADA PLATFORM", img3_path,
                             "<b>WebGL SCADA Twin:</b> Three.js physics rendering lid pitch/roll tilt & chamber surcharge")
    card4 = make_visual_card("4. LIVE TELEMETRY & FIELD VERIFICATION", img4_path,
                             "<b>Multi-Sensor Analytics:</b> Real-time curves (ThingSpeak #3558043) & telemetry specs")

    grid_row1 = Table([[card1, card2]], colWidths=[col_w, col_w])
    grid_row1.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0), ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
    elements.append(grid_row1)
    elements.append(Spacer(1, 4))

    grid_row2 = Table([[card3, card4]], colWidths=[col_w, col_w])
    grid_row2.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0), ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
    elements.append(grid_row2)
    elements.append(Spacer(1, 4))

    # ==================== 4. THE 4 SMALL CORE PROJECT BOXES ====================
    # 4 equal columns: (page_w - 3*5) / 4 = (567.27 - 15) / 4 = 138 pt each
    b_w = 138

    def make_info_box(title, bg_color, bullets):
        content = []
        h_table = Table([[Paragraph(f"<b>{title}</b>", box_title_style)]], colWidths=[b_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
                               ('TOPPADDING', (0,0), (-1,-1), 2),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2)])
        content.append(h_table)
        content.append(Spacer(1, 2))
        
        b_content = []
        for b in bullets:
            b_content.append(Paragraph(b, box_bullet))
            b_content.append(Spacer(1, 1.5))
        
        b_table = Table([[b_content]], colWidths=[b_w - 6])
        b_table.setStyle(TableStyle([('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0), ('LEFTPADDING', (0,0), (-1,-1), 1), ('RIGHTPADDING', (0,0), (-1,-1), 1)]))
        content.append(b_table)

        w_table = Table([[content]], colWidths=[b_w])
        w_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor(bg_color)),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        return w_table

    # Box 1: Objectives
    bullets1 = [
        "• <b>24/7 Telemetry:</b> Sub-surface sensing of depth, gas, tilt & temp.",
        "• <b>Flood Pre-emption:</b> Ultrasonic surcharge tracking before street overflow.",
        "• <b>Worker Safety:</b> Toxic gas threshold alarm (ADC >2400).",
        "• <b>Anti-Theft:</b> 3-axis lid tilt + magnetic reed seal detection."
    ]
    box1 = make_info_box("1. PROJECT OBJECTIVES", "#0284c7", bullets1)

    # Box 2: Real-Time Applications
    bullets2 = [
        "• <b>Flood Management:</b> Real-time drainage surcharge alert dispatch.",
        "• <b>Sanitation Safety:</b> Pre-entry gas screening preventing asphyxiation.",
        "• <b>Road Traffic Safety:</b> Vehicle impact & lid displacement alarm.",
        "• <b>Asset Defense:</b> Tamper alerts guarding fiber & power conduits."
    ]
    box2 = make_info_box("2. REAL-TIME APPS", "#059669", bullets2)

    # Box 3: Bottlenecks Overcome
    bullets3 = [
        "• <b>ARM Float Fix:</b> Nano.specs float stripped; fixed via integer %d.%d.",
        "• <b>I2C Lockup:</b> Eliminated bus freeze with strict I2C_Stop & settle.",
        "• <b>Zero-Latency:</b> Sub-20ms local REST + 1s ThingSpeak cache-bust.",
        "• <b>5V Level Shift:</b> 1kΩ/2kΩ voltage divider safeguarding STM32 PA2."
    ]
    box3 = make_info_box("3. BOTTLENECKS SOLVED", "#d97706", bullets3)

    # Box 4: Future Improvements
    bullets4 = [
        "• <b>NB-IoT / LoRaWAN:</b> Deep RF penetration through heavy iron lids.",
        "• <b>Kinetic Harvesting:</b> Piezoelectric power from traffic vibration.",
        "• <b>Edge TinyML:</b> Onboard neural network flow anomaly forecasting.",
        "• <b>Solar Stud Tops:</b> Surface-mounted studs for perpetual power."
    ]
    box4 = make_info_box("4. FUTURE ROADMAP", "#7c3aed", bullets4)

    boxes_table = Table([[box1, box2, box3, box4]], colWidths=[b_w, b_w, b_w, b_w])
    boxes_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(boxes_table)
    elements.append(Spacer(1, 3))

    # ==================== 5. FOOTER ====================
    elements.append(HRFlowable(width="100%", thickness=1.0, color=colors.HexColor('#0284c7'), spaceAfter=2))
    footer_data = [
        [
            Paragraph("<b>Batch 8</b>", footer_style),
            Paragraph("<b>ThingSpeak IoT Cloud:</b> Channel #3558043 (1s Polling)", ParagraphStyle('FC', parent=footer_style, alignment=TA_CENTER)),
            Paragraph("<b>Live 3D SCADA Twin:</b> <font color='#0284c7'>https://pvkkr.github.io/smart-manhole-twin/</font>", ParagraphStyle('FR', parent=footer_style, alignment=TA_RIGHT))
        ]
    ]
    t_foot = Table(footer_data, colWidths=[90, 220, page_w - 310])
    t_foot.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0.5),
    ]))
    elements.append(t_foot)

    doc.build(elements)
    print(f"Successfully generated Uniform A4 Project Poster: {pdf_path}")

if __name__ == "__main__":
    build_a4_poster()
