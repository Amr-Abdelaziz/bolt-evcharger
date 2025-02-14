/*
  # Add sample charger data

  1. Changes
    - Insert sample charger data with various types, statuses, and locations
    - Add a mix of fast and standard chargers
    - Include different price points and statuses
*/

INSERT INTO chargers (type, status, price_per_kwh, latitude, longitude)
VALUES
  ('fast', 'available', 0.45, 40.712776, -74.005974),      -- New York City
  ('fast', 'occupied', 0.50, 40.714541, -74.007355),       -- NYC - Downtown
  ('standard', 'available', 0.35, 40.730610, -73.935242),  -- NYC - East Side
  ('fast', 'available', 0.48, 40.748817, -73.985428),      -- NYC - Midtown
  ('standard', 'maintenance', 0.30, 40.758896, -73.985130), -- NYC - Upper Side
  ('fast', 'available', 0.52, 40.722216, -73.987501),      -- NYC - Village
  ('standard', 'available', 0.32, 40.706005, -74.008827),  -- NYC - Financial District
  ('fast', 'occupied', 0.49, 40.750633, -73.993611),       -- NYC - Penn Station
  ('standard', 'available', 0.33, 40.759011, -73.984472),  -- NYC - Central Park
  ('fast', 'available', 0.47, 40.729884, -73.990988)       -- NYC - Lower East Side
;
