import { query } from '../config/database.js';

const mapSeason = (row) => ({
  id: row.id,
  name: row.name,
  order: Number(row.sort_order),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getSeasons = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM seasons ORDER BY sort_order ASC');
    res.json({
      success: true,
      data: result.rows.map(mapSeason),
    });
  } catch (err) {
    next(err);
  }
};

export const getSeasonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }

    const result = await query('SELECT * FROM seasons WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }
    res.json({
      success: true,
      data: mapSeason(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const createSeason = async (req, res, next) => {
  try {
    const { id, name, order } = req.body;

    let sortOrder = order;
    if (sortOrder === undefined || sortOrder === null) {
      const maxRes = await query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM seasons');
      sortOrder = maxRes.rows[0].next_order;
    }

    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let result;
    if (id && isUuid(id)) {
      result = await query(
        `INSERT INTO seasons (id, name, sort_order)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id, name, sortOrder]
      );
    } else {
      result = await query(
        `INSERT INTO seasons (name, sort_order)
         VALUES ($1, $2)
         RETURNING *`,
        [name, sortOrder]
      );
    }

    res.status(201).json({
      success: true,
      data: mapSeason(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const updateSeason = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }

    const existing = await query('SELECT * FROM seasons WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }

    const current = existing.rows[0];
    const updatedName = name !== undefined ? name : current.name;
    const updatedOrder = order !== undefined ? order : current.sort_order;

    const result = await query(
      `UPDATE seasons
       SET name = $1, sort_order = $2
       WHERE id = $3
       RETURNING *`,
      [updatedName, updatedOrder, id]
    );

    res.json({
      success: true,
      data: mapSeason(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSeason = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }

    const result = await query('DELETE FROM seasons WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }
    res.json({
      success: true,
      data: { id: result.rows[0].id },
    });
  } catch (err) {
    next(err);
  }
};
