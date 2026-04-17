import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDraftAssetsTable1776430238914 implements MigrationInterface {
    name = 'CreateDraftAssetsTable1776430238914'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."draft_assets_type_enum" AS ENUM('tailored_summary', 'cv_bullets', 'cover_note', 'recruiter_message')`);
        await queryRunner.query(`CREATE TABLE "draft_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "type" "public"."draft_assets_type_enum" NOT NULL, "content" text NOT NULL, "metadata_json" jsonb, "model_name" character varying(100), "version" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_443b09abd11a4d4b0929ab81916" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "draft_assets" ADD CONSTRAINT "FK_268a49b9450058a309af8a18860" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "draft_assets" DROP CONSTRAINT "FK_268a49b9450058a309af8a18860"`);
        await queryRunner.query(`DROP TABLE "draft_assets"`);
        await queryRunner.query(`DROP TYPE "public"."draft_assets_type_enum"`);
    }

}
