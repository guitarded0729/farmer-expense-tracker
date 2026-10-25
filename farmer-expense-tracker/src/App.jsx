import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import * as api from './services/api';
import './App.css';
import {
  Sprout,
  Droplets,
  Users,
  Wrench,
  Coins,
  ShieldAlert,
  Tag,
  Building,
  Truck,
  AlertTriangle,
  Heart
} from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import CreatePrimaryFarmerGate from './components/CreatePrimaryFarmerGate';
import ShareModal from './components/ShareModal';
import AddCoFarmerModal from './components/AddCoFarmerModal';

// Views
import DashboardView from './views/DashboardView';
import ExpensesView from './views/ExpensesView';
import IncomeView from './views/IncomeView';
import AnalyticsView from './views/AnalyticsView';
import BudgetsView from './views/BudgetsView';
import FieldsView from './views/FieldsView';
import PredictionView from './views/PredictionView';
import UnusualView from './views/UnusualView';
import SettingsView from './views/SettingsView';
import SeasonsView from './views/SeasonsView';

/* ------------------------------------------------------------------ */
/* Design Tokens / Config Constants                                    */
/* ------------------------------------------------------------------ */
const CATEGORIES = {
  seeds: { label: 'Seeds', color: '#2e7d32', icon: Sprout },
  fertilizer: { label: 'Fertilizer', color: '#f57c00', icon: Droplets },
  labor: { label: 'Labor', color: '#0284c7', icon: Users },
  equipment: { label: 'Equipment', color: '#d32f2f', icon: Wrench },
  irrigation: { label: 'Irrigation', color: '#0284c7', icon: Droplets },
  pesticides: { label: 'Pesticides', color: '#9c27b0', icon: ShieldAlert },
  transportation: { label: 'Transportation', color: '#ff5722', icon: Truck },
  maintenance: { label: 'Maintenance', color: '#795548', icon: Wrench },
  other: { label: 'Other', color: '#757575', icon: Tag }
};

const INCOME_CATEGORIES = {
  crop_sale: { label: 'Crop Sale', color: '#2e7d32', icon: Coins },
  subsidy: { label: 'Government Subsidy', color: '#1976d2', icon: Building },
  produce_sale: { label: 'Produce Sale', color: '#5d4037', icon: Coins },
  other: { label: 'Other', color: '#757575', icon: Tag }
};

const CATEGORY_OPTIONS = [
  'Organic Farming',
  'Commercial Paddy/Wheat',
  'Horticulture & Fruits',
  'Cotton & Cash Crops',
  'Dairy & Livestock',
  'Mixed Agriculture'
];

const REGION_OPTIONS = [
  'North Zone (Punjab/Haryana/UP)',
  'Central Zone (MP/Maharashtra)',
  'South Zone (AP/Telangana/TN)',
  'East Zone (WB/Bihar/Odisha)',
  'West Zone (Gujarat/Rajasthan)'
];

const SCALE_OPTIONS = [
  'Smallholder (< 2 Ha)',
  'Medium Farm (2-10 Ha)',
  'Commercial Estate (> 10 Ha)'
];

