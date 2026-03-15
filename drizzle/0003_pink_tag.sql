CREATE TABLE `confusionMatrix` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modeloVersaoId` int NOT NULL,
	`perfilRealId` int NOT NULL,
	`perfilPredId` int NOT NULL,
	`quantidade` int NOT NULL DEFAULT 0,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `confusionMatrix_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historicoDesempenho` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modeloVersaoId` int NOT NULL,
	`dataAnalise` timestamp NOT NULL DEFAULT (now()),
	`acuraciaMedia` decimal(5,2) NOT NULL DEFAULT '0',
	`totalAnalises` int NOT NULL DEFAULT 0,
	`acertos` int NOT NULL DEFAULT 0,
	`erros` int NOT NULL DEFAULT 0,
	`tempoMedioProcessamento` int NOT NULL DEFAULT 0,
	`notas` text,
	CONSTRAINT `historicoDesempenho_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metricasPorClasse` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modeloVersaoId` int NOT NULL,
	`perfilId` int NOT NULL,
	`precision` decimal(5,2) NOT NULL DEFAULT '0',
	`recall` decimal(5,2) NOT NULL DEFAULT '0',
	`f1Score` decimal(5,2) NOT NULL DEFAULT '0',
	`suporte` int NOT NULL DEFAULT 0,
	`criadoEm` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metricasPorClasse_id` PRIMARY KEY(`id`)
);
