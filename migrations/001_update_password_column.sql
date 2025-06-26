-- Ajusta o tamanho do campo de senha para comportar hashes gerados por password_hash
ALTER TABLE usuarios MODIFY senha VARCHAR(255) NOT NULL;
