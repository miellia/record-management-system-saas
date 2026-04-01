import React, { useState, useEffect } from 'react'
import { FiX, FiCheck } from 'react-icons/fi'
import axios from 'axios'

const API = `${import.meta.env.VITE_API_URL}/api/records`;

/**
 * Initial empty state for the record form.
 * Ensures controlled inputs don't throw warnings by providing default values.
 */
const emptyForm = {
  serialNumber: '', requestDate: '',
  requestReceivedBy: { email: false, phone: false, whatsapp: false, other: false },
  referenceNumber: '', name: '', position: '', landline: '', mobile: '',
  email: '', address: '', requestingAgency: '', branchOffice: '',
  titleCustomer: '', propertyDetails: '', propertyOwner: '',
  contactPerson: '', contactNumber: '', surveyorName: '',
  dateOfSurvey: '', dateOfReport: '', reportStatus: '',
  dispatchedOn: { whatsapp: false, email: false, courier: false },
  fsv: '', market: '', invoiceAmount: '', paid: '', date: ''
}

/**
 * Utility: format an ISO date string to YYYY-MM-DD for HTML date inputs.
 */
const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : ''

/**
 * RecordForm Component
 * --------------------
 * A modal overlay that renders a comprehensive form for adding or editing
 * a property evaluation record. Handles local state, input changes,
 * controlled checkbox objects, and API submission logic (POST/PUT).
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Closes the modal
 * @param {object|null} recordToEdit - If populated, the form is in 'Edit' mode
 * @param {function} refreshRecords - Callback to re-fetch the records list
 */
