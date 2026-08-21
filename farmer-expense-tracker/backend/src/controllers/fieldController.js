import { query } from '../config/database.js';

const mapField = (row) => ({
  id: row.id,
  farmerId: row.farmer_id,
  name: row.name,
  crop: row.crop || '',
  area: row.area !== null && row.area !== undefined ? Number(row.area) : null,
  areaUnit: row.area_unit || 'acres',
  location: row.location || '',
  seasonId: row.season_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getFields = async (req, res, next) => {
  try {
    const { farmerId, seasonId } = req.query;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (farmerId && !isUuid(farmerId)) {
      return res.json({ success: true, data: [] });
    }
    if (seasonId && !isUuid(seasonId)) {
      return res.json({ success: true, data: [] });
    }

    let sql = 'SELECT * FROM fields WHERE 1=1';
    const params = [];

    if (farmerId) {
      params.push(farmerId);
      sql += ` AND farmer_id = $${params.length}`;
    }
    if (seasonId) {
      params.push(seasonId);
      sql += ` AND season_id = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({
      success: true,
      data: result.rows.map(mapField),
    });
  } catch (err) {
    next(err);
  }
};

export const getFieldById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }

    const result = await query('SELECT * FROM fields WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }
    res.json({
      success: true,
      data: mapField(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const createField = async (req, res, next) => {
  try {
    const {
      id,
      farmerId,
      name,
      crop = '',
      area = null,
      areaUnit = 'acres',
      location = '',
      seasonId = null,
    } = req.body;

    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!farmerId || !isUuid(farmerId)) {
      return res.status(400).json({ success: false, message: 'Valid Farmer ID is required' });
    }

    let result;
    if (id && isUuid(id)) {
      result = await query(
        `INSERT INTO fields (id, farmer_id, name, crop, area, area_unit, location, season_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [id, farmerId, name, crop, area, areaUnit, location, seasonId]
      );
    } else {
      result = await query(
        `INSERT INTO fields (farmer_id, name, crop, area, area_unit, location, season_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [farmerId, name, crop, area, areaUnit, location, seasonId]
      );
    }

    res.status(201).json({
      success: true,
      data: mapField(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const updateField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }

    const {
      name,
      crop,
      area,
      areaUnit,
      location,
      seasonId,
    } = req.body;

    const existing = await query('SELECT * FROM fields WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }

    const current = existing.rows[0];
    const updatedName = name !== undefined ? name : current.name;
    const updatedCrop = crop !== undefined ? crop : current.crop;
    const updatedArea = area !== undefined ? area : current.area;
    const updatedAreaUnit = areaUnit !== undefined ? areaUnit : current.area_unit;
    const updatedLocation = location !== undefined ? location : current.location;
    const updatedSeasonId = seasonId !== undefined ? seasonId : current.season_id;

    const result = await query(
      `UPDATE fields
       SET name = $1, crop = $2, area = $3, area_unit = $4, location = $5, season_id = $6
       WHERE id = $7
       RETURNING *`,
      [updatedName, updatedCrop, updatedArea, updatedAreaUnit, updatedLocation, updatedSeasonId, id]
    );

    res.json({
      success: true,
      data: mapField(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }

    const result = await query('DELETE FROM fields WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }
    res.json({
      success: true,
      data: { id: result.rows[0].id },
    });
  } catch (err) {
    next(err);
  }
};
