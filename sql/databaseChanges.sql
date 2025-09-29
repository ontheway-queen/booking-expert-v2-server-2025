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


alter table agent.white_label_permissions
add column b2c_link varchar(500);

create type agent.type_payment_gateway as enum ('SSL','BKASH');

create table agent.payment_gateway_creds(
	id serial primary key,
	agency_id bigint not null,
	gateway_name agent.type_payment_gateway not null,
	key varchar(300) not null,
	value varchar(1000) not null,
	created_at timestamp default current_timestamp,
	status boolean default true
);

create table dbo.payment_gateway_token
(
	id serial primary key,
	gateway_name agent.type_payment_gateway not null,
	key varchar(255) not null,
	value text not null,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp
)