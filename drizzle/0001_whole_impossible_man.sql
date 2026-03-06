CREATE TABLE `catalogoTecnico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`perfilId` int NOT NULL,
	`pdfOrigem` varchar(500),
	`medidasCompletas` text,
	`desenhoTecnico` varchar(500),
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	`atualizadoEm` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogoTecnico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `localizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`perfilId` int NOT NULL,
	`setor` varchar(10) NOT NULL,
	`prateleira` int NOT NULL,
	`gaveta` int NOT NULL,
	`observacoes` text,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	`atualizadoEm` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `localizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perfis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigoPerfil` varchar(50) NOT NULL,
	`nomePerfil` varchar(100) NOT NULL,
	`linha` varchar(50),
	`alturaMm` decimal(10,2),
	`larguraMm` decimal(10,2),
	`espessuraMm` decimal(10,2),
	`imagemSecao` varchar(500),
	`observacoes` text,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	`atualizadoEm` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `perfis_id` PRIMARY KEY(`id`),
	CONSTRAINT `perfis_codigoPerfil_unique` UNIQUE(`codigoPerfil`)
);
