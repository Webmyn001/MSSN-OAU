# MSSN Website - External Service Integration Workflows
## Complete Implementation Guide for Node.js/TypeScript

**Last Updated:** December 30, 2025 | **Status:** Production Ready

---

## Table of Contents
1. Paystack Payment Gateway
2. Cloudflare R2 Object Storage  
3. Plunk Email API
4. Kudisms SMS Service
5. PostgreSQL Hybrid Search (pg_trgm + pgvector)
6. Google Gemini AI API
7. Social Media APIs (Quick Reference)

---

# 1. PAYSTACK PAYMENT GATEWAY

## 1.1 Authentication & Setup

**Getting API Keys:**
1. Sign up at paystack.com
2. Go to Settings → API Keys and Webhook
3. Copy Secret Key and Public Key

**Store in .env:**
```env
PAYSTACK_SECRET_KEY=sk_live_xxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxx
```

## 1.2 Complete Payment Service

```typescript
import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// ============================================
// 1. INITIALIZE PAYMENT
// ============================================
async function initializePayment(
  email: string,
  amount: number, // in naira
  metadata: Record<string, any>
): Promise<{ authorizationUrl: string; reference: string }> {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Convert to kobo
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    return {
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    };
  } catch (error: any) {
    console.error('Payment init failed:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 2. VERIFY PAYMENT
// ============================================
async function verifyPayment(reference: string): Promise<{
  status: string;
  amount: number;
  customer: any;
  metadata: any;
}> {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (!response.data.status) {
      throw new Error(`Verification failed: ${response.data.message}`);
    }

    const data = response.data.data;
    return {
      status: data.status,
      amount: data.amount / 100,
      customer: data.customer,
      metadata: data.metadata,
    };
  } catch (error: any) {
    console.error('Verification failed:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 3. VERIFY WEBHOOK SIGNATURE
// ============================================
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

// ============================================
// 4. HANDLE WEBHOOK
// ============================================
async function handlePaymentWebhook(req: any, res: any): Promise<void> {
  const signature = req.headers['x-paystack-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature)) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference, amount, metadata } = event.data;
    console.log(`✓ Payment successful: ${reference} - ₦${amount / 100}`);

    // Update database, send email, etc.
    // await db.payment.update(reference, { status: 'success' });
    // await sendTicketEmail(metadata);

    return res.json({ success: true });
  }

  res.json({ received: true });
}

export {
  initializePayment,
  verifyPayment,
  verifyWebhookSignature,
  handlePaymentWebhook,
};
```

**Express.js Routes:**
```typescript
import express, { Request, Response } from 'express';
import {
  initializePayment,
  verifyPayment,
  handlePaymentWebhook,
} from './paystack';

const router = express.Router();

router.post('/initialize', async (req: Request, res: Response) => {
  try {
    const { email, amount, ticketId, eventId } = req.body;

    const { authorizationUrl, reference } = await initializePayment(
      email,
      amount,
      { ticket_id: ticketId, event_id: eventId }
    );

    res.json({ success: true, authorizationUrl, reference });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/verify/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const paymentData = await verifyPayment(reference);

    res.json({ success: true, data: paymentData });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  await handlePaymentWebhook(req, res);
});

export default router;
```

---

# 2. CLOUDFLARE R2 OBJECT STORAGE

## 2.1 Setup

**Get Credentials:**
1. Go to Cloudflare Dashboard → R2 → Create Bucket
2. Create API token in R2 settings

**.env:**
```env
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_ACCESS_KEY_ID=xxxxx
CLOUDFLARE_SECRET_ACCESS_KEY=xxxxx
CLOUDFLARE_BUCKET_NAME=mssn-files
```

## 2.2 Complete Storage Service

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

