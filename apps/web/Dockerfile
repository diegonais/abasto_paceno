FROM node:20-alpine

WORKDIR /workspace

# Copy the monorepo so the image can resolve Yarn workspaces if they exist.
COPY package.json yarn.lock ./
COPY apps ./apps
COPY packages ./packages

RUN if [ -f apps/web/package.json ]; then \
      yarn install --frozen-lockfile || yarn install; \
    else \
      echo "apps/web/package.json not found yet; image prepared for future scaffold."; \
    fi

EXPOSE 5173

CMD ["sh", "-c", "if [ -f apps/web/package.json ]; then yarn workspace web dev --host 0.0.0.0; else echo 'Pending web scaffold. Add apps/web/package.json to run Vite.' && tail -f /dev/null; fi"]
