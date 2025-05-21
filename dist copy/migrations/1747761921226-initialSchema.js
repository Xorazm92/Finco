"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1747761921226 = void 0;
class InitialSchema1747761921226 {
    constructor() {
        this.name = 'InitialSchema1747761921226';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "deadline" date NOT NULL, "responsible_role" character varying NOT NULL, "detection_method" character varying NOT NULL, CONSTRAINT "PK_324366e10cf40cf2ac60c502a00" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "report_submission" ("id" SERIAL NOT NULL, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, "file_url" character varying, "reportTypeId" integer, "userId" integer, CONSTRAINT "PK_15e5461289e5aec515b74d0e7f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payroll" ("id" SERIAL NOT NULL, "period" character varying NOT NULL, "base_salary" double precision NOT NULL, "kpi_bonus" double precision NOT NULL, "penalty" double precision NOT NULL, "advance" double precision NOT NULL, "total_salary" double precision NOT NULL, "userId" integer, CONSTRAINT "PK_7a76b819506029fc535b6e002e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message_log" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, CONSTRAINT "PK_f89fb3fddab953711137ce8b62c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "kpi_score" ("id" SERIAL NOT NULL, "period" character varying NOT NULL, "response_time_score" double precision NOT NULL, "answer_quality_score" double precision NOT NULL, "attendance_score" double precision NOT NULL, "report_submission_score" double precision NOT NULL, "total_score" double precision NOT NULL, "userId" integer, CONSTRAINT "PK_f3129c6bb4be062a1a15713c3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance_log" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "photo_url" character varying, "userId" integer, CONSTRAINT "PK_c5f15a2267f6b4a7174001ea912" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ai_analysis_result" ("id" SERIAL NOT NULL, "answer_quality_score" double precision, "answer_quality_feedback" text, "supervisor_approved" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "messageId" integer, CONSTRAINT "PK_8553caf90097380815da650faee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "report_submission" ADD CONSTRAINT "FK_d2f77ed35b2695f20e29f3e649c" FOREIGN KEY ("reportTypeId") REFERENCES "report_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_submission" ADD CONSTRAINT "FK_3bc18ca29f44019c4ed169f6844" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payroll" ADD CONSTRAINT "FK_542f3c5e009e4502f7c308f33c7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kpi_score" ADD CONSTRAINT "FK_32da8fd2d0a35f40eddb81cf4f7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_log" ADD CONSTRAINT "FK_e22012e930d96307906528f1bd5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_analysis_result" ADD CONSTRAINT "FK_72b14abe892e7d942b23077c0e0" FOREIGN KEY ("messageId") REFERENCES "message_log"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "ai_analysis_result" DROP CONSTRAINT "FK_72b14abe892e7d942b23077c0e0"`);
        await queryRunner.query(`ALTER TABLE "attendance_log" DROP CONSTRAINT "FK_e22012e930d96307906528f1bd5"`);
        await queryRunner.query(`ALTER TABLE "kpi_score" DROP CONSTRAINT "FK_32da8fd2d0a35f40eddb81cf4f7"`);
        await queryRunner.query(`ALTER TABLE "payroll" DROP CONSTRAINT "FK_542f3c5e009e4502f7c308f33c7"`);
        await queryRunner.query(`ALTER TABLE "report_submission" DROP CONSTRAINT "FK_3bc18ca29f44019c4ed169f6844"`);
        await queryRunner.query(`ALTER TABLE "report_submission" DROP CONSTRAINT "FK_d2f77ed35b2695f20e29f3e649c"`);
        await queryRunner.query(`DROP TABLE "ai_analysis_result"`);
        await queryRunner.query(`DROP TABLE "attendance_log"`);
        await queryRunner.query(`DROP TABLE "kpi_score"`);
        await queryRunner.query(`DROP TABLE "message_log"`);
        await queryRunner.query(`DROP TABLE "payroll"`);
        await queryRunner.query(`DROP TABLE "report_submission"`);
        await queryRunner.query(`DROP TABLE "report_type"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
exports.InitialSchema1747761921226 = InitialSchema1747761921226;
