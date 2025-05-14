import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1747203169456 implements MigrationInterface {
  name = 'AutoMigration1747203169456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ACCOUNTANT', 'BANK_CLIENT', 'SUPERVISOR', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "telegram_id" bigint NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100), "username" character varying(100), "role" "public"."users_role_enum" NOT NULL DEFAULT 'BANK_CLIENT', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_1a1e4649fd31ea6ec6b025c7bfc" UNIQUE ("telegram_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1a1e4649fd31ea6ec6b025c7bf" ON "users" ("telegram_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "message_logs" ("id" SERIAL NOT NULL, "telegram_message_id" bigint NOT NULL, "telegram_chat_id" bigint NOT NULL, "sent_at" TIMESTAMP NOT NULL, "text_preview" character varying(255), "is_question_candidate" boolean NOT NULL DEFAULT false, "replied_to_message_id" bigint, "replied_at" TIMESTAMP, "response_time_seconds" integer, "senderUserId" integer, "replyByUserId" integer, CONSTRAINT "PK_f0aae0d876a96fa1da0a1b97444" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "report_types" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_f9bfaf722e6cbd5eb9c6dab6f27" UNIQUE ("code"), CONSTRAINT "PK_cf77ff01fa1da1f9978995e67c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "report_logs" ("id" SERIAL NOT NULL, "telegramChatId" character varying NOT NULL, "submittedAt" TIMESTAMP NOT NULL DEFAULT now(), "fileTelegramId" character varying, "fileName" character varying, "periodStartDate" date, "periodEndDate" date, "deadlineAt" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'PENDING', "reportTypeId" integer, "submittedByUserId" integer, CONSTRAINT "PK_242e8e0f9c2689f09aeaf00e67b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "kpi_scores" ("id" SERIAL NOT NULL, "kpi_metric_code" character varying(100) NOT NULL, "score_value" double precision NOT NULL, "period_start_date" date NOT NULL, "period_end_date" date NOT NULL, "calculated_at" TIMESTAMP NOT NULL, "user_id" integer, CONSTRAINT "PK_a56b4e369d51e69f9f1f54d082b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_logs" ADD CONSTRAINT "FK_ba60f50d1001dabc285226f63f4" FOREIGN KEY ("senderUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_logs" ADD CONSTRAINT "FK_c81e75b842585632efdcf08595e" FOREIGN KEY ("replyByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_logs" ADD CONSTRAINT "FK_d6a39d4c6b97082e7ff69a88417" FOREIGN KEY ("reportTypeId") REFERENCES "report_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_logs" ADD CONSTRAINT "FK_80b3a6aedfdda9a69f654487b95" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "kpi_scores" ADD CONSTRAINT "FK_50c119d2dfd2e816eb41af3aa1e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kpi_scores" DROP CONSTRAINT "FK_50c119d2dfd2e816eb41af3aa1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_logs" DROP CONSTRAINT "FK_80b3a6aedfdda9a69f654487b95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_logs" DROP CONSTRAINT "FK_d6a39d4c6b97082e7ff69a88417"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_logs" DROP CONSTRAINT "FK_c81e75b842585632efdcf08595e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_logs" DROP CONSTRAINT "FK_ba60f50d1001dabc285226f63f4"`,
    );
    await queryRunner.query(`DROP TABLE "kpi_scores"`);
    await queryRunner.query(`DROP TABLE "report_logs"`);
    await queryRunner.query(`DROP TABLE "report_types"`);
    await queryRunner.query(`DROP TABLE "message_logs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a1e4649fd31ea6ec6b025c7bf"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
