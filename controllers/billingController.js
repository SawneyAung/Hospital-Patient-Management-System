const db = require('../data/db');

const getBillingPage = (req, res) => {
    const { status } = req.query;
  
    let billingQuery = `
      SELECT 
        p.prescription_id,
        p.medication_details,
        p.bill_amount,
        p.payment_status,
        p.payment_date,
        patients.first_name,
        patients.last_name
      FROM prescriptions p
      JOIN patients ON p.patient_id = patients.patient_id
    `;
  
    const params = [];
  
    if (status && ['Paid', 'Unpaid', 'Pending'].includes(status)) {
      billingQuery += ' WHERE p.payment_status = ?';
      params.push(status);
    }
  
    billingQuery += ' ORDER BY p.payment_date DESC';
  
    db.query(billingQuery, params, (err, results) => {
      if (err) return res.status(500).send('Error loading billing records');
      res.render('admin/billings', {
        billings: results,
        filterStatus: status || ''  
      });      
    });
  };
  

module.exports = { getBillingPage };
