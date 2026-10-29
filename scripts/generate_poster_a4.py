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
        leftMargin=18,
        rightMargin=18,
        topMargin=16,
        bottomMargin=16
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
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155'),
        alignment=TA_CENTER
    )

    badge_batch = ParagraphStyle(
        'PBatch',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    team_name = ParagraphStyle(
        'PTeam',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
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
        leading=9.8,
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
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_CENTER
    )

    footer_style = ParagraphStyle(
        'PFooter',
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#475569')
    )

    elements = []
    page_w = 595.27 - 36 # 559.27 pt

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

    # ==================== 2. BATCH 8 & GROUP P077 TEAM BAR ====================
    # Color Xerox optimized banner with batch 8 highlighted
    batch_strip = [
        [
            Paragraph("<b>BATCH: BATCH 8</b>", badge_batch),
            Paragraph("<b>PROJECT GROUP: P077</b>", badge_batch),
            Paragraph("<b>2400040006</b><br/>P V Kishor Kumar Reddy", team_name),
            Paragraph("<b>2400040004</b><br/>T Perumal", team_name),
            Paragraph("<b>2400040303</b><br/>Chundu Uday Sai", team_name),
            Paragraph("<b>2400040339</b><br/>Ayan Chowdhury", team_name),
        ]
    ]
    t_batch = Table(batch_strip, colWidths=[75, 95, 98, 97, 97, 97])
    t_batch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#0284c7')), # Batch 8 Cyan/Blue
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#0f172a')), # Group P077 Dark Navy
        ('BACKGROUND', (2,0), (-1,-1), colors.HexColor('#f1f5f9')), # Member Cards
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#0284c7')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    elements.append(t_batch)
    elements.append(Spacer(1, 5))

    # ==================== 3. SYSTEM ARCHITECTURE (IMAGE 1) ====================
    sec1_banner = Table([[Paragraph("<b>1. SYSTEM ARCHITECTURE & END-TO-END TELEMETRY PIPELINE</b>", section_banner)]],
                        colWidths=[page_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                               ('TOPPADDING', (0,0), (-1,-1), 2.5),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                               ('LEFTPADDING', (0,0), (-1,-1), 6)])
    elements.append(sec1_banner)
    elements.append(Spacer(1, 3))

    arch_img_path = os.path.join(os.getcwd(), 'poster_arch_diagram.png')
    if os.path.exists(arch_img_path):
        # 559 pt width, 140 pt height
        img_arch = RLImage(arch_img_path, width=page_w, height=128)
        elements.append(img_arch)
    elements.append(Spacer(1, 5))

    # ==================== 4. HARDWARE PROTOTYPE & 3D DIGITAL TWIN (IMAGES 2 & 3) ====================
    sec2_banner = Table([[Paragraph("<b>2. HARDWARE PROTOTYPE & 3D DIGITAL TWIN SCADA INTERFACE</b>", section_banner)]],
                        colWidths=[page_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                               ('TOPPADDING', (0,0), (-1,-1), 2.5),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                               ('LEFTPADDING', (0,0), (-1,-1), 6)])
    elements.append(sec2_banner)
    elements.append(Spacer(1, 3))

    # Left: Hardware Prototype Photo (cropped 556x600)
    hw_img_path = os.path.join(os.getcwd(), 'poster_hw_prototype.jpg')
    # Right: 3D SCADA Twin Screenshot (1024x575)
    scada_img_path = os.path.join(os.getcwd(), 'poster_scada_twin.jpg')

    col_half = (page_w - 6) / 2 # ~276.5 pt
    
    hw_flowable = []
    if os.path.exists(hw_img_path):
        hw_flowable.append(RLImage(hw_img_path, width=col_half - 8, height=140))
        hw_flowable.append(Spacer(1, 2))
        hw_flowable.append(Paragraph("<b>Physical Hardware Circuit:</b> 16x2 LCD + NodeMCU V3 + STM32 Core", caption_style))

    scada_flowable = []
    if os.path.exists(scada_img_path):
        scada_flowable.append(RLImage(scada_img_path, width=col_half - 8, height=140))
        scada_flowable.append(Spacer(1, 2))
        scada_flowable.append(Paragraph("<b>Live 3D Digital Twin:</b> Physics-accurate chamber water level & lid tilt", caption_style))

    t_vis = Table([[hw_flowable, scada_flowable]], colWidths=[col_half, col_half])
    t_vis.setStyle(TableStyle([
        ('BOX', (0,0), (0,0), 0.8, colors.HexColor('#0284c7')),
        ('BOX', (1,0), (1,0), 0.8, colors.HexColor('#0284c7')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_vis)
    elements.append(Spacer(1, 5))

    # ==================== 5. LIVE TELEMETRY CHARTS & COMPACT SPECS (IMAGE 4 + TEXT) ====================
    sec3_banner = Table([[Paragraph("<b>3. MULTI-SENSOR LIVE TELEMETRY & FIELD VERIFICATION</b>", section_banner)]],
                        colWidths=[page_w],
                        style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')),
                               ('TOPPADDING', (0,0), (-1,-1), 2.5),
                               ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                               ('LEFTPADDING', (0,0), (-1,-1), 6)])
    elements.append(sec3_banner)
    elements.append(Spacer(1, 3))

    chart_img_path = os.path.join(os.getcwd(), 'poster_telemetry_chart.png')
    
    # Left col: 4-channel telemetry chart (width: 320 pt, height: 165 pt)
    chart_flowable = []
    if os.path.exists(chart_img_path):
        chart_flowable.append(RLImage(chart_img_path, width=310, height=160))
        chart_flowable.append(Spacer(1, 1))
        chart_flowable.append(Paragraph("<b>Real-Time Multi-Sensor Telemetry Graphs</b> (ThingSpeak Channel #3558043)", caption_style))

    # Right col: Compact Bullet Points (Width: 239 pt)
    specs_flowable = [
        Paragraph("<b>Key Project Objectives:</b>", card_h),
        Paragraph("• <b>Flood Pre-emption:</b> HC-SR04 continuous water surcharge measurement.", bullet_style),
        Paragraph("• <b>Worker Safety:</b> MQ-2 toxic methane/sewer gas alert threshold (ADC >2400).", bullet_style),
        Paragraph("• <b>Anti-Tamper & Theft:</b> MPU-6050 3-axis tilt + Reed switch cover seal.", bullet_style),
        Spacer(1, 3),
        Paragraph("<b>Engineering Results Overcome:</b>", card_h),
        Paragraph("• <b>Float Fix:</b> Converted ARM GCC nano.specs to fixed-point (%d.%d).", bullet_style),
        Paragraph("• <b>I2C Lockup:</b> Eliminated bus freeze with strict I2C_Stop & restart settle.", bullet_style),
        Paragraph("• <b>Zero-Latency:</b> Sub-20ms local REST (/telemetry) + 1s ThingSpeak cache-bust.", bullet_style),
        Spacer(1, 3),
        Paragraph("<b>Real-World Deployment:</b>", card_h),
        Paragraph("• <b>Dual Core:</b> STM32 bare-metal deterministic loop + NodeMCU ESP8266.", bullet_style),
        Paragraph("• <b>5V Voltage Divider:</b> 1kΩ/2kΩ protective divider safeguarding STM32 PA2.", bullet_style)
    ]

    t_bottom = Table([[chart_flowable, specs_flowable]], colWidths=[316, page_w - 316])
    t_bottom.setStyle(TableStyle([
        ('BOX', (0,0), (0,0), 0.8, colors.HexColor('#cbd5e1')),
        ('BOX', (1,0), (1,0), 0.8, colors.HexColor('#0284c7')),
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#ffffff')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f8fafc')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_bottom)
    elements.append(Spacer(1, 5))

    # ==================== 6. FOOTER ====================
    elements.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#0284c7'), spaceAfter=2))
    footer_data = [
        [
            Paragraph("<b>Batch 8 • Group P077</b>", footer_style),
            Paragraph("<b>ThingSpeak IoT Channel:</b> #3558043 (1s Polling)", ParagraphStyle('FC', parent=footer_style, alignment=TA_CENTER)),
            Paragraph("<b>Live 3D SCADA Twin:</b> <font color='#0284c7'>https://pvkkr.github.io/smart-manhole-twin/</font>", ParagraphStyle('FR', parent=footer_style, alignment=TA_RIGHT))
        ]
    ]
    t_foot = Table(footer_data, colWidths=[150, 190, page_w - 340])
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
