-- Create permissoes table
CREATE TABLE `permissoes` (
  `PK_permissao_id` BIGINT NOT NULL AUTO_INCREMENT,
  `modulo` VARCHAR(50) NOT NULL,
  `acao` VARCHAR(100) NOT NULL,
  `descricao` VARCHAR(255) NULL,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_permissao_id`),
  UNIQUE KEY `uk_permissao_modulo_acao` (`modulo`, `acao`),
  INDEX `idx_permissoes_modulo` (`modulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create permissoes_perfis junction table
CREATE TABLE `permissoes_perfis` (
  `PK_permissao_perfil_id` BIGINT NOT NULL AUTO_INCREMENT,
  `fk_perfil_id` INT NOT NULL,
  `fk_permissao_id` BIGINT NOT NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_permissao_perfil_id`),
  UNIQUE KEY `uk_perfil_permissao` (`fk_perfil_id`, `fk_permissao_id`),
  INDEX `idx_permissoes_perfis_perfil` (`fk_perfil_id`),
  INDEX `idx_permissoes_perfis_permissao` (`fk_permissao_id`),
  CONSTRAINT `permissoes_perfis_fk_perfil_id_fkey` FOREIGN KEY (`fk_perfil_id`) REFERENCES `perfis` (`PK_perfil_id`) ON DELETE CASCADE,
  CONSTRAINT `permissoes_perfis_fk_permissao_id_fkey` FOREIGN KEY (`fk_permissao_id`) REFERENCES `permissoes` (`PK_permissao_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert all permissions
INSERT INTO `permissoes` (`modulo`, `acao`, `descricao`) VALUES
-- Dashboard
('DASHBOARD', 'VIEW', 'Visualizar Dashboard'),
-- Importação
('IMPORTACAO', 'VIEW', 'Visualizar Importação'),
('IMPORTACAO', 'CREATE', 'Importar XML'),
('IMPORTACAO', 'DELETE', 'Excluir Importação'),
-- Validação
('VALIDACAO', 'VIEW', 'Visualizar Validação'),
('VALIDACAO', 'CREATE', 'Validar XML'),
('VALIDACAO', 'DELETE', 'Excluir Validação'),
-- Notas Fiscais
('NOTAS', 'VIEW', 'Visualizar Notas'),
('NOTAS', 'CREATE', 'Criar Nota'),
('NOTAS', 'UPDATE', 'Editar Nota'),
('NOTAS', 'DELETE', 'Excluir Nota'),
('NOTAS', 'EXPORT', 'Exportar Notas'),
-- Usuários
('USUARIOS', 'VIEW', 'Visualizar Usuários'),
('USUARIOS', 'CREATE', 'Criar Usuário'),
('USUARIOS', 'UPDATE', 'Editar Usuário'),
('USUARIOS', 'DELETE', 'Excluir Usuário'),
-- Cadastros
('CADASTROS', 'VIEW', 'Visualizar Cadastros'),
('CADASTROS', 'CREATE', 'Criar Cadastro'),
('CADASTROS', 'UPDATE', 'Editar Cadastro'),
('CADASTROS', 'DELETE', 'Excluir Cadastro'),
-- Logs
('LOGS', 'VIEW', 'Visualizar Logs do Sistema'),
('LOGS', 'EXPORT', 'Exportar Logs'),
-- Configurações
('CONFIG', 'VIEW', 'Visualizar Configurações'),
('CONFIG', 'UPDATE', 'Editar Configurações');
