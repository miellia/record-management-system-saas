const express = require('express');
const router = express.Router();
const { getRecords, createRecord, getRecordById, updateRecord, deleteRecord } = require('../controllers/recordController');
const protect = require('../middleware/authMiddleware');

router.route('/').get(protect, getRecords).post(protect, createRecord);
router.route('/:id').get(protect, getRecordById).put(protect, updateRecord).delete(protect, deleteRecord);

module.exports = router;