const RecordForm = ({ isOpen, onClose, recordToEdit, refreshRecords, searchTerm = '' }) => {
  const [form, setForm] = useState({ ...emptyForm })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (recordToEdit) {
      setForm({
        ...emptyForm,
        ...recordToEdit,
        requestReceivedBy: { ...emptyForm.requestReceivedBy, ...recordToEdit.requestReceivedBy },
        dispatchedOn: { ...emptyForm.dispatchedOn, ...recordToEdit.dispatchedOn },
        requestDate: fmtDate(recordToEdit.requestDate),
        dateOfSurvey: fmtDate(recordToEdit.dateOfSurvey),
        dateOfReport: fmtDate(recordToEdit.dateOfReport),
        date: fmtDate(recordToEdit.date),
      })
    } else {
      setForm({ ...emptyForm, requestReceivedBy: { ...emptyForm.requestReceivedBy }, dispatchedOn: { ...emptyForm.dispatchedOn } })
    }
  }, [recordToEdit, isOpen])

  if (!isOpen) return null

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const onCheckbox = (group, key) => {
    setForm(prev => ({ ...prev, [group]: { ...prev[group], [key]: !prev[group][key] } }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (recordToEdit) {
        await axios.put(`${API}/${recordToEdit._id}`, form)
      } else {
        await axios.post(API, form)
      }
      refreshRecords()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Error saving record')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (name) => {
    const base = "w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
    const hasMatch = searchTerm && String(form[name] || '').toLowerCase().includes(searchTerm.toLowerCase())
    return hasMatch ? `${base} bg-yellow-100 border-yellow-400 ring-2 ring-yellow-100` : `${base} bg-white`
  }
  const checkCls = "w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{recordToEdit ? 'Edit Record' : 'Add New Record'}</h2>
            <p className="text-sm text-gray-400 mt-0.5">Fill in the record details below</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <form id="recordForm" onSubmit={onSubmit} className="space-y-6">

            {/* Section 1: Request Info */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Request Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Serial Number</label>
                  <input name="serialNumber" value={form.serialNumber} onChange={onChange} className={inputCls('serialNumber')} placeholder="e.g. 001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Request Date</label>
                  <input type="date" name="requestDate" value={form.requestDate} onChange={onChange} className={inputCls('requestDate')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Reference Number</label>
                  <input name="referenceNumber" value={form.referenceNumber} onChange={onChange} className={inputCls('referenceNumber')} placeholder="REF-001" />
                </div>
              </div>

              {/* Request Received By - checkboxes */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Request Received By</label>
                <div className="flex flex-wrap gap-5">
                  {[
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'whatsapp', label: 'WhatsApp' },
                    { key: 'other', label: 'Other' },
                  ].map(opt => {
                    const isHighlighted = searchTerm && opt.label.toLowerCase().includes(searchTerm.toLowerCase()) && form.requestReceivedBy[opt.key]
                    return (
                      <label key={opt.key} className={`flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none px-2 py-1 rounded-lg transition-colors ${isHighlighted ? 'bg-yellow-100 ring-1 ring-yellow-300' : ''}`}>
                        <input type="checkbox" checked={form.requestReceivedBy[opt.key]} onChange={() => onCheckbox('requestReceivedBy', opt.key)} className={checkCls} />
                        {opt.label}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Section 2: Requester Details */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Requester Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Requesting Agency</label>
                  <input name="requestingAgency" value={form.requestingAgency} onChange={onChange} className={inputCls('requestingAgency')} placeholder="Agency name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Branch Office</label>
                  <input name="branchOffice" value={form.branchOffice} onChange={onChange} className={inputCls('branchOffice')} placeholder="Branch name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                  <input name="name" value={form.name} onChange={onChange} className={inputCls('name')} placeholder="Full Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Position</label>
                  <input name="position" value={form.position} onChange={onChange} className={inputCls('position')} placeholder="e.g. Manager" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Landline</label>
                  <input name="landline" value={form.landline} onChange={onChange} className={inputCls('landline')} placeholder="Landline number" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Mobile</label>
                  <input name="mobile" value={form.mobile} onChange={onChange} className={inputCls('mobile')} placeholder="Mobile number" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} className={inputCls('email')} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                  <input name="address" value={form.address} onChange={onChange} className={inputCls('address')} placeholder="Address of requester" />
                </div>


              </div>
            </div>

            {/* Section 3: Property & Survey */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Property & Survey Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Title / Customer</label>
                  <input name="titleCustomer" value={form.titleCustomer} onChange={onChange} className={inputCls('titleCustomer')} placeholder="Title or customer name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Property Details</label>
                  <input name="propertyDetails" value={form.propertyDetails} onChange={onChange} className={inputCls('propertyDetails')} placeholder="Property description" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Property Owner</label>
                  <input name="propertyOwner" value={form.propertyOwner} onChange={onChange} className={inputCls('propertyOwner')} placeholder="Owner name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Contact Person</label>
                  <input name="contactPerson" value={form.contactPerson} onChange={onChange} className={inputCls('contactPerson')} placeholder="Contact person name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Contact Number</label>
                  <input name="contactNumber" value={form.contactNumber} onChange={onChange} className={inputCls('contactNumber')} placeholder="Contact phone" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Surveyor Name</label>
                  <input name="surveyorName" value={form.surveyorName} onChange={onChange} className={inputCls('surveyorName')} placeholder="Surveyor name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date of Survey</label>
                  <input type="date" name="dateOfSurvey" value={form.dateOfSurvey} onChange={onChange} className={inputCls('dateOfSurvey')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date of Report</label>
                  <input type="date" name="dateOfReport" value={form.dateOfReport} onChange={onChange} className={inputCls('dateOfReport')} />
                </div>
              </div>
            </div>

            {/* Section 4: Report & Dispatch */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Report & Dispatch</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Report Status</label>
                  <select name="reportStatus" value={form.reportStatus} onChange={onChange} className={inputCls('reportStatus')}>
                    <option value="">Select Status</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Dispatched On</label>
                  <div className="flex flex-wrap gap-5 mt-1">
                    {[
                      { key: 'whatsapp', label: 'WhatsApp' },
                      { key: 'email', label: 'Email' },
                      { key: 'courier', label: 'Courier' },
                    ].map(opt => {
                      const isHighlighted = searchTerm && opt.label.toLowerCase().includes(searchTerm.toLowerCase()) && form.dispatchedOn[opt.key]
                      return (
                        <label key={opt.key} className={`flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none px-2 py-1 rounded-lg transition-colors ${isHighlighted ? 'bg-yellow-100 ring-1 ring-yellow-300' : ''}`}>
                          <input type="checkbox" checked={form.dispatchedOn[opt.key]} onChange={() => onCheckbox('dispatchedOn', opt.key)} className={checkCls} />
                          {opt.label}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Financial */}
            <div className="p-5 rounded-xl border border-indigo-100 space-y-4" style={{ background: '#eef2ff' }}>
              <h3 className="text-sm font-semibold text-indigo-800 uppercase tracking-wider border-b border-indigo-200/50 pb-2">Financial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1.5">FSV</label>
                  <input name="fsv" value={form.fsv} onChange={onChange} className={inputCls('fsv')} placeholder="FSV value" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1.5">Market</label>
                  <input name="market" value={form.market} onChange={onChange} className={inputCls('market')} placeholder="Market value" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1.5">Invoice Amount</label>
                  <input name="invoiceAmount" value={form.invoiceAmount} onChange={onChange} className={inputCls('invoiceAmount')} placeholder="Amount" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1.5">Paid</label>
                  <select name="paid" value={form.paid} onChange={onChange} className={inputCls('paid')}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1.5">Date</label>
                  <input type="date" name="date" value={form.date} onChange={onChange} className={inputCls('date')} />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition-colors text-sm">
            Cancel
          </button>
          <button type="submit" form="recordForm" disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-medium transition-all active:scale-95 disabled:opacity-60 text-sm"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {loading ? 'Saving...' : <><FiCheck size={15} /> {recordToEdit ? 'Update' : 'Save'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecordForm