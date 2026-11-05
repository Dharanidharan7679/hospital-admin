import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, Stethoscope, Ticket, CheckCircle2, 
  AlertCircle, ChevronRight, Phone, Clock, Plus, 
  Search, Play, Check, XCircle, RotateCcw, 
  UserCheck, ShieldCheck, DollarSign, Activity, FileText
} from 'lucide-react';
import { INITIAL_HOSPITALS, INITIAL_BOOKINGS } from './data';
import { Hospital, Doctor, TokenBooking } from './types';

export default function App() {
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(INITIAL_HOSPITALS[0].id);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(INITIAL_HOSPITALS[0].doctors[0].id);
  const [bookings, setBookings] = useState<TokenBooking[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<'queue' | 'walkin' | 'doctors' | 'hospitals' | 'reports'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [tamilMode, setTamilMode] = useState(false);

  // Walk-in Form State
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinAge, setWalkinAge] = useState('30');
  const [walkinGender, setWalkinGender] = useState('Male');
  const [walkinSuccessMsg, setWalkinSuccessMsg] = useState<string | null>(null);

  // New Doctor Modal / Form State
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocNameTa, setNewDocNameTa] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('General Medicine');
  const [newDocQual, setNewDocQual] = useState('MBBS, MD');
  const [newDocRoom, setNewDocRoom] = useState('Room 105');
  const [newDocPrefix, setNewDocPrefix] = useState('OPD');
  const [newDocCapacity, setNewDocCapacity] = useState('35');

  const currentHospital = useMemo(() => 
    hospitals.find(h => h.id === selectedHospitalId) || hospitals[0], 
    [hospitals, selectedHospitalId]
  );

  const currentDoctor = useMemo(() => 
    currentHospital.doctors.find(d => d.id === selectedDoctorId) || currentHospital.doctors[0], 
    [currentHospital, selectedDoctorId]
  );

  // Doctor-specific bookings
  const doctorBookings = useMemo(() => 
    bookings.filter(b => b.hospitalId === currentHospital.id && b.doctorId === currentDoctor?.id),
    [bookings, currentHospital.id, currentDoctor]
  );

  // Filtered by search
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return doctorBookings;
    const q = searchQuery.toLowerCase();
    return doctorBookings.filter(b => 
      b.displayToken.toLowerCase().includes(q) ||
      b.patientName.toLowerCase().includes(q) ||
      b.patientPhone.includes(q)
    );
  }, [doctorBookings, searchQuery]);

  // Current Serving Token
  const currentlyServing = useMemo(() => 
    doctorBookings.find(b => b.status === 'SERVING'),
    [doctorBookings]
  );

  // Currently Called Token
  const currentlyCalled = useMemo(() => 
    doctorBookings.find(b => b.status === 'CALLED'),
    [doctorBookings]
  );

  // Queue actions
  const handleCallNext = () => {
    // find first CONFIRMED
    const nextToken = doctorBookings.find(b => b.status === 'CONFIRMED');
    if (!nextToken) {
      alert('No more confirmed patients waiting in queue!');
      return;
    }
    setBookings(prev => prev.map(b => {
      if (b.id === nextToken.id) {
        return { ...b, status: 'CALLED', calledAt: new Date().toISOString() };
      }
      return b;
    }));
  };

  const handleStartServing = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, status: 'SERVING', servingStartedAt: new Date().toISOString() };
      }
      return b;
    }));
  };

  const handleCompleteServing = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, status: 'COMPLETED', completedAt: new Date().toISOString() };
      }
      return b;
    }));
  };

  const handleMarkNoShow = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, status: 'NO_SHOW' };
      }
      return b;
    }));
  };

  const handleCancelToken = (id: string) => {
    if (confirm('Are you sure you want to cancel this token?')) {
      setBookings(prev => prev.map(b => {
        if (b.id === id) {
          return { ...b, status: 'CANCELLED' };
        }
        return b;
      }));
    }
  };

  // Issue Walk-in Token
  const handleIssueWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone) return;

    const nextSeq = doctorBookings.length + 1;
    const prefix = currentDoctor.prefix || 'OPD';
    const displayToken = `${prefix}-${String(nextSeq).padStart(3, '0')}`;

    const newBooking: TokenBooking = {
      id: `tok-walkin-${Date.now()}`,
      displayToken,
      sequenceNumber: nextSeq,
      hospitalId: currentHospital.id,
      hospitalName: currentHospital.name,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      doctorSpecialty: currentDoctor.specialty,
      patientName: walkinName,
      patientPhone: walkinPhone,
      patientAge: parseInt(walkinAge) || 30,
      patientGender: walkinGender,
      date: new Date().toISOString().split('T')[0],
      session: 'Morning',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'Walk-in Cash Desk',
      paymentReference: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      feeAmount: 10,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [...prev, newBooking]);
    setWalkinSuccessMsg(`Token ${displayToken} assigned successfully to ${walkinName}!`);
    setWalkinName('');
    setWalkinPhone('');
    setTimeout(() => setWalkinSuccessMsg(null), 5000);
  };

  // Add Doctor
  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const newDoctor: Doctor = {
      id: `doc-${Date.now()}`,
      name: newDocName,
      nameTa: newDocNameTa || undefined,
      specialty: newDocSpecialty,
      qualification: newDocQual,
      room: newDocRoom,
      prefix: newDocPrefix.toUpperCase(),
      dailyCapacity: parseInt(newDocCapacity) || 35,
      avgConsultMinutes: 5,
      sessions: ['Morning', 'Afternoon'],
      avatar: '👨🏻‍⚕️'
    };

    setHospitals(prev => prev.map(h => {
      if (h.id === currentHospital.id) {
        return {
          ...h,
          doctors: [...h.doctors, newDoctor]
        };
      }
      return h;
    }));

    setShowAddDoctorModal(false);
    setSelectedDoctorId(newDoctor.id);
    setNewDocName('');
    setNewDocNameTa('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/20 text-slate-950">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">ArkCare</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Outpatient Queue & Hospital Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Hospital Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
              <Building2 className="w-4 h-4 text-emerald-400 ml-2 mr-1" />
              <select 
                value={selectedHospitalId}
                onChange={(e) => {
                  setSelectedHospitalId(e.target.value);
                  const h = hospitals.find(x => x.id === e.target.value);
                  if (h && h.doctors.length > 0) setSelectedDoctorId(h.doctors[0].id);
                }}
                className="bg-transparent text-sm font-semibold text-slate-200 py-1 px-2 focus:outline-none cursor-pointer"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id} className="bg-slate-900 text-white">
                    {tamilMode && h.nameTa ? h.nameTa : h.name} ({h.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setTamilMode(!tamilMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                tamilMode 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {tamilMode ? 'தமிழ் (TA)' : 'English (EN)'}
            </button>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700 text-xs">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-emerald-400">
                AD
              </div>
              <div className="hidden md:block text-left">
                <div className="font-semibold text-slate-200">OPD Supervisor</div>
                <div className="text-[10px] text-slate-400">Reception Desk</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'queue'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live OPD Queue Room
          </button>
          <button
            onClick={() => setActiveTab('walkin')}
            className={`py-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'walkin'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Issue Walk-In Token
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`py-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'doctors'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Doctors & OPD Rooms
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3.5 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'reports'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Analytics & Invoices
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: LIVE QUEUE ROOM */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Doctor Picker Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Doctors:</span>
                {currentHospital.doctors.map(doc => {
                  const isSelected = doc.id === currentDoctor?.id;
                  const docWaiting = bookings.filter(b => b.doctorId === doc.id && b.status === 'CONFIRMED').length;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{doc.avatar || '👨🏻‍⚕️'}</span>
                      <span>{tamilMode && doc.nameTa ? doc.nameTa : doc.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-300 text-slate-800'
                      }`}>
                        {docWaiting}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add OPD Doctor
              </button>
            </div>

            {/* Doctor Summary & Queue Status HUD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Doctor Details */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm md:col-span-1">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl shadow-inner">
                    {currentDoctor?.avatar || '👨🏻‍⚕️'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug">
                      {tamilMode && currentDoctor?.nameTa ? currentDoctor.nameTa : currentDoctor?.name}
                    </h3>
                    <p className="text-xs font-medium text-emerald-700 bg-emerald-50 inline-block px-1.5 py-0.5 rounded mt-0.5">
                      {currentDoctor?.specialty}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{currentDoctor?.qualification}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {currentDoctor?.room}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-slate-400 font-semibold text-[10px] uppercase">Capacity</span>
                    <span className="font-bold text-slate-800 text-sm">{currentDoctor?.dailyCapacity || 35}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-slate-400 font-semibold text-[10px] uppercase">Avg Time</span>
                    <span className="font-bold text-slate-800 text-sm">{currentDoctor?.avgConsultMinutes} min</span>
                  </div>
                </div>
              </div>

              {/* Active Serving Monitor */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-xl shadow-md md:col-span-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                      <Play className="w-3 h-3 fill-emerald-200" /> Now Serving
                    </span>
                    <span className="text-[10px] bg-emerald-900/40 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400/30 font-semibold">
                      Inside Cabin
                    </span>
                  </div>
                  
                  {currentlyServing ? (
                    <div className="mt-4">
                      <div className="text-4xl font-extrabold tracking-tight">
                        {currentlyServing.displayToken}
                      </div>
                      <div className="font-bold text-emerald-50 text-base mt-1">
                        {currentlyServing.patientName}
                      </div>
                      <div className="text-xs text-emerald-200 flex items-center gap-2 mt-1">
                        <span>{currentlyServing.patientGender}, {currentlyServing.patientAge}y</span>
                        <span>•</span>
                        <span>{currentlyServing.patientPhone}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 text-center py-4 bg-emerald-800/40 rounded-lg border border-emerald-500/20">
                      <p className="text-sm font-semibold text-emerald-100">Consultation Desk Free</p>
                      <p className="text-xs text-emerald-300 mt-0.5">Call next patient to begin</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-500/30 flex gap-2">
                  {currentlyServing && (
                    <button
                      onClick={() => handleCompleteServing(currentlyServing.id)}
                      className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-bold py-2 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Complete Consultation
                    </button>
                  )}
                </div>
              </div>

              {/* Called Next Patient */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm md:col-span-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Calling Patient
                    </span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                      At Doorstep
                    </span>
                  </div>

                  {currentlyCalled ? (
                    <div className="mt-4">
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {currentlyCalled.displayToken}
                      </div>
                      <div className="font-bold text-slate-800 text-sm mt-1">
                        {currentlyCalled.patientName}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {currentlyCalled.patientPhone}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <p className="text-xs font-semibold text-slate-500">No patient called yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Press button below to call next</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  {currentlyCalled ? (
                    <>
                      <button
                        onClick={() => handleStartServing(currentlyCalled.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Admit In
                      </button>
                      <button
                        onClick={() => handleMarkNoShow(currentlyCalled.id)}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-slate-200 hover:border-rose-200 transition-all"
                        title="Mark No Show"
                      >
                        No Show
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCallNext}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" /> Call Next Waiting Token
                    </button>
                  )}
                </div>
              </div>

              {/* Queue Statistics Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm md:col-span-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Queue Metrics</span>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500">Waiting</div>
                      <div className="text-2xl font-black text-slate-800">
                        {doctorBookings.filter(b => b.status === 'CONFIRMED').length}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500">Completed</div>
                      <div className="text-2xl font-black text-emerald-600">
                        {doctorBookings.filter(b => b.status === 'COMPLETED').length}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500">Total Booked</div>
                      <div className="text-xl font-bold text-slate-700">
                        {doctorBookings.length}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500">Est. Wait</div>
                      <div className="text-xl font-bold text-amber-600">
                        {doctorBookings.filter(b => b.status === 'CONFIRMED').length * (currentDoctor?.avgConsultMinutes || 4)}m
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('walkin')}
                  className="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Book Walk-in
                </button>
              </div>
            </div>

            {/* Token Table & Search */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900">Today's Token Ledger</h4>
                  <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    {filteredBookings.length} tokens
                  </span>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by token, patient or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Token #</th>
                      <th className="py-3 px-4">Patient Information</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No token bookings found for this doctor today.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        let statusBadge = 'bg-slate-100 text-slate-700';
                        if (b.status === 'CONFIRMED') statusBadge = 'bg-amber-100 text-amber-800 border border-amber-200';
                        if (b.status === 'CALLED') statusBadge = 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse';
                        if (b.status === 'SERVING') statusBadge = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';
                        if (b.status === 'COMPLETED') statusBadge = 'bg-slate-100 text-slate-500';
                        if (b.status === 'NO_SHOW') statusBadge = 'bg-rose-100 text-rose-700';
                        if (b.status === 'CANCELLED') statusBadge = 'bg-rose-50 text-rose-500';

                        return (
                          <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {b.displayToken}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{b.patientName}</div>
                              <div className="text-[11px] text-slate-500">{b.patientGender}, {b.patientAge} yrs</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                              {b.patientPhone}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800">₹{b.feeAmount}</div>
                              <div className="text-[10px] text-slate-400">{b.paymentMethod || 'Online'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                                {b.paymentReference?.startsWith('REC-') ? 'Walk-In Desk' : 'Mobile App'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {b.status === 'CONFIRMED' && (
                                  <button
                                    onClick={() => {
                                      setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'CALLED' } : x));
                                    }}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-2 py-1 rounded text-[11px]"
                                  >
                                    Call
                                  </button>
                                )}

                                {b.status === 'CALLED' && (
                                  <button
                                    onClick={() => handleStartServing(b.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[11px]"
                                  >
                                    Admit
                                  </button>
                                )}

                                {b.status === 'SERVING' && (
                                  <button
                                    onClick={() => handleCompleteServing(b.id)}
                                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-2 py-1 rounded text-[11px]"
                                  >
                                    Done
                                  </button>
                                )}

                                {['CONFIRMED', 'CALLED'].includes(b.status) && (
                                  <button
                                    onClick={() => handleCancelToken(b.id)}
                                    className="text-slate-400 hover:text-rose-600 p-1"
                                    title="Cancel"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ISSUE WALK-IN TOKEN */}
        {activeTab === 'walkin' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Hospital Walk-In Token Generator</h3>
                  <p className="text-xs text-slate-500">Instantly generate OPD tokens for patients arriving directly at reception</p>
                </div>
              </div>

              {walkinSuccessMsg && (
                <div className="mb-5 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {walkinSuccessMsg}
                </div>
              )}

              <form onSubmit={handleIssueWalkin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Doctor & OPD Session
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {currentHospital.doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialty} ({d.room})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={walkinName}
                      onChange={(e) => setWalkinName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Mobile Number (SMS Updates) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98421 00000"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={walkinAge}
                      onChange={(e) => setWalkinAge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Gender
                    </label>
                    <select
                      value={walkinGender}
                      onChange={(e) => setWalkinGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Booking Fee
                    </label>
                    <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 flex items-center justify-between">
                      <span>₹10.00</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">CASH</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('queue')}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Back to Queue
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    Print & Issue Token
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 3: DOCTORS DIRECTORY */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Hospital Medical Staff & OPD Directory</h3>
                <p className="text-xs text-slate-500">Manage doctor schedules, session hours, and daily OPD token capacities</p>
              </div>
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Doctor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentHospital.doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner">
                          {doc.avatar || '👨🏻‍⚕️'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{doc.name}</h4>
                          {doc.nameTa && <p className="text-xs text-slate-500 font-medium">{doc.nameTa}</p>}
                          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded mt-1 inline-block">
                            {doc.specialty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                      <div><strong className="text-slate-800">Qualifications:</strong> {doc.qualification}</div>
                      <div><strong className="text-slate-800">Room Location:</strong> {doc.room}</div>
                      <div><strong className="text-slate-800">Token Prefix:</strong> <span className="font-mono font-bold text-slate-900">{doc.prefix}</span></div>
                      <div><strong className="text-slate-800">Daily Max Tokens:</strong> {doc.dailyCapacity}</div>
                      <div><strong className="text-slate-800">Avg Time / Patient:</strong> {doc.avgConsultMinutes} mins</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OPD Active Today
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setActiveTab('queue');
                      }}
                      className="text-xs font-bold text-slate-800 hover:text-emerald-700 flex items-center gap-1"
                    >
                      View Live Room <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: ANALYTICS & INVOICES */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase">Total Tokens Processed</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">{bookings.length}</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">Across all hospital departments</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase">Collections (INR)</div>
                <div className="text-3xl font-extrabold text-emerald-700 mt-2">
                  ₹{bookings.reduce((sum, b) => sum + (b.paymentStatus === 'PAID' ? b.feeAmount : 0), 0)}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Token Star ₹10 reservation fee</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase">Consultations Completed</div>
                <div className="text-3xl font-extrabold text-teal-700 mt-2">
                  {bookings.filter(b => b.status === 'COMPLETED').length}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Patients served with zero queue wait</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-extrabold text-slate-900 mb-3">Recent Digital Invoices</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Receipt Ref</th>
                      <th className="py-2.5 px-3">Token</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Doctor</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Payment Method</th>
                      <th className="py-2.5 px-3">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{b.paymentReference || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{b.displayToken}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{b.patientName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{b.doctorName}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">₹{b.feeAmount}.00</td>
                        <td className="py-2.5 px-3 text-slate-500">{b.paymentMethod || 'Online'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD DOCTOR */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Add New OPD Doctor</h3>
              <button onClick={() => setShowAddDoctorModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Anand Natarajan"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Doctor Name (தமிழ் - Optional)</label>
                <input
                  type="text"
                  placeholder="எ.கா. டாக்டர். ஆனந்த் நடராஜன்"
                  value={newDocNameTa}
                  onChange={(e) => setNewDocNameTa(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialty</label>
                  <input
                    type="text"
                    required
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Token Prefix</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="e.g. ENT, GM"
                    value={newDocPrefix}
                    onChange={(e) => setNewDocPrefix(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={newDocQual}
                    onChange={(e) => setNewDocQual(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cabin / Room</label>
                  <input
                    type="text"
                    value={newDocRoom}
                    onChange={(e) => setNewDocRoom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Daily Token Capacity</label>
                <input
                  type="number"
                  value={newDocCapacity}
                  onChange={(e) => setNewDocCapacity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

