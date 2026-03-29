import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import { FiSearch, FiPlus, FiLogOut, FiEdit2, FiEye, FiBell, FiMenu, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi'
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
  const perPage = 10
  const navigate = useNavigate()

  useEffect(() => { fetchRecords() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(records); setPage(1); return }
    const q = search.toLowerCase()
    setFiltered(records.filter(r => {
      const flat = { ...r }
      // flatten nested objects for search
      if (r.requestReceivedBy) {
        flat.requestReceivedByStr = Object.entries(r.requestReceivedBy).filter(([, v]) => v === true).map(([k]) => k).join(' ')
      }
      if (r.dispatchedOn) {
        flat.dispatchedOnStr = Object.entries(r.dispatchedOn).filter(([, v]) => v === true).map(([k]) => k).join(' ')
      }
      return Object.values(flat).some(v => String(v).toLowerCase().includes(q))
    }))
    setPage(1)
  }, [search, records])

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

  const logout = () => { sessionStorage.removeItem('auth'); navigate('/') }
  const openAdd = () => { setEditRecord(null); setFormOpen(true) }
  const openEdit = (r) => { setEditRecord(r); setFormOpen(true) }
  const openView = (r) => { setViewRecord(r); setViewOpen(true) }

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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white flex flex-col border-r border-gray-100 shrink-0`}>
        <div className="p-5 flex items-center justify-between gap-3 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>N</div>
            <span className="text-lg font-bold text-gray-800 tracking-tight">New Era System</span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(false)}>
            <FiMenu size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium">
            <FiMenu size={16} /> Dashboard
          </a>
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700"
              style={{ background: 'linear-gradient(135deg, #c7d2fe, #e9d5ff)' }}>A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">System Manager</p>
            </div>
            <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 sm:h-16 shrink-0 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
              <FiMenu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 flex-1">Records List</h1>
            <button className="sm:hidden relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
              <FiBell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search all fields..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none border-none focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="hidden sm:block relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0">
              <FiBell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={fetchRecords} disabled={isRefreshing} className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0 disabled:opacity-50" title="Refresh records">
              <FiRefreshCw size={18} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shrink-0 whitespace-nowrap" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <FiPlus size={15} /> <span className="hidden sm:inline">Add Record</span><span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <p className="text-sm text-gray-500 mb-4">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> record{filtered.length !== 1 && 's'}
          </p>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">S.No</th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Ref #</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Agency</th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Property</th>
                    <th className="px-4 py-3 font-semibold hidden lg:table-cell">Surveyor</th>
                    <th className="px-4 py-3 font-semibold hidden sm:table-cell">Survey Date</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">Paid</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length > 0 ? paginated.map((rec, i) => {
                    const st = statusBadge(rec.reportStatus)
                    return (
                      <tr key={rec._id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-4 py-3 text-gray-600 font-medium">{rec.serialNumber || (page - 1) * perPage + i + 1}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600 border border-gray-200">{rec.referenceNumber || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0" style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)' }}>
                              {(rec.name || '?').charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-800">{rec.name || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{rec.requestingAgency || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate hidden md:table-cell">{rec.propertyDetails || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{rec.surveyorName || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{fmtDate(rec.dateOfSurvey)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>
                            {rec.reportStatus || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${rec.paid === 'Yes' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : rec.paid === 'No' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                            {rec.paid || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openView(rec)} className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" title="View / PDF">
                              <FiEye size={15} />
                            </button>
                            <button onClick={() => openEdit(rec)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                              <FiEdit2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="10" className="px-5 py-20 text-center text-gray-400">
                        <FiSearch className="mx-auto mb-3 text-gray-200" size={40} />
                        <p className="font-medium text-gray-500">No records found</p>
                        <p className="text-sm mt-1">Add a new record or adjust your search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-100 px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 bg-gray-50/50">
              <span className="text-center sm:text-left">Page {page} of {totalPages}</span>
              <div className="flex gap-1 flex-wrap justify-center">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <FiChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`px-3 py-1 rounded border transition-colors ${page === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RecordForm isOpen={formOpen} onClose={() => setFormOpen(false)} recordToEdit={editRecord} refreshRecords={fetchRecords} />
      <PDFExport isOpen={viewOpen} onClose={() => setViewOpen(false)} record={viewRecord} />
    </div>
  )
}

export default Dashboard
