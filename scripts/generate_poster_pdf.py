import os
import sys
from reportlab.lib.pagesizes import letter, landscape, A3, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

def build_poster(filename="Smart_Manhole_Urban_IoT_Poster.pdf"):
    pdf_path = os.path.join(os.getcwd(), filename)
    
    # Use landscape A3 for a high-impact presentation poster
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(A3),
        leftMargin=24,
        rightMargin=24,
        topMargin=24,
        bottomMargin=24
    )

    styles = getSampleStyleSheet()

    # --- Typography Styles ---
    poster_title = ParagraphStyle(
        'PTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0284c7'),
        alignment=TA_CENTER
    )

    poster_subtitle = ParagraphStyle(
        'PSubTitle',
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569'),
        alignment=TA_CENTER
    )

    section_header = ParagraphStyle(
        'PSectionH',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    card_title = ParagraphStyle(
        'PCardTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0369a1')
    )

    body_text = ParagraphStyle(
        'PBody',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1e293b')
    )

    bullet_text = ParagraphStyle(
        'PBullet',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.2,
        textColor=colors.HexColor('#334155')
    )

    code_text = ParagraphStyle(
        'PCode',
        fontName='Courier-Bold',
        fontSize=7.8,
        leading=10,
        textColor=colors.HexColor('#0369a1')
    )

    team_title_style = ParagraphStyle(
        'PTeam',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_CENTER
    )

    elements = []

    # ==================== BANNER HEADER ====================
    header_content = [
        [
            Paragraph("<b>SMART MANHOLE UTILITIES URBAN IOT</b>", poster_title)
        ],
        [
            Paragraph("Autonomous Sub-Surface Infrastructure Monitoring, Multi-Sensor Telemetry & 3D Digital Twin SCADA Platform", poster_subtitle)
        ]
    ]
    t_head = Table(header_content, colWidths=[1140])
    t_head.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 1),
    ]))
    elements.append(t_head)
    elements.append(Spacer(1, 6))

    # ==================== TEAM BAR ====================
    team_data = [
        [
            Paragraph("<b>PROJECT GROUP: P077</b>", ParagraphStyle('P077', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor('#0284c7'), alignment=TA_CENTER)),
            Paragraph("<b>2400040006</b><br/>P V Kishor Kumar Reddy<br/><font size=6.5 color='#64748b'>Lead Firmware & SCADA</font>", team_title_style),
            Paragraph("<b>2400040004</b><br/>T Perumal<br/><font size=6.5 color='#64748b'>Sensors & Conditioning</font>", team_title_style),
            Paragraph("<b>2400040303</b><br/>Chundu Uday Sai<br/><font size=6.5 color='#64748b'>IoT Gateway & Cloud</font>", team_title_style),
            Paragraph("<b>2400040339</b><br/>Ayan Chowdhury<br/><font size=6.5 color='#64748b'>Hardware & Power Testing</font>", team_title_style),
            Paragraph("<b>LIVE SCADA TWIN</b><br/><font size=7 color='#0284c7'>pvkkr.github.io/smart-manhole-twin/</font>", ParagraphStyle('TwinL', fontName='Helvetica-Bold', fontSize=8, alignment=TA_CENTER, textColor=colors.HexColor('#059669')))
        ]
    ]
    t_team = Table(team_data, colWidths=[150, 200, 200, 200, 200, 190])
    t_team.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_team)
    elements.append(Spacer(1, 10))

    # ==================== 4-COLUMN MAIN CONTENT ====================
    # Column width: (1140 total printable width - 3*12 spacing) / 4 = ~276 per column
    col_w = 276

    # --- COLUMN 1: Objectives & Real-Time Apps ---
    c1 = []
    # Header 1
    c1.append(Table([[Paragraph("<b>1. OBJECTIVES & URBAN APPS</b>", section_header)]], colWidths=[col_w], style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')), ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4)]))
    c1.append(Spacer(1, 4))
    c1.append(Paragraph("<b>The Urban Sub-Surface Crisis:</b> Unmonitored utility manholes cause severe urban flooding from hidden blockages, lethal toxic gas asphyxiation (H₂S, Methane) for sanitation workers, and catastrophic vehicular accidents from displaced, tilted, or stolen covers.", body_text))
    c1.append(Spacer(1, 4))
    c1.append(Paragraph("<b>Key Project Objectives:</b>", card_title))
    c1.append(Paragraph("• <b>Continuous Sub-surface Telemetry:</b> Autonomous 24/7 sensing of water depth, gas concentrations, temperature, and cover orientation.", bullet_text))
    c1.append(Paragraph("• <b>Dual-Mode Latency Pipeline:</b> Sub-20ms local SCADA WebSocket telemetry + 15s historical cloud sync to ThingSpeak.", bullet_text))
    c1.append(Paragraph("• <b>3D Interactive Digital Twin:</b> Physics-accurate visual twin rendering real-time lid kinematics and water surcharge.", bullet_text))
    c1.append(Paragraph("• <b>Immediate Edge Alarms:</b> Onboard acoustic alarm and physical 16x2 LCD display alerting pedestrians on-site.", bullet_text))
    c1.append(Spacer(1, 4))
    c1.append(Paragraph("<b>Real-Time Urban Applications:</b>", card_title))
    c1.append(Paragraph("• <b>Municipal Flood Management:</b> Early flash-flood alerts before storm surge overflows onto city streets.", bullet_text))
    c1.append(Paragraph("• <b>Sanitation Worker Safety:</b> Pre-entry gas hazard screening preventing fatal sewer asphyxiation.", bullet_text))
    c1.append(Paragraph("• <b>Anti-Theft & Critical Infrastructure:</b> Instant tamper alarms guarding fiber-optic and power conduits.", bullet_text))
    c1.append(Paragraph("• <b>Smart City Traffic Safety:</b> Real-time road hazard dispatch when vehicles dislodge heavy cast-iron lids.", bullet_text))

    # --- COLUMN 2: Hardware Architecture & Pin Interconnect ---
    c2 = []
    c2.append(Table([[Paragraph("<b>2. HARDWARE ARCHITECTURE</b>", section_header)]], colWidths=[col_w], style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')), ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4)]))
    c2.append(Spacer(1, 4))
    c2.append(Paragraph("<b>Dual-Core Distributed Processing:</b>", card_title))
    c2.append(Paragraph("• <b>Edge Master: STM32F103C8T6 (ARM Cortex-M3 @ 72MHz):</b> Executes bare-metal register-level CMSIS firmware. Cycles a 10Hz non-blocking deterministic sensor loop with zero RTOS overhead.", bullet_text))
    c2.append(Paragraph("• <b>IoT Gateway: NodeMCU V3 (ESP8266):</b> Ingests JSON frames over USART1 (PA9 → D7 @ 115200 baud). Hosts local REST/WebSocket server and posts to ThingSpeak Cloud.", bullet_text))
    c2.append(Spacer(1, 4))
    c2.append(Paragraph("<b>Sensor Cluster & Pin Interconnect:</b>", card_title))
    
    t_hw_mini_data = [
        [Paragraph("<b>Sensor</b>", code_text), Paragraph("<b>STM32 Pin</b>", code_text), Paragraph("<b>Function / Range</b>", code_text)],
        [Paragraph("HC-SR04", code_text), Paragraph("PA1 (T), PA2 (E)", code_text), Paragraph("Water Air Gap (2-400cm)", code_text)],
        [Paragraph("MQ-2 Gas", code_text), Paragraph("PA0 (ADC1_IN0)", code_text), Paragraph("Toxic Gas (0-4095 ADC)", code_text)],
        [Paragraph("MPU-6050", code_text), Paragraph("PB8 (SCL), PB9 (SDA)", code_text), Paragraph("3-Axis Tilt (0° to 90°)", code_text)],
        [Paragraph("16x2 LCD", code_text), Paragraph("PB8 (SCL), PB9 (SDA)", code_text), Paragraph("All-in-One Live Readout", code_text)],
        [Paragraph("DS18B20", code_text), Paragraph("PB12 (1-Wire)", code_text), Paragraph("Sub-surface Temp (°C)", code_text)],
        [Paragraph("Reed Switch", code_text), Paragraph("PB13 (Pull-Up)", code_text), Paragraph("Cover Seal / Tamper", code_text)],
        [Paragraph("Buzzer", code_text), Paragraph("PB0 (GPIO Out)", code_text), Paragraph("Audible Warning Beacon", code_text)]
    ]
    t_hw_mini = Table(t_hw_mini_data, colWidths=[65, 85, 120])
    t_hw_mini.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))
    c2.append(t_hw_mini)
    c2.append(Spacer(1, 4))
    c2.append(Paragraph("• <b>Echo Voltage Divider:</b> 1kΩ / 2kΩ resistive divider safely steps 5.0V Echo down to 3.33V for ADC pin PA2 protection.", bullet_text))

    # --- COLUMN 3: Digital Twin & Bottlenecks Overcome ---
    c3 = []
    c3.append(Table([[Paragraph("<b>3. BOTTLENECKS SOLVED</b>", section_header)]], colWidths=[col_w], style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')), ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4)]))
    c3.append(Spacer(1, 4))
    c3.append(Paragraph("<b>Key Engineering Challenges & Fixes:</b>", card_title))
    c3.append(Paragraph("• <b>GCC nano.specs Float Omission Bug:</b> Default ARM GCC nano.specs stripped %f support in snprintf, causing blank LCD numbers (D:cm, T:C) and broken JSON. <i>Fix: Implemented fixed-point integer formatting (%d.%d).</i>", bullet_text))
    c3.append(Spacer(1, 2))
    c3.append(Paragraph("• <b>Bit-Bang I2C Repeated-Start Glitch:</b> MPU6050 ACK held SDA low during repeated starts, causing read timeouts and locking tilt to 0°. <i>Fix: Replaced with clean Stop-Start cycle with settle delays.</i>", bullet_text))
    c3.append(Spacer(1, 2))
    c3.append(Paragraph("• <b>DS18B20 750ms Blocking Freeze:</b> 12-bit temp conversion froze MCU execution for 750ms per loop. <i>Fix: Re-engineered as an asynchronous non-blocking state machine cycling at 10Hz.</i>", bullet_text))
    c3.append(Spacer(1, 2))
    c3.append(Paragraph("• <b>Browser / CDN 300-Second Stale Cache:</b> Browsers cached ThingSpeak feeds/last.json for 5 minutes. <i>Fix: Appended dynamic timestamp query params (?_=${Date.now()}) and strict no-store headers.</i>", bullet_text))
    c3.append(Spacer(1, 2))
    c3.append(Paragraph("• <b>HC-SR04 Air Gap Clamping:</b> Raw distance was artificially clamped <=50cm. <i>Fix: Expanded to full 400cm range with ARM Cortex DWT cycle-counter microsecond timing.</i>", bullet_text))

    # --- COLUMN 4: SCADA Digital Twin & Future Roadmap ---
    c4 = []
    c4.append(Table([[Paragraph("<b>4. SCADA TWIN & FUTURE WORK</b>", section_header)]], colWidths=[col_w], style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0f172a')), ('TOPPADDING', (0,0), (-1,-1), 4), ('BOTTOMPADDING', (0,0), (-1,-1), 4)]))
    c4.append(Spacer(1, 4))
    c4.append(Paragraph("<b>3D Digital Twin Features:</b>", card_title))
    c4.append(Paragraph("• <b>Three.js Kinematics:</b> 3D manhole model mirrors physical lid tilt angle in real time based on MPU6050 readings.", bullet_text))
    c4.append(Paragraph("• <b>Dynamic Water Physics:</b> Shader-rendered fluid volume calculates water percentage from HC-SR04 depth.", bullet_text))
    c4.append(Paragraph("• <b>Multi-Channel SCADA Alarms:</b> Visual color-coded cards and audible sirens trigger on CRITICAL thresholds.", bullet_text))
    c4.append(Spacer(1, 4))
    c4.append(Paragraph("<b>Physical 16x2 LCD Interface:</b>", card_title))
    c4.append(Paragraph("Simultaneous 5-parameter real-time display:", bullet_text))
    c4.append(Paragraph("<code>Row 1: D: 25cm   G:790<br/>Row 2: T:28C TL: 0 SEAL (or TL:35 OPEN)</code>", code_text))
    c4.append(Spacer(1, 4))
    c4.append(Paragraph("<b>Future Improvements & Scaling:</b>", card_title))
    c4.append(Paragraph("• <b>LoRaWAN / NB-IoT Long Range:</b> Subterranean transmission through heavy cast-iron lids to gateways 10km away with 5+ year battery lifespan.", bullet_text))
    c4.append(Paragraph("• <b>Energy Harvesting:</b> Piezoelectric generators harvesting kinetic vibration from traffic rolling over covers.", bullet_text))
    c4.append(Paragraph("• <b>Edge TinyML Anomaly Detection:</b> Microcontroller-level predictive analytics forecasting sewer pipe siltation.", bullet_text))
    c4.append(Paragraph("• <b>City GIS Integration:</b> Spatial fleet-wide mapping connecting thousands of manholes to municipal command centers.", bullet_text))

    # Assemble 4 columns into a single row table
    cols_table = Table([[c1, c2, c3, c4]], colWidths=[col_w, col_w, col_w, col_w])
    cols_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(cols_table)
    elements.append(Spacer(1, 10))

    # ==================== FOOTER ====================
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=4))
    footer_data = [
        [
            Paragraph("<b>Project:</b> Smart Manhole Cover Monitoring for Utilities • Group P077", ParagraphStyle('F1', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor('#334155'))),
            Paragraph("<b>Cloud Telemetry:</b> ThingSpeak IoT Channel #2489123 • 1-Second Read Polling", ParagraphStyle('F2', fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#64748b'), alignment=TA_CENTER)),
            Paragraph("<b>Digital Twin SCADA:</b> <font color='#0284c7'>https://pvkkr.github.io/smart-manhole-twin/</font>", ParagraphStyle('F3', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor('#0284c7'), alignment=TA_RIGHT))
        ]
    ]
    t_footer = Table(footer_data, colWidths=[380, 380, 380])
    t_footer.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(t_footer)

    doc.build(elements)
    print(f"Successfully generated: {pdf_path}")

if __name__ == "__main__":
    build_poster()
