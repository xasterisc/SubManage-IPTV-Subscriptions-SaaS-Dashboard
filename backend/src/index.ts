import express from 'express';
import cors from 'cors';
import { PrismaClient, SubscriberStatus, Plan, Role } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- Data Mapping Utilities ---
const planMap: { [key: string]: Plan } = {
    '1m': Plan.ONE_MONTH,
    '3m': Plan.THREE_MONTHS,
    '6m': Plan.SIX_MONTHS,
    '12m': Plan.ONE_YEAR,
};

const reversePlanMap: { [key in Plan]: string } = {
    [Plan.ONE_MONTH]: '1m',
    [Plan.THREE_MONTHS]: '3m',
    [Plan.SIX_MONTHS]: '6m',
    [Plan.ONE_YEAR]: '12m',
};

const transformSubscriberForClient = (subscriber: any) => {
    return {
        ...subscriber,
        plan: reversePlanMap[subscriber.plan] || subscriber.plan,
        startDate: subscriber.startDate.toISOString(),
        endDate: subscriber.endDate.toISOString(),
        createdAt: subscriber.createdAt.toISOString(),
        updatedAt: subscriber.updatedAt.toISOString(),
    };
};


// --- SUBSCRIBERS API ---

// GET all subscribers
app.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(subscribers.map(transformSubscriberForClient));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subscribers' });
  }
});

// POST a new subscriber
app.post('/api/subscribers', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, plan, startDate, status, notes } = req.body;
    
    const planEnum = planMap[plan as string];
    if (!planEnum) {
        return res.status(400).json({ error: `Invalid plan value provided: ${plan}`});
    }

    const planDurations: { [key in Plan]: number } = { 
        [Plan.ONE_MONTH]: 30, 
        [Plan.THREE_MONTHS]: 90, 
        [Plan.SIX_MONTHS]: 180, 
        [Plan.ONE_YEAR]: 365 
    };
    
    const sDate = new Date(startDate);
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + (planDurations[planEnum] || 30));

    const newSubscriber = await prisma.subscriber.create({
      data: {
        fullName,
        email,
        phoneNumber,
        plan: planEnum,
        startDate: sDate,
        endDate: eDate,
        status: status as SubscriberStatus,
        notes,
        createdById: 'user_1', // Hardcoded admin user for now
      },
    });
    res.status(201).json(transformSubscriberForClient(newSubscriber));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating subscriber' });
  }
});

// PUT (update) a subscriber
app.put('/api/subscribers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { fullName, email, phoneNumber, plan, startDate, status, notes } = req.body;
    
    const planEnum = planMap[plan as string];
     if (!planEnum) {
        return res.status(400).json({ error: `Invalid plan value provided: ${plan}`});
    }

    const planDurations: { [key in Plan]: number } = { 
        [Plan.ONE_MONTH]: 30, 
        [Plan.THREE_MONTHS]: 90, 
        [Plan.SIX_MONTHS]: 180, 
        [Plan.ONE_YEAR]: 365 
    };
    
    const sDate = new Date(startDate);
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + (planDurations[planEnum] || 30));
    
    const updatedSubscriber = await prisma.subscriber.update({
      where: { id },
      data: {
        fullName,
        email,
        phoneNumber,
        plan: planEnum,
        startDate: sDate,
        endDate: eDate,
        status: status as SubscriberStatus,
        notes,
      },
    });
    res.json(transformSubscriberForClient(updatedSubscriber));
  } catch (error)
{
    res.status(500).json({ error: 'Error updating subscriber' });
  }
});

// DELETE a subscriber
app.delete('/api/subscribers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // To prevent errors, we first delete related records.
    // In a real app, you might want soft deletes instead.
    await prisma.communication.deleteMany({ where: { subscriberId: id } });
    await prisma.payment.deleteMany({ where: { subscriberId: id } });

    await prisma.subscriber.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting subscriber' });
  }
});


// --- STAFF API ---
const transformUserForClient = (user: any) => ({
    ...user,
    lastLogin: new Date().toISOString(), // Use a dynamic value for last login
    avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
});

// GET all staff
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(staff.map(transformUserForClient));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching staff' });
  }
});

// POST a new staff member
app.post('/api/staff', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: (role as string).toUpperCase() as Role,
        password: 'password_placeholder', // Should be properly hashed
        avatar: `https://i.pravatar.cc/150?u=${email}`
      },
    });
    res.status(201).json(transformUserForClient(newUser));
  } catch (error) {
    res.status(500).json({ error: 'Error creating staff member' });
  }
});

// PUT (update) a staff member
app.put('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { name, email, role } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: (role as string).toUpperCase() as Role,
      },
    });
    res.json(transformUserForClient(updatedUser));
  } catch (error) {
    res.status(500).json({ error: 'Error updating staff member' });
  }
});


// DELETE a staff member
app.delete('/api/staff/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting staff member. They may have created subscribers.' });
    }
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
