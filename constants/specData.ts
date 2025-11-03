
export const executiveSummary = {
  title: "Executive Summary",
  content: `SubManage is a comprehensive SaaS dashboard designed for IPTV operators to efficiently manage their subscriber base. The platform centralizes customer records, subscription lifecycle management, and renewal communications to streamline operations and reduce churn. The core user personas are the **Admin**, who oversees the entire system, manages settings, and views high-level analytics, and the **Support Agent**, who handles day-to-day subscriber creation, updates, and communication. Key success metrics for SubManage are increasing Monthly Recurring Revenue (MRR) through better retention, minimizing Churn Rate by automating renewal reminders, and growing the number of Active Subscriptions.`
};

export const prioritizedFeatures = {
  title: "Prioritized Feature List",
  categories: [
    {
      name: "Core Subscriber Management",
      features: [
        { name: "Create/Read/Update/Delete (CRUD) Subscribers", rationale: "The absolute core of the application.", priority: "MUST", complexity: "M" },
        { name: "Subscriber List with Search & Filtering", rationale: "Essential for finding and managing subscribers.", priority: "MUST", complexity: "M" },
        { name: "Subscription Status Automation", rationale: "Automatically update status based on end date (active, expiring, expired).", priority: "MUST", complexity: "S" },
        { name: "Bulk CSV Import", rationale: "Critical for migrating existing users and onboarding large batches.", priority: "SHOULD", complexity: "M" },
      ],
    },
    {
        name: "Communications",
        features: [
            { name: "Manual 1-Click SMS/WhatsApp Sending", rationale: "Allows for quick, direct communication with subscribers.", priority: "MUST", complexity: "M" },
            { name: "Automated Renewal Reminders (SMS/WhatsApp)", rationale: "Key feature to reduce churn and automate renewals.", priority: "SHOULD", complexity: "L" },
            { name: "Communication History Log per Subscriber", rationale: "Provides context for all interactions.", priority: "MUST", complexity: "S" },
            { name: "Customizable Message Templates", rationale: "Allows operators to personalize their outreach.", priority: "SHOULD", complexity: "M" },
            { name: "Batch Messaging", rationale: "Send promotions or announcements to filtered groups.", priority: "NICE-TO-HAVE", complexity: "L" },
        ],
    },
    {
        name: "Billing & Payments",
        features: [
            { name: "Log Manual Payments", rationale: "Track payments made outside of an integrated processor.", priority: "MUST", complexity: "S" },
            { name: "Payment Gateway Integration (Stripe)", rationale: "Automates payment collection and subscription renewals.", priority: "SHOULD", complexity: "L" },
            { name: "Payment History per Subscriber", rationale: "Complete financial record for each customer.", priority: "SHOULD", complexity: "M" },
        ],
    },
    {
        name: "Reporting & Analytics",
        features: [
            { name: "Dashboard with Key Metrics & Charts", rationale: "Provides a high-level overview of business health.", priority: "MUST", complexity: "M" },
            { name: "Export Subscriber List (CSV)", rationale: "For external analysis or backup.", priority: "SHOULD", complexity: "S" },
            { name: "Detailed Subscriber Reports", rationale: "Generate reports on subscription trends.", priority: "NICE-TO-HAVE", complexity: "L" },
        ],
    },
    {
        name: "Admin & Security",
        features: [
            { name: "User Authentication (Login/Logout)", rationale: "Secures access to the dashboard.", priority: "MUST", complexity: "M" },
            { name: "Role-Based Access Control (RBAC) - Admin, Support", rationale: "Ensures users only see and do what they're allowed to.", priority: "SHOULD", complexity: "L" },
            { name: "Audit Logs", rationale: "Tracks important changes for security and accountability.", priority: "NICE-TO-HAVE", complexity: "L" },
            { name: "Settings Management (Timezone, API Keys)", rationale: "Allows configuration of the application.", priority: "MUST", complexity: "M" },
        ],
    }
  ]
};

