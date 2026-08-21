import { query } from '../config/database.js';

const mapFarmer = (row) => ({
  id: row.id,
  name: row.name,
  farmName: row.farm_name,
  role: row.role,
  category: row.category,
  region: row.region,
  scale: row.scale,
  phone: row.phone,
  email: row.email,
  equityShare: row.equity_share ? Number(row.equity_share) : 100,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getFarmers = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM farmers ORDER BY created_at ASC');
    res.json({
      success: true,
      data: result.rows.map(mapFarmer),
    });
  } catch (err) {
    next(err);
  }
};

export const getFarmerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const result = await query('SELECT * FROM farmers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }
    res.json({
      success: true,
      data: mapFarmer(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const createFarmer = async (req, res, next) => {
  try {
    const {
      id,
      name,
      farmName,
      role = 'Primary Operator',
      category = 'General Agriculture',
      region = 'Unspecified Region',
      scale = 'Standard Farm',
      phone = '',
      email = '',
      equityShare = 100,
    } = req.body;

    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let result;
    if (id && isUuid(id)) {
      result = await query(
        `INSERT INTO farmers (id, name, farm_name, role, category, region, scale, phone, email, equity_share)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [id, name, farmName, role, category, region, scale, phone, email, equityShare]
      );
    } else {
      result = await query(
        `INSERT INTO farmers (name, farm_name, role, category, region, scale, phone, email, equity_share)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, farmName, role, category, region, scale, phone, email, equityShare]
      );
    }

    res.status(201).json({
      success: true,
      data: mapFarmer(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const updateFarmer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const {
      name,
      farmName,
      role,
      category,
      region,
      scale,
      phone,
      email,
      equityShare,
    } = req.body;

    const existing = await query('SELECT * FROM farmers WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const current = existing.rows[0];
    const updatedName = name !== undefined ? name : current.name;
    const updatedFarmName = farmName !== undefined ? farmName : current.farm_name;
    const updatedRole = role !== undefined ? role : current.role;
    const updatedCategory = category !== undefined ? category : current.category;
    const updatedRegion = region !== undefined ? region : current.region;
    const updatedScale = scale !== undefined ? scale : current.scale;
    const updatedPhone = phone !== undefined ? phone : current.phone;
    const updatedEmail = email !== undefined ? email : current.email;
    const updatedEquityShare = equityShare !== undefined ? equityShare : current.equity_share;

    const result = await query(
      `UPDATE farmers
       SET name = $1, farm_name = $2, role = $3, category = $4, region = $5,
           scale = $6, phone = $7, email = $8, equity_share = $9
       WHERE id = $10
       RETURNING *`,
      [
        updatedName,
        updatedFarmName,
        updatedRole,
        updatedCategory,
        updatedRegion,
        updatedScale,
        updatedPhone,
        updatedEmail,
        updatedEquityShare,
        id,
      ]
    );

    res.json({
      success: true,
      data: mapFarmer(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteFarmer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUuid(id)) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const result = await query('DELETE FROM farmers WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }
    res.json({
      success: true,
      data: { id: result.rows[0].id },
    });
  } catch (err) {
    next(err);
  }
};
