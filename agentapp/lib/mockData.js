// lib/mockData.js
export let tickets = [
  {
    _id: "1",
    ticketNumber: "TKT-1001",
    subject: "Order not delivered",
    description: "My order was supposed to arrive 3 days ago",
    category: "Delivery Issue",
    priority: "High",
    status: "Waiting for Customer",
    customerId: "c1",
    assignedAgentId: "Zain",
    createdAt: "08 Sept 2026",
    updatedAt: "08 Sept 2026"
  },
    {
    _id: "2",
    ticketNumber: "TKT-1002",
    subject: "Order not delivered",
    description: "My order was supposed to arrive 2 days ago",
    category: "Delivery Issue",
    priority: "Medium",
    status: "Assigned",
    customerId: "c2",
    assignedAgentId: "Zain",
    createdAt: "08 Sept 2026",
    updatedAt: "08 Sept 2026"
  },
    {
    _id: "3",
    ticketNumber: "TKT-1003",
    subject: "Order not delivered",
    description: "My order was supposed to arrive 3 days ago",
    category: "Delivery Issue",
    priority: "High",
    status: "Resolved",
    customerId: "c3",
    assignedAgentId: "Zain",
    createdAt: "08 Sept 2026",
    updatedAt: "08 Sept 2026"
  }, {
    _id: "4",
    ticketNumber: "TKT-1004",
    subject: "Order not delivered",
    description: "My order was supposed to arrive 3 days ago",
    category: "Delivery Issue",
    priority: "High",
    status: "Waiting for Customer",
    customerId: "c4",
    assignedAgentId: "Zain",
    createdAt: "08 Sept 2026",
    updatedAt: "08 Sept 2026"
  },
    {
    _id: "6",
    ticketNumber: "TKT-1006",
    subject: "Order not delivered",
    description: "My order was supposed to arrive 2 days ago",
    category: "Delivery Issue",
    priority: "High",
    status: "Assigned",
    customerId: "c5",
    assignedAgentId: "Zain",
    createdAt: "08 Sept 2026",
    updatedAt: "08 Sept 2026"
  },
    {
    _id: "8",
    ticketNumber: "TKT-1008",
    subject: "Order not delivered",
    description: "My order was supposed to arrive 3 days ago",
    category: "Delivery Issue",
    priority: "High",
    status: "Resolved",
    customerId: "c6",
    assignedAgentId: "Zain",
    createdAt: "08 Sept 2026",
    updatedAt: "08 Sept 2026"
  },
    {
    _id: "9",
    ticketNumber: "TKT-1009",
    subject: "Order not delivered",
    description: "My order was supposed to arrive 3 days ago",
    category: "Delivery Issue",
    priority: "High",
    status: "In Progress",
    customerId: "c7",
    assignedAgentId: "Zain",
    createdAt: "08 Sept 2026",
    updatedAt: "08 Sept 2026"
  }
];
export let messages = [
  { _id: "m1", ticketId: "1", senderId: "u1", message: "Any update on this?", createdAt: "2026-09-08T11:00:00Z" }
];

export const users = [
  { _id: "u1", name: "Zain", email: "zain@test.com", role: "agent" }
];
export const customers = [
  { _id: "c1", name: "Nouman", email: "Nouman@test.com", role: "customer" },
    { _id: "c2", name: "jim", email: "furan@test.com", role: "customer" },
      { _id: "c3", name: "hayer", email: "khan@test.com", role: "customer" },
        { _id: "c4", name: "klim", email: "june@test.com", role: "customer" },
                { _id: "c5", name: "wefw", email: "jule@test.com", role: "customer" },
                                { _id: "c6", name: "jonathan", email: "decemner@test.com", role: "customer" }





];
// ASSIGNED
export const ASSIGNED_MESSAGES = [
    {
        _id: 'msg001',
        ticketId: 'TKT-1002',
        senderId: 'u1',
        message: 'Hello! I am looking into your issue right away.',
        createdAt: '2025-06-01T10:00:00.000Z'
    },
    {
        _id: 'msg002',
        ticketId: 'TKT-1002',
        senderId: 'c1',
        message: 'My order was supposed to arrive yesterday but I have not received it yet.',
        createdAt: '2025-06-01T10:05:00.000Z'
    },
    {
        _id: 'msg003',
        ticketId: 'TKT-1002',
        senderId: 'u1',
        message: 'I can see your order is with the delivery partner. It should arrive by end of day today.',
        createdAt: '2025-06-01T10:08:00.000Z'
    }
];


