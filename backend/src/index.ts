import express from 'express';
import cors from 'cors';
import { PrismaClient, SubscriberStatus, Plan, Role, Subscriber } from '@prisma/client';
import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import 'dotenv/config';

// --- Define an interface for the authenticated request ---
interface AuthRequest extends Request {
    user?: { userId: string; role: Role }; // Add user property
}

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

// --- Add a JWT_SECRET ---
const JWT_SECRET = process.env.JWT_SECRET;

// --- Add a check to make sure it loaded ---
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
    process.exit(1);
}

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

const statusMap: { [key: string]: SubscriberStatus } = {
    'Active': SubscriberStatus.ACTIVE,
    'Expiring': SubscriberStatus.EXPIRING,
    'Expired': SubscriberStatus.EXPIRED,
    'Cancelled': SubscriberStatus.CANCELLED,
    'Trial': SubscriberStatus.TRIAL,
};

const reverseStatusMap: { [key in SubscriberStatus]: string } = {
    [SubscriberStatus.ACTIVE]: 'Active',
    [SubscriberStatus.EXPIRING]: 'Expiring',
    [SubscriberStatus.EXPIRED]: 'Expired',
    [SubscriberStatus.CANCELLED]: 'Cancelled',
    [SubscriberStatus.TRIAL]: 'Trial',
};

const transformSubscriberForClient = (subscriber: Subscriber & { payments: any[], communications: any[] }) => {
    return {
        ...subscriber,
        plan: reversePlanMap[subscriber.plan] || subscriber.plan,
        status: reverseStatusMap[subscriber.status] || subscriber.status,
        startDate: subscriber.startDate.toISOString(),
        endDate: subscriber.endDate.toISOString(),
        createdAt: subscriber.createdAt.toISOString(),
        updatedAt: subscriber.updatedAt.toISOString(),
    };
};

// =================================================================
// --- NEW: AUTHENTICATION ---
// =================================================================

// --- LOGIN ENDPOINT ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Verify password with argon2
        const isPasswordValid = await verify(user.password, password); 

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Password is valid, create a JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' } // Token expires in 8 hours
        );

        // Don't send the password back
        const { password: _, ...userWithoutPassword } = user;

        // Use the existing transformUserForClient
        res.json({ token, user: transformUserForClient(userWithoutPassword) });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ error: 'Token is invalid' });
        }
        req.user = user; // Add decoded user info to the request object
        next();
    });
};

// =================================================================
// --- SUBSCRIBERS API (Now Protected) ---
// =================================================================

app.get('/api/subscribers', authenticateToken, async (req, res) => {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
      include: { payments: true, communications: true }
    });
    res.json(subscribers.map(transformSubscriberForClient));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subscribers' });
  }
});

app.post('/api/subscribers', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { fullName, email, phoneNumber, plan, startDate, status, notes } = req.body;
    const createdById = req.user?.userId; // Get user ID from the token
    
    const planEnum = planMap[plan as string];
    if (!planEnum) {
        return res.status(400).json({ error: `Invalid plan value provided: ${plan}`});
    }

    const statusEnum = statusMap[status as string] || SubscriberStatus.ACTIVE;

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
        status: statusEnum,
        notes,
        createdById: createdById || 'user_1',
      },
      include: { payments: true, communications: true }
    });
    res.status(201).json(transformSubscriberForClient(newSubscriber));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating subscriber' });
  }
});

app.put('/api/subscribers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { fullName, email, phoneNumber, plan, startDate, status, notes } = req.body;
    
    const planEnum = planMap[plan as string];
     if (!planEnum) {
        return res.status(400).json({ error: `Invalid plan value provided: ${plan}`});
    }

    const statusEnum = statusMap[status as string] || SubscriberStatus.ACTIVE;

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
        status: statusEnum,
        notes,
      },
      include: { payments: true, communications: true }
    });
    res.json(transformSubscriberForClient(updatedSubscriber));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating subscriber' });
  }
});

