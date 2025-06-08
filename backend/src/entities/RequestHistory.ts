import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class RequestHistory {

  @PrimaryKey()
  id!: string;

  // Store the entire request object as JSON
  @Property({ type: 'json' })
  request!: {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body?: string;
    bodyType?: 'json' | 'x-www-form-urlencoded' | 'raw';
    auth: any;  // can use AuthConfig type if you want
    createdAt: Date;
  };

  // Store the entire response object as JSON
  @Property({ type: 'json', nullable: true })
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    duration: number;
    size: number;
  };

  // Top-level timestamp (use this for ordering & querying)
  @Property()
  timestamp: Date = new Date();
}
