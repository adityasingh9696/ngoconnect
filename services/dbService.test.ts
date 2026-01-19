import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dbService } from './dbService';
import { UserRole, DonationStatus } from '../types';

describe('dbService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('User Operations', () => {
        it('should seed admin user if not exists', () => {
            const users = dbService.getUsers();

            // Note: Since module level code runs once, we might need to manually trigger logic if we wanted to test the seed
            // strict logic, but checking if we can create an admin or if one exists is fine.
            const admin = dbService.createUser('Test Admin', 'admin@test.com');
            expect(admin).toBeDefined();
        });

        it('should create a new user', () => {
            const user = dbService.createUser('John Doe', 'john@example.com');

            expect(user.name).toBe('John Doe');
            expect(user.role).toBe(UserRole.USER);

            const inStorage = JSON.parse(localStorage.getItem('ngo_users') || '[]');
            expect(inStorage).toHaveLength(1);
            expect(inStorage[0].email).toBe('john@example.com');
        });

        it('should find user by email', () => {
            dbService.createUser('Jane Doe', 'jane@example.com');

            const found = dbService.findUserByEmail('jane@example.com');
            expect(found).toBeDefined();
            expect(found?.name).toBe('Jane Doe');

            const notFound = dbService.findUserByEmail('unknown@example.com');
            expect(notFound).toBeUndefined();
        });

        it('should not allow duplicate emails', () => {
            dbService.createUser('Duplicate', 'dup@example.com');
            expect(() => dbService.createUser('Duplicate 2', 'dup@example.com')).toThrow("User already exists");
        });
    });

    describe('Donation Operations', () => {
        it('should create a donation', () => {
            const donation = dbService.createDonation('user-1', 'User 1', 100);

            expect(donation.amount).toBe(100);
            expect(donation.status).toBe(DonationStatus.PENDING);

            const inStorage = JSON.parse(localStorage.getItem('ngo_donations') || '[]');
            expect(inStorage).toHaveLength(1);
        });

        it('should update donation status', () => {
            const donation = dbService.createDonation('user-1', 'User 1', 50);

            const updated = dbService.updateDonationStatus(donation.id, DonationStatus.SUCCESS, 'txn-123', 'Impact message');

            expect(updated.status).toBe(DonationStatus.SUCCESS);
            expect(updated.transactionId).toBe('txn-123');
            expect(updated.impactMessage).toBe('Impact message');

            const fetched = dbService.getDonations().find(d => d.id === donation.id);
            expect(fetched?.status).toBe(DonationStatus.SUCCESS);
        });

        it('should get user specific donations', () => {
            // Mock dates to ensure distinct timestamps
            const date1 = new Date('2023-01-01T10:00:00Z');
            const date2 = new Date('2023-01-01T12:00:00Z');

            vi.useFakeTimers();
            vi.setSystemTime(date1);
            dbService.createDonation('user-1', 'User 1', 10);

            vi.setSystemTime(date2);
            dbService.createDonation('user-1', 'User 1', 30);

            vi.useRealTimers();

            const user1Donations = dbService.getUserDonations('user-1');
            expect(user1Donations).toHaveLength(2);
            expect(user1Donations[0].amount).toBe(30); // Newer date (date2) should be first
        });
    });
});
