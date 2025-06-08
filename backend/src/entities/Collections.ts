import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Collection {

  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  // Store requests as a JSON array of HttpRequest objects
  @Property({ type: 'json' })
  requests!: {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body: string;
    bodyType: 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
    auth: {
      type: 'null' | 'bearer' | 'basic' | 'api-key';
      token?: string;
      username?: string;
      password?: string;
      key?: string;
      value?: string;
      addTo?: 'header' | 'query';
    };
    createdAt: Date;
  }[];

  @Property()
  createdAt: Date = new Date();
}