export const mvpDefinition = {
    title: "MVP Definition",
    content: "The Minimum Viable Product (MVP) focuses on empowering a single operator to manually manage their subscriber list and perform essential renewal communications. It prioritizes core CRUD functionality, status visualization, and direct SMS engagement, laying the foundation for future automation and integration.",
    acceptanceCriteria: [
        "Admins can log in securely.",
        "Admins can create a new subscriber record with full name, email, phone, and plan.",
        "The system correctly calculates and sets the `end_date` based on the `start_date` and `plan` duration.",
        "The subscriber list displays all subscribers and can be searched by name or email.",
        "Subscriber status is visually distinct (e.g., color-coded) for 'Active', 'Expiring <7d', and 'Expired'.",
        "Admins can edit or delete an existing subscriber.",
        "From a subscriber's detail view, an admin can click a button to trigger a pre-templated SMS renewal reminder.",
        "A basic dashboard shows counts of Active, Expiring, and Expired subscribers.",
        "The settings page allows the admin to configure their Twilio API credentials.",
    ],
    userStories: [
        { story: "As an Admin, I can add a new subscriber so I can start tracking their subscription.", complexity: "S" },
        { story: "As an Admin, I can see a list of all my subscribers so I can get an overview of my customer base.", complexity: "M" },
        { story: "As an Admin, I want the list to clearly show who is about to expire so I can contact them.", complexity: "S" },
        { story: "As an Admin, I can send a renewal SMS to a specific user with one click to save time.", complexity: "M" },
        { story: "As an Admin, I can update a subscriber's plan when they renew.", complexity: "S" },
    ]
};

export const dataModel = {
  title: "Data Model (Prisma Schema Example)",
  schema: `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(SUPPORT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  createdSubscriptions Subscriber[] @relation("CreatedBy")
  auditLogs            AuditLog[]
}

enum Role {
  ADMIN
  MANAGER
  SUPPORT
}

model Subscriber {
  id          String   @id @default(cuid())
  fullName    String
  email       String   @unique
  phoneNumber String   // E.164 format
  plan        Plan
  startDate   DateTime
  endDate     DateTime
  status      SubscriberStatus
  notes       String?
  
  createdBy   User     @relation("CreatedBy", fields: [createdById], references: [id])
  createdById String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  payments       Payment[]
  communications Communication[]
  auditLogs      AuditLog[]

  @@index([endDate])
  @@index([status])
}

enum Plan {
  ONE_MONTH
  THREE_MONTHS
  SIX_MONTHS
  ONE_YEAR
}

enum SubscriberStatus {
  ACTIVE
  EXPIRING
  EXPIRED
  CANCELLED
  TRIAL
}

model Payment {
  id            String   @id @default(cuid())
  transactionId String?  @unique
  amount        Float
  currency      String
  paidAt        DateTime
  method        String
  
  subscriber    Subscriber @relation(fields: [subscriberId], references: [id])
  subscriberId  String

  createdAt DateTime @default(now())
}

model Communication {
  id        String   @id @default(cuid())
  timestamp DateTime
  channel   String   // 'SMS', 'Email', 'Call'
  message   String
  status    String   // 'sent', 'delivered', 'failed'
  
  subscriber   Subscriber @relation(fields: [subscriberId], references: [id])
  subscriberId String
  
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  action    String
  details   Json
  
  user         User       @relation(fields: [userId], references: [id])
  userId       String
  subscriber   Subscriber? @relation(fields: [subscriberId], references: [id])
  subscriberId String?
}
  `,
};

