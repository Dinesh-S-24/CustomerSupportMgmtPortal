# CSMS Backend

Customer Support Management System (CSMS) backend built using **Node.js, Express.js, MongoDB, and Mongoose**.

This backend provides APIs for:

* Authentication
* User management
* Ticket management
* Ticket assignment
* Ticket status management
* Ticket messages
* Dashboard statistics
* Reports
* Role-based access
* JWT authentication
* MongoDB data management

---

# 1. Project Overview

CSMS is an internal customer support ticket management system for an e-commerce platform.

Customers can create support tickets for issues related to:

* Orders
* Delivery
* Products
* Payments
* Refunds
* Accounts
* General issues

Support agents can:

* View assigned tickets
* View ticket details
* Add messages
* Change ticket status
* Resolve tickets

Administrators can:

* View tickets
* Assign tickets to agents
* Monitor dashboard statistics
* View reports
* Manage support operations

---

# 2. Technology Stack

| Technology | Purpose               |
| ---------- | --------------------- |
| Node.js    | Backend runtime       |
| Express.js | REST API framework    |
| MongoDB    | Database              |
| Mongoose   | MongoDB ODM           |
| JWT        | Authentication        |
| bcryptjs   | Password hashing      |
| dotenv     | Environment variables |
| JavaScript | Backend development   |

---

# 3. Project Structure

```text
csms-backend/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── ticketController.js
│   ├── messageController.js
│   └── dashboardController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Ticket.js
│   └── Message.js
│
├── routes/
│   ├── authRoutes.js
│   ├── ticketRoutes.js
│   ├── messageRoutes.js
│   └── dashboardRoutes.js
│
├── utils/
│   ├── response.js
│   └── ticketNumber.js
│
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

# 4. Installation

Clone or create the project:

```bash
mkdir csms-backend
cd csms-backend
```

Initialize Node.js:

```bash
npm init -y
```

Install dependencies:

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken
```

For development:

```bash
npm install --save-dev nodemon
```

---

# 5. Environment Variables

Create:

```text
.env
```

Example:

```env
PORT=4000

MONGO_URI=mongodb://127.0.0.1:27017/csms

JWT_SECRET=your_super_secret_key

JWT_EXPIRES_IN=1d
```

Do not commit `.env` to Git.

Add this to `.gitignore`:

```text
node_modules/
.env
```

---

# 6. Starting MongoDB

The project uses local MongoDB.

Default connection:

```text
mongodb://127.0.0.1:27017/csms
```

Database:

```text
csms
```

Collections created by the application include:

```text
users
tickets
messages
```

MongoDB creates collections automatically when documents are inserted.

---

# 7. Database Connection

Example `config/db.js`:

```js
const mongoose = require("mongoose");

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDatabase;
```

---

# 8. Server

The backend runs on:

```text
http://localhost:4000
```

Example `server.js`:

```js
require("dotenv").config();

const express = require("express");
const connectDatabase = require("./config/db");

const app = express();

app.use(express.json());

connectDatabase();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`CSMS server running on http://localhost:${PORT}`);
});
```

---

# 9. Authentication

Authentication uses:

```text
JWT
```

The authentication flow is:

```text
Register
   ↓
Hash password using bcrypt
   ↓
Store user in MongoDB
   ↓
Login
   ↓
Compare password
   ↓
Generate JWT
   ↓
Client sends JWT
   ↓
Auth middleware verifies JWT
   ↓
req.user is created
```

---

# 10. User Model

User structure:

```text
User
├── name
├── email
├── passwordHash
├── role
├── isActive
├── createdAt
└── updatedAt
```

Roles:

```text
customer
agent
admin
```

Default role:

```text
customer
```

Example:

```json
{
    "name": "Abhi",
    "email": "abhi@example.com",
    "passwordHash": "...",
    "role": "customer",
    "isActive": true
}
```

---

# 11. Password Hashing

Passwords are never stored as plain text.

Example:

```js
const bcrypt = require("bcryptjs");

