# MSSN Website API Integration - Quick Reference Guide

## 1. Service Quick Access

| Service | Purpose | Free Tier | Setup Time | Monthly Cost | NGN Cost | Rate Limit | Priority |
|---------|---------|-----------|-----------|--------------|----------|-----------|----------|
| **Paystack** | Payments | No | 15 min | ~$652 | ₦1.0M | No hard limit | HIGH |
| **R2** | File Storage | 15GB/mo | 10 min | $5 | ₦14k | Very high | HIGH |
| **Plunk** | Email | 10k/mo | 10 min | $1 | ₦3k | 100/sec | HIGH |
| **Kudisms** | SMS | No | 10 min | $45 | ₦158k | 100/min | MEDIUM |
| **pgvector** | Vector Search | Open-source | 20 min | $0 | ₦0 | N/A | MEDIUM |
| **pg_trgm** | Fuzzy Search | Built-in | 5 min | $0 | ₦0 | N/A | MEDIUM |
| **Gemini** | AI Content | 1.5k/day free | 5 min | $0 | ₦0 | 1,500/day | MEDIUM |
| **Facebook** | Social Posts | Yes | 20 min | $0 | ₦0 | 10/sec | LOW |
| **Twitter X** | Tweets | Limited | 15 min | $0 | ₦0 | 50/15min | LOW |
| **Instagram** | Social Posts | Yes | 25 min | $0 | ₦0 | 10/sec | LOW |
| **LinkedIn** | Company Posts | Yes | 20 min | $0 | ₦0 | 100/day | LOW |

---

## 2. Environment Variables Template

```bash
# PAYMENT
PAYSTACK_SECRET_KEY=sk_live_xxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxx

# STORAGE
CLOUDFLARE_ACCOUNT_ID=xxxx
CLOUDFLARE_ACCESS_KEY_ID=xxxx
CLOUDFLARE_SECRET_ACCESS_KEY=xxxx
CLOUDFLARE_BUCKET_NAME=mssn-files

# EMAIL
PLUNK_API_KEY=sk_xxxx
PLUNK_FROM_EMAIL=noreply@mssn.org

# SMS
KUDISMS_API_TOKEN=xxxx
KUDISMS_SENDER_ID=MSSN

# AI
GOOGLE_GEMINI_API_KEY=AIzaSyD...
OPENAI_API_KEY=sk-xxxx  # For embeddings if needed

# DATABASE
DATABASE_URL=postgresql://user:pass@localhost:5432/mssn

# SOCIAL MEDIA
FACEBOOK_PAGE_ACCESS_TOKEN=xxx
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_SECRET=xxx
INSTAGRAM_ACCESS_TOKEN=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx

# APP
APP_URL=https://mssn.org
NODE_ENV=production
```

---

## 3. API Endpoint Summary

### Paystack
```
POST   /transaction/initialize          - Start payment
GET    /transaction/verify/{ref}        - Check payment status
POST   /webhook                         - Handle payment callbacks
```

### R2 (S3-compatible)
```
PUT    /file                            - Upload file
GET    /file                            - Download (via presigned URL)
DELETE /file                            - Delete file
```

### Plunk
```
POST   /emails/send                     - Send email
GET    /contacts                        - Get contact info
```

### Kudisms
```
POST   /send                            - Send SMS
GET    /balance                         - Check balance
```

### PostgreSQL
```sql
-- Fuzzy search
SELECT * FROM documents 
WHERE content % 'query'
ORDER BY word_similarity(content, 'query') DESC;

-- Vector search
SELECT * FROM documents
ORDER BY embedding <=> 'vector'::vector
LIMIT 10;
```

---

## 4. Code Snippets Cheat Sheet

### Initialize Payment
```typescript
const { authorizationUrl, reference } = await initializePayment(
  'user@example.com',
  5000,  // Amount in naira
  { ticketId: 'TICKET_001', eventId: 'EVENT_001' }
);
// Redirect user to authorizationUrl
```

### Upload File to R2
```typescript
const key = await uploadFile(
  'mssn-files',
  'path/to/file.pdf',
  fileBuffer,
  'application/pdf'
);

// Get download URL (1 hour expiry)
const downloadUrl = await generateDownloadUrl('mssn-files', key, 3600);
```

