CREATE TABLE IF NOT EXISTS experience (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    tech_stack VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    years INT NOT NULL CHECK (years > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_experience_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE CASCADE
);

CREATE TRIGGER experience_update_timestamp
BEFORE UPDATE ON experience
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();