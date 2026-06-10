-- Add danfse fields to validacoes_xml
ALTER TABLE `validacoes_xml` ADD COLUMN `danfse_url` VARCHAR(500) NULL;
ALTER TABLE `validacoes_xml` ADD COLUMN `danfse_path` VARCHAR(500) NULL;