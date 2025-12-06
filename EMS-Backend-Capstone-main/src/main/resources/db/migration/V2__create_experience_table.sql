CREATE TABLE IF NOT EXISTS experience (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    tech_stack VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    years INT NOT NULL CHECK (years > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_experience_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE
);