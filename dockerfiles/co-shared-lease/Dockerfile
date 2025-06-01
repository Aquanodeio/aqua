FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# 1. Install core dev tools
RUN apt-get update && apt-get install -y \
  openssh-server \
  proot \
  sudo \
  curl \
  wget \
  git \
  build-essential \
  python3 python3-pip python3-venv \
  unzip \
  zip \
  ca-certificates \
  gnupg \
  nano \
  bash-completion \
  vim \
  htop \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Setup SSH
RUN mkdir -p /var/run/sshd

RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
  sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
  sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

# 3. Create shared workspace dir
RUN mkdir -p /home/workspaces && chmod 755 /home/workspaces

# 4. Create example users
RUN for u in alice bob; do \
  useradd -m -d /home/workspaces/$u -s /usr/local/bin/jail-shell-proot.sh $u && \
  echo "$u:password" | chpasswd && \
  chmod 700 /home/workspaces/$u; \
  done

# 5. Install NVM (global bootstrap, not per-user)
ENV NVM_DIR=/opt/nvm
RUN mkdir -p $NVM_DIR && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash && \
  . $NVM_DIR/nvm.sh && \
  nvm install 18 && \
  nvm use 18 && \
  nvm alias default 18 && \
  ln -s "$NVM_DIR/versions/node/v18.*/bin/node" /usr/local/bin/node && \
  ln -s "$NVM_DIR/versions/node/v18.*/bin/npm" /usr/local/bin/npm

ENV PATH="$NVM_DIR/versions/node/v18.*/bin:$PATH"

# 6. Copy in jail script
COPY jail-shell-proot.sh /usr/local/bin/jail-shell-proot.sh
RUN chmod +x /usr/local/bin/jail-shell-proot.sh

# 7. Expose SSH
EXPOSE 22

# 8. Run sshd
CMD ["/usr/sbin/sshd", "-D"]

