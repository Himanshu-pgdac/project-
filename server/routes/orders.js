const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Create order
router.post('/', auth, async (req, res) => {
  const { items } = req.body;
  
  try {
    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const [cookie] = await db.query('SELECT price FROM cookies WHERE id = ?', [item.cookie_id]);
      totalAmount += cookie[0].price * item.quantity;
    }
    
    // Create order
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
      [req.user.id, totalAmount]
    );
    
    // Add order items
    for (const item of items) {
      const [cookie] = await db.query('SELECT price FROM cookies WHERE id = ?', [item.cookie_id]);
      
      await db.query(
        'INSERT INTO order_items (order_id, cookie_id, quantity, customizations, price) VALUES (?, ?, ?, ?, ?)',
        [orderResult.insertId, item.cookie_id, item.quantity, item.customizations || null, cookie[0].price]
      );
    }
    
    const [newOrder] = await db.query(`
      SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'cookie_id', oi.cookie_id,
            'name', c.name,
            'quantity', oi.quantity,
            'customizations', oi.customizations,
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN cookies c ON oi.cookie_id = c.id
      WHERE o.id = ?
      GROUP BY o.id
    `, [orderResult.insertId]);
    
    res.json(newOrder[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'cookie_id', oi.cookie_id,
            'name', c.name,
            'quantity', oi.quantity,
            'customizations', oi.customizations,
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN cookies c ON oi.cookie_id = c.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `, [req.user.id]);
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;