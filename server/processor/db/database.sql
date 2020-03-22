CREATE TABLE transactions (
	id int NOT NULL, --transaction_id
	amount float NOT NULL, --transaction_amount
	type varchar(256) NOT NULL, --transaction_type
	parent_id int, --parent_id_of_transaction
	PRIMARY KEY (id) 
);




-- insert into transactions (power, fam_id, un_id) values 
-- (10, 1, 1), (32, 1, 1), (21, 2, 1), (50, 3, 1), (34, 4, 1), (45, 4, 1),
-- (42, 1, 2), (35, 2, 2), (40, 3, 2), (10, 3, 2), (40, 4, 2),
-- (42, 1, 3), (55, 2, 3), (50, 3, 3), (40, 4, 3);


-- select  id,
--         amount,
--         parent_id
-- from    (select * from transactions
--         ) transactions,
--         (select @pv := 1) initialisation
-- where   find_in_set(parent_id, @pv) > 0
-- and     @pv := concat(@pv, ',', id);