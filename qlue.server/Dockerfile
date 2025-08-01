# use the official Bun image
FROM oven/bun:1

WORKDIR /usr/src/app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN bun run db:generate

# Expose port
EXPOSE 8080

# Run the app
CMD ["bun", "run", "dev"] 