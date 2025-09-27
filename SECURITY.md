# Recipe App Security Guidelines

## API Keys and Authentication

1. **Never commit API keys to version control**
   - Always use environment variables to store sensitive information
   - The `.env` file is included in `.gitignore` to prevent accidental commits

2. **API Key Management**
   - Store the Gemini API key in the `.env` file
   - For production, use environment variables on your hosting platform
   - Consider using a secret management service for production deployments

3. **Environment File Setup**
   - Copy `.env.example` to a new file called `.env`
   - Replace the placeholder values with your actual API keys
   - Keep the `.env` file secure and never share it

## Security Best Practices

1. **Input Validation**
   - All user inputs should be validated before processing
   - Implement length limits for recipe names and descriptions

2. **Rate Limiting**
   - Consider implementing rate limiting for API requests to prevent abuse
   - Monitor API usage to stay within Google Gemini's limits

3. **HTTPS**
   - Always use HTTPS in production environments
   - Redirect HTTP requests to HTTPS

4. **Regular Updates**
   - Keep all dependencies updated to patch security vulnerabilities
   - Run `npm audit` regularly to check for security issues

## Reporting Security Issues

If you discover any security vulnerabilities or concerns, please report them to the project maintainer immediately.