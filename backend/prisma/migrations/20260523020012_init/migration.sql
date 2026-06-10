-- CreateTable
CREATE TABLE `perfis` (
    `PK_perfil_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `perfis_nome_key`(`nome`),
    PRIMARY KEY (`PK_perfil_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `PK_usuario_id` CHAR(36) NOT NULL,
    `fk_perfil_id` INTEGER NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    INDEX `usuarios_fk_perfil_id_idx`(`fk_perfil_id`),
    PRIMARY KEY (`PK_usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs_auditoria` (
    `PK_log_id` BIGINT NOT NULL AUTO_INCREMENT,
    `fk_usuario_id` CHAR(36) NULL,
    `acao` VARCHAR(100) NOT NULL,
    `tabela_afetada` VARCHAR(50) NULL,
    `registro_afetado_id` VARCHAR(50) NULL,
    `endereco_ip` VARCHAR(45) NOT NULL,
    `agente_usuario` VARCHAR(255) NOT NULL,
    `detalhes` JSON NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_auditoria_usuario_acao`(`fk_usuario_id`, `acao`),
    PRIMARY KEY (`PK_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `importacoes` (
    `PK_importacao_id` CHAR(36) NOT NULL,
    `fk_usuario_id` CHAR(36) NOT NULL,
    `nome_arquivo` VARCHAR(255) NOT NULL,
    `hash_arquivo` CHAR(64) NOT NULL,
    `tamanho_arquivo_bytes` BIGINT NOT NULL,
    `status` ENUM('PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'FALHOU', 'PARCIAL') NOT NULL DEFAULT 'PENDENTE',
    `total_registros` INTEGER NOT NULL DEFAULT 0,
    `registros_processados` INTEGER NOT NULL DEFAULT 0,
    `log_erros` JSON NULL,
    `data_hora_inicio` DATETIME(3) NULL,
    `data_hora_fim` DATETIME(3) NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `importacoes_hash_arquivo_key`(`hash_arquivo`),
    INDEX `idx_importacoes_status`(`status`),
    INDEX `idx_importacoes_data`(`data_criacao`),
    PRIMARY KEY (`PK_importacao_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notas_fiscais` (
    `PK_nota_fiscal_id` CHAR(36) NOT NULL,
    `fk_importacao_id` CHAR(36) NOT NULL,
    `tipo_documento` ENUM('NFE', 'NFSE') NOT NULL,
    `chave_acesso` VARCHAR(100) NOT NULL,
    `numero_documento` VARCHAR(50) NOT NULL,
    `data_emissao` DATETIME(3) NOT NULL,
    `documento_emitente` VARCHAR(20) NOT NULL,
    `nome_emitente` VARCHAR(150) NOT NULL,
    `documento_destinatario` VARCHAR(20) NULL,
    `nome_destinatario` VARCHAR(150) NULL,
    `valor_total` DECIMAL(15, 2) NOT NULL,
    `total_impostos` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `xml_bruto_json` JSON NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `notas_fiscais_chave_acesso_key`(`chave_acesso`),
    INDEX `idx_notas_tipo_data`(`tipo_documento`, `data_emissao`),
    INDEX `idx_notas_emitente`(`documento_emitente`),
    PRIMARY KEY (`PK_nota_fiscal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_nota_fiscal` (
    `PK_item_id` BIGINT NOT NULL AUTO_INCREMENT,
    `fk_nota_fiscal_id` CHAR(36) NOT NULL,
    `numero_item` INTEGER NOT NULL,
    `codigo_produto` VARCHAR(50) NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `ncm` VARCHAR(10) NULL,
    `cfop` VARCHAR(10) NULL,
    `quantidade` DECIMAL(15, 4) NOT NULL,
    `valor_unitario` DECIMAL(15, 4) NOT NULL,
    `valor_total` DECIMAL(15, 2) NOT NULL,

    INDEX `itens_nota_fiscal_fk_nota_fiscal_id_idx`(`fk_nota_fiscal_id`),
    PRIMARY KEY (`PK_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicos_nota_fiscal` (
    `PK_servico_id` BIGINT NOT NULL AUTO_INCREMENT,
    `fk_nota_fiscal_id` CHAR(36) NOT NULL,
    `codigo_servico` VARCHAR(50) NULL,
    `descricao` TEXT NOT NULL,
    `valor_servico` DECIMAL(15, 2) NOT NULL,
    `valor_issqn` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `deducoes` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,

    INDEX `servicos_nota_fiscal_fk_nota_fiscal_id_idx`(`fk_nota_fiscal_id`),
    PRIMARY KEY (`PK_servico_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_fk_perfil_id_fkey` FOREIGN KEY (`fk_perfil_id`) REFERENCES `perfis`(`PK_perfil_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_auditoria` ADD CONSTRAINT `logs_auditoria_fk_usuario_id_fkey` FOREIGN KEY (`fk_usuario_id`) REFERENCES `usuarios`(`PK_usuario_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `importacoes` ADD CONSTRAINT `importacoes_fk_usuario_id_fkey` FOREIGN KEY (`fk_usuario_id`) REFERENCES `usuarios`(`PK_usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notas_fiscais` ADD CONSTRAINT `notas_fiscais_fk_importacao_id_fkey` FOREIGN KEY (`fk_importacao_id`) REFERENCES `importacoes`(`PK_importacao_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_nota_fiscal` ADD CONSTRAINT `itens_nota_fiscal_fk_nota_fiscal_id_fkey` FOREIGN KEY (`fk_nota_fiscal_id`) REFERENCES `notas_fiscais`(`PK_nota_fiscal_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicos_nota_fiscal` ADD CONSTRAINT `servicos_nota_fiscal_fk_nota_fiscal_id_fkey` FOREIGN KEY (`fk_nota_fiscal_id`) REFERENCES `notas_fiscais`(`PK_nota_fiscal_id`) ON DELETE CASCADE ON UPDATE CASCADE;
