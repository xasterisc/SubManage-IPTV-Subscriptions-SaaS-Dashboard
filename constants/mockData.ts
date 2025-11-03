import { Subscriber, SubscriberStatus, StaffUser, Role } from '../types';

const today = new Date();
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const SUBSCRIBERS_DATA: Subscriber[] = [
  {
    id: 'sub_1',
    fullName: 'Alice Johnson',
    email: 'alice.j@email.com',
    phoneNumber: '+12025550186',
    plan: '12m',
    startDate: addDays(today, -180).toISOString(),
    endDate: addDays(today, 185).toISOString(),
    status: SubscriberStatus.Active,
    notes: 'Long-time customer, renewed early.',
    createdBy: 'admin',
    createdAt: addDays(today, -545).toISOString(),
    updatedAt: addDays(today, -180).toISOString(),
    communications: [
      { id: 'comm_1a', timestamp: addDays(today, -182).toISOString(), channel: 'SMS', message: 'Thank you for renewing your annual plan!', status: 'delivered' }
    ],
    payments: [
      { id: 'pay_1a', transactionId: 'txn_abc123', amount: 99.99, currency: 'USD', paidAt: addDays(today, -180).toISOString(), method: 'Credit Card' }
    ]
  },
  {
    id: 'sub_2',
    fullName: 'Bob Williams',
    email: 'bob.w@email.com',
    phoneNumber: '+442079460001',
    plan: '1m',
    startDate: addDays(today, -25).toISOString(),
    endDate: addDays(today, 5).toISOString(),
    status: SubscriberStatus.Expiring,
    notes: 'Needs a reminder on the 3rd.',
    createdBy: 'support',
    createdAt: addDays(today, -25).toISOString(),
    updatedAt: addDays(today, -25).toISOString(),
    communications: [],
    payments: [
        { id: 'pay_2a', transactionId: 'txn_def456', amount: 12.99, currency: 'GBP', paidAt: addDays(today, -25).toISOString(), method: 'PayPal' }
    ]
  },
  {
    id: 'sub_3',
    fullName: 'Charlie Brown',
    email: 'charlie.b@email.com',
    phoneNumber: '+13125550144',
    plan: '3m',
    startDate: addDays(today, -92).toISOString(),
    endDate: addDays(today, -2).toISOString(),
    status: SubscriberStatus.Expired,
    notes: 'Contacted, said will renew next week.',
    createdBy: 'admin',
    createdAt: addDays(today, -92).toISOString(),
    updatedAt: addDays(today, -2).toISOString(),
    communications: [
      { id: 'comm_3a', timestamp: addDays(today, -1).toISOString(), channel: 'SMS', message: 'Your subscription has expired. Please renew to continue service.', status: 'delivered' }
    ],
    payments: [
        { id: 'pay_3a', transactionId: 'txn_ghi789', amount: 35.00, currency: 'USD', paidAt: addDays(today, -92).toISOString(), method: 'Credit Card' }
    ]
  },
  {
    id: 'sub_4',
    fullName: 'Diana Prince',
    email: 'diana.p@email.com',
    phoneNumber: '+33123456789',
    plan: '6m',
    startDate: addDays(today, -200).toISOString(),
    endDate: addDays(today, -20).toISOString(),
    status: SubscriberStatus.Cancelled,
    notes: 'Cancelled due to moving.',
    createdBy: 'support',
    createdAt: addDays(today, -200).toISOString(),
    updatedAt: addDays(today, -20).toISOString(),
    communications: [
        { id: 'comm_4a', timestamp: addDays(today, -21).toISOString(), channel: 'Email', message: 'We have processed your cancellation request. Your subscription will end on the expiry date.', status: 'sent' }
    ],
    payments: [
        { id: 'pay_4a', transactionId: 'txn_jkl012', amount: 65.00, currency: 'EUR', paidAt: addDays(today, -200).toISOString(), method: 'SEPA Debit' }
    ]
  },
  {
    id: 'sub_5',
    fullName: 'Ethan Hunt',
    email: 'ethan.h@email.com',
    phoneNumber: '+4915123456789',
    plan: '1m',
    startDate: addDays(today, -2).toISOString(),
    endDate: addDays(today, 5).toISOString(), // Mismatch with status to show a trial override
    status: SubscriberStatus.Trial,
    notes: '7-day trial period.',
    createdBy: 'admin',
    createdAt: addDays(today, -2).toISOString(),
    updatedAt: addDays(today, -2).toISOString(),
    communications: [],
    payments: []
  },
  {
    id: 'sub_6',
    fullName: 'Fiona Glenanne',
    email: 'fiona.g@email.com',
    phoneNumber: '+14155550199',
    plan: '3m',
    startDate: addDays(today, -30).toISOString(),
    endDate: addDays(today, 60).toISOString(),
    status: SubscriberStatus.Active,
    notes: '',
    createdBy: 'support',
    createdAt: addDays(today, -30).toISOString(),
    updatedAt: addDays(today, -30).toISOString(),
    communications: [],
    payments: [
        { id: 'pay_6a', transactionId: 'txn_mno345', amount: 35.00, currency: 'USD', paidAt: addDays(today, -30).toISOString(), method: 'Credit Card' }
    ]
  }
];

export const STAFF_USERS_DATA: StaffUser[] = [
    {
        id: 'user_1',
        name: 'Emirhan Baruch',
        email: 'emirhan.baruch@submanage.com',
        role: Role.Admin,
        avatar: 'https://i.pravatar.cc/150?u=user1',
        lastLogin: addDays(today, -1).toISOString(),
    },
    {
        id: 'user_2',
        name: 'Jane Doe',
        email: 'jane.doe@submanage.com',
        role: Role.Support,
        avatar: 'https://i.pravatar.cc/150?u=user2',
        lastLogin: new Date().toISOString(),
    },
    {
        id: 'user_3',
        name: 'John Smith',
        email: 'john.smith@submanage.com',
        role: Role.Support,
        avatar: 'https://i.pravatar.cc/150?u=user3',
        lastLogin: addDays(today, -3).toISOString(),
    }
];