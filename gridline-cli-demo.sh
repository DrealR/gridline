#!/usr/bin/env bash

# GRIDLINE v0.1 Jack-in Demo (no backend yet)

clear
sleep 0.15; echo "[BOOT] Initializing secure tunnel..."
sleep 0.15; echo "[LINK] Syncing with GRIDLINE core..."
sleep 0.15; echo "[AUTH] Generating ident..."
sleep 0.15; echo "[OK] Welcome, OPERATIVE K-7."
sleep 0.15; echo "[ZONE] Assigned role: INFILTRATOR"
sleep 0.15; echo "[ZONE] Entering Sector 3F..."
sleep 0.25

cat << 'EOF'
+--------- GRIDLINE: SECTOR 3F ---------+
| .   .   A   .   .                     |
| .   s   .   .   .                     |
| .   .   Y   i   .                     |
| .   .   .   .   .                     |
+---------------------------------------+
You are: Y (INFILTRATOR_K-7) at (2,2)
Other ops: A (SENTINEL), S (INFILTRATOR)

Commands (demo only):
  /m <w/a/s/d>   move
  /tag           tag this cell
  /scan          ping nearby ops
  /map           redraw grid
EOF
