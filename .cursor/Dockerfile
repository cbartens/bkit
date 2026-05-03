FROM ubuntu:24.04
RUN apt-get update && apt-get install -y curl git
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y gh
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs
# Pin to pnpm major 10 to match repo's packageManager field (pnpm@10.x).
# Using @latest risks installing a future major with breaking changes at unpredictable build times.
RUN npm install -g pnpm@10
RUN npx playwright install --with-deps chromium
