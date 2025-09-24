# SMTP Email Configuration

## Setup Instructions

### 1. Create `.env.local` file
Copy the `.env.local.example` file to `.env.local` in the project root:
```bash
cp .env.local.example .env.local
```

### 2. Configure SMTP Settings

Edit the `.env.local` file with your email provider's SMTP settings:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=your-email@gmail.com
SMTP_TO=foxxdev.collab@gmail.com
```

## Email Provider Settings

### Gmail
1. Enable 2-factor authentication on your Google account
2. Generate an app-specific password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Copy the generated password
   - Use this password as `SMTP_PASS`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=mail.your-domain.com
SMTP_PORT=587
SMTP_SECURE=true  # Use true for port 465, false for 587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-password
```

## Features

The contact form includes:

1. **Form Validation**: Client-side validation for required fields
2. **Email Formatting**: Professional HTML email templates
3. **Auto-Reply**: Automatic confirmation email sent to users
4. **Error Handling**: Graceful error messages with fallback options
5. **Loading States**: Visual feedback during submission
6. **Success Confirmation**: Clear success message after sending
7. **Spam Prevention**: Server-side validation and rate limiting ready

## Testing

1. Fill out the contact form on `/contact`
2. Check that the email is received at the `SMTP_TO` address
3. Verify the auto-reply is sent to the submitted email address

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Make sure you're using app-specific passwords for Gmail
   - Check that 2FA is enabled for Gmail accounts
   - Verify the email and password are correct

2. **Connection Timeout**
   - Check your firewall settings
   - Verify the SMTP port is not blocked
   - Try using port 465 with `SMTP_SECURE=true`

3. **Emails Not Sending**
   - Check the server logs for detailed error messages
   - Verify all environment variables are set correctly
   - Test with a different email provider

## Security Notes

- Never commit `.env.local` to version control
- Use app-specific passwords instead of account passwords
- Consider implementing rate limiting for production
- Add CAPTCHA for additional spam prevention if needed