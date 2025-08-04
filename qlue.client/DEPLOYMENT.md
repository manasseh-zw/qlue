# Qlue Client Deployment

This Docker setup builds and serves the React client app with nginx.

## Quick Deploy

1. **Build the image:**

   ```bash
   docker build -t qlue-client .
   ```

2. **Run locally:**

   ```bash
   docker run -p 80:80 qlue-client
   ```

3. **Deploy to DigitalOcean App Platform:**
   - Push to your container registry
   - Deploy using the Docker image

## Configuration

### Environment Variables

- `PORT`: Port to run on (default: 80)

### API Configuration

Update the nginx.conf file to point to your server URL:

```nginx
location /api/ {
    proxy_pass http://your-server-url:8080;
    # ... other proxy settings
}
```

## Troubleshooting

### Styling Issues

If HeroUI styles are broken:

1. Check that Tailwind CSS is building correctly
2. Verify font files are being served
3. Check browser console for any CSS loading errors

### Build Issues

1. Ensure all dependencies are installed
2. Check that the build process completes successfully
3. Verify the dist folder contains all assets

## Development

To test the build locally:

```bash
npm run build
npm run serve
```
