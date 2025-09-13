const express = require('express');
const { auth, authFaculty } = require('../middleware/auth');
const pages = require('../controllers/pages.controller');

const router = express.Router();

router.get('/', auth, pages.getIndex);
router.get('/home', auth, pages.getHome);
router.get('/faculty', authFaculty, pages.getFaculty);
router.get('/curriculum', auth, pages.getCurriculum);
router.get('/semester', auth, pages.getSemester);
router.get('/subject', auth, pages.getSubject);

router.get('/dsa', auth, pages.getDsa);
router.get('/os', auth, pages.getOs);
router.get('/oops', auth, pages.getOops);
router.get('/webd', auth, pages.getWebd);
router.get('/dbms', auth, pages.getDbms);
router.get('/cn', auth, pages.getCn);
router.get('/placement', auth, pages.getPlacement);
router.get('/support', auth, pages.getSupport);
router.get('/team', auth, pages.getTeam);

router.get('/terms', pages.getTerms);
router.get('/privacy', pages.getPrivacy);

router.post('/support', auth, pages.postSupport);

module.exports = router;
