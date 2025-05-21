import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1747513342451 implements MigrationInterface {
  name = 'InitialSchema1747513342451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_chat_roles_role_enum" AS ENUM('CLIENT', 'ACCOUNTANT', 'BANK_CLIENT', 'SUPERVISOR', 'ADMIN', 'DIRECTOR', 'OTHER_INTERNAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_chat_roles" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "chat_id" bigint NOT NULL, "role" "public"."user_chat_roles_role_enum" NOT NULL DEFAULT 'CLIENT', "assigned_by" bigint, "assigned_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a09624cf71cbb8cb98937ad15fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'SUPERVISOR', 'CLIENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "telegram_id" bigint NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100), "username" character varying(100) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CLIENT', "password" character varying(255) NOT NULL, "chat_id" bigint NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1a1e4649fd31ea6ec6b025c7bfc" UNIQUE ("telegram_id"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1a1e4649fd31ea6ec6b025c7bf" ON "users" ("telegram_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_chat_roles" ADD CONSTRAINT "FK_ecd301cdea76b1f30007f520569" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_chat_roles" DROP CONSTRAINT "FK_ecd301cdea76b1f30007f520569"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a1e4649fd31ea6ec6b025c7bf"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "user_chat_roles"`);
    await queryRunner.query(`DROP TYPE "public"."user_chat_roles_role_enum"`);
  }
}
