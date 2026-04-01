const express = require('express');
const router = express.Router();
const { getRecords, createRecord, getRecordById, updateRecord, deleteRecord } = require('../controllers/recordController');

router.route('/').get(getRecords).post(createRecord);
router.route('/:id').get(getRecordById).put(updateRecord).delete(deleteRecord);

module.exports = router;
