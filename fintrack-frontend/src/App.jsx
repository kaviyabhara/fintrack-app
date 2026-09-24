import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, PlusCircle, Trash2, 
  Search, PieChart as PieIcon, LayoutDashboard, List
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend 
} from 'recharts';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Input states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('INCOME');
  const [category, setCategory] = useState('SALARY');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => { 
    fetchTransactions(); 
  }, []);

  // Direct Button Click Handler
  const handleAddTransaction = async () => {
    if (!title.trim()) {
      alert('Please enter a Transaction Title');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid Amount greater than 0');
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      type: type,
      category: category,
      date: date || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('http://localhost:8080/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Reset form inputs
        setTitle('');
        setAmount('');
        setType('INCOME');
        setCategory('SALARY');
        setDate(new Date().toISOString().split('T')[0]);
        
        // Refresh transaction table from backend
        await fetchTransactions();
      } else {
        alert('Backend rejected entry. Check Spring Boot logs.');
      }
    } catch (err) {
      alert('Connection Error: Make sure Spring Boot is running on port 8080.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/v1/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  // Financial Calculations
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  // Search & Filtered List
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Chart Data
  const categoryData = Object.entries(
    transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Header */}
      <header style={{ borderBottom: '1px solid #1f2937', backgroundColor: '#111827', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '10px', borderRadius: '10px' }}>
              <Wallet size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>FinTrack Enterprise</h1>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Personal Financial Intelligence</span>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '8px', backgroundColor: '#1f2937', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'dashboard' ? '#3b82f6' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('transactions')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'transactions' ? '#3b82f6' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>
              <List size={16} /> History
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <MetricCard title="Net Balance" amount={netBalance} icon={<Wallet color="#3b82f6" />} badge="Real-time Balance" color="#3b82f6" />
          <MetricCard title="Total Income" amount={totalIncome} icon={<TrendingUp color="#10b981" />} badge="Active Stream" color="#10b981" />
          <MetricCard title="Total Expenses" amount={totalExpense} icon={<TrendingDown color="#ef4444" />} badge="Expense Ledger" color="#ef4444" />
        </div>

        {activeTab === 'dashboard' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Form Controls */}
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={20} color="#3b82f6" /> Log New Transaction
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Transaction Title (e.g. Salary, Rent)" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    style={inputStyle} 
                  />
                  <input 
                    type="number" 
                    placeholder="Amount (₹)" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    style={inputStyle} 
                  />
                  
                  <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                    <option value="INCOME">Income (+)</option>
                    <option value="EXPENSE">Expense (-)</option>
                  </select>

                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                    <option value="SALARY">Salary & Yield</option>
                    <option value="FOOD">Food & Dining</option>
                    <option value="RENT">Housing & Rent</option>
                    <option value="UTILITIES">Utilities</option>
                    <option value="ENTERTAINMENT">Entertainment</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>

                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    style={{ ...inputStyle, gridColumn: 'span 2' }} 
                  />

                  <button 
                    type="button" 
                    onClick={handleAddTransaction}
                    style={{ gridColumn: 'span 2', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                    Record Transaction
                  </button>
                </div>
              </div>

              {/* History Ledger */}
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Recent Ledger Entries</h3>
                <TransactionTable items={transactions.slice(0, 5)} onDelete={handleDelete} />
              </div>
            </div>

            {/* Analytics */}
            <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieIcon size={20} color="#8b5cf6" /> Expense Breakdown
              </h3>

              {categoryData.length > 0 ? (
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(val) => `₹${val}`} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>No expense data logged yet.</p>
              )}
            </div>

          </div>
        ) : (
          /* History Page */
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search title or category..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  style={{ ...inputStyle, paddingLeft: '40px', width: '100%' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
                  <option value="ALL">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>

                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={inputStyle}>
                  <option value="ALL">All Categories</option>
                  <option value="SALARY">Salary & Yield</option>
                  <option value="FOOD">Food & Dining</option>
                  <option value="RENT">Housing & Rent</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="INVESTMENT">Investment</option>
                </select>
              </div>
            </div>

            <TransactionTable items={filteredTransactions} onDelete={handleDelete} />
          </div>
        )}

      </main>
    </div>
  );
}

function MetricCard({ title, amount, icon, badge, color }) {
  return (
    <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>{title}</span>
        <div style={{ backgroundColor: '#1f2937', padding: '8px', borderRadius: '8px' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>₹{(amount || 0).toLocaleString('en-IN')}</div>
      <span style={{ fontSize: '12px', color: color, backgroundColor: `${color}15`, padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>{badge}</span>
    </div>
  );
}

function TransactionTable({ items, onDelete }) {
  if (items.length === 0) {
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>No matching transactions recorded.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1f2937', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px' }}>Title</th>
            <th style={{ padding: '12px' }}>Category</th>
            <th style={{ padding: '12px' }}>Date</th>
            <th style={{ padding: '12px' }}>Amount</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #1f2937' }}>
              <td style={{ padding: '16px 12px', fontWeight: '600' }}>{item.title}</td>
              <td style={{ padding: '16px 12px' }}>
                <span style={{ backgroundColor: '#1f2937', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#9ca3af' }}>{item.category}</span>
              </td>
              <td style={{ padding: '16px 12px', color: '#9ca3af', fontSize: '14px' }}>{item.date}</td>
              <td style={{ padding: '16px 12px', fontWeight: '700', color: item.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
                {item.type === 'INCOME' ? '+' : '-'}₹{Number(item.amount).toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                <button onClick={() => onDelete(item.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none'
};