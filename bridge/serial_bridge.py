"""
Smart Manhole USB Serial-to-WebSocket Bridge
============================================
Reads real telemetry JSON frames from your STM32 / ESP32 USB COM port
and broadcasts them locally to the Digital Twin web application over WebSocket.

Prerequisites:
    pip install pyserial websockets asyncio

Usage:
    python serial_bridge.py --port COM3 --baud 115200 --ws-port 8080
"""

import argparse
import asyncio
import json
import serial
import serial.tools.list_ports
import websockets

connected_clients = set()

def find_serial_ports():
    ports = serial.tools.list_ports.comports()
    return [p.device for p in ports]

async def ws_handler(websocket):
    print(f"[WebSocket] Client connected: {websocket.remote_address}")
    connected_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)
        print(f"[WebSocket] Client disconnected")

async def serial_reader_task(port_name, baud_rate):
    print(f"[Serial] Opening {port_name} at {baud_rate} baud...")
    try:
        ser = serial.Serial(port_name, baud_rate, timeout=1)
    except Exception as e:
        print(f"[Serial Error] Could not open {port_name}: {e}")
        print("Available COM ports:", find_serial_ports())
        return

    print(f"[Serial] Listening for JSON telemetry packets...")
    while True:
        try:
            line = await asyncio.to_thread(ser.readline)
            if not line:
                continue

            decoded = line.decode('utf-8', errors='ignore').strip()
            if decoded.startswith('{') and decoded.endswith('}'):
                # Validate JSON structure
                try:
                    payload = json.loads(decoded)
                    print(f"[Telemetry Ingest] -> Dist: {payload.get('distance_cm')}cm | Gas: {payload.get('gas_adc')} | Temp: {payload.get('temperature_x100', 0)/100}C | Cover: {payload.get('cover')}")

                    # Broadcast to all connected web dashboards
                    if connected_clients:
                        message = json.dumps(payload)
                        await asyncio.gather(
                            *[client.send(message) for client in connected_clients],
                            return_exceptions=True
                        )
                except json.JSONDecodeError:
                    pass
        except Exception as e:
            print(f"[Serial Exception] {e}")
            await asyncio.sleep(1)

async def main():
    parser = argparse.ArgumentParser(description="Smart Manhole Serial to WebSocket Bridge")
    parser.add_argument("--port", default="COM3", help="Serial COM port (e.g. COM3 or /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--ws-port", type=int, default=8080, help="Local WebSocket port (default: 8080)")
    args = parser.parse_args()

    print("==================================================")
    print("  SMART MANHOLE DIGITAL TWIN - HARDWARE BRIDGE   ")
    print(f"  Available Ports: {find_serial_ports()}")
    print(f"  Target Serial Port: {args.port} @ {args.baud} baud")
    print(f"  WebSocket URL: ws://localhost:{args.ws_port}")
    print("==================================================")

    # Start WebSocket server
    server = await websockets.serve(ws_handler, "0.0.0.0", args.ws_port)
    # Start serial reading task
    await serial_reader_task(args.port, args.baud)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Bridge] Stopped by user.")
