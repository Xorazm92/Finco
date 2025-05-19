import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupUserSchema2025XXXXXX implements MigrationInterface {
  name = 'CleanupUserSchema2025XXXXXX';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop role, password, chat_id from users
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "password"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "chat_id"`);
    // Make username nullable
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL`);
    // Change assigned_by to assigned_by_user_id in user_chat_roles
    await queryRunner.query(`ALTER TABLE "user_chat_roles" RENAME COLUMN "assigned_by" TO "assigned_by_user_id"`);
    await queryRunner.query(`ALTER TABLE "user_chat_roles" ALTER COLUMN "assigned_by_user_id" TYPE integer USING (assigned_by_user_id::integer)`);
    // Add FK to users.id
    await queryRunner.query(`ALTER TABLE "user_chat_roles" ADD CONSTRAINT "FK_user_chat_roles_assigned_by" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert assigned_by_user_id changes
    await queryRunner.query(`ALTER TABLE "user_chat_roles" DROP CONSTRAINT IF EXISTS "FK_user_chat_roles_assigned_by"`);
    await queryRunner.query(`ALTER TABLE "user_chat_roles" ALTER COLUMN "assigned_by_user_id" TYPE bigint USING (assigned_by_user_id::bigint)`);
    await queryRunner.query(`ALTER TABLE "user_chat_roles" RENAME COLUMN "assigned_by_user_id" TO "assigned_by"`);
    // Re-add columns to users
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "role" varchar(100) DEFAULT 'CLIENT'`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "password" varchar(255)`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "chat_id" bigint DEFAULT 0`);
    // Make username NOT NULL again
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`);
  }
}
