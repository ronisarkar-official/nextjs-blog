# Sitemap & RSS Feed Optimization Setup

This document explains how to set up automatic sitemap and RSS feed revalidation when posts are created or updated.

## Overview

The optimized sitemap and RSS system includes:

- **Faster revalidation** (30 seconds instead of 60)
- **Automatic cache invalidation** when posts are created/updated
- **Error handling** with fallbacks
- **Webhook support** for real-time updates
- **Performance optimizations** with caching
- **RSS feed optimization** with caching and fallback feeds

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Sitemap revalidation token (optional but recommended)
SITEMAP_REVALIDATE_TOKEN=your-secure-random-token-here

# RSS revalidation token (optional but recommended)
RSS_REVALIDATE_TOKEN=your-secure-random-token-here

# Site URL (already exists)
NEXT_PUBLIC_SITE_URL=https://www.spechype.com
```

### 2. Sanity Webhook Configuration

To enable automatic sitemap updates when posts are created/updated in Sanity:

1. Go to your Sanity project dashboard
2. Navigate to **API** → **Webhooks**
3. Click **Create webhook**
4. Configure the webhook:
   - **Name**: `Sitemap Revalidation`
   - **URL**: `https://your-domain.com/api/sanity/webhook`
   - **Trigger on**: `Create`, `Update`, `Delete`
   - **Filter**: `_type == "startup"`
   - **Secret**: Leave empty or add a secret for verification
   - **API Version**: `v2023-05-03` (or latest)

### 3. Testing the Setup

#### Test Sitemap Generation

```bash
# Visit your sitemap
curl https://your-domain.com/sitemap.xml

# Test revalidation endpoint
curl -X POST https://your-domain.com/api/sitemap/revalidate
```

#### Test RSS Feed Generation

```bash
# Visit your RSS feed
curl https://your-domain.com/rss.xml

# Test RSS revalidation endpoint
curl -X POST https://your-domain.com/api/rss/revalidate
```

#### Test Webhook

```bash
# Test webhook endpoint
curl -X GET https://your-domain.com/api/sanity/webhook
```

### 4. Monitoring

The system includes logging for monitoring:

- **Sitemap generation**: Logs the number of routes generated
- **Revalidation**: Logs successful revalidations
- **Errors**: Logs any failures with fallbacks

Check your application logs to monitor sitemap performance.

## How It Works

### Automatic Revalidation Triggers

1. **Post Creation**: When a new startup is created via `createPitch` action
2. **Post Updates**: When a startup is updated via the Sanity update API
3. **Sanity Webhooks**: When changes are made directly in Sanity Studio
4. **Manual Trigger**: Via the `/api/sitemap/revalidate` endpoint

### Caching Strategy

- **Sitemap Cache**: 5 minutes in-memory cache
- **Sanity Query Cache**: 30 seconds for startup routes
- **Static Routes**: Always fresh (no cache)

### Error Handling

- **Sanity API failures**: Returns static routes as fallback
- **Network timeouts**: 10-second timeout with graceful degradation
- **Revalidation failures**: Logged but doesn't break the main flow

## Performance Optimizations

### Before Optimization

- 60-second revalidation
- No caching
- No automatic updates
- Basic error handling

### After Optimization

- 30-second revalidation
- 5-minute in-memory cache
- Automatic updates on post changes
- Comprehensive error handling
- Webhook support for real-time updates

## Troubleshooting

### Sitemap Not Updating

1. Check if webhook is configured correctly in Sanity
2. Verify the webhook URL is accessible
3. Check application logs for errors
4. Test the revalidation endpoint manually

### Performance Issues

1. Monitor cache hit rates in logs
2. Check Sanity API response times
3. Consider adjusting cache duration if needed

### Webhook Not Working

1. Verify the webhook URL is correct
2. Check if the endpoint is accessible from Sanity
3. Review webhook logs in Sanity dashboard
4. Test the webhook endpoint manually

## API Endpoints

### `/api/sitemap/revalidate`

- **Method**: POST
- **Purpose**: Manually trigger sitemap revalidation
- **Auth**: Optional token-based authentication

### `/api/rss/revalidate`

- **Method**: POST
- **Purpose**: Manually trigger RSS feed revalidation
- **Auth**: Optional token-based authentication

### `/api/sanity/webhook`

- **Method**: POST
- **Purpose**: Handle Sanity webhook events
- **Auth**: None (Sanity webhook authentication)

## Configuration Files

- `app/sitemap.ts` - Main sitemap generation
- `app/rss.xml/route.js` - RSS feed generation
- `app/api/sitemap/revalidate/route.ts` - Sitemap revalidation endpoint
- `app/api/rss/revalidate/route.ts` - RSS revalidation endpoint
- `app/api/sanity/webhook/route.ts` - Sanity webhook handler
- `next-sitemap.config.js` - Next-sitemap configuration
- `lib/actions.ts` - Updated to trigger revalidation
- `app/api/sanity/update/route.ts` - Updated to trigger revalidation
