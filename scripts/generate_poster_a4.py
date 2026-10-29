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
    
    # A4 Portrait: 595.27 x 841.89 pt. Tight margins for maximum visual area.
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
        fontSize=16,
        leading=19,
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

    section_banner = ParagraphStyle(
        'PSBanner',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        'PBullet',
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.6,
        textColor=colors.HexColor('#1e293b')
    )

    card_h = ParagraphStyle(
        'PCardH',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10,
        textColor=colors.HexColor('#0369a1')
    )

    caption_style = ParagraphStyle(
        'PCaption',
        fontName='Helvetica-Bold',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor('#0f172a'),
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

    # ==================== 1. TITLE & SUBTITLE ====================
    header_data = [
        [Paragraph("<b>SMART MANHOLE UTILITIES URBAN IOT</b>", title_style)],
        [Paragraph("Autonomous Sub-Surface Monitoring, Real-Time Cloud Telemetry & 3D Digital Twin SCADA", subtitle_style)]
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
    # Distinct Batch 8 pill + 4 member cards
    batch_strip = [
        [
            Paragraph("<b>BATCH 8</b>", badge_batch),
            Paragraph("<b>2400040006</b><br/>P V Kishor Kumar Reddy", team_name),
            Paragraph("<b>2400040004</b><br/>T Perumal", team_name),
            Paragraph("<b>2400040303</b><br/>Chundu Uday Sai", team_name),
            Paragraph("<b>2400040339</b><br/>Ayan Chowdhury", team_name),
        ]
    ]
    # Total width: 563.27 pt. 83 + 120 + 120 + 120 + 120 = 563 pt
    t_batch = Table(batch_strip, colWidths=[83, 120, 120, 120, 120])
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
    elements.append(Spacer(1, 4))

    # ==================== 3. PROFESSIONAL CIRCUIT SCHEMATIC (PRIMARY CAD IMAGE) ====================
    sec1_banner = Table([[Paragraph("<b>1. PROFESSIONAL CIRCUIT SCHEMATIC &amp; HARDWARE INTERCONNECT</b>", section_banner)]],
                        colWidths=[page_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                               ('TOPPADDING', (0,0), (-1,-1), 2.5),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                               ('LEFTPADDING', (0,0), (-1,-1), 6)])
    elements.append(sec1_banner)
    elements.append(Spacer(1, 2))

    schematic_img_path = os.path.join(os.getcwd(), 'poster_circuit_schematic.png')
    if os.path.exists(schematic_img_path):
        # 563 pt width, 180 pt height (Aspect ratio ~ 10:5.2 = 1.92 -> 563 / 1.92 = 293 -> scaled to 175pt)
        img_schem = RLImage(schematic_img_path, width=page_w, height=172)
        elements.append(img_schem)
        elements.append(Spacer(1, 1))
        elements.append(Paragraph("<b>Electrical Interconnect CAD Blueprint:</b> Bare-Metal STM32F103 Master, NodeMCU ESP8266 Gateway, 6-Sensor Bus &amp; 1kΩ/2kΩ Voltage Divider", caption_style))
    elements.append(Spacer(1, 4))

    # ==================== 4. HARDWARE PROTOTYPE & 3D DIGITAL TWIN (IMAGES 2 & 3) ====================
    sec2_banner = Table([[Paragraph("<b>2. PHYSICAL HARDWARE PROTOTYPE &amp; 3D DIGITAL TWIN SCADA INTERFACE</b>", section_banner)]],
                        colWidths=[page_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                               ('TOPPADDING', (0,0), (-1,-1), 2.5),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                               ('LEFTPADDING', (0,0), (-1,-1), 6)])
    elements.append(sec2_banner)
    elements.append(Spacer(1, 2))

    hw_img_path = os.path.join(os.getcwd(), 'poster_hw_prototype.jpg')
    scada_img_path = os.path.join(os.getcwd(), 'poster_scada_twin.jpg')

    col_half = (page_w - 6) / 2 # ~278.6 pt
    
    hw_flowable = []
    if os.path.exists(hw_img_path):
        hw_flowable.append(RLImage(hw_img_path, width=col_half - 8, height=128))
        hw_flowable.append(Spacer(1, 1.5))
        hw_flowable.append(Paragraph("<b>Benchtop Hardware Circuit:</b> 16x2 LCD + NodeMCU + STM32", caption_style))

    scada_flowable = []
    if os.path.exists(scada_img_path):
        scada_flowable.append(RLImage(scada_img_path, width=col_half - 8, height=128))
        scada_flowable.append(Spacer(1, 1.5))
        scada_flowable.append(Paragraph("<b>Live 3D Digital Twin:</b> Physics-accurate water level &amp; lid tilt", caption_style))

    t_vis = Table([[hw_flowable, scada_flowable]], colWidths=[col_half, col_half])
    t_vis.setStyle(TableStyle([
        ('BOX', (0,0), (0,0), 0.8, colors.HexColor('#0284c7')),
        ('BOX', (1,0), (1,0), 0.8, colors.HexColor('#0284c7')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_vis)
    elements.append(Spacer(1, 4))

    # ==================== 5. LIVE TELEMETRY CHARTS & COMPACT SPECS (IMAGE 4 + TEXT) ====================
    sec3_banner = Table([[Paragraph("<b>3. MULTI-SENSOR LIVE TELEMETRY &amp; FIELD PERFORMANCE</b>", section_banner)]],
                        colWidths=[page_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                               ('TOPPADDING', (0,0), (-1,-1), 2.5),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                               ('LEFTPADDING', (0,0), (-1,-1), 6)])
    elements.append(sec3_banner)
    elements.append(Spacer(1, 2))

    chart_img_path = os.path.join(os.getcwd(), 'poster_telemetry_chart.png')
    
    # Left col: 4-channel telemetry chart (width: 312 pt, height: 152 pt)
    chart_flowable = []
    if os.path.exists(chart_img_path):
        chart_flowable.append(RLImage(chart_img_path, width=305, height=148))
        chart_flowable.append(Spacer(1, 1))
        chart_flowable.append(Paragraph("<b>Real-Time Multi-Sensor Telemetry Graphs</b> (ThingSpeak Channel #3558043)", caption_style))

    # Right col: Compact Bullet Points (Width: 251 pt)
    specs_flowable = [
        Paragraph("<b>Key Project Capabilities:</b>", card_h),
        Paragraph("• <b>Flood Sensing:</b> HC-SR04 continuous water depth (2–400cm).", bullet_style),
        Paragraph("• <b>Worker Safety:</b> MQ-2 toxic gas alarm threshold (ADC &gt;2400).", bullet_style),
        Paragraph("• <b>Cover Anti-Theft:</b> MPU-6050 3-axis tilt + Reed switch seal.", bullet_style),
        Spacer(1, 2),
        Paragraph("<b>Engineering Bottlenecks Solved:</b>", card_h),
        Paragraph("• <b>ARM Float Fix:</b> Nano.specs float stripped; resolved with %d.%d.", bullet_style),
        Paragraph("• <b>I2C Lockup:</b> Eliminated bus freeze with strict I2C_Stop &amp; settle.", bullet_style),
        Paragraph("• <b>Zero-Latency:</b> Sub-20ms local REST (/telemetry) + 1s ThingSpeak.", bullet_style),
        Spacer(1, 2),
        Paragraph("<b>Hardware &amp; Interfacing:</b>", card_h),
        Paragraph("• <b>Dual Core:</b> Bare-metal STM32 10Hz loop + NodeMCU ESP8266.", bullet_style),
        Paragraph("• <b>Voltage Divider:</b> 1kΩ/2kΩ passive divider protects PA2 pin.", bullet_style)
    ]

    t_bottom = Table([[chart_flowable, specs_flowable]], colWidths=[312, page_w - 312])
    t_bottom.setStyle(TableStyle([
        ('BOX', (0,0), (0,0), 0.8, colors.HexColor('#cbd5e1')),
        ('BOX', (1,0), (1,0), 0.8, colors.HexColor('#0284c7')),
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#ffffff')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f8fafc')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_bottom)
    elements.append(Spacer(1, 4))

    # ==================== 6. FOOTER ====================
    elements.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#0284c7'), spaceAfter=2))
    footer_data = [
        [
            Paragraph("<b>Batch 8</b>", footer_style),
            Paragraph("<b>ThingSpeak IoT Channel:</b> #3558043 (1s Polling)", ParagraphStyle('FC', parent=footer_style, alignment=TA_CENTER)),
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
    print(f"Successfully generated A4 Project Poster: {pdf_path}")

if __name__ == "__main__":
    build_a4_poster()