### Send Email with Plunk
```typescript
const success = await plunk.emails.send({
  to: 'user@example.com',
  subject: 'Your Ticket Confirmation',
  body: emailHtml,
  type: 'html',
  from: 'noreply@mssn.org',
  name: 'MSSN Events',
});
```

### Send SMS
```typescript
const result = await sendSMS(
  '2348012345678',
  'Payment of ₦5,000 successful. Ref: REF123. Thank you!'
);
```

### Hybrid Search (Fuzzy + Vector)
```typescript
const results = await hybridSearch(
  'search query',
  vectorEmbedding,
  10  // limit to 10 results
);
// Returns results ranked by RRF (Reciprocal Rank Fusion)
```

### Generate Content with Gemini
```typescript
const result = await model.generateContent(
  'Write a brief blog post outline about Islamic finance'
);
console.log(result.response.text());
```

---

## 5. Common Error Solutions

### Paystack
| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Wrong/invalid secret key | Check SECRET_KEY in .env, regenerate if needed |
| 422 Amount validation | Amount ≤ 0 | Ensure amount > 0 in kobo (multiply naira by 100) |
| Invalid email | Malformed email | Validate email format before sending |
| Rate limited | Too many requests | Implement exponential backoff retry |

### R2
| Error | Cause | Solution |
|-------|-------|----------|
| InvalidAccessKeyId | Wrong access key | Regenerate API token in Cloudflare dashboard |
| NoSuchBucket | Bucket doesn't exist | Create bucket or verify bucket name |
| EntityTooLarge | File > 5TB | Check file size, R2 supports up to 5TB max |
| NoSuchKey | File doesn't exist | Verify file was uploaded, check S3 key path |

### Plunk
| Error | Cause | Solution |
|-------|-------|----------|
| Invalid API key | Wrong/expired key | Regenerate in Plunk dashboard → Settings |
| Sender not verified | Email not in verified list | Add and verify email in Plunk Settings → Senders |
| Invalid recipient | Malformed email | Validate recipient email format |
| Rate limited | 100+ requests/sec | Implement queue system with rate limiting |

### Kudisms
| Error | Cause | Solution |
|-------|-------|----------|
| Insufficient balance | Account balance too low | Top up account at kudisms.net |
| Invalid recipient | Wrong phone format | Use format: 2348012345678 (no spaces/dashes) |
| Rate limit (429) | Exceeded 100 req/min | Queue SMS, limit to 100 requests per minute |
| Message too long | SMS > 160 chars | Limit to 160 chars, use multiple SMS for longer |

### PostgreSQL
| Error | Cause | Solution |
|-------|-------|----------|
| Extension not found | pg_trgm/pgvector not installed | Run `CREATE EXTENSION pg_trgm;` and `CREATE EXTENSION vector;` |
| Dimension mismatch | Vector size doesn't match | Use consistent embedding size (1536 for OpenAI) |
| Query timeout | Index not built or slow query | Create GIN/HNSW indexes, optimize query |
| Connection refused | PostgreSQL not running | Start PostgreSQL service, check connection string |

---

## 6. Performance Benchmarks (Target)

| Operation | Target | Acceptable | Problem |
|-----------|--------|-----------|---------|
| Payment Init | < 500ms | < 1s | > 2s ❌ |
| Payment Verify | < 300ms | < 1s | > 2s ❌ |
| Email Send | < 100ms | < 500ms | > 1s ❌ |
| SMS Send | < 200ms | < 1s | > 2s ❌ |
| File Upload (1MB) | < 2s | < 5s | > 10s ❌ |
| File Download | < 1s | < 2s | > 5s ❌ |
| Fuzzy Search | < 100ms | < 500ms | > 1s ❌ |
| Vector Search | < 200ms | < 500ms | > 1s ❌ |
| Hybrid Search | < 300ms | < 1s | > 2s ❌ |
| AI Generate | < 5s | < 10s | > 30s ❌ |

---

## 7. Monthly Cost Estimation

