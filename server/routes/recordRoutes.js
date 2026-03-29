const express = require('express');
const router = express.Router();
const { getRecords, createRecord, getRecordById, updateRecord } = require('../controllers/recordController');

router.route('/').get(getRecords).post(createRecord);
router.route('/:id').get(getRecordById).put(updateRecord);

module.exports = router;
