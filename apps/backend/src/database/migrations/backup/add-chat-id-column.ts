import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatIdToUsers1715784310000 implements MigrationInterface {
  name = 'AddChatIdToUsers1715784310000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "chat_id" bigint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "chat_id"`);
  }
}
