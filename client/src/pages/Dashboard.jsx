import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiPlus, FiLogOut, FiEdit2, FiEye, FiBell, FiMenu, FiChevronLeft, FiChevronRight, FiRefreshCw, FiX, FiTrash2, FiSun, FiMoon, FiCalendar, FiBriefcase } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import RecordForm from '../components/RecordForm'
import PDFExport from '../components/PDFExport'

//const API = `${process.env.REACT_APP_API_URL}/api/records`;
const API = `${import.meta.env.VITE_API_URL}/api/records`;



const Dashboard = () => {
  const [records, setRecords] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightTerm, setHighlightTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedAgency, setSelectedAgency] = useState('')
  const perPage = 10

  const MONTHS = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ]
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()

  // Dynamically derived agency list — auto-updates when new records are added
  const agencies = useMemo(() => {
    const set = new Set()
    records.forEach(r => {
      if (r.requestingAgency && r.requestingAgency.trim()) {
        set.add(r.requestingAgency.trim())
      }
    })
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [records])

  useEffect(() => { fetchRecords() }, [])

  useEffect(() => {
    let result = [...records]

    // Month filter (based on requestDate)
    if (selectedMonth !== '') {
      result = result.filter(r => {
        if (!r.requestDate) return false
        const d = new Date(r.requestDate)
        return d.getMonth() === parseInt(selectedMonth)
      })
    }

    // Agency filter
    if (selectedAgency !== '') {
      result = result.filter(r => (r.requestingAgency || '').trim() === selectedAgency)
    }

    if (!search.trim()) { 
      setFiltered(result); 
      setPage(1); 
      setSearchResults([]);
      setShowDropdown(false);
      return 
    }
    
    const q = search.toLowerCase()
    const fieldLabels = {
      serialNumber: 'Serial #',
      referenceNumber: 'Ref #',
      name: 'Name',
      position: 'Position',
      landline: 'Landline',
      mobile: 'Mobile',
      email: 'Email',
      address: 'Address',
      requestingAgency: 'Agency',
      branchOffice: 'Branch',
      titleCustomer: 'Title/Customer',
      propertyDetails: 'Property',
      propertyOwner: 'Owner',
      contactPerson: 'Contact Person',
      contactNumber: 'Contact Number',
      surveyorName: 'Surveyor',
      reportStatus: 'Status',
      fsv: 'FSV',
      market: 'Market',
      invoiceAmount: 'Invoice',
      paid: 'Paid'
    }

    const matches = []
    const filteredList = result.filter(r => {
      let isMatch = false
      const flat = { ...r }
      
      // Check each field to identify the category
      Object.entries(fieldLabels).forEach(([key, label]) => {
        const val = String(r[key] || '').toLowerCase()
        if (val.includes(q)) {
          isMatch = true
          // Add to results dropdown (limit to unique record-field pairs)
          matches.push({
            id: r._id,
            record: r,
            field: label,
            value: String(r[key]),
            term: q
          })
        }
      })

      // Special case for nested strings (requestReceivedBy, dispatchedOn)
      if (r.requestReceivedBy) {
        const str = Object.entries(r.requestReceivedBy).filter(([, v]) => v === true).map(([k]) => k).join(' ')
        if (str.toLowerCase().includes(q)) {
          isMatch = true
          matches.push({ id: r._id, record: r, field: 'Received By', value: str, term: q })
        }
      }

      if (r.dispatchedOn) {
        const str = Object.entries(r.dispatchedOn).filter(([, v]) => v === true).map(([k]) => k).join(' ')
        if (str.toLowerCase().includes(q)) {
          isMatch = true
          matches.push({ id: r._id, record: r, field: 'Dispatched On', value: str, term: q })
        }
      }
      
      return isMatch
    })

    setFiltered(filteredList)
    setSearchResults(matches.slice(0, 8)) // Limit dropdown results
    setShowDropdown(matches.length > 0)
    setPage(1)
  }, [search, records, selectedMonth, selectedAgency])

  const fetchRecords = async () => {
    setIsRefreshing(true)
    try {
      const { data } = await axios.get(API)
      setRecords(data)
      setFiltered(data)
    } catch (err) { 
      console.error(err) 
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  }
  const openAdd = () => { setEditRecord(null); setHighlightTerm(''); setFormOpen(true) }
  const openEdit = (r, term = '') => { setEditRecord(r); setHighlightTerm(term); setFormOpen(true); setShowDropdown(false) }
  const openView = (r, term = '') => { setViewRecord(r); setHighlightTerm(term); setViewOpen(true); setShowDropdown(false) }
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${API}/${id}`)
        fetchRecords()
      } catch (err) {
        console.error('Delete error:', err)
        const msg = err.response?.data?.message || err.message || 'Unknown error'
        alert(`Error deleting record: ${msg}`)
      }
    }
  }

  const fmtDate = (d) => {
    if (!d) return '-'
    try { return format(new Date(d), 'MMM dd, yyyy') } catch { return '-' }
  }

  const statusBadge = (status) => {
    if (status === 'Completed') return { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
    if (status === 'In Progress') return { cls: 'bg-amber-50 text-amber-700 border border-amber-200' }
    return { cls: 'bg-gray-50 text-gray-500 border border-gray-200' }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white dark:bg-slate-900 flex flex-col border-r border-gray-100 dark:border-slate-800 shrink-0`}>
        <div className="p-5 flex items-center justify-between gap-3 border-b border-gray-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>N</div>
            <span className="text-lg font-bold text-gray-800 dark:text-slate-100 tracking-tight">New Era System</span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-slate-300" onClick={() => setSidebarOpen(false)}>
            <FiMenu size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-4">
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium">
            <FiMenu size={16} /> Dashboard
          </a>

          {/* Month Filter */}
          <div className="px-1 pt-4">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              <FiCalendar size={12} />
              Filter by Month
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all font-medium text-gray-700 dark:text-slate-200 appearance-none cursor-pointer"
              >
                <option value="">All Months</option>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {selectedMonth !== '' && (
                <button
                  onClick={() => setSelectedMonth('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Clear month filter"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
            {selectedMonth !== '' && (
              <div className="mt-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{MONTHS[parseInt(selectedMonth)].label}</span>
                <span className="text-[10px] text-indigo-400 dark:text-indigo-500">{filtered.length} records</span>
              </div>
            )}
          </div>

          {/* Agency Filter */}
          <div className="px-1 pt-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              <FiBriefcase size={12} />
              Filter by Agency
            </label>
            <div className="relative">
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all font-medium text-gray-700 dark:text-slate-200 appearance-none cursor-pointer"
              >
                <option value="">All Agencies</option>
                {agencies.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {selectedAgency !== '' && (
                <button
                  onClick={() => setSelectedAgency('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Clear agency filter"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
            {selectedAgency !== '' && (
              <div className="mt-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">{selectedAgency}</span>
                <span className="text-[10px] text-indigo-400 dark:text-indigo-500 shrink-0">{filtered.length}</span>
              </div>
            )}
          </div>
        </nav>
        <div className="p-3 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-300"
              style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #312e81, #4c1d95)' : 'linear-gradient(135deg, #c7d2fe, #e9d5ff)' }}>A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">Admin</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 truncate">System Manager</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 sm:h-16 shrink-0 gap-4 sm:gap-0 transition-colors duration-300">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
              <FiMenu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100 flex-1">Records List</h1>
            <button className="sm:hidden relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
              <FiBell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} className="text-amber-400" />}
            </button>
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search all fields..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm outline-none border-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all font-medium text-gray-700 dark:text-slate-200" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                onFocus={() => search.trim() && setShowDropdown(true)}
              />
              
              {/* Search Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-[100] max-h-80 overflow-y-auto">
                  <div className="p-2 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Top Matches</span>
                    <button onClick={() => setShowDropdown(false)} className="text-gray-300 hover:text-gray-500 p-1"><FiX size={12} /></button>
                  </div>
                  <div className="py-1">
                    {searchResults.map((res, i) => (
                      <button 
                        key={`${res.id}-${i}`}
                        className="w-full px-4 py-2.5 text-left hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 flex flex-col gap-0.5 transition-colors group border-b border-gray-50 dark:border-slate-700 last:border-0"
                        onClick={() => openView(res.record, res.term)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-tight">{res.field}</span>
                          <span className="text-[9px] text-gray-300 dark:text-slate-500 font-mono">{res.record.referenceNumber || 'N/A'}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                          <HighlightedText text={res.value} highlight={res.term} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="hidden sm:block relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0">
              <FiBell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={fetchRecords} disabled={isRefreshing} className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 disabled:opacity-50" title="Refresh records">
              <FiRefreshCw size={18} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shrink-0 whitespace-nowrap" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <FiPlus size={15} /> <span className="hidden sm:inline">Add Record</span><span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                      <th className="px-5 py-4 font-bold">S.No</th>
                      <th className="px-4 py-4 font-bold">Name & Position</th>
                      <th className="px-4 py-4 font-bold hidden md:table-cell">Agency</th>
                      <th className="px-4 py-4 font-bold hidden md:table-cell">Property</th>
                      <th className="px-4 py-4 font-bold hidden lg:table-cell">Surveyor</th>
                      <th className="px-4 py-4 font-bold hidden sm:table-cell">Survey Date</th>
                      <th className="px-4 py-4 font-bold text-center">Status</th>
                      <th className="px-4 py-4 font-bold text-center hidden sm:table-cell">Paid</th>
                      <th className="px-4 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? paginated.map((rec, idx) => {
                      const st = statusBadge(rec.reportStatus)
                      return (
                        <tr key={rec._id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 border-b border-gray-50 dark:border-slate-800 last:border-0 transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-gray-400 dark:text-slate-600">{(page-1)*perPage + idx + 1}</td>
                          <td className="px-4 py-3 min-w-[200px]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 dark:text-slate-200">{rec.name || '-'}</span>
                              <span className="text-xs text-gray-400 dark:text-slate-500 truncate">{rec.position || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-slate-400 hidden md:table-cell text-sm">{rec.requestingAgency || '-'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-slate-400 max-w-[160px] truncate hidden md:table-cell text-sm">{rec.propertyDetails || '-'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-slate-400 hidden lg:table-cell text-sm">{rec.surveyorName || '-'}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-slate-400 hidden sm:table-cell text-sm">{fmtDate(rec.dateOfSurvey)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${st.cls}`}>
                              {rec.reportStatus || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${rec.paid === 'Yes' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : rec.paid === 'No' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-500 border border-gray-200 dark:border-slate-700'}`}>
                              {rec.paid || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openView(rec)} className="p-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors" title="View / PDF">
                                <FiEye size={15} />
                              </button>
                              <button onClick={() => openEdit(rec)} className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="Edit">
                                <FiEdit2 size={15} />
                              </button>
                              <button onClick={() => handleDelete(rec._id)} className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors" title="Delete">
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan="10" className="px-5 py-20 text-center text-gray-400 dark:text-slate-600">
                          <FiSearch className="mx-auto mb-3 text-gray-200 dark:text-slate-800" size={40} />
                          <p className="font-medium text-gray-500 dark:text-slate-400">No records found</p>
                          <p className="text-sm mt-1">Add a new record or adjust your search.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-100 dark:border-slate-800 px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/30 transition-colors duration-300">
                <span className="text-center sm:text-left">
                  {selectedMonth !== '' && <span className="text-indigo-500 dark:text-indigo-400 mr-1.5">{MONTHS[parseInt(selectedMonth)].label} ·</span>}
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''} · Page {page} of {totalPages}
                </span>
                <div className="flex gap-1 flex-wrap justify-center">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <FiChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} className={`px-3 py-1 rounded-lg border transition-colors ${page === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RecordForm isOpen={formOpen} onClose={() => setFormOpen(false)} recordToEdit={editRecord} refreshRecords={fetchRecords} searchTerm={highlightTerm} />
      <PDFExport isOpen={viewOpen} onClose={() => setViewOpen(false)} record={viewRecord} searchTerm={highlightTerm} />
    </div>
  )
}

/**
 * Highlighter component for text strings
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const HighlightedText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) return <span>{text}</span>
  
  try {
    const escaped = escapeRegex(highlight)
    const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'))
    return (
      <span>
        {parts.map((p, i) => 
          p.toLowerCase() === highlight.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5">{p}</mark> 
            : p
        )}
      </span>
    )
  } catch {
    return <span>{text}</span>
  }
}

export default Dashboard