export const apiSpecification = {
    title: "REST API Specification",
    intro: "This API allows you to manage all aspects of your SubManage dashboard programmatically. You can use these endpoints to connect your website's checkout process directly to the dashboard. When a user purchases a subscription, your website backend can call the `POST /api/v1/subscribers` endpoint to automatically create a new subscriber record, eliminating manual data entry.",
    endpoints: [
        {
            method: "GET",
            path: "/api/v1/subscribers",
            description: "Retrieve a paginated list of subscribers with filtering and sorting.",
            queryParams: [
                { param: "page", desc: "Page number for pagination (default: 1)" },
                { param: "limit", desc: "Number of items per page (default: 25)" },
                { param: "status", desc: "Filter by status (active, expiring, etc.)" },
                { param: "search", desc: "Search by name, email, or phone number" },
                { param: "sortBy", desc: "Field to sort by (e.g., 'endDate')" },
                { param: "sortOrder", desc: "Sort order ('asc' or 'desc')" },
            ],
            response: `
{
  "data": [
    {
      "id": "sub_1",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "plan": "12m",
      "endDate": "2025-11-20T10:00:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 250
  }
}`
        },
        {
            method: "POST",
            path: "/api/v1/subscribers",
            description: "Create a new subscriber. This is the endpoint your website should call after a successful purchase.",
            request: `
{
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "+12025550139",
  "plan": "3m",
  "startDate": "2024-12-01T10:00:00Z",
  "notes": "VIP customer. Onboarded via website."
}`
        },
        {
            method: "GET",
            path: "/api/v1/subscribers/{id}",
            description: "Retrieve a single subscriber's details.",
            response: `
{
  "id": "sub_1",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+442071234567",
  "plan": "12m",
  "startDate": "2024-11-20T10:00:00Z",
  "endDate": "2025-11-20T10:00:00Z",
  "status": "active",
  "notes": "Long-time customer.",
  "communications": [
    { "id": "comm_1", "timestamp": "2024-11-15T14:30:00Z", "channel": "SMS", "message": "Your subscription is renewing soon!", "status": "delivered" }
  ],
  "payments": [
      { "id": "pay_1", "transactionId": "txn_abc123", "amount": 99.99, "currency": "USD", "paidAt": "2024-11-20T10:00:00Z", "method": "Credit Card" }
  ]
}`
        },
        {
            method: "PUT",
            path: "/api/v1/subscribers/{id}",
            description: "Update a subscriber's details (e.g., extend subscription).",
            request: `
{
  "plan": "12m",
  "notes": "Updated to annual plan."
}`
        },
        {
            method: "POST",
            path: "/api/v1/subscribers/{id}/send-message",
            description: "Send a one-off message to a subscriber.",
            request: `
{
  "channel": "WhatsApp",
  "templateId": "renewal_reminder_gentle",
  "messageOverride": "Hi John, a friendly reminder that your IPTV service will renew in 7 days."
}`
        },
        {
            method: "GET",
            path: "/api/v1/metrics",
            description: "Get key dashboard metrics.",
            response: `
{
  "mrr": 4567.50,
  "activeSubscribers": 250,
  "expiringSoon": 35,
  "expired": 12
}`
        }
    ]
};

export const integrations = {
    title: "Integrations & Vendor Recommendations",
    sections: [
        {
            name: "SMS & WhatsApp API Providers",
            vendors: [
                { name: "Twilio", pros: "Industry leader, excellent reliability, extensive APIs for SMS, Voice, and WhatsApp.", cons: "Premium pricing, can be complex for simple use cases.", fit: "Best for businesses that need high reliability and a wide range of features across multiple channels." },
                { name: "Vonage (formerly Nexmo)", pros: "Competitive pricing for SMS & WhatsApp, strong global network, good for international focus.", cons: "API can be less intuitive than Twilio.", fit: "A strong Twilio alternative for global messaging, including WhatsApp." },
                { name: "MessageBird", pros: "Omnichannel support (SMS, WhatsApp, etc.), often cheaper for certain regions, unified conversations API.", cons: "Lesser-known, smaller developer community.", fit: "Good for businesses focusing on multiple communication channels and wanting a single integration point." },
                { name: "360dialog", pros: "Official WhatsApp Business Solution Provider (BSP), often the most cost-effective for pure WhatsApp messaging as they charge a flat monthly fee per number.", cons: "Focused solely on WhatsApp, requires separate providers for SMS/Voice.", fit: "Excellent for businesses that will use WhatsApp as their primary communication channel and want predictable pricing." },
            ]
        },
        {
            name: "Payment Processors",
            vendors: [
                { name: "Stripe", pros: "Developer-friendly APIs, excellent documentation, handles subscriptions and recurring billing flawlessly.", cons: "Fees can be higher for low-volume businesses.", fit: "The gold standard for most SaaS and subscription businesses." },
                { name: "PayPal/Braintree", pros: "Widely trusted brand, good for businesses where customers prefer PayPal.", cons: "API is generally considered less modern than Stripe's.", fit: "A solid choice, especially if a large portion of your user base uses PayPal." },
                { name: "Paddle", pros: "Acts as a Merchant of Record, handling sales tax/VAT compliance for you.", cons: "Less flexible, higher transaction fees.", fit: "Great for businesses that want to completely offload tax compliance." },
            ]
        },
        {
            name: "Email Providers",
            vendors: [
                { name: "SendGrid", pros: "High deliverability rates, robust API, detailed analytics.", cons: "Free tier is limited.", fit: "A reliable workhorse for transactional emails." },
                { name: "Postmark", pros: "Exclusively for transactional email, leading to extremely high deliverability.", cons: "Not for marketing newsletters.", fit: "Best-in-class for critical emails like receipts and password resets." },
            ]
        }
    ]
};

