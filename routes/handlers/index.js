// Routes for handlers
const express = require('express');
const router = express.Router();

// 404
router.get('*', (req, res) => {
	res.render('404', {});
});

module.exports = router;