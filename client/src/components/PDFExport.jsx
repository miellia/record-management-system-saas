import React from 'react'
import { usePDF } from 'react-to-pdf'
import { FiX, FiDownload } from 'react-icons/fi'
import { format } from 'date-fns'

const fmtDate = (d) => {
  if (!d) return '—'
  try { return format(new Date(d), 'MMMM dd, yyyy') } catch { return '—' }
}

const checkList = (obj) => {
  if (!obj) return '—'
  const active = Object.entries(obj).filter(([, v]) => v === true).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
  return active.length ? active.join(', ') : '—'
}

const PDFExport = ({ record, isOpen, onClose }) => {
  const { toPDF, targetRef } = usePDF({
    filename: `${record?.name || 'Record'}_Report.pdf`
  })

  if (!isOpen || !record) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Record Details</h2>
            <p className="text-sm text-gray-400">Ref: {record.referenceNumber || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toPDF()} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors">
              <FiDownload size={14} /> Download PDF
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          <div className="w-full overflow-x-auto">
            <div ref={targetRef} className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 min-w-[700px] mx-auto" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

            {/* Title */}
            <div className="border-b-2 border-indigo-600 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Property Survey Record</h1>
                  <p className="text-gray-500 text-sm mt-1">Serial: {record.serialNumber || '—'}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${record.reportStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : record.reportStatus === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                    {record.reportStatus || 'N/A'}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{fmtDate(record.requestDate)}</p>
                </div>
              </div>
            </div>

            {/* Request Info */}
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider bg-gray-100 px-3 py-2 rounded mb-3">Request Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
              {[
                ['Reference #', record.referenceNumber],
                ['Request Date', fmtDate(record.requestDate)],
                ['Received By', checkList(record.requestReceivedBy)],
              ].map(([label, val]) => (
                <div key={label} className="flex border-b border-gray-50 py-1.5 items-start">
                  <span className="text-gray-500 font-medium w-2/5 shrink-0 pr-2">{label}</span>
                  <span className="text-gray-800 font-semibold break-words">{val || '—'}</span>
                </div>
              ))}
            </div>

            {/* Requester */}
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider bg-gray-100 px-3 py-2 rounded mb-3">Requester Details</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
              {[
                ['Name', record.name],
                ['Position', record.position],
                ['Landline', record.landline],
                ['Mobile', record.mobile],
                ['Email', record.email],
                ['Address', record.address],
                ['Agency', record.requestingAgency],
                ['Branch', record.branchOffice],
              ].map(([label, val]) => (
                <div key={label} className="flex border-b border-gray-50 py-1.5 items-start">
                  <span className="text-gray-500 font-medium w-2/5 shrink-0 pr-2">{label}</span>
                  <span className="text-gray-800 break-words">{val || '—'}</span>
                </div>
              ))}
            </div>

            {/* Property & Survey */}
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider bg-gray-100 px-3 py-2 rounded mb-3">Property & Survey</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
              {[
                ['Title / Customer', record.titleCustomer],
                ['Property Details', record.propertyDetails],
                ['Property Owner', record.propertyOwner],
                ['Contact Person', record.contactPerson],
                ['Contact Number', record.contactNumber],
                ['Surveyor', record.surveyorName],
                ['Survey Date', fmtDate(record.dateOfSurvey)],
                ['Report Date', fmtDate(record.dateOfReport)],
              ].map(([label, val]) => (
                <div key={label} className="flex border-b border-gray-50 py-1.5 items-start">
                  <span className="text-gray-500 font-medium w-2/5 shrink-0 pr-2">{label}</span>
                  <span className="text-gray-800 break-words">{val || '—'}</span>
                </div>
              ))}
            </div>

            {/* Dispatch & Financial */}
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider bg-gray-100 px-3 py-2 rounded mb-3">Dispatch & Financial</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm">
              {[
                ['Dispatched On', checkList(record.dispatchedOn)],
                ['FSV', record.fsv],
                ['Market', record.market],
                ['Invoice Amount', record.invoiceAmount],
                ['Paid', record.paid],
                ['Date', fmtDate(record.date)],
              ].map(([label, val]) => (
                <div key={label} className="flex border-b border-gray-50 py-1.5 items-start">
                  <span className="text-gray-500 font-medium w-2/5 shrink-0 pr-2">{label}</span>
                  <span className="text-gray-800 font-semibold break-words">{val || '—'}</span>
                </div>
              ))}
            </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFExport
