import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordColumnToUsers1752823700000
  implements MigrationInterface
{
  name = 'AddPasswordColumnToUsers1752823700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "password" varchar(255) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
  }
}
