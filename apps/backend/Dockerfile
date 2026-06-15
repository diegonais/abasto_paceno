FROM node:20-alpine

WORKDIR /workspace

# Copy the monorepo so the image can resolve Yarn workspaces if they exist.
COPY package.json yarn.lock ./
COPY apps ./apps
COPY packages ./packages

RUN if [ -f apps/backend/package.json ]; then \
      yarn install --frozen-lockfile || yarn install; \
    else \
      echo "apps/backend/package.json not found yet; image prepared for future scaffold."; \
    fi

EXPOSE 3000

CMD ["sh", "-c", "if [ -f apps/backend/package.json ]; then yarn workspace backend start:dev; else echo 'Pending backend scaffold. Add apps/backend/package.json to run NestJS.' && tail -f /dev/null; fi"]
