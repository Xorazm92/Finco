import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyAndKpiEntities1747732607750 implements MigrationInterface {
    name = 'AddCompanyAndKpiEntities1747732607750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_chat_roles" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "chat_id" bigint NOT NULL, "role" "public"."user_chat_roles_role_enum" NOT NULL DEFAULT 'CLIENT', "assigned_by_user_id" integer, "assigned_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a09624cf71cbb8cb98937ad15fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "inn" character varying NOT NULL, "nds_status" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_b140771a1e25f93216cbf663b0d" UNIQUE ("inn"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_company_assignment" ("id" SERIAL NOT NULL, "role_in_company" character varying NOT NULL, "salary_percentage_from_company" double precision NOT NULL DEFAULT '100', "user_id" integer, "company_id" integer, CONSTRAINT "PK_e01370303e71f6f5b6818b263a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "telegram_id" bigint NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100), "username" character varying(100), "password" character varying(255), "is_active" boolean NOT NULL DEFAULT true, "base_salary" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1a1e4649fd31ea6ec6b025c7bfc" UNIQUE ("telegram_id"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1a1e4649fd31ea6ec6b025c7bf" ON "users" ("telegram_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
        await queryRunner.query(`CREATE TYPE "public"."message_logs_senderroleatmoment_enum" AS ENUM('CLIENT', 'ACCOUNTANT', 'BANK_CLIENT', 'SUPERVISOR', 'ADMIN', 'DIRECTOR', 'OTHER_INTERNAL')`);
        await queryRunner.query(`CREATE TYPE "public"."message_logs_status_enum" AS ENUM('PENDING_ANSWER', 'ANSWERED', 'CLOSED_TIMEOUT', 'CLOSED_BY_SUPERVISOR')`);
        await queryRunner.query(`CREATE TYPE "public"."message_logs_replybyroleatmoment_enum" AS ENUM('CLIENT', 'ACCOUNTANT', 'BANK_CLIENT', 'SUPERVISOR', 'ADMIN', 'DIRECTOR', 'OTHER_INTERNAL')`);
        await queryRunner.query(`CREATE TABLE "message_logs" ("id" SERIAL NOT NULL, "telegram_message_id" bigint NOT NULL, "telegram_chat_id" bigint NOT NULL, "senderRoleAtMoment" "public"."message_logs_senderroleatmoment_enum", "sent_at" TIMESTAMP NOT NULL, "text_preview" character varying(255), "isClientQuestion" boolean NOT NULL DEFAULT false, "status" "public"."message_logs_status_enum" NOT NULL DEFAULT 'PENDING_ANSWER', "questionKeywords" text, "replied_to_message_id" bigint, "replyByRoleAtMoment" "public"."message_logs_replybyroleatmoment_enum", "replied_at" TIMESTAMP, "response_time_seconds" integer, "replyMessageId" bigint, "replyDetectionMethod" character varying, "confidenceScore" double precision, "potentialReplyToMessageId" integer, "senderUserId" integer, "replyByUserId" integer, CONSTRAINT "PK_f0aae0d876a96fa1da0a1b97444" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report_types" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "deadlineMinutes" integer, "responsibleRoles" text, "hashtags" text, CONSTRAINT "UQ_f9bfaf722e6cbd5eb9c6dab6f27" UNIQUE ("code"), CONSTRAINT "PK_cf77ff01fa1da1f9978995e67c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report_logs" ("id" SERIAL NOT NULL, "telegramChatId" character varying NOT NULL, "submittedAt" TIMESTAMP NOT NULL DEFAULT now(), "fileTelegramId" character varying, "fileName" character varying, "periodStartDate" date, "periodEndDate" date, "deadlineAt" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'PENDING', "reportTypeId" integer, "submittedByUserId" integer, CONSTRAINT "PK_242e8e0f9c2689f09aeaf00e67b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "kpi_scores" ("id" SERIAL NOT NULL, "kpi_metric_code" character varying(100) NOT NULL, "score_value" double precision NOT NULL, "period_start_date" date NOT NULL, "period_end_date" date NOT NULL, "calculated_at" TIMESTAMP NOT NULL, "user_id" integer, CONSTRAINT "PK_a56b4e369d51e69f9f1f54d082b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "kpi_definition" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying NOT NULL, "measurement_unit" character varying NOT NULL, "target_value" double precision, "weight_in_overall_kpi" double precision NOT NULL DEFAULT '1', "calculation_logic_type" character varying NOT NULL, CONSTRAINT "UQ_e028ef0d2e74c34ce25d3807322" UNIQUE ("code"), CONSTRAINT "PK_e19d5895a1dd4418d377ad05470" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_chat_roles" ADD CONSTRAINT "FK_ecd301cdea76b1f30007f520569" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_company_assignment" ADD CONSTRAINT "FK_f5a9866f1e91d9af66c09d90ba9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_company_assignment" ADD CONSTRAINT "FK_59bf3315b7ac4d65690b48b3ac2" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_logs" ADD CONSTRAINT "FK_ba60f50d1001dabc285226f63f4" FOREIGN KEY ("senderUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_logs" ADD CONSTRAINT "FK_c81e75b842585632efdcf08595e" FOREIGN KEY ("replyByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_logs" ADD CONSTRAINT "FK_d6a39d4c6b97082e7ff69a88417" FOREIGN KEY ("reportTypeId") REFERENCES "report_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_logs" ADD CONSTRAINT "FK_80b3a6aedfdda9a69f654487b95" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kpi_scores" ADD CONSTRAINT "FK_50c119d2dfd2e816eb41af3aa1e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kpi_scores" DROP CONSTRAINT "FK_50c119d2dfd2e816eb41af3aa1e"`);
        await queryRunner.query(`ALTER TABLE "report_logs" DROP CONSTRAINT "FK_80b3a6aedfdda9a69f654487b95"`);
        await queryRunner.query(`ALTER TABLE "report_logs" DROP CONSTRAINT "FK_d6a39d4c6b97082e7ff69a88417"`);
        await queryRunner.query(`ALTER TABLE "message_logs" DROP CONSTRAINT "FK_c81e75b842585632efdcf08595e"`);
        await queryRunner.query(`ALTER TABLE "message_logs" DROP CONSTRAINT "FK_ba60f50d1001dabc285226f63f4"`);
        await queryRunner.query(`ALTER TABLE "user_company_assignment" DROP CONSTRAINT "FK_59bf3315b7ac4d65690b48b3ac2"`);
        await queryRunner.query(`ALTER TABLE "user_company_assignment" DROP CONSTRAINT "FK_f5a9866f1e91d9af66c09d90ba9"`);
        await queryRunner.query(`ALTER TABLE "user_chat_roles" DROP CONSTRAINT "FK_ecd301cdea76b1f30007f520569"`);
        await queryRunner.query(`DROP TABLE "kpi_definition"`);
        await queryRunner.query(`DROP TABLE "kpi_scores"`);
        await queryRunner.query(`DROP TABLE "report_logs"`);
        await queryRunner.query(`DROP TABLE "report_types"`);
        await queryRunner.query(`DROP TABLE "message_logs"`);
        await queryRunner.query(`DROP TYPE "public"."message_logs_replybyroleatmoment_enum"`);
        await queryRunner.query(`DROP TYPE "public"."message_logs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."message_logs_senderroleatmoment_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a1e4649fd31ea6ec6b025c7bf"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "user_company_assignment"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "user_chat_roles"`);
    }

}
