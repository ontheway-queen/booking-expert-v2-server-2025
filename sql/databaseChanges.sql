alter table dbo.dynamic_fare_tax
add column from_dac boolean,
add column to_dac boolean,
add column soto boolean,
add column domestic boolean


CREATE TABLE services.visa_required_documents (
   id SERIAL PRIMARY KEY,
   field_name VARCHAR(50),
   source_type dbo.type_panel_source,
   source_id integer
)