import { Migration } from '@mikro-orm/migrations';

export class Migration20250608104049 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "request_history" add column "method" varchar(255) not null, add column "url" varchar(255) not null, add column "body" jsonb null, add column "auth" jsonb null, add column "request_body" text null, add column "status_code" int null, add column "status_text" varchar(255) null, add column "response_headers" jsonb null, add column "response_duration" int null, add column "response_size" int null;`);
    this.addSql(`alter table "request_history" alter column "id" type int using ("id"::int);`);
    this.addSql(`create sequence if not exists "request_history_id_seq";`);
    this.addSql(`select setval('request_history_id_seq', (select max("id") from "request_history"));`);
    this.addSql(`alter table "request_history" alter column "id" set default nextval('request_history_id_seq');`);
    this.addSql(`alter table "request_history" rename column "request" to "headers";`);
    this.addSql(`alter table "request_history" rename column "timestamp" to "created_at";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "request_history" drop column "method", drop column "url", drop column "body", drop column "auth", drop column "request_body", drop column "status_code", drop column "status_text", drop column "response_headers", drop column "response_duration", drop column "response_size";`);

    this.addSql(`alter table "request_history" alter column "id" type varchar(255) using ("id"::varchar(255));`);
    this.addSql(`alter table "request_history" alter column "id" drop default;`);
    this.addSql(`alter table "request_history" rename column "headers" to "request";`);
    this.addSql(`alter table "request_history" rename column "created_at" to "timestamp";`);
  }

}
