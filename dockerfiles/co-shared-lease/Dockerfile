# 1) Base on Ubuntu 22.04
FROM ubuntu:22.04
# Could be NVIDIA Cude

# 2) Install OpenSSH and proot
RUN apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
  openssh-server proot sudo \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# 3) Prepare SSH
RUN mkdir -p /var/run/sshd

# 4) Enable password auth, disable root login
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
  sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
  sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

# 5) Create the “workspaces” root
RUN mkdir -p /home/workspaces && chmod 755 /home/workspaces

# 6) Add two example users (alice, bob)
RUN for u in alice bob; do \
  useradd -m -d /home/workspaces/$u -s /usr/local/bin/jail-shell-proot.sh $u && \
  echo "$u:password" | chpasswd && \
  chmod 700 /home/workspaces/$u; \
  done

# 7) Copy in the proot-jail script
COPY jail-shell-proot.sh /usr/local/bin/jail-shell-proot.sh
RUN chmod +x /usr/local/bin/jail-shell-proot.sh

# 8) Expose SSH port
EXPOSE 22

# 9) Start sshd in foreground
CMD ["/usr/sbin/sshd", "-D"]
