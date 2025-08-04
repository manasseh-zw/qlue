#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker build -t qlue-client .

# Tag the image (optional)
docker tag qlue-client qlue-client:latest

echo "Build complete!"
echo ""
echo "To run locally:"
echo "docker run -p 80:80 qlue-client"
echo ""
echo "To deploy to DigitalOcean App Platform:"
echo "1. Push to your registry:"
echo "   docker tag qlue-client registry.digitalocean.com/your-registry/qlue-client"
echo "   docker push registry.digitalocean.com/your-registry/qlue-client"
echo ""
echo "2. Deploy via DigitalOcean App Platform using the image" 