export const securityAndCompliance = {
    title: "Security & Compliance Checklist",
    content: `
**Disclaimer:** This checklist is for informational purposes only and does not constitute legal advice. Always consult with legal and security professionals to ensure compliance with all applicable laws and regulations for your specific business and jurisdiction. The distribution of IPTV content may be subject to strict licensing laws.

### PII Storage & GDPR
- **Data Minimization:** Only collect personal data that is absolutely necessary (name, email, phone).
- **Encryption:** Encrypt sensitive data both in transit (TLS 1.2+) and at rest (database-level encryption).
- **Access Control:** Implement strict RBAC to ensure only authorized personnel can access PII.
- **Right to be Forgotten:** Develop a process to permanently delete a user's data upon a valid request. All associated records (payments, logs) should be anonymized.
- **Data Portability:** Be able to provide a user with an export of their data in a machine-readable format (e.g., JSON).
- **Official GDPR Guide:** [https://gdpr.eu/](https://gdpr.eu/)

### PCI-DSS Compliance
- **Never Store Raw Card Data:** Do not let full credit card numbers, CVV codes, or expiration dates touch your servers.
- **Use a Compliant Payment Processor:** Offload all card handling to a PCI-DSS Level 1 compliant provider like Stripe or Braintree.
- **Tokenization:** Use the payment processor's tokenization/hosted fields (e.g., Stripe Elements) to ensure sensitive card data is sent directly from the user's browser to the processor's servers. Your backend only handles the resulting non-sensitive token.
- **Official PCI-DSS Guide:** [https://www.pcisecuritystandards.org/](https://www.pcisecuritystandards.org/)

### General Security Best Practices
- **Password Hashing:** Store user passwords using a strong, salted, one-way hashing algorithm (e.g., bcrypt, Argon2).
- **Two-Factor Authentication (2FA):** Enforce 2FA for all admin/staff accounts.
- **Input Validation:** Sanitize all user input to prevent injection attacks (SQLi, XSS).
- **Dependency Scanning:** Regularly scan application dependencies for known vulnerabilities.
- **Regular Security Audits:** Conduct periodic penetration testing and vulnerability assessments.
- **Secure Hosting:** Host the application with a reputable provider that offers robust security features (e.g., AWS, Google Cloud).
`
};

export const roadmap = {
    title: "Phased Implementation Roadmap",
    phases: [
        {
            name: "MVP (1-2 Months)",
            theme: "Core Manual Operations",
            features: [
                "Secure user login for admins",
                "Full CRUD for subscribers",
                "Subscriber list with status filtering and search",
                "Dashboard with basic counts (Active, Expiring, Expired)",
                "Manual 1-click SMS sending via Twilio integration",
                "Settings page for API keys",
            ],
            acceptanceCriteria: "An operator can manage their entire subscriber list manually and send renewal reminders one by one."
        },
        {
            name: "Version 1 (3-4 Months)",
            theme: "Automation & Billing",
            features: [
                "Automated, scheduled renewal reminders (SMS/Email/WhatsApp)",
                "Bulk CSV import/export of subscribers",
                "RBAC with Admin and Support roles",
                "Stripe integration for processing payments and logging transactions",
                "Detailed subscriber view with communication and payment history",
                "Basic audit logging for critical actions",
            ],
            acceptanceCriteria: "The system automates renewal communication, reducing manual effort. Payments can be tracked, and user roles provide better security."
        },
        {
            name: "Version 2 (5-6+ Months)",
            theme: "Scale & Intelligence",
            features: [
                "Advanced analytics and reporting dashboard (MRR, Churn, LTV)",
                "Webhook support for integrations (e.g., Zapier)",
                "Multi-tenancy architecture to support multiple operators",
                "Customizable automated workflows (dunning)",
                "Support for more communication channels (Voice Calls)",
                "UI localization and timezone support",
            ],
            acceptanceCriteria: "The platform is a scalable, multi-tenant SaaS product with powerful automation and analytics capabilities."
        }
    ]
}
