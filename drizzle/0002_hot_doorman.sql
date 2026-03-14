CREATE TABLE `analiseHistorico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imagemUri` varchar(500) NOT NULL,
	`perfilReconhecidoId` int,
	`perfilRealId` int,
	`confianca` int NOT NULL,
	`acertou` boolean,
	`tempoProcessamento` int,
	`modeloVersao` varchar(50),
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analiseHistorico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modelFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analiseId` int NOT NULL,
	`perfilReconhecidoId` int,
	`perfilRealId` int NOT NULL,
	`confiancaAnterior` int,
	`correto` boolean NOT NULL,
	`imagemUri` varchar(500),
	`notas` text,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modelFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modeloVersoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versao` varchar(50) NOT NULL,
	`modelUrl` varchar(500) NOT NULL,
	`weightsUrl` varchar(500) NOT NULL,
	`metadataUrl` varchar(500) NOT NULL,
	`acuraciaMedia` decimal(5,2),
	`totalClasses` int,
	`totalImagensTreinamento` int,
	`notas` text,
	`ativa` boolean NOT NULL DEFAULT false,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modeloVersoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `modeloVersoes_versao_unique` UNIQUE(`versao`)
);
--> statement-breakpoint
CREATE TABLE `trainingData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`perfilId` int NOT NULL,
	`imagemUri` varchar(500) NOT NULL,
	`classe` varchar(50) NOT NULL,
	`angulo` varchar(50),
	`iluminacao` varchar(50),
	`qualidade` int,
	`notas` text,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trainingData_id` PRIMARY KEY(`id`)
);
