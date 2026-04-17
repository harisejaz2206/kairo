import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobSourcesTable1776430068855 implements MigrationInterface {
    name = 'CreateJobSourcesTable1776430068855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."job_sources_type_enum" AS ENUM('greenhouse', 'lever', 'company_page', 'manual', 'webhook')`);
        await queryRunner.query(`CREATE TABLE "job_sources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "type" "public"."job_sources_type_enum" NOT NULL, "base_url" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "config_json" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_167139ab1c745b3d020bf71b1dd" UNIQUE ("slug"), CONSTRAINT "PK_7397ca75d3f5e6c4b2756fa3835" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "job_sources"`);
        await queryRunner.query(`DROP TYPE "public"."job_sources_type_enum"`);
    }

}
