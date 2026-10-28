import {
  CircuitComponent,
  WireConnection,
  CircuitValidationReport,
  ValidationIssue,
  PinDefinition,
} from '../types/circuit';

export class CircuitValidator {
  public validateCircuit(
    components: CircuitComponent[],
    wires: WireConnection[]
  ): CircuitValidationReport {
    const issues: ValidationIssue[] = [];

    // Helper map of components and pins
    const compMap = new Map<string, CircuitComponent>();
    const pinMap = new Map<string, PinDefinition>(); // key: `${compId}:${pinId}`

    for (const c of components) {
      compMap.set(c.id, c);
      for (const p of c.pins) {
        pinMap.set(`${c.id}:${p.id}`, p);
      }
    }

    // Build Adjacency Graph of connected pins
    const adj = new Map<string, Set<string>>();
    for (const pKey of pinMap.keys()) {
      adj.set(pKey, new Set<string>());
    }

    for (const w of wires) {
      const k1 = `${w.fromComponentId}:${w.fromPinId}`;
      const k2 = `${w.toComponentId}:${w.toPinId}`;
      if (adj.has(k1) && adj.has(k2)) {
        adj.get(k1)!.add(k2);
        adj.get(k2)!.add(k1);
      }
    }

    // Find Connected Components (Electrical Nets)
    const visited = new Set<string>();
    const nets: Array<Set<string>> = [];

    for (const pKey of pinMap.keys()) {
      if (!visited.has(pKey)) {
        const net = new Set<string>();
        const queue = [pKey];
        visited.add(pKey);

        while (queue.length > 0) {
          const curr = queue.shift()!;
          net.add(curr);
          const neighbors = adj.get(curr) || new Set();
          for (const nbr of neighbors) {
            if (!visited.has(nbr)) {
              visited.add(nbr);
              queue.push(nbr);
            }
          }
        }

        // Only count nets that have at least 2 pins or 1 active wire
        if (net.size > 1) {
          nets.push(net);
        }
      }
    }

    // Helper to test if two pins belong to the same electrical net
    const areConnected = (p1: string, p2: string): boolean => {
      for (const net of nets) {
        if (net.has(p1) && net.has(p2)) return true;
      }
      return false;
    };

    // Helper to get all pins in the net containing a given pin
    const getNetForPin = (pinKey: string): Set<string> | undefined => {
      return nets.find((net) => net.has(pinKey));
    };

    // --- RULE 1: Power-to-Ground Shorts (Catastrophic Error) ---
    for (const net of nets) {
      let has5V = false;
      let has3V3 = false;
      let hasGND = false;
      const netPins: { componentId: string; pinId: string }[] = [];

      for (const pKey of net) {
        const p = pinMap.get(pKey);
        const [componentId, pinId] = pKey.split(':');
        netPins.push({ componentId, pinId });

        if (p?.signalType === 'POWER_5V') has5V = true;
        if (p?.signalType === 'POWER_3V3') has3V3 = true;
        if (p?.signalType === 'GND') hasGND = true;
      }

      if ((has5V || has3V3) && hasGND) {
        issues.push({
          id: `short-gnd-${Date.now()}-${Math.random()}`,
          ruleId: 'SHORT_CIRCUIT_GND',
          severity: 'ERROR',
          title: 'Power-to-Ground Direct Short Detected',
          description: `A power supply rail (${has5V ? '5V' : '3.3V'}) is directly tied to Ground. This will destroy the power supply regulator or trigger overcurrent shutdown.`,
          affectedComponents: Array.from(new Set(netPins.map((p) => p.componentId))),
          affectedPins: netPins,
          recommendation: 'Isolate power and ground nets immediately. Remove direct wire bridge between VCC and GND.',
        });
      }

      if (has5V && has3V3) {
        issues.push({
          id: `short-rail-${Date.now()}-${Math.random()}`,
          ruleId: 'RAIL_VOLTAGE_COLLISION',
          severity: 'ERROR',
          title: '5V and 3.3V Power Rail Cross-Tie Conflict',
          description: 'The 5V power bus is connected directly to the 3.3V power bus without a step-down regulator.',
          affectedComponents: Array.from(new Set(netPins.map((p) => p.componentId))),
          affectedPins: netPins,
          recommendation: 'Keep 5V and 3.3V supply lines distinct. Use separate LDO regulation.',
        });
      }
    }

    // --- RULE 2: Overvoltage on 3.3V Non-5V Tolerant Inputs (e.g. HC-SR04 5V Echo to STM32 PA2) ---
    const hcsr04Echo = 'hcsr04:ECHO';
    const stm32Echo = 'stm32:PA2';
    const dividerIn = 'divider:IN';
    const dividerOut = 'divider:OUT';

    if (areConnected(hcsr04Echo, stm32Echo)) {
      // Check if it bypassed the divider
      const net = getNetForPin(hcsr04Echo);
      if (net && !net.has(dividerIn)) {
        issues.push({
          id: 'overvolt-hcsr04-echo',
          ruleId: 'OVERVOLTAGE_PA2',
          severity: 'ERROR',
          title: 'Overvoltage Hazard: 5V Echo connected to 3.3V Non-FT Pin',
          description: 'HC-SR04 ECHO outputs 5V TTL logic. STM32 pin PA2 is an analog-capable I/O that is NOT 5V tolerant. Exceeding 3.6V will damage the microcontroller input buffer.',
          affectedComponents: ['hcsr04', 'stm32'],
          affectedPins: [
            { componentId: 'hcsr04', pinId: 'ECHO' },
            { componentId: 'stm32', pinId: 'PA2' },
          ],
          recommendation: 'Route HC-SR04 ECHO through the 1kΩ/2kΩ resistive voltage divider before entering STM32 PA2.',
        });
      }
    }

    // --- RULE 3: Missing Voltage Divider Level Shifter ---
    const echoNet = getNetForPin(hcsr04Echo);
    if (echoNet && !echoNet.has(dividerIn)) {
      issues.push({
        id: 'missing-divider',
        ruleId: 'MISSING_VOLTAGE_DIVIDER',
        severity: 'WARNING',
        title: 'Missing Resistor Divider on 5V Ultrasonic Echo',
        description: 'HC-SR04 Echo pin requires a 1k/2k voltage divider or level shifter to safely interface with STM32 3.3V inputs.',
        affectedComponents: ['hcsr04', 'divider'],
        affectedPins: [{ componentId: 'hcsr04', pinId: 'ECHO' }],
        recommendation: 'Connect HC-SR04 ECHO to Divider IN, and Divider OUT to STM32 PA2.',
      });
    }

    // --- RULE 4: UART Cross-Over Check (TX -> RX, RX -> TX) ---
    const stmTx = 'stm32:PA9';
    const stmRx = 'stm32:PA10';
    const espRx = 'esp32:GPIO16';
    const espTx = 'esp32:GPIO17';

    if (areConnected(stmTx, espTx)) {
      issues.push({
        id: 'uart-tx-tx-conflict',
        ruleId: 'UART_BUS_COLLISION',
        severity: 'ERROR',
        title: 'UART Driver Conflict: TX connected to TX',
        description: 'STM32 TX (PA9) is connected to ESP32 TX (GPIO17). Two active push-pull outputs driving the same wire causes bus contention and prevents serial communication.',
        affectedComponents: ['stm32', 'esp32'],
        affectedPins: [
          { componentId: 'stm32', pinId: 'PA9' },
          { componentId: 'esp32', pinId: 'GPIO17' },
        ],
        recommendation: 'Connect Transmit to Receive: STM32 PA9 (TX) -> ESP32 GPIO16 (RX), and ESP32 GPIO17 (TX) -> STM32 PA10 (RX).',
      });
    }

    if (areConnected(stmRx, espRx)) {
      issues.push({
        id: 'uart-rx-rx-floating',
        ruleId: 'UART_RX_FLOATING',
        severity: 'WARNING',
        title: 'UART Open Loop: RX connected to RX',
        description: 'STM32 RX (PA10) is connected to ESP32 RX (GPIO16). Neither pin is driving the line, resulting in a floating high-impedance state.',
        affectedComponents: ['stm32', 'esp32'],
        affectedPins: [
          { componentId: 'stm32', pinId: 'PA10' },
          { componentId: 'esp32', pinId: 'GPIO16' },
        ],
        recommendation: 'Cross-over UART pins: Connect STM32 PA10 (RX) to ESP32 GPIO17 (TX).',
      });
    }

    // --- RULE 5: Common Ground Continuity Check ---
    const stmGnd = 'stm32:GND_1';
    const espGnd = 'esp32:GND_1';

    if (!areConnected(stmGnd, espGnd)) {
      issues.push({
        id: 'missing-common-gnd',
        ruleId: 'MISSING_COMMON_GROUND',
        severity: 'ERROR',
        title: 'Missing Common Ground Reference between STM32 and ESP32',
        description: 'UART serial signaling relies on a common reference potential. Without a common ground, voltage differentials between boards cause frame errors and erratic data.',
        affectedComponents: ['stm32', 'esp32'],
        affectedPins: [
          { componentId: 'stm32', pinId: 'GND_1' },
          { componentId: 'esp32', pinId: 'GND_1' },
        ],
        recommendation: 'Tie STM32 Ground, ESP32 Ground, and sensor Grounds together through the Common Ground bus.',
      });
    }

    // --- RULE 6: DS18B20 1-Wire Pull-Up Resistor Check ---
    const ds18Data = 'ds18b20:DATA';
    const pullupData = 'pullup:PULLUP_DATA';
    const pullupVcc = 'pullup:PULLUP_VCC';
    const stm32Onewire = 'stm32:PB12';

    if (areConnected(ds18Data, stm32Onewire)) {
      const dataNet = getNetForPin(ds18Data);
      const hasPullup = dataNet && dataNet.has(pullupData);
      const vccConnected = areConnected(pullupVcc, 'power_rails:RAIL_3V3');

      if (!hasPullup || !vccConnected) {
        issues.push({
          id: 'missing-1wire-pullup',
          ruleId: 'MISSING_ONEWIRE_PULLUP',
          severity: 'WARNING',
          title: 'Missing 4.7kΩ Pull-Up Resistor on 1-Wire Temperature Bus',
          description: 'DS18B20 uses an open-drain communication protocol. Without a 4.7kΩ pull-up resistor to 3.3V, the data line cannot return HIGH, leading to device reset or 85°C/CRC errors.',
          affectedComponents: ['ds18b20', 'pullup', 'stm32'],
          affectedPins: [
            { componentId: 'ds18b20', pinId: 'DATA' },
            { componentId: 'stm32', pinId: 'PB12' },
          ],
          recommendation: 'Place a 4.7kΩ pull-up resistor between the 3.3V rail and the PB12 / DS18B20 DATA line.',
        });
      }
    }

    // --- RULE 7: I2C Bus Cross-Wiring Check (SCL vs SDA) ---
    const stmScl = 'stm32:PB8';
    const stmSda = 'stm32:PB9';
    const mpuScl = 'mpu6050:SCL';
    const mpuSda = 'mpu6050:SDA';
    const lcdScl = 'lcd1602:SCL';
    const lcdSda = 'lcd1602:SDA';

    if (areConnected(stmScl, stmSda)) {
      issues.push({
        id: 'i2c-bus-short',
        ruleId: 'I2C_CLOCK_DATA_SHORT',
        severity: 'ERROR',
        title: 'I2C Bus Short: SCL and SDA Shorted Together',
        description: 'The I2C Clock line (PB8) is tied to the I2C Data line (PB9). This deadlocks the I2C peripheral hardware in STM32.',
        affectedComponents: ['stm32'],
        affectedPins: [
          { componentId: 'stm32', pinId: 'PB8' },
          { componentId: 'stm32', pinId: 'PB9' },
        ],
        recommendation: 'Isolate SCL (PB8) and SDA (PB9) lines into separate nets.',
      });
    }

    if (areConnected(stmScl, mpuSda) || areConnected(stmSda, mpuScl)) {
      issues.push({
        id: 'i2c-swapped-mpu',
        ruleId: 'I2C_PINS_SWAPPED',
        severity: 'ERROR',
        title: 'I2C Lines Swapped on MPU6050',
        description: 'Clock and Data lines are crossed between STM32 and MPU6050. MPU6050 will not acknowledge I2C address 0x68.',
        affectedComponents: ['stm32', 'mpu6050'],
        affectedPins: [
          { componentId: 'stm32', pinId: 'PB8' },
          { componentId: 'mpu6050', pinId: 'SCL' },
        ],
        recommendation: 'Ensure SCL connects to SCL, and SDA connects to SDA.',
      });
    }

    // --- RULE 8: Unconnected Essential Power / Ground Pins ---
    const unconnectedRequired: { componentId: string; pinId: string; name: string }[] = [];

    for (const c of components) {
      if (c.category === 'PASSIVE') continue;
      for (const p of c.pins) {
        if (p.signalType === 'GND' || p.signalType === 'POWER_5V' || p.signalType === 'POWER_3V3') {
          const pKey = `${c.id}:${p.id}`;
          const net = getNetForPin(pKey);
          if (!net || net.size <= 1) {
            unconnectedRequired.push({
              componentId: c.id,
              pinId: p.id,
              name: `${c.name} -> ${p.name}`,
            });
          }
        }
      }
    }

    if (unconnectedRequired.length > 0) {
      issues.push({
        id: 'unconnected-power-pins',
        ruleId: 'UNCONNECTED_ESSENTIAL_PINS',
        severity: 'WARNING',
        title: `${unconnectedRequired.length} Power / Ground Pin(s) Unconnected`,
        description: `Crucial power rails are floating: ${unconnectedRequired.slice(0, 3).map((p) => p.name).join(', ')}${unconnectedRequired.length > 3 ? '...' : ''}`,
        affectedComponents: Array.from(new Set(unconnectedRequired.map((p) => p.componentId))),
        affectedPins: unconnectedRequired.map((p) => ({ componentId: p.componentId, pinId: p.pinId })),
        recommendation: 'Connect all VCC and GND pins to their respective regulated supply rails.',
      });
    }

    // Informational note regarding simulation limitations
    issues.push({
      id: 'simulation-notice',
      ruleId: 'SIMULATOR_DISCLAIMER',
      severity: 'INFO',
      title: 'Validation Scope & Electrical Modeling Notice',
      description: 'This validator verifies pin compatibility, bus topology, signal levels, and known wiring rules. It does not replace full analog SPICE simulation or firmware timing emulation.',
      affectedComponents: [],
      affectedPins: [],
      recommendation: 'Inspect physical trace impedances, decoupling capacitors (100nF ceramic near VCC pins), and solder joints prior to PCB fabrication.',
    });

    const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
    const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
    const infoCount = issues.filter((i) => i.severity === 'INFO').length;

    return {
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      infoCount,
      issues,
      connectedNetsCount: nets.length,
      unconnectedRequiredPins: unconnectedRequired,
    };
  }
}

export const circuitValidator = new CircuitValidator();
