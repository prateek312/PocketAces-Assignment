CREATE TABLE transactions (
	id int NOT NULL, --transaction_id
	amount float NOT NULL, --transaction_amount
	type varchar(256) NOT NULL, --transaction_type
	parent_id int, --parent_id_of_transaction
	PRIMARY KEY (id) 
);