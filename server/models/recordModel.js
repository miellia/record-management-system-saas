const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  serialNumber: { type: String },
  requestDate: { type: Date },
  requestReceivedBy: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    other: { type: Boolean, default: false }
  },
  referenceNumber: { type: String },
  name: { type: String },
  position: { type: String },
  landline: { type: String },
  mobile: { type: String },
  email: { type: String },
  address: { type: String },
  requestingAgency: { type: String },
  branchOffice: { type: String },
  titleCustomer: { type: String },
  propertyDetails: { type: String },
  propertyOwner: { type: String },
  contactPerson: { type: String },
  contactNumber: { type: String },
  surveyorName: { type: String },
  dateOfSurvey: { type: Date },
  dateOfReport: { type: Date },
  reportStatus: { type: String, enum: ['Completed', 'In Progress', ''], default: '' },
  dispatchedOn: {
    whatsapp: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    courier: { type: Boolean, default: false }
  },
  fsv: { type: String },
  market: { type: String },
  invoiceAmount: { type: String },
  paid: { type: String, enum: ['Yes', 'No', ''], default: '' },
  date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);