const hashedPassword = await bcrypt.hash(password, 10);
```

During login:

```js
const isPasswordCorrect = await bcrypt.compare(
    password,
    user.passwordHash
);
```

The database stores:

```text
passwordHash
```

not:

```text
password
```

---

# 12. JWT

JWT payload contains information such as:

```json
{
    "userId": "6aa917a77a4dbfe5c85da63f",
    "role": "customer"
}
```

The token is sent in:

```http
Authorization: Bearer <token>
```

The authentication middleware verifies the token.

After successful verification:

```js
req.user = {
    id: decoded.userId,
    role: decoded.role
};
```

Controllers can then use:

```js
req.user.id
```

and:

```js
req.user.role
```

---

# 13. Authentication Middleware

The middleware:

1. Reads Authorization header
2. Extracts Bearer token
3. Verifies JWT
4. Gets user ID and role
5. Stores authenticated user in `req.user`

Example:

```js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            id: decoded.userId,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;
```

---

# 14. Role-Based Access

The system has three roles:

```text
customer
agent
admin
```

Example:

```js
roleMiddleware("admin")
```

or:

```js
roleMiddleware("agent", "admin")
```

This prevents unauthorized users from accessing protected APIs.

---

# 15. Ticket Model

The ticket collection contains:

```text
tickets
```

Ticket structure:

```text
Ticket
├── ticketNumber
├── subject
├── description
├── category
├── priority
├── status
├── attachmentUrl
├── customerId
├── assignedAgentId
├── isDeleted
├── createdAt
└── updatedAt
```

---

# 16. Ticket Number

Every ticket has a unique ticket number.

Example:

```text
TKT-1001
TKT-1002
TKT-1003
```

The field has a unique index:

```js
ticketNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
}
```

This prevents duplicate ticket numbers.

MongoDB error:

```text
E11000 duplicate key error
```

can occur if the ticket number generator generates a number that already exists.

---

# 17. Ticket Categories

Supported categories:

```text
Order Issue
Delivery Issue
Product Issue
Payment Issue
Refund Issue
Account Issue
Other
```

---

# 18. Ticket Priorities

Supported priorities:

```text
Low
Medium
High
Critical
```

---

# 19. Ticket Statuses

Supported statuses:

```text
Open
Assigned
In Progress
Waiting for Customer
Resolved
Closed
```

---

# 20. Ticket Status Flow

The backend validates status transitions.

```text
Open
  ↓
Assigned
  ↓
In Progress
  ↓
Waiting for Customer
  ↓
In Progress
```

Another path:

```text
In Progress
  ↓
Resolved
  ↓
Closed
```

Allowed transitions:

```text
Open → Assigned

Assigned → In Progress

In Progress → Waiting for Customer

In Progress → Resolved

Waiting for Customer → In Progress

Resolved → Closed
```

This prevents invalid status changes.

For example:

```text
Open → Closed
```

is not allowed.

---

# 21. Ticket Relationships

Tickets reference users using MongoDB ObjectId.

Customer:

```js
customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}
```

Assigned agent:

```js
assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
}
```

This creates a relationship between:

```text
User
   ↑
   |
Ticket
```

---

# 22. Mongoose Populate

Instead of returning only:

```json
{
    "customerId": "6aa917a77a4dbfe5c85da63f"
}
```

we can populate the referenced user.

Example:

```js
.populate(
    "customerId",
    "name email role"
)
```

The response can then contain:

```json
{
    "customerId": {
        "_id": "6aa917a77a4dbfe5c85da63f",
        "name": "Abhi",
        "email": "abhi@example.com",
        "role": "customer"
    }
}
```

Similarly:

```js
.populate(
    "assignedAgentId",
    "name email role"
)
```

---

# 23. Ticket APIs

## Create Ticket

```http
POST /api/tickets
```

Authentication:

```http
Authorization: Bearer <token>
```

Request:

```json
{
    "subject": "Payment deducted but order not created",
    "description": "Money was deducted from my account but I did not receive an order confirmation.",
    "category": "Payment Issue",
    "priority": "Medium",
    "attachmentUrl": "https://example.com/payment.png"
}
```

Response:

```json
{
    "success": true,
    "message": "Ticket created successfully",
    "data": {
        "ticketNumber": "TKT-1009",
        "subject": "Payment deducted but order not created",
        "description": "Money was deducted from my account but I did not receive an order confirmation.",
        "category": "Payment Issue",
        "priority": "Medium",
        "status": "Open",
        "customerId": "6aa917a77a4dbfe5c85da63f",
        "assignedAgentId": null,
        "isDeleted": false
    }
}
```

---

# 24. Get Tickets

```http
GET /api/tickets
```

Supports:

* Pagination
* Search
* Status filter
* Priority filter
* Category filter
* Agent filter
* Date filter

Example:

```http
GET /api/tickets?page=1&limit=10
```

Search:

```http
GET /api/tickets?search=payment
```

Status:

```http
GET /api/tickets?status=Open
```

Priority:

```http
GET /api/tickets?priority=High
```

Category:

```http
GET /api/tickets?category=Payment%20Issue
```

---

# 25. Pagination

Example:

```http
GET /api/tickets?page=1&limit=10
```

Concept:

```text
page = 1
limit = 10

skip = (page - 1) * limit
```

For page 2:

```text
skip = (2 - 1) * 10
skip = 10
```

The API returns:

```json
{
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
}
```

---

# 26. Search

Ticket search checks fields such as:

```text
ticketNumber
subject
```

Regex search is used for partial matching.

Example:

```text
payment
```

can find:

```text
Payment deducted
Payment failed
Payment issue
```

---

# 27. Get Ticket Details

```http
GET /api/tickets/:id
```

Returns:

* Ticket
* Customer
* Assigned agent
* Messages

Example:

```http
GET /api/tickets/6aace5c7d58b6d1107401873
```

---

# 28. Update Ticket

```http
PUT /api/tickets/:id
```

Possible fields:

```text
subject
description
category
priority
attachmentUrl
```

Example:

```json
{
    "subject": "Updated payment issue",
    "priority": "High"
}
```

---

# 29. Delete Ticket

The project uses **soft delete**.

Instead of physically deleting the MongoDB document:

```js
await Ticket.findByIdAndDelete(id);
```

the application changes:

```js
isDeleted: true
```

Example:

```json
{
    "isDeleted": true
}
```

Normal ticket queries use:

```js
isDeleted: false
```

This preserves the original ticket for audit/history purposes.

---

# 30. Assign Ticket

```http
PUT /api/tickets/:id/assign
```

Request:

```json
{
    "agentId": "agent-user-id"
}
```

The backend checks:

1. Ticket exists
2. Agent exists
3. Agent is active
4. User role is `agent`

Then:

```text
assignedAgentId = agentId
```

If ticket status is:

```text
Open
```

it changes to:

```text
Assigned
```

---

# 31. Unassign Ticket

```http
PUT /api/tickets/:id/unassign
```

The backend sets:

```js
assignedAgentId = null
```

If the ticket was:

```text
Assigned
```

it can return to:

```text
Open
```

---

# 32. Change Ticket Status

```http
PUT /api/tickets/:id/status
```

Request:

```json
{
    "status": "In Progress"
}
```

The backend validates the requested transition.

For example:

```text
Assigned → In Progress
```

is valid.

But:

```text
Assigned → Closed
```

is rejected.

---

# 33. Message Model

Messages belong to tickets.

Relationship:

```text
Ticket
   |
   └── Messages
          ├── Customer message
          ├── Agent message
          └── Admin message
```

Message fields include:

```text
ticketId
senderId
message
attachmentUrl
isDeleted
createdAt
updatedAt
```

---

# 34. Add Message

```http
POST /api/tickets/:ticketId/messages
```

Request:

```json
{
    "message": "We are checking your payment transaction."
}
```

The backend:

1. Validates ticket
2. Validates authenticated user
3. Creates message
4. Associates message with ticket
5. Stores sender ID

---

# 35. Get Messages

```http
GET /api/tickets/:ticketId/messages
```

Messages are normally returned in chronological order:

```text
oldest
   ↓
newest
```

Example:

```json
{
    "success": true,
    "data": [
        {
            "message": "Payment was deducted.",
            "senderId": {
                "name": "Abhi",
                "role": "customer"
            }
        },
        {
            "message": "We are checking the transaction.",
            "senderId": {
                "name": "Support Agent",
                "role": "agent"
            }
        }
    ]
}
```

---

# 36. Message Populate

Messages use:

```js
senderId
```

to reference:

```text
User
```

Example:

```js
.populate(
    "senderId",
    "name email role"
)
```

This allows the frontend to display:

```text
Abhi - customer
Support Agent - agent
```

instead of only showing ObjectIds.

---

# 37. Dashboard

The dashboard provides summary information about tickets.

Typical dashboard information includes:

```text
Total Tickets
Open Tickets
Assigned Tickets
In Progress Tickets
Waiting for Customer
Resolved Tickets
Closed Tickets
```

---

# 38. Dashboard Summary

Example:

```http
GET /api/dashboard/summary
```

Response:

```json
{
    "success": true,
    "data": {
        "totalTickets": 100,
        "openTickets": 20,
        "assignedTickets": 15,
        "inProgressTickets": 25,
        "waitingForCustomer": 10,
        "resolvedTickets": 20,
        "closedTickets": 10
    }
}
```

---

# 39. Status Report

The status report groups tickets by status.

Example:

```http
GET /api/dashboard/status
```

Concept:

```text
Open                 20
Assigned             15
In Progress          25
Waiting for Customer 10
Resolved             20
Closed               10
```

MongoDB aggregation can be used for this type of report.

---

# 40. Priority Report

Example:

```http
GET /api/dashboard/priority
```

Groups tickets by:

```text
Low
Medium
High
Critical
```

Example:

```json
{
    "Low": 20,
    "Medium": 40,
    "High": 30,
    "Critical": 10
}
```

This helps administrators understand ticket urgency.

---

# 41. Category Report

Example:

```http
GET /api/dashboard/category
```

Groups tickets by:

```text
Order Issue
Delivery Issue
Product Issue
Payment Issue
Refund Issue
Account Issue
Other
```

Example:

```json
{
    "Order Issue": 20,
    "Delivery Issue": 15,
    "Product Issue": 10,
    "Payment Issue": 30,
    "Refund Issue": 10,
    "Account Issue": 5,
    "Other": 10
}
```

---

# 42. MongoDB Aggregation

Reports can use MongoDB aggregation.

Basic structure:

```js
Ticket.aggregate([
    {
        $match: {
            isDeleted: false
        }
    },
    {
        $group: {
            _id: "$status",
            count: {
                $sum: 1
            }
        }
    }
]);
```

Flow:

```text
$match
   ↓
Filter documents
   ↓
$group
   ↓
Group documents
   ↓
$sum
   ↓
Count documents
```

---

# 43. MongoDB Queries Used

Common queries in the project include:

### Find

```js
Ticket.find({
    isDeleted: false
});
```

### Find One

```js
Ticket.findOne({
    _id: ticketId,
    isDeleted: false
});
```

### Find By ID

```js
Ticket.findById(ticketId);
```

### Create

```js
Ticket.create(data);
```

### Save

```js
ticket.subject = "Updated subject";

await ticket.save();
```

---

# 44. Mongoose `timestamps`

For models where automatic MongoDB Date timestamps are required:

```js
{
    timestamps: true
}
```

Mongoose automatically manages:

```text
createdAt
updatedAt
```

Example:

```text
createdAt: ISODate(...)
updatedAt: ISODate(...)
```

These are MongoDB `Date` values.

The application does not need to manually write:

```js
createdAt: Date.now()
```

or:

```js
ticket.updatedAt = new Date();
```

when using Mongoose timestamps.

---

# 45. ObjectId Validation

Before querying MongoDB with an ID:

```js
mongoose.Types.ObjectId.isValid(id)
```

Example:

```js
if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return errorResponse(
        res,
        "Invalid ticket ID"
    );
}
```

This prevents invalid IDs from reaching MongoDB queries.

---

# 46. Soft Delete

Tickets and messages can use:

```text
isDeleted
```

Instead of deleting the document permanently.

Default:

```js
isDeleted: false
```

Deleted:

```js
isDeleted: true
```

All normal queries should filter:

```js
{
    isDeleted: false
}
```

---

# 47. Response Format

The project uses a consistent response structure.

Success:

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {}
}
```

Error:

```json
{
    "success": false,
    "message": "Something went wrong",
    "errors": []
}
```

This keeps API responses consistent for the frontend.

---

# 48. Error Handling

Controllers use:

```js
try {
    // operation
} catch (error) {
    console.error(error);

    return errorResponse(
        res,
        "Operation failed",
        error
    );
}
```

Common MongoDB errors include:

### Duplicate key

```text
E11000 duplicate key error
```

Example:

```text
ticketNumber_1
```

This means a unique field already exists.

### CastError

Usually caused by an invalid MongoDB ObjectId.

### ValidationError

Occurs when required fields, enums, min/max lengths, etc. are invalid.

---

# 49. Important MongoDB Concepts Learned

During the backend implementation, the following MongoDB/Mongoose concepts were used:

```text
MongoDB Database
Collections
Documents
Fields
ObjectId
Schema
Model
CRUD
find()
findOne()
findById()
create()
save()
update
delete
Soft Delete
Indexes
Unique Index
References
ref
populate()
Aggregation
$match
$group
$sum
Pagination
Regex Search
Filtering
Sorting
Date Queries
Mongoose Validation
Enums
Middleware
Timestamps
```

---

# 50. MongoDB Relationships

MongoDB is document-oriented, but references can be created using ObjectIds.

Example:

```text
User
 |
 | _id
 ↓
Ticket.customerId
```

And:

```text
User
 |
 | _id
 ↓
Ticket.assignedAgentId
```

And:

```text
Ticket
 |
 | _id
 ↓
Message.ticketId
```

Therefore:

```text
User
 ├── Customer
 │      └── Tickets
 │              └── Messages
 │
 └── Agent
        └── Assigned Tickets
                └── Messages
```

---

# 51. API Authentication Flow

```text
POST /api/auth/register
        ↓
Create user
        ↓
Hash password
        ↓
Save MongoDB
```

Then:

```text
POST /api/auth/login
        ↓
Find user
        ↓
Compare bcrypt password
        ↓
Generate JWT
        ↓
Return token
```

Then every protected request:

```text
Frontend
   ↓
Authorization: Bearer JWT
   ↓
Auth Middleware
   ↓
JWT Verify
   ↓
req.user
   ↓
Controller
   ↓
MongoDB
   ↓
Response
```

---

# 52. Ticket Lifecycle

Complete ticket lifecycle:

```text
Customer creates ticket
        ↓
Open
        ↓
Admin assigns agent
        ↓
Assigned
        ↓
Agent starts working
        ↓
In Progress
        ↓
        ├───────────────┐
        ↓               ↓
Waiting for Customer   Resolved
        ↓               ↓
Customer responds      Closed
        ↓
In Progress
```

---

# 53. Complete Backend Flow

```text
Request
   ↓
Express Router
   ↓
Authentication Middleware
   ↓
Role Middleware
   ↓
Controller
   ↓
Validation
   ↓
Mongoose Model
   ↓
MongoDB
   ↓
Controller
   ↓
Response Utility
   ↓
JSON Response
```

---

# 54. Important API Areas

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## Tickets

```text
POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
DELETE /api/tickets/:id

PUT    /api/tickets/:id/assign
PUT    /api/tickets/:id/unassign
PUT    /api/tickets/:id/status
```

## Messages

```text
POST /api/tickets/:ticketId/messages
GET  /api/tickets/:ticketId/messages
```

## Dashboard / Reports

```text
GET /api/dashboard/summary
GET /api/dashboard/status
GET /api/dashboard/priority
GET /api/dashboard/category
```

---

# 55. Testing the APIs

Recommended order:

### Step 1

Start MongoDB.

### Step 2

Start backend:

```bash
npm run dev
```

or:

```bash
node server.js
```

### Step 3

Register user.

### Step 4

Login.

### Step 5

Copy JWT token.

### Step 6

Send:

```http
Authorization: Bearer <JWT>
```

### Step 7

Create ticket.

### Step 8

Get tickets.

### Step 9

Get ticket details.

### Step 10

Assign agent.

### Step 11

Change status.