app.delete('/api/subscribers/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    // --- Add this Admin Check ---
    const requestingUser = await prisma.user.findUnique({ 
        where: { id: req.user?.userId } 
    });

    if (requestingUser?.role !== Role.ADMIN) {
        return res.status(403).json({ error: 'Only admins can delete subscribers.' });
    }
    // --- End of Admin Check ---

    await prisma.communication.deleteMany({ where: { subscriberId: id } });
    await prisma.payment.deleteMany({ where: { subscriberId: id } });
    await prisma.auditLog.deleteMany({ where: { subscriberId: id }});

    await prisma.subscriber.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting subscriber' });
  }
});


// =================================================================
// --- STAFF API (Now Protected & Fixed) ---
// =================================================================

const transformUserForClient = (user: any) => ({
    ...user,
    lastLogin: new Date().toISOString(),
    avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
});

app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(staff.map(transformUserForClient));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching staff' });
  }
});

app.post('/api/staff', authenticateToken, async (req: AuthRequest, res) => {
  // Check if the authenticated user is an ADMIN
  const adminUser = await prisma.user.findUnique({ where: { id: req.user?.userId } });
  if (adminUser?.role !== Role.ADMIN) {
      return res.status(403).json({ error: 'Only admins can create users.' });
  }

  try {
    const { name, email, role, password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required to create a user.'});
    }

    const hashedPassword = await hash(password); // <-- Hash the password

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: (role as string).toUpperCase() as Role,
        password: hashedPassword, // Save the hashed password
        avatar: `https://i.pravatar.cc/150?u=${email}`
      },
    });
    res.status(201).json(transformUserForClient(newUser));
  } catch (error) {
    res.status(500).json({ error: 'Error creating staff member' });
  }
});

app.put('/api/staff/:id', authenticateToken, async (req, res) => {
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

app.delete('/api/staff/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params; // ID of user to delete
  const requestingUserId = req.user?.userId; // ID of admin making the request

  try {
    // We use a transaction to ensure all operations succeed or none do.
    // If any step throws an error, the entire transaction is rolled back.
    const deleteResult = await prisma.$transaction(async (tx) => {
        
        // 1. Verify the person making the request is an Admin
        const requestingUser = await tx.user.findUnique({
            where: { id: requestingUserId },
        });

        if (requestingUser?.role !== Role.ADMIN) {
            // This throw will cancel the transaction
            throw new Error('Only admins can delete users.');
        }

        // 2. Prevent admin from deleting themselves
        if (requestingUser.id === id) {
            // This throw will cancel the transaction
            throw new Error('Admin cannot delete their own account.');
        }

        // 3. Find the user to be deleted (to ensure they exist)
        const userToDelete = await tx.user.findUnique({
            where: { id: id }
        });

        if (!userToDelete) {
            // This throw will cancel the transaction
            throw new Error('User not found.');
        }

        // 4. Re-assign subscribers to the admin making the request
        await tx.subscriber.updateMany({
            where: { createdById: id },
            data: {
                createdById: requestingUser.id, // Re-assign to the admin
            },
        });

        // 5. Delete associated audit logs
        await tx.auditLog.deleteMany({
            where: { userId: id },
        });

        // 6. Finally, delete the user
        const deletedUser = await tx.user.delete({
            where: { id: id },
        });

        return deletedUser;
    });

    // If the transaction was successful, send 204
    res.status(204).send();

  } catch (error: any) {
      // Handle errors thrown from inside the transaction
      console.error("Transaction failed: ", error.message);
      
      if (error.message === 'Only admins can delete users.') {
          return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Admin cannot delete their own account.' || error.message === 'User not found.') {
          return res.status(400).json({ error: error.message });
      }

      // Generic error for any other transaction failure
      res.status(500).json({ error: 'Error deleting staff member.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
