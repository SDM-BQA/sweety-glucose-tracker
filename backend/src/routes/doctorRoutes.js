const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const {
  getMyDoctor,
  assignMyDoctor,
  unassignMyDoctor,
  listPatients,
  patientDaily,
  patientMonthToDate,
  patientMonthly,
} = require('../controllers/doctorController');

const router = express.Router();
router.use(requireAuth);

// Patient-side: manage which doctor can see your reports.
router.get('/patients/me/doctor', catchAsync(getMyDoctor));
router.put('/patients/me/doctor', catchAsync(assignMyDoctor));
router.delete('/patients/me/doctor', catchAsync(unassignMyDoctor));

// Doctor-side: view reports of patients who assigned you.
router.get('/doctor/patients', requireRole('doctor'), catchAsync(listPatients));
router.get('/doctor/patients/:patientId/reports/daily', requireRole('doctor'), catchAsync(patientDaily));
router.get(
  '/doctor/patients/:patientId/reports/month-to-date',
  requireRole('doctor'),
  catchAsync(patientMonthToDate)
);
router.get('/doctor/patients/:patientId/reports/monthly', requireRole('doctor'), catchAsync(patientMonthly));

module.exports = router;
