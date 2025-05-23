import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRoleEnumToUserChatRole1716387800000 implements MigrationInterface {
    name = 'AddUserRoleEnumToUserChatRole1716387800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole_enum') THEN
                    CREATE TYPE "userrole_enum" AS ENUM ('ADMIN','SUPERVISOR','ACCOUNTANT','BANK_CLIENT_SPECIALIST','CLIENT','AWAITING_APPROVAL');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            ALTER TABLE "user_chat_role" 
            ALTER COLUMN "role" TYPE "userrole_enum" USING role::text::userrole_enum,
            ALTER COLUMN "role" SET DEFAULT 'AWAITING_APPROVAL';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_chat_role" ALTER COLUMN "role" TYPE varchar`);
        await queryRunner.query(`DROP TYPE IF EXISTS "userrole_enum"`);
    }
}
