import { User, Donation, UserRole, DonationStatus } from '../types';

const KEYS = {
  USERS: 'ngo_users',
  DONATIONS: 'ngo_donations',
  CURRENT_USER: 'ngo_current_session'
};

// Seed admin if not exists
const seedAdmin = () => {
  const usersStr = localStorage.getItem(KEYS.USERS);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  const adminExists = users.find(u => u.email === 'admin@ngo.org');

  if (!adminExists) {
    const admin: User = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@ngo.org',
      role: UserRole.ADMIN,
      joinedAt: new Date().toISOString(),
      password: 'admin123'
    };
    users.push(admin);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  } else if (!adminExists.password) {
    // Migration for existing admin
    adminExists.password = 'admin123';
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
};

seedAdmin();

export const dbService = {
  // --- USER OPERATIONS ---
  getUsers: (): User[] => {
    const str = localStorage.getItem(KEYS.USERS);
    return str ? JSON.parse(str) : [];
  },

  findUserByEmail: (email: string): User | undefined => {
    const users = dbService.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser: (name: string, email: string, password: string): User => {
    const users = dbService.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("User already exists");
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role: UserRole.USER,
      joinedAt: new Date().toISOString(),
      password
    };
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  // --- DONATION OPERATIONS ---
  getDonations: (): Donation[] => {
    const str = localStorage.getItem(KEYS.DONATIONS);
    return str ? JSON.parse(str) : [];
  },

  createDonation: (userId: string, userName: string, amount: number): Donation => {
    const donations = dbService.getDonations();
    const newDonation: Donation = {
      id: crypto.randomUUID(),
      userId,
      userName,
      amount,
      currency: 'USD',
      status: DonationStatus.PENDING,
      timestamp: new Date().toISOString(),
    };
    donations.push(newDonation);
    localStorage.setItem(KEYS.DONATIONS, JSON.stringify(donations));
    return newDonation;
  },

  updateDonationStatus: (donationId: string, status: DonationStatus, transactionId?: string, impactMessage?: string): Donation => {
    const donations = dbService.getDonations();
    const index = donations.findIndex(d => d.id === donationId);
    if (index === -1) throw new Error("Donation not found");

    donations[index] = {
      ...donations[index],
      status,
      transactionId: transactionId || donations[index].transactionId,
      impactMessage: impactMessage || donations[index].impactMessage
    };

    localStorage.setItem(KEYS.DONATIONS, JSON.stringify(donations));
    return donations[index];
  },

  getUserDonations: (userId: string): Donation[] => {
    const all = dbService.getDonations();
    return all.filter(d => d.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};