// IN PROGRESS
export const IN_PROGRESS_MESSAGES = [
    {
        _id: 'msg101',
        ticketId: 'TKT-1003',
        senderId: 'u1',
        message: 'I have started investigating the issue with your order.',
        createdAt: '2025-06-01T11:00:00.000Z'
    },
    {
        _id: 'msg102',
        ticketId: 'TKT-1003',
        senderId: 'c1',
        message: 'Okay, thank you. Please let me know once you find the issue.',
        createdAt: '2025-06-01T11:05:00.000Z'
    },
    {
        _id: 'msg103',
        ticketId: 'TKT-1003',
        senderId: 'u1',
        message: 'I have identified the issue and I am working with our technical team to resolve it.',
        createdAt: '2025-06-01T11:15:00.000Z'
    }
];


// WAITING FOR CUSTOMER
export const WAITING_FOR_CUSTOMER_MESSAGES = [
    {
        _id: 'msg201',
        ticketId: 'TKT-1001',
        senderId: 'u1',
        message: 'We have checked the issue from our side and need some additional information from you.',
        createdAt: '2025-06-01T12:00:00.000Z'
    },
    {
        _id: 'msg202',
        ticketId: 'TKT-1001',
        senderId: 'u1',
        message: 'Could you please confirm whether you have received the latest order confirmation email?',
        createdAt: '2025-06-01T12:05:00.000Z'
    },
    {
        _id: 'msg203',
        ticketId: 'TKT-1001',
        senderId: 'c1',
        message: 'I have checked my email, but I still have not received the confirmation.',
        createdAt: '2025-06-01T12:10:00.000Z'
    },
    {
        _id: 'msg204',
        ticketId: 'TKT-1001',
        senderId: 'u1',
        message: 'Thank you for confirming. Please let us know if you receive the email so we can continue with the next steps.',
        createdAt: '2025-06-01T12:15:00.000Z'
    }
];


// RESOLVED
export const RESOLVED_MESSAGES = [
    {
        _id: 'msg301',
        ticketId: 'TKT-1004',
        senderId: 'u1',
        message: 'We have identified the issue with your payment and corrected it from our side.',
        createdAt: '2025-06-01T13:00:00.000Z'
    },
    {
        _id: 'msg302',
        ticketId: 'TKT-1004',
        senderId: 'u1',
        message: 'Please check your order again and confirm whether the payment is now showing correctly.',
        createdAt: '2025-06-01T13:05:00.000Z'
    },
    {
        _id: 'msg303',
        ticketId: 'TKT-1004',
        senderId: 'c1',
        message: 'Yes, I checked it. The payment is showing correctly now.',
        createdAt: '2025-06-01T13:10:00.000Z'
    },
    {
        _id: 'msg304',
        ticketId: 'TKT-1004',
        senderId: 'u1',
        message: 'Great. The issue has been resolved. Thank you for confirming.',
        createdAt: '2025-06-01T13:12:00.000Z'
    }
];


// CLOSED
export const CLOSED_MESSAGES = [
    {
        _id: 'msg401',
        ticketId: 'TKT-1005',
        senderId: 'u1',
        message: 'Your issue has been resolved and we have completed all the required checks.',
        createdAt: '2025-06-01T14:00:00.000Z'
    },
    {
        _id: 'msg402',
        ticketId: 'TKT-1005',
        senderId: 'c1',
        message: 'Yes, everything is working correctly now. Thank you for your help.',
        createdAt: '2025-06-01T14:05:00.000Z'
    },
    {
        _id: 'msg403',
        ticketId: 'TKT-1005',
        senderId: 'u1',
        message: 'You are welcome. We are closing this ticket now. Please contact us again if you need any further assistance.',
        createdAt: '2025-06-01T14:10:00.000Z'
    }
];
export const MOCK_MESSAGES_BY_STATUS = {
    Assigned: ASSIGNED_MESSAGES,
    "In Progress": IN_PROGRESS_MESSAGES,
    "Waiting for Customer": WAITING_FOR_CUSTOMER_MESSAGES,
    Resolved: RESOLVED_MESSAGES,
    Closed: CLOSED_MESSAGES
};