const STORAGE_KEY = 'farm-ledger-v3';
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function FarmLedgerContent() {
  const { t, lang } = useTranslation();
  const [farmers, setFarmers] = useState([]);
  const [activeFarmerId, setActiveFarmerId] = useState(() => localStorage.getItem('farmer_active_id') || null);
  const [seasons, setSeasons] = useState([]);
  const [fields, setFields] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgetsState] = useState({});
  const [activeSeasonId, setActiveSeasonId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Layout States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenseFormModeOnLoad, setExpenseFormModeOnLoad] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddFarmerModal, setShowAddFarmerModal] = useState(false);
  const [openAddPlotModal, setOpenAddPlotModal] = useState(false);
  const [openAddSeasonModal, setOpenAddSeasonModal] = useState(false);

  // Persist activeFarmerId
  useEffect(() => {
    if (activeFarmerId) {
      localStorage.setItem('farmer_active_id', activeFarmerId);
    } else {
      localStorage.removeItem('farmer_active_id');
    }
  }, [activeFarmerId]);

  const [inviteUrlData, setInviteUrlData] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get('invite');
      const farmNameParam = params.get('farm');
      if (inviteCode && farmNameParam) {
        return { inviteCode, farmName: decodeURIComponent(farmNameParam) };
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  /* ---- Load Initial Data from Backend API / Local Hybrid Storage ---- */
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setLoading(true);
      setApiError(null);
      try {
        const [fetchedFarmers, fetchedSeasons, fetchedTx, fetchedFields] = await Promise.all([
          api.getFarmers(),
          api.getSeasons(),
          api.getTransactions(),
          api.getFields()
        ]);

        if (!isMounted) return;

        const farmersList = fetchedFarmers || [];
        setFarmers(farmersList);
        setSeasons(fetchedSeasons || []);
        setTransactions(fetchedTx || []);
        setFields(fetchedFields || []);

        if (fetchedSeasons && fetchedSeasons.length > 0) {
          const sorted = [...fetchedSeasons].sort((a, b) => a.order - b.order);
          setActiveSeasonId((prev) => prev || sorted[sorted.length - 1].id);
        }

        if (farmersList.length > 0) {
          setActiveFarmerId((prev) => prev || farmersList[0].id);
        }
      } catch (err) {
        console.warn('Initial data load notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  /* ---- Load Budgets whenever Active Farmer or Season Changes ---- */
  useEffect(() => {
    if (activeFarmerId && activeSeasonId) {
      api.getBudgets(activeFarmerId, activeSeasonId)
        .then((b) => setBudgetsState(b || {}))
        .catch((e) => console.warn('Failed to fetch budgets for farmer/season:', e));
    }
  }, [activeFarmerId, activeSeasonId]);

  /* ---- Budget limit saver ---- */
  const handleSaveBudget = async (budgetData) => {
    if (!activeFarmerId || !activeSeasonId) return;
    try {
      await api.upsertBudget({
        farmerId: activeFarmerId,
        seasonId: activeSeasonId,
        category: budgetData.category,
        amount: Number(budgetData.amount) || 0
      });
      setBudgetsState((prev) => ({
        ...prev,
        [budgetData.category]: Number(budgetData.amount)
      }));
    } catch (err) {
      alert('Failed to save budget limit: ' + err.message);
    }
  };

  /* ---- Field Plot Helpers ---- */
  const addField = async (fieldData) => {
    if (!activeFarmerId || !activeSeasonId) return;
    try {
      const fullField = { ...fieldData, farmerId: activeFarmerId, seasonId: activeSeasonId };
      const created = await api.createField(fullField);
      setFields((prev) => [...prev, created]);
    } catch (err) {
      alert('Failed to add field plot: ' + err.message);
    }
  };

  const updateField = async (id, patch) => {
    try {
      const updated = await api.updateField(id, patch);
      setFields((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (err) {
      alert('Failed to update field details: ' + err.message);
    }
  };

  const deleteField = async (id) => {
    try {
      await api.deleteField(id);
      setFields((prev) => prev.filter((x) => x.id !== id));
      setTransactions((prev) => prev.map((t) => (t.fieldId === id ? { ...t, fieldId: null } : t)));
    } catch (err) {
      alert('Failed to delete field plot: ' + err.message);
    }
  };

  /* ---- Season Helpers ---- */
  const addSeason = async (seasonData) => {
    try {
      const created = await api.createSeason(seasonData);
      setSeasons((prev) => [...prev, created]);
      setActiveSeasonId(created.id);
    } catch (err) {
      alert('Failed to add season: ' + err.message);
    }
  };

  const updateSeason = async (id, patch) => {
    try {
      const updated = await api.updateSeason(id, patch);
      setSeasons((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (err) {
      alert('Failed to update season: ' + err.message);
    }
  };

  const handleAddPlotClick = () => {
    setActiveTab('settings');
    setOpenAddPlotModal(true);
  };

  const handleAddSeasonClick = () => {
    setActiveTab('seasons');
    setOpenAddSeasonModal(true);
  };

  /* ---- Derived States ---- */
  const activeFarmer = useMemo(() => {
    if (!farmers.length) return null;
    return farmers.find((f) => f.id === activeFarmerId) || farmers[0];
  }, [farmers, activeFarmerId]);

  const seasonsSorted = useMemo(() => {
    return [...seasons].sort((a, b) => a.order - b.order);
  }, [seasons]);

  const activeSeason = useMemo(() => {
    return seasonsSorted.find((s) => s.id === activeSeasonId) || seasonsSorted[seasonsSorted.length - 1];
  }, [seasonsSorted, activeSeasonId]);

  /* ---- Select active profile ---- */
  const handleSelectFarmer = (farmerId) => {
    setActiveFarmerId(farmerId);
  };

  const handleCreatePrimaryFarmer = async (newFarmer) => {
    try {
      const created = await api.createFarmer(newFarmer);
      setFarmers((prev) => [...prev, created]);
      setActiveFarmerId(created.id);

      if (!seasons.length) {
        const s = await api.createSeason({ name: 'Kharif 2026 (Season 1)', order: 1 });
        setSeasons([s]);
        setActiveSeasonId(s.id);
      }
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    }
  };

  const handleUpdateFarmer = async (updatedFarmer) => {
    try {
      const updated = await api.updateFarmer(updatedFarmer.id, updatedFarmer);
      setFarmers((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  const handleAddCoFarmer = async (newCoFarmer) => {
    try {
      const created = await api.createFarmer(newCoFarmer);
      setFarmers((prev) => [...prev, created]);
    } catch (err) {
      alert('Failed to add co-farmer profile: ' + err.message);
    }
  };

  // Seeding full Mohan Prasad datasets
  const handleLoadDemoData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const farmer = await api.createFarmer({
        name: 'Mohan Prasad',
        farmName: 'Green Valley Farm',
        role: 'Primary Operator',
        category: 'Organic Rice & Wheat',
        region: 'Western Plains (Zone 4)',
        scale: 'Mid-Scale Farmer',
        phone: '+91 98765 43210',
        email: 'mohan.prasad@greenvalley.com',
        equityShare: 100
      });

      const s1 = await api.createSeason({ name: 'Kharif 2023 (Season 1)', order: 1 });
      const s2 = await api.createSeason({ name: 'Rabi 2023 (Season 2)', order: 2 });
      const s3 = await api.createSeason({ name: 'Kharif 2024 (Season 3)', order: 3 });
      const s4 = await api.createSeason({ name: 'Rabi 2024 (Season 4)', order: 4 });
      const s5 = await api.createSeason({ name: 'Kharif 2025 (Season 5)', order: 5 });

      const field1 = await api.createField({
        farmerId: farmer.id,
        seasonId: s5.id,
        name: 'North Terrace Plot',
        crop: 'Basmati Rice',
        area: 4.5,
        areaUnit: 'acres',
        location: '26.8467° N, 80.9462° E'
      });

      const field2 = await api.createField({
        farmerId: farmer.id,
        seasonId: s5.id,
        name: 'South Meadows Plot',
        crop: 'Premium Wheat',
        area: 3.2,
        areaUnit: 'acres',
        location: '26.8471° N, 80.9469° E'
      });

      const prevField1 = await api.createField({
        farmerId: farmer.id,
        seasonId: s4.id,
        name: 'North Terrace Plot',
        crop: 'Wheat',
        area: 4.5,
        areaUnit: 'acres',
        location: '26.8467° N, 80.9462° E'
      });

      const dummyReceipt = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const txsData = [
        { seasonId: s1.id, farmerId: farmer.id, type: 'expense', category: 'seeds', amount: 10000, note: 'Pusa Rice Seeds', date: '2023-06-15', crop: 'Rice', unusual: false },
        { seasonId: s1.id, farmerId: farmer.id, type: 'expense', category: 'fertilizer', amount: 12000, note: 'DAP & Urea bags', date: '2023-07-02', crop: 'Rice', unusual: false },
        { seasonId: s1.id, farmerId: farmer.id, type: 'expense', category: 'labor', amount: 8000, note: 'Sowing operations labor', date: '2023-06-20', crop: 'Rice', unusual: false },
        { seasonId: s1.id, farmerId: farmer.id, type: 'expense', category: 'irrigation', amount: 5000, note: 'Diesel pump rental', date: '2023-08-01', crop: 'Rice', unusual: false },
        { seasonId: s1.id, farmerId: farmer.id, type: 'income', category: 'crop_sale', amount: 62000, note: 'Co-op Rice Harvest Sale', date: '2023-11-10', crop: 'Rice', unusual: false },

        { seasonId: s2.id, farmerId: farmer.id, type: 'expense', category: 'seeds', amount: 11000, note: 'HD-3086 Wheat Seeds', date: '2023-11-20', crop: 'Wheat', unusual: false },
        { seasonId: s2.id, farmerId: farmer.id, type: 'expense', category: 'fertilizer', amount: 13500, note: 'NPK fertilizer mix', date: '2023-12-05', crop: 'Wheat', unusual: false },
        { seasonId: s2.id, farmerId: farmer.id, type: 'expense', category: 'labor', amount: 9500, note: 'Harvesting labor', date: '2024-03-25', crop: 'Wheat', unusual: false },
        { seasonId: s2.id, farmerId: farmer.id, type: 'expense', category: 'irrigation', amount: 6000, note: 'Tube-well electricity cost', date: '2024-01-10', crop: 'Wheat', unusual: false },
        { seasonId: s2.id, farmerId: farmer.id, type: 'income', category: 'crop_sale', amount: 70000, note: 'Mandi Wheat Sale', date: '2024-04-12', crop: 'Wheat', unusual: false },

        { seasonId: s3.id, farmerId: farmer.id, type: 'expense', category: 'seeds', amount: 12500, note: 'Basmati Seed Sowing', date: '2024-06-18', crop: 'Rice', unusual: false },
        { seasonId: s3.id, farmerId: farmer.id, type: 'expense', category: 'fertilizer', amount: 15000, note: 'Organic fertilizer bags', date: '2024-07-10', crop: 'Rice', unusual: false },
        { seasonId: s3.id, farmerId: farmer.id, type: 'expense', category: 'labor', amount: 11000, note: 'Weeding and transplantation', date: '2024-07-28', crop: 'Rice', unusual: false },
        { seasonId: s3.id, farmerId: farmer.id, type: 'expense', category: 'irrigation', amount: 7500, note: 'Borewell repair & diesel', date: '2024-08-15', crop: 'Rice', unusual: false },
        { seasonId: s3.id, farmerId: farmer.id, type: 'income', category: 'crop_sale', amount: 79000, note: 'Rice harvest sale to trader', date: '2024-11-05', crop: 'Rice', unusual: false },
        { seasonId: s3.id, farmerId: farmer.id, type: 'income', category: 'subsidy', amount: 8000, note: 'PM-Kisan Subsidy Scheme', date: '2024-09-01', unusual: false },

        { seasonId: s4.id, farmerId: farmer.id, type: 'expense', category: 'seeds', amount: 14500, note: 'Wheat Seed Varieties', date: '2024-11-22', crop: 'Wheat', unusual: false, fieldId: prevField1.id },
        { seasonId: s4.id, farmerId: farmer.id, type: 'expense', category: 'fertilizer', amount: 17000, note: 'Potash & Urea inputs', date: '2024-12-10', crop: 'Wheat', unusual: false, fieldId: prevField1.id },
        { seasonId: s4.id, farmerId: farmer.id, type: 'expense', category: 'labor', amount: 12000, note: 'Field leveling and sorting labor', date: '2025-01-05', crop: 'Wheat', unusual: false, fieldId: prevField1.id },
        { seasonId: s4.id, farmerId: farmer.id, type: 'expense', category: 'irrigation', amount: 8500, note: 'Drip irrigation maintenance', date: '2025-01-20', crop: 'Wheat', unusual: false, fieldId: prevField1.id },
        { seasonId: s4.id, farmerId: farmer.id, type: 'income', category: 'crop_sale', amount: 88000, note: 'Wheat sale to Food Corp', date: '2025-04-18', crop: 'Wheat', unusual: false },

        { seasonId: s5.id, farmerId: farmer.id, type: 'expense', category: 'seeds', amount: 16500, note: 'High-yield hybrid Basmati seeds', date: '2025-06-12', crop: 'Basmati Rice', fieldId: field1.id, unusual: false },
        { seasonId: s5.id, farmerId: farmer.id, type: 'expense', category: 'fertilizer', amount: 21000, note: 'Bulk organic compost', date: '2025-07-05', crop: 'Basmati Rice', fieldId: field1.id, unusual: false, receipt: dummyReceipt },
        { seasonId: s5.id, farmerId: farmer.id, type: 'expense', category: 'labor', amount: 14000, note: 'Sowing & transplant labor', date: '2025-06-25', crop: 'Basmati Rice', fieldId: field1.id, unusual: false },
        { seasonId: s5.id, farmerId: farmer.id, type: 'expense', category: 'irrigation', amount: 11000, note: 'Canal water lease charges', date: '2025-08-01', crop: 'Basmati Rice', fieldId: field1.id, unusual: false },
        { seasonId: s5.id, farmerId: farmer.id, type: 'expense', category: 'equipment', amount: 18500, note: 'Tractor transmission breakdown rebuild', date: '2025-08-10', crop: 'Basmati Rice', fieldId: field1.id, unusual: true },
        {
          seasonId: s5.id, farmerId: farmer.id, type: 'expense', category: 'pesticides', amount: 6000, note: 'Neem oil insecticide spray', date: '2025-08-14', crop: 'Basmati Rice', fieldId: field1.id, unusual: false,
          splitNames: JSON.stringify([
            { id: 'f-patel40', name: 'Suresh Patel', share: 40, paid: false }
          ])
        },
        { seasonId: s5.id, farmerId: farmer.id, type: 'income', category: 'crop_sale', amount: 112000, note: 'Export Quality Basmati Sale', date: '2025-10-15', crop: 'Basmati Rice', unusual: false }
      ];

      for (const tx of txsData) {
        await api.createTransaction(tx);
      }

      await api.upsertBudget({ farmerId: farmer.id, seasonId: s5.id, category: 'seeds', amount: 15000 });
      await api.upsertBudget({ farmerId: farmer.id, seasonId: s5.id, category: 'fertilizer', amount: 20000 });
      await api.upsertBudget({ farmerId: farmer.id, seasonId: s5.id, category: 'labor', amount: 16000 });
      await api.upsertBudget({ farmerId: farmer.id, seasonId: s5.id, category: 'irrigation', amount: 12000 });
      await api.upsertBudget({ farmerId: farmer.id, seasonId: s5.id, category: 'pesticides', amount: 8000 });
      await api.upsertBudget({ farmerId: farmer.id, seasonId: s5.id, category: 'equipment', amount: 5000 });

      const [fetchedFarmers, fetchedSeasons, fetchedTx, fetchedFields] = await Promise.all([
        api.getFarmers(),
        api.getSeasons(),
        api.getTransactions(),
        api.getFields()
      ]);

      const fetchedBudgets = await api.getBudgets(farmer.id, s5.id);

      setFarmers(fetchedFarmers);
      setSeasons(fetchedSeasons);
      setTransactions(fetchedTx);
      setFields(fetchedFields);
      setBudgetsState(fetchedBudgets);

      setActiveFarmerId(farmer.id);
      setActiveSeasonId(s5.id);

      alert("Mohan Prasad's historical farm data loaded successfully!");
    } catch (err) {
      alert('Failed to load demo dataset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async (id, patch) => {
    try {
      const updated = await api.updateTransaction(id, patch);
      setTransactions((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (err) {
      alert('Failed to update transaction: ' + err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert('Failed to delete transaction: ' + err.message);
    }
  };

  const handleAddTransaction = async (payload) => {
    try {
      const created = await api.createTransaction(payload);
      setTransactions((prev) => [...prev, created]);
    } catch (err) {
      alert('Failed to log transaction: ' + err.message);
    }
  };

  const handleResetDatabase = () => {
    localStorage.removeItem('farmer_active_id');
    setFarmers([]);
    setSeasons([]);
    setTransactions([]);
    setFields([]);
    setBudgetsState({});
    setActiveFarmerId(null);
    setActiveSeasonId(null);
    window.location.reload();
  };

  const handleLogout = () => {
    setActiveFarmerId(null);
  };

  // CSV Import / Export Handler
  const exportToCSV = (type = 'expense') => {
    const list = transactions.filter((t) => t.type === type && t.farmerId === activeFarmerId && t.seasonId === activeSeasonId);
    if (list.length === 0) {
      alert(`No ${type} transactions logged to export!`);
      return;
    }
    const headers = ['Date', 'Type', 'Category', 'Amount (INR)', 'Crop', 'Field ID', 'Unusual', 'Note'];
    const rows = list.map((t) => [
      t.date,
      t.type,
      t.category,
      t.amount,
      t.crop || '',
      t.fieldId || '',
      t.unusual ? 'TRUE' : 'FALSE',
      (t.note || '').replace(/"/g, '""')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((val) => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeFarmer?.name || 'farmer'}_${type}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImport = (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const errors = [];
      const validTxList = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length < 4) {
          errors.push(`Row ${i + 1}: Insufficient columns. Need at least Date, Type, Category, Amount.`);
          continue;
        }

        const date = parts[0]?.replace(/"/g, '').trim();
        const type = parts[1]?.replace(/"/g, '').trim().toLowerCase();
        const category = parts[2]?.replace(/"/g, '').trim().toLowerCase();
        const amountStr = parts[3]?.replace(/"/g, '').trim();
        const crop = parts[4]?.replace(/"/g, '').trim() || null;
        const fieldVal = parts[5]?.replace(/"/g, '').trim() || null;
        const unusualStr = parts[6]?.replace(/"/g, '').trim().toUpperCase();
        const note = parts[7]?.replace(/"/g, '').trim() || '';

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
          errors.push(`Row ${i + 1}: Amount "${amountStr}" must be a positive number.`);
          continue;
        }
        if (!date || isNaN(Date.parse(date))) {
          errors.push(`Row ${i + 1}: Date "${date}" is invalid.`);
          continue;
        }
        if (type !== 'expense' && type !== 'income') {
          errors.push(`Row ${i + 1}: Type "${type}" must be 'expense' or 'income'.`);
          continue;
        }

        if (type === 'expense' && !CATEGORIES[category]) {
          errors.push(`Row ${i + 1}: Category "${category}" is not a valid expense category.`);
          continue;
        }
        if (type === 'income' && !INCOME_CATEGORIES[category] && category !== 'income') {
          errors.push(`Row ${i + 1}: Category "${category}" is not a valid income category.`);
          continue;
        }

        let fieldId = null;
        if (fieldVal) {
          const matchField = fields.find((f) => f.id === fieldVal || f.name.toLowerCase() === fieldVal.toLowerCase());
          if (matchField) {
            fieldId = matchField.id;
          }
        }

        validTxList.push({
          seasonId: activeSeasonId,
          farmerId: activeFarmerId,
          type,
          category: category === 'income' ? 'crop_sale' : category,
          amount,
          note,
          date,
          unusual: unusualStr === 'TRUE',
          crop,
          fieldId,
          receipt: null,
          splitNames: ''
        });
      }

      if (errors.length > 0) {
        alert(`CSV Import Failed with ${errors.length} validation errors:\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...and more.' : ''}`);
        return;
      }

      try {
        const added = [];
        for (const tx of validTxList) {
          const created = await api.createTransaction(tx);
          added.push(created);
        }
        setTransactions((prev) => [...prev, ...added]);
        alert(`Successfully imported ${validTxList.length} transactions from CSV!`);
      } catch (err) {
        alert('Failed to insert imported transactions: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyRecommendedBudget = async (recBudgetAmt) => {
    if (!activeFarmerId || !activeSeasonId) return;
    try {
      alert('Applying next-season recommended budgets for all categories (calculated using OLS + 10% safety margin).');
      const catPredictions = {};
      const seasonStats = [];
      const map = {};
      transactions
        .filter((t) => t.farmerId === activeFarmerId && t.type === 'expense')
        .forEach((t) => {
          map[t.seasonId] = (map[t.seasonId] || 0) + Number(t.amount);
        });
      
      const sortedSeasons = [...seasons].sort((a, b) => a.order - b.order);
      const activeStats = sortedSeasons
        .map((s) => ({ id: s.id, spent: map[s.id] || 0 }))
        .filter((s) => s.spent > 0);

      const n = activeStats.length;
      if (n >= 3) {
        const catMap = {};
        transactions
          .filter((t) => t.farmerId === activeFarmerId && t.type === 'expense')
          .forEach((t) => {
            if (!catMap[t.category]) catMap[t.category] = {};
            catMap[t.category][t.seasonId] = (catMap[t.category][t.seasonId] || 0) + Number(t.amount);
          });

        for (const cat of Object.keys(CATEGORIES)) {
          const dataPoints = activeStats.map((s, idx) => ({
            x: idx,
            y: catMap[cat]?.[s.id] || 0
          }));

          const sx = dataPoints.reduce((sum, p) => sum + p.x, 0);
          const sy = dataPoints.reduce((sum, p) => sum + p.y, 0);
          const sxy = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
          const sxx = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);

          const denom = n * sxx - sx * sx;
          let slope = 0;
          let intercept = 0;
          if (denom !== 0) {
            slope = (n * sxy - sx * sy) / denom;
            intercept = (sy - slope * sx) / n;
          } else {
            intercept = sy / n;
          }

          const predictedVal = Math.max(slope * n + intercept, 0);
          const recCategoryBudget = Math.round(predictedVal * 1.10);
          
          await api.upsertBudget({
            farmerId: activeFarmerId,
            seasonId: activeSeasonId,
            category: cat,
            amount: recCategoryBudget
          });
          
          catPredictions[cat] = recCategoryBudget;
        }

        setBudgetsState(catPredictions);
        alert('Recommended budgets applied successfully!');
      }
    } catch (err) {
      alert('Failed to apply recommended budgets: ' + err.message);
    }
  };

  /* ---- View Boot / Error spinners ---- */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 400 }}>
          <div className="animate-pulse-subtle" style={{ color: 'var(--primary)', marginBottom: 12 }}>
            <Sprout size={36} />
          </div>
          <h3 className="display-font" style={{ fontSize: 18, margin: 0 }}>{t('common.loading')}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 6 }}>{t('common.syncing')}</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-dark)', padding: 16 }}>
        <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <AlertTriangle size={36} color="var(--danger)" style={{ marginBottom: 12, margin: '0 auto 12px' }} />
          <h3 className="display-font" style={{ fontSize: 18, color: 'var(--danger)', margin: 0 }}>Database Connection Notice</h3>
          <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: '8px 0 16px', lineHeight: 1.5 }}>
            Could not connect to the remote backend API. You can continue using KrishiKhaata in client storage mode with full offline functionality.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setApiError(null)}>
              Continue in Demo / Client Mode
            </button>
            <button className="btn" onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Registration / Onboarding Portal Gate ---- */
  if (!activeFarmer) {
    return (
      <CreatePrimaryFarmerGate
        farmers={farmers}
        onSelectFarmer={handleSelectFarmer}
        onCreate={handleCreatePrimaryFarmer}
        inviteUrlData={inviteUrlData}
        onLoadDemo={handleLoadDemoData}
        CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        REGION_OPTIONS={REGION_OPTIONS}
        SCALE_OPTIONS={SCALE_OPTIONS}
      />
    );
  }

  return (
    <div className="app-layout-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeFarmer={activeFarmer}
        farmersCount={farmers.length}
        fieldsCount={fields.filter((f) => f.farmerId === activeFarmer.id).length}
        unusualCount={transactions.filter((t) => t.type === 'expense' && t.unusual && t.farmerId === activeFarmer.id && t.seasonId === activeSeasonId).length}
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
      />

      {/* Main Content Layout Container */}
      <div className="main-content-pane">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          farmers={farmers}
          activeFarmer={activeFarmer}
          onSelectFarmer={handleSelectFarmer}
          onOpenShareModal={() => setShowShareModal(true)}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Selected View Rendering */}
        <main className="main-pane">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              budgets={budgets}
              fields={fields.filter((f) => f.farmerId === activeFarmer.id)}
              seasons={seasons}
              activeSeason={activeSeason}
              activeFarmer={activeFarmer}
              farmers={farmers}
              onNavigate={setActiveTab}
              onAddExpenseClick={() => {
                setActiveTab('expenses');
                setExpenseFormModeOnLoad('expense');
              }}
              onAddIncomeClick={() => {
                setActiveTab('expenses');
                setExpenseFormModeOnLoad('income');
              }}
              setActiveSeasonId={setActiveSeasonId}
              onAddPlotClick={handleAddPlotClick}
              onAddSeasonClick={handleAddSeasonClick}
              onAddFarmerClick={() => setShowAddFarmerModal(true)}
              fmt={fmt}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              transactions={transactions}
              fields={fields}
              seasons={seasons}
              activeSeason={activeSeason}
              activeFarmer={activeFarmer}
              farmers={farmers}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onImportCsv={handleCSVImport}
              onExportCsv={exportToCSV}
              CATEGORIES={CATEGORIES}
              INCOME_CATEGORIES={INCOME_CATEGORIES}
              expenseFormModeOnLoad={expenseFormModeOnLoad}
              clearExpenseFormModeOnLoad={() => setExpenseFormModeOnLoad(null)}
              fmt={fmt}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              transactions={transactions}
              fields={fields}
              seasons={seasons}
              activeSeason={activeSeason}
              activeFarmer={activeFarmer}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onImportCsv={handleCSVImport}
              onExportCsv={exportToCSV}
              INCOME_CATEGORIES={INCOME_CATEGORIES}
              fmt={fmt}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              seasons={seasons}
              activeSeason={activeSeason}
              activeFarmer={activeFarmer}
              CATEGORIES={CATEGORIES}
              INCOME_CATEGORIES={INCOME_CATEGORIES}
              fmt={fmt}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              transactions={transactions}
              budgets={budgets}
              activeSeason={activeSeason}
              activeFarmer={activeFarmer}
              onSaveBudget={handleSaveBudget}
              CATEGORIES={CATEGORIES}
              fmt={fmt}
            />
          )}

          {activeTab === 'fields' && (
            <FieldsView
              fields={fields.filter((f) => f.farmerId === activeFarmer.id)}
              transactions={transactions}
              seasons={seasons}
              activeSeason={activeSeason}
              activeFarmer={activeFarmer}
              onAddField={addField}
              onUpdateField={updateField}
              onDeleteField={deleteField}
              fmt={fmt}
            />
          )}

          {activeTab === 'prediction' && (
            <PredictionView
              transactions={transactions}
              seasons={seasons}
              activeSeason={activeSeason}
              activeFarmer={activeFarmer}
              budgets={budgets}
              onApplyRecommendedBudget={handleApplyRecommendedBudget}
              CATEGORIES={CATEGORIES}
              fmt={fmt}
            />
          )}

          {activeTab === 'unusual' && (
            <UnusualView
              transactions={transactions}
              fields={fields}
              activeSeason={activeSeason}
              activeFarmer={activeFarmer}
              onDeleteTransaction={handleDeleteTransaction}
              CATEGORIES={CATEGORIES}
              fmt={fmt}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              activeFarmer={activeFarmer}
              onUpdateFarmer={handleUpdateFarmer}
              onResetDatabase={handleResetDatabase}
              CATEGORY_OPTIONS={CATEGORY_OPTIONS}
              REGION_OPTIONS={REGION_OPTIONS}
              SCALE_OPTIONS={SCALE_OPTIONS}
              fields={fields.filter((f) => f.farmerId === activeFarmer.id)}
              onAddField={addField}
              onUpdateField={updateField}
              onDeleteField={deleteField}
              seasons={seasons}
              activeSeason={activeSeason}
              onAddSeason={addSeason}
              onUpdateSeason={updateSeason}
              setActiveSeasonId={setActiveSeasonId}
              transactions={transactions}
              openAddPlotModal={openAddPlotModal}
              setOpenAddPlotModal={setOpenAddPlotModal}
            />
          )}

          {activeTab === 'seasons' && (
            <SeasonsView
              seasons={seasons}
              activeSeason={activeSeason}
              onAddSeason={addSeason}
              onUpdateSeason={updateSeason}
              setActiveSeasonId={setActiveSeasonId}
              transactions={transactions}
              fields={fields}
              activeFarmer={activeFarmer}
              openAddSeasonModal={openAddSeasonModal}
              setOpenAddSeasonModal={setOpenAddSeasonModal}
              fmt={fmt}
            />
          )}
        </main>
      </div>

      {/* Share Modal Dialog Overlay */}
      {showShareModal && (
        <ShareModal
          activeFarmer={activeFarmer}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showAddFarmerModal && (
        <AddCoFarmerModal
          activeFarmer={activeFarmer}
          onClose={() => setShowAddFarmerModal(false)}
          onAddFarmer={handleAddCoFarmer}
          CATEGORY_OPTIONS={CATEGORY_OPTIONS}
          REGION_OPTIONS={REGION_OPTIONS}
          SCALE_OPTIONS={SCALE_OPTIONS}
        />
      )}
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function FarmLedger() {
  return (
    <LanguageProvider>
      <FarmLedgerContent />
    </LanguageProvider>
  );
}
