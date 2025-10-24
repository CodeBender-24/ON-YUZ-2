CREATE SCHEMA IF NOT EXISTS bank;
SET search_path TO bank;

CREATE TABLE IF NOT EXISTS accounts (
    id BIGSERIAL PRIMARY KEY,
    iban TEXT UNIQUE NOT NULL CHECK (iban ~ '^TR[0-9]{24}$'),
    full_name TEXT NOT NULL,
    balance NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfers (
    id BIGSERIAL PRIMARY KEY,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    from_account_id BIGINT REFERENCES accounts(id),
    to_account_id BIGINT REFERENCES accounts(id),
    from_iban TEXT,
    from_full_name TEXT,
    to_iban TEXT,
    to_full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfers_created_at ON transfers (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_from_to_iban ON transfers (from_iban, to_iban);

CREATE OR REPLACE FUNCTION send_money(p_from_iban TEXT, p_to_iban TEXT, p_amount NUMERIC)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_from_account accounts%ROWTYPE;
    v_to_account accounts%ROWTYPE;
    v_transfer_id BIGINT;
BEGIN
    IF p_from_iban = p_to_iban THEN
        RAISE EXCEPTION 'Gönderen ve alıcı IBAN aynı olamaz.';
    END IF;

    SELECT * INTO v_from_account FROM accounts WHERE iban = p_from_iban FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Gönderen hesap bulunamadı.';
    END IF;

    SELECT * INTO v_to_account FROM accounts WHERE iban = p_to_iban FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Alıcı hesap bulunamadı.';
    END IF;

    IF v_from_account.balance < p_amount THEN
        RAISE EXCEPTION 'Yetersiz bakiye.';
    END IF;

    UPDATE accounts
    SET balance = balance - p_amount
    WHERE id = v_from_account.id;

    UPDATE accounts
    SET balance = balance + p_amount
    WHERE id = v_to_account.id;

    INSERT INTO transfers (amount, from_account_id, to_account_id, from_iban, from_full_name, to_iban, to_full_name)
    VALUES (p_amount, v_from_account.id, v_to_account.id, v_from_account.iban, v_from_account.full_name, v_to_account.iban, v_to_account.full_name)
    RETURNING id INTO v_transfer_id;

    RETURN v_transfer_id;
END;
$$;

