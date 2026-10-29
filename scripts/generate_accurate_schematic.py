import os
import sys
import tempfile
import matplotlib
os.environ['MPLCONFIGDIR'] = tempfile.gettempdir()
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.path import Path

def draw_cad_schematic(output_filename='poster_cad_circuit_uniform.png'):
    # Exact 1.25 : 1 ratio matching poster_chamber_3d_model.png (6.5 x 5.2 inches at 300 DPI = 1950 x 1560)
    fig, ax = plt.subplots(figsize=(6.5, 5.2), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    
    # Coordinate system: 0 to 130 in X, 0 to 104 in Y
    ax.set_xlim(0, 130)
    ax.set_ylim(0, 104)
    ax.axis('off')

    # =========================================================================
    # 1. PROFESSIONAL CAD ENGINEERING BORDER & GRID ZONES
    # =========================================================================
    # Outer Border
    ax.add_patch(patches.Rectangle((1, 1), 128, 102, linewidth=1.4, edgecolor='#0f172a', facecolor='none', zorder=10))
    # Inner Border
    ax.add_patch(patches.Rectangle((2.2, 2.2), 125.6, 99.6, linewidth=0.6, edgecolor='#475569', facecolor='none', zorder=10))
    
    # Grid Zone Markers (1-6 horizontal, A-D vertical)
    for i, x in enumerate([23, 44, 65, 86, 107]):
        ax.plot([x, x], [1, 2.2], color='#0f172a', lw=0.6, zorder=10)
        ax.plot([x, x], [101.8, 103], color='#0f172a', lw=0.6, zorder=10)
        ax.text(x - 10, 1.5, str(i + 1), fontsize=4, ha='center', va='center', fontweight='bold', color='#475569')
    ax.text(117, 1.5, "6", fontsize=4, ha='center', va='center', fontweight='bold', color='#475569')

    for j, y in enumerate([27, 52, 77]):
        ax.plot([1, 2.2], [y, y], color='#0f172a', lw=0.6, zorder=10)
        ax.plot([126.8, 128], [y, y], color='#0f172a', lw=0.6, zorder=10)
        ax.text(1.6, y - 12, chr(65 + j), fontsize=4, ha='center', va='center', fontweight='bold', color='#475569')
    ax.text(1.6, 90, "D", fontsize=4, ha='center', va='center', fontweight='bold', color='#475569')

    # Background subtle CAD grid dots
    for gx in range(5, 126, 4):
        for gy in range(5, 101, 4):
            ax.plot(gx, gy, '.', color='#f1f5f9', markersize=1.2, zorder=0)

    # =========================================================================
    # 2. HELPER FUNCTIONS FOR ELECTRICAL SYMBOLS
    # =========================================================================
    def draw_junction(x, y, col='#0f172a', r=0.7):
        ax.add_patch(patches.Circle((x, y), r, facecolor=col, edgecolor=col, zorder=8))

    def draw_gnd_symbol(x, y):
        ax.plot([x, x], [y, y - 1.5], color='#334155', lw=0.9, zorder=6)
        ax.plot([x - 1.6, x + 1.6], [y - 1.5, y - 1.5], color='#334155', lw=1.1, zorder=6)
        ax.plot([x - 1.0, x + 1.0], [y - 2.2, y - 2.2], color='#334155', lw=0.9, zorder=6)
        ax.plot([x - 0.4, x + 0.4], [y - 2.9, y - 2.9], color='#334155', lw=0.7, zorder=6)

    def draw_vcc_arrow(x, y, label='+5V', col='#ef4444'):
        ax.plot([x, x], [y, y + 1.8], color=col, lw=0.9, zorder=6)
        ax.plot([x - 1.2, x, x + 1.2], [y + 1.4, y + 2.5, y + 1.4], color=col, lw=1.1, zorder=6)
        ax.text(x, y + 3.2, label, fontsize=4.2, fontweight='bold', ha='center', va='bottom', color=col, zorder=6)

    def draw_resistor(x, y, w, h, label, val, orientation='H', col='#0f172a'):
        # Professional standard rectangular schematic resistor
        if orientation == 'H':
            ax.add_patch(patches.Rectangle((x, y - h/2), w, h, facecolor='#ffffff', edgecolor=col, lw=0.9, zorder=6))
            ax.text(x + w/2, y + h/2 + 0.8, label, fontsize=4, fontweight='bold', ha='center', color=col, zorder=7)
            ax.text(x + w/2, y - h/2 - 0.8, val, fontsize=3.8, ha='center', va='top', color='#64748b', zorder=7)
        else: # Vertical
            ax.add_patch(patches.Rectangle((x - w/2, y), w, h, facecolor='#ffffff', edgecolor=col, lw=0.9, zorder=6))
            ax.text(x + w/2 + 0.8, y + h/2, f"{label} ({val})", fontsize=3.8, fontweight='bold', ha='left', va='center', color=col, zorder=7)

    # =========================================================================
    # 3. POWER RAILS (TOP 5V & 3.3V, BOTTOM COMMON GND)
    # =========================================================================
    # 5V Rail
    ax.plot([4, 126], [98.5, 98.5], color='#ef4444', lw=1.4, zorder=4)
    ax.add_patch(patches.FancyBboxPatch((4, 97.2), 14, 2.6, boxstyle='round,pad=0.2', facecolor='#ef4444', edgecolor='none', zorder=5))
    ax.text(11, 98.5, '+5V DC BUS (HEATER & 5V MODULES)', fontsize=3.8, fontweight='bold', color='#ffffff', ha='center', va='center', zorder=6)

    # 3.3V Rail
    ax.plot([4, 126], [95.0, 95.0], color='#f59e0b', lw=1.3, zorder=4)
    ax.add_patch(patches.FancyBboxPatch((4, 93.7), 14, 2.6, boxstyle='round,pad=0.2', facecolor='#f59e0b', edgecolor='none', zorder=5))
    ax.text(11, 95.0, '+3.3V DC BUS (MCU & SENSORS)', fontsize=3.8, fontweight='bold', color='#ffffff', ha='center', va='center', zorder=6)

    # Common Ground Rail
    ax.plot([4, 126], [5.5, 5.5], color='#334155', lw=1.6, zorder=4)
    ax.add_patch(patches.FancyBboxPatch((4, 4.2), 15, 2.6, boxstyle='round,pad=0.2', facecolor='#334155', edgecolor='none', zorder=5))
    ax.text(11.5, 5.5, 'COMMON GND RAIL (STAR PLANE)', fontsize=3.8, fontweight='bold', color='#ffffff', ha='center', va='center', zorder=6)

    # Ground decoupling capacitors representation
    ax.plot([25, 25], [98.5, 96.5], color='#ef4444', lw=0.8, zorder=4)
    draw_junction(25, 98.5, '#ef4444')
    ax.add_patch(patches.Rectangle((24.2, 96.5), 1.6, 1.2, facecolor='#ffffff', edgecolor='#0f172a', lw=0.7, zorder=5))
    ax.text(26.2, 97.1, 'C1 100uF', fontsize=3.2, color='#64748b', va='center')

    # =========================================================================
    # 4. CENTRAL COMPONENT: STM32F103C8T6 BLUE PILL (MAIN MCU)
    # =========================================================================
    mcu_x, mcu_y, mcu_w, mcu_h = 51, 14, 28, 76
    # Outer Blue Pill PCB outline
    ax.add_patch(patches.FancyBboxPatch((mcu_x, mcu_y), mcu_w, mcu_h, boxstyle='round,pad=0.4,rounding_size=1.2',
                                         facecolor='#092c63', edgecolor='#0284c7', lw=1.4, zorder=3))
    # IC Chip Body inside Blue Pill
    ax.add_patch(patches.Rectangle((mcu_x + 4, mcu_y + 14), 20, 48, facecolor='#0f172a', edgecolor='#38bdf8', lw=0.8, zorder=4))
    # IC Orientation Notch
    ax.add_patch(patches.Arc((mcu_x + 14, mcu_y + 62), 3, 2, angle=0, theta1=180, theta2=360, color='#38bdf8', lw=0.9, zorder=5))
    
    # MCU Markings
    ax.text(mcu_x + 14, mcu_y + 71, "STM32F103C8T6", fontsize=5.8, fontweight='bold', color='#38bdf8', ha='center', va='center', zorder=5)
    ax.text(mcu_x + 14, mcu_y + 68, "BLUE PILL • ARM CORTEX-M3 @ 72MHz", fontsize=3.5, fontweight='bold', color='#e2e8f0', ha='center', va='center', zorder=5)
    ax.text(mcu_x + 14, mcu_y + 38, "STM32F103\n32-BIT RISC\n64KB FLASH\n20KB SRAM", fontsize=4.2, fontweight='bold', color='#64748b', ha='center', va='center', multialignment='center', zorder=5)
    ax.text(mcu_x + 14, mcu_y + 10, "BARE-METAL FIRMWARE ENGINE", fontsize=3.4, fontweight='bold', color='#93c5fd', ha='center', va='center', zorder=5)

    # Pin drawing helper for MCU
    def draw_mcu_pin(y_pos, pin_name, func_name, side='L', col='#38bdf8'):
        if side == 'L':
            px = mcu_x
            ax.plot([px - 2.5, px], [y_pos, y_pos], color='#64748b', lw=0.9, zorder=4)
            # Pin terminal pad
            ax.add_patch(patches.Circle((px - 2.5, y_pos), 0.5, facecolor='#ffffff', edgecolor='#0f172a', lw=0.7, zorder=5))
            ax.text(px + 0.8, y_pos, pin_name, fontsize=3.6, fontweight='bold', color='#ffffff', ha='left', va='center', zorder=5)
            ax.text(px - 3.2, y_pos, func_name, fontsize=3.4, fontweight='bold', color=col, ha='right', va='center', zorder=5)
            return (px - 2.5, y_pos)
        else:
            px = mcu_x + mcu_w
            ax.plot([px, px + 2.5], [y_pos, y_pos], color='#64748b', lw=0.9, zorder=4)
            ax.add_patch(patches.Circle((px + 2.5, y_pos), 0.5, facecolor='#ffffff', edgecolor='#0f172a', lw=0.7, zorder=5))
            ax.text(px - 0.8, y_pos, pin_name, fontsize=3.6, fontweight='bold', color='#ffffff', ha='right', va='center', zorder=5)
            ax.text(px + 3.2, y_pos, func_name, fontsize=3.4, fontweight='bold', color=col, ha='left', va='center', zorder=5)
            return (px + 2.5, y_pos)

    # MCU Left Pins
    pin_pa1  = draw_mcu_pin(mcu_y + 64, "PA1",  "TRIG_OUT",    'L', '#0284c7')
    pin_pa2  = draw_mcu_pin(mcu_y + 55, "PA2",  "ECHO_IN (3.3V)", 'L', '#7c3aed')
    pin_pa0  = draw_mcu_pin(mcu_y + 44, "PA0",  "ADC_GAS_IN",  'L', '#10b981')
    pin_pb12 = draw_mcu_pin(mcu_y + 33, "PB12", "1-WIRE_DATA", 'L', '#ec4899')
    pin_pb13 = draw_mcu_pin(mcu_y + 22, "PB13", "REED_IN (PU)",'L', '#eab308')

    # MCU Right Pins
    pin_pa9  = draw_mcu_pin(mcu_y + 64, "PA9",  "USART1_TX",   'R', '#2563eb')
    pin_pa10 = draw_mcu_pin(mcu_y + 57, "PA10", "USART1_RX",   'R', '#6366f1')
    pin_pb8  = draw_mcu_pin(mcu_y + 47, "PB8",  "I2C1_SCL",    'R', '#0284c7')
    pin_pb9  = draw_mcu_pin(mcu_y + 40, "PB9",  "I2C1_SDA",    'R', '#0d9488')
    pin_pb0  = draw_mcu_pin(mcu_y + 30, "PB0",  "BUZZER_GATE", 'R', '#dc2626')
    pin_3v3  = draw_mcu_pin(mcu_y + 22, "3V3",  "+3.3V VDD",   'R', '#f59e0b')
    pin_gnd  = draw_mcu_pin(mcu_y + 16, "GND",  "COMMON GND",  'R', '#334155')

    # Connect MCU Power to Rails
    ax.plot([pin_3v3[0], pin_3v3[0] + 4, pin_3v3[0] + 4], [pin_3v3[1], pin_3v3[1], 95.0], color='#f59e0b', lw=0.9, zorder=3)
    draw_junction(pin_3v3[0] + 4, 95.0, '#f59e0b')
    
    ax.plot([pin_gnd[0], pin_gnd[0] + 2, pin_gnd[0] + 2], [pin_gnd[1], pin_gnd[1], 5.5], color='#334155', lw=1.0, zorder=3)
    draw_junction(pin_gnd[0] + 2, 5.5, '#334155')

    # =========================================================================
    # 5. LEFT COLUMN: SENSOR MODULES
    # =========================================================================

    # ---------------- 5A. HC-SR04 ULTRASONIC RANGING SENSOR -----------------
    us_x, us_y, us_w, us_h = 5, 72, 24, 18
    ax.add_patch(patches.FancyBboxPatch((us_x, us_y), us_w, us_h, boxstyle='round,pad=0.2', facecolor='#f8fafc', edgecolor='#0284c7', lw=1.1, zorder=3))
    ax.text(us_x + us_w/2, us_y + us_h - 2.5, "HC-SR04 ULTRASONIC", fontsize=4.6, fontweight='bold', color='#0284c7', ha='center', zorder=4)
    ax.text(us_x + us_w/2, us_y + us_h - 4.8, "Sub-Surface Depth (2cm - 400cm)", fontsize=3.4, color='#64748b', ha='center', zorder=4)
    
    # Transducer cylinders
    ax.add_patch(patches.Circle((us_x + 6, us_y + 6.5), 3.4, facecolor='#e2e8f0', edgecolor='#0284c7', lw=0.9, zorder=4))
    ax.text(us_x + 6, us_y + 6.5, "T\n40kHz", fontsize=3.0, ha='center', va='center', color='#0f172a', zorder=5)
    ax.add_patch(patches.Circle((us_x + 18, us_y + 6.5), 3.4, facecolor='#e2e8f0', edgecolor='#0284c7', lw=0.9, zorder=4))
    ax.text(us_x + 18, us_y + 6.5, "R\nECHO", fontsize=3.0, ha='center', va='center', color='#0f172a', zorder=5)

    # HC-SR04 Pins on Right edge of module
    p_us_vcc  = (us_x + us_w, us_y + 15)
    p_us_trig = (us_x + us_w, us_y + 11.5)
    p_us_echo = (us_x + us_w, us_y + 8)
    p_us_gnd  = (us_x + us_w, us_y + 4.5)

    ax.text(p_us_vcc[0] - 1,  p_us_vcc[1],  "VCC (+5V)", fontsize=3.2, ha='right', va='center', color='#ef4444', zorder=4)
    ax.text(p_us_trig[0] - 1, p_us_trig[1], "TRIG",      fontsize=3.2, ha='right', va='center', color='#0284c7', zorder=4)
    ax.text(p_us_echo[0] - 1, p_us_echo[1], "ECHO (5V)", fontsize=3.2, ha='right', va='center', color='#7c3aed', zorder=4)
    ax.text(p_us_gnd[0] - 1,  p_us_gnd[1],  "GND",       fontsize=3.2, ha='right', va='center', color='#334155', zorder=4)

    # Connect VCC to 5V rail
    ax.plot([p_us_vcc[0], p_us_vcc[0] + 1.5, p_us_vcc[0] + 1.5], [p_us_vcc[1], p_us_vcc[1], 98.5], color='#ef4444', lw=0.9, zorder=2)
    draw_junction(p_us_vcc[0] + 1.5, 98.5, '#ef4444')

    # Connect TRIG to STM32 PA1
    ax.plot([p_us_trig[0], pin_pa1[0]], [p_us_trig[1], pin_pa1[1]], color='#0284c7', lw=1.1, zorder=2)
    ax.text((p_us_trig[0] + pin_pa1[0])/2, p_us_trig[1] + 0.8, "10us PULSE", fontsize=3.2, color='#0284c7', ha='center', zorder=3)

    # ---------------- 5B. ACCURATE 1k/2k VOLTAGE DIVIDER SCHEMATIC -----------------
    div_x = 34
    # ECHO (5V) goes into R1 (1k resistor)
    ax.plot([p_us_echo[0], div_x], [p_us_echo[1], p_us_echo[1]], color='#7c3aed', lw=1.0, zorder=2)
    draw_resistor(div_x, p_us_echo[1], 4.5, 2.0, "R1", "1kΩ 1%", 'H', '#7c3aed')
    
    # Tap node after R1
    tap_x = div_x + 4.5
    draw_junction(tap_x, p_us_echo[1], '#7c3aed')
    
    # Route tap to STM32 PA2 (3.3V safe)
    ax.plot([tap_x, pin_pa2[0]], [p_us_echo[1], pin_pa2[1]], color='#7c3aed', lw=1.1, zorder=2)
    ax.text((tap_x + pin_pa2[0])/2, pin_pa2[1] + 1.0, "3.33V SAFE ECHO", fontsize=3.4, fontweight='bold', color='#7c3aed', ha='center', zorder=3)
    
    # R2 (2k resistor) drops down to GND
    ax.plot([tap_x, tap_x], [p_us_echo[1], p_us_echo[1] - 3.5], color='#7c3aed', lw=0.9, zorder=2)
    draw_resistor(tap_x, p_us_echo[1] - 8.5, 2.0, 5.0, "R2", "2kΩ", 'V', '#7c3aed')
    ax.plot([tap_x, tap_x], [p_us_echo[1] - 8.5, p_us_echo[1] - 11], color='#334155', lw=0.9, zorder=2)
    draw_gnd_symbol(tap_x, p_us_echo[1] - 11)
    
    # Text box for divider calculation
    ax.text(tap_x + 2.5, p_us_echo[1] - 6.5, "Vout = 5V * [2k / (1k + 2k)]\n     = 3.33V (Protects PA2)", fontsize=3.2, fontweight='bold', color='#475569', zorder=3)

    # HC-SR04 GND to GND rail
    ax.plot([p_us_gnd[0], p_us_gnd[0] + 0.8, p_us_gnd[0] + 0.8], [p_us_gnd[1], p_us_gnd[1], 5.5], color='#334155', lw=0.9, zorder=2)
    draw_junction(p_us_gnd[0] + 0.8, 5.5, '#334155')

    # ---------------- 5C. MQ-2 TOXIC GAS / SEWER GAS SENSOR -----------------
    mq_x, mq_y, mq_w, mq_h = 5, 48, 24, 18
    ax.add_patch(patches.FancyBboxPatch((mq_x, mq_y), mq_w, mq_h, boxstyle='round,pad=0.2', facecolor='#f8fafc', edgecolor='#10b981', lw=1.1, zorder=3))
    ax.text(mq_x + mq_w/2, mq_y + mq_h - 2.5, "MQ-2 GAS SENSOR", fontsize=4.6, fontweight='bold', color='#047857', ha='center', zorder=4)
    ax.text(mq_x + mq_w/2, mq_y + mq_h - 4.8, "Methane / H2S / Combustibles", fontsize=3.4, color='#64748b', ha='center', zorder=4)
    
    # Heating coil and sensing element schematic symbol
    ax.add_patch(patches.Circle((mq_x + 6, mq_y + 6.5), 3.2, facecolor='#ecfdf5', edgecolor='#10b981', lw=0.9, zorder=4))
    ax.text(mq_x + 6, mq_y + 6.5, "SnO2\nCOIL", fontsize=3.0, ha='center', va='center', color='#047857', zorder=5)
    
    p_mq_vcc = (mq_x + mq_w, mq_y + 14.5)
    p_mq_gnd = (mq_x + mq_w, mq_y + 10.5)
    p_mq_ao  = (mq_x + mq_w, mq_y + 6.5)
    p_mq_do  = (mq_x + mq_w, mq_y + 2.5)

    ax.text(p_mq_vcc[0] - 1, p_mq_vcc[1], "VCC (+5V HEATER)", fontsize=3.2, ha='right', va='center', color='#ef4444', zorder=4)
    ax.text(p_mq_gnd[0] - 1, p_mq_gnd[1], "GND",              fontsize=3.2, ha='right', va='center', color='#334155', zorder=4)
    ax.text(p_mq_ao[0] - 1,  p_mq_ao[1],  "AOUT (0-3.3V)",    fontsize=3.2, ha='right', va='center', color='#10b981', zorder=4)
    ax.text(p_mq_do[0] - 1,  p_mq_do[1],  "DOUT (N/C)",       fontsize=3.0, ha='right', va='center', color='#94a3b8', zorder=4)

    # Route VCC to 5V bus
    ax.plot([p_mq_vcc[0], p_mq_vcc[0] + 2.2, p_mq_vcc[0] + 2.2], [p_mq_vcc[1], p_mq_vcc[1], 98.5], color='#ef4444', lw=0.9, zorder=2)
    draw_junction(p_mq_vcc[0] + 2.2, 98.5, '#ef4444')

    # Route GND to GND bus
    ax.plot([p_mq_gnd[0], p_mq_gnd[0] + 1.2, p_mq_gnd[0] + 1.2], [p_mq_gnd[1], p_mq_gnd[1], 5.5], color='#334155', lw=0.9, zorder=2)
    draw_junction(p_mq_gnd[0] + 1.2, 5.5, '#334155')

    # Route AOUT directly to STM32 PA0 (12-bit ADC Input)
    ax.plot([p_mq_ao[0], pin_pa0[0]], [p_mq_ao[1], pin_pa0[1]], color='#10b981', lw=1.1, zorder=2)
    ax.text((p_mq_ao[0] + pin_pa0[0])/2, pin_pa0[1] + 1.0, "ANALOG PPM SIGNAL", fontsize=3.4, fontweight='bold', color='#10b981', ha='center', zorder=3)

    # ---------------- 5D. DS18B20 1-WIRE TEMPERATURE SENSOR -----------------
    temp_x, temp_y, temp_w, temp_h = 5, 26, 24, 17
    ax.add_patch(patches.FancyBboxPatch((temp_x, temp_y), temp_w, temp_h, boxstyle='round,pad=0.2', facecolor='#f8fafc', edgecolor='#ec4899', lw=1.1, zorder=3))
    ax.text(temp_x + temp_w/2, temp_y + temp_h - 2.5, "DS18B20 TEMPERATURE", fontsize=4.6, fontweight='bold', color='#be185d', ha='center', zorder=4)
    ax.text(temp_x + temp_w/2, temp_y + temp_h - 4.8, "Waterproof Probe (-55°C to +125°C)", fontsize=3.4, color='#64748b', ha='center', zorder=4)
    
    # Stainless probe capsule symbol
    ax.add_patch(patches.Rectangle((temp_x + 3, temp_y + 4), 6, 4, facecolor='#cbd5e1', edgecolor='#475569', lw=0.8, zorder=4))
    ax.text(temp_x + 6, temp_y + 6, "1-WIRE", fontsize=3.0, ha='center', va='center', color='#0f172a', zorder=5)

    p_temp_vdd  = (temp_x + temp_w, temp_y + 13)
    p_temp_data = (temp_x + temp_w, temp_y + 8.5)
    p_temp_gnd  = (temp_x + temp_w, temp_y + 4)

    ax.text(p_temp_vdd[0] - 1,  p_temp_vdd[1],  "VDD (+3.3V)", fontsize=3.2, ha='right', va='center', color='#f59e0b', zorder=4)
    ax.text(p_temp_data[0] - 1, p_temp_data[1], "DATA (DQ)",   fontsize=3.2, ha='right', va='center', color='#ec4899', zorder=4)
    ax.text(p_temp_gnd[0] - 1,  p_temp_gnd[1],  "GND",         fontsize=3.2, ha='right', va='center', color='#334155', zorder=4)

    # Route VDD to 3.3V bus
    ax.plot([p_temp_vdd[0], p_temp_vdd[0] + 1.8, p_temp_vdd[0] + 1.8], [p_temp_vdd[1], p_temp_vdd[1], 95.0], color='#f59e0b', lw=0.9, zorder=2)
    draw_junction(p_temp_vdd[0] + 1.8, 95.0, '#f59e0b')

    # Route GND to GND bus
    ax.plot([p_temp_gnd[0], p_temp_gnd[0] + 1.5, p_temp_gnd[0] + 1.5], [p_temp_gnd[1], p_temp_gnd[1], 5.5], color='#334155', lw=0.9, zorder=2)
    draw_junction(p_temp_gnd[0] + 1.5, 5.5, '#334155')

    # DATA line with mandatory 4.7kΩ Pull-Up Resistor to 3.3V
    r_pu_x = 35
    ax.plot([p_temp_data[0], pin_pb12[0]], [p_temp_data[1], pin_pb12[1]], color='#ec4899', lw=1.1, zorder=2)
    draw_junction(r_pu_x, pin_pb12[1], '#ec4899')
    
    # 4.7k pull-up resistor to 3.3V
    ax.plot([r_pu_x, r_pu_x], [pin_pb12[1], pin_pb12[1] + 3], color='#ec4899', lw=0.9, zorder=2)
    draw_resistor(r_pu_x, pin_pb12[1] + 3, 2.0, 5.0, "R3", "4.7kΩ", 'V', '#ec4899')
    ax.plot([r_pu_x, r_pu_x], [pin_pb12[1] + 8, 95.0], color='#f59e0b', lw=0.9, zorder=2)
    draw_junction(r_pu_x, 95.0, '#f59e0b')
    ax.text(r_pu_x + 1.5, pin_pb12[1] + 10, "1-WIRE BUS PULL-UP", fontsize=3.2, fontweight='bold', color='#ec4899', zorder=3)

    # ---------------- 5E. MAGNETIC REED SWITCH (COVER OPEN / SEAL) -----------
    reed_x, reed_y, reed_w, reed_h = 5, 8, 24, 14
    ax.add_patch(patches.FancyBboxPatch((reed_x, reed_y), reed_w, reed_h, boxstyle='round,pad=0.2', facecolor='#f8fafc', edgecolor='#eab308', lw=1.1, zorder=3))
    ax.text(reed_x + reed_w/2, reed_y + reed_h - 2.5, "MAGNETIC REED SWITCH", fontsize=4.6, fontweight='bold', color='#a16207', ha='center', zorder=4)
    ax.text(reed_x + reed_w/2, reed_y + reed_h - 4.8, "Cover Anti-Theft / Tamper Seal", fontsize=3.4, color='#64748b', ha='center', zorder=4)
    
    # Switch Schematic Symbol
    ax.plot([reed_x + 4, reed_x + 9], [reed_y + 4.5, reed_y + 4.5], color='#0f172a', lw=1.0, zorder=4)
    ax.add_patch(patches.Circle((reed_x + 9, reed_y + 4.5), 0.6, facecolor='#ffffff', edgecolor='#0f172a', lw=0.8, zorder=5))
    ax.plot([reed_x + 9.5, reed_x + 14.5], [reed_y + 4.8, reed_y + 7.5], color='#0f172a', lw=1.1, zorder=4) # Lever
    ax.add_patch(patches.Circle((reed_x + 15, reed_y + 4.5), 0.6, facecolor='#ffffff', edgecolor='#0f172a', lw=0.8, zorder=5))
    ax.plot([reed_x + 15.6, reed_x + 19], [reed_y + 4.5, reed_y + 4.5], color='#0f172a', lw=1.0, zorder=4)
    # Magnet icon
    ax.add_patch(patches.Rectangle((reed_x + 10, reed_y + 8.5), 4, 1.8, facecolor='#dc2626', edgecolor='none', zorder=4))
    ax.text(reed_x + 12, reed_y + 9.4, "MAGNET", fontsize=2.8, color='#ffffff', ha='center', va='center', zorder=5)

    p_rd_sig = (reed_x + reed_w, reed_y + 8)
    p_rd_gnd = (reed_x + reed_w, reed_y + 4)

    ax.text(p_rd_sig[0] - 1, p_rd_sig[1], "PIN A (PB13)", fontsize=3.2, ha='right', va='center', color='#eab308', zorder=4)
    ax.text(p_rd_gnd[0] - 1, p_rd_gnd[1], "PIN B (GND)",  fontsize=3.2, ha='right', va='center', color='#334155', zorder=4)

    # Route PIN A to STM32 PB13 (Internal Pull-Up enabled in firmware)
    ax.plot([p_rd_sig[0], pin_pb13[0]], [p_rd_sig[1], pin_pb13[1]], color='#eab308', lw=1.1, zorder=2)
    ax.text((p_rd_sig[0] + pin_pb13[0])/2, pin_pb13[1] + 1.0, "DIGITAL TAMPER INTERLOCK", fontsize=3.2, fontweight='bold', color='#a16207', ha='center', zorder=3)

    # Route PIN B to GND bus
    ax.plot([p_rd_gnd[0], p_rd_gnd[0] + 1.0, p_rd_gnd[0] + 1.0], [p_rd_gnd[1], p_rd_gnd[1], 5.5], color='#334155', lw=0.9, zorder=2)
    draw_junction(p_rd_gnd[0] + 1.0, 5.5, '#334155')

    # =========================================================================
    # 6. RIGHT COLUMN: WI-FI GATEWAY, I2C BUS & ACTUATORS
    # =========================================================================

    # ---------------- 6A. NODEMCU ESP8266 / ESP32 WI-FI GATEWAY -------------
    esp_x, esp_y, esp_w, esp_h = 96, 70, 29, 21
    ax.add_patch(patches.FancyBboxPatch((esp_x, esp_y), esp_w, esp_h, boxstyle='round,pad=0.3,rounding_size=1.0',
                                         facecolor='#1e293b', edgecolor='#2563eb', lw=1.3, zorder=3))
    # Metal RF shield
    ax.add_patch(patches.Rectangle((esp_x + 13, esp_y + 4), 14, 11, facecolor='#94a3b8', edgecolor='#cbd5e1', lw=0.8, zorder=4))
    ax.text(esp_x + 20, esp_y + 9.5, "ESP8266\nESP-12F\nWi-Fi SoC", fontsize=3.0, fontweight='bold', color='#0f172a', ha='center', va='center', multialignment='center', zorder=5)
    # PCB Antenna meander representation
    ax.plot([esp_x + 24, esp_x + 24, esp_x + 25, esp_x + 25, esp_x + 26, esp_x + 26], 
            [esp_y + 16, esp_y + 19, esp_y + 19, esp_y + 16, esp_y + 16, esp_y + 19], color='#e2e8f0', lw=1.0, zorder=5)

    ax.text(esp_x + 7, esp_y + esp_h - 2.8, "NODEMCU V3", fontsize=5.2, fontweight='bold', color='#38bdf8', ha='center', zorder=5)
    ax.text(esp_x + 7, esp_y + esp_h - 5.0, "Wi-Fi Cloud & LAN Gateway", fontsize=3.2, color='#cbd5e1', ha='center', zorder=5)
    ax.text(esp_x + 20, esp_y + esp_h - 2.8, "ThingSpeak #3558043\nREST /telemetry", fontsize=3.0, fontweight='bold', color='#93c5fd', ha='center', zorder=5)

    p_esp_rx  = (esp_x, esp_y + 15)
    p_esp_tx  = (esp_x, esp_y + 11.5)
    p_esp_vin = (esp_x, esp_y + 7.5)
    p_esp_gnd = (esp_x, esp_y + 3.5)

    ax.text(p_esp_rx[0] + 1,  p_esp_rx[1],  "D7 / GPIO13 (RX)", fontsize=3.2, ha='left', va='center', color='#2563eb', zorder=4)
    ax.text(p_esp_tx[0] + 1,  p_esp_tx[1],  "D8 / GPIO15 (TX)", fontsize=3.2, ha='left', va='center', color='#6366f1', zorder=4)
    ax.text(p_esp_vin[0] + 1, p_esp_vin[1], "VIN (+5V)",        fontsize=3.2, ha='left', va='center', color='#ef4444', zorder=4)
    ax.text(p_esp_gnd[0] + 1, p_esp_gnd[1], "GND (Common)",     fontsize=3.2, ha='left', va='center', color='#334155', zorder=4)

    # Cross-Over UART connections:
    # STM32 PA9 (TX) -> NodeMCU D7 (RX)
    ax.plot([pin_pa9[0], p_esp_rx[0]], [pin_pa9[1], p_esp_rx[1]], color='#2563eb', lw=1.2, zorder=2)
    ax.text((pin_pa9[0] + p_esp_rx[0])/2, pin_pa9[1] + 1.0, "UART TX -> RX (115200 BAUD)", fontsize=3.4, fontweight='bold', color='#2563eb', ha='center', zorder=3)

    # STM32 PA10 (RX) <- NodeMCU D8 (TX)
    ax.plot([pin_pa10[0], p_esp_tx[0]], [pin_pa10[1], p_esp_tx[1]], color='#6366f1', lw=1.1, zorder=2)
    ax.text((pin_pa10[0] + p_esp_tx[0])/2, pin_pa10[1] - 1.2, "UART RX <- TX ACK CH", fontsize=3.2, color='#6366f1', ha='center', zorder=3)

    # NodeMCU VIN to 5V bus
    ax.plot([p_esp_vin[0], p_esp_vin[0] - 1.5, p_esp_vin[0] - 1.5], [p_esp_vin[1], p_esp_vin[1], 98.5], color='#ef4444', lw=0.9, zorder=2)
    draw_junction(p_esp_vin[0] - 1.5, 98.5, '#ef4444')

    # NodeMCU GND to GND bus
    ax.plot([p_esp_gnd[0], p_esp_gnd[0] - 1.0, p_esp_gnd[0] - 1.0], [p_esp_gnd[1], p_esp_gnd[1], 5.5], color='#334155', lw=0.9, zorder=2)
    draw_junction(p_esp_gnd[0] - 1.0, 5.5, '#334155')

    # ---------------- 6B. SHARED I2C BUS (SCL / SDA) ------------------------
    # SCL Bus Trunk from STM32 PB8
    scl_bus_x = 88
    sda_bus_x = 91

    ax.plot([pin_pb8[0], scl_bus_x, scl_bus_x], [pin_pb8[1], pin_pb8[1], 25], color='#0284c7', lw=1.1, zorder=2)
    ax.text(scl_bus_x - 0.5, pin_pb8[1] + 1.0, "I2C1_SCL", fontsize=3.2, fontweight='bold', color='#0284c7', ha='right', zorder=3)

    # SDA Bus Trunk from STM32 PB9
    ax.plot([pin_pb9[0], sda_bus_x, sda_bus_x], [pin_pb9[1], pin_pb9[1], 25], color='#0d9488', lw=1.1, zorder=2)
    ax.text(sda_bus_x + 0.5, pin_pb9[1] + 1.0, "I2C1_SDA", fontsize=3.2, fontweight='bold', color='#0d9488', ha='left', zorder=3)

    # ---------------- 6C. 16x2 ALPHANUMERIC LCD (PCF8574 BACKPACK) ----------
    lcd_x, lcd_y, lcd_w, lcd_h = 96, 48, 29, 18
    ax.add_patch(patches.FancyBboxPatch((lcd_x, lcd_y), lcd_w, lcd_h, boxstyle='round,pad=0.2', facecolor='#14532d', edgecolor='#22c55e', lw=1.1, zorder=3))
    # LCD Glass Screen area
    ax.add_patch(patches.Rectangle((lcd_x + 3, lcd_y + 3), 23, 9, facecolor='#166534', edgecolor='#86efac', lw=0.7, zorder=4))
    ax.text(lcd_x + 14.5, lcd_y + 8.5, "D:15.9 G:651 T:24.0\nTL:34.8  SEAL:OK", fontsize=3.4, fontfamily='monospace', fontweight='bold', color='#bbf7d0', ha='center', va='center', multialignment='center', zorder=5)

    ax.text(lcd_x + lcd_w/2, lcd_y + lcd_h - 2.2, "16x2 LCD + PCF8574 I2C", fontsize=4.4, fontweight='bold', color='#ffffff', ha='center', zorder=4)
    ax.text(lcd_x + lcd_w/2, lcd_y + lcd_h - 4.2, "Address: 0x27 • Field Display", fontsize=3.2, color='#bbf7d0', ha='center', zorder=4)

    p_lcd_scl = (lcd_x, lcd_y + 14.5)
    p_lcd_sda = (lcd_x, lcd_y + 11.5)
    p_lcd_vcc = (lcd_x, lcd_y + 8)
    p_lcd_gnd = (lcd_x, lcd_y + 4.5)

    ax.text(p_lcd_scl[0] + 1, p_lcd_scl[1], "SCL (PB8)", fontsize=3.2, ha='left', va='center', color='#0284c7', zorder=4)
    ax.text(p_lcd_sda[0] + 1, p_lcd_sda[1], "SDA (PB9)", fontsize=3.2, ha='left', va='center', color='#0d9488', zorder=4)
    ax.text(p_lcd_vcc[0] + 1, p_lcd_vcc[1], "VCC (+5V)", fontsize=3.2, ha='left', va='center', color='#ef4444', zorder=4)
    ax.text(p_lcd_gnd[0] + 1, p_lcd_gnd[1], "GND",       fontsize=3.2, ha='left', va='center', color='#334155', zorder=4)

    # Tap LCD SCL and SDA to I2C trunks
    ax.plot([scl_bus_x, p_lcd_scl[0]], [p_lcd_scl[1], p_lcd_scl[1]], color='#0284c7', lw=1.0, zorder=2)
    draw_junction(scl_bus_x, p_lcd_scl[1], '#0284c7')

    ax.plot([sda_bus_x, p_lcd_sda[0]], [p_lcd_sda[1], p_lcd_sda[1]], color='#0d9488', lw=1.0, zorder=2)
    draw_junction(sda_bus_x, p_lcd_sda[1], '#0d9488')

    # LCD VCC to 5V bus
    ax.plot([p_lcd_vcc[0], p_lcd_vcc[0] - 2.0, p_lcd_vcc[0] - 2.0], [p_lcd_vcc[1], p_lcd_vcc[1], 98.5], color='#ef4444', lw=0.9, zorder=2)
    draw_junction(p_lcd_vcc[0] - 2.0, 98.5, '#ef4444')

    # LCD GND to GND bus
    ax.plot([p_lcd_gnd[0], p_lcd_gnd[0] - 1.2, p_lcd_gnd[0] - 1.2], [p_lcd_gnd[1], p_lcd_gnd[1], 5.5], color='#334155', lw=0.9, zorder=2)
    draw_junction(p_lcd_gnd[0] - 1.2, 5.5, '#334155')

    # ---------------- 6D. MPU-6050 6-AXIS IMU (GY-521 BREAKOUT) -------------
    mpu_x, mpu_y, mpu_w, mpu_h = 96, 26, 29, 18
    ax.add_patch(patches.FancyBboxPatch((mpu_x, mpu_y), mpu_w, mpu_h, boxstyle='round,pad=0.2', facecolor='#042f2e', edgecolor='#14b8a6', lw=1.1, zorder=3))
    # QFN Chip package
    ax.add_patch(patches.Rectangle((mpu_x + 14, mpu_y + 4), 10, 8, facecolor='#0f172a', edgecolor='#2dd4bf', lw=0.7, zorder=4))
    ax.text(mpu_x + 19, mpu_y + 8, "MPU6050\n6-DoF IMU", fontsize=3.0, fontweight='bold', color='#2dd4bf', ha='center', va='center', multialignment='center', zorder=5)

    ax.text(mpu_x + mpu_w/2, mpu_y + mpu_h - 2.2, "MPU-6050 (GY-521)", fontsize=4.4, fontweight='bold', color='#2dd4bf', ha='center', zorder=4)
    ax.text(mpu_x + mpu_w/2, mpu_y + mpu_h - 4.2, "Address: 0x68 • Tilt / Shock / Accel", fontsize=3.2, color='#99f6e4', ha='center', zorder=4)

    p_mpu_vcc = (mpu_x, mpu_y + 14.5)
    p_mpu_gnd = (mpu_x, mpu_y + 11.5)
    p_mpu_scl = (mpu_x, mpu_y + 8)
    p_mpu_sda = (mpu_x, mpu_y + 4.5)

    ax.text(p_mpu_vcc[0] + 1, p_mpu_vcc[1], "VCC (+3.3V)",   fontsize=3.2, ha='left', va='center', color='#f59e0b', zorder=4)
    ax.text(p_mpu_gnd[0] + 1, p_mpu_gnd[1], "GND + AD0",     fontsize=3.2, ha='left', va='center', color='#334155', zorder=4)
    ax.text(p_mpu_scl[0] + 1, p_mpu_scl[1], "SCL (PB8)",     fontsize=3.2, ha='left', va='center', color='#0284c7', zorder=4)
    ax.text(p_mpu_sda[0] + 1, p_mpu_sda[1], "SDA (PB9)",     fontsize=3.2, ha='left', va='center', color='#0d9488', zorder=4)

    # Tap MPU6050 SCL and SDA to I2C trunks
    ax.plot([scl_bus_x, p_mpu_scl[0]], [p_mpu_scl[1], p_mpu_scl[1]], color='#0284c7', lw=1.0, zorder=2)
    draw_junction(scl_bus_x, p_mpu_scl[1], '#0284c7')

    ax.plot([sda_bus_x, p_mpu_sda[0]], [p_mpu_sda[1], p_mpu_sda[1]], color='#0d9488', lw=1.0, zorder=2)
    draw_junction(sda_bus_x, p_mpu_sda[1], '#0d9488')

    # MPU VCC to 3.3V bus
    ax.plot([p_mpu_vcc[0], p_mpu_vcc[0] - 2.5, p_mpu_vcc[0] - 2.5], [p_mpu_vcc[1], p_mpu_vcc[1], 95.0], color='#f59e0b', lw=0.9, zorder=2)
    draw_junction(p_mpu_vcc[0] - 2.5, 95.0, '#f59e0b')

    # MPU GND to GND bus
    ax.plot([p_mpu_gnd[0], p_mpu_gnd[0] - 1.5, p_mpu_gnd[0] - 1.5], [p_mpu_gnd[1], p_mpu_gnd[1], 5.5], color='#334155', lw=0.9, zorder=2)
    draw_junction(p_mpu_gnd[0] - 1.5, 5.5, '#334155')

    # ---------------- 6E. ACTIVE PIEZO BUZZER & ALARM DRIVER ---------------
    bz_x, bz_y, bz_w, bz_h = 96, 8, 29, 14
    ax.add_patch(patches.FancyBboxPatch((bz_x, bz_y), bz_w, bz_h, boxstyle='round,pad=0.2', facecolor='#fef2f2', edgecolor='#dc2626', lw=1.1, zorder=3))
    ax.text(bz_x + bz_w/2, bz_y + bz_h - 2.5, "ACTIVE ALARM BUZZER", fontsize=4.6, fontweight='bold', color='#991b1b', ha='center', zorder=4)
    ax.text(bz_x + bz_w/2, bz_y + bz_h - 4.8, "85dB Acoustic Siren (Toxic Gas / Tamper)", fontsize=3.2, color='#64748b', ha='center', zorder=4)
    
    # Buzzer cylinder and NPN driver transistor symbol
    ax.add_patch(patches.Circle((bz_x + 22, bz_y + 4.5), 3.2, facecolor='#fee2e2', edgecolor='#dc2626', lw=0.8, zorder=4))
    ax.text(bz_x + 22, bz_y + 4.5, "PIEZO\n5V", fontsize=2.8, ha='center', va='center', color='#991b1b', zorder=5)

    p_bz_gate = (bz_x, bz_y + 8)
    p_bz_vcc  = (bz_x, bz_y + 11.5)
    p_bz_gnd  = (bz_x, bz_y + 4.5)

    ax.text(p_bz_gate[0] + 1, p_bz_gate[1], "CTRL (PB0)", fontsize=3.2, ha='left', va='center', color='#dc2626', zorder=4)
    ax.text(p_bz_vcc[0] + 1,  p_bz_vcc[1],  "VCC (+5V)",   fontsize=3.2, ha='left', va='center', color='#ef4444', zorder=4)
    ax.text(p_bz_gnd[0] + 1,  p_bz_gnd[1],  "GND",         fontsize=3.2, ha='left', va='center', color='#334155', zorder=4)

    # Route PB0 to Buzzer CTRL
    ax.plot([pin_pb0[0], p_bz_gate[0]], [pin_pb0[1], p_bz_gate[1]], color='#dc2626', lw=1.1, zorder=2)
    ax.text((pin_pb0[0] + p_bz_gate[0])/2, pin_pb0[1] + 1.0, "AUDIO SIREN TRIGGER", fontsize=3.2, fontweight='bold', color='#dc2626', ha='center', zorder=3)

    # Buzzer VCC to 5V bus
    ax.plot([p_bz_vcc[0], p_bz_vcc[0] - 2.0, p_bz_vcc[0] - 2.0], [p_bz_vcc[1], p_bz_vcc[1], 98.5], color='#ef4444', lw=0.9, zorder=2)
    draw_junction(p_bz_vcc[0] - 2.0, 98.5, '#ef4444')

    # Buzzer GND to GND bus
    ax.plot([p_bz_gnd[0], p_bz_gnd[0] - 1.0, p_bz_gnd[0] - 1.0], [p_bz_gnd[1], p_bz_gnd[1], 5.5], color='#334155', lw=0.9, zorder=2)
    draw_junction(p_bz_gnd[0] - 1.0, 5.5, '#334155')

    # =========================================================================
    # 7. PROFESSIONAL CAD TITLE BLOCK (BOTTOM-RIGHT)
    # =========================================================================
    tb_x, tb_y, tb_w, tb_h = 44, 2.3, 83.8, 2.9
    ax.add_patch(patches.Rectangle((tb_x, tb_y), tb_w, tb_h, facecolor='#0f172a', edgecolor='#0284c7', lw=0.8, zorder=9))
    title_text = "SMART MANHOLE UTILITIES URBAN IOT • ACCURATE ELECTRICAL SCHEMATIC • BATCH 8 • REV 2.4 (CAD BLUEPRINT)"
    ax.text(tb_x + tb_w/2, tb_y + tb_h/2, title_text, fontsize=4.1, fontweight='bold', color='#ffffff', ha='center', va='center', zorder=10)

    # Save at high resolution
    plt.tight_layout(pad=0)
    plt.savefig(output_filename, dpi=300, facecolor='#ffffff', edgecolor='none')
    plt.close()
    print(f"Successfully generated accurate CAD schematic: {output_filename}")

if __name__ == '__main__':
    draw_cad_schematic('poster_cad_circuit_uniform.png')
