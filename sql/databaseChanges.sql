alter table agent.agency
add column sub_agent_commission numeric(5,2) default 0.00;

alter table agent.agency
add column kam_id integer;


CREATE TABLE IF NOT EXISTS agent.audit_trail
(
    id serial primary key,
    created_by integer NOT NULL,
    type dbo.type_audit_trail NOT NULL,
    details text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payload json
);

create table agent.sub_agent_markup(
	agency_id integer primary key,
	flight_markup_type dbo.type_price_adjustment_method not null,
	hotel_markup_type dbo.type_price_adjustment_method not null,
	flight_markup_mode dbo.type_price_modification_direction not null,
	hotel_markup_mode dbo.type_price_modification_direction not null,
	flight_markup decimal(10,2) default 0.00,
	hotel_markup decimal(10,2) default 0.00
);