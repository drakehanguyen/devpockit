# HTTPS Development Setup for Camera Access

## Why HTTPS is Required
Modern browsers require HTTPS for camera access due to security policies. This is true even for local development.

## Quick Setup Options

### Option 1: Use Next.js Built-in HTTPS (Recommended)
```bash
# Start development server with HTTPS
pnpm dev:https
```

This will start your app at `https://localhost:3000` with a self-signed certificate.

**Note**: The `--experimental-https` flag is the correct way to enable HTTPS in Next.js development mode.

### Option 2: Use mkcert for Trusted Certificates (Best Experience)
```bash
# Install mkcert (one-time setup)
# macOS
brew install mkcert
mkcert -install

# Create certificates for localhost
mkcert localhost 127.0.0.1 ::1

# This creates localhost+2.pem and localhost+2-key.pem
```

Then update your package.json:
```json
{
  "scripts": {
    "dev:https": "next dev --experimental-https --experimental-https-key localhost+2-key.pem --experimental-https-cert localhost+2.pem"
  }
}
```

### Option 3: Use ngrok for Public HTTPS (Mobile Testing)
```bash
# Install ngrok
npm install -g ngrok

# Start your app normally
pnpm dev

# In another terminal, expose it via HTTPS
ngrok http 3000
```

## Browser Security Warnings

### Self-Signed Certificate Warning
When using self-signed certificates, browsers will show a security warning:

1. **Chrome**: Click "Advanced" → "Proceed to localhost (unsafe)"
2. **Safari**: Click "Show Details" → "visit this website"
3. **Firefox**: Click "Advanced" → "Accept the Risk and Continue"

### Trusted Certificate (mkcert)
If you use mkcert, the certificate will be trusted and you won't see warnings.

## Testing Camera Access

Once HTTPS is set up:

1. Navigate to `https://localhost:3000`
2. Go to QR Code Decoder tool
3. Click "Camera Scan" button
4. Grant camera permissions when prompted
5. Camera should now work! 📱📷

## Troubleshooting

### Still Getting Camera Errors?
1. **Check HTTPS**: Ensure URL starts with `https://`
2. **Grant Permissions**: Look for camera permission prompts
3. **Browser Console**: Check for any JavaScript errors
4. **Try Different Browser**: Test in Chrome, Safari, Firefox
5. **Mobile Testing**: Use ngrok for mobile device testing

### Common Issues
- **"Camera access denied"**: User didn't grant permission
- **"Not supported"**: Browser doesn't support WebRTC
- **"HTTPS required"**: Still using HTTP instead of HTTPS

## Production Deployment
In production (Vercel), HTTPS is automatically provided, so camera access will work without additional setup.

---

**Next Steps**: Run `pnpm dev:https` and test the camera functionality! 🚀
