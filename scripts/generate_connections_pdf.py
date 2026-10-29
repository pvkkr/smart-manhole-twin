import os
import sys
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

def build_pdf(filename="Smart_Manhole_Hardware_Connections.pdf"):
    pdf_path = os.path.join(os.getcwd(), filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0369a1'),
        alignment=TA_LEFT
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#475569'),
        alignment=TA_LEFT
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )

    body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )

    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )

    cell_code = ParagraphStyle(
        'CellCode',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0284c7')
    )

    elements = []

    # --- Header Block ---
    header_data = [
        [
            Paragraph("<b>SMART MANHOLE UTILITIES URBAN IOT</b>", title_style),
            Paragraph("<b>PROJECT GROUP: P077</b><br/><font size=8 color='#64748b'>SCADA Digital Twin v2.4</font>", ParagraphStyle('HRight', alignment=TA_RIGHT, fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=colors.HexColor('#0284c7')))
        ],
        [
            Paragraph("Hardware Pin Interconnect Specification & Engineering Wiring Manual", subtitle_style),
            Paragraph("<font size=8 color='#059669'><b>STATUS: VERIFIED & TESTED</b></font>", ParagraphStyle('StatusR', alignment=TA_RIGHT))
        ]
    ]
    t_header = Table(header_data, colWidths=[360, 160])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(t_header)
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284c7'), spaceAfter=10))

    # --- Team Members Table ---
    team_data = [
        [
            Paragraph("<b>STUDENT ID</b>", cell_bold),
            Paragraph("<b>TEAM MEMBER NAME</b>", cell_bold),
            Paragraph("<b>PROJECT DOMAIN / RESPONSIBILITY</b>", cell_bold)
        ],
        [
            Paragraph("2400040006", cell_code),
            Paragraph("<b>P V Kishor Kumar Reddy</b>", cell_style),
            Paragraph("Lead Embedded Firmware & 3D SCADA Digital Twin Architecture", cell_style)
        ],
        [
            Paragraph("2400040004", cell_code),
            Paragraph("<b>T Perumal</b>", cell_style),
            Paragraph("Sensor Signal Conditioning & Physical Circuit Calibration", cell_style)
        ],
        [
            Paragraph("2400040303", cell_code),
            Paragraph("<b>Chundu Uday Sai</b>", cell_style),
            Paragraph("IoT Gateway Networking, NodeMCU & Cloud Ingestion", cell_style)
        ],
        [
            Paragraph("2400040339", cell_code),
            Paragraph("<b>Ayan Chowdhury</b>", cell_style),
            Paragraph("Hardware Prototyping, Power Distribution & Reliability Testing", cell_style)
        ]
    ]
    t_team = Table(team_data, colWidths=[100, 170, 250])
    t_team.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_team)
    elements.append(Spacer(1, 10))

    # --- Section 1: System Hardware Architecture ---
    elements.append(Paragraph("1. System Architecture & Interconnect Bus", h1_style))
    elements.append(Paragraph(
        "The architecture utilizes a dual-processor distributed topology: an <b>STM32F103C8T6 (ARM Cortex-M3 @ 72MHz)</b> executing bare-metal CMSIS firmware at 10Hz non-blocking multi-sensor sampling, feeding formatted JSON packets over full-duplex UART (115200 baud) to a dedicated <b>ESP8266 NodeMCU V3</b> wireless gateway. The NodeMCU concurrently streams telemetry over local HTTP/WebSocket (<20ms latency) and publishes 15s cloud records to ThingSpeak.",
        body_style
    ))
    elements.append(Spacer(1, 8))

    # --- Section 2: Full Interconnect Table ---
    elements.append(Paragraph("2. Master Pin-by-Pin Hardware Connection Table", h1_style))
    
    conn_data = [
        [
            Paragraph("<b>SENSOR / MODULE</b>", cell_bold),
            Paragraph("<b>MODULE PIN</b>", cell_bold),
            Paragraph("<b>MICROCONTROLLER PIN</b>", cell_bold),
            Paragraph("<b>SIGNAL / BUS</b>", cell_bold),
            Paragraph("<b>ENGINEERING SPECIFICATION & NOTES</b>", cell_bold)
        ],
        # HC-SR04
        [
            Paragraph("<b>HC-SR04</b><br/><font color='#64748b'>Ultrasonic Level</font>", cell_style),
            Paragraph("VCC<br/>GND<br/>Trig<br/>Echo", cell_style),
            Paragraph("<font color='#b91c1c'><b>5V Pin</b></font><br/>GND<br/><font color='#0284c7'><b>PA1</b></font><br/><font color='#0284c7'><b>PA2 (Divider)</b></font>", cell_style),
            Paragraph("Power<br/>Ground<br/>GPIO Out<br/>GPIO In", cell_style),
            Paragraph("VCC MUST connect to 5V (transducers fail below 4.5V). <b>Echo requires 1k/2k divider</b> to step 5V down to 3.33V.", cell_style)
        ],
        # MQ-2
        [
            Paragraph("<b>MQ-2 Sensor</b><br/><font color='#64748b'>Methane/Gas</font>", cell_style),
            Paragraph("VCC<br/>GND<br/>A0 (Analog)", cell_style),
            Paragraph("<font color='#b91c1c'><b>5V Pin</b></font><br/>GND<br/><font color='#0284c7'><b>PA0 (ADC1_IN0)</b></font>", cell_style),
            Paragraph("Power<br/>Ground<br/>Analog In", cell_style),
            Paragraph("Heater requires 5V 150mA. Output is 0-3.3V safe analog read by STM32 12-bit ADC (0 - 4095 counts).", cell_style)
        ],
        # MPU-6050
        [
            Paragraph("<b>MPU-6050</b><br/><font color='#64748b'>3-Axis Tilt IMU</font>", cell_style),
            Paragraph("VCC<br/>GND<br/>SCL<br/>SDA<br/>AD0", cell_style),
            Paragraph("<font color='#b45309'><b>3.3V Pin</b></font><br/>GND<br/><font color='#0284c7'><b>PB8</b></font><br/><font color='#0284c7'><b>PB9</b></font><br/>GND", cell_style),
            Paragraph("Power<br/>Ground<br/>I2C SCL<br/>I2C SDA<br/>Address", cell_style),
            Paragraph("Shared I2C bus with 16x2 LCD. <b>AD0 tied to GND locks I2C address to 0x68</b>. Measures cover tilt 0° to 90°.", cell_style)
        ],
        # 16x2 LCD
        [
            Paragraph("<b>16x2 I2C LCD</b><br/><font color='#64748b'>PCF8574 Backpack</font>", cell_style),
            Paragraph("VCC<br/>GND<br/>SCL<br/>SDA", cell_style),
            Paragraph("<font color='#b91c1c'><b>5V Pin</b></font><br/>GND<br/><font color='#0284c7'><b>PB8</b></font><br/><font color='#0284c7'><b>PB9</b></font>", cell_style),
            Paragraph("Power<br/>Ground<br/>I2C SCL<br/>I2C SDA", cell_style),
            Paragraph("5V provides crisp contrast and bright LED backlight. I2C address is 0x27. Simultaneous 5-parameter display.", cell_style)
        ],
        # DS18B20
        [
            Paragraph("<b>DS18B20</b><br/><font color='#64748b'>Temp Probe</font>", cell_style),
            Paragraph("VCC (Red)<br/>GND (Black)<br/>Data (Yellow)", cell_style),
            Paragraph("<font color='#b45309'><b>3.3V Pin</b></font><br/>GND<br/><font color='#0284c7'><b>PB12</b></font>", cell_style),
            Paragraph("Power<br/>Ground<br/>1-Wire Bus", cell_style),
            Paragraph("<b>4.7kΩ pull-up resistor between Data and 3.3V is MANDATORY</b>. Non-blocking asynchronous conversion at 10Hz.", cell_style)
        ],
        # Reed Switch
        [
            Paragraph("<b>Reed Switch</b><br/><font color='#64748b'>Tamper / Anti-Theft</font>", cell_style),
            Paragraph("Terminal 1<br/>Terminal 2", cell_style),
            Paragraph("<font color='#0284c7'><b>PB13</b></font><br/>GND", cell_style),
            Paragraph("GPIO In<br/>Ground", cell_style),
            Paragraph("Configured with internal hardware PULL-UP on PB13. Magnet closed: PB13=0 (SEAL). Magnet removed: PB13=1 (OPEN).", cell_style)
        ],
        # Buzzer
        [
            Paragraph("<b>Active Buzzer</b><br/><font color='#64748b'>Acoustic Alarm</font>", cell_style),
            Paragraph("Positive (+)<br/>Negative (-)", cell_style),
            Paragraph("<font color='#0284c7'><b>PB0</b></font><br/>GND", cell_style),
            Paragraph("GPIO Out<br/>Ground", cell_style),
            Paragraph("Driven HIGH by STM32 when gas > 2200 ADC or cover is OPEN/TILTED > 15°.", cell_style)
        ],
        # UART Link
        [
            Paragraph("<b>STM32 ↔ ESP</b><br/><font color='#0369a1'>Gateway Bridge</font>", cell_style),
            Paragraph("PA9 (USART1 TX)<br/>GND (STM32)", cell_style),
            Paragraph("<font color='#0284c7'><b>Pin D7 (GPIO13 RX)</b></font><br/>GND (NodeMCU)", cell_style),
            Paragraph("UART Link<br/>Common GND", cell_style),
            Paragraph("<b>Common Ground is mandatory</b>. Full JSON telemetry streamed at 115200 baud every 100ms.", cell_style)
        ]
    ]

    t_conn = Table(conn_data, colWidths=[90, 75, 115, 65, 175])
    t_conn.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    elements.append(t_conn)

    # PAGE BREAK
    elements.append(PageBreak())

    # --- Section 3: Level Shifter Diagram & Math ---
    elements.append(Paragraph("3. Ultrasonic Echo 5V-to-3.3V Voltage Divider Protection", h1_style))
    elements.append(Paragraph(
        "<b>CRITICAL ELECTRICAL NOTICE:</b> The HC-SR04 operates at 5.0V, outputting a 5.0V TTL pulse on its Echo pin. STM32 pin <b>PA2 is an analog-capable ADC pin and is NOT 5V tolerant (Vdd + 0.3V = 3.6V max)</b>. Directly connecting 5V Echo will destroy pin PA2. A two-resistor voltage divider is required:",
        body_style
    ))
    elements.append(Spacer(1, 6))

    div_table_data = [
        [
            Paragraph("<b>CIRCUIT SCHEMATIC TOPOLOGY</b>", cell_bold),
            Paragraph("<b>MATHEMATICAL DERIVATION</b>", cell_bold)
        ],
        [
            Paragraph(
                "<code>[HC-SR04 ECHO (5V)] ──[ R1 = 1 kΩ ]──┬──[ STM32 PA2 Input ]<br/>"
                "                                      │<br/>"
                "                                 [ R2 = 2 kΩ ]<br/>"
                "                                      │<br/>"
                "                                    [ GND ]</code>",
                cell_code
            ),
            Paragraph(
                "<b>Formula:</b> Vout = Vin × [ R2 / (R1 + R2) ]<br/>"
                "<b>Calculation:</b> Vout = 5.0V × [ 2000Ω / (1000Ω + 2000Ω) ]<br/>"
                "<b>Result:</b> Vout = 5.0V × 0.6667 = <b>3.333 V (100% Safe for STM32 PA2)</b>",
                cell_style
            )
        ]
    ]
    t_div = Table(div_table_data, colWidths=[260, 260])
    t_div.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_div)
    elements.append(Spacer(1, 10))

    # --- Section 4: 16x2 LCD Real-Time Screen Mapping ---
    elements.append(Paragraph("4. Physical 16x2 Character LCD Live Screen Interface", h1_style))
    elements.append(Paragraph(
        "All 5 telemetry parameters are rendered simultaneously in real time without flickering or page switching:",
        body_style
    ))
    elements.append(Spacer(1, 6))

    lcd_preview_data = [
        [Paragraph("<font color='#ffffff' face='Courier'><b>Row 1: [ D: 25cm   G:790 ]</b>  (Distance D + Gas ADC G)</font>", cell_style)],
        [Paragraph("<font color='#ffffff' face='Courier'><b>Row 2: [ T:28C TL: 0 SEAL ]</b>  (Temperature T + Tilt Angle TL + Seal/Open)</font>", cell_style)]
    ]
    t_lcd = Table(lcd_preview_data, colWidths=[520])
    t_lcd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0369a1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#0284c7'))
    ]))
    elements.append(t_lcd)
    elements.append(Spacer(1, 8))

    lcd_desc_data = [
        [Paragraph("<b>LCD FIELD</b>", cell_bold), Paragraph("<b>PARAMETER</b>", cell_bold), Paragraph("<b>NORMAL STATE</b>", cell_bold), Paragraph("<b>CRITICAL / ALARM TRIGGER</b>", cell_bold)],
        [Paragraph("<b>D: [X]cm</b>", cell_code), Paragraph("Ultrasonic Air Gap to Water", cell_style), Paragraph("50cm down to 10cm", cell_style), Paragraph("< 5cm (Chamber Flood / Surcharge Alarm)", cell_style)],
        [Paragraph("<b>G: [X]</b>", cell_code), Paragraph("MQ-2 Combustible Gas ADC", cell_style), Paragraph("400 - 900 ADC", cell_style), Paragraph("> 2200 ADC (Methane / Sewer Explosive Risk)", cell_style)],
        [Paragraph("<b>T: [X]C</b>", cell_code), Paragraph("Sub-surface Temperature", cell_style), Paragraph("20°C - 35°C", cell_style), Paragraph("> 60°C (Underground Cable / Duct Fire)", cell_style)],
        [Paragraph("<b>TL: [X]</b>", cell_code), Paragraph("MPU6050 Live Tilt Angle", cell_style), Paragraph("0° - 4° (Flat on road)", cell_style), Paragraph("> 15° (Cover Displaced / Traffic Hazard)", cell_style)],
        [Paragraph("<b>SEAL / OPEN</b>", cell_code), Paragraph("Cover Security Status", cell_style), Paragraph("SEAL (Magnet attached)", cell_style), Paragraph("OPEN (Physical Tamper / Cover Removed)", cell_style)],
    ]
    t_lcd_desc = Table(lcd_desc_data, colWidths=[90, 140, 130, 160])
    t_lcd_desc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_lcd_desc)
    elements.append(Spacer(1, 10))

    # --- Section 5: Checkout Protocol ---
    elements.append(Paragraph("5. Step-by-Step Bench Checkout Protocol", h1_style))
    steps = [
        "<b>1. Common Ground Rail:</b> Verify with multimeter continuity that STM32 GND and NodeMCU GND are tied together.",
        "<b>2. I2C Diagnostic Splash:</b> On power-up, LCD displays <code>MPU OK (0x68)</code> for 1.5 seconds. If <code>NO MPU SENSOR!</code> appears, verify AD0 is connected to GND.",
        "<b>3. Live Tilt Verification:</b> In normal flat position, LCD displays <code>TL: 0</code>. Tilt the breadboard by 30° to 45°: LCD immediately updates to <code>TL:35 OPEN</code> and buzzer sounds.",
        "<b>4. Ultrasonic Distance Range:</b> Place hand 15cm from HC-SR04: LCD displays <code>D: 15cm</code>. Remove hand: distance smoothly tracks to wall/ceiling without clamping to 0.",
        "<b>5. ThingSpeak & 3D Twin:</b> Telemetry uploads every 15s to ThingSpeak Cloud. Open <code>https://pvkkr.github.io/smart-manhole-twin/</code>: water volume and 3D cover mirror physical sensor positions."
    ]
    for s in steps:
        elements.append(Paragraph(s, body_style))
        elements.append(Spacer(1, 3))

    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=6))
    
    # Footer
    footer_data = [
        [
            Paragraph("<font size=8 color='#64748b'>Smart Manhole Cover Monitoring for Utilities • Group P077</font>", cell_style),
            Paragraph("<font size=8 color='#64748b'>Certified Engineering Specification • Page 2 of 2</font>", ParagraphStyle('FR', alignment=TA_RIGHT))
        ]
    ]
    t_foot = Table(footer_data, colWidths=[260, 260])
    t_foot.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(t_foot)

    doc.build(elements)
    print(f"Successfully generated: {pdf_path}")

if __name__ == "__main__":
    build_pdf()
