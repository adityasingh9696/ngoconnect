import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { dbService } from '../services/dbService';
import { generateImpactMessage } from '../services/geminiService';
import { Donation, DonationStatus } from '../types';
import { Button, Card, Input, StatusBadge } from '../components/UI';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      setDonations(dbService.getUserDonations(user.id));
    }
  }, [user]);





  const initiateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    // 1. Create PENDING record
    const donation = dbService.createDonation(user!.id, user!.name, Number(amount));

    // 2. Redirect to Mock Gateway
    navigate('/payment-gateway', {
      state: {
        amount: Number(amount),
        donationId: donation.id,
        userName: user!.name,
        returnPath: '/user'
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Action */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl relative overflow-hidden">
          {/* Background Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-pink-500 opacity-20 blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Hello, {user?.name}</h2>
              <p className="text-indigo-100 text-lg opacity-90 max-w-md">
                Your contribution directly impacts lives. Join us in making a difference today.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xs font-semibold tracking-wide uppercase">Secure Payment</span>
            </div>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <label className="text-xs uppercase tracking-wider font-semibold text-indigo-200 mb-3 block">Choose Donation Amount</label>

            <div className="flex flex-wrap gap-3 mb-6">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${amount === amt.toString() ? 'bg-white text-indigo-600 shadow-lg scale-105' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold group-focus-within:text-indigo-500 transition-colors">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white text-gray-900 rounded-xl pl-8 pr-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
                  placeholder="Other Amount"
                  min="1"
                />
              </div>
              <button
                onClick={initiateDonation}
                disabled={!amount}
                className="bg-purple-500 hover:bg-purple-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/20 transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-w-[160px]"
              >
                {isProcessing ? 'Processing...' : 'Donate Now'}
                {!isProcessing && <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>}
              </button>
            </div>
            <p className="text-xs text-indigo-200 mt-4 text-center sm:text-left italic">
              * All donations are tax-deductible and secured by PayU.
            </p>
          </div>
        </Card>

        <Card className="p-0 flex flex-col overflow-hidden">
          <div className="bg-gray-50 p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Your Impact</h3>
          </div>
          <div className="p-6 flex-grow flex flex-col justify-center items-center text-center">
            <div className="mb-4 p-4 bg-indigo-50 rounded-full">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <div className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {donations.filter(d => d.status === 'SUCCESS').length}
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-8">Causes Supported</div>

            <div className="w-full bg-gray-100 h-px mb-8"></div>

            <div className="text-3xl font-bold text-indigo-600 mb-1">
              ₹{donations.filter(d => d.status === 'SUCCESS').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Contributed</div>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Profile & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <Card className="p-0 h-fit">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">My Profile</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">
                {user?.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">{user?.name}</h4>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">{user?.role}</span>
              </div>
            </div>

            <div className="pt-4 space-y-3 border-t border-gray-100">
              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold">Email Address</label>
                <div className="text-gray-700 font-medium">{user?.email}</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold">Member Since</label>
                <div className="text-gray-700 font-medium">{user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold">User ID</label>
                <div className="text-xs text-gray-500 font-mono bg-gray-50 p-1 rounded border border-gray-100">{user?.id}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* History Table */}
        <Card className="p-0 lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Donation History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">No donations recorded yet.</td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(d.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {d.transactionId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{d.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 italic max-w-xs truncate">
                        {d.impactMessage || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>


    </div>
  );
};
