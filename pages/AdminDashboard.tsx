import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { generateImpactMessage } from '../services/geminiService';
import { User, Donation, DonationStatus } from '../types';
import { useAuth } from '../App';
import { Card, StatusBadge, Button, Input } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'donations'>('overview');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DonationStatus>('ALL');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    setUsers(dbService.getUsers());
    setDonations(dbService.getDonations());
  }, []);

  const totalDonations = donations.filter(d => d.status === 'SUCCESS').reduce((acc, c) => acc + c.amount, 0);

  // Data for Charts
  const statusData = [
    { name: 'Success', value: donations.filter(d => d.status === 'SUCCESS').length, color: '#22c55e' },
    { name: 'Pending', value: donations.filter(d => d.status === 'PENDING').length, color: '#eab308' },
    { name: 'Failed', value: donations.filter(d => d.status === 'FAILED').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Simple daily aggregation mock logic
  const dailyData = donations
    .filter(d => d.status === 'SUCCESS')
    .reduce((acc: any[], curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString();
      const existing = acc.find(i => i.date === date);
      if (existing) existing.amount += curr.amount;
      else acc.push({ date, amount: curr.amount });
      return acc;
    }, [])
    .slice(-7); // Last 7 active days

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Name,Email,Role,JoinedAt\n"
      + users.map(u => `${u.id},${u.name},${u.email},${u.role},${u.joinedAt}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ngo_registrations.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Donation Logic
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);



  const initiateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateAmount || isNaN(Number(donateAmount)) || Number(donateAmount) <= 0) return;

    setShowDonateModal(false); // Close modal first

    try {
      // 1. Create PENDING record
      const donation = dbService.createDonation(user!.id, user!.name, Number(donateAmount));

      // 2. Redirect to Mock Gateway
      navigate('/payment-gateway', {
        state: {
          amount: Number(donateAmount),
          donationId: donation.id,
          userName: user!.name,
          returnPath: '/admin'
        }
      });
    } catch (error) {
      console.error("Donation Initiation Failed", error);
    }
  };

  const handleUpdateStatus = (donationId: string, newStatus: DonationStatus) => {
    try {
      if (!confirm(`Are you sure you want to mark this donation as ${newStatus}?`)) return;

      const updated = dbService.updateDonationStatus(
        donationId,
        newStatus,
        newStatus === DonationStatus.SUCCESS ? `manual_verify_${Math.random().toString(36).substr(2, 9)}` : `manual_reject_${Math.random().toString(36).substr(2, 9)}`,
        newStatus === DonationStatus.SUCCESS ? "Manually verified by Admin" : "Manually rejected by Admin"
      );

      setDonations(prev => prev.map(d => d.id === donationId ? updated : d));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  const filteredDonations = donations
    .filter(d => statusFilter === 'ALL' || d.status === statusFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0 items-center">
          <Button variant="primary" onClick={() => setShowDonateModal(true)} className="mr-4 shadow-lg shadow-indigo-500/20">
            Make Donation
          </Button>
          {(['overview', 'registrations', 'donations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {showDonateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-all">
          <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl scale-100 bg-slate-900 border border-slate-700">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 text-white relative border-b border-indigo-500/20">
              <button
                onClick={() => setShowDonateModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h3 className="text-2xl font-bold mb-1">Make a Donation</h3>
              <p className="text-indigo-200 text-sm">Empower change with a quick contribution.</p>
            </div>

            <div className="p-8">
              <form onSubmit={initiateDonation} className="space-y-6">

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Amount</label>
                  <div className="flex gap-3 mb-4">
                    {[10, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonateAmount(amt.toString())}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${donateAmount === amt.toString() ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Or Enter Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                    <input
                      type="number"
                      value={donateAmount}
                      onChange={(e) => setDonateAmount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-8 pr-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow placeholder-slate-600"
                      placeholder="0.00"
                      min="1"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3 border border-slate-700">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  <p className="text-xs text-slate-400 leading-tight">
                    Payment secured by <strong className="text-slate-200">PayU</strong>. Your transaction is encrypted and safe.
                  </p>
                </div>


                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 py-3 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setShowDonateModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40" disabled={!donateAmount} isLoading={isProcessing}>
                    Proceed to Pay
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-l-4 border-indigo-500 bg-slate-800 border-t-0 border-r-0 border-b-0 shadow-lg">
              <div className="text-slate-400 text-sm font-medium uppercase">Total Registrations</div>
              <div className="text-2xl font-bold text-white mt-1">{users.length}</div>
            </Card>
            <Card className="p-5 border-l-4 border-emerald-500 bg-slate-800 border-t-0 border-r-0 border-b-0 shadow-lg">
              <div className="text-slate-400 text-sm font-medium uppercase">Total Raised</div>
              <div className="text-2xl font-bold text-white mt-1">₹{totalDonations.toLocaleString()}</div>
            </Card>
            <Card className="p-5 border-l-4 border-blue-500 bg-slate-800 border-t-0 border-r-0 border-b-0 shadow-lg">
              <div className="text-slate-400 text-sm font-medium uppercase">Total Transactions</div>
              <div className="text-2xl font-bold text-white mt-1">{donations.length}</div>
            </Card>
            <Card className="p-5 border-l-4 border-amber-500 bg-slate-800 border-t-0 border-r-0 border-b-0 shadow-lg">
              <div className="text-slate-400 text-sm font-medium uppercase">Pending Attempts</div>
              <div className="text-2xl font-bold text-white mt-1">{donations.filter(d => d.status === 'PENDING').length}</div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 h-80 bg-slate-800 border border-slate-700 shadow-lg">
              <h3 className="text-lg font-medium text-white mb-4">Donation Status Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center text-slate-300">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: d.color }}></span>
                    {d.name}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 h-80 bg-slate-800 border border-slate-700 shadow-lg">
              <h3 className="text-lg font-medium text-white mb-4">Recent Fund Inflow</h3>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={{ stroke: '#334155' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} tickLine={{ stroke: '#334155' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', color: '#f8fafc' }}
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                    />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">Not enough data</div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'registrations' && (
        <Card className="p-0 bg-slate-800 border border-slate-700 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-medium text-white">Registered Users</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                />
                <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <Button variant="outline" onClick={exportUsers} className="text-xs whitespace-nowrap border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                Export CSV
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {users.filter(u =>
                  u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearch.toLowerCase())
                ).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-900/50 text-purple-300' : 'bg-slate-700 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{new Date(u.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'donations' && (
        <Card className="p-0 bg-slate-800 border border-slate-700 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-medium text-white">All Donation Records</h3>
            <div className="flex gap-2">
              {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${statusFilter === status
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className={`hover:bg-slate-700/50 transition-colors ${d.status === 'PENDING' ? 'bg-amber-900/10' : ''}`}>
                    <td className="px-6 py-4 text-sm text-white font-medium">{d.userName}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">₹{d.amount}</td>
                    <td className="px-6 py-4 text-sm"><StatusBadge status={d.status} /></td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{d.transactionId || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(d.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      {d.status === DonationStatus.PENDING && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(d.id, DonationStatus.SUCCESS)}
                            className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded hover:bg-green-900/60 font-medium transition-colors border border-green-800/50"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(d.id, DonationStatus.FAILED)}
                            className="text-xs bg-rose-900/40 text-rose-400 px-2 py-1 rounded hover:bg-rose-900/60 font-medium transition-colors border border-rose-800/50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