### NGN Costs
```
Paystack Fees (10k tx @ ₦100.50)  ₦1,005,000  (96%)
Kudisms SMS (1k/mo @ ₦7)          ₦    7,000  (0.7%)
PostgreSQL (self-hosted)          ₦    5,000  (0.5%)
R2 Storage (100GB)                ₦   14,500  (1.4%)
Email (Plunk free tier)           ₦        0  (0%)
Monitoring/Logging                ₦   15,000  (1.4%)
────────────────────────────────────────────
TOTAL MONTHLY                     ₦1,049,500
```

### ROI Example
```
10,000 ticket sales @ ₦5,000 each:
- Gross Revenue:        ₦50,000,000
- Paystack Fees (1.5%): (₦750,000)
- Infrastructure:       (₦1,049,500)
- NET PROFIT:           ₦48,200,500
- PROFIT MARGIN:        96.4% ✓
```

---

## 8. Implementation Priority

```
WEEK 1 (Foundation - Do First!)
├─ Paystack Payment       1 day   🔴 CRITICAL - Enables revenue
├─ R2 File Storage        1.5 day 🔴 CRITICAL - Core infrastructure
├─ Plunk Email            1 day   🔴 CRITICAL - User notifications
└─ Integration Testing    1 day   ✓ Complete flow

WEEK 2 (Notifications & Database)
├─ Kudisms SMS            1 day   🟡 HIGH - Multi-channel alerts
├─ PostgreSQL Setup       1.5 day 🟡 HIGH - Data foundation
└─ Search Indexing        1.5 day 🟡 HIGH - Discovery feature

WEEK 3 (Advanced Search)
├─ pgvector Setup         1.5 day 🟡 MEDIUM - Semantic search
├─ pg_trgm Setup          1 day   🟡 MEDIUM - Fuzzy search
└─ Hybrid Search (RRF)    1 day   🟡 MEDIUM - Combined ranking

WEEK 4 (AI & Optimization)
├─ Gemini AI              1.5 day 🟢 OPTIONAL - Content generation
└─ Performance Tuning     1.5 day ✓ Polish

WEEK 5 (Social - Optional)
├─ Facebook/Twitter/etc   2-3 day 🟢 OPTIONAL - Marketing reach
└─ Deployment Prep        2 day   ✓ Ready
```

---

## 9. Security Checklist

### API Keys & Credentials
- [ ] All API keys in .env file only
- [ ] .env added to .gitignore
- [ ] Never log API keys or tokens
- [ ] Rotate keys every 6 months
- [ ] Use separate keys for dev/staging/prod

### Data Protection
- [ ] HTTPS/TLS enabled for all communications
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize outputs)
- [ ] CSRF tokens on forms
- [ ] Rate limiting on public endpoints

### Webhook Security
- [ ] Verify Paystack webhook signatures
- [ ] Use HTTPS for all webhooks
- [ ] Validate webhook origin
- [ ] Implement request timeout (30 sec)
- [ ] Add webhook signature logging

### PCI Compliance (Paystack)
- [ ] Never store raw card numbers
- [ ] Use authorization codes for recurring
- [ ] Log all transactions with timestamps
- [ ] Implement audit trail
- [ ] Encrypt sensitive data at rest

### Database Security
- [ ] Strong PostgreSQL password
- [ ] Restrict database access by IP
- [ ] Enable SSL connections
- [ ] Daily automated backups
- [ ] Test backup restoration monthly

---

## 10. Useful Commands

### PostgreSQL
```bash
# Connect to database
psql postgresql://user:pass@localhost:5432/mssn

# Install extensions
CREATE EXTENSION pg_trgm;
CREATE EXTENSION vector;

# List tables
\dt

# View table structure
\d documents

# Run explain plan
EXPLAIN ANALYZE SELECT * FROM documents WHERE content % 'query';

# Backup database
pg_dump mssn > backup.sql

# Restore database
psql mssn < backup.sql
```

