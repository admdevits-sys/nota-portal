-- Create logs_sistema table for system activity tracking
CREATE TABLE `logs_sistema` (
  `PK_log_id` BIGINT NOT NULL AUTO_INCREMENT,
  `fk_usuario_id` CHAR(36) NULL,
  `modulo` VARCHAR(50) NOT NULL,
  `acao` VARCHAR(100) NOT NULL,
  `tabela_afetada` VARCHAR(50) NULL,
  `registro_afetado_id` VARCHAR(50) NULL,
  `descricao` VARCHAR(255) NOT NULL,
  `detalhes` TEXT NULL,
  `endereco_ip` VARCHAR(45) NOT NULL,
  `agente_usuario` VARCHAR(255) NOT NULL,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_log_id`),
  INDEX `idx_logs_sistema_usuario_modulo` (`fk_usuario_id`, `modulo`, `data_criacao`),
  INDEX `idx_logs_sistema_modulo_data` (`modulo`, `data_criacao`),
  CONSTRAINT `logs_sistema_fk_usuario_id_fkey` FOREIGN KEY (`fk_usuario_id`) REFERENCES `usuarios` (`PK_usuario_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
