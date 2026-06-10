-- Change xml_bruto_json from JSON to LONGTEXT to support raw XML content
ALTER TABLE `notas_fiscais` MODIFY COLUMN `xml_bruto_json` LONGTEXT NULL;