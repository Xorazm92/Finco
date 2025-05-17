import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUser1752823400000 implements MigrationInterface {
    name = 'AddRoleToUser1752823400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('ADMIN', 'SUPERVISOR', 'CLIENT')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "user_role_enum" NOT NULL DEFAULT 'CLIENT'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
