import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CommonStore } from '../store/CommonStore';

@Injectable()
export class V2_CreateTables extends CommonStore {
  private readonly logger = new Logger(V2_CreateTables.name);

  constructor(@InjectConnection() private connection: Sequelize) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async up(): Promise<void> {

    this.connection.query(`


      CREATE TABLE "public"."documents" (
        "uuid" uuid DEFAULT "public".uuid_generate_v4() NOT NULL,
        "userUuid" uuid ,
        "documentData" bytea NOT NULL,
        "version" integer DEFAULT 1,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "deletedAt" timestamp without time zone
      );
      ALTER TABLE ONLY "public"."documents"
          ADD CONSTRAINT "documents_pk" PRIMARY KEY ("uuid");

      ALTER TABLE ONLY "public"."documents"
        ADD CONSTRAINT "documents_userUuid" FOREIGN KEY ("userUuid") REFERENCES "public"."users" ("uuid") ON DELETE CASCADE;

      CREATE TABLE "public"."images" (
        "uuid" uuid DEFAULT "public".uuid_generate_v4() NOT NULL,
        "userUuid" uuid,
        "imageUrl" text NOT NULL,
        "prompt" text NOT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "deletedAt" timestamp without time zone
    );

      ALTER TABLE ONLY "public"."images"
          ADD CONSTRAINT "images_pk" PRIMARY KEY ("uuid");

      ALTER TABLE ONLY "public"."images"
        ADD CONSTRAINT "images_userUuid" FOREIGN KEY ("userUuid") REFERENCES "public"."users" ("uuid") ON DELETE CASCADE;

      `)
  }
}
