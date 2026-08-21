import { query } from '../config/database.js';

const mapTransaction = (row) => ({
  id: row.id,
  seasonId: row.season_id,
  farmerId: row.farmer_id,
  type: row.type,
  category: row.category,
  amount: Number(row.amount),
  note: row.note || '',
  date: row.date ? (typeof row.date === 'string' ? row.date.slice(0, 10) : row.date.toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
  unusual: Boolean(row.unusual),
  split: row.split_total !== null && row.split_total !== undefined ? {
    total: Number(row.split_total),
    peopleCount: Number(row.split_people_count),
    names: row.split_names || '',
  } : null,
  crop: row.crop || null,
  fieldId: row.field_id || null,
  receipt: row.receipt || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getTransactions = async (req, res, next) => {
  try {
    const { farmerId, seasonId, type } = req.query;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (farmerId && !isUuid(farmerId)) {
      return res.json({ success: true, data: [] });
    }
    if (seasonId && !isUuid(seasonId)) {
      return res.json({ success: true, data: [] });
    }

    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (farmerId) {
      params.push(farmerId);
      sql += ` AND farmer_id = $${params.length}`;
    }
    if (seasonId) {
      params.push(seasonId);
      sql += ` AND season_id = $${params.length}`;
    }
    if (type) {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const result = await query(sql, params);
    res.json({
      success: true,
      data: result.rows.map(mapTransaction),
    });
  } catch (err) {
    next(err);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    const result = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({
      success: true,
      data: mapTransaction(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const {
      id,
      seasonId,
      farmerId,
      type,
      category,
      amount,
      note = '',
      date = new Date().toISOString().slice(0, 10),
      unusual = false,
      split = null,
      crop = null,
      fieldId = null,
      receipt = null,
    } = req.body;

    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Resolve farmerId to a valid PostgreSQL UUID
    let validFarmerId = farmerId;
    if (!isUuid(validFarmerId)) {
      const fRes = await query('SELECT id FROM farmers LIMIT 1');
      if (fRes.rows.length > 0) {
        validFarmerId = fRes.rows[0].id;
      } else {
        return res.status(400).json({ success: false, message: 'No valid farmer profile found in database.' });
      }
    }

    // Resolve seasonId to a valid PostgreSQL UUID
    let validSeasonId = seasonId;
    if (!isUuid(validSeasonId)) {
      const sRes = await query('SELECT id FROM seasons ORDER BY sort_order ASC LIMIT 1');
      if (sRes.rows.length > 0) {
        validSeasonId = sRes.rows[0].id;
      } else {
        const newS = await query(`INSERT INTO seasons (name, sort_order) VALUES ('Kharif 2026', 1) RETURNING id`);
        validSeasonId = newS.rows[0].id;
      }
    }

    const splitTotal = split ? split.total : null;
    const splitPeopleCount = split ? split.peopleCount : null;
    const splitNames = split ? split.names : null;
    const validFieldId = fieldId && isUuid(fieldId) ? fieldId : null;

    let result;
    if (id && isUuid(id)) {
      result = await query(
        `INSERT INTO transactions (id, season_id, farmer_id, type, category, amount, note, date, unusual, split_total, split_people_count, split_names, crop, field_id, receipt)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [id, validSeasonId, validFarmerId, type, category, amount, note, date, unusual, splitTotal, splitPeopleCount, splitNames, crop, validFieldId, receipt]
      );
    } else {
      result = await query(
        `INSERT INTO transactions (season_id, farmer_id, type, category, amount, note, date, unusual, split_total, split_people_count, split_names, crop, field_id, receipt)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [validSeasonId, validFarmerId, type, category, amount, note, date, unusual, splitTotal, splitPeopleCount, splitNames, crop, validFieldId, receipt]
      );
    }

    res.status(201).json({
      success: true,
      data: mapTransaction(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const {
      seasonId,
      farmerId,
      type,
      category,
      amount,
      note,
      date,
      unusual,
      split,
      crop,
      fieldId,
      receipt,
    } = req.body;

    const existing = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const current = existing.rows[0];
    const updatedSeasonId = seasonId !== undefined ? seasonId : current.season_id;
    const updatedFarmerId = farmerId !== undefined ? farmerId : current.farmer_id;
    const updatedType = type !== undefined ? type : current.type;
    const updatedCategory = category !== undefined ? category : current.category;
    const updatedAmount = amount !== undefined ? amount : current.amount;
    const updatedNote = note !== undefined ? note : current.note;
    const updatedDate = date !== undefined ? date : current.date;
    const updatedUnusual = unusual !== undefined ? unusual : current.unusual;
    const updatedCrop = crop !== undefined ? crop : current.crop;
    const updatedFieldId = fieldId !== undefined ? (fieldId && isUuid(fieldId) ? fieldId : null) : current.field_id;
    const updatedReceipt = receipt !== undefined ? receipt : current.receipt;

    let updatedSplitTotal = current.split_total;
    let updatedSplitPeopleCount = current.split_people_count;
    let updatedSplitNames = current.split_names;

    if (split !== undefined) {
      updatedSplitTotal = split ? split.total : null;
      updatedSplitPeopleCount = split ? split.peopleCount : null;
      updatedSplitNames = split ? split.names : null;
    }

    const result = await query(
      `UPDATE transactions
       SET season_id = $1, farmer_id = $2, type = $3, category = $4, amount = $5,
           note = $6, date = $7, unusual = $8, split_total = $9, split_people_count = $10,
           split_names = $11, crop = $12, field_id = $13, receipt = $14
       WHERE id = $15
       RETURNING *`,
      [
        updatedSeasonId,
        updatedFarmerId,
        updatedType,
        updatedCategory,
        updatedAmount,
        updatedNote,
        updatedDate,
        updatedUnusual,
        updatedSplitTotal,
        updatedSplitPeopleCount,
        updatedSplitNames,
        updatedCrop,
        updatedFieldId,
        updatedReceipt,
        id,
      ]
    );

    res.json({
      success: true,
      data: mapTransaction(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const result = await query('DELETE FROM transactions WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({
      success: true,
      data: { id: result.rows[0].id },
    });
  } catch (err) {
    next(err);
  }
};
