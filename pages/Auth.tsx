import React, { useState } from 'react';
import { useAuth } from '../App';
import { Input, Button, Card } from '../components/UI';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) throw new Error("Email and Password are required");
        await login(email, password);
      } else {
        if (!name || !email || !password) throw new Error("Name, Email, and Password are required");
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Real Indian NGO Group Background - Full Display */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-image.jpg"
            alt="Indian NGO volunteers group"
            className="w-full h-full object-cover object-center"
          />
          {/* Lighter gradient to show more photo but darker base for dark mode */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-900/30"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">


          {/* Hero Content */}
          <div className="text-white space-y-8 animate-in slide-in-from-left-8 duration-700 pt-20">
            <div
              onClick={() => {
                setIsLogin(false);
                document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-sm font-bold text-indigo-200 shadow-lg hover:bg-indigo-500/30 transition-colors cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Join Our Mission
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-2xl text-white">
              Empowering India,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Together.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-200 max-w-xl leading-relaxed drop-shadow-md font-medium">
              Join hands with thousands of volunteers and NGOs working on the ground. From rural education to women empowerment, your contribution creates real change.
            </p>

            <div className="flex gap-8 pt-4 border-t border-white/10">
              <div>
                <div className="text-4xl font-bold text-white mb-1 drop-shadow-md">500+</div>
                <div className="text-sm text-slate-300 uppercase tracking-wider font-semibold">NGOs Verified</div>
              </div>
              <div className="w-px bg-white/20 h-12"></div>
              <div>
                <div className="text-4xl font-bold text-white mb-1 drop-shadow-md">₹12Cr+</div>
                <div className="text-sm text-slate-300 uppercase tracking-wider font-semibold">Funds Raised</div>
              </div>
              <div className="w-px bg-white/20 h-12"></div>
              <div>
                <div className="text-4xl font-bold text-white mb-1 drop-shadow-md">2.5L+</div>
                <div className="text-sm text-slate-300 uppercase tracking-wider font-semibold">Lives Touched</div>
              </div>
            </div>
          </div>

          {/* Auth Card - Right Side Overlay */}
          <div id="auth-card" className="w-full max-w-md ml-auto animate-in slide-in-from-right-8 duration-700 delay-100">
            <Card className="p-8 backdrop-blur-xl bg-slate-900/90 border border-slate-700/50 shadow-2xl rounded-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isLogin ? 'Welcome Back' : 'Join the Movement'}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {isLogin ? 'Log in to track your impact' : 'Start your journey of giving today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="e.g. Rahul Verma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                />

                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-indigo-400 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      )}
                    </button>
                  }
                />

                {error && (
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full text-lg h-12 font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50" isLoading={loading}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {isLogin ? "Don't have an account? Join now" : "Already a member? Sign in"}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* --- CAUSE CARDS SECTION --- */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Key Initiatives</h2>
          <p className="text-slate-400 leading-relaxed">
            We focus on sustainable development across three core pillars. Your support helps us create lasting change in these critical areas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Education Card */}
          <div className="group bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-slate-700">
            <div className="h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop"
                alt="Indian classroom education"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Education for All</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Providing quality education, digital literacy, and school supplies to children in remote villages, bridging the urban-rural divide.
              </p>
            </div>
          </div>

          {/* Health Card */}
          <div className="group bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-slate-700">
            <div className="h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop"
                alt="Medical camp rural India"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center text-green-400 mb-4 border border-green-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Accessible Healthcare</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Organizing medical camps, maternal care support, and providing essential medicines to the elderly and underserved communities.
              </p>
            </div>
          </div>

          {/* Environment/Livelihood Card */}
          <div className="group bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-slate-700">
            <div className="h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=2070&auto=format&fit=crop"
                alt="Indian women farmers group Nagpur"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sustainable Livelihood</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Empowering rural women through self-help groups, skill development, and sustainable income opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