### R2 (AWS CLI)
```bash
# Configure R2 credentials
aws configure --profile r2

# List files in bucket
aws s3 ls s3://mssn-files/ \
  --endpoint-url https://$ACCOUNT_ID.r2.cloudflarestorage.com

# Upload file
aws s3 cp myfile.pdf s3://mssn-files/ \
  --endpoint-url https://$ACCOUNT_ID.r2.cloudflarestorage.com

# Generate presigned download URL (1 hour)
aws s3 presign s3://mssn-files/myfile.pdf \
  --endpoint-url https://$ACCOUNT_ID.r2.cloudflarestorage.com \
  --expires-in 3600
```

### Node.js Testing
```bash
# Test API endpoint
curl -X GET http://localhost:3000/api/v1/events \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Paystack webhook locally (use ngrok)
ngrok http 3000
# Then set webhook URL in Paystack dashboard

# View logs
npm run logs

# Run tests
npm test

# Load test with autocannon
npx autocannon http://localhost:3000 -c 100 -d 10
```

---

## 11. Monitoring & Alerts

### Key Metrics to Track
```
Payment Metrics:
├─ Success rate: Target > 95%
├─ Average processing time: Target < 500ms
├─ Daily transaction volume
└─ Revenue tracking

Email Metrics:
├─ Delivery rate: Target > 98%
├─ Bounce rate: Target < 0.5%
├─ Open rate: Track for engagement
└─ Click-through rate

SMS Metrics:
├─ Delivery rate: Target > 95%
├─ Cost per SMS
├─ Success by provider
└─ Phone number validity

Search Metrics:
├─ Query latency (p95): Target < 500ms
├─ Search volume daily
├─ Relevance scores
└─ Cache hit rate

API Metrics:
├─ Response time (p95): Target < 200ms
├─ Error rate: Target < 0.1%
├─ Request volume
└─ Uptime: Target > 99.9%

Database Metrics:
├─ CPU usage: Alert if > 80%
├─ Memory usage: Alert if > 85%
├─ Storage usage: Alert if > 80%
├─ Connection count
└─ Query performance
```

### Alert Thresholds
- Payment failure rate > 5% → ALERT 🚨
- Email delivery rate < 90% → ALERT 🚨
- SMS delivery rate < 85% → ALERT 🚨
- API response time > 2 seconds (p95) → ALERT 🚨
- Database CPU > 80% → ALERT 🚨
- Storage usage > 85% of capacity → WARNING ⚠️
- Uptime < 99.5% → CRITICAL 🚨

---

## 12. Troubleshooting Quick Guide

### "Payment is not working"
1. ✓ Check PAYSTACK_SECRET_KEY in .env
2. ✓ Verify you're in test or live mode (key prefix: `sk_test_` vs `sk_live_`)
3. ✓ Check Paystack dashboard for error messages
4. ✓ Verify webhook URL is correct
5. ✓ Test with Paystack test card: 4084084084084081

### "Files not uploading to R2"
1. ✓ Verify CLOUDFLARE_ACCOUNT_ID is correct
2. ✓ Check CLOUDFLARE_ACCESS_KEY_ID and SECRET
3. ✓ Ensure bucket name matches CLOUDFLARE_BUCKET_NAME
4. ✓ Check file size (max 5TB)
5. ✓ Verify CORS settings if using presigned URLs

### "Emails not sending"
1. ✓ Verify PLUNK_FROM_EMAIL is confirmed in Plunk settings
2. ✓ Check recipient email format
3. ✓ Review HTML for malformed tags
4. ✓ Check rate limit (100 emails/second max)
5. ✓ Verify PLUNK_API_KEY is correct

### "SMS not delivering"
1. ✓ Verify phone format: 234XXXXXXXXXX (no + or 0)
2. ✓ Check Kudisms account balance
3. ✓ Ensure message < 160 characters
4. ✓ Verify KUDISMS_SENDER_ID is registered
5. ✓ Check rate limit (100 SMS/minute)

### "Search is slow"
1. ✓ Check indexes exist: `\d documents` in psql
2. ✓ Analyze query: `EXPLAIN ANALYZE SELECT...`
3. ✓ Rebuild indexes if corrupted: `REINDEX TABLE documents;`
4. ✓ Increase PostgreSQL work_mem if available
5. ✓ Consider partitioning tables if > 10M rows

---

**Last Updated:** December 30, 2025  
**Status:** Production Ready ✓
