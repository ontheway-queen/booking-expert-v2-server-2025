-- type updated- type_for, type_booking_source, type_price_for
-- new table visa, visa application
-- dbo.type_invoice_ref new type, and change invoice ref_type column data type to this 
-- new column added agent_b2c.site_config fabicon,site_thumbnail



CREATE TYPE dbo.discount_type AS ENUM
    ('PERCENTAGE', 'FLAT');



CREATE TABLE IF NOT EXISTS dbo.umrah_package
(
    id serial PRIMARY KEY NOT NULL,
    title character varying(500) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    duration integer,
    valid_till_date date,
    group_size integer,
    status boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    b2c_price_per_person numeric(18,2),
    b2c_discount numeric(18,2),
    b2c_discount_type dbo.discount_type,
    package_details text COLLATE pg_catalog."default",
    slug text COLLATE pg_catalog."default",
    meta_tag text COLLATE pg_catalog."default",
    meta_description text COLLATE pg_catalog."default",
	umrah_for services.type_for NOT NULL,
	agency_id integer
)


CREATE TABLE IF NOT EXISTS dbo.umrah_package_photos
(
    id serial PRIMARY KEY NOT NULL,
    umrah_id integer NOT NULL,
    photo character varying(255) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)


CREATE TABLE IF NOT EXISTS dbo.umrah_package_details
(
    id SERIAL PRIMARY KEY NOT NULL,
    umrah_id integer NOT NULL,
    details_title text COLLATE pg_catalog."default" NOT NULL,
    details_description text COLLATE pg_catalog."default" NOT NULL,
    status boolean NOT NULL DEFAULT true,
    type character varying(100) COLLATE pg_catalog."default"
)


CREATE TABLE IF NOT EXISTS dbo.umrah_include_exclude_items
(
    id serial PRIMARY KEY NOT NULL,
    icon text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default"
)


CREATE TABLE IF NOT EXISTS dbo.umrah_package_include
(
    id serial PRIMARY KEY NOT NULL,
    umrah_id integer NOT NULL,
    include_exclude_id integer NOT NULL
)
