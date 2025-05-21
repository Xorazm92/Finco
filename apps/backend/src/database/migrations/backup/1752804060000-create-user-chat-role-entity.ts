import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUserChatRoleEntity1752804060000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_chat_roles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'chat_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['CLIENT', 'ACCOUNTANT', 'SUPERVISOR', 'ADMIN'],
            default: "'CLIENT'",
          },
          {
            name: 'assigned_by',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'assigned_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'user_chat_roles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_chat_roles');
  }
}
