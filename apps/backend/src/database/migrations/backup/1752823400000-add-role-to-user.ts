import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUser1752823400000 implements MigrationInterface {
    name = 'AddRoleToUser1752823400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // No action needed; role column already exists
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No action needed; role column already exists
    }
}
