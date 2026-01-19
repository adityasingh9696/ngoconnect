import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { generateImpactMessage } from '../services/geminiService';
import { DonationStatus } from '../types';
import { Card } from '../components/UI';

interface PaymentState {
    amount: number;
    donationId: string;
    userName: string;
    returnPath: string;
}

export const PaymentSimulation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as PaymentState;

    // If accessed directly without state, redirect back
    useEffect(() => {
        if (!state || !state.donationId) {
            navigate('/login');
        }
    }, [state, navigate]);

    const [paymentMode, setPaymentMode] = useState<'card' | 'upi' | 'netbanking' | 'wallet' | 'bnpl'>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'method' | 'processing' | 'test_selection' | 'success' | 'failed' | 'pending'>('method');

    if (!state) return null;

    const startPaymentFlow = () => {
        setStep('processing');
        setIsProcessing(true);
        // Simulate initial "Contacting Bank" delay
        setTimeout(() => {
            setStep('test_selection');
        }, 2000);
    }

    const handleSimulation = async (outcome: 'success' | 'failed' | 'pending') => {
        setStep('processing'); // Show processing again briefly

        setTimeout(async () => {
            if (outcome === 'success') {
                try {
                    const impactMsg = await generateImpactMessage(state.amount, state.userName);
                    const simulatedTxnId = "payu_test_" + Math.random().toString(36).substring(7);
                    dbService.updateDonationStatus(state.donationId, DonationStatus.SUCCESS, simulatedTxnId, impactMsg);
                    setStep('success');
                    setTimeout(() => navigate(state.returnPath), 2000);
                } catch (error) {
                    console.error("Payment Error", error);
                    setStep('failed');
                }
            } else if (outcome === 'failed') {
                const simulatedTxnId = "failed_" + Math.random().toString(36).substring(7);
                dbService.updateDonationStatus(state.donationId, DonationStatus.FAILED, simulatedTxnId, "Payment declined by user simulation.");
                setStep('failed');
                setTimeout(() => navigate(state.returnPath), 2000);
            } else if (outcome === 'pending') {
                // Keep as PENDING (default)
                setStep('pending');
                setTimeout(() => navigate(state.returnPath), 3000);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <Card className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 overflow-hidden shadow-2xl p-0 h-[600px]">

                {/* Sidebar */}
                <div className="bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Merchant</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
                            <span className="font-bold text-gray-800 text-lg">NgoConnect</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount to Pay</h3>
                        <div className="text-3xl font-bold text-gray-900">₹{state.amount.toLocaleString()}</div>
                        <div className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline">View Details</div>
                    </div>

                    <nav className="space-y-1 flex-grow overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Methods</h3>
                        <button
                            onClick={() => setPaymentMode('card')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${paymentMode === 'card' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 ring-1 ring-indigo-500' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                            Credit/Debit Card
                        </button>
                        <button
                            onClick={() => setPaymentMode('upi')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${paymentMode === 'upi' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 ring-1 ring-indigo-500' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            UPI / QR
                        </button>
                        <button
                            onClick={() => setPaymentMode('netbanking')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${paymentMode === 'netbanking' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 ring-1 ring-indigo-500' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            NetBanking
                        </button>
                        <button
                            onClick={() => setPaymentMode('wallet')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${paymentMode === 'wallet' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 ring-1 ring-indigo-500' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                            Wallets
                        </button>
                        <button
                            onClick={() => setPaymentMode('bnpl')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${paymentMode === 'bnpl' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 ring-1 ring-indigo-500' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Pay Later (BNPL)
                        </button>
                    </nav>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            <span>Trusted by <strong>PayU</strong></span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 bg-white p-8 relative">

                    {/* PROCESSING OVERLAY */}
                    {step === 'processing' && (
                        <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Securely...</h2>
                            <p className="text-gray-500">Contacting Bank Servers. Do not close.</p>
                            <div className="mt-8 flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-semibold text-indigo-700">Encrypting 256-bit</span>
                            </div>
                        </div>
                    )}

                    {/* TEST MODE SELECTION OVERLAY (Razorpay style mock) */}
                    {step === 'test_selection' && (
                        <div className="absolute inset-0 bg-white z-40 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white flex justify-between items-center">
                                    <span className="font-mono text-sm tracking-wide">TEST MODE</span>
                                    <div className="px-2 py-1 bg-white/10 rounded text-xs font-bold">SIMULATION</div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">Bank Authorization</h3>
                                    <p className="text-sm text-gray-500 mb-6">Select a simulation outcome for this transaction.</p>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleSimulation('success')}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-gray-800 group-hover:text-green-700">Success</div>
                                                    <div className="text-xs text-gray-500">Authorize payment</div>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </button>

                                        <button
                                            onClick={() => handleSimulation('failed')}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-rose-500 hover:bg-rose-50 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 group-hover:bg-rose-200 transition-colors">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-gray-800 group-hover:text-rose-700">Failure</div>
                                                    <div className="text-xs text-gray-500">Decline transaction</div>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-300 group-hover:text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </button>

                                        <button
                                            onClick={() => handleSimulation('pending')}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-gray-800 group-hover:text-amber-700">Pending</div>
                                                    <div className="text-xs text-gray-500">Delay / Timeout</div>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                            <p className="text-gray-500 mb-6">Redirecting you back to NgoConnect...</p>
                        </div>
                    )}

                    {step === 'failed' && (
                        <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                            <p className="text-gray-500 mb-6">Transaction was declined. Redirecting...</p>
                        </div>
                    )}

                    {step === 'pending' && (
                        <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h2>
                            <p className="text-gray-500 mb-6">Your payment is being processed. We will update you shortly.</p>
                        </div>
                    )}

                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Enter Details</h2>
                            <div className="flex gap-2">
                                <div className="w-8 h-5 bg-gray-200 rounded border border-gray-300"></div>
                                <div className="w-8 h-5 bg-gray-200 rounded border border-gray-300"></div>
                                <div className="w-8 h-5 bg-gray-200 rounded border border-gray-300"></div>
                            </div>
                        </div>

                        {paymentMode === 'card' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                                    <div className="relative">
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 outline-none transition-all font-mono" />
                                        <svg className="w-6 h-6 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Expiry Date</label>
                                        <input type="text" placeholder="MM / YY" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 outline-none transition-all font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">CVV</label>
                                        <input type="password" placeholder="123" maxLength={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 outline-none transition-all font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Card Holder Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 outline-none transition-all" />
                                </div>
                            </div>
                        )}

                        {paymentMode === 'upi' && (
                            <div className="space-y-6 py-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="text-center">
                                    <div className="w-48 h-48 mx-auto mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50">
                                        <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Scan with any UPI App</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or enter UPI ID</span></div>
                                </div>
                                <input type="text" placeholder="example@upi" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 outline-none transition-all" />
                            </div>
                        )}

                        {paymentMode === 'netbanking' && (
                            <div className="space-y-4 py-4 animate-in slide-in-from-right-4 duration-300">
                                <p className="text-sm text-gray-600 mb-4">Select your Bank</p>
                                {['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'].map(bank => (
                                    <label key={bank} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="radio" name="bank" className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                        <span className="ml-3 font-semibold text-gray-700">{bank}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {paymentMode === 'wallet' && (
                            <div className="space-y-4 py-4 animate-in slide-in-from-right-4 duration-300">
                                <p className="text-sm text-gray-600 mb-4">Select Wallet</p>
                                {['PayTM', 'PhonePe', 'Amazon Pay', 'MobiKwik'].map(wallet => (
                                    <label key={wallet} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="radio" name="wallet" className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                        <span className="ml-3 font-semibold text-gray-700">{wallet}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {paymentMode === 'bnpl' && (
                            <div className="space-y-4 py-4 animate-in slide-in-from-right-4 duration-300">
                                <p className="text-sm text-gray-600 mb-4">Select BNPL Provider</p>
                                {['Simpl', 'Lazypay', 'ZestMoney'].map(bnpl => (
                                    <label key={bnpl} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="radio" name="bnpl" className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                        <span className="ml-3 font-semibold text-gray-700">{bnpl}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="mt-auto pt-8">
                            <button
                                onClick={startPaymentFlow}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transform transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                Pay ₹{state.amount}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">
                                This is a secure 256-bit encrypted simulated transaction.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
