#!/bin/bash
#
# jail-shell-proot.sh: when a user logs in, drop them into a proot “jail”
# that mounts only what they need under /home/workspaces/$USER → /home/user

set -e

USER_HOME="/home/workspaces/$USER"
PROOT_ARGS=()

# 1) ensure the per-user workspace exists
if [ ! -d "$USER_HOME" ]; then
  mkdir -p "$USER_HOME"
  chmod 700 "$USER_HOME"
fi

# 2) create a private tmp inside their workspace
# TODO: have folders where user can install their binary and stuff and autolink -> Good DX
TMP_DIR="$USER_HOME/tmp"
mkdir -p "$TMP_DIR"
chmod 1777 "$TMP_DIR"

# 3) build proot arguments to bind-mount exactly what we want:
#    - map /usr, /lib, /lib64, /bin, /etc  as read-only
#    - make a fresh /tmp inside the proot
#    - bind their home into /home/user
PROOT_ARGS+=("-r" "/")                     # start with real root as base
PROOT_ARGS+=("-b" "/usr:/usr:ro")          # bind /usr read-only
PROOT_ARGS+=("-b" "/lib:/lib:ro")          # bind /lib read-only
PROOT_ARGS+=("-b" "/lib64:/lib64:ro")      # bind /lib64 read-only
PROOT_ARGS+=("-b" "/bin:/bin:ro")          # bind /bin read-only
PROOT_ARGS+=("-b" "/etc:/etc:ro")          # bind /etc read-only
PROOT_ARGS+=("-b" "/dev")                  # bind /dev (so /dev/nvidia* is visible)
PROOT_ARGS+=("-b" "/proc")                 # bind /proc (PS still shows host PIDs)
PROOT_ARGS+=("-b" "/sys")                  # bind /sys (maybe needed for GPU info)
PROOT_ARGS+=("-b" "$TMP_DIR:/tmp")         # mount their private tmp
PROOT_ARGS+=("-b" "$USER_HOME:/home/user") # mount $USER_HOME as /home/user

# 4) set HOME/USER env and launch a login shell inside proot
export HOME="/home/user"
export USER="$USER"

exec /usr/bin/proot "${PROOT_ARGS[@]}" /bin/bash --login