### Step 12

Add message.

### Step 13

Get messages.

### Step 14

Test dashboard/report APIs.

---

# 56. Example End-to-End Scenario

Customer:

```text
Register
   ↓
Login
   ↓
JWT
   ↓
Create Payment Issue
```

Ticket:

```text
TKT-1009
Status: Open
Priority: Medium
Category: Payment Issue
```

Admin:

```text
Assign ticket
```

Ticket becomes:

```text
Assigned
```

Agent:

```text
Change status
```

Ticket becomes:

```text
In Progress
```

Agent adds:

```text
"We are checking your payment transaction."
```

Customer waits:

```text
Waiting for Customer
```

Customer responds:

```text
"Here is my payment reference."
```

Agent:

```text
In Progress
```

Issue resolved:

```text
Resolved
```

Final status:

```text
Closed
```

Dashboard automatically reflects the ticket in the corresponding status/category/priority counts.

---

# 57. Lessons Learned

The major backend concepts implemented in this project are:

### Node.js

* Express server
* Routes
* Controllers
* Middleware
* Environment variables
* Error handling
* Async/await
* Modules

### MongoDB

* Database
* Collections
* Documents
* ObjectIds
* Queries
* Indexes
* Unique indexes
* References
* Aggregation
* Filtering
* Pagination
* Sorting

### Mongoose

* Schemas
* Models
* Validation
* Enums
* `ref`
* `populate()`
* `timestamps`
* `save()`
* `create()`
* Query methods

### Authentication

* bcrypt password hashing
* JWT generation
* JWT verification
* Authorization
* Roles

### Backend architecture

```text
Routes
   ↓
Middleware
   ↓
Controllers
   ↓
Models
   ↓
MongoDB
```

---

# 58. Current Backend Status

Implemented backend areas:

```text
[✓] Node.js project setup
[✓] Express server
[✓] MongoDB connection
[✓] Environment configuration
[✓] User model
[✓] Registration
[✓] Login
[✓] bcrypt password hashing
[✓] JWT authentication
[✓] Authentication middleware
[✓] Role handling
[✓] Ticket model
[✓] Create ticket
[✓] Get tickets
[✓] Get ticket details
[✓] Update ticket
[✓] Soft delete ticket
[✓] Assign ticket
[✓] Unassign ticket
[✓] Change ticket status
[✓] Ticket status transitions
[✓] Message model
[✓] Add message
[✓] Get messages
[✓] Populate user references
[✓] Dashboard summary
[✓] Status report
[✓] Priority report
[✓] Category report
[✓] Pagination
[✓] Search
[✓] Filtering
[✓] MongoDB indexes
[✓] Error handling
```

---

# 59. Run the Project

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/csms
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
```

Start development server:

```bash
npm run dev
```

or:

```bash
node server.js
```

Expected output:

```text
MongoDB connected successfully
CSMS server running on http://localhost:4000
```

---

# 60. Final Architecture

```text
                    CSMS BACKEND
                         |
              ┌──────────┴──────────┐
              |                     |
        Authentication           Dashboard
              |                     |
        JWT + bcrypt          Reports/Aggregation
              |
        Auth Middleware
              |
        ┌─────┴─────┐
        |           |
     Customer     Agent/Admin
        |           |
        └─────┬─────┘
              |
           Tickets
              |
      ┌───────┼────────┐
      |       |        |
   Messages Assignment Status
      |       |        |
      └───────┼────────┘
              |
           MongoDB
              |
       ┌──────┼──────┐
       |      |      |
      Users Tickets Messages
```

---

# Conclusion

The CSMS backend demonstrates a complete Node.js + MongoDB REST API architecture.

The main implementation flow is:

```text
Node.js
   ↓
Express
   ↓
JWT Authentication
   ↓
Role Authorization
   ↓
Controllers
   ↓
Mongoose
   ↓
MongoDB
```

The ticket management system supports the complete lifecycle from:

```text
Ticket Creation
      ↓
Assignment
      ↓
Status Management
      ↓
Messages
      ↓
Resolution
      ↓
Closure
```

Dashboard and report APIs aggregate the stored ticket data to provide operational statistics for the support system.
