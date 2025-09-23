# Security Guide

This document outlines the security measures implemented in DevPockit and provides guidance for secure deployment.

## 🔐 Environment Variables

### Local Development Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Generate a secure JWT secret:**
   ```bash
   python3 -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
   ```

3. **Update your `.env` file with the generated secret and other values.**

### Required Environment Variables

#### Backend Variables
- `JWT_SECRET_KEY`: Secure random string for JWT token signing
- `JWT_ALGORITHM`: JWT algorithm (default: HS256)
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `DATABASE_URL`: Database connection string
- `ENVIRONMENT`: Environment (development/production)
- `DEBUG`: Debug mode (true/false)

#### Frontend Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version

## 🚀 Production Deployment

### Vercel Deployment

1. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all required variables with production values

2. **Required production variables:**
   ```
   JWT_SECRET_KEY=<secure-random-string>
   DATABASE_URL=<production-database-url>
   ENVIRONMENT=production
   DEBUG=false
   NEXT_PUBLIC_API_URL=<production-api-url>
   ```

### Database Security

- **Development**: SQLite (local file)
- **Production**: Use Vercel Postgres or external database
- **Connection**: Use environment variables for database URLs
- **Credentials**: Never hardcode database credentials

## 🔒 Security Best Practices

### JWT Security
- Use strong, randomly generated secrets (32+ characters)
- Set appropriate token expiration times
- Use HTTPS in production
- Validate tokens on every request

### Password Security
- Passwords are hashed using bcrypt
- Minimum 8 character requirement
- No password storage in plain text

### CORS Configuration
- Configure allowed origins properly
- Use specific domains, not wildcards in production
- Include your production domain in CORS origins

### Environment Security
- Never commit `.env` files to version control
- Use different secrets for different environments
- Rotate secrets regularly in production
- Use environment-specific configurations

## 🛡️ Security Checklist

### Before Deployment
- [ ] All secrets are in environment variables
- [ ] No hardcoded credentials in code
- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] CORS is properly configured
- [ ] HTTPS is enabled in production
- [ ] Debug mode is disabled in production

### Regular Maintenance
- [ ] Rotate JWT secrets periodically
- [ ] Update dependencies regularly
- [ ] Monitor for security vulnerabilities
- [ ] Review access logs
- [ ] Backup database securely

## 🚨 Security Incident Response

If you suspect a security breach:

1. **Immediate Actions:**
   - Rotate all secrets immediately
   - Review access logs
   - Check for unauthorized access

2. **Investigation:**
   - Identify the scope of the breach
   - Determine what data was accessed
   - Document the incident

3. **Recovery:**
   - Update all compromised credentials
   - Implement additional security measures
   - Notify affected users if necessary

## 📞 Security Contact

For security-related issues or questions:
- Create a private issue in the repository
- Contact the development team directly
- Follow responsible disclosure practices

## 🔍 Security Audit

This application has been scanned for:
- ✅ No hardcoded secrets
- ✅ Proper environment variable usage
- ✅ Secure password hashing
- ✅ JWT token security
- ✅ CORS configuration
- ✅ Database security

Regular security audits are recommended to maintain security standards.
