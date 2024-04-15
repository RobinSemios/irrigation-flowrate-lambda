select
    z.id as "zoneId"
    ,z.property_id AS "propertyId"
    ,z.geom as "zoneGeom"
    ,iz.emitter_type as "emitterType"
    ,iz.external_zone_id as "externalZoneId"
    ,xpi.external_property_id as "externalPropertyId"
    ,s.api_key  as "apiKey"
    ,s.api_secret as "apiSecret"
from zones z 
join integrations.irrigation_zone_associations iz on iz.zone_id = z.id
join integrations.property_associations xpi on xpi.property_id = z.property_id 
join integrations.secrets s on s.external_customer_id = xpi.external_property_id 
and z.type = 'IRRIGATION'
--where xpi.property_id = '51573'
order by z.id asc