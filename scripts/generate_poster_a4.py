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
    
    # Standard A4 Portrait: 595.27 x 841.89 pt. Tight 10pt margins to utilize 100% of the page.
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=14,
        rightMargin=14,
        topMargin=10,
        bottomMargin=10
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
        fontSize=10,
        leading=13,
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

    box_title_style = ParagraphStyle(
        'PBoxTitle',
        fontName='Helvetica-Bold',
        fontSize=8.4,
        leading=11,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    box_bullet = ParagraphStyle(
        'PBoxBullet',
        fontName='Helvetica',
        fontSize=7.4,
        leading=10.5,
        textColor=colors.HexColor('#1e293b')
    )

    footer_style = ParagraphStyle(
        'PFooter',
        fontName='Helvetica-Bold',
        fontSize=7.6,
        leading=10,
        textColor=colors.HexColor('#475569')
    )

    elements = []
    page_w = 595.27 - 28 # 567.27 pt
    col_w = (page_w - 6) / 2 # 280.63 pt
    img_w = col_w - 6
    img_h = 192
    b_w = 138

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
    t_batch = Table(batch_strip, colWidths=[79, 122, 122, 122, 122])
    t_batch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#0284c7')), # Batch 8 Cyan/Blue
        ('BACKGROUND', (1,0), (-1,-1), colors.HexColor('#f1f5f9')), # Member Cards
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#0284c7')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    elements.append(t_batch)
    elements.append(Spacer(1, 5))

    # ==================== 3. 2x2 UNIFORM VISUAL DIAGRAMS GRID ====================
    img1_path = os.path.join(os.getcwd(), 'poster_chamber_3d_model.png')
    img2_path = os.path.join(os.getcwd(), 'poster_cad_circuit_uniform.png')
    img3_path = os.path.join(os.getcwd(), 'poster_scada_twin_uniform.png')
    img4_path = os.path.join(os.getcwd(), 'poster_telemetry_uniform.png')

    def make_visual_card(title, img_path, caption):
        content = []
        content.append(Table([[Paragraph(f"<b>{title}</b>", card_header)]], colWidths=[col_w],
                             style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                                    ('TOPPADDING', (0,0), (-1,-1), 2.5), ('BOTTOMPADDING', (0,0), (-1,-1), 2.5), ('LEFTPADDING', (0,0), (-1,-1), 5)]))
        content.append(Spacer(1, 1.5))
        if os.path.exists(img_path):
            content.append(RLImage(img_path, width=img_w, height=img_h))
        content.append(Spacer(1, 1))
        content.append(Paragraph(caption, caption_style))
        content.append(Spacer(1, 1))

        w_t = Table([[content]], colWidths=[col_w])
        w_t.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor('#0284c7')),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ffffff')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        return w_t

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
    elements.append(Spacer(1, 5))

    grid_row2 = Table([[card3, card4]], colWidths=[col_w, col_w])
    grid_row2.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0), ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
    elements.append(grid_row2)
    elements.append(Spacer(1, 5))

    # ==================== 4. EXPANDED FULL-PAGE 4 CORE PROJECT BOXES ====================
    def make_info_box(title, bg_color, bullets):
        content = []
        content.append(Table([[Paragraph(f"<b>{title}</b>", box_title_style)]], colWidths=[b_w],
                             style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
                                    ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4)]))
        content.append(Spacer(1, 3))
        b_content = []
        for b in bullets:
            b_content.append(Paragraph(b, box_bullet))
            b_content.append(Spacer(1, 3.5))
        b_t = Table([[b_content]], colWidths=[b_w - 6])
        b_t.setStyle(TableStyle([('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0), ('LEFTPADDING', (0,0), (-1,-1), 2), ('RIGHTPADDING', (0,0), (-1,-1), 2)]))
        content.append(b_t)
        w_t = Table([[content]], colWidths=[b_w])
        w_t.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor(bg_color)),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        return w_t

    b1 = [
        "• <b>24/7 Multi-Sensor Telemetry:</b> Autonomous sub-surface monitoring of chamber water depth, sewer gases, tilt & temp.",
        "• <b>Flash-Flood Pre-emption:</b> Continuous ultrasonic surcharge tracking alerting city drainage before street-level overflow.",
        "• <b>Sanitation Worker Safety:</b> Immediate audio-visual & cloud alarm when toxic gases exceed safe OSHA limits (ADC >2400).",
        "• <b>Cover Anti-Theft Protection:</b> Gyroscopic tilt angle detection (>15°) combined with magnetic reed switch seal monitoring.",
        "• <b>Dual-Mode Zero-Latency Pipeline:</b> Sub-20ms local REST streaming paired with 1-second ThingSpeak cloud synchronization."
    ]
    b2 = [
        "• <b>Municipal Flood Management:</b> Real-time drainage overload telemetry dispatching storm pumps and floodgates automatically.",
        "• <b>Sanitation Pre-Entry Screening:</b> Crews verify subterranean air quality before descending, preventing fatal asphyxiation.",
        "• <b>Urban Road Traffic Safety:</b> Immediate dispatch alerts when vehicle impacts displace or dislodge heavy cast-iron lids.",
        "• <b>Critical Infrastructure Defense:</b> Anti-tamper monitoring guarding underground fiber-optic, power, and gas conduits.",
        "• <b>Smart City GIS Integration:</b> Centralized SCADA twin tracking subterranean utility health across municipal grids."
    ]
    b3 = [
        "• <b>ARM GCC Nano.specs Float Fix:</b> Resolved float stripping in embedded snprintf by implementing fixed-point integer math (%d.%d).",
        "• <b>MPU-6050 I2C Bus Freeze Resolved:</b> Bit-banged slave ACK lockup eliminated via strict I2C_Stop() + 10µs settle sequence.",
        "• <b>300s ThingSpeak CDN Latency Solved:</b> Eliminated browser cache lockup using dynamic timestamp query (?_=Date.now()).",
        "• <b>STM32 5V Voltage Divider:</b> 1kΩ/2kΩ passive divider safely stepping 5.0V Echo to 3.33V, safeguarding PA2 pin.",
        "• <b>Simultaneous 16x2 LCD Character Map:</b> Formatted all 5 metrics simultaneously (D, G, T, TL, SEAL/OPEN) without screen toggling."
    ]
    b4 = [
        "• <b>NB-IoT & LoRaWAN RF Penetration:</b> Sub-GHz long-range telemetry overcoming RF attenuation through cast-iron utility lids.",
        "• <b>Piezoelectric Energy Harvesting:</b> Micro-vibration transducers capturing kinetic mechanical power from traffic vibrations.",
        "• <b>Edge TinyML Sewage Flow Forecasting:</b> Onboard neural network detecting flow anomalies and early sewer pipe blockages.",
        "• <b>Surface-Mounted Solar Studs:</b> Low-profile roadway solar studs providing perpetual trickle charging for zero-maintenance nodes.",
        "• <b>Acoustic Wave Depth Profiling:</b> Multi-frequency ultrasonic depth profiling overcoming sewer steam and foam reflections."
    ]

    elements.append(Table([[make_info_box("1. PROJECT OBJECTIVES", "#0284c7", b1),
                            make_info_box("2. REAL-TIME APPS", "#059669", b2),
                            make_info_box("3. BOTTLENECKS SOLVED", "#d97706", b3),
                            make_info_box("4. FUTURE ROADMAP", "#7c3aed", b4)]],
                          colWidths=[b_w, b_w, b_w, b_w],
                          style=[('VALIGN', (0,0), (-1,-1), 'TOP'), ('TOPPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 0), ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
    elements.append(Spacer(1, 4))

    # ==================== 5. FOOTER ====================
    elements.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#0284c7'), spaceAfter=2))
    footer_data = [
        [
            Paragraph("<b>Batch 8</b>", footer_style),
            Paragraph("<b>ThingSpeak IoT Cloud:</b> Channel #3558043 (1s Polling)", ParagraphStyle('FC', parent=footer_style, alignment=TA_CENTER)),
            Paragraph("<b>Live 3D SCADA Twin:</b> <font color=\"#0284c7\">https://pvkkr.github.io/smart-manhole-twin/</font>", ParagraphStyle('FR', parent=footer_style, alignment=TA_RIGHT))
        ]
    ]
    t_foot = Table(footer_data, colWidths=[90, 220, page_w - 310], style=[('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('TOPPADDING', (0,0), (-1,-1), 1), ('BOTTOMPADDING', (0,0), (-1,-1), 1)])
    elements.append(t_foot)

    doc.build(elements)
    print(f"Successfully generated Uniform A4 Project Poster: {pdf_path}")

if __name__ == "__main__":
    build_a4_poster()
