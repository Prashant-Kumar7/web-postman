import { Migration } from '@mikro-orm/migrations';

export class Migration20250608114816 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "collection" ("id" varchar(255) not null, "name" varchar(255) not null, "requests" jsonb not null, "created_at" timestamptz not null, constraint "collection_pkey" primary key ("id"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "collection" cascade;`);
  }

}
