import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordToUserEntity1747664595573 implements MigrationInterface {
    name = 'AddPasswordToUserEntity1747664595573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_chat_roles" RENAME COLUMN "assigned_by" TO "assigned_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "chat_id"`);
        await queryRunner.query(`ALTER TABLE "user_chat_roles" DROP COLUMN "assigned_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "user_chat_roles" ADD "assigned_by_user_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_chat_roles" DROP COLUMN "assigned_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "user_chat_roles" ADD "assigned_by_user_id" bigint`);
        await queryRunner.query(`ALTER TABLE "users" ADD "chat_id" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'SUPERVISOR', 'CLIENT')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'CLIENT'`);
        await queryRunner.query(`ALTER TABLE "user_chat_roles" RENAME COLUMN "assigned_by_user_id" TO "assigned_by"`);
    }

}
