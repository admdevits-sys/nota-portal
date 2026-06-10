-- Create validacoes_xml table
CREATE TABLE `validacoes_xml` (
  `PK_validacao_id` CHAR(36) NOT NULL,
  `fk_usuario_id` CHAR(36) NOT NULL,
  `tipo_documento` ENUM('NFE', 'NFSE') NOT NULL,
  `chave_acesso` VARCHAR(100) NOT NULL,
  `numero_documento` VARCHAR(50) NOT NULL,
  `cnpj_emitente` VARCHAR(20) NOT NULL,
  `nome_emitente` VARCHAR(150) NOT NULL,
  `cnpj_destinatario` VARCHAR(20) DEFAULT NULL,
  `nome_destinatario` VARCHAR(150) DEFAULT NULL,
  `valor_total` VARCHAR(20) NOT NULL,
  `status` ENUM('PENDENTE', 'PROCESSANDO', 'VALIDO', 'INVALIDO', 'ERRO_CONSULTA') DEFAULT 'PENDENTE',
  `situacao_fiscal` VARCHAR(50) DEFAULT NULL,
  `protocolo` VARCHAR(50) DEFAULT NULL,
  `data_autorizacao` DATETIME DEFAULT NULL,
  `erros_json` LONGTEXT DEFAULT NULL,
  `xml_bruto` LONGTEXT DEFAULT NULL,
  `data_criacao` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_validacao_id`),
  INDEX `idx_validacoes_tipo` (`tipo_documento`),
  INDEX `idx_validacoes_chave` (`chave_acesso`),
  INDEX `idx_validacoes_status` (`status`),
  INDEX `idx_validacoes_data` (`data_criacao`),
  INDEX `idx_validacoes_usuario` (`fk_usuario_id`),
  CONSTRAINT `validacoes_xml_fk_usuario_id_fkey` FOREIGN KEY (`fk_usuario_id`) REFERENCES `usuarios` (`PK_usuario_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add validacoes_xml relation to usuarios table (via alter)
-- Note: This is already handled by the FK constraint above