// ============================================
// UPLOAD FILE
// ============================================
async function uploadFile(
  bucketName: string,
  key: string,
  fileBuffer: Buffer,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    console.log(`✓ File uploaded: ${key}`);
    
    return key;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// ============================================
// GENERATE DOWNLOAD URL (Presigned)
// ============================================
async function generateDownloadUrl(
  bucketName: string,
  key: string,
  expirationSeconds: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds,
    });

    return url;
  } catch (error) {
    console.error('URL generation failed:', error);
    throw error;
  }
}

// ============================================
// GENERATE UPLOAD URL (For Client-Side Upload)
// ============================================
async function generateUploadUrl(
  bucketName: string,
  key: string,
  contentType: string = 'application/octet-stream',
  expirationSeconds: number = 1800
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds,
    });

    return url;
  } catch (error) {
    console.error('Upload URL generation failed:', error);
    throw error;
  }
}

// ============================================
// DELETE FILE
// ============================================
async function deleteFile(bucketName: string, key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`✓ File deleted: ${key}`);
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}

export {
  uploadFile,
  generateDownloadUrl,
  generateUploadUrl,
  deleteFile,
};
```

**Express Routes:**
```typescript
router.post('/api/files/upload-url', async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    const userId = req.user?.id;

    const key = `uploads/${userId}/${Date.now()}-${filename}`;
    const uploadUrl = await generateUploadUrl(
      process.env.CLOUDFLARE_BUCKET_NAME!,
      key,
      contentType,
      1800
    );

    res.json({ success: true, uploadUrl, key });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/api/files/:fileKey/download-url', async (req, res) => {
  try {
    const { fileKey } = req.params;
    const hours = parseInt(req.query.hours as string) || 1;

    const downloadUrl = await generateDownloadUrl(
      process.env.CLOUDFLARE_BUCKET_NAME!,
      fileKey,
      hours * 3600
    );

    res.json({ success: true, downloadUrl, expiresIn: hours * 3600 });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

# 3. PLUNK EMAIL API

## 3.1 Setup

**Get API Key:**
1. Sign up at useplunk.com
2. Go to Settings → API Keys
3. Verify a sender email

**.env:**
```env
PLUNK_API_KEY=sk_xxxxx
PLUNK_FROM_EMAIL=noreply@mssn.org
```

## 3.2 Email Service with Templates

```typescript
import Plunk from '@plunk/node';
import { render } from '@react-email/render';

const plunk = new Plunk(process.env.PLUNK_API_KEY!);

// React Email Template Example
import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

const TicketConfirmationEmail = ({
  userName,
  ticketId,
  eventName,
}: {
  userName: string;
  ticketId: string;
  eventName: string;
}) => (
  <Html>
    <Head>
      <title>Ticket Confirmation - {eventName}</title>
    </Head>
    <Body style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Section style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
          <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>
            ✓ Ticket Confirmed
          </Text>

          <Text>Hello {userName},</Text>

          <Text>
            Thank you for purchasing a ticket to <strong>{eventName}</strong>!
          </Text>

          <Section
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              margin: '20px 0',
            }}
          >
            <Text>
              <strong>Ticket ID:</strong> {ticketId}
            </Text>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              Save this ID for check-in
            </Text>
          </Section>

          <Button
            href={`${process.env.APP_URL}/tickets/${ticketId}`}
            style={{
              backgroundColor: '#2E7D32',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '4px',
              textDecoration: 'none',
            }}
          >
            View Ticket
          </Button>
        </Section>
      </Container>
    </Body>
  </Html>
);

// ============================================
// SEND TICKET CONFIRMATION
// ============================================
async function sendTicketConfirmation(
  email: string,
  data: {
    userName: string;
    ticketId: string;
    eventName: string;
  }
): Promise<boolean> {
  try {
    const emailHtml = await render(
      <TicketConfirmationEmail
        userName={data.userName}
        ticketId={data.ticketId}
        eventName={data.eventName}
      />
    );

    const success = await plunk.emails.send({
      to: email,
      subject: `Your Ticket Confirmation - ${data.eventName}`,
      body: emailHtml,
      type: 'html',
      from: process.env.PLUNK_FROM_EMAIL!,
      name: 'MSSN Events',
    });

    console.log(`✓ Confirmation email sent to ${email}`);
    return !!success;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}

// ============================================
// SEND PAYMENT CONFIRMATION
// ============================================
async function sendPaymentConfirmation(
  email: string,
  data: {
    userName: string;
    amount: number;
    reference: string;
    description: string;
  }
): Promise<boolean> {
  try {
    const htmlBody = `
      <h2>Payment Received ✓</h2>
      <p>Hi ${data.userName},</p>
      <p>Your payment has been processed successfully.</p>
      <table style="width:100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px;"><strong>Description:</strong></td>
          <td style="padding: 10px;">${data.description}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px;"><strong>Amount:</strong></td>
          <td style="padding: 10px;">₦${data.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px;"><strong>Reference:</strong></td>
          <td style="padding: 10px;"><code>${data.reference}</code></td>
        </tr>
      </table>
      <p style="color: #666; margin-top: 20px;">Thank you for your support!</p>
    `;

    const success = await plunk.emails.send({
      to: email,
      subject: 'Payment Confirmation - MSSN',
      body: htmlBody,
      type: 'html',
      from: process.env.PLUNK_FROM_EMAIL!,
      name: 'MSSN Payments',
    });

    return !!success;
  } catch (error) {
    console.error('Payment email failed:', error);
    throw error;
  }
}

export {
  sendTicketConfirmation,
  sendPaymentConfirmation,
};
```

---

# 4. KUDISMS SMS SERVICE

## 4.1 Setup

**.env:**
```env
KUDISMS_API_TOKEN=your_token_here
KUDISMS_SENDER_ID=MSSN
```

## 4.2 SMS Service

```typescript
import axios from 'axios';
import pQueue from 'p-queue';

const KUDISMS_BASE_URL = 'https://api.kudisms.net/api/v1';
const KUDISMS_TOKEN = process.env.KUDISMS_API_TOKEN;
const KUDISMS_SENDER_ID = process.env.KUDISMS_SENDER_ID || 'MSSN';

// Rate limiter: 100 requests/minute
const smsQueue = new pQueue({ interval: 60000, intervalCap: 100 });

// ============================================
// SEND SMS
// ============================================
async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<{ messageId: string; cost: number }> {
  try {
    return await smsQueue.add(async () => {
      const response = await axios.post(
        `${KUDISMS_BASE_URL}/send`,
        new URLSearchParams({
          token: KUDISMS_TOKEN!,
          sender_id: KUDISMS_SENDER_ID,
          message,
          recipients: phoneNumber,
          message_type: 'plain',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.status !== 201) {
        throw new Error(`SMS failed: ${response.data.message}`);
      }

      return {
        messageId: response.data.data.message_id,
        cost: response.data.data.cost,
      };
    });
  } catch (error: any) {
    console.error('SMS send failed:', error.message);
    throw error;
  }
}

// ============================================
// SEND PERSONALIZED SMS (with variables)
// ============================================
async function sendPersonalizedSMS(
  phoneNumber: string,
  template: string,
  variables: Record<string, string | number>
): Promise<{ messageId: string; cost: number }> {
  let message = template;

  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });

  return sendSMS(phoneNumber, message);
}

// ============================================
// SEND PAYMENT CONFIRMATION SMS
// ============================================
async function sendPaymentConfirmationSMS(
  phoneNumber: string,
  data: {
    name: string;
    amount: number;
    reference: string;
  }
): Promise<{ messageId: string }> {
  const message = `
Hi ${data.name}, your payment of ₦${data.amount.toLocaleString()} was successful. Ref: ${data.reference}. Thank you! - MSSN
  `.trim();

  const result = await sendSMS(phoneNumber, message);
  return { messageId: result.messageId };
}

// ============================================
// SEND EVENT REMINDER SMS
// ============================================
async function sendEventReminderSMS(
  phoneNumber: string,
  data: {
    name: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
  }
): Promise<{ messageId: string }> {
  const message = `
Hi ${data.name}, reminder: ${data.eventName} is on ${data.eventDate} at ${data.eventTime}. See you there! - MSSN
  `.trim();

  const result = await sendSMS(phoneNumber, message);
  return { messageId: result.messageId };
}

export {
  sendSMS,
  sendPersonalizedSMS,
  sendPaymentConfirmationSMS,
  sendEventReminderSMS,
};
```

---

# 5. POSTGRESQL HYBRID SEARCH

## 5.1 Setup PostgreSQL Extensions

```sql
-- Install extensions (as superuser)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_documents_content_trgm ON documents USING GIN(content gin_trgm_ops);
CREATE INDEX idx_documents_embedding_hnsw ON documents USING HNSW(embedding vector_cosine_ops);
```

## 5.2 Hybrid Search Service

```typescript
import { Client } from 'pg';
import OpenAI from 'openai';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// FUZZY TEXT SEARCH (pg_trgm)
// ============================================
async function fuzzyTextSearch(
  query: string,
  limit: number = 10
): Promise<
  Array<{ id: number; title: string; similarity: number }>
> {
  const result = await client.query(
    `
    SELECT
      id,
      title,
      word_similarity(content, $1) AS similarity
    FROM documents
    WHERE content % $1
    ORDER BY similarity DESC
    LIMIT $2
    `,
    [query, limit]
  );

  return result.rows;
}

// ============================================
// VECTOR SEMANTIC SEARCH (pgvector)
// ============================================
async function vectorSearch(
  embedding: number[],
  limit: number = 10
): Promise<
  Array<{ id: number; title: string; similarity: number }>
> {
  const result = await client.query(
    `
    SELECT
      id,
      title,
      1 - (embedding <=> $1::vector) AS similarity
    FROM documents
    WHERE 1 - (embedding <=> $1::vector) > 0.3
    ORDER BY similarity DESC
    LIMIT $2
    `,
    [JSON.stringify(embedding), limit]
  );

  return result.rows;
}

// ============================================
// HYBRID SEARCH WITH RRF (Reciprocal Rank Fusion)
// ============================================
async function hybridSearch(
  query: string,
  embedding: number[],
  limit: number = 10
): Promise<
  Array<{
    id: number;
    title: string;
    score: number;
  }>
> {
  const result = await client.query(
    `
    WITH text_search AS (
      SELECT
        id,
        title,
        word_similarity(content, $1) as text_score,
        ROW_NUMBER() OVER (ORDER BY word_similarity(content, $1) DESC) as text_rank
      FROM documents
      WHERE content % $1
      LIMIT 50
    ),
    vector_search AS (
      SELECT
        id,
        title,
        1 - (embedding <=> $2::vector) as vector_score,
        ROW_NUMBER() OVER (ORDER BY 1 - (embedding <=> $2::vector) DESC) as vector_rank
      FROM documents
      WHERE 1 - (embedding <=> $2::vector) > 0.3
      LIMIT 50
    ),
    combined AS (
      SELECT
        COALESCE(t.id, v.id) as id,
        COALESCE(t.title, v.title) as title,
        COALESCE(t.text_score, 0) as text_score,
        COALESCE(v.vector_score, 0) as vector_score,
        (
          COALESCE(1.0 / (60 + t.text_rank), 0) +
          COALESCE(1.0 / (60 + v.vector_rank), 0)
        ) as rrf_score
      FROM text_search t
      FULL OUTER JOIN vector_search v ON t.id = v.id
    )
    SELECT id, title, rrf_score as score
    FROM combined
    ORDER BY score DESC
    LIMIT $3
    `,
    [query, JSON.stringify(embedding), limit]
  );

  return result.rows;
}

// ============================================
// GENERATE & STORE EMBEDDINGS
// ============================================
async function generateAndStoreEmbedding(
  documentId: number,
  text: string
): Promise<void> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 30000),
    });

    const embedding = response.data[0].embedding;

    await client.query(
      'UPDATE documents SET embedding = $1 WHERE id = $2',
      [JSON.stringify(embedding), documentId]
    );

    console.log(`✓ Embedding generated for document ${documentId}`);
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
}

export {
  fuzzyTextSearch,
  vectorSearch,
  hybridSearch,
  generateAndStoreEmbedding,
};
```

---

# 6. GOOGLE GEMINI AI API

## 6.1 Setup

**.env:**
```env
GOOGLE_GEMINI_API_KEY=AIzaSyD...
```

## 6.2 AI Service

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// ============================================
// GENERATE BLOG SUGGESTION
// ============================================
async function generateBlogSuggestion(
  topic: string,
  tone: 'formal' | 'casual' | 'technical' = 'technical'
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are a professional blog writer for MSSN (Muslim Students Society of Nigeria).
Write a brief blog post outline (3-5 bullet points) about: ${topic}

Tone: ${tone}
Target audience: Young Nigerian Muslim professionals and students

Keep it concise and engaging.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ============================================
// GET CONTENT EDITING SUGGESTIONS
// ============================================
async function getContentEdits(
  originalText: string
): Promise<{
  suggestions: string[];
  improvedVersion: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Review this MSSN blog post for clarity, grammar, and engagement:

"${originalText}"

Provide:
1. 3-5 specific suggestions for improvement
2. A revised version

Format as JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2"],
  "improvedVersion": "full revised text"
}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse response');

  return JSON.parse(jsonMatch[0]);
}

export {
  generateBlogSuggestion,
  getContentEdits,
};
```

---

# 7. SOCIAL MEDIA APIs (Quick Reference)

## Facebook Graph API
```typescript
async function postToFacebook(
  pageId: string,
  accessToken: string,
  message: string,
  imageUrl?: string
): Promise<{ postId: string }> {
  const url = `https://graph.facebook.com/v20.0/${pageId}/feed`;

  const payload: any = {
    message,
    access_token: accessToken,
  };

  if (imageUrl) {
    payload.link = imageUrl;
  }

  const response = await axios.post(url, payload);
  return { postId: response.data.id };
}
```

## Twitter API v2
```typescript
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

async function postToTwitter(
  text: string,
  mediaIds?: string[]
): Promise<{ tweetId: string }> {
  const rwClient = client.readWrite;

  const payload: any = { text };
  if (mediaIds?.length) {
    payload.media = { media_ids: mediaIds };
  }

  const response = await rwClient.v2.tweet(payload);
  return { tweetId: response.data.id };
}
```

## Instagram Graph API
```typescript
async function postToInstagram(
  instagramAccountId: string,
  imageUrl: string,
  caption: string,
  accessToken: string
): Promise<{ mediaId: string }> {
  const url = `https://graph.instagram.com/v20.0/${instagramAccountId}/media`;

  const response = await axios.post(url, {
    image_url: imageUrl,
    caption,
    media_type: 'IMAGE',
    access_token: accessToken,
  });

  return { mediaId: response.data.id };
}
```

## LinkedIn API
```typescript
async function postToLinkedIn(
  organizationUrn: string,
  accessToken: string,
  text: string
): Promise<{ postId: string }> {
  const url = 'https://api.linkedin.com/v2/ugcPosts';

  const payload = {
    author: organizationUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const response = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return { postId: response.data.id };
}
```

---

## Implementation Checklist

**Phase 1 (Weeks 1-2):**
- [ ] Paystack payment integration
- [ ] R2 file storage setup
- [ ] Plunk email configuration
- [ ] Test payment → email → file flow

**Phase 2 (Weeks 2-3):**
- [ ] Kudisms SMS integration
- [ ] PostgreSQL setup
- [ ] Search indexing

**Phase 3 (Weeks 3-4):**
- [ ] Vector embeddings
- [ ] Hybrid search implementation
- [ ] Gemini AI integration

**Production Ready:**
- [ ] All error handling tested
- [ ] Security review completed
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Load testing passed

---

**Last Updated:** December 30, 2025 | **Status:** Production Ready ✓
