import { query } from '../config/database.js';

export const getBudgets = async (req, res, next) => {
  try {
    const { farmerId, seasonId } = req.query;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (farmerId && !isUuid(farmerId)) {
      return res.json({ success: true, data: {} });
    }
    if (seasonId && !isUuid(seasonId)) {
      return res.json({ success: true, data: {} });
    }

    let sql = 'SELECT * FROM budgets WHERE 1=1';
    const params = [];

    if (farmerId) {
      params.push(farmerId);
      sql += ` AND farmer_id = $${params.length}`;
    }
    if (seasonId) {
      params.push(seasonId);
      sql += ` AND season_id = $${params.length}`;
    }

    const result = await query(sql, params);
    
    // Format response as object { seeds: 1000, fertilizer: 2000, ... } or list if no farmerId
    if (farmerId) {
      const budgetMap = {};
      result.rows.forEach((row) => {
        budgetMap[row.category] = Number(row.amount);
      });
      return res.json({
        success: true,
        data: budgetMap,
      });
    }

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        farmerId: row.farmer_id,
        seasonId: row.season_id,
        category: row.category,
        amount: Number(row.amount),
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const upsertBudget = async (req, res, next) => {
  try {
    const { farmerId, seasonId, category, amount } = req.body;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let validSeasonId = seasonId;
    if (!isUuid(validSeasonId)) {
      // Resolve first season
      const sRes = await query('SELECT id FROM seasons ORDER BY sort_order ASC LIMIT 1');
      if (sRes.rows.length > 0) {
        validSeasonId = sRes.rows[0].id;
      } else {
        return res.status(400).json({ success: false, message: 'No valid season found in database to map budget.' });
      }
    }

    const result = await query(
      `INSERT INTO budgets (farmer_id, season_id, category, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (farmer_id, season_id, category)
       DO UPDATE SET amount = EXCLUDED.amount, updated_at = NOW()
       RETURNING *`,
      [farmerId, validSeasonId, category, amount]
    );

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        farmerId: result.rows[0].farmer_id,
        seasonId: result.rows[0].season_id,
        category: result.rows[0].category,
        amount: Number(result.rows[0].amount),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateBudgetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const result = await query(
      `UPDATE budgets SET amount = $1 WHERE id = $2 RETURNING *`,
      [amount, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Budget record not found' });
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        farmerId: result.rows[0].farmer_id,
        seasonId: result.rows[0].season_id,
        category: result.rows[0].category,
        amount: Number(result.rows[0].amount),
      },
    });
  } catch (err) {
    next(err);
  }
};